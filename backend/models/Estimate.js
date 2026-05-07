const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: { type: String, default: '' },
  qty:         { type: Number, default: 1 },
  rate:        { type: Number, default: 0 },
  amount:      { type: Number, default: 0 }
}, { _id: false });

const estimateSchema = new mongoose.Schema({
  estimateNumber: { type: String, trim: true },

  customerId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  customerFirstName: { type: String, default: '' },
  customerLastName:  { type: String, default: '' },
  customerName:      { type: String, default: '' },
  customerEmail:     { type: String, default: '' },

  date:       { type: Date, default: Date.now },
  validUntil: { type: Date },

  jobName:   { type: String, trim: true },
  lineItems: [lineItemSchema],

  subtotal: { type: Number, default: 0 },
  taxRate:  { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total:    { type: Number, default: 0 },

  notes: { type: String, trim: true },

  // Conversion tracking
  convertedToInvoice: { type: Boolean, default: false },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

estimateSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Estimate', estimateSchema);
