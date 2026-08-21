const mongoose = require('mongoose');
const Jurisdiction = require('./Jurisdiction');
const resourceSchema = new mongoose.Schema({
    name: { type: String, required: true },       // "Rescue Team Alpha"
    type: { type: String, enum: ['rescue_team', 'shelter', 'supply_depot', 'medical_unit'], required: true },
    status: { type: String, enum: ['available', 'deployed', 'full', 'offline'], default: 'available' },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]                       // [lng, lat]
    },
    address: String,
    capacity_total: { type: Number, default: 0 },
    capacity_remaining: { type: Number, default: 0 },
    contact_phone: String,
    jurisdiction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Jurisdiction' }
}, { timestamps: true });

resourceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Resource', resourceSchema);