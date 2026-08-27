const Incident = require('../models/Incident');
const Jurisdiction = require('../models/Jurisdiction');
const createAlert = require('../utils/createAlerts');
const sendSms = require('../utils/sendSms');
const severityPrediction = require('../utils/severityPrediction');
const precautions = require('../utils/precautions');
const { broadcastToJurisdiction } = require('../utils/wsEvents');

const postIncident = async (req, res) => {
    try {
        const io = req.app.get('io');
        const { type, severity, location, address, description, photo_url, reporter_phone } = req.body;
        console.log("Posting new incident report:", { type, severity, address, reporter_phone });

        let finalSeverity = severity;
        if (finalSeverity == null || finalSeverity === '') {
            try {
                // 3.5 second timeout guard for AI severity prediction
                const predictionPromise = severityPrediction(req);
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Severity prediction timeout")), 3500)
                );
                finalSeverity = await Promise.race([predictionPromise, timeoutPromise]);
            } catch (predErr) {
                console.error("Severity prediction error or timeout, defaulting to 3:", predErr.message);
                finalSeverity = 3;
            }
        }
        finalSeverity = Number(finalSeverity) || 3;

        let jurisdiction_id = null;

        // Find jurisdiction bounding box
        if (location && location.coordinates && location.coordinates.length === 2) {
            const [lng, lat] = location.coordinates;
            try {
                const jurisdiction = await Jurisdiction.findOne({
                    "bounds.south": { $lte: lat },
                    "bounds.north": { $gte: lat },
                    "bounds.west": { $lte: lng },
                    "bounds.east": { $gte: lng }
                });
                if (jurisdiction) {
                    jurisdiction_id = jurisdiction._id;
                }
            } catch (jErr) {
                console.warn("Jurisdiction lookup warning:", jErr.message);
            }
        }

        const incident = new Incident({
            type,
            severity: finalSeverity,
            location,
            address,
            description,
            photo_url,
            reporter_phone,
            jurisdiction_id
        });

        await incident.save();

        // Call precautions utility to generate precautions & estimated response time
        let precautionsData = null;
        try {
            precautionsData = await precautions({
                incident: incident,
                description: incident.description,
                type: incident.type,
                reportedTime: incident.createdAt || new Date().toISOString()
            });
        } catch (pErr) {
            console.warn("Precautions generation error in postIncident:", pErr.message);
        }

        // WebSocket broadcast
        try {
            if (jurisdiction_id) {
                broadcastToJurisdiction(io, jurisdiction_id.toString(), 'incident:new', incident);
            }
            if (io) {
                io.emit('incident:new', incident);
            }
        } catch (wsErr) {
            console.warn("WebSocket broadcast warning:", wsErr.message);
        }

        // Non-blocking SMS dispatch
        if (incident.reporter_phone) {
            sendSms(
                incident.reporter_phone,
                `ResQNet: Report received. Incident ID: ${incident._id}. Help is on the way.`
            ).catch(smsErr => console.error("Non-blocking SMS error:", smsErr.message));
        }

        // Non-blocking alert log creation
        if (finalSeverity >= 4) {
            try {
                createAlert(io, {
                    type: type,
                    title: `New ${type} incident reported`,
                    message: `${type} incident reported at ${address}`,
                    severity: finalSeverity,
                    jurisdiction_id: jurisdiction_id,
                    incident_id: incident._id,
                    resource_id: null
                }).catch(aErr => console.error("Non-blocking Alert creation error:", aErr.message));
            } catch (alertErr) {
                console.error("Alert trigger error:", alertErr.message);
            }
        }

        return res.status(200).json({
            message: "Incident posted successfully",
            incident,
            precautions: precautionsData?.precautions || [],
            suggestions: precautionsData?.suggestions || [],
            estResponseTime: precautionsData?.estResponseTime || 12.5,
            historicalStats: precautionsData?.historicalStats || null,
            aiProvider: precautionsData?.aiProvider || 'Gemini'
        });
    }
    catch (err) {
        console.error("Post incident controller error:", err);
        return res.status(500).json({ message: "Server error posting incident" });
    }
};

module.exports = postIncident;
