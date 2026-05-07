const Invoice  = require('../models/Invoice');
const Customer = require('../models/Customer');

// Snapshot customer fields onto invoice so data survives customer edits/deletes
async function attachCustomer(invoiceData) {
  if (invoiceData.customerId) {
    const customer = await Customer.findById(invoiceData.customerId);
    if (customer) {
      invoiceData.customerFirstName = customer.firstName;
      invoiceData.customerLastName  = customer.lastName;
      invoiceData.customerName      = `${customer.firstName} ${customer.lastName}`;
      invoiceData.customerEmail     = customer.email || '';
    }
  }
  return invoiceData;
}

// GET /api/invoices/next-number
exports.nextNumber = async (req, res) => {
  try {
    const last = await Invoice.findOne().sort({ createdAt: -1 }).select('invoiceNumber');
    let next = 1;
    if (last && last.invoiceNumber) {
      const num = parseInt(last.invoiceNumber.replace(/\D/g, ''), 10);
      if (!isNaN(num)) next = num + 1;
    }
    res.json({ success: true, number: String(next).padStart(3, '0') });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/invoices
exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.customer) filter.customerId = req.query.customer;
    if (req.query.status)   filter.status     = req.query.status;

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/invoices/:id
exports.getOne = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/invoices
exports.create = async (req, res) => {
  try {
    let data = { ...req.body };
    data = await attachCustomer(data);
    const invoice = await Invoice.create(data);
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/invoices/:id
exports.update = async (req, res) => {
  try {
    let data = { ...req.body };
    data = await attachCustomer(data);
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    res.json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/invoices/:id
exports.delete = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    res.json({ success: true, message: 'Invoice deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
