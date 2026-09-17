const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createToken, getJwtSecret, safeUser } = require('../utils/auth');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const register = async (req, res) => {
  getJwtSecret();
  const name = String(req.body.name || '').trim();
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }
  if (!emailPattern.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword, role: 'user' });
    return res.status(201).json({ success: true, data: { user: safeUser(user), token: createToken(user) } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Unable to register user.' });
  }
};

const login = async (req, res) => {
  getJwtSecret();
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    return res.status(200).json({ success: true, data: { user: safeUser(user), token: createToken(user) } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to log in.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, data: safeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to retrieve user.' });
  }
};

module.exports = { register, login, getMe };
