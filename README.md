# 🏠 Home Harmony

> A full-stack marketplace to **rent, buy, and sell furniture & home appliances** — built with Node.js, Express, MongoDB, EJS, Cloudinary, MapBox, and Razorpay.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=flat&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CDN-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B?style=flat&logo=razorpay&logoColor=white)

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Seed Data](#-seed-data)
- [Route Reference](#-route-reference)
- [Data Models](#-data-models)
- [Admin Panel](#-admin-panel)
- [Payments](#-payments-razorpay)
- [Image Uploads](#-image-uploads-cloudinary)
- [Maps](#-maps-mapbox)
- [Test Credentials](#-test-credentials)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## ✨ Features

### Core
- 🔐 **Authentication** — Register, login, logout via Passport.js local strategy
- 🛋️ **Product Listings** — Full CRUD with image upload, category, type, city
- ⭐ **Reviews & Ratings** — Star ratings + comments, one review per user per listing
- 🔍 **Search & Filter** — By type (rent/buy/sell), category, city, keyword
- 🛡️ **Authorization** — Owners manage their listings; authors manage their reviews
- 💬 **Flash Messages** — Success and error feedback on every action
- 📱 **Responsive UI** — Tailwind CSS, Playfair Display + DM Sans typography
- 🗃️ **Persistent Sessions** — Sessions stored in MongoDB via connect-mongo

### Phase 6 Additions
- ☁️ **Cloudinary Uploads** — Real multi-image upload with size/type validation
- 🗺️ **MapBox Maps** — Geocoded location map on every product detail page
- 💳 **Razorpay Payments** — Secure order creation + signature verification
- 🔧 **Admin Dashboard** — Manage users, listings, and reviews with stats overview

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4 |
| Database | MongoDB + Mongoose 8 |
| Auth | Passport.js + passport-local-mongoose |
| Templating | EJS + ejs-mate |
| Styling | Tailwind CSS (CDN) |
| Icons | Lucide Icons |
| Fonts | Playfair Display + DM Sans (Google Fonts) |
| Image Uploads | Multer + Cloudinary |
| Maps | MapBox GL JS v3 |
| Payments | Razorpay |
| Sessions | express-session + connect-mongo |
| Flash Messages | connect-flash |
| Form Methods | method-override |
| Validation | Joi (server-side) |
| Dev Server | nodemon |

---

## 📁 Project Structure
```
home-harmony/
├── app.js                          # Entry point
├── .env                            # Environment variables (never commit)
├── .gitignore
├── nodemon.json
├── package.json
├── README.md
│
├── seeds/
│   └── index.js                    # DB seeder — 10 products, 3 users, reviews
│
├── utils/
│   ├── ExpressError.js             # Custom error class
│   ├── catchAsync.js               # Async error wrapper
│   ├── cloudinary.js               # Cloudinary + Multer config
│   ├── mapbox.js                   # Forward geocoding helper
│   └── razorpay.js                 # Razorpay instance
│
├── models/
│   ├── User.js                     # passport-local-mongoose, avatar, role
│   ├── Product.js                  # Listings with geometry, images, reviews
│   └── Review.js                   # Rating + comment, double-referenced
│
├── middleware/
│   └── index.js                    # isLoggedIn, isOwner, isReviewAuthor, isAdmin
│
├── routes/
│   ├── auth.js                     # /auth — register, login, logout
│   ├── products.js                 # /products — CRUD + image upload
│   ├── reviews.js                  # /products/:id/reviews — create, delete
│   ├── payment.js                  # /payment — Razorpay order + verify
│   └── admin.js                    # /admin — dashboard, users, products, reviews
│
├── controllers/
│   ├── authController.js
│   ├── productController.js        # Cloudinary + MapBox integrated
│   ├── reviewController.js
│   └── adminController.js          # Stats, CRUD for admin
│
├── views/
│   ├── boilerplate.ejs             # Master layout
│   ├── home.ejs                    # Landing page
│   ├── error.ejs                   # 404 / 500 page
│   ├── includes/
│   │   ├── navbar.ejs              # Auth-aware, admin link, mobile menu
│   │   └── footer.ejs
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   ├── products/
│   │   ├── index.ejs               # Filterable grid
│   │   ├── show.ejs                # Detail + map + reviews + Razorpay
│   │   ├── new.ejs                 # Create form with image upload
│   │   └── edit.ejs                # Edit form with image management
│   └── admin/
│       ├── dashboard.ejs           # Stats + recent listings
│       ├── users.ejs               # User table with promote/delete
│       ├── products.ejs            # Listings table with delete
│       └── reviews.ejs             # Reviews table with delete
│
└── public/
    ├── css/style.css               # Font wiring, animations, scrollbar
    └── js/main.js                  # Mobile menu, stars, password toggle
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) locally **or** a [MongoDB Atlas](https://cloud.mongodb.com) cluster
- [Cloudinary](https://cloudinary.com) account
- [MapBox](https://mapbox.com) account (free tier works)
- [Razorpay](https://razorpay.com) test account

### 1. Clone the repository
```bash
git clone https://github.com/your-username/home-harmony.git
cd home-harmony
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
# Then open .env and fill in your credentials (see below)
```

### 4. Seed the database
```bash
npm run seed
```

### 5. Start the development server
```bash
npm run dev
```

### 6. Open in browser
```
http://localhost:3000
```

---

## 🔒 Environment Variables

Create a `.env` file in the project root with the following:
```env
# ─── Server ───────────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=3000

# ─── MongoDB ──────────────────────────────────────────────────────────────────
# Local:
MONGO_URI=mongodb://127.0.0.1:27017/home-harmony

# Atlas (replace with your connection string):
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/home-harmony?retryWrites=true&w=majority

# ─── Session ──────────────────────────────────────────────────────────────────
SESSION_SECRET=pick_a_long_random_string_here_minimum_32_characters

# ─── Cloudinary ───────────────────────────────────────────────────────────────
# Find these at: https://console.cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

# ─── MapBox ───────────────────────────────────────────────────────────────────
# Find this at: https://account.mapbox.com → Tokens
MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNr...

# ─── Razorpay ─────────────────────────────────────────────────────────────────
# Find these at: https://dashboard.razorpay.com → Settings → API Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Where to find each value

| Variable | Where to find |
|---|---|
| `MONGO_URI` | MongoDB Atlas → Your Cluster → Connect → Drivers |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard → top of page |
| `CLOUDINARY_KEY` | Cloudinary Dashboard → API Keys |
| `CLOUDINARY_SECRET` | Cloudinary Dashboard → API Keys |
| `MAPBOX_TOKEN` | MapBox → Account → Tokens → Create a token |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys |

> ⚠️ **Never commit your `.env` file.** It is already in `.gitignore`.

---

## 🌱 Seed Data

The seed script populates your database with realistic sample data.
```bash
npm run seed       # Clear DB + insert fresh seed data
npm run unseed     # Clear DB only
```

**What gets created:**

| Type | Count | Details |
|---|---|---|
| Users | 3 | admin, demouser, reviewer |
| Products | 10 | Mix of furniture + appliances, rent/buy/sell |
| Reviews | 10 | One review per product from reviewer account |

---

## 🛣️ Route Reference

### Auth — `/auth`

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/auth/register` | Show register form | Public |
| POST | `/auth/register` | Create account + auto-login | Public |
| GET | `/auth/login` | Show login form | Public |
| POST | `/auth/login` | Authenticate + redirect | Public |
| POST | `/auth/logout` | Destroy session | Required |

### Products — `/products`

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/products` | Browse all (with filters) | Public |
| GET | `/products/new` | New listing form | Required |
| POST | `/products` | Create listing + upload images | Required |
| GET | `/products/:id` | View listing detail + map | Public |
| GET | `/products/:id/edit` | Edit form | Required + Owner |
| PUT | `/products/:id` | Update listing | Required + Owner |
| DELETE | `/products/:id` | Delete listing + images | Required + Owner |

### Reviews — `/products/:id/reviews`

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/products/:id/reviews` | Add review (1 per user) | Required |
| DELETE | `/products/:id/reviews/:reviewId` | Delete review | Required + Author |

### Payments — `/payment`

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/payment/create-order` | Create Razorpay order | Required |
| POST | `/payment/verify` | Verify payment signature | Required |

### Admin — `/admin`

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/admin` | Dashboard with stats | Admin |
| GET | `/admin/users` | List all users | Admin |
| GET | `/admin/products` | List all listings | Admin |
| GET | `/admin/reviews` | List all reviews | Admin |
| DELETE | `/admin/users/:id` | Delete user | Admin |
| DELETE | `/admin/products/:id` | Delete listing + images | Admin |
| DELETE | `/admin/reviews/:id` | Delete review | Admin |
| POST | `/admin/users/:id/toggle-role` | Promote/demote user | Admin |

---

## 🗃️ Data Models

### User
```
username        String  (unique, handled by passport-local-mongoose)
email           String  (unique, required)
phone           String  (optional)
avatar          { url, filename }
role            String  enum: ['user', 'admin']  default: 'user'
timestamps      createdAt, updatedAt
```

### Product
```
title           String  (required, max 100)
description     String  (required, max 2000)
category        String  enum: ['furniture','appliance','decor','electronics','other']
type            String  enum: ['rent','buy','sell']
price           Number  (required)
rentPerMonth    Number  (optional, for rent type)
images          [{ url, filename }]
location        String  (area/locality)
city            String  (required)
geometry        { type: 'Point', coordinates: [lng, lat], placeName }
status          String  enum: ['available','rented','sold']  default: 'available'
owner           ObjectId → User
reviews         [ObjectId → Review]
timestamps      createdAt, updatedAt

virtuals:       averageRating, images[].thumbnail
indexes:        geometry (2dsphere)
hooks:          post('findOneAndDelete') → cascade deletes all reviews
```

### Review
```
comment         String  (required, max 500)
rating          Number  (required, 1–5)
author          ObjectId → User
product         ObjectId → Product
timestamps      createdAt, updatedAt
```

---

## 🔧 Admin Panel

Access at `/admin` — requires `role: 'admin'`.

After seeding, log in as `admin / admin123` to access the panel.

**Capabilities:**
- 📊 Dashboard with live stats (users, listings, reviews, availability breakdown)
- 👥 User management — view all users, promote to admin, demote, delete
- 🛋️ Listing management — view all products, delete with Cloudinary cleanup
- ⭐ Review moderation — view all reviews, delete any review

---

## 💳 Payments (Razorpay)

Razorpay is integrated on the product detail page for available listings.

**Flow:**
1. User clicks "Pay with Razorpay"
2. Frontend calls `POST /payment/create-order` → server creates a Razorpay order
3. Razorpay checkout modal opens in-browser
4. On payment success, frontend calls `POST /payment/verify`
5. Server verifies HMAC-SHA256 signature — confirms payment is genuine

> Use Razorpay **test mode** keys during development. Test card: `4111 1111 1111 1111`.

---

## ☁️ Image Uploads (Cloudinary)

Images are uploaded via **Multer + multer-storage-cloudinary**.

- Up to **6 images** per listing
- Accepted formats: `jpg`, `jpeg`, `png`, `webp`
- Max file size: **5 MB** per image
- Auto-transformed to max `1200×900px` on upload
- Thumbnail virtual generates `w_400,h_300,c_fill` URL for cards
- On product delete — all Cloudinary images are **automatically deleted**
- On product edit — select images to delete, or add new ones

All images stored in the `home_harmony` folder in your Cloudinary account.

---

## 🗺️ Maps (MapBox)

Every listing is geocoded using the **MapBox Geocoding API** when created or when the city changes.

- City + location string → `[longitude, latitude]` GeoJSON Point
- Stored in `product.geometry` with a `2dsphere` index
- Rendered on the product detail page using **MapBox GL JS v3**
- Custom orange marker matching the brand colour
- Popup shows product title and city
- Navigation controls included

---

## 🔑 Test Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Demo User | `demouser` | `demo1234` |
| Reviewer | `reviewer` | `review123` |

---

## 🔮 Roadmap

- [ ] 💬 In-app messaging between buyers and sellers
- [ ] 📧 Email notifications via Nodemailer (new review, new enquiry)
- [ ] 📄 Pagination on listings page
- [ ] 👤 User profile page (own listings + reviews)
- [ ] 🔖 Wishlist / saved listings
- [ ] 📦 Order history and rental tracking
- [ ] 📲 PWA support — installable on mobile
- [ ] 🌐 Google OAuth login
- [ ] 🗺️ Cluster map on listings page (MapBox)
- [ ] 🧾 PDF receipt generation after payment

---

## 📜 Scripts
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start without nodemon (production)
npm run seed     # Clear DB + insert seed data
npm run unseed   # Clear DB only
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<p align="center">Built with ❤️ for better living spaces · Home Harmony © 2025</p>