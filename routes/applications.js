// routes/applications.js
const express = require('express');
const router  = express.Router();
const {
  applyForJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  getAllApplicationsForRecruiter,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:jobId',           protect, authorize('candidate'),  applyForJob);
router.get('/my',                protect, authorize('candidate'),  getMyApplications);
router.get('/recruiter/all',     protect, authorize('recruiter'),  getAllApplicationsForRecruiter);
router.get('/job/:jobId',        protect, authorize('recruiter'),  getApplicationsForJob);
router.put('/:id/status',        protect, authorize('recruiter'),  updateApplicationStatus);

module.exports = router;
