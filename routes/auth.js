// routes/auth.js

const express = require("express");
const passport = require("passport");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const { storeReturnTo, isLoggedIn } = require("../middleware");
const authController = require("../controllers/authController");
const OtpToken = require("../models/OtpToken");
const { sendOtpEmail } = require("../utils/mailer");
const User = require("../models/User");

// ── Register ───────────────────────────────────────────────────────────────────
router.route("/register")
  .get(authController.renderRegister)
  .post(catchAsync(authController.register));

// ── Login ──────────────────────────────────────────────────────────────────────
router.route("/login")
  .get(authController.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate("local", { failureFlash: true, failureRedirect: "/auth/login" }),
    authController.login
  );

// ── Logout ─────────────────────────────────────────────────────────────────────
router.post("/logout", authController.logout);

// ── Forgot Password ────────────────────────────────────────────────────────────
router.get("/forgot-password", (req, res) => {
  res.render("auth/forgot-password", { title: "Forgot Password — Home Harmony" });
});

router.post("/forgot-password", catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    req.flash("success", "If that email exists, an OTP has been sent.");
    return res.redirect("/auth/forgot-password");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await OtpToken.deleteMany({ email: email.toLowerCase() });
  await OtpToken.create({ email: email.toLowerCase(), otp });
  await sendOtpEmail(email, otp);

  req.flash("success", "OTP sent to your email! Check your inbox.");
  req.session.resetEmail = email.toLowerCase();
  res.redirect("/auth/verify-otp");
}));

// ── Verify OTP ─────────────────────────────────────────────────────────────────
router.get("/verify-otp", (req, res) => {
  if (!req.session.resetEmail) return res.redirect("/auth/forgot-password");
  res.render("auth/verify-otp", { title: "Verify OTP — Home Harmony", email: req.session.resetEmail });
});

router.post("/verify-otp", catchAsync(async (req, res) => {
  const { otp } = req.body;
  const email = req.session.resetEmail;
  if (!email) return res.redirect("/auth/forgot-password");

  const token = await OtpToken.findOne({ email: email.toLowerCase() });
  if (!token) {
    req.flash("error", "OTP expired. Please request a new one.");
    return res.redirect("/auth/forgot-password");
  }
  if (token.otp.toString().trim() !== otp.toString().trim()) {
    req.flash("error", "Invalid OTP. Please try again.");
    return res.redirect("/auth/verify-otp");
  }

  req.session.otpVerified = true;
  await OtpToken.deleteMany({ email: email.toLowerCase() });
  res.redirect("/auth/reset-password");
}));

// ── Reset Password ─────────────────────────────────────────────────────────────
router.get("/reset-password", (req, res) => {
  if (!req.session.resetEmail || !req.session.otpVerified) {
    return res.redirect("/auth/forgot-password");
  }
  res.render("auth/reset-password", { title: "Reset Password — Home Harmony" });
});

router.post("/reset-password", catchAsync(async (req, res) => {
  const { password, confirmPassword } = req.body;
  const email = req.session.resetEmail;
  if (!email || !req.session.otpVerified) return res.redirect("/auth/forgot-password");
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
  delete req.session.resetEmail;
  delete req.session.otpVerified;
  req.flash("success", "Password reset successfully! Please log in. 🎉");
  res.redirect("/auth/login");
}));

module.exports = router;
