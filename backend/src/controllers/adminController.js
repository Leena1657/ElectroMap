import { User } from '../models/User.js';
import { Station } from '../models/Station.js';

export const getStats = async (_req, res) => {
  try {
    const [totalUsers, totalStations, available, inUse, offline] = await Promise.all([
      User.countDocuments(),
      Station.countDocuments(),
      Station.countDocuments({ status: 'available' }),
      Station.countDocuments({ status: 'in-use' }),
      Station.countDocuments({ status: 'offline' }),
    ]);
    res.json({ totalUsers, totalStations, available, inUse, offline });
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const getUsers = async (_req, res) => {
  try { res.json(await User.find().select('-password')); }
  catch { res.status(500).json({ error: 'Server error' }); }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const createStation = async (req, res) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json(station);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

export const updateStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!station) { res.status(404).json({ error: 'Station not found' }); return; }
    res.json(station);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

export const deleteStation = async (req, res) => {
  try {
    await Station.findByIdAndDelete(req.params.id);
    res.json({ message: 'Station deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
};
