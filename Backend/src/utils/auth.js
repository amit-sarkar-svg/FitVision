const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Add it to your .env file.');
  }

  return process.env.JWT_SECRET;
};

const createToken = (user) =>
  jwt.sign({ userId: user._id.toString(), role: user.role }, getJwtSecret(), {
    expiresIn: '7d',
  });

const safeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

module.exports = { createToken, getJwtSecret, safeUser };
