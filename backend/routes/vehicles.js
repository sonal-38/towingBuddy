const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Owner = require('../models/Owner');

// POST /api/vehicles - add a vehicle (minimal required fields)
router.post('/', async (req, res) => {
  try {
    // Accept either `plateNumber` or `vehicleNumber` from frontend
    const { plateNumber: plateA, vehicleNumber: plateB, towedFrom, towedTo, fine, reason, towedFromCoords, towedToCoords } = req.body;
    const rawPlate = plateA || plateB;

    // Validate required fields
    if (!rawPlate || !towedFrom || !towedTo || !reason) {
      return res.status(400).json({ message: 'plateNumber/vehicleNumber, towedFrom, towedTo and reason are required' });
    }

    const normalized = rawPlate.replace(/\s+/g, '').toUpperCase();

    // Create a new towing record (allow multiple tows for same plate)
    const vehicleData = { plateNumber: normalized, towedFrom, towedTo, fine: Number(fine) || 0, reason };

    // attach coordinates if provided (validate numbers)
    if (towedFromCoords && typeof towedFromCoords === 'object') {
      const lat = Number(towedFromCoords.lat);
      const lon = Number(towedFromCoords.lon);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) vehicleData.towedFromCoords = { lat, lon };
    }
    if (towedToCoords && typeof towedToCoords === 'object') {
      const lat = Number(towedToCoords.lat);
      const lon = Number(towedToCoords.lon);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) vehicleData.towedToCoords = { lat, lon };
    }

    // If owner provided in payload, use it. Otherwise, try to lookup in Owners collection
    if (req.body.owner && req.body.owner.name) {
      vehicleData.owner = {
        name: req.body.owner.name,
        phone: req.body.owner.phone,
        model: req.body.owner.model,
      };

      // Upsert owner into Owners collection so future lookups will find it
      try {
        await Owner.updateOne(
          { plateNumber: normalized },
          { $set: { ownerName: req.body.owner.name, phone: req.body.owner.phone, model: req.body.owner.model } },
          { upsert: true }
        );
      } catch (uerr) {
        console.error('Failed to upsert owner during vehicle POST', uerr);
      }
    } else {
      try {
        const ownerDoc = await Owner.findOne({ plateNumber: normalized }).lean();
        if (ownerDoc) {
          vehicleData.owner = {
            name: ownerDoc.ownerName || ownerDoc.name || '',
            phone: ownerDoc.phone || '',
            model: ownerDoc.model || '',
          };
        }
      } catch (e) {
        console.error('Owner lookup failed during vehicle POST', e);
      }
    }

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();

    // Fire-and-forget SMS notification (if phone available)
    try {
      const { sendTowingSMS } = require('../lib/sms');
      const to = vehicleData.owner?.phone;
      if (to) {
        // do not block response; log outcome
        sendTowingSMS(to, vehicleData.owner.name, normalized, { towedFrom, towedTo, fine: Number(fine) || 0, reason, model: vehicleData.owner.model })
          .then(ok => console.log('SMS send result', ok))
          .catch(err => console.error('SMS send error', err));
      }
    } catch (e) {
      console.error('SMS helper error', e);
    }

    res.status(201).json({ message: 'Vehicle added', vehicle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/vehicles - list vehicles (simple)
router.get('/', async (req, res) => {
  try {
    // pagination: ?limit=10&page=1
    const limit = Math.min(parseInt(req.query.limit || '10', 10) || 10, 100);
    const page = Math.max(parseInt(req.query.page || '1', 10) || 1, 1);
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      Vehicle.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Vehicle.countDocuments(),
    ]);

    res.json({ vehicles, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
