const Incident = require('../models/Incident');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Allocation = require('../models/Allocation')

const getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findOne({ _id: userId });
        if (!user) return res.status(401).json({ message: 'User does not exist' });
        const jurisdictionId = user.jurisdiction_id;
        if (!jurisdictionId) {
            return res.status(403).json({ message: 'No jurisdiction assigned to user' });
        }

        // Calculating no. of active incidents (incidents that are not resolved)
        const incidents = await Incident.find({ jurisdiction_id: jurisdictionId });
        const activeIncidents = incidents.filter((incident) => incident.status !== 'resolved').length;

        // calculating no. of units dispatched
        const resources = await Resource.find({ jurisdiction_id: jurisdictionId });
        const unitsDispatched = resources.filter((resource) => resource.status === 'deployed').length;

        // calculating shelter capacity
        const shelters = await Resource.find({ jurisdiction_id: jurisdictionId, type: 'shelter' });
        let totalCapacity = 0;
        let remainingCapacity = 0;
        shelters.forEach((shelter) => {
            if (shelter.shelter) {
                totalCapacity += shelter.shelter.capacity_total || 0;
                remainingCapacity += shelter.shelter.capacity_remaining || 0;
            }
        })
        const shelterCapacity = totalCapacity - remainingCapacity;

        // calculating estResponse ( T.C - O(2n) )
        const userIncidents = await Incident.find({ jurisdiction_id: jurisdictionId })
        const userAllocations = await Allocation.find({ jurisdiction_id: jurisdictionId })

        // Build a lookup map for allocation creation times: incident_id -> createdAt
        const allocationMap = new Map();
        userAllocations.forEach(alloc => {
            if (alloc.incident_id) {
                allocationMap.set(alloc.incident_id.toString(), alloc.createdAt);
            }
        });

        let estResponse = 0;
        userIncidents.forEach(incident => {
            const allocTime = allocationMap.get(incident._id.toString());
            if (allocTime) {
                // Allocation time (later) - Incident creation time (earlier)
                estResponse += (allocTime - incident.createdAt);
            }
        });
        const avgResponse = userIncidents.length > 0
            ? (estResponse / allocationMap.size) / 60000
            : 0;

        // return avgResponse not estResponse

        return res.status(200).json({
            activeIncidents,
            unitsDispatched,
            resources,
            shelterCapacity,
            avgResponse
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = getStats;