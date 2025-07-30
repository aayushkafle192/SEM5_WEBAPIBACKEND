const mongoose = require('mongoose');

const deliveryLocationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  district: { type: String, required: true },
  description: { type: String },
  code: { type: String },
  fare: { type: Number, required: true },
});

deliveryLocationSchema.index({ district: 1 });

module.exports = mongoose.model('DeliveryLocation', deliveryLocationSchema);