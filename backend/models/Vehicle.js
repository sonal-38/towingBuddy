const mongoose = require('mongoose');

/**
 * Minimal Vehicle schema - only the fields requested:
 * - plateNumber (Vehicle Number) *
 * - towedFrom (Towed From) *
 * - towedTo (Towed To) *
 * - fine (Fine Amount) optional
 * - reason (Violation Reason) *
 */
const vehicleSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true, trim: true, uppercase: true, index: true },
    towedFrom: { type: String, required: true, trim: true },
    towedTo: { type: String, required: true, trim: true },
    fine: { type: Number, default: 0 },
    reason: { type: String, required: true, trim: true },
    owner: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      model: { type: String, trim: true },
    },
    paymentStatus: { 
      type: String, 
      enum: ['unpaid', 'paid', 'processing'], 
      default: 'unpaid' 
    },
    paymentId: { type: String, trim: true },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

// normalize plate number before save (remove spaces and uppercase)
vehicleSchema.pre('save', function (next) {
  if (this.plateNumber) {
    this.plateNumber = this.plateNumber.replace(/\s+/g, '').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
