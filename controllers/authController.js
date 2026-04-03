// controllers/authController.js

const User = require("../models/User");

// ── GET /auth/register ────────────────────────
const renderRegister = (req, res) => {
  res.render("auth/register", { title: "Create Account — Home Harmony" });
};

// ── POST /auth/register ───────────────────────
const register = async (req, res) => {
  const { username, email, phone, password } = req.body;

  // Check if email is already taken (passport-local-mongoose only checks username)
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    req.flash("error", "An account with that email already exists.");
    return res.redirect("/auth/register");
  }

  const newUser = new User({ username, email, phone });

  // passport-local-mongoose .register() hashes password and saves the user
  const registeredUser = await User.register(newUser, password);

  // Auto-login after registration
  req.login(registeredUser, (err) => {
    if (err) return next(err);
    req.flash("success", `Welcome to Home Harmony, ${registeredUser.username}! 🏠`);
    res.redirect("/products");
  });
};

// ── GET /auth/login ───────────────────────────
const renderLogin = (req, res) => {
  res.render("auth/login", { title: "Sign In — Home Harmony" });
};

// ── POST /auth/login ──────────────────────────
// passport.authenticate() runs before this; this only handles post-auth redirect.
const login = (req, res) => {
  req.flash("success", `Welcome back, ${req.user.username}! 👋`);
  const redirectUrl = res.locals.returnTo || "/products";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

// ── POST /auth/logout ─────────────────────────
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have been logged out. See you soon!");
    res.redirect("/");
  });
};

module.exports = { renderRegister, register, renderLogin, login, logout };