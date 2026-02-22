# TowTrackEase Backend

This folder contains a minimal Node.js + Express backend for the TowTrackEase project. It provides a simple API to add/list vehicles and is configured to use MongoDB (Atlas or local).

## What I created
- `server.js` - Express server and MongoDB connection
- `models/Vehicle.js` - Mongoose schema for vehicles
- `routes/vehicles.js` - `POST /api/vehicles` and `GET /api/vehicles`
- `.env.example` - example environment variables
- `package.json` - dependencies and scripts

## Setup (local)
1. Copy `.env.example` to `.env` and update `MONGO_URI`.
2. Install dependencies:

```bash
npm install
```

3. Start server:

```bash
npm run dev
```

The server will run on `http://localhost:5000` by default. POST to `http://localhost:5000/api/vehicles` to add a vehicle.

## MongoDB Atlas quick steps
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user (username/password)
3. Whitelist your IP (or 0.0.0.0/0 for testing)
4. Get the connection string and paste into `.env` as `MONGO_URI`

If you want, I can: seed a Super Admin user, add authentication routes, or connect the frontend to this API.

## Seeding sample owners

You can seed a couple of sample owner records for testing. Make sure your `.env` has `MONGO_URI` set, then run:

- node scripts/seedOwners.js

This will upsert two sample owners (`MHAB1234`, `KA05MN9876`) so you can test the auto-fill feature from the frontend.
