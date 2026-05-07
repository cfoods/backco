const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: { type: String, default: '' },
  qty:         { type: Number, default: 1 },
  rate:        { type: Number, default: 0 },
  amount:      { type: Number, default: 0 }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, trim: true },

  // Customer — store ref + snapshot so data isn't lost if customer is deleted
  customerId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  customerFirstName: { type: String, default: '' },
  customerLastName:  { type: String, default: '' },
  customerName:      { type: String, default: '' }, // full name snapshot
  customerEmail:     { type: String, default: '' },

  date:    { type: Date, default: Date.now },
  dueDate: { type: Date },

  status: {
    type: String,
    enum: ['draft', 'pending', 'paid', 'overdue'],
    default: 'pending'
  },

  jobName:   { type: String, trim: true },
  lineItems: [lineItemSchema],

  subtotal: { type: Number, default: 0 },
  taxRate:  { type: Number, default: 0 },   // percent
  discount: { type: Number, default: 0 },   // dollar amount
  total:    { type: Number, default: 0 },

  notes:     { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

invoiceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
