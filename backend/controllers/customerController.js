const Customer = require('../models/Customer');
const Invoice  = require('../models/Invoice');

// GET /api/customers
exports.getAll = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ lastName: 1, firstName: 1 });

    // Attach invoice count to each customer
    const withCounts = await Promise.all(customers.map(async (c) => {
      const invoiceCount = await Invoice.countDocuments({ customerId: c._id });
      return { ...c.toObject(), invoiceCount };
    }));

    res.json({ success: true, data: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/customers/:id
exports.getOne = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/customers
exports.create = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, company, address, notes } = req.body;
    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'First and last name are required.' });
    }
    const customer = await Customer.create({ firstName, lastName, email, phone, company, address, notes });
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/customers/:id
exports.update = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, company, address, notes } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, phone, company, address, notes },
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/customers/:id
exports.delete = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
    res.json({ success: true, message: 'Customer deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
