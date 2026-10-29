const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadTrack,
  getAllTracks,
  getArtistTracks,
  updateTrack,
  deleteTrack
} = require('../controllers/trackController');
const { protect, authorizeRoles } = require('../Middleware/auth.js');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Public browse
router.get('/', getAllTracks);

// Artist-only
router.post('/upload', protect, authorizeRoles('artist'), upload.single('audio'), uploadTrack);
router.get('/my-catalog', protect, authorizeRoles('artist'), getArtistTracks);
router.put('/:id', protect, authorizeRoles('artist'), updateTrack);
router.delete('/:id', protect, authorizeRoles('artist'), deleteTrack);

module.exports = router;
