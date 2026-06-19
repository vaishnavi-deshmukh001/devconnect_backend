// ============================================================
// DEVCONNECT - Application Model
// Tracks a candidate's application to a job
// ============================================================
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // ── Application Status Pipeline ──────────────────────────
  // Applied → Under Review → Shortlisted → Rejected
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Rejected'],
    default: 'Applied',
  },

  // ── Candidate's cover letter / message ───────────────────
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter cannot exceed 1000 characters'],
    default: null,
  },

  // ── Resume at time of application ────────────────────────
  resumeUrl: {
    type: String,
    default: null,
  },

  // ── Recruiter notes (only visible to recruiter) ───────────
  recruiterNotes: {
    type: String,
    default: null,
  },

  appliedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// ── Prevent duplicate applications ───────────────────────────
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

// ── Index for fast queries ────────────────────────────────────
applicationSchema.index({ candidate: 1, appliedAt: -1 });
applicationSchema.index({ recruiter: 1, appliedAt: -1 });
applicationSchema.index({ job: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
