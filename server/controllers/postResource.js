const Resource = require('../models/Resource');
const { broadcastToJurisdiction } = require('../utils/wsEvents');
const postResource = async (req, res) => {
    try {
        const io = req.app.get('io');
        const {
            name,
            type,
            status,
            location,
            address,
            contact_phone,
            jurisdiction_id,
            shelter,
            rescue_team,
            medical_unit,
            supply_depot
        } = req.body;

        const resource = new Resource({
            name,
            type,
            status,
            location,
            address,
            contact_phone,
            jurisdiction_id,
            shelter,
            rescue_team,
            medical_unit,
            supply_depot
        });

        await resource.save();

        broadcastToJurisdiction(io, jurisdiction_id.toString(), 'resource:new', resource);

        return res.status(201).json({ message: "Resource created successfully", resource });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = postResource;
