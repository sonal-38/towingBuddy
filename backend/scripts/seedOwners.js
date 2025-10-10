// Run this with: node scripts/seedOwners.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Owner = require('../models/Owner');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';
if (!MONGO_URI) {
  console.error('Please set MONGO_URI in environment or .env');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to mongo');

    const sample = [
      { plateNumber: 'MH12AB1234', ownerName: 'Ravi Kumar', phone: '+919876543210', model: 'Hero Splendor' },
      { plateNumber: 'KA05MN9876', ownerName: 'Sangeeta Rao', phone: '+919812345678', model: 'Suzuki Swift' },
    ];

    for (const item of sample) {
      await Owner.updateOne({ plateNumber: item.plateNumber.replace(/\s+/g, '').toUpperCase() }, { $set: item }, { upsert: true });
      console.log('Upserted', item.plateNumber);
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
