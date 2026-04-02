// models/User.js

const mongoose               = require("mongoose");
const passportLocalMongoose  = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type:     String,
      required: [true, "Email is required"],
      unique:   true,
      lowercase: true,
      trim:     true,
      match:    [/\S+@\S+\.\S+/, "Invalid email format"],
    },

    phone: {
      type:  String,
      trim:  true,
      match: [/^\+?[\d\s\-]{7,15}$/, "Invalid phone number"],
    },

    avatar: {
      url:      { type: String, default: "https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=User" },
      filename: { type: String, default: "" },
    },

    role: {
      type:    String,
      enum:    ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

// passport-local-mongoose adds:
//   • username field (unique, required)
//   • hash + salt fields for password storage
//   • .register(), .authenticate(), .serializeUser(), .deserializeUser() statics
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);