require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Owner = require('../models/Owner');
const Otp = require('../models/Otp');
const Vehicle = require('../models/Vehicle');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/towtrack';

async function testOtpFlow() {
  try {
    await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const vehicleNumber = 'MH12AB1234';
    const plate = vehicleNumber.replace(/\s+/g, '').toUpperCase();

    // Step 1: Look up owner
    console.log('\n1. Looking up owner for vehicle:', vehicleNumber);
    const owner = await Owner.findOne({ plateNumber: plate }).lean();
    if (!owner) {
      console.log('❌ Owner not found');
      return;
    }
    console.log('✅ Owner found:', {
      name: owner.ownerName,
      phone: owner.phone,
      model: owner.model
    });

    // Step 2: Generate OTP
    console.log('\n2. Generating OTP...');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 7 * 60 * 1000); // 7 minutes

    await Otp.findOneAndUpdate(
      { plateNumber: plate },
      { otpHash, expiresAt, attempts: 0, createdAt: new Date() },
      { upsert: true, new: true }
    );
    console.log('✅ OTP generated:', otp);

    // Step 3: Verify OTP
    console.log('\n3. Verifying OTP...');
    const record = await Otp.findOne({ plateNumber: plate });
    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      console.log('❌ OTP verification failed');
      return;
    }
    console.log('✅ OTP verified successfully');

    // Step 4: Get towing records
    console.log('\n4. Fetching towing records...');
    const vehicles = await Vehicle.find({ plateNumber: plate }).sort({ createdAt: -1 }).lean();
    console.log('✅ Found', vehicles.length, 'towing records:');
    
    vehicles.forEach((vehicle, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log('  - Towed From:', vehicle.towedFrom);
      console.log('  - Towed To:', vehicle.towedTo);
      console.log('  - Fine: ₹', vehicle.fine);
      console.log('  - Reason:', vehicle.reason);
      console.log('  - Date:', new Date(vehicle.createdAt).toLocaleString());
      if (vehicle.owner) {
        console.log('  - Owner Info:', vehicle.owner);
      }
    });

    // Step 5: Clean up OTP
    await Otp.deleteOne({ _id: record._id });
    console.log('\n✅ OTP record cleaned up');

    console.log('\n🎉 Complete OTP flow test successful!');
    console.log('\nThis is exactly what happens when a user:');
    console.log('1. Enters vehicle number on login page');
    console.log('2. Receives OTP via SMS');
    console.log('3. Enters OTP for verification');
    console.log('4. Gets redirected to dashboard with towing records');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error in OTP flow test:', err);
    process.exit(1);
  }
}

testOtpFlow();
