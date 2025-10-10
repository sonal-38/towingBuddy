require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/towtrack';

async function seedTowingData() {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Sample towing records for MH12AB1234
    const towingRecords = [
      {
        plateNumber: 'MH12AB1234',
        towedFrom: 'Airport Road, Near Terminal 2',
        towedTo: 'City Central Depot, Gate No. 3, Parking Bay A-12',
        fine: 2500,
        reason: 'No Parking Zone Violation',
        paymentStatus: 'unpaid',
        owner: {
          name: 'Ravi Kumar',
          phone: '+919876543210',
          model: 'Hero Splendor'
        }
      },
      {
        plateNumber: 'MH12AB1234',
        towedFrom: 'Mall Parking, Sector 15',
        towedTo: 'North Depot, Building B, Floor 2',
        fine: 1500,
        reason: 'Overtime Parking',
        paymentStatus: 'paid',
        paymentId: 'PAY-123456789',
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        owner: {
          name: 'Ravi Kumar',
          phone: '+919876543210',
          model: 'Hero Splendor'
        }
      },
      {
        plateNumber: 'KA05MN9876',
        towedFrom: 'Bus Stop, MG Road',
        towedTo: 'South Depot, Warehouse Section, Bay 5',
        fine: 3000,
        reason: 'Blocking Public Transport',
        owner: {
          name: 'Priya Sharma',
          phone: '+919876543211',
          model: 'Honda Activa'
        }
      }
    ];

    // Clear existing records for these vehicles
    await Vehicle.deleteMany({ plateNumber: { $in: ['MH12AB1234', 'KA05MN9876'] } });
    console.log('Cleared existing towing records');

    // Insert new records
    for (const record of towingRecords) {
      const vehicle = new Vehicle(record);
      await vehicle.save();
      console.log(`Added towing record for ${record.plateNumber}`);
    }

    console.log('Towing data seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding towing data:', err);
    process.exit(1);
  }
}

seedTowingData();
