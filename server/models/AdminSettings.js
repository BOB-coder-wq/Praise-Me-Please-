const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
    adminPassword: {
        type: String,
        required: true,
        default: 'admin123'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lastLoginAttempt: {
        type: Date
    },
    lockoutUntil: {
        type: Date
    }
});

// Static method to get or create admin settings
adminSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
