const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// Update payment status
// PUT /api/payments/:vehicleId/status
router.put('/:vehicleId/status', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { paymentStatus, paymentId } = req.body;

    if (!paymentStatus || !['unpaid', 'paid', 'processing'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const updateData = { paymentStatus };
    
    if (paymentId) {
      updateData.paymentId = paymentId;
    }
    
    if (paymentStatus === 'paid') {
      updateData.paidAt = new Date();
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      updateData,
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle record not found' });
    }

    res.json({ 
      success: true, 
      vehicle,
      message: `Payment status updated to ${paymentStatus}` 
    });
  } catch (err) {
    console.error('Payment status update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment status for a vehicle
// GET /api/payments/:vehicleId/status
router.get('/:vehicleId/status', async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findById(vehicleId).select('paymentStatus paymentId paidAt fine');

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle record not found' });
    }

    res.json({ 
      success: true, 
      paymentStatus: vehicle.paymentStatus,
      paymentId: vehicle.paymentId,
      paidAt: vehicle.paidAt,
      fine: vehicle.fine
    });
  } catch (err) {
    console.error('Payment status fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
