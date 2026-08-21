const mongoose = require('mongoose');
const incidentSchema = new mongoose.Schema({
    type: { type: String, enum: ['flood', 'landslide', 'cyclone', 'medical', 'fire'], required: true },
    severity: { type: Number, min: 1, max: 5, required: true },
    description: String,
    photo_url: String,
    reporter_phone: String,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]                       // [lng, lat] — GeoJSON order
    },
    address: String,
    status: { type: String, enum: ['unallocated', 'allocated', 'resolved'], default: 'unallocated' },
    jurisdiction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Jurisdiction' },
    allocated_resource_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }
}, { timestamps: true });

incidentSchema.index({ location: '2dsphere' });  // MongoDB geospatial index

module.exports = mongoose.model('Incident', incidentSchema);