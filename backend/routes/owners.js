const express = require('express');
const router = express.Router();
const Owner = require('../models/Owner');

// Lookup owner by plate/vehicle number via query param
// GET /api/owners/lookup?vehicleNumber=MH12AB1234
router.get('/lookup', async (req, res) => {
  try {
    const { vehicleNumber, plateNumber } = req.query;
    const raw = (vehicleNumber || plateNumber || '').toString();
    if (!raw) return res.status(400).json({ error: 'vehicleNumber query parameter is required' });

    const plate = raw.replace(/\s+/g, '').toUpperCase();
    const owner = await Owner.findOne({ plateNumber: plate }).lean();
    if (!owner) return res.status(404).json({ error: 'Owner not found' });
    return res.json({ owner });
  } catch (err) {
    console.error('Owner lookup error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Create or update owner
// POST /api/owners
// body: { plateNumber, ownerName, phone, model }
router.post('/', async (req, res) => {
  try {
    const { plateNumber, ownerName, phone, model } = req.body;
    if (!plateNumber || !ownerName) return res.status(400).json({ error: 'plateNumber and ownerName are required' });
    const plate = plateNumber.toString().replace(/\s+/g, '').toUpperCase();

    const existing = await Owner.findOne({ plateNumber: plate });
    if (existing) {
      existing.ownerName = ownerName;
      existing.phone = phone || existing.phone;
      existing.model = model || existing.model;
      await existing.save();
      return res.json({ owner: existing, updated: true });
    }

    const owner = new Owner({ plateNumber: plate, ownerName, phone, model });
    await owner.save();
    return res.status(201).json({ owner });
  } catch (err) {
    console.error('Owner create error', err);
    // duplicate key
    if (err.code === 11000) return res.status(409).json({ error: 'Owner with this plate already exists' });
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
