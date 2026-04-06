// controllers/authController.js

const User = require("../models/User");

// ── GET /auth/register ────────────────────────────────────────────────────────
const renderRegister = (req, res) => {
  res.render("auth/register", { title: "Create Account — Home Harmony" });
};

// ── POST /auth/register ───────────────────────────────────────────────────────
const register = async (req, res, next) => {
  const { username, email, phone, password } = req.body;

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    req.flash("error", "An account with that email already exists.");
    return res.redirect("/auth/register");
  }

  const newUser = new User({ username, email, phone });
  const registeredUser = await User.register(newUser, password);

  req.login(registeredUser, (err) => {
    if (err) return next(err);
    req.flash("success", `Welcome to Home Harmony, ${registeredUser.username}! 🏠`);
    res.redirect("/products");
  });
};

// ── GET /auth/login ───────────────────────────────────────────────────────────
const renderLogin = (req, res) => {
  res.render("auth/login", { title: "Sign In — Home Harmony" });
};

// ── POST /auth/login ──────────────────────────────────────────────────────────
const login = (req, res) => {
  req.flash("success", `Welcome back, ${req.user.username}! 👋`);
  const redirectUrl = res.locals.returnTo || "/products";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

// ── POST /auth/logout ─────────────────────────────────────────────────────────
const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have been logged out. See you soon!");
    res.redirect("/");
  });
};

// ── GET /profile/edit ─────────────────────────────────────────────────────────
const renderProfileEdit = (req, res) => {
  res.render("users/edit", {
    title: "Edit Profile — Home Harmony",
    user: req.user,
  });
};

// ── PUT /profile ──────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  const { username, email, phone } = req.body;

  // Basic validation
  if (!username || !username.trim()) {
    req.flash("error", "Username is required.");
    return res.redirect("/profile/edit");
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    req.flash("error", "A valid email is required.");
    return res.redirect("/profile/edit");
  }

  // Check email uniqueness (exclude current user)
  const emailTaken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
  if (emailTaken) {
    req.flash("error", "That email is already in use.");
    return res.redirect("/profile/edit");
  }

  // Check username uniqueness (exclude current user)
  const usernameTaken = await User.findOne({ username: username.trim(), _id: { $ne: req.user._id } });
  if (usernameTaken) {
    req.flash("error", "That username is already taken.");
    return res.redirect("/profile/edit");
  }

  // Never allow role update via this route
  await User.findByIdAndUpdate(
    req.user._id,
    { username: username.trim(), email: email.toLowerCase().trim(), phone: phone?.trim() || "" },
    { new: true, runValidators: true }
  );

  req.flash("success", "Profile updated successfully! ✅");
  res.redirect("/profile/edit");
};

module.exports = { renderRegister, register, renderLogin, login, logout, renderProfileEdit, updateProfile };
