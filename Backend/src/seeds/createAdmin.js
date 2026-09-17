require('dotenv').config();

const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

const createAdmin = async () => {
  const name = String(process.env.ADMIN_NAME || '').trim();
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before running this command.');
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters long.');
    process.exitCode = 1;
    return;
  }

  try {
    await connectDB();
    if (await User.exists({ email })) {
      console.error('An account with this email already exists. No admin was created.');
      process.exitCode = 1;
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword, role: 'admin' });
    console.log(`Admin created for ${user.email}.`);
  } catch (error) {
    console.error('Admin creation failed:', error.message);
    process.exitCode = 1;
  } finally {
    await User.db.close();
  }
};

createAdmin();
