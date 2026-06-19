// routes/users.js
const express = require('express');
const router  = express.Router();
const { updateProfile, uploadResume, getUserProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.put('/profile',  protect, updateProfile);
router.post('/resume',  protect, authorize('candidate'), upload.single('resume'), uploadResume);
router.get('/:id',      getUserProfile);

module.exports = router;
