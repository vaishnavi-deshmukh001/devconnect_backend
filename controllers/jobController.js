// ============================================================
// DEVCONNECT - Job Controller
// Recruiter: create/edit/delete  |  Candidate: search/view
// ============================================================
const Job = require('../models/Job');

// ── @POST /api/jobs ───────────────────────────────────────────
// Private (recruiter) | Post a new job
const createJob = async (req, res) => {
  try {
    const { title, company, description, requirements, skills, location, jobType, experienceLevel, salary, deadline } = req.body;

    const job = await Job.create({
      title, company, description,
      requirements: requirements || [],
      skills,
      location,
      jobType,
      experienceLevel,
      salary,
      deadline,
      postedBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Job posted successfully!', job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/jobs ────────────────────────────────────────────
// Public | Get all active jobs with search + filter + pagination
const getAllJobs = async (req, res) => {
  try {
    const { search, location, jobType, experienceLevel, skills, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    // Keyword search (title, description, company)
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (location)        query.location        = { $regex: location, $options: 'i' };
    if (jobType)         query.jobType         = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;

    // Skills filter: find jobs that require ANY of the given skills
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);
    const jobs  = await Job.find(query)
      .populate('postedBy', 'name company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      jobs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/jobs/:id ────────────────────────────────────────
// Public | Get single job details
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name company companyWebsite');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/jobs/my/posted ──────────────────────────────────
// Private (recruiter) | Get all jobs posted by this recruiter
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @PUT /api/jobs/:id ────────────────────────────────────────
// Private (recruiter) | Edit a job (only owner can edit)
const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    // Only the recruiter who posted can edit
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this job.' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Job updated successfully!', job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @DELETE /api/jobs/:id ─────────────────────────────────────
// Private (recruiter) | Delete a job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this job.' });
    }

    await job.deleteOne();
    res.json({ success: true, message: 'Job deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createJob, getAllJobs, getJobById, getMyJobs, updateJob, deleteJob };
