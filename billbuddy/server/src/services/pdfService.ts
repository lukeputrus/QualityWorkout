import PDFDocument from "pdfkit";
import type { Response } from "express";
import { formatCurrencyCents } from "@billbuddy/shared";

interface InvoicePdfInput {
  firm: { name: string; address: string | null; email: string | null; phone: string | null };
  client: { name: string; address: string | null; email: string | null };
  invoice: {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    status: string;
    subtotalCents: number;
    taxCents: number;
    totalCents: number;
    amountPaidCents: number;
    notes: string | null;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    rateCents: number;
    amountCents: number;
    type: string;
  }>;
}

export function streamInvoicePdf(res: Response, data: InvoicePdfInput) {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${data.invoice.invoiceNumber}.pdf"`
  );
  doc.pipe(res);

  doc.fontSize(20).text(data.firm.name, { continued: false });
  doc.fontSize(9).fillColor("#555");
  if (data.firm.address) doc.text(data.firm.address);
  if (data.firm.email) doc.text(data.firm.email);
  if (data.firm.phone) doc.text(data.firm.phone);
  doc.moveDown(1.5);

  doc.fillColor("#000").fontSize(16).text(`Invoice ${data.invoice.invoiceNumber}`);
  doc.fontSize(10).fillColor("#333");
  doc.text(`Issue date: ${data.invoice.issueDate}`);
  doc.text(`Due date: ${data.invoice.dueDate}`);
  doc.text(`Status: ${data.invoice.status.toUpperCase()}`);
  doc.moveDown();

  doc.fontSize(11).fillColor("#000").text("Bill to:");
  doc.fontSize(10).fillColor("#333").text(data.client.name);
  if (data.client.address) doc.text(data.client.address);
  if (data.client.email) doc.text(data.client.email);
  doc.moveDown(1.5);

  const tableTop = doc.y;
  const col = { desc: 50, qty: 320, rate: 390, amount: 470 };
  doc.fontSize(10).fillColor("#000");
  doc.text("Description", col.desc, tableTop);
  doc.text("Qty", col.qty, tableTop);
  doc.text("Rate", col.rate, tableTop);
  doc.text("Amount", col.amount, tableTop);
  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

  let y = tableTop + 22;
  doc.fontSize(9).fillColor("#333");
  for (const li of data.lineItems) {
    const rateLabel =
      li.type === "time" ? `${formatCurrencyCents(li.rateCents)}/hr` : formatCurrencyCents(li.rateCents);
    doc.text(li.description, col.desc, y, { width: 260 });
    doc.text(String(li.quantity), col.qty, y);
    doc.text(rateLabel, col.rate, y);
    doc.text(formatCurrencyCents(li.amountCents), col.amount, y);
    y += 20;
  }

  doc.moveTo(50, y + 4).lineTo(545, y + 4).stroke();
  y += 14;
  doc.fontSize(10).fillColor("#000");
  doc.text("Subtotal", col.rate, y);
  doc.text(formatCurrencyCents(data.invoice.subtotalCents), col.amount, y);
  y += 16;
  doc.text("Tax", col.rate, y);
  doc.text(formatCurrencyCents(data.invoice.taxCents), col.amount, y);
  y += 16;
  doc.font("Helvetica-Bold");
  doc.text("Total", col.rate, y);
  doc.text(formatCurrencyCents(data.invoice.totalCents), col.amount, y);
  y += 16;
  doc.font("Helvetica");
  doc.text("Paid", col.rate, y);
  doc.text(formatCurrencyCents(data.invoice.amountPaidCents), col.amount, y);
  y += 16;
  doc.font("Helvetica-Bold");
  doc.text("Balance due", col.rate, y);
  doc.text(
    formatCurrencyCents(data.invoice.totalCents - data.invoice.amountPaidCents),
    col.amount,
    y
  );

  if (data.invoice.notes) {
    doc.moveDown(3).font("Helvetica").fontSize(9).fillColor("#555").text(data.invoice.notes);
  }

  doc.end();
}
