const Resource = require('../models/Resource');
const User = require('../models/User');

const getResources = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: 'User does not exist' });
        }

        const jurisdictionId = user.jurisdiction_id;
        const resources = await Resource.find({ jurisdiction_id: jurisdictionId }).lean();

        return res.status(200).json({ resources });
    } catch (error) {
        console.error("Error in getResources:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = getResources;
