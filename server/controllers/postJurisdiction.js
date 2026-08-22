const Jurisdiction = require('../models/Jurisdiction');

const postJurisdiction = async (req, res) => {
    try {
        const { name, code, state, district, bounds } = req.body;
        const jurisdiction = new Jurisdiction({ name, code, state, district, bounds });
        await jurisdiction.save();
        return res.status(201).json({ message: "Jurisdiction created", jurisdiction });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = postJurisdiction;