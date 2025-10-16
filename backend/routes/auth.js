const express = require('express');
const bcrypt = require('bcrypt');
const Owner = require('../models/Owner');
const Otp = require('../models/Otp');
const Admin = require('../models/Admin');
const { sendTowingSMS } = require('../lib/sms');

const router = express.Router();

function normalizePlate(p) {
  if (!p) return '';
  return String(p).replace(/\s+/g, '').toUpperCase();
}

// POST /api/auth/request-otp
// body: { vehicleNumber }
router.post('/request-otp', async (req, res) => {
  try {
    const { vehicleNumber } = req.body;
    if (!vehicleNumber) return res.status(400).json({ error: 'vehicleNumber is required' });

    const plate = normalizePlate(vehicleNumber);
    const owner = await Owner.findOne({ plateNumber: plate }).lean();
    if (!owner || !owner.phone) {
      return res.status(404).json({ error: 'Owner not found for this vehicle' });
    }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const saltRounds = 10;
    const otpHash = await bcrypt.hash(otp, saltRounds);

    const ttlMinutes = parseInt(process.env.OTP_TTL_MINUTES || '7', 10);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    // upsert OTP document for this plate
    await Otp.findOneAndUpdate(
      { plateNumber: plate },
      { otpHash, expiresAt, attempts: 0, createdAt: new Date() },
      { upsert: true, new: true },
    );

    // Send SMS with short OTP message. Use a compact template to avoid trial account segment issues.
    const shortTemplate = `Your OTP for TowingBuddy is {otp}. It will expire in ${ttlMinutes} minutes.`;

    // sendTowingSMS expects (toNumber, ownerName, vehicleNumber, towingInfo, overrideMessage)
    // we'll pass overrideMessage with {otp} placeholder replaced.
    const overrideMessage = shortTemplate.replace('{otp}', otp);

    // fire-and-forget
    sendTowingSMS(owner.phone, owner.ownerName || 'Owner', plate, {}, overrideMessage)
      .then(() => console.log('OTP SMS attempted'))
      .catch(err => console.error('OTP SMS error', err));

    return res.json({ ok: true, message: 'OTP sent if owner phone is registered' });
  } catch (err) {
    console.error('request-otp error', err);
    return res.status(500).json({ error: 'internal' });
  }
});

// POST /api/auth/verify-otp
// body: { vehicleNumber, otp }
router.post('/verify-otp', async (req, res) => {
  try {
    const { vehicleNumber, otp } = req.body;
    if (!vehicleNumber || !otp) return res.status(400).json({ error: 'vehicleNumber and otp are required' });

    const plate = normalizePlate(vehicleNumber);
    const record = await Otp.findOne({ plateNumber: plate });
    if (!record) return res.status(400).json({ error: 'No OTP requested for this vehicle' });

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ error: 'OTP expired' });
    }

    const ok = await bcrypt.compare(String(otp), record.otpHash);
    if (!ok) {
      record.attempts = (record.attempts || 0) + 1;
      await record.save();
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP valid — consume it
    await Otp.deleteOne({ _id: record._id });

    // Find towing records for this plate (most recent first)
    // Lazy-require to avoid cycle
    // eslint-disable-next-line global-require
    const Vehicle = require('../models/Vehicle');
    const vehicles = await Vehicle.find({ plateNumber: plate }).sort({ createdAt: -1 }).lean();

    return res.json({ ok: true, vehicles });
  } catch (err) {
    console.error('verify-otp error', err);
    return res.status(500).json({ error: 'internal' });
  }
});

// POST /api/auth/admin-login
// body: { email, password }
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await admin.verifyPassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    // For now return a simple success indicator. You can extend to issue JWTs if needed.
    return res.json({ ok: true, email: admin.email, role: admin.role });
  } catch (err) {
    console.error('admin-login error', err);
    return res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;

