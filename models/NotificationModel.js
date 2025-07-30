const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  link: { type: String }, 
  isRead: { type: Boolean, default: false },
  category: { type: String, enum: ['order', 'promotion', 'account', 'general'], default: 'general'}
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);