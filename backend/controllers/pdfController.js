const PDFDocument = require('pdfkit');
const Invoice     = require('../models/Invoice');
const Settings    = require('../models/Settings');
const path        = require('path');
const fs          = require('fs');

// GET /api/invoices/:id/pdf
exports.generatePDF = async (req, res) => {
  try {
    const invoice  = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    let settings = await Settings.findOne();
    if (!settings) settings = {};

    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber || invoice._id}.pdf"`);
    doc.pipe(res);

    // ── Colors & Fonts ──────────────────────────────────────────────────────
    const GREEN  = '#1c3d2e';
    const GRAY   = '#6b7280';
    const LGRAY  = '#f5f5f3';
    const BLACK  = '#1a1a1a';
    const WHITE  = '#ffffff';

    const pageW  = doc.page.width;
    const margin = 50;
    const contentW = pageW - margin * 2;

    // ── Logo ────────────────────────────────────────────────────────────────
    const logoPath = path.join(__dirname, '../../frontend/assets/bradylogo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, margin, margin, { width: 120 });
    } else {
      doc.fontSize(18).fillColor(GREEN).font('Helvetica-Bold')
         .text(settings.businessName || 'Backcountry Landscape Construction', margin, margin);
    }

    // ── Business Info (top right) ────────────────────────────────────────────
    doc.fontSize(9).fillColor(GRAY).font('Helvetica');
    const bizLines = [
      settings.businessName || 'Backcountry Landscape Construction',
      settings.address      || '',
      [settings.city, settings.state, settings.zip].filter(Boolean).join(', '),
      settings.phone        || '',
      settings.email        || ''
    ].filter(Boolean);

    let bizY = margin;
    bizLines.forEach(line => {
      doc.text(line, margin, bizY, { align: 'right', width: contentW });
      bizY += 13;
    });

    // ── "INVOICE" Title ──────────────────────────────────────────────────────
    const titleY = margin + 100;
    doc.fontSize(32).fillColor(GREEN).font('Helvetica-Bold')
       .text('INVOICE', margin, titleY);

    // ── Invoice Meta ─────────────────────────────────────────────────────────
    const metaX = pageW - margin - 200;
    let   metaY = titleY;

    const metaRows = [
      ['Invoice #', invoice.invoiceNumber || '—'],
      ['Date',      invoice.date ? new Date(invoice.date).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }) : '—'],
      ['Due Date',  invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }) : '—'],
      ['Status',    (invoice.status || 'pending').toUpperCase()]
    ];

    metaRows.forEach(([label, value]) => {
      doc.fontSize(9).fillColor(GRAY).font('Helvetica').text(label, metaX, metaY, { width: 80 });
      doc.fontSize(9).fillColor(BLACK).font('Helvetica-Bold').text(value, metaX + 85, metaY, { width: 115 });
      metaY += 16;
    });

    // ── Divider ───────────────────────────────────────────────────────────────
    const divY = titleY + 70;
    doc.moveTo(margin, divY).lineTo(pageW - margin, divY).strokeColor(GREEN).lineWidth(2).stroke();

    // ── Bill To ───────────────────────────────────────────────────────────────
    const billY = divY + 15;
    doc.fontSize(8).fillColor(GRAY).font('Helvetica').text('BILL TO', margin, billY);
    doc.fontSize(12).fillColor(BLACK).font('Helvetica-Bold')
       .text(invoice.customerName || 'No customer', margin, billY + 13);
    if (invoice.customerEmail) {
      doc.fontSize(9).fillColor(GRAY).font('Helvetica')
         .text(invoice.customerEmail, margin, billY + 28);
    }

    if (invoice.jobName) {
      doc.fontSize(8).fillColor(GRAY).font('Helvetica').text('PROJECT', margin + 220, billY);
      doc.fontSize(10).fillColor(BLACK).font('Helvetica-Bold')
         .text(invoice.jobName, margin + 220, billY + 13);
    }

    // ── Line Items Table ──────────────────────────────────────────────────────
    const tableY  = billY + 65;
    const colDesc = margin;
    const colQty  = margin + contentW * 0.50;
    const colRate = margin + contentW * 0.65;
    const colAmt  = margin + contentW * 0.82;

    // Header row
    doc.rect(margin, tableY, contentW, 22).fill(GREEN);
    doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold');
    doc.text('DESCRIPTION',   colDesc + 5, tableY + 7, { width: 200 });
    doc.text('QTY',           colQty,      tableY + 7, { width: 60, align: 'right' });
    doc.text('RATE',          colRate,     tableY + 7, { width: 70, align: 'right' });
    doc.text('AMOUNT',        colAmt,      tableY + 7, { width: 70, align: 'right' });

    let rowY = tableY + 22;
    const lineItems = invoice.lineItems || [];

    lineItems.forEach((item, i) => {
      const rowH = 24;
      if (i % 2 === 0) doc.rect(margin, rowY, contentW, rowH).fill('#f9f9f8');

      doc.fontSize(9).fillColor(BLACK).font('Helvetica')
         .text(item.description || '', colDesc + 5, rowY + 7, { width: contentW * 0.48 });
      doc.text(String(item.qty ?? ''),   colQty,  rowY + 7, { width: 60,  align: 'right' });
      doc.text('$' + (item.rate  || 0).toFixed(2), colRate, rowY + 7, { width: 70,  align: 'right' });
      doc.text('$' + (item.amount|| 0).toFixed(2), colAmt,  rowY + 7, { width: 70,  align: 'right' });

      rowY += rowH;
    });

    // ── Totals ────────────────────────────────────────────────────────────────
    const totalsX = margin + contentW * 0.6;
    const totalsW = contentW * 0.4;
    rowY += 10;

    const totalsRows = [
      ['Subtotal', '$' + (invoice.subtotal || 0).toFixed(2)],
      invoice.taxRate ? [`Tax (${invoice.taxRate}%)`, '$' + ((invoice.subtotal || 0) * (invoice.taxRate / 100)).toFixed(2)] : null,
      invoice.discount ? ['Discount', '-$' + (invoice.discount || 0).toFixed(2)] : null,
    ].filter(Boolean);

    totalsRows.forEach(([label, value]) => {
      doc.fontSize(9).fillColor(GRAY).font('Helvetica').text(label, totalsX, rowY, { width: totalsW * 0.5 });
      doc.fontSize(9).fillColor(BLACK).font('Helvetica').text(value, totalsX + totalsW * 0.5, rowY, { width: totalsW * 0.5, align: 'right' });
      rowY += 16;
    });

    // Total row
    rowY += 4;
    doc.rect(totalsX, rowY, totalsW, 26).fill(GREEN);
    doc.fontSize(10).fillColor(WHITE).font('Helvetica-Bold')
       .text('TOTAL', totalsX + 8, rowY + 8, { width: totalsW * 0.5 });
    doc.text('$' + (invoice.total || 0).toFixed(2), totalsX + totalsW * 0.5, rowY + 8, { width: totalsW * 0.5 - 8, align: 'right' });

    // ── Notes ─────────────────────────────────────────────────────────────────
    if (invoice.notes || settings.defaultTerms) {
      const notesY = rowY + 50;
      doc.moveTo(margin, notesY).lineTo(pageW - margin, notesY).strokeColor('#e5e5e1').lineWidth(1).stroke();
      doc.fontSize(8).fillColor(GRAY).font('Helvetica').text('NOTES & TERMS', margin, notesY + 10);
      doc.fontSize(9).fillColor(BLACK).font('Helvetica')
         .text(invoice.notes || settings.defaultTerms || '', margin, notesY + 23, { width: contentW, lineGap: 3 });
    }

    // ── Thank you footer ──────────────────────────────────────────────────────
    doc.fontSize(9).fillColor(GRAY).font('Helvetica')
       .text('Thank you for your business!', margin, doc.page.height - 50, { align: 'center', width: contentW });

    doc.end();
  } catch (err) {
    console.error('PDF error:', err);
    if (!res.headersSent) res.status(500).json({ success: false, message: 'PDF generation failed.' });
  }
};

