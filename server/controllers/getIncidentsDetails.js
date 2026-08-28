const Incident = require('../models/Incident');
const User = require('../models/User');
const Resource = require('../models/Resource');

const getIncidentDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findOne({ _id: userId });
        if (!user) return res.status(401).json({ message: 'User does not exist' });

        const jurisdictionId = user.jurisdiction_id;

        const query = (user.role === 'admin') ? {} : { jurisdiction_id: jurisdictionId };

        // Fetch plain JS objects using .lean() so we can add new properties directly
        const incidents = await Incident.find(query).lean();
        const resources = await Resource.find(query).lean();

        // Map resources by ID for O(1) lookups
        const resourcesMap = new Map();
        resources.forEach((resource) => {
            resourcesMap.set(resource._id.toString(), resource);
        });

        // Insert resource details into each incident
        incidents.forEach((incident) => {
            if (incident.allocated_resource_id) {
                const resource = resourcesMap.get(incident.allocated_resource_id.toString());
                if (resource) {
                    incident.resource_name = resource.name;
                    incident.resource_id = resource._id;
                    incident.resource_type = resource.type;
                    incident.resource_location = resource.location;
                    incident.resource_status = resource.status;
                    incident.resource_contact = resource.contact_phone;

                    // Include capacity details only if the resource is a shelter
                    if (resource.type === 'shelter' && resource.shelter) {
                        incident.resource_capacity_total = resource.shelter.capacity_total;
                        incident.resource_capacity_remaining = resource.shelter.capacity_remaining;
                    }
                }
            }
        });

        return res.status(200).json({ incidents });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = getIncidentDetails;
