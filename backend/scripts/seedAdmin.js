#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/towtrack';

async function main() {
  const email = process.env.ADMIN_EMAIL || process.argv[2];
  const password = process.env.ADMIN_PASSWORD || process.argv[3];

  if (!email || !password) {
    console.error('Usage: ADMIN_EMAIL and ADMIN_PASSWORD via env or args (email password)');
    process.exit(1);
  }

  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });

  const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const admin = new Admin({ email: email.toLowerCase().trim(), passwordHash });
  await admin.save();
  console.log('Created admin:', admin.email);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('seedAdmin error', err);
  process.exit(1);
});
