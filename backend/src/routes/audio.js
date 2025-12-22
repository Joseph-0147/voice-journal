const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const s3Service = require('../services/s3Service');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/audio/signed-url/:entryId
 * @desc    Get a presigned URL for audio playback
 * @access  Private
 */
router.get('/signed-url/:entryId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { entryId } = req.params;
    const { expiresIn = 3600 } = req.query;

    // Get audio URL from database
    const db = require('../database/db');
    const result = await db.query(
      'SELECT audio_url FROM journal_entries WHERE id = $1 AND user_id = $2',
      [entryId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const audioUrl = result.rows[0].audio_url;
    const signedUrl = await s3Service.getSignedUrl(audioUrl, parseInt(expiresIn));

    res.json({
      success: true,
      signedUrl,
      expiresIn: parseInt(expiresIn),
    });
  } catch (error) {
    console.error('Get signed URL error:', error);
    res.status(500).json({
      error: 'Failed to generate signed URL',
      message: error.message,
    });
  }
});

module.exports = router;
