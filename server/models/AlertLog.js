const mongoose = require('mongoose');
const Jurisdiction = require('./Jurisdiction');
const Incident = require('./Incident');
const Resource = require('./Resource');
const alertLogSchema = new mongoose.Schema({
    type: { type: String, enum: ['breach', 'resource_warning', 'unit_deployed', 'system_update', 'imd'] },
    title: { type: String, required: true },
    message: String,
    severity: { type: String, enum: ['critical', 'warning', 'info'], default: 'info' },
    jurisdiction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Jurisdiction' },
    incident_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
    resource_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('AlertLog', alertLogSchema);