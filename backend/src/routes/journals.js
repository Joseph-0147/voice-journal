const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const journalController = require('../controllers/journalController');
const authMiddleware = require('../middleware/auth');

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/wav', 'audio/webm'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  },
});

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/journals
 * @desc    Create a new journal entry with audio
 * @access  Private
 */
router.post(
  '/',
  upload.single('audio'),
  [
    body('tagline').optional().trim().isLength({ max: 40 }),
    body('gradient').optional().trim(),
  ],
  journalController.createEntry
);

/**
 * @route   GET /api/journals
 * @desc    Get all journal entries for the authenticated user
 * @access  Private
 */
router.get('/', journalController.getEntries);

/**
 * @route   GET /api/journals/:id
 * @desc    Get a specific journal entry
 * @access  Private
 */
router.get('/:id', journalController.getEntry);

/**
 * @route   PUT /api/journals/:id
 * @desc    Update a journal entry
 * @access  Private
 */
router.put(
  '/:id',
  [
    body('tagline').optional().trim().isLength({ max: 40 }),
    body('gradient').optional().trim(),
  ],
  journalController.updateEntry
);

/**
 * @route   DELETE /api/journals/:id
 * @desc    Delete a journal entry
 * @access  Private
 */
router.delete('/:id', journalController.deleteEntry);

/**
 * @route   POST /api/journals/:id/process
 * @desc    Trigger AI processing for a journal entry
 * @access  Private
 */
router.post('/:id/process', journalController.processEntry);

module.exports = router;
