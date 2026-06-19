// ============================================================
// DEVCONNECT - Auth Controller
// Handles register and login for both roles
// ============================================================
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: Generate JWT ──────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// ── @POST /api/auth/register ──────────────────────────────────
// Public | Register as recruiter or candidate
const register = async (req, res) => {
  try {
    const { name, email, password, role, company, companyWebsite, skills, location, bio } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    // Validate role-specific fields
    if (role === 'recruiter' && !company) {
      return res.status(400).json({ success: false, message: 'Company name is required for recruiters.' });
    }

    const user = await User.create({
      name, email, password, role,
      company:        role === 'recruiter' ? company : undefined,
      companyWebsite: role === 'recruiter' ? companyWebsite : undefined,
      skills:         role === 'candidate' ? (skills || []) : undefined,
      location:       role === 'candidate' ? location : undefined,
      bio:            role === 'candidate' ? bio : undefined,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @POST /api/auth/login ─────────────────────────────────────
// Public | Login with email + password
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Select password explicitly (it's hidden by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/auth/me ─────────────────────────────────────────
// Private | Get current logged-in user
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { register, login, getMe };
