import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Station } from '../models/Station.js';

export const seedDatabase = async () => {
  try {
    // Seed stations only if empty
    const count = await Station.countDocuments();
    if (count === 0) {
      await Station.insertMany([
        { name: 'Tata Power EV – Indiranagar', distance: '1.2 km', availableConnectors: 4, totalConnectors: 6, price: '₹18/kWh', isFast: true, status: 'available', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938cb?auto=format&fit=crop&q=80&w=250&h=250', lat: 12.9784, lng: 77.6408 },
        { name: 'ChargeZone – Phoenix Marketcity', distance: '3.5 km', availableConnectors: 2, totalConnectors: 8, price: '₹16/kWh', isFast: false, status: 'available', image: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?auto=format&fit=crop&q=80&w=250&h=250', lat: 12.9965, lng: 77.6960 },
        { name: 'Ather Grid – Koramangala', distance: '2.1 km', availableConnectors: 6, totalConnectors: 6, price: '₹14/kWh', isFast: true, status: 'available', image: 'https://images.unsplash.com/photo-1647414343164-92161b369c9c?auto=format&fit=crop&q=80&w=250&h=250', lat: 12.9352, lng: 77.6245 },
        { name: 'BSES EV Hub – BKC', distance: '4.8 km', availableConnectors: 0, totalConnectors: 10, price: '₹20/kWh', isFast: true, status: 'in-use', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938cb?auto=format&fit=crop&q=80&w=250&h=250', lat: 19.0596, lng: 72.8656 },
        { name: 'Tata Power – Andheri West', distance: '6.2 km', availableConnectors: 3, totalConnectors: 4, price: '₹18/kWh', isFast: false, status: 'available', image: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?auto=format&fit=crop&q=80&w=250&h=250', lat: 19.1364, lng: 72.8296 },
        { name: 'DMRC Fast Charger – Connaught Place', distance: '2.0 km', availableConnectors: 5, totalConnectors: 8, price: '₹15/kWh', isFast: true, status: 'available', image: 'https://images.unsplash.com/photo-1647414343164-92161b369c9c?auto=format&fit=crop&q=80&w=250&h=250', lat: 28.6315, lng: 77.2167 },
        { name: 'Kazam EV – Dwarka Sector 10', distance: '8.0 km', availableConnectors: 1, totalConnectors: 4, price: '₹13/kWh', isFast: false, status: 'available', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938cb?auto=format&fit=crop&q=80&w=250&h=250', lat: 28.5921, lng: 77.0463 },
        { name: 'ChargeZone – HITEC City', distance: '3.0 km', availableConnectors: 4, totalConnectors: 6, price: '₹17/kWh', isFast: true, status: 'available', image: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?auto=format&fit=crop&q=80&w=250&h=250', lat: 17.4435, lng: 78.3772 },
      ]);
      console.log('🌱 Seeded 8 Indian EV stations');
    }

    // Seed test user
    const hp = await bcrypt.hash('password123', 10);
    await User.findOneAndUpdate(
      { email: 'test@example.com' },
      { name: 'Test User', email: 'test@example.com', password: hp, isAdmin: false },
      { upsert: true, new: true }
    );
    console.log('👤 Test user → test@example.com / password123');

    // Seed admin user
    const adminPwd = await bcrypt.hash('admin123', 10);
    await User.findOneAndUpdate(
      { email: 'admin@electromap.com' },
      { name: 'Admin', email: 'admin@electromap.com', password: adminPwd, isAdmin: true },
      { upsert: true, new: true }
    );
    console.log('🔑 Admin user → admin@electromap.com / admin123');
  } catch (err) {
    console.error('❌ Database seeding error:', err);
  }
};
