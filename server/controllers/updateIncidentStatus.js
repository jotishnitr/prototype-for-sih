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
                if (resource.type === 'rescue_team' && resource.rescue_team) {
                    resource.rescue_team.available_members = resource.rescue_team.total_members || 0;
                    resource.rescue_team.available_boats = resource.rescue_team.total_boats || 0;
                    resource.rescue_team.available_vehicles = resource.rescue_team.total_vehicles || 0;
                } else if (resource.type === 'medical_unit' && resource.medical_unit) {
                    resource.medical_unit.available_staff = resource.medical_unit.total_staff || 0;
                    resource.medical_unit.available_ambulances = resource.medical_unit.total_ambulances || 0;
                    resource.medical_unit.available_beds = resource.medical_unit.total_beds || 0;
                } else if (resource.type === 'shelter' && resource.shelter) {
                    resource.shelter.capacity_remaining = resource.shelter.capacity_total || 0;
                }
                await resource.save();
            }
        }
        await incident.save();

        if (resource) {
            broadcastToJurisdiction(io, incident.jurisdiction_id.toString(), 'resource:updated', resource);
            io.emit('resource:updated', resource);
        }

        const updatedAlert = await AlertLog.findOneAndUpdate(
            { incident_id: incident._id },
            { $set: { status: status, title: `Incident ${status}` } },
            { new: true }
        );
        if (updatedAlert) {
            broadcastToJurisdiction(io, incident.jurisdiction_id.toString(), 'alert:new', updatedAlert);
        }
        broadcastToJurisdiction(io, incident.jurisdiction_id.toString(), 'incident:updated', incident);
        io.emit('incident:updated', incident);
        return res.status(200).json({ message: "Incident status updated successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = updateIncidentStatus;