const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const userController = require('../controllers/userController');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile with statistics
 * @access  Private
 */
router.get('/profile', userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', userController.updateProfile);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', userController.getStats);

module.exports = router;
