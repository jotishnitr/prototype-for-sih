const Incident = require('../models/Incident');
const Jurisdiction = require('../models/Jurisdiction');
const createAlert = require('../utils/createAlerts');
const AlertLog = require('../models/AlertLog');
const sendSms = require('../utils/sendSms');
const severityPrediction = require('../utils/severityPrediction');

const { broadcastToJurisdiction } = require('../utils/wsEvents');
const postIncident = async (req, res) => {
    try {
        const io = req.app.get('io');
        const { type, severity, location, address, description, photo_url, reporter_phone } = req.body;
        console.log(req.body);

        let finalSeverity = severity;
        if (finalSeverity == null || finalSeverity === '') {
            try {
                finalSeverity = await severityPrediction(req);
            } catch (predErr) {
                console.error("Severity prediction error, defaulting to 3:", predErr);
                finalSeverity = 3;
            }
        }
        finalSeverity = Number(finalSeverity) || 3;

        let jurisdiction_id = null;

        // Find the jurisdiction where the coordinate [lng, lat] falls inside the bounding box
        if (location && location.coordinates && location.coordinates.length === 2) {
            const [lng, lat] = location.coordinates;
            const jurisdiction = await Jurisdiction.findOne({
                "bounds.south": { $lte: lat },
                "bounds.north": { $gte: lat },
                "bounds.west": { $lte: lng },
                "bounds.east": { $gte: lng }
            });
            if (jurisdiction) {
                jurisdiction_id = jurisdiction._id;
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
        let alert = null;
        if (incident.reporter_phone) {
            await sendSms(
                incident.reporter_phone,
                `ResQNet: Report received. Incident ID: ${incident._id}. Help is on the way.`
            );
        }
        if (finalSeverity >= 4) {
            alert = await createAlert(io, {
                type: type,
                title: `New ${type} incident reported`,
                message: `${type} incident reported at ${address}`,
                severity: finalSeverity,
                jurisdiction_id: jurisdiction_id,
                incident_id: incident._id,
                resource_id: null
            });
        }

        return res.status(200).json({ message: "Incident posted successfully", incident });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = postIncident;
