const mongoose = require('mongoose');
const resourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['rescue_team', 'shelter', 'supply_depot', 'medical_unit'],
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'deployed', 'full', 'offline'],
        default: 'available'
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    address: String,
    contact_phone: String,
    jurisdiction_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jurisdiction'
    },

    // SHELTER specific
    shelter: {
        capacity_total: { type: Number, default: 0 },      // max people
        capacity_remaining: { type: Number, default: 0 },  // empty slots
    },

    // RESCUE TEAM specific
    rescue_team: {
        total_members: { type: Number, default: 0 },       // full team strength
        available_members: { type: Number, default: 0 },   // not deployed
        total_boats: { type: Number, default: 0 },
        available_boats: { type: Number, default: 0 },
        total_vehicles: { type: Number, default: 0 },
        available_vehicles: { type: Number, default: 0 },
    },

    // MEDICAL UNIT specific
    medical_unit: {
        total_staff: { type: Number, default: 0 },
        available_staff: { type: Number, default: 0 },
        total_ambulances: { type: Number, default: 0 },
        available_ambulances: { type: Number, default: 0 },
        total_beds: { type: Number, default: 0 },
        available_beds: { type: Number, default: 0 },
    },

    // SUPPLY DEPOT specific
    supply_depot: {
        total_food_packets: { type: Number, default: 0 },
        available_food_packets: { type: Number, default: 0 },
        total_water_litres: { type: Number, default: 0 },
        available_water_litres: { type: Number, default: 0 },
        total_medicine_kits: { type: Number, default: 0 },
        available_medicine_kits: { type: Number, default: 0 },
        total_blankets: { type: Number, default: 0 },
        available_blankets: { type: Number, default: 0 },
    },

}, { timestamps: true });

resourceSchema.index({ location: '2dsphere' });