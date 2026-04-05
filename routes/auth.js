// routes/auth.js

const express = require("express");
const passport = require("passport");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require("../middleware");
const authController = require("../controllers/authController");
const OtpToken = require("../models/OtpToken");
const crypto = require("crypto");
const { sendOtpEmail } = require("../utils/mailer");
const User = require("../models/User");

// ── Register ──────────────────────────────────
router
  .route("/register")
  .get(authController.renderRegister)
  .post(catchAsync(authController.register));

// ── Login ─────────────────────────────────────
router
  .route("/login")
  .get(authController.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/auth/login",
    }),
    authController.login
  );

// ── Logout ────────────────────────────────────
router.post("/logout", authController.logout);

// ── GET /auth/forgot-password ─────────────────────────────────────────────────
router.get("/forgot-password", (req, res) => {
  res.render("auth/forgot-password", { title: "Forgot Password — Home Harmony" });
});

// ── POST /auth/forgot-password ────────────────────────────────────────────────
router.post("/forgot-password", catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Always show success (don't reveal if email exists)
  if (!user) {
    req.flash("success", "If that email exists, an OTP has been sent.");
    return res.redirect("/auth/forgot-password");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Delete any existing OTP for this email
  await OtpToken.deleteMany({ email: email.toLowerCase() });

  // Save new OTP (expires in 10 mins)
  await OtpToken.create({
    email: email.toLowerCase(),
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendOtpEmail(email, otp);

  req.flash("success", "OTP sent to your email! Check your inbox.");
  // Pass email via session for next step
  req.session.resetEmail = email.toLowerCase();
  res.redirect("/auth/verify-otp");
}));

// ── GET /auth/verify-otp ──────────────────────────────────────────────────────
router.get("/verify-otp", (req, res) => {
  if (!req.session.resetEmail) return res.redirect("/auth/forgot-password");
  res.render("auth/verify-otp", {
    title: "Verify OTP — Home Harmony",
    email: req.session.resetEmail,
  });
});

// ── POST /auth/verify-otp ─────────────────────────────────────────────────────
router.post("/verify-otp", catchAsync(async (req, res) => {
  const { otp } = req.body;
  const email = req.session.resetEmail;
  if (!email) return res.redirect("/auth/forgot-password");

  const token = await OtpToken.findOne({ email });

  if (!token || token.otp !== otp || token.expiresAt < new Date()) {
    req.flash("error", "Invalid or expired OTP. Please try again.");
    return res.redirect("/auth/verify-otp");
  }

  // OTP valid — allow reset
  req.session.otpVerified = true;
  await OtpToken.deleteMany({ email });
  res.redirect("/auth/reset-password");
}));

// ── GET /auth/reset-password ──────────────────────────────────────────────────
router.get("/reset-password", (req, res) => {
  if (!req.session.resetEmail || !req.session.otpVerified) {
    return res.redirect("/auth/forgot-password");
  }
  res.render("auth/reset-password", { title: "Reset Password — Home Harmony" });
});

// ── POST /auth/reset-password ─────────────────────────────────────────────────
router.post("/reset-password", catchAsync(async (req, res) => {
  const { password, confirmPassword } = req.body;
  const email = req.session.resetEmail;

  if (!email || !req.session.otpVerified) {
    return res.redirect("/auth/forgot-password");
  }
  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match.");
    return res.redirect("/auth/reset-password");
  }
  if (password.length < 6) {
    req.flash("error", "Password must be at least 6 characters.");
    return res.redirect("/auth/reset-password");
  }

  const user = await User.findOne({ email });
  await user.setPassword(password);
  await user.save();

  // Clear session flags
  delete req.session.resetEmail;
  delete req.session.otpVerified;

  req.flash("success", "Password reset successfully! Please log in. 🎉");
  res.redirect("/auth/login");
}));

module.exports = router;