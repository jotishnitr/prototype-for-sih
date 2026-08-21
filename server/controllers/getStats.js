const Incident = require('../models/Incident');
const Resource = require('../models/Resource');
const User = require('../models/User');

const getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = User.findOne({ _id: userId });
        if (!user) return res.status(401).json({ message: 'User does not exist' });
        const jurisdictionId = user.jurisdiction_id;

        // Calculating no.of active incidents
        const incidents = await Incident.find({ jurisdiction_id: jurisdictionId });
        const activeIncidents = incidents.filter((incident) => incident.status === 'active').length;

        // calculating no.of units dispatched
        const resources = await Resource.find({ jurisdiction_id: jurisdictionId });
        const unitsDispatched = resources.filter((resource) => resource.status === 'deployed').length;

        //calculating shelter capacity
        const shelters = await Resource.find({ jurisdiction_id: jurisdictionId, type: 'shelter' });
        let totalCapacity = 0;
        let remainingCapacity = 0;
        shelters.forEach((shelter) => {
            totalCapacity += shelter.capacity_total;
            remainingCapacity += shelter.capacity_remaining;
        })
        const shelterCapacity = totalCapacity - remainingCapacity;

        return res.status(200).json({
            activeIncidents,
            unitsDispatched,
            shelterCapacity
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = getStats;