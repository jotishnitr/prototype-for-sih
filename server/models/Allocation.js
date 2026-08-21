const mongoose = require('mongoose');
const Incident = require('../models/Incident')
const Resource = require('../models/Resource')
const User = require('../models/User')
const allocationSchema = new mongoose.Schema({
    incident_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incident',
        required: true
    },
    resource_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true
    },
    allocated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active'
    },
    resolved_at: Date,
    notes: String
}, { timestamps: true });

module.exports = mongoose.model('Allocation', allocationSchema);