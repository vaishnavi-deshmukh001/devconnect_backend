// ============================================================
// DEVCONNECT - Auth Middleware
// Verifies JWT token and optionally checks user role
// ============================================================
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Protect: verifies JWT, attaches req.user ─────────────────
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please login.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// ── Role Guard: restrict to specific roles ───────────────────
// Usage: authorize('recruiter') or authorize('candidate')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${roles.join(' or ')} can perform this action.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
