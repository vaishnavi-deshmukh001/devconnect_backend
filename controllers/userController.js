// ============================================================
// DEVCONNECT - User Controller
// Profile updates and resume upload
// ============================================================
const User       = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// ── @PUT /api/users/profile ───────────────────────────────────
// Private | Update profile (works for both roles)
const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, skills, company, companyWebsite } = req.body;

    const updateData = { name };
    if (req.user.role === 'candidate') {
      if (bio)      updateData.bio      = bio;
      if (location) updateData.location = location;
      if (skills)   updateData.skills   = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
    }
    if (req.user.role === 'recruiter') {
      if (company)        updateData.company        = company;
      if (companyWebsite) updateData.companyWebsite = companyWebsite;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Profile updated successfully!', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @POST /api/users/resume ───────────────────────────────────
// Private (candidate) | Upload/replace resume PDF to Cloudinary
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    // Delete old resume from Cloudinary if it exists
    if (req.user.resumePublicId) {
      await cloudinary.uploader.destroy(req.user.resumePublicId, { resource_type: 'raw' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        resumeUrl:      req.file.path,
        resumePublicId: req.file.filename,
      },
      { new: true }
    );

    res.json({ success: true, message: 'Resume uploaded successfully!', resumeUrl: user.resumeUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/users/:id ───────────────────────────────────────
// Public | Get a user's public profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resumePublicId');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { updateProfile, uploadResume, getUserProfile };
