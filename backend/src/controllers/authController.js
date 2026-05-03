import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-electromap-key';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) { res.status(400).json({ error: 'User already exists' }); return; }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: newUser });
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' }); return;
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET, { expiresIn: '7d' }
    );
    res.json({ token, user });
  } catch { res.status(500).json({ error: 'Server error' }); }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ user });
  } catch { res.status(500).json({ error: 'Server error' }); }
};