// GET /api/estimates/:id/pdf
const Estimate = require('../models/Estimate');

exports.generateEstimatePDF = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) return res.status(404).json({ success: false, message: 'Estimate not found.' });

    let settings = await Settings.findOne();
    if (!settings) settings = {};

    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="estimate-${estimate.estimateNumber || estimate._id}.pdf"`);
    doc.pipe(res);

    const GREEN  = '#1c3d2e';
    const GRAY   = '#6b7280';
    const BLUE   = '#1d4ed8';
    const BLACK  = '#1a1a1a';
    const WHITE  = '#ffffff';
    const pageW  = doc.page.width;
    const margin = 50;
    const contentW = pageW - margin * 2;

    // Logo
    const logoPath = path.join(__dirname, '../../frontend/assets/bradylogo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, margin, margin, { width: 120 });
    } else {
      doc.fontSize(18).fillColor(GREEN).font('Helvetica-Bold')
         .text(settings.businessName || 'Backcountry Landscape Construction', margin, margin);
    }

    // Business info
    doc.fontSize(9).fillColor(GRAY).font('Helvetica');
    const bizLines = [
      settings.businessName || 'Backcountry Landscape Construction',
      settings.address || '',
      [settings.city, settings.state, settings.zip].filter(Boolean).join(', '),
      settings.phone || '',
      settings.email || ''
    ].filter(Boolean);
    let bizY = margin;
    bizLines.forEach(line => { doc.text(line, margin, bizY, { align: 'right', width: contentW }); bizY += 13; });

    // Title
    const titleY = margin + 100;
    doc.fontSize(32).fillColor(BLUE).font('Helvetica-Bold').text('ESTIMATE', margin, titleY);

    // Meta
    const metaX = pageW - margin - 200;
    let metaY = titleY;
    const metaRows = [
      ['Estimate #', estimate.estimateNumber || '—'],
      ['Date',       estimate.date ? new Date(estimate.date).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }) : '—'],
      ['Valid Until', estimate.validUntil ? new Date(estimate.validUntil).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }) : '—'],
    ];
    metaRows.forEach(([label, value]) => {
      doc.fontSize(9).fillColor(GRAY).font('Helvetica').text(label, metaX, metaY, { width: 80 });
      doc.fontSize(9).fillColor(BLACK).font('Helvetica-Bold').text(value, metaX + 85, metaY, { width: 115 });
      metaY += 16;
    });

    // Divider
    const divY = titleY + 70;
    doc.moveTo(margin, divY).lineTo(pageW - margin, divY).strokeColor(BLUE).lineWidth(2).stroke();

    // Bill to
    const billY = divY + 15;
    doc.fontSize(8).fillColor(GRAY).font('Helvetica').text('PREPARED FOR', margin, billY);
    doc.fontSize(12).fillColor(BLACK).font('Helvetica-Bold').text(estimate.customerName || 'No customer', margin, billY + 13);
    if (estimate.customerEmail) doc.fontSize(9).fillColor(GRAY).font('Helvetica').text(estimate.customerEmail, margin, billY + 28);
    if (estimate.jobName) {
      doc.fontSize(8).fillColor(GRAY).font('Helvetica').text('PROJECT', margin + 220, billY);
      doc.fontSize(10).fillColor(BLACK).font('Helvetica-Bold').text(estimate.jobName, margin + 220, billY + 13);
    }

    // Line items table
    const tableY  = billY + 65;
    const colDesc = margin;
    const colQty  = margin + contentW * 0.50;
    const colRate = margin + contentW * 0.65;
    const colAmt  = margin + contentW * 0.82;

    doc.rect(margin, tableY, contentW, 22).fill(BLUE);
    doc.fontSize(8).fillColor(WHITE).font('Helvetica-Bold');
    doc.text('DESCRIPTION', colDesc + 5, tableY + 7, { width: 200 });
    doc.text('QTY',  colQty,  tableY + 7, { width: 60,  align: 'right' });
    doc.text('RATE', colRate, tableY + 7, { width: 70,  align: 'right' });
    doc.text('AMOUNT', colAmt, tableY + 7, { width: 70, align: 'right' });

    let rowY = tableY + 22;
    (estimate.lineItems || []).forEach((item, i) => {
      const rowH = 24;
      if (i % 2 === 0) doc.rect(margin, rowY, contentW, rowH).fill('#f9f9f8');
      doc.fontSize(9).fillColor(BLACK).font('Helvetica')
         .text(item.description || '', colDesc + 5, rowY + 7, { width: contentW * 0.48 });
      doc.text(String(item.qty ?? ''), colQty,  rowY + 7, { width: 60, align: 'right' });
      doc.text('$' + (item.rate   || 0).toFixed(2), colRate, rowY + 7, { width: 70, align: 'right' });
      doc.text('$' + (item.amount || 0).toFixed(2), colAmt,  rowY + 7, { width: 70, align: 'right' });
      rowY += rowH;
    });

    // Totals
    const totalsX = margin + contentW * 0.6;
    const totalsW = contentW * 0.4;
    rowY += 10;

    const totalsRows = [
      ['Subtotal', '$' + (estimate.subtotal || 0).toFixed(2)],
      estimate.taxRate ? [`Tax (${estimate.taxRate}%)`, '$' + ((estimate.subtotal || 0) * (estimate.taxRate / 100)).toFixed(2)] : null,
      estimate.discount ? ['Discount', '-$' + (estimate.discount || 0).toFixed(2)] : null,
    ].filter(Boolean);

    totalsRows.forEach(([label, value]) => {
      doc.fontSize(9).fillColor(GRAY).font('Helvetica').text(label, totalsX, rowY, { width: totalsW * 0.5 });
      doc.fontSize(9).fillColor(BLACK).font('Helvetica').text(value, totalsX + totalsW * 0.5, rowY, { width: totalsW * 0.5, align: 'right' });
      rowY += 16;
    });

    rowY += 4;
    doc.rect(totalsX, rowY, totalsW, 26).fill(BLUE);
    doc.fontSize(10).fillColor(WHITE).font('Helvetica-Bold')
       .text('ESTIMATE TOTAL', totalsX + 8, rowY + 8, { width: totalsW * 0.5 });
    doc.text('$' + (estimate.total || 0).toFixed(2), totalsX + totalsW * 0.5, rowY + 8, { width: totalsW * 0.5 - 8, align: 'right' });

    // Notes
    if (estimate.notes) {
      const notesY = rowY + 50;
      doc.moveTo(margin, notesY).lineTo(pageW - margin, notesY).strokeColor('#e5e5e1').lineWidth(1).stroke();
      doc.fontSize(8).fillColor(GRAY).font('Helvetica').text('NOTES', margin, notesY + 10);
      doc.fontSize(9).fillColor(BLACK).font('Helvetica').text(estimate.notes, margin, notesY + 23, { width: contentW, lineGap: 3 });
    }

    doc.fontSize(9).fillColor(GRAY).font('Helvetica')
       .text('Thank you for considering us!', margin, doc.page.height - 50, { align: 'center', width: contentW });

    doc.end();
  } catch (err) {
    console.error('Estimate PDF error:', err);
    if (!res.headersSent) res.status(500).json({ success: false, message: 'PDF generation failed.' });
  }
};
