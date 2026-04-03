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
const productRoutes = require("./routes/products");
const reviewRoutes = require("./routes/reviews");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/home-harmony";

// ─── Database Connection ──────────────────────
mongoose
  .connect(DB_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ─── View Engine ──────────────────────────────
app.engine("ejs", ejsMate);               // use ejs-mate as layout engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ─── Middleware ───────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ─── Session Configuration ────────────────────
const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: DB_URL,
    touchAfter: 24 * 3600,              // lazy session update (seconds)
  }),
  name: "hh_session",                   // custom cookie name (obscures default)
  secret: process.env.SESSION_SECRET || "homeharmony_dev_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,                      // prevent XSS access to cookie
    // secure: true,                     // uncomment in production (HTTPS only)
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,   // 1 week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

// ─── Passport Initialization ──────────────────
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ─── Global Template Variables ────────────────
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

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/products", reviewRoutes); // /products/:id/reviews
app.use("/payment", paymentRoutes);
app.use("/admin", adminRoutes);

// ─── 404 Handler ─────────────────────────────
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// ─── Global Error Handler ─────────────────────
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error", { title: "Error", statusCode, message });
});

// ─── Start Server ─────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Home Harmony running at http://localhost:${PORT}`);
});

