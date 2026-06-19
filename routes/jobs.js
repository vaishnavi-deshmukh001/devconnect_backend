// routes/jobs.js
const express = require('express');
const router  = express.Router();
const { createJob, getAllJobs, getJobById, getMyJobs, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',              getAllJobs);                           // Public - search & browse
router.get('/my/posted',     protect, authorize('recruiter'), getMyJobs);  // Recruiter: my jobs
router.get('/:id',           getJobById);                          // Public - single job
router.post('/',             protect, authorize('recruiter'), createJob);
router.put('/:id',           protect, authorize('recruiter'), updateJob);
router.delete('/:id',        protect, authorize('recruiter'), deleteJob);

module.exports = router;
