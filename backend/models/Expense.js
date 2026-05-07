const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  date:        { type: Date, default: Date.now },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['materials', 'labor', 'equipment', 'fuel', 'subcontractor', 'other'],
    default: 'other'
  },
  amount: { type: Number, required: true },

  // Optional invoice assignment
  invoiceId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
  invoiceNumber: { type: String, default: '' }, // snapshot

  notes:     { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);
