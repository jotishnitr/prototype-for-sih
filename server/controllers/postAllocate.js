const Resource = require('../models/Resource');
const Allocation = require('../models/Allocation');
const Incident = require('../models/Incident');
const User = require('../models/User')
const postAllocate = async (req, res) => {
    try {
        const { resource_id, incident_id, allocated_by } = req.body;
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

        return res.status(200).json({ message: "Resource allocated successfully" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = postAllocate;
