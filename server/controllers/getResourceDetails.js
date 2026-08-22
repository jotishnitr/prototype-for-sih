const Resource = require('../models/Resource');

const getResourceDetails = async (req, res) => {
    try {
        const { resource_id } = req.body;
        const resource = await Resource.findById(resource_id);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }
        return res.status(200).json(resource);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = getResourceDetails;