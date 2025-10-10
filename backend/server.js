require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const vehiclesRouter = require('./routes/vehicles');
const ownersRouter = require('./routes/owners');
const authRouter = require('./routes/auth');
const paymentsRouter = require('./routes/payments');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/towtrack';

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/vehicles', vehiclesRouter);
app.use('/api/owners', ownersRouter);
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
