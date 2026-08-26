const Resource = require('../models/Resource');
const User = require('../models/User');
const Jurisdiction = require('../models/Jurisdiction');
const Allocation = require('../models/Allocation');
const { broadcastToJurisdiction } = require('../utils/wsEvents');

const deleteResources = async (req, res) => {
    const io = req.app.get('io');
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const jurisdictionId = user.jurisdiction_id;
    const jurisdiction = await Jurisdiction.findById(jurisdictionId);
    if (!jurisdiction) {
        return res.status(404).json({ message: "Jurisdiction not found" });
    }
    const { resource_id } = req.body;
    if (!resource_id) {
        return res.status(400).json({ message: "Resource ID is required" });
    }
    const resource = await Resource.findById(resource_id);
    if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
    }
    if (resource.jurisdiction_id.toString() !== jurisdictionId.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
    }
    await Resource.findByIdAndDelete(resource_id);
    await Allocation.deleteMany({ resource_id: resource_id });

    if (io && jurisdictionId) {
        broadcastToJurisdiction(io, jurisdictionId.toString(), 'resource:deleted', { resource_id });
        io.emit('resource:deleted', { resource_id });
    }

    return res.status(200).json({ message: "Resource deleted successfully" });
}
module.exports = deleteResources;