const db = require('../database/db');

/**
 * User Controller
 * Handles user profile and statistics operations
 */

const userController = {
  /**
   * Get user profile with statistics
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      // Get user data
      const userResult = await db.query(
        `SELECT id, email, display_name, profile_image_url, created_at
        FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rowCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];

      // Get statistics
      const statsResult = await db.query(
        `SELECT 
          COUNT(*) as total_entries,
          COALESCE(SUM(duration), 0) as total_minutes
        FROM journal_entries
        WHERE user_id = $1`,
        [userId]
      );

      const streakResult = await db.query(
        `SELECT current_streak, longest_streak
        FROM user_streaks
        WHERE user_id = $1`,
        [userId]
      );

      const stats = statsResult.rows[0];
      const streak = streakResult.rows[0] || { current_streak: 0, longest_streak: 0 };

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          profileImageUrl: user.profile_image_url,
          createdAt: user.created_at,
        },
        stats: {
          totalEntries: parseInt(stats.total_entries),
          totalMinutes: Math.round(parseFloat(stats.total_minutes)),
          currentStreak: parseInt(streak.current_streak),
          longestStreak: parseInt(streak.longest_streak),
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to fetch profile',
        message: error.message,
      });
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { displayName, profileImageUrl } = req.body;

      const updates = [];
      const params = [];
      let paramCount = 1;

      if (displayName !== undefined) {
        updates.push(`display_name = $${paramCount}`);
        params.push(displayName);
        paramCount++;
      }

      if (profileImageUrl !== undefined) {
        updates.push(`profile_image_url = $${paramCount}`);
        params.push(profileImageUrl);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          error: 'No updates provided',
          message: 'At least one field must be provided',
        });
      }

      params.push(userId);

      const result = await db.query(
        `UPDATE users
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramCount}
        RETURNING id, email, display_name, profile_image_url, updated_at`,
        params
      );

      res.json({
        success: true,
        user: result.rows[0],
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        message: error.message,
      });
    }
  },

  /**
   * Get user statistics
   */
  async getStats(req, res) {
    try {
      const userId = req.user.id;

      // Get overall stats
      const overallResult = await db.query(
        `SELECT 
          COUNT(*) as total_entries,
          COALESCE(SUM(duration), 0) as total_duration,
          COALESCE(AVG(duration), 0) as avg_duration,
          MIN(created_at) as first_entry_date,
          MAX(created_at) as last_entry_date
        FROM journal_entries
        WHERE user_id = $1`,
        [userId]
      );

      // Get streak info
      const streakResult = await db.query(
        `SELECT current_streak, longest_streak, last_entry_date
        FROM user_streaks
        WHERE user_id = $1`,
        [userId]
      );

      // Get action items completion rate
      const actionItemsResult = await db.query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed
        FROM action_items ai
        JOIN journal_entries je ON ai.entry_id = je.id
        WHERE je.user_id = $1`,
        [userId]
      );

      // Get most common themes
      const themesResult = await db.query(
        `SELECT 
          theme->>'name' as name,
          COUNT(*) as count
        FROM journal_entries,
        jsonb_array_elements(analysis->'themes') as theme
        WHERE user_id = $1 AND analysis IS NOT NULL
        GROUP BY theme->>'name'
        ORDER BY count DESC
        LIMIT 10`,
        [userId]
      );

      // Get sentiment distribution
      const sentimentResult = await db.query(
        `SELECT 
          analysis->'sentiment'->>'overall' as sentiment,
          COUNT(*) as count
        FROM journal_entries
        WHERE user_id = $1 AND analysis IS NOT NULL
        GROUP BY analysis->'sentiment'->>'overall'`,
        [userId]
      );

      const overall = overallResult.rows[0];
      const streak = streakResult.rows[0] || { current_streak: 0, longest_streak: 0, last_entry_date: null };
      const actionItems = actionItemsResult.rows[0];
      
      const completionRate = parseInt(actionItems.total) > 0
        ? Math.round((parseInt(actionItems.completed) / parseInt(actionItems.total)) * 100)
        : 0;

      res.json({
        success: true,
        stats: {
          overall: {
            totalEntries: parseInt(overall.total_entries),
            totalMinutes: Math.round(parseFloat(overall.total_duration)),
            averageDuration: Math.round(parseFloat(overall.avg_duration) * 10) / 10,
            firstEntryDate: overall.first_entry_date,
            lastEntryDate: overall.last_entry_date,
          },
          streaks: {
            current: parseInt(streak.current_streak),
            longest: parseInt(streak.longest_streak),
            lastEntryDate: streak.last_entry_date,
          },
          actionItems: {
            total: parseInt(actionItems.total) || 0,
            completed: parseInt(actionItems.completed) || 0,
            completionRate,
          },
          topThemes: themesResult.rows.map(row => ({
            name: row.name,
            count: parseInt(row.count),
          })),
          sentimentDistribution: Object.fromEntries(
            sentimentResult.rows.map(row => [row.sentiment, parseInt(row.count)])
          ),
        },
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch statistics',
        message: error.message,
      });
    }
  },
};

module.exports = userController;
