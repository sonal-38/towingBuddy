const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, trim: true, uppercase: true, index: true, unique: true },
  ownerName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  model: { type: String, trim: true },
}, { timestamps: true });

ownerSchema.pre('save', function(next) {
  if (this.plateNumber) this.plateNumber = this.plateNumber.replace(/\s+/g, '').toUpperCase();
  next();
});

module.exports = mongoose.model('Owner', ownerSchema);
