const Incident = require('../models/Incident');
const Jurisdiction = require('../models/Jurisdiction');
const createAlert = require('../utils/createAlert');
const AlertLog = require('../models/AlertLog');
const { broadcastToJurisdiction } = require('../utils/wsEvents');
const postIncident = async (req, res) => {
    try {
        const io = req.app.get('io');
        const { type, severity, location, address, description, photo_url, reporter_phone } = req.body;

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
            severity,
            location,
            address,
            description,
            photo_url,
            reporter_phone,
            jurisdiction_id
        });

        await incident.save();
        const alert = null;
        if (severity >= 4) {
            alert = await createAlert({
                type: type,
                title: `New ${type} incident reported`,
                message: `${type} incident reported at ${address}`,
                severity: severity,
                jurisdiction_id: jurisdiction_id,
                incident_id: incident._id,
                resource_id: null
            });

            const alertLog = AlertLog.create({
                _id: alert._id,
                type: alert.type,
                title: alert.title,
                message: alert.message,
                severity: alert.severity,
                jurisdiction_id: alert.jurisdiction_id,
                incident_id: alert.incident_id,
                resource_id: alert.resource_id,
            })
            await alertLog.save();
            broadcastToJurisdiction(io, jurisdiction_id.toString(), 'alert:new', { alert, incident });
        }

        return res.status(200).json({ message: "Incident posted successfully", incident });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = postIncident;
