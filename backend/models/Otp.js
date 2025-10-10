const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Normalize plate number before save
OtpSchema.pre('save', function preSave(next) {
  if (this.plateNumber) {
    this.plateNumber = String(this.plateNumber).replace(/\s+/g, '').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Otp', OtpSchema);
