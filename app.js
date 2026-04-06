// ─────────────────────────────────────────────
//  Home Harmony — app.js (Entry Point)
// ─────────────────────────────────────────────

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");

const User = require("./models/User");
const ExpressError = require("./utils/ExpressError");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");       // ← Phase 8
const productRoutes = require("./routes/products");
const reviewRoutes = require("./routes/reviews");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin");
const orderRoutes = require("./routes/orders");
const addressRoutes = require("./routes/address");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/home-harmony";

// ─── Database ─────────────────────────────────
mongoose
  .connect(DB_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ─── View Engine ──────────────────────────────
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ─── Middleware ───────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ─── Session ──────────────────────────────────
const sessionConfig = {
  store: MongoStore.create({ mongoUrl: DB_URL, touchAfter: 24 * 3600 }),
  name: "hh_session",
  secret: process.env.SESSION_SECRET || "homeharmony_dev_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// ─── Passport ─────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ─── Global Locals ────────────────────────────
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ─── Routes ───────────────────────────────────
app.get("/", (req, res) => {
  res.render("home", { title: "Home Harmony — Rent, Buy & Sell Furniture" });
});
app.get("/support", (req, res) => {
  res.render("support", { title: "Help & Support — Home Harmony" });
});

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);     // ← Phase 8: GET /profile/edit, PUT /profile
app.use("/products", productRoutes);
app.use("/products", reviewRoutes);
app.use("/payment", paymentRoutes);
app.use("/admin", adminRoutes);
app.use("/orders", orderRoutes);
app.use("/address", addressRoutes);

// ─── 404 ──────────────────────────────────────
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// ─── Error Handler ────────────────────────────
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error", { title: "Error", statusCode, message });
});

// ─── Start ────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Home Harmony running at http://localhost:${PORT}`);
});
