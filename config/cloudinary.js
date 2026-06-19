// ============================================================
// DEVCONNECT - Cloudinary Config
// Handles resume PDF uploads
// ============================================================
const cloudinary = require('cloudinary').v2;
const multer     = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Storage: uploads to Cloudinary's 'devconnect/resumes' folder ─
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:        'devconnect/resumes',
    resource_type: 'raw',    // raw = non-image files like PDFs
    allowed_formats: ['pdf'],
    public_id: (req, file) => `resume_${req.user._id}_${Date.now()}`,
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

module.exports = { cloudinary, upload };
