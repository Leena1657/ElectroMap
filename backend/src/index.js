import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seed.js';

import authRoutes from './routes/authRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount Modular Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/admin', adminRoutes);

// Connect to Database and Seed
connectDB().then(() => {
  seedDatabase();
  app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
});
