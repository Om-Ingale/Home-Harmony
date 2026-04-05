const mongoose = require("mongoose");

const otpTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        // TTL index — MongoDB auto-deletes document when expiresAt is reached
        index: { expires: 0 },
    },
});

module.exports = mongoose.model("OtpToken", otpTokenSchema);