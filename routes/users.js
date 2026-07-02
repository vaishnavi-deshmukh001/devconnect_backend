// routes/users.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../controllers/userController');
const cloudinary = require('../config/cloudinary');
const { upload } = require('../config/cloudinary');

router.put('/profile',  protect, updateProfile);
router.post('/resume',  protect, authorize('candidate'), upload.single('resume'), uploadResume);
router.get('/:id',      getUserProfile);

module.exports = router;
