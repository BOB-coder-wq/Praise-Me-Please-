const mongoose = require('mongoose');

const praiseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    level: {
        type: String,
        required: true,
        enum: ['Basic', 'Premium', 'Elite']
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    emoji: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String,
        required: false
    },
    userAgent: {
        type: String,
        required: false
    }
});

// Index for better query performance
praiseSchema.index({ timestamp: -1 });
praiseSchema.index({ level: 1 });
praiseSchema.index({ amount: 1 });

module.exports = mongoose.model('Praise', praiseSchema);
