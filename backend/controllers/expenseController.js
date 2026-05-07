const Expense = require('../models/Expense');
const Invoice = require('../models/Invoice');

// GET /api/expenses
exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.invoice)  filter.invoiceId = req.query.invoice;
    if (req.query.category) filter.category  = req.query.category;

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/expenses/:id
exports.getOne = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/expenses
exports.create = async (req, res) => {
  try {
    const { date, description, category, amount, invoiceId, notes } = req.body;
    if (!description || amount === undefined) {
      return res.status(400).json({ success: false, message: 'Description and amount are required.' });
    }

    // Snapshot invoice number if assigned
    let invoiceNumber = '';
    if (invoiceId) {
      const inv = await Invoice.findById(invoiceId).select('invoiceNumber');
      if (inv) invoiceNumber = inv.invoiceNumber;
    }

    const expense = await Expense.create({ date, description, category, amount, invoiceId: invoiceId || null, invoiceNumber, notes });
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/expenses/:id
exports.update = async (req, res) => {
  try {
    const { date, description, category, amount, invoiceId, notes } = req.body;

    let invoiceNumber = '';
    if (invoiceId) {
      const inv = await Invoice.findById(invoiceId).select('invoiceNumber');
      if (inv) invoiceNumber = inv.invoiceNumber;
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { date, description, category, amount, invoiceId: invoiceId || null, invoiceNumber, notes },
      { new: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/expenses/:id
exports.delete = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
    res.json({ success: true, message: 'Expense deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
