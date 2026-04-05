const PDFDocument = require("pdfkit");

const generateReceipt = (order, buyer, product, address) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 0, size: "A4" });
        const chunks = [];

        doc.on("data", chunk => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", err => reject(err));

        const W = doc.page.width;   // 595
        const H = doc.page.height;  // 842
        const orange = "#dc7420";
        const dark = "#1c1917";
        const muted = "#78716c";
        const light = "#fdf6ee";
        const border = "#f0e6d3";
        const white = "#ffffff";
        const green = "#16a34a";

        // ══════════════════════════════════════════════════════════════
        // HEADER — full width orange bar
        // ══════════════════════════════════════════════════════════════
        doc.rect(0, 0, W, 110).fill(orange);

        doc.fillColor(white)
            .font("Helvetica-Bold")
            .fontSize(26)
            .text("HomeHarmony", 50, 30);

        doc.fillColor("rgba(255,255,255,0.75)")
            .font("Helvetica")
            .fontSize(10)
            .text("Rent · Buy · Sell Furniture & Appliances", 50, 60);

        doc.fillColor(white)
            .font("Helvetica-Bold")
            .fontSize(11)
            .text("PAYMENT RECEIPT", W - 200, 30, { width: 150, align: "right" });

        const orderId = `#${order._id.toString().slice(-8).toUpperCase()}`;
        doc.roundedRect(W - 200, 50, 150, 28, 6).fill("rgba(255,255,255,0.2)");
        doc.fillColor(white)
            .font("Helvetica-Bold")
            .fontSize(13)
            .text(orderId, W - 200, 58, { width: 150, align: "right" });

        // ══════════════════════════════════════════════════════════════
        // STATUS BADGE
        // ══════════════════════════════════════════════════════════════
        doc.rect(0, 110, W, 44).fill(light);
        doc.circle(62, 132, 8).fill(green);
        doc.fillColor(white).font("Helvetica-Bold").fontSize(9).text("✓", 58, 127);
        doc.fillColor(green).font("Helvetica-Bold").fontSize(11)
            .text("Payment Successful", 78, 126);
        doc.fillColor(muted).font("Helvetica").fontSize(9)
            .text(
                `Paid on ${new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric"
                })}`,
                78, 140
            );
        doc.fillColor(muted).font("Helvetica").fontSize(9)
            .text(`Payment ID: ${order.paymentId || "—"}`, W - 250, 133, { width: 200, align: "right" });

        // ══════════════════════════════════════════════════════════════
        // TWO COLUMN SECTION
        // ══════════════════════════════════════════════════════════════
        let y = 172;
        const col1x = 50, col2x = 320, colW = 225;

        doc.roundedRect(col1x, y, colW, 24, 4).fill(orange);
        doc.roundedRect(col2x, y, colW, 24, 4).fill(dark);
        doc.fillColor(white).font("Helvetica-Bold").fontSize(9)
            .text("ORDER DETAILS", col1x + 10, y + 8);
        doc.fillColor(white).font("Helvetica-Bold").fontSize(9)
            .text("DELIVERY ADDRESS", col2x + 10, y + 8);

        y += 32;

        const colRow = (x, label, value, rowY) => {
            doc.fillColor(muted).font("Helvetica").fontSize(9).text(label, x + 10, rowY);
            doc.fillColor(dark).font("Helvetica-Bold").fontSize(9)
                .text(value, x + 10, rowY + 13, { width: colW - 20 });
        };

        const orderRows = [
            ["Order ID", orderId],
            ["Product", product.title.length > 28 ? product.title.slice(0, 28) + "…" : product.title],
            ["Type", order.type.charAt(0).toUpperCase() + order.type.slice(1)],
            ["Category", product.category.charAt(0).toUpperCase() + product.category.slice(1)],
        ];

        if (order.type === "rent") {
            const dailyRate = Math.round(product.price / 30);
            const monthlyRate = product.price;
            orderRows.push(["Monthly Rate", `₹${monthlyRate.toLocaleString("en-IN")}/month`]);
            orderRows.push(["Daily Rate", `₹${dailyRate.toLocaleString("en-IN")}/day`]);
            orderRows.push(["Start Date", new Date(order.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })]);
            orderRows.push(["End Date", new Date(order.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })]);
            orderRows.push(["Duration", `${order.totalDays} days`]);
        }
        orderRows.push(["Status", order.status.replace("_", " ").toUpperCase()]);

        const addrRows = [
            ["Name", address.fullName],
            ["Phone", address.phone],
            ["Address", address.line1 + (address.line2 ? ", " + address.line2 : "")],
            ["City", address.city],
            ["State", address.state],
            ["Pincode", address.pincode],
        ];

        const maxRows = Math.max(orderRows.length, addrRows.length);
        const rowH = 34;

        for (let i = 0; i < maxRows; i++) {
            const rowY = y + i * rowH;
            const bg = i % 2 === 0 ? white : "#fafaf9";
            doc.rect(col1x, rowY, colW, rowH).fill(bg);
            doc.rect(col2x, rowY, colW, rowH).fill(bg);
            if (orderRows[i]) colRow(col1x, orderRows[i][0], orderRows[i][1], rowY + 4);
            if (addrRows[i]) colRow(col2x, addrRows[i][0], addrRows[i][1], rowY + 4);
        }

        const colsHeight = maxRows * rowH;
        doc.rect(col1x, y, colW, colsHeight).stroke(border).lineWidth(1);
        doc.rect(col2x, y, colW, colsHeight).stroke(border).lineWidth(1);

        // ══════════════════════════════════════════════════════════════
        // PRICING SECTION
        // ══════════════════════════════════════════════════════════════
        y += colsHeight + 24;

        doc.roundedRect(col1x, y, W - 100, 24, 4).fill(dark);
        doc.fillColor(white).font("Helvetica-Bold").fontSize(9)
            .text("PRICING BREAKDOWN", col1x + 10, y + 8);
        y += 32;

        const priceW = W - 100;

        const priceRow = (label, value, bold = false, highlight = false) => {
            if (highlight) {
                doc.rect(col1x, y, priceW, 36).fill(orange);
                doc.fillColor(white).font("Helvetica-Bold").fontSize(13)
                    .text(label, col1x + 16, y + 11)
                    .text(value, col1x, y + 11, { width: priceW - 16, align: "right" });
                y += 36;
            } else {
                doc.rect(col1x, y, priceW, 28).fill(bold ? light : white);
                doc.fillColor(muted).font("Helvetica").fontSize(10)
                    .text(label, col1x + 16, y + 9);
                doc.fillColor(dark).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10)
                    .text(value, col1x, y + 9, { width: priceW - 16, align: "right" });
                doc.rect(col1x, y, priceW, 28).stroke(border).lineWidth(0.5);
                y += 28;
            }
        };

        if (order.type === "rent") {
            const dailyRate = Math.round(product.price / 30);
            const rentalSubtotal = order.totalDays * dailyRate;
            const tax = order.totalAmount - rentalSubtotal;

            priceRow(
                `${order.totalDays} days × ₹${dailyRate.toLocaleString("en-IN")}/day`,
                `₹${rentalSubtotal.toLocaleString("en-IN")}`
            );
            priceRow(
                `Monthly rate reference: ₹${product.price.toLocaleString("en-IN")}/month`,
                "",
                false,
                false
            );
            priceRow("GST (18%)", `₹${tax.toLocaleString("en-IN")}`);
        } else {
            const subtotal = Math.round(order.totalAmount / 1.18);
            const tax = order.totalAmount - subtotal;
            priceRow("Product Price", `₹${subtotal.toLocaleString("en-IN")}`);
            priceRow("GST (18%)", `₹${tax.toLocaleString("en-IN")}`);
        }

        y += 4;
        priceRow("Total Paid", `₹${order.totalAmount.toLocaleString("en-IN")}`, false, true);

        // ══════════════════════════════════════════════════════════════
        // THANK YOU NOTE
        // ══════════════════════════════════════════════════════════════
        y += 20;
        doc.roundedRect(col1x, y, W - 100, 48, 8).fill(light).stroke(border);
        doc.fillColor(orange).font("Helvetica-Bold").fontSize(11)
            .text("Thank you for choosing Home Harmony! 🏠", col1x + 16, y + 10);
        doc.fillColor(muted).font("Helvetica").fontSize(9)
            .text("Questions? Reach us at support@homeharmony.in", col1x + 16, y + 27);

        // ══════════════════════════════════════════════════════════════
        // FOOTER
        // ══════════════════════════════════════════════════════════════
        doc.rect(0, H - 48, W, 48).fill(dark);
        doc.fillColor(white).font("Helvetica-Bold").fontSize(9)
            .text("Home Harmony", 50, H - 34);
        doc.fillColor("rgba(255,255,255,0.5)").font("Helvetica").fontSize(8)
            .text("Rent · Buy · Sell · homeharmony.in", 50, H - 20);
        doc.fillColor("rgba(255,255,255,0.5)").font("Helvetica").fontSize(8)
            .text(
                `© ${new Date().getFullYear()} Home Harmony. All rights reserved.`,
                0, H - 20,
                { width: W - 50, align: "right" }
            );

        doc.end();
    });
};

module.exports = { generateReceipt };
