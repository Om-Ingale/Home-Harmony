const PDFDocument = require("pdfkit");

const generateReceipt = (order, buyer, product, address) => {
  return new Promise((resolve, reject) => {
    const doc  = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    doc.on("data",  chunk => chunks.push(chunk));
    doc.on("end",   ()    => resolve(Buffer.concat(chunks)));
    doc.on("error", err   => reject(err));

    const orange = "#dc7420";
    const dark   = "#1c1917";
    const muted  = "#78716c";
    const light  = "#f5f5f4";

    // ── Header bar ─────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill(orange);
    doc.fillColor("#fff")
       .font("Helvetica-Bold")
       .fontSize(22)
       .text("Home Harmony", 50, 25);
    doc.font("Helvetica")
       .fontSize(11)
       .text("Rent · Buy · Sell Furniture & Appliances", 50, 52);

    // Receipt label (top right)
    doc.fontSize(10)
       .text("PAYMENT RECEIPT", doc.page.width - 180, 30, { width: 130, align: "right" });
    doc.fontSize(9)
       .text(`#${order._id.toString().slice(-8).toUpperCase()}`, doc.page.width - 180, 48, { width: 130, align: "right" });

    // ── Order meta ──────────────────────────────────────────────────────────
    doc.fillColor(dark).font("Helvetica-Bold").fontSize(13).text("Order Details", 50, 110);
    doc.moveTo(50, 128).lineTo(doc.page.width - 50, 128).strokeColor("#e7e5e4").lineWidth(1).stroke();

    const col1 = 50, col2 = 300;
    let y = 140;

    const row = (label, value, bold = false) => {
      doc.fillColor(muted).font("Helvetica").fontSize(10).text(label, col1, y);
      doc.fillColor(dark).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10).text(value, col2, y);
      y += 22;
    };

    row("Order ID",     `#${order._id.toString().slice(-8).toUpperCase()}`);
    row("Order Date",   new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }));
    row("Payment ID",   order.paymentId || "—");
    row("Order Type",   order.type.charAt(0).toUpperCase() + order.type.slice(1));
    row("Status",       order.status.replace("_", " ").toUpperCase());

    // ── Product details ─────────────────────────────────────────────────────
    y += 10;
    doc.fillColor(dark).font("Helvetica-Bold").fontSize(13).text("Product", col1, y);
    y += 18;
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor("#e7e5e4").lineWidth(1).stroke();
    y += 12;

    row("Product Name", product.title);
    row("Category",     product.category.charAt(0).toUpperCase() + product.category.slice(1));

    if (order.type === "rent") {
      row("Start Date", new Date(order.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }));
      row("End Date",   new Date(order.endDate).toLocaleDateString("en-IN",   { day: "numeric", month: "long", year: "numeric" }));
      row("Duration",   `${order.totalDays} days`);
    }

    // ── Delivery address ────────────────────────────────────────────────────
    y += 10;
    doc.fillColor(dark).font("Helvetica-Bold").fontSize(13).text("Delivery Address", col1, y);
    y += 18;
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor("#e7e5e4").lineWidth(1).stroke();
    y += 12;

    doc.fillColor(dark).font("Helvetica").fontSize(10);
    doc.text(address.fullName,  col1, y); y += 18;
    doc.text(address.line1 + (address.line2 ? ", " + address.line2 : ""), col1, y); y += 18;
    doc.text(`${address.city}, ${address.state} — ${address.pincode}`, col1, y); y += 18;
    doc.text(`Phone: ${address.phone}`, col1, y); y += 30;

    // ── Pricing breakdown ───────────────────────────────────────────────────
    doc.fillColor(dark).font("Helvetica-Bold").fontSize(13).text("Pricing", col1, y);
    y += 18;
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor("#e7e5e4").lineWidth(1).stroke();
    y += 12;

    const subtotal = Math.round(order.totalAmount / 1.18);
    const tax      = order.totalAmount - subtotal;

    row("Subtotal",  `₹${subtotal.toLocaleString("en-IN")}`);
    row("GST (18%)", `₹${tax.toLocaleString("en-IN")}`);

    // Total box
    y += 4;
    doc.rect(col1, y, doc.page.width - 100, 36).fill(orange);
    doc.fillColor("#fff").font("Helvetica-Bold").fontSize(13)
       .text("Total Paid", col1 + 16, y + 11)
       .text(`₹${order.totalAmount.toLocaleString("en-IN")}`, col2, y + 11);
    y += 52;

    // ── Footer ──────────────────────────────────────────────────────────────
    doc.rect(0, doc.page.height - 60, doc.page.width, 60).fill(light);
    doc.fillColor(muted).font("Helvetica").fontSize(9)
       .text("Thank you for choosing Home Harmony!", 50, doc.page.height - 42, { align: "center", width: doc.page.width - 100 });
    doc.text("support@homeharmony.in  |  homeharmony.in", 50, doc.page.height - 26, { align: "center", width: doc.page.width - 100 });

    doc.end();
  });
};

module.exports = { generateReceipt };