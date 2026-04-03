// seeds/index.js
// Run:  node seeds/index.js          → clears DB and inserts fresh seed data
// Run:  node seeds/index.js --clear  → clears DB only

if (process.env.NODE_ENV !== "production") require("dotenv").config();

const mongoose = require("mongoose");
const User     = require("../models/User");
const Product  = require("../models/Product");
const Review   = require("../models/Review");

const DB_URL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/home-harmony";

// ─── Sample image pool ────────────────────────────────────────────────────────
const images = {
  furniture: [
    { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800", filename: "sofa"         },
    { url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800", filename: "desk"       },
    { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", filename: "wardrobe"    },
    { url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800", filename: "bed"        },
    { url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800", filename: "chair"      },
  ],
  appliance: [
    { url: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800", filename: "washer"     },
    { url: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800", filename: "fridge"     },
    { url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800", filename: "ac"         },
    { url: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800", filename: "microwave"  },
  ],
};

// ─── Seed data definitions ────────────────────────────────────────────────────
const seedProducts = [
  {
    title:        "L-Shaped Sectional Sofa — Grey Fabric",
    description:  "Comfortable 5-seater L-shaped sofa in premium grey fabric. Excellent condition, used for 1 year. Includes reversible chaise. Dimensions: 280cm x 180cm.",
    category:     "furniture",
    type:         "sell",
    price:        18000,
    city:         "Mumbai",
    location:     "Andheri West",
    status:       "available",
    images:       [images.furniture[0]],
  },
  {
    title:        "Study Desk with Bookshelf — Walnut Finish",
    description:  "Solid wood study desk with attached bookshelf. Perfect for work-from-home. Has 3 drawers and cable management holes. Brand: Durian.",
    category:     "furniture",
    type:         "rent",
    price:        5000,
    rentPerMonth: 1200,
    city:         "Bangalore",
    location:     "Koramangala",
    status:       "available",
    images:       [images.furniture[1]],
  },
  {
    title:        "4-Door Wooden Wardrobe",
    description:  "Spacious 4-door wardrobe with mirror panels and internal shelving. Rich mahogany finish. Dismantles for easy transport.",
    category:     "furniture",
    type:         "sell",
    price:        12500,
    city:         "Pune",
    location:     "Baner",
    status:       "available",
    images:       [images.furniture[2]],
  },
  {
    title:        "Queen Size Bed Frame — White",
    description:  "Modern white hydraulic bed with storage underneath. Fits standard queen mattress (not included). Great for small apartments.",
    category:     "furniture",
    type:         "rent",
    price:        8000,
    rentPerMonth: 1800,
    city:         "Delhi",
    location:     "Dwarka",
    status:       "available",
    images:       [images.furniture[3]],
  },
  {
    title:        "Ergonomic Office Chair — Black Mesh",
    description:  "High-back ergonomic office chair with lumbar support and adjustable armrests. Ideal for long work sessions.",
    category:     "furniture",
    type:         "buy",
    price:        4500,
    city:         "Hyderabad",
    location:     "Gachibowli",
    status:       "available",
    images:       [images.furniture[4]],
  },
  {
    title:        "Samsung 7kg Front-Load Washing Machine",
    description:  "Samsung WW70T4040CE front-loader with eco-bubble technology. 2 years old, fully functional. All accessories included.",
    category:     "appliance",
    type:         "sell",
    price:        14000,
    city:         "Chennai",
    location:     "Velachery",
    status:       "available",
    images:       [images.appliance[0]],
  },
  {
    title:        "LG 260L Double-Door Refrigerator",
    description:  "LG GL-I292RPZL frost-free double-door fridge. 3 years old, in perfect condition. Platinum silver finish.",
    category:     "appliance",
    type:         "rent",
    price:        3000,
    rentPerMonth: 900,
    city:         "Bangalore",
    location:     "Whitefield",
    status:       "available",
    images:       [images.appliance[1]],
  },
  {
    title:        "Daikin 1.5 Ton 5-Star Split AC",
    description:  "Daikin FTKF50TV inverter split AC with Wi-Fi control. Installed 18 months ago. Comes with installation kit and remote.",
    category:     "appliance",
    type:         "rent",
    price:        6000,
    rentPerMonth: 1500,
    city:         "Mumbai",
    location:     "Powai",
    status:       "available",
    images:       [images.appliance[2]],
  },
  {
    title:        "IFB 20L Solo Microwave Oven",
    description:  "IFB 20PM1S solo microwave with 20L capacity. 1 year old, like new condition. Original box and accessories included.",
    category:     "appliance",
    type:         "sell",
    price:        3200,
    city:         "Pune",
    location:     "Kothrud",
    status:       "available",
    images:       [images.appliance[3]],
  },
  {
    title:        "3-Seater Teak Wood Sofa Set",
    description:  "Premium teak wood 3+1+1 sofa set with cushions. Solid build, over 5 years old but very well maintained. Suitable for large living rooms.",
    category:     "furniture",
    type:         "sell",
    price:        22000,
    city:         "Delhi",
    location:     "Lajpat Nagar",
    status:       "available",
    images:       [images.furniture[0]],
  },
];

// ─── Seed reviews ─────────────────────────────────────────────────────────────
const reviewComments = [
  { rating: 5, comment: "Exactly as described! Great quality and the seller was very helpful." },
  { rating: 4, comment: "Good product, minor wear but nothing significant. Smooth transaction." },
  { rating: 5, comment: "Superb condition. Would highly recommend this listing to anyone." },
  { rating: 3, comment: "Decent item but the delivery took longer than expected. Product is fine though." },
  { rating: 4, comment: "Very satisfied! The furniture looks even better in person." },
];

// ─── Main seed function ───────────────────────────────────────────────────────
const seedDB = async () => {
  await mongoose.connect(DB_URL);
  console.log("✅ Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  if (process.argv.includes("--clear")) {
    console.log("✅ Database cleared. Exiting.");
    await mongoose.disconnect();
    return;
  }

  // ── Create seed users ──────────────────────────────────────────────────────
  const adminUser = new User({
    username: "admin",
    email:    "admin@homeharmony.com",
    role:     "admin",
    avatar: {
      url:      "https://ui-avatars.com/api/?name=Admin&background=dc7420&color=fff&size=128",
      filename: "admin_avatar",
    },
  });
  await User.register(adminUser, "admin123");

  const demoUser = new User({
    username: "demouser",
    email:    "demo@homeharmony.com",
    role:     "user",
    phone:    "+91 98765 43210",
    avatar: {
      url:      "https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff&size=128",
      filename: "demo_avatar",
    },
  });
  await User.register(demoUser, "demo1234");

  const reviewUser = new User({
    username: "reviewer",
    email:    "reviewer@homeharmony.com",
    role:     "user",
    avatar: {
      url:      "https://ui-avatars.com/api/?name=Reviewer&background=059669&color=fff&size=128",
      filename: "reviewer_avatar",
    },
  });
  await User.register(reviewUser, "review123");

  console.log("👤 Seed users created");

  // ── Create seed products ───────────────────────────────────────────────────
  const createdProducts = [];
  for (const data of seedProducts) {
    const product  = new Product(data);
    product.owner  = adminUser._id;
    await product.save();
    createdProducts.push(product);
  }
  console.log(`🛋️  ${createdProducts.length} seed products created`);

  // ── Create seed reviews ────────────────────────────────────────────────────
  let reviewCount = 0;
  for (let i = 0; i < createdProducts.length; i++) {
    const product   = createdProducts[i];
    const reviewData = reviewComments[i % reviewComments.length];

    const review   = new Review({
      comment: reviewData.comment,
      rating:  reviewData.rating,
      author:  reviewUser._id,
      product: product._id,
    });
    await review.save();

    product.reviews.push(review._id);
    await product.save();
    reviewCount++;
  }
  console.log(`⭐ ${reviewCount} seed reviews created`);

  await mongoose.disconnect();
  console.log("\n🎉 Database seeded successfully!");
  console.log("─────────────────────────────────────");
  console.log("  Admin   → username: admin    | password: admin123");
  console.log("  Demo    → username: demouser | password: demo1234");
  console.log("  Review  → username: reviewer | password: review123");
  console.log("─────────────────────────────────────\n");
};

seedDB().catch((err) => {
  console.error("❌ Seeding failed:", err);
  mongoose.disconnect();
  process.exit(1);
});