// routes/auth.js

const express    = require("express");
const passport   = require("passport");
const router     = express.Router();
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require("../middleware");
const authController    = require("../controllers/authController");

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
      failureFlash:    true,
      failureRedirect: "/auth/login",
    }),
    authController.login
  );

// ── Logout ────────────────────────────────────
router.post("/logout", authController.logout);

module.exports = router;