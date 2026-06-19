// ============================================================
// DEVCONNECT - Job Model
// Posted by recruiters, applied to by candidates
// ============================================================
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  },
  requirements: {
    type: [String], // Array of requirement strings
    default: [],
  },
  skills: {
    type: [String], // e.g. ['React', 'Node.js', 'MongoDB']
    required: [true, 'At least one skill is required'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    required: [true, 'Job type is required'],
  },
  experienceLevel: {
    type: String,
    enum: ['Fresher', 'Junior', 'Mid-level', 'Senior', 'Lead'],
    required: [true, 'Experience level is required'],
  },
  salary: {
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    currency: { type: String, default: 'INR' },
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  applicationCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true, // Recruiter can deactivate to stop applications
  },
  deadline: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// ── Indexes for fast search ───────────────────────────────────
jobSchema.index({ skills: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ postedBy: 1, createdAt: -1 });
jobSchema.index({ isActive: 1, createdAt: -1 });

// ── Text index for keyword search ─────────────────────────────
jobSchema.index({ title: 'text', description: 'text', company: 'text' });

module.exports = mongoose.model('Job', jobSchema);
