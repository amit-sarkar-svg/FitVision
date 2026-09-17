const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../utils/auth');

const protect = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication token is required.' });
  }

  const token = authorization.slice(7).trim();
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token is required.' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.userId).select('_id role');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication user no longer exists.' });
    }

    req.user = { id: user._id.toString(), role: user.role };
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Authentication token has expired.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Authentication token is invalid.' });
    }
    return next(error);
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access is required.' });
  }

  return next();
};

module.exports = { protect, requireAdmin };
