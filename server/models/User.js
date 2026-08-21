const mongoose = require('mongoose');
const Jurisdiction = require('../models/Jurisdiction');
const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },   // bcrypt
    role: { type: String, enum: ['admin', 'operator', 'viewer'], default: 'operator' },
    org: String,                                  // "NDRF Battalion 4"
    jurisdiction_id: { type: mongoose.Schema.Types.ObjectId, ref: Jurisdiction },
    refreshToken: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);