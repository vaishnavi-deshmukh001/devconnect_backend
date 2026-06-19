// ============================================================
// DEVCONNECT - User Model
// Supports 2 roles: 'recruiter' and 'candidate'
// ============================================================
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Never return password in queries
  },
  role: {
    type: String,
    enum: ['recruiter', 'candidate'],
    required: [true, 'Role is required'],
  },

  // ── Recruiter-specific fields ────────────────────────────
  company: {
    type: String,
    trim: true,
    default: null,
  },
  companyWebsite: {
    type: String,
    default: null,
  },

  // ── Candidate-specific fields ────────────────────────────
  skills: {
    type: [String],
    default: [],
  },
  resumeUrl: {
    type: String,
    default: null,
  },
  resumePublicId: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: null,
  },
  location: {
    type: String,
    default: null,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// ── Hash password before saving ───────────────────────────────
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Compare passwords ─────────────────────────────────────────
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Remove sensitive data from JSON output ────────────────────
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
