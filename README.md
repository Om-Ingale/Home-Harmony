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
- [Order System](#-order-system)
- [Email Notifications](#-email-notifications)
- [PDF Receipts](#-pdf-receipts)
- [Forgot Password](#-forgot-password)
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

### Phase 7 Additions

- 📦 **Full Order System** — Multi-step order flow (Furlenco/RentMojo style) with date picker, rental calculator, address selection, and Razorpay payment
- 🏠 **Address Management** — Save multiple addresses per user (Amazon/Flipkart style) — add, edit, delete, set default
- 🚚 **Order Tracking** — Real-time order status timeline (Ordered → In Transit → Delivered) like Delhivery
- 🧾 **PDF Receipts** — Auto-generated PDF receipt using PDFKit, attached to confirmation email
- 📧 **Email Notifications** — Brevo SMTP + Nodemailer for order confirmation, receipt, status updates
- 🔑 **Forgot Password** — OTP-based password reset via email (6-digit OTP, 10-min expiry)
- 📊 **Admin Order Management** — View all orders, update status, revenue stats in dashboard

---

## 🧰 Tech Stack

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Runtime        | Node.js 18+                               |
| Framework      | Express.js 4                              |
| Database       | MongoDB + Mongoose 8                      |
| Auth           | Passport.js + passport-local-mongoose     |
| Templating     | EJS + ejs-mate                            |
| Styling        | Tailwind CSS (CDN)                        |
| Icons          | Lucide Icons                              |
| Fonts          | Playfair Display + DM Sans (Google Fonts) |
| Image Uploads  | Multer + Cloudinary                       |
| Maps           | MapBox GL JS v3                           |
| Payments       | Razorpay                                  |
| Sessions       | express-session + connect-mongo           |
| Flash Messages | connect-flash                             |
| Form Methods   | method-override                           |
| Validation     | Joi (server-side)                         |
| Email          | Nodemailer + Brevo SMTP                   |
| PDF Generation | PDFKit                                    |
| Dev Server     | nodemon                                   |

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
│   ├── razorpay.js                 # Razorpay instance
│   ├── mailer.js                   # Nodemailer + Brevo SMTP transporter
│   └── pdfReceipt.js               # PDFKit receipt generator
│
├── models/
│   ├── User.js                     # passport-local-mongoose, avatar, role
│   ├── Product.js                  # Listings with geometry, images, reviews
│   ├── Review.js                   # Rating + comment, double-referenced
│   ├── Order.js                    # Full order — product, buyer, address, status
│   ├── Address.js                  # Saved addresses per user (multiple)
│   └── OtpToken.js                 # Forgot password OTP (TTL: 10 min)
│
├── middleware/
│   └── index.js                    # isLoggedIn, isOwner, isReviewAuthor, isAdmin
│
├── routes/
│   ├── auth.js                     # /auth — register, login, logout, forgot/reset password
│   ├── products.js                 # /products — CRUD + image upload
│   ├── reviews.js                  # /products/:id/reviews — create, delete
│   ├── payment.js                  # /payment — Razorpay order + verify
│   ├── orders.js                   # /orders — create, view, track
│   ├── address.js                  # /address — CRUD for saved addresses
│   └── admin.js                    # /admin — dashboard, users, products, reviews, orders
│
├── controllers/
│   ├── authController.js           # + forgot password, OTP verify, reset
│   ├── productController.js        # Cloudinary + MapBox integrated
│   ├── reviewController.js
│   ├── orderController.js          # Order creation, tracking, receipt
│   ├── addressController.js        # Address CRUD
│   └── adminController.js          # Stats, CRUD for admin + order management
│
├── views/
│   ├── boilerplate.ejs             # Master layout
│   ├── home.ejs                    # Landing page
│   ├── error.ejs                   # 404 / 500 page
│   ├── support.ejs                 # Help & FAQ page
│   ├── includes/
│   │   ├── navbar.ejs              # Auth-aware, admin link, mobile menu
│   │   └── footer.ejs
│   ├── auth/
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   ├── forgot-password.ejs     # Enter email to receive OTP
│   │   ├── verify-otp.ejs          # Enter 6-digit OTP
│   │   └── reset-password.ejs      # Enter new password
│   ├── products/
│   │   ├── index.ejs               # Filterable grid with pagination
│   │   ├── show.ejs                # Detail + map + reviews + order flow
│   │   ├── new.ejs                 # Create form with image upload
│   │   └── edit.ejs                # Edit form with image management
│   ├── orders/
│   │   ├── checkout.ejs            # Multi-step order flow (dates → address → summary)
│   │   ├── confirm.ejs             # Order confirmation + tracking timeline
│   │   └── my-orders.ejs           # User's order history
│   ├── address/
│   │   └── index.ejs               # Manage saved addresses (Amazon style)
│   └── admin/
│       ├── dashboard.ejs           # Stats + recent listings + order overview
│       ├── users.ejs               # User table with promote/delete
│       ├── products.ejs            # Listings table with delete
│       ├── reviews.ejs             # Reviews table with delete
│       └── orders.ejs              # All orders with status management
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
- [Brevo](https://brevo.com) account (free tier — 300 emails/day)

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
MONGO_URI=mongodb://127.0.0.1:27017/home-harmony
# Atlas: MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/home-harmony

# ─── Session ──────────────────────────────────────────────────────────────────
SESSION_SECRET=pick_a_long_random_string_here_minimum_32_characters

# ─── Cloudinary ───────────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

# ─── MapBox ───────────────────────────────────────────────────────────────────
MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNr...

# ─── Razorpay ─────────────────────────────────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# ─── Brevo (Email / SMTP) ─────────────────────────────────────────────────────
# Find at: https://app.brevo.com → SMTP & API → SMTP
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_login_email
BREVO_SMTP_PASS=your_brevo_smtp_password
EMAIL_FROM=noreply@homeharmony.in
EMAIL_FROM_NAME=Home Harmony
```

### Where to find each value

| Variable         | Where to find                                 |
| ---------------- | --------------------------------------------- |
| `MONGO_URI`      | MongoDB Atlas → Connect → Drivers             |
| `CLOUDINARY_*`   | Cloudinary Dashboard → API Keys               |
| `MAPBOX_TOKEN`   | MapBox → Account → Tokens                     |
| `RAZORPAY_KEY_*` | Razorpay Dashboard → Settings → API Keys      |
| `BREVO_SMTP_*`   | Brevo → Transactional → SMTP & API → SMTP tab |

> ⚠️ **Never commit your `.env` file.** It is already in `.gitignore`.

---

## 🌱 Seed Data

```bash
npm run seed       # Clear DB + insert fresh seed data
npm run unseed     # Clear DB only
```

**What gets created:**

| Type     | Count | Details                                      |
| -------- | ----- | -------------------------------------------- |
| Users    | 3     | admin, demouser, reviewer                    |
| Products | 10    | Mix of furniture + appliances, rent/buy/sell |
| Reviews  | 10    | One review per product from reviewer account |

---

## 🛣️ Route Reference

### Auth — `/auth`

| Method | Route                   | Description                 | Auth     |
| ------ | ----------------------- | --------------------------- | -------- |
| GET    | `/auth/register`        | Show register form          | Public   |
| POST   | `/auth/register`        | Create account + auto-login | Public   |
| GET    | `/auth/login`           | Show login form             | Public   |
| POST   | `/auth/login`           | Authenticate + redirect     | Public   |
| POST   | `/auth/logout`          | Destroy session             | Required |
| GET    | `/auth/forgot-password` | Show forgot password form   | Public   |
| POST   | `/auth/forgot-password` | Send OTP to email           | Public   |
| GET    | `/auth/verify-otp`      | Show OTP entry form         | Public   |
| POST   | `/auth/verify-otp`      | Verify OTP                  | Public   |
| GET    | `/auth/reset-password`  | Show new password form      | Public   |
| POST   | `/auth/reset-password`  | Save new password           | Public   |

### Products — `/products`

| Method | Route                | Description                            | Auth             |
| ------ | -------------------- | -------------------------------------- | ---------------- |
| GET    | `/products`          | Browse all (with filters + pagination) | Public           |
| GET    | `/products/new`      | New listing form                       | Required         |
| POST   | `/products`          | Create listing + upload images         | Required         |
| GET    | `/products/:id`      | View listing detail + map              | Public           |
| GET    | `/products/:id/edit` | Edit form                              | Required + Owner |
| PUT    | `/products/:id`      | Update listing                         | Required + Owner |
| DELETE | `/products/:id`      | Delete listing + images                | Required + Owner |

### Reviews — `/products/:id/reviews`

| Method | Route                             | Description   | Auth              |
| ------ | --------------------------------- | ------------- | ----------------- |
| POST   | `/products/:id/reviews`           | Add review    | Required          |
| DELETE | `/products/:id/reviews/:reviewId` | Delete review | Required + Author |

### Orders — `/orders`

| Method | Route                         | Description                      | Auth     |
| ------ | ----------------------------- | -------------------------------- | -------- |
| GET    | `/orders/checkout/:productId` | Multi-step checkout page         | Required |
| POST   | `/orders`                     | Create order after payment       | Required |
| GET    | `/orders/my-orders`           | User's order history             | Required |
| GET    | `/orders/:id`                 | Order detail + tracking timeline | Required |
| GET    | `/orders/:id/receipt`         | Download PDF receipt             | Required |

### Addresses — `/address`

| Method | Route                      | Description            | Auth     |
| ------ | -------------------------- | ---------------------- | -------- |
| GET    | `/address`                 | Manage saved addresses | Required |
| POST   | `/address`                 | Add new address        | Required |
| GET    | `/address/:id/edit`        | Edit address form      | Required |
| PUT    | `/address/:id`             | Update address         | Required |
| DELETE | `/address/:id`             | Delete address         | Required |
| POST   | `/address/:id/set-default` | Set as default address | Required |

### Payments — `/payment`

| Method | Route                   | Description                       | Auth     |
| ------ | ----------------------- | --------------------------------- | -------- |
| POST   | `/payment/create-order` | Create Razorpay order             | Required |
| POST   | `/payment/verify`       | Verify payment + create Order doc | Required |

### Admin — `/admin`

| Method | Route                          | Description                           | Auth  |
| ------ | ------------------------------ | ------------------------------------- | ----- |
| GET    | `/admin`                       | Dashboard with stats + order overview | Admin |
| GET    | `/admin/users`                 | List all users                        | Admin |
| GET    | `/admin/products`              | List all listings                     | Admin |
| GET    | `/admin/reviews`               | List all reviews                      | Admin |
| GET    | `/admin/orders`                | List all orders                       | Admin |
| PATCH  | `/admin/orders/:id/status`     | Update order status                   | Admin |
| DELETE | `/admin/users/:id`             | Delete user                           | Admin |
| DELETE | `/admin/products/:id`          | Delete listing + images               | Admin |
| DELETE | `/admin/reviews/:id`           | Delete review                         | Admin |
| POST   | `/admin/users/:id/toggle-role` | Promote/demote user                   | Admin |

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

### Order _(Phase 7)_

```
buyer           ObjectId → User  (required)
seller          ObjectId → User  (required)
product         ObjectId → Product  (required)
type            String  enum: ['buy', 'rent']
address         ObjectId → Address  (required)
startDate       Date    (rent only)
endDate         Date    (rent only)
totalDays       Number  (rent only)
totalAmount     Number  (required)
status          String  enum: ['pending','confirmed','in_transit','delivered','cancelled']
                        default: 'pending'
paymentId       String  (Razorpay payment ID)
razorpayOrderId String  (Razorpay order ID)
receiptUrl      String  (Cloudinary PDF URL or local path)
timestamps      createdAt, updatedAt
```

### Address _(Phase 7)_

```
user            ObjectId → User  (required)
label           String  enum: ['Home','Work','Other']  default: 'Home'
fullName        String  (required)
phone           String  (required, 10 digits)
line1           String  (required — house/flat/building)
line2           String  (optional — street/area)
city            String  (required)
state           String  (required)
pincode         String  (required, 6 digits)
isDefault       Boolean  default: false
timestamps      createdAt, updatedAt
```

### OtpToken _(Phase 7)_

```
email           String  (required)
otp             String  (6-digit hashed)
expiresAt       Date    (TTL index — auto-deletes after 10 minutes)
timestamps      createdAt
```

---

## 🔧 Admin Panel

Access at `/admin` — requires `role: 'admin'`.

After seeding, log in as `admin / admin123` to access the panel.

**Capabilities:**

- 📊 Dashboard with live stats (users, listings, reviews, orders, revenue)
- 👥 User management — view all users, promote to admin, demote, delete
- 🛋️ Listing management — view all products, delete with Cloudinary cleanup
- ⭐ Review moderation — view all reviews, delete any review
- 📦 Order management — view all orders, update status (confirmed → in_transit → delivered)

---

## 💳 Payments (Razorpay)

Razorpay is integrated into the full order checkout flow.

**Flow:**

1. User clicks **"Buy Now"** or **"Rent Now"** on a listing
2. Multi-step checkout opens: dates → address → order summary
3. User clicks **"Pay with Razorpay"**
4. Frontend calls `POST /payment/create-order` → server creates Razorpay order
5. Razorpay checkout modal opens
6. On success, frontend calls `POST /payment/verify`
7. Server verifies HMAC-SHA256 signature
8. Order document created in DB
9. PDF receipt generated via PDFKit
10. Confirmation email + PDF receipt sent via Brevo SMTP

> Use Razorpay **test mode** keys during development. Test card: `4111 1111 1111 1111`.

---

## ☁️ Image Uploads (Cloudinary)

- Up to **6 images** per listing
- Accepted formats: `jpg`, `jpeg`, `png`, `webp`
- Max file size: **5 MB** per image
- Auto-transformed to max `1200×900px` on upload
- Thumbnail virtual generates `w_400,h_300,c_fill` URL for cards
- On product delete — all Cloudinary images are **automatically deleted**
- On product edit — select images to delete, or add new ones

---

## 🗺️ Maps (MapBox)

- City + location string → `[longitude, latitude]` GeoJSON Point
- Stored in `product.geometry` with a `2dsphere` index
- Rendered on the product detail page using **MapBox GL JS v3**
- Custom orange marker matching the brand colour
- Navigation controls included

---

## 📦 Order System _(Phase 7)_

The order flow mirrors Furlenco / RentMojo for rent and Amazon/Flipkart for buy.

**Step-by-step flow:**

```
Product Page
  └─ Click "Buy Now" / "Rent Now" / "Contact Seller"
        │
        ▼
Step 1 — Date & Duration  (rent only)
  • Calendar date picker (start date)
  • Number of days selector
  • Live rental calculator (days × daily rate = total)
        │
        ▼
Step 2 — Delivery Address
  • Select from saved addresses  OR  Add new address
  • Links to /address page for full address management
        │
        ▼
Step 3 — Order Summary
  • Product details, pricing breakdown
  • Selected address, dates (if rent)
  • "Pay with Razorpay" button
        │
        ▼
Razorpay Payment
        │
        ▼
Order Created in DB
  • Status: pending → confirmed
  • PDF receipt generated (PDFKit)
  • Email sent to buyer (confirmation + PDF attachment)
  • Email sent to seller (new order notification)
        │
        ▼
Order Confirmation Page (/orders/:id)
  • Order ID, product, amount, address
  • Delhivery-style tracking timeline
```

**Order Tracking Timeline:**

```
✅ Order Placed      — immediately
✅ Order Confirmed   — after payment verification
🚚 In Transit        — updated by admin
📦 Delivered         — updated by admin
```

---

## 📧 Email Notifications _(Phase 7)_

Powered by **Nodemailer + Brevo SMTP** (300 free emails/day).

| Trigger              | Recipient | Content                             |
| -------------------- | --------- | ----------------------------------- |
| Order placed         | Buyer     | Confirmation + PDF receipt attached |
| Order placed         | Seller    | New order notification              |
| Order status updated | Buyer     | Status change notification          |
| Forgot password      | User      | 6-digit OTP (expires in 10 min)     |

---

## 🧾 PDF Receipts _(Phase 7)_

Generated using **PDFKit** after successful payment.

**Receipt includes:**

- Home Harmony logo + brand header
- Order ID and date
- Product name, type, quantity/duration
- Delivery address
- Pricing breakdown (subtotal, taxes, total)
- Payment ID (Razorpay)
- Footer with support contact

Receipt is attached to the confirmation email and also available for download at `/orders/:id/receipt`.

---

## 🔑 Forgot Password _(Phase 7)_

OTP-based password reset via email.

**Flow:**

```
/auth/forgot-password  →  Enter email
                       →  6-digit OTP sent via Brevo
/auth/verify-otp       →  Enter OTP (10-min expiry, auto-deleted from DB)
/auth/reset-password   →  Enter new password
                       →  Redirected to login with success flash
```

OTPs are stored in MongoDB with a **TTL index** — they auto-delete after 10 minutes with no cron job needed.

---

## 🔑 Test Credentials

| Role      | Username   | Password    |
| --------- | ---------- | ----------- |
| Admin     | `admin`    | `admin123`  |
| Demo User | `demouser` | `demo1234`  |
| Reviewer  | `reviewer` | `review123` |

---

## 📜 Scripts

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start without nodemon (production)
npm run seed     # Clear DB + insert seed data
npm run unseed   # Clear DB only
```

---

## 🔮 Roadmap

- [x] 🔐 Authentication (Passport.js)
- [x] 🛋️ Product CRUD with Cloudinary images
- [x] ⭐ Reviews & Ratings
- [x] 🗺️ MapBox location maps
- [x] 💳 Razorpay payments
- [x] 🔧 Admin dashboard
- [x] 📄 Pagination on listings page
- [x] ⚡ Skeleton loaders + global page loader
- [x] 📦 Full order system with rental calculator
- [x] 🏠 Address management (multiple addresses per user)
- [x] 🚚 Order tracking timeline (Delhivery style)
- [x] 🧾 PDF receipt generation (PDFKit)
- [x] 📧 Email notifications (Nodemailer + Brevo)
- [x] 🔑 Forgot password via email OTP
- [x] 📊 Admin order management
- [ ] 💬 In-app messaging between buyers and sellers
- [ ] 👤 User profile page (own listings + reviews)
- [ ] 🔖 Wishlist / saved listings
- [ ] 📲 PWA support — installable on mobile
- [ ] 🌐 Google OAuth login
- [ ] 🗺️ Cluster map on listings page (MapBox)

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<p align="center">Built with ❤️ for better living spaces · Home Harmony © 2025</p>
