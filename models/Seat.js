const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    trainId: { type: String, required: true, index: true },
    seatNumber: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['AVAILABLE', 'LOCKED', 'BOOKED'], 
        default: 'AVAILABLE' 
    },
    lockedByUserId: { type: String, default: null },
    lockedUntil: { type: Date, default: null } 
});

// Compound index to ensure a seat number is unique per train
seatSchema.index({ trainId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);