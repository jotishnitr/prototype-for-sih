const mongoose = require('mongoose');
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
    jurisdiction_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jurisdiction'
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