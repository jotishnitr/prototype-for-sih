const mongoose = require('mongoose');
const smsLogSchema = new mongoose.Schema({
    phone: String,
    direction: { type: String, enum: ['inbound', 'outbound'] },
    message: String,
    incident_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
    status: { type: String, enum: ['sent', 'failed', 'received'] },
    provider: { type: String, default: 'fast2sms' }
}, { timestamps: true });

module.exports = mongoose.model('SmsLog', smsLogSchema);