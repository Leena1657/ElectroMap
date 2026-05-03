import { Station } from '../models/Station.js';

export const getAllStations = async (_req, res) => {
  try { res.json(await Station.find()); }
  catch { res.status(500).json({ error: 'Server error' }); }
};

export const getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) { res.status(404).json({ error: 'Station not found' }); return; }
    res.json(station);
  } catch { res.status(500).json({ error: 'Server error' }); }
};
