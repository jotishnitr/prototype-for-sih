const mongoose = require('mongoose');
const imdAlertSchema = new mongoose.Schema({
    title: String,
    description: String,
    district: String,
    state: { type: String, default: 'Odisha' },
    alert_type: { type: String, enum: ['cyclone', 'flood', 'landslide', 'heatwave', 'storm'] },
    severity: { type: String, enum: ['red', 'orange', 'yellow', 'green'] },
    valid_from: Date,
    valid_until: Date,
    raw_xml: String
}, { timestamps: true });

module.exports = mongoose.model('ImdAlert', imdAlertSchema);