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
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600, // TTL — MongoDB auto-deletes after 600 seconds (10 mins)
    },
});

module.exports = mongoose.model("OtpToken", otpTokenSchema);