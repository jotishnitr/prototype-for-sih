const Incident = require('../models/Incident');
const User = require('../models/User');
const Resource = require('../models/Resource');
const AlertLog = require('../models/AlertLog');
const { broadcastToJurisdiction } = require('../utils/wsEvents');

const updateIncidentStatus = async (req, res) => {
    try {
        const io = req.app.get('io');
        const incidentId = req.params.id;
        const status = req.body.status;
        const incident = await Incident.findById(incidentId);
        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }
        if (incident.status === 'resolved') {
            return res.status(400).json({ message: "Incident is already resolved" });
        }
        incident.status = status;
        
        let resource = null;
        if (status === 'resolved' && incident.allocated_resource_id) {
            resource = await Resource.findById(incident.allocated_resource_id);
            if (resource) {
                resource.status = 'available';
                if (resource.type === 'rescue_team') {
                    resource.rescue_team.available_members += 1;
                } else if (resource.type === 'medical_unit') {
                    resource.medical_unit.available_staff += 1;
                } else if (resource.type === 'shelter') {
                    resource.shelter.capacity_remaining += 1;
                }
                await resource.save();
            }
        }
        await incident.save();

        const updatedAlert = await AlertLog.findOneAndUpdate(
            { incident_id: incident._id },
            { $set: { status: status, title: `Incident ${status}` } },
            { new: true }
        );
        if (updatedAlert) {
            broadcastToJurisdiction(io, incident.jurisdiction_id.toString(), 'alert:new', updatedAlert);
        }
        return res.status(200).json({ message: "Incident status updated successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = updateIncidentStatus;