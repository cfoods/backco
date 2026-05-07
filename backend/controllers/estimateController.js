const Estimate = require('../models/Estimate');
const Invoice  = require('../models/Invoice');
const Customer = require('../models/Customer');

async function attachCustomer(data) {
  if (data.customerId) {
    const customer = await Customer.findById(data.customerId);
    if (customer) {
      data.customerFirstName = customer.firstName;
      data.customerLastName  = customer.lastName;
      data.customerName      = `${customer.firstName} ${customer.lastName}`;
      data.customerEmail     = customer.email || '';
    }
  }
  return data;
}

// GET /api/estimates
exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.customer) filter.customerId = req.query.customer;
    const estimates = await Estimate.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: estimates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/estimates/:id
exports.getOne = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) return res.status(404).json({ success: false, message: 'Estimate not found.' });
    res.json({ success: true, data: estimate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/estimates
exports.create = async (req, res) => {
  try {
    let data = { ...req.body };
    data = await attachCustomer(data);
    const estimate = await Estimate.create(data);
    res.status(201).json({ success: true, data: estimate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/estimates/:id
exports.update = async (req, res) => {
  try {
    let data = { ...req.body };
    data = await attachCustomer(data);
    const estimate = await Estimate.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!estimate) return res.status(404).json({ success: false, message: 'Estimate not found.' });
    res.json({ success: true, data: estimate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/estimates/:id
exports.delete = async (req, res) => {
  try {
    const estimate = await Estimate.findByIdAndDelete(req.params.id);
    if (!estimate) return res.status(404).json({ success: false, message: 'Estimate not found.' });
    res.json({ success: true, message: 'Estimate deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/estimates/:id/convert  — converts estimate into a new invoice
exports.convert = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) return res.status(404).json({ success: false, message: 'Estimate not found.' });
    if (estimate.convertedToInvoice) {
      return res.status(400).json({ success: false, message: 'Already converted to an invoice.', invoiceId: estimate.invoiceId });
    }

    // Get next invoice number
    const last = await Invoice.findOne().sort({ createdAt: -1 }).select('invoiceNumber');
    let nextNum = 1;
    if (last && last.invoiceNumber) {
      const n = parseInt(last.invoiceNumber.replace(/\D/g, ''), 10);
      if (!isNaN(n)) nextNum = n + 1;
    }

    const invoice = await Invoice.create({
      invoiceNumber:     String(nextNum).padStart(3, '0'),
      customerId:        estimate.customerId,
      customerFirstName: estimate.customerFirstName,
      customerLastName:  estimate.customerLastName,
      customerName:      estimate.customerName,
      customerEmail:     estimate.customerEmail,
      date:              new Date(),
      dueDate:           new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status:            'pending',
      jobName:           estimate.jobName,
      lineItems:         estimate.lineItems,
      subtotal:          estimate.subtotal,
      taxRate:           estimate.taxRate,
      discount:          estimate.discount,
      total:             estimate.total,
      notes:             estimate.notes
    });

    // Mark estimate as converted
    estimate.convertedToInvoice = true;
    estimate.invoiceId = invoice._id;
    await estimate.save();

    res.json({ success: true, invoiceId: invoice._id, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
