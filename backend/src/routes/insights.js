const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const insightsController = require('../controllers/insightsController');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/insights/action-items
 * @desc    Get all action items for the authenticated user
 * @access  Private
 */
router.get('/action-items', insightsController.getActionItems);

/**
 * @route   PUT /api/insights/action-items/:id/toggle
 * @desc    Toggle action item completion status
 * @access  Private
 */
router.put('/action-items/:id/toggle', insightsController.toggleActionItem);

/**
 * @route   GET /api/insights/milestones
 * @desc    Get audio milestones for the authenticated user
 * @access  Private
 */
router.get('/milestones', insightsController.getMilestones);

/**
 * @route   GET /api/insights/weekly-summary
 * @desc    Get weekly summary statistics
 * @access  Private
 */
router.get('/weekly-summary', insightsController.getWeeklySummary);

/**
 * @route   GET /api/insights/monthly-analytics
 * @desc    Get monthly analytics
 * @access  Private
 */
router.get('/monthly-analytics', insightsController.getMonthlyAnalytics);

/**
 * @route   GET /api/insights/search
 * @desc    Search through journal transcripts
 * @access  Private
 */
router.get('/search', insightsController.searchTranscripts);

module.exports = router;
