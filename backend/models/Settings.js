const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Business Info
  businessName: { type: String, default: 'Backcountry Landscape Construction' },
  ownerName:    { type: String, default: '' },
  address:      { type: String, default: '' },
  city:         { type: String, default: '' },
  state:        { type: String, default: '' },
  zip:          { type: String, default: '' },
  phone:        { type: String, default: '' },
  email:        { type: String, default: '' },
  website:      { type: String, default: '' },
  taxId:        { type: String, default: '' },

  // Invoice defaults
  invoicePrefix:   { type: String, default: '' },
  defaultTerms:    { type: String, default: 'Payment is due within 30 days.' },
  defaultTaxRate:  { type: Number, default: 0 },

  updatedAt: { type: Date, default: Date.now }
});

settingsSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Settings', settingsSchema);
