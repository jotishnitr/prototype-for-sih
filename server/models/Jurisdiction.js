const mongoose = require('mongoose');

const jurisdictionSchema = new mongoose.Schema({
  name: { type: String, required: true },       // "Odisha - District Puri"
  code: { type: String, required: true },       // "OD-PURI"
  state: String,
  district: String,
  bounds: {                                     // bounding box for map
    north: Number, south: Number,
    east: Number,  west: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Jurisdiction', jurisdictionSchema);
