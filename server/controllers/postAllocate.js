const Resource = require('../models/Resource');
const Allocation = require('../models/Allocation');
const Incident = require('../models/Incident');
const User = require('../models/User')
const AlertLog = require('../models/AlertLog')
const { broadcastToJurisdiction } = require('../utils/wsEvents');


const postAllocate = async (req, res) => {
    try {
        const io = req.app.get('io');
        const { resource_id, incident_id } = req.body;
        const resource = await Resource.findById(resource_id);
        const incident = await Incident.findById(incident_id);
        const userId = req.user.id;
        const user = await User.findById(userId);
        const jurisdiction_id = user.jurisdiction_id;
        if (!resource || !incident) {
            return res.status(404).json({ message: "Resource or Incident not found" });
        }

        if (resource.type === 'rescue_team') {
            await Resource.findByIdAndUpdate(resource._id, {
                $inc: { 'rescue_team.available_members': -1 },
                $set: {
                    status: resource.rescue_team.available_members === 1 ? 'deployed' : 'available'
                }
            });
        }

        if (resource.type === 'shelter') {
            await Resource.findByIdAndUpdate(resource._id, {
                $inc: { 'shelter.capacity_remaining': -1 },
                $set: {
                    status: resource.shelter.capacity_remaining === 1 ? 'full' : 'available'
                }
            });
        }

        if (resource.type === 'medical_unit') {
            await Resource.findByIdAndUpdate(resource._id, {
                $inc: { 'medical_unit.available_staff': -1 },
                $set: {
                    status: resource.medical_unit.available_staff === 1 ? 'deployed' : 'available'
                }
            });
        }


        const allocation = new Allocation({
            resource_id,
            incident_id,
            jurisdiction_id,
            allocated_by: userId,
        });


        await allocation.save();

        incident.status = 'allocated';
        incident.allocated_resource_id = resource._id;
        await incident.save();

        const updatedAlert = await AlertLog.findOneAndUpdate(
            { incident_id: incident._id },
            { $set: { status: "allocated", resource_id: resource._id, title: `Unit deployed ${resource.name} - ${resource.type}` } },
            { new: true }
        );

        broadcastToJurisdiction(io, incident.jurisdiction_id.toString(), 'allocation:created', {
            incident_id: incident._id,
            resource_id: resource._id,
            incident_location: incident.location,
            resource_location: resource.location
        })

        return res.status(200).json({ message: "Resource allocated successfully" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = postAllocate;
