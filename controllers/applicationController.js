// ============================================================
// DEVCONNECT - Application Controller
// Candidate: apply/track | Recruiter: view/update status
// ============================================================
const Application = require('../models/Application');
const Job         = require('../models/Job');

// ── @POST /api/applications/:jobId ───────────────────────────
// Private (candidate) | Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.jobId;

    // Check job exists and is active
    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: 'Job not found or no longer active.' });
    }

    // Check if already applied
    const existing = await Application.findOne({ job: jobId, candidate: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job.' });
    }

    const application = await Application.create({
      job:        jobId,
      candidate:  req.user._id,
      recruiter:  job.postedBy,
      coverLetter,
      resumeUrl:  req.user.resumeUrl, // Use candidate's saved resume
    });

    // Increment application count on job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    res.status(201).json({ success: true, message: 'Application submitted successfully!', application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/applications/my ─────────────────────────────────
// Private (candidate) | Get my applications with status
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user._id })
      .populate('job', 'title company location jobType isActive')
      .sort({ appliedAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/applications/job/:jobId ─────────────────────────
// Private (recruiter) | Get all applications for a specific job
const getApplicationsForJob = async (req, res) => {
  try {
    // Verify the recruiter owns this job
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email skills location bio resumeUrl')
      .sort({ appliedAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @PUT /api/applications/:id/status ────────────────────────
// Private (recruiter) | Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, recruiterNotes } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    // Only the recruiter for this application can update
    if (application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    application.status         = status;
    application.recruiterNotes = recruiterNotes || application.recruiterNotes;
    await application.save();

    res.json({ success: true, message: `Application marked as ${status}.`, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/applications/recruiter/all ─────────────────────
// Private (recruiter) | Get all applications across all their jobs
const getAllApplicationsForRecruiter = async (req, res) => {
  try {
    const applications = await Application.find({ recruiter: req.user._id })
      .populate('job', 'title company')
      .populate('candidate', 'name email skills location resumeUrl')
      .sort({ appliedAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  getAllApplicationsForRecruiter,
};
