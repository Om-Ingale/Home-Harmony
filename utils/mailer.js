const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.BREVO_SMTP_HOST,
  port:   Number(process.env.BREVO_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

// ── Base email sender ─────────────────────────────────────────────────────────
const sendMail = async ({ to, subject, html, attachments = [] }) => {
  await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || "Home Harmony"}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
    attachments,
  });
};

// ── Order confirmation to buyer ───────────────────────────────────────────────
const sendOrderConfirmation = async (order, buyer, product, address, pdfBuffer) => {
  const isRent = order.type === "rent";

  const html = `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e7e5e4;">
      <!-- Header -->
      <div style="background:#dc7420;padding:28px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">🏠 Home Harmony</h1>
        <p style="color:#fde8d0;margin:6px 0 0;font-size:14px;">Order Confirmation</p>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <h2 style="color:#1c1917;font-size:18px;margin:0 0 8px;">Hi ${buyer.username}! 🎉</h2>
        <p style="color:#78716c;font-size:14px;margin:0 0 24px;">
          Your ${isRent ? "rental" : "purchase"} order has been placed successfully.
          Here are your order details:
        </p>

        <!-- Order Box -->
        <div style="background:#fdf6ee;border:1px solid #f4d4a8;border-radius:10px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 10px;font-size:13px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Order Details</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="color:#78716c;padding:4px 0;">Order ID</td><td style="color:#1c1917;font-weight:600;text-align:right;">#${order._id.toString().slice(-8).toUpperCase()}</td></tr>
            <tr><td style="color:#78716c;padding:4px 0;">Product</td><td style="color:#1c1917;font-weight:600;text-align:right;">${product.title}</td></tr>
            <tr><td style="color:#78716c;padding:4px 0;">Type</td><td style="color:#1c1917;font-weight:600;text-align:right;text-transform:capitalize;">${order.type}</td></tr>
            ${isRent ? `
            <tr><td style="color:#78716c;padding:4px 0;">Start Date</td><td style="color:#1c1917;font-weight:600;text-align:right;">${new Date(order.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</td></tr>
            <tr><td style="color:#78716c;padding:4px 0;">Duration</td><td style="color:#1c1917;font-weight:600;text-align:right;">${order.totalDays} days</td></tr>
            ` : ""}
            <tr><td style="color:#78716c;padding:4px 0;">Total Paid</td><td style="color:#dc7420;font-weight:700;font-size:16px;text-align:right;">₹${order.totalAmount.toLocaleString("en-IN")}</td></tr>
          </table>
        </div>

        <!-- Address -->
        <div style="background:#f5f5f4;border-radius:10px;padding:16px;margin-bottom:24px;">
          <p style="margin:0 0 8px;font-size:13px;color:#57534e;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Delivery Address</p>
          <p style="margin:0;font-size:14px;color:#1c1917;line-height:1.6;">
            ${address.fullName}<br/>
            ${address.line1}${address.line2 ? ", " + address.line2 : ""}<br/>
            ${address.city}, ${address.state} — ${address.pincode}<br/>
            📞 ${address.phone}
          </p>
        </div>

        <!-- Tracking note -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:24px;">
          <p style="margin:0;font-size:14px;color:#166534;">
            🚚 Your order is confirmed and will be delivered soon. You can track your order status at any time on Home Harmony.
          </p>
        </div>

        <p style="font-size:13px;color:#a8a29e;">The PDF receipt is attached to this email for your records.</p>
      </div>

      <!-- Footer -->
      <div style="background:#f5f5f4;padding:20px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#a8a29e;">© ${new Date().getFullYear()} Home Harmony · Built with ❤️ for better living</p>
        <p style="margin:4px 0 0;font-size:12px;color:#a8a29e;">Questions? Email us at support@homeharmony.in</p>
      </div>
    </div>
  `;

  await sendMail({
    to: buyer.email,
    subject: `✅ Order Confirmed — ${product.title} | Home Harmony`,
    html,
    attachments: [
      {
        filename: `receipt-${order._id.toString().slice(-8).toUpperCase()}.pdf`,
        content:  pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
};

// ── New order notification to seller ─────────────────────────────────────────
const sendSellerNotification = async (order, seller, buyer, product) => {
  const html = `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e7e5e4;">
      <div style="background:#1c1917;padding:28px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">🏠 Home Harmony</h1>
        <p style="color:#a8a29e;margin:6px 0 0;font-size:14px;">New Order Received</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#1c1917;font-size:18px;margin:0 0 8px;">Hi ${seller.username}!</h2>
        <p style="color:#78716c;font-size:14px;margin:0 0 24px;">
          You have a new ${order.type} order for your listing <strong>${product.title}</strong>.
        </p>
        <div style="background:#fdf6ee;border:1px solid #f4d4a8;border-radius:10px;padding:20px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="color:#78716c;padding:4px 0;">Order ID</td><td style="color:#1c1917;font-weight:600;text-align:right;">#${order._id.toString().slice(-8).toUpperCase()}</td></tr>
            <tr><td style="color:#78716c;padding:4px 0;">Buyer</td><td style="color:#1c1917;font-weight:600;text-align:right;">${buyer.username}</td></tr>
            <tr><td style="color:#78716c;padding:4px 0;">Amount</td><td style="color:#dc7420;font-weight:700;text-align:right;">₹${order.totalAmount.toLocaleString("en-IN")}</td></tr>
          </table>
        </div>
      </div>
      <div style="background:#f5f5f4;padding:20px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#a8a29e;">© ${new Date().getFullYear()} Home Harmony</p>
      </div>
    </div>
  `;

  await sendMail({
    to: seller.email,
    subject: `🛍️ New Order for "${product.title}" | Home Harmony`,
    html,
  });
};

// ── Order status update to buyer ──────────────────────────────────────────────
const sendStatusUpdate = async (order, buyer, product) => {
  const statusMessages = {
    confirmed:  { emoji: "✅", text: "Your order has been confirmed!" },
    in_transit: { emoji: "🚚", text: "Your order is on its way!" },
    delivered:  { emoji: "📦", text: "Your order has been delivered!" },
    cancelled:  { emoji: "❌", text: "Your order has been cancelled." },
  };

  const msg = statusMessages[order.status] || { emoji: "📋", text: "Your order status has been updated." };

  const html = `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e7e5e4;">
      <div style="background:#dc7420;padding:28px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">🏠 Home Harmony</h1>
        <p style="color:#fde8d0;margin:6px 0 0;font-size:14px;">Order Status Update</p>
      </div>
      <div style="padding:32px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">${msg.emoji}</div>
        <h2 style="color:#1c1917;margin:0 0 8px;">${msg.text}</h2>
        <p style="color:#78716c;font-size:14px;">Order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong> — ${product.title}</p>
      </div>
      <div style="background:#f5f5f4;padding:20px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#a8a29e;">© ${new Date().getFullYear()} Home Harmony</p>
      </div>
    </div>
  `;

  await sendMail({
    to: buyer.email,
    subject: `${msg.emoji} Order Update — ${product.title} | Home Harmony`,
    html,
  });
};

// ── OTP email ─────────────────────────────────────────────────────────────────
const sendOtpEmail = async (email, otp) => {
  const html = `
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e7e5e4;">
      <div style="background:#dc7420;padding:28px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">🏠 Home Harmony</h1>
        <p style="color:#fde8d0;margin:6px 0 0;font-size:14px;">Password Reset</p>
      </div>
      <div style="padding:32px;text-align:center;">
        <h2 style="color:#1c1917;margin:0 0 8px;">Your OTP Code</h2>
        <p style="color:#78716c;font-size:14px;margin:0 0 24px;">Use this code to reset your password. It expires in <strong>10 minutes</strong>.</p>
        <div style="background:#fdf6ee;border:2px dashed #f4d4a8;border-radius:12px;padding:24px;display:inline-block;margin-bottom:24px;">
          <span style="font-size:36px;font-weight:700;color:#dc7420;letter-spacing:10px;">${otp}</span>
        </div>
        <p style="color:#a8a29e;font-size:13px;">If you didn't request this, please ignore this email.</p>
      </div>
      <div style="background:#f5f5f4;padding:20px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#a8a29e;">© ${new Date().getFullYear()} Home Harmony</p>
      </div>
    </div>
  `;

  await sendMail({
    to: email,
    subject: "🔑 Your OTP for Password Reset — Home Harmony",
    html,
  });
};

module.exports = {
  sendMail,
  sendOrderConfirmation,
  sendSellerNotification,
  sendStatusUpdate,
  sendOtpEmail,
};