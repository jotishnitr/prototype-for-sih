const Resource = require('../models/Resource');
const Incident = require('../models/Incident');
const Allocation = require('../models/Allocation');
const User = require('../models/User');
const AlertLog = require('../models/AlertLog');
const { broadcastToJurisdiction } = require('../utils/wsEvents');
const autoAllocate = async (req, res) => {
    try {
        const io = req.app.get('io');
        const userId = req.user.id;
        const incidentId = req.params.id;
        const user = await User.findById(userId);
        const jurisdiction_id = user.jurisdiction_id;
        const incident = await Incident.findById(incidentId);
        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        const resource = await Resource.findOne({
            jurisdiction_id: jurisdiction_id,
            status: 'available',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: incident.location.coordinates
                    },
                    $maxDistance: 50000  // 50km
                }
            }
        });

        if (!resource) {
            return res.status(404).json({ message: "No available resources found" });
        }

        const allocation = new Allocation({
            incident_id: incidentId,
            resource_id: resource._id,
            allocated_by: userId,
            jurisdiction_id: jurisdiction_id,
            status: 'active'
        });
        await allocation.save();

        if (resource.type === 'rescue_team') {
            await Resource.findByIdAndUpdate(resource._id, {
                $inc: { 'rescue_team.available_members': -1 },
                $set: {
                    status: resource.rescue_team.available_members === 1 ? 'deployed' : 'available'
                }
            })
        }
        if (resource.type === 'medical_unit') {
            await Resource.findByIdAndUpdate(resource._id, {
                $inc: { 'medical_unit.available_staff': -1 },
                $set: {
                    status: resource.medical_unit.available_staff === 1 ? 'deployed' : 'available'
                }
            })
        }
        if (resource.type === 'shelter') {
            await Resource.findByIdAndUpdate(resource._id, {
                $inc: { 'shelter.capacity_remaining': -1 },
                $set: {
                    status: resource.shelter.capacity_remaining === 1 ? 'full' : 'available'
                }
            })
        }

        incident.status = 'allocated';
        incident.allocated_resource_id = resource._id;
        await incident.save();

        const updatedAlert = await AlertLog.findOneAndUpdate(
            { incident_id: incident._id },
            { $set: { status: "allocated", resource_id: resource._id, title: `Unit deployed ${resource.name} - ${resource.type}` } },
            { new: true }
        );

        broadcastToJurisdiction(io, jurisdiction_id.toString(), 'allocation:created', {
            incident_id: incident._id,
            resource_id: resource._id,
            incident_location: incident.location,
            resource_location: resource.location
        })
        broadcastToJurisdiction(io, jurisdiction_id.toString(), 'alert:new', updatedAlert)
        return res.status(200).json({ message: "Resource allocated successfully" });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = autoAllocate;