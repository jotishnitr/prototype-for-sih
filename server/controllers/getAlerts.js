const AlertLog = require('../models/AlertLog');
const User = require('../models/User');
const Jurisdiction = require('../models/Jurisdiction');
const Incident = require('../models/Incident');
const Resource = require('../models/Resource');

const getAlerts = async (req, res) => {
    try {
        const user_id = req.user?.id || req.body?.user_id;

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const jurisdiction = await Jurisdiction.findById(user.jurisdiction_id);
        if (!jurisdiction) {
            return res.status(404).json({ message: "Jurisdiction not found" });
        }
        const alerts = await AlertLog.find({
            jurisdiction_id: user.jurisdiction_id
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        const incidents = await Incident.find({ jurisdiction_id: jurisdiction._id });
        const resources = await Resource.find({ jurisdiction_id: jurisdiction._id });

        const incidentMap = new Map();
        incidents.forEach(incident => {
            incidentMap.set(incident._id.toString(), incident);
        });
        const resourceMap = new Map();
        resources.forEach(resource => {
            resourceMap.set(resource._id.toString(), resource);
        });
        alerts.forEach((alert) => {
            if (alert.incident_id) {
                const incident = incidentMap.get(alert.incident_id.toString());
                if (incident) {
                    alert.incident_name = incident.title;
                    alert.incident_contact = incident.reporter_phone;
                    alert.incident_description = incident.description;
                    alert.incident_location = incident.location;
                }
            }
            if (alert.resource_id) {
                const resource = resourceMap.get(alert.resource_id.toString());
                if (resource) {
                    alert.resource_name = resource.name;
                    alert.resource_contact = resource.contact_phone;
                }
            }
        });
        return res.status(200).json({ alerts });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = getAlerts;