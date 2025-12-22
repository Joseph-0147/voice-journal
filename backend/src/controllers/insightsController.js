const db = require('../database/db');

/**
 * Insights Controller
 * Handles analytics and insights operations
 */

const insightsController = {
  /**
   * Get all action items
   */
  async getActionItems(req, res) {
    try {
      const userId = req.user.id;
      const { completed } = req.query;

      let query = `
        SELECT ai.*, je.created_at as entry_date
        FROM action_items ai
        JOIN journal_entries je ON ai.entry_id = je.id
        WHERE je.user_id = $1
      `;
      const params = [userId];

      if (completed !== undefined) {
        query += ' AND ai.completed = $2';
        params.push(completed === 'true');
      }

      query += ' ORDER BY ai.completed ASC, je.created_at DESC';

      const result = await db.query(query, params);

      res.json({
        success: true,
        actionItems: result.rows,
        count: result.rowCount,
      });
    } catch (error) {
      console.error('Get action items error:', error);
      res.status(500).json({
        error: 'Failed to fetch action items',
        message: error.message,
      });
    }
  },

  /**
   * Toggle action item completion
   */
  async toggleActionItem(req, res) {
    try {
      const userId = req.user.id;
      const itemId = req.params.id;

      // Verify ownership
      const ownershipCheck = await db.query(
        `SELECT ai.id, ai.completed
        FROM action_items ai
        JOIN journal_entries je ON ai.entry_id = je.id
        WHERE ai.id = $1 AND je.user_id = $2`,
        [itemId, userId]
      );

      if (ownershipCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Action item not found' });
      }

      const currentStatus = ownershipCheck.rows[0].completed;

      // Toggle completion
      const result = await db.query(
        `UPDATE action_items
        SET completed = $1, completed_at = $2
        WHERE id = $3
        RETURNING *`,
        [!currentStatus, !currentStatus ? new Date() : null, itemId]
      );

      res.json({
        success: true,
        actionItem: result.rows[0],
      });
    } catch (error) {
      console.error('Toggle action item error:', error);
      res.status(500).json({
        error: 'Failed to toggle action item',
        message: error.message,
      });
    }
  },

  /**
   * Get audio milestones
   */
  async getMilestones(req, res) {
    try {
      const userId = req.user.id;
      const { type, limit = 20 } = req.query;

      let query = `
        SELECT am.*, je.created_at as entry_date
        FROM audio_milestones am
        JOIN journal_entries je ON am.entry_id = je.id
        WHERE je.user_id = $1
      `;
      const params = [userId];

      if (type) {
        query += ' AND am.type = $2';
        params.push(type);
        query += ' ORDER BY je.created_at DESC LIMIT $3';
        params.push(limit);
      } else {
        query += ' ORDER BY je.created_at DESC LIMIT $2';
        params.push(limit);
      }

      const result = await db.query(query, params);

      res.json({
        success: true,
        milestones: result.rows,
        count: result.rowCount,
      });
    } catch (error) {
      console.error('Get milestones error:', error);
      res.status(500).json({
        error: 'Failed to fetch milestones',
        message: error.message,
      });
    }
  },

  /**
   * Get weekly summary
   */
  async getWeeklySummary(req, res) {
    try {
      const userId = req.user.id;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Get entry count and total duration
      const entriesResult = await db.query(
        `SELECT 
          COUNT(*) as entry_count,
          COALESCE(SUM(duration), 0) as total_duration,
          COALESCE(AVG(duration), 0) as avg_duration
        FROM journal_entries
        WHERE user_id = $1 AND created_at >= $2`,
        [userId, oneWeekAgo]
      );

      // Get sentiment breakdown
      const sentimentResult = await db.query(
        `SELECT 
          analysis->'sentiment'->>'overall' as sentiment,
          COUNT(*) as count
        FROM journal_entries
        WHERE user_id = $1 AND created_at >= $2 AND analysis IS NOT NULL
        GROUP BY analysis->'sentiment'->>'overall'`,
        [userId, oneWeekAgo]
      );

      // Get top themes
      const themesResult = await db.query(
        `SELECT 
          theme->>'name' as name,
          COUNT(*) as count
        FROM journal_entries,
        jsonb_array_elements(analysis->'themes') as theme
        WHERE user_id = $1 AND created_at >= $2 AND analysis IS NOT NULL
        GROUP BY theme->>'name'
        ORDER BY count DESC
        LIMIT 5`,
        [userId, oneWeekAgo]
      );

      // Get streak info
      const streakResult = await db.query(
        `SELECT current_streak, longest_streak
        FROM user_streaks
        WHERE user_id = $1`,
        [userId]
      );

      // Calculate sentiment summary
      const sentimentBreakdown = {};
      let dominantSentiment = 'neutral';
      let maxCount = 0;

      sentimentResult.rows.forEach(row => {
        sentimentBreakdown[row.sentiment] = parseInt(row.count);
        if (parseInt(row.count) > maxCount) {
          maxCount = parseInt(row.count);
          dominantSentiment = row.sentiment;
        }
      });

      // Calculate theme percentages
      const totalThemeCount = themesResult.rows.reduce(
        (sum, row) => sum + parseInt(row.count),
        0
      );
      const topThemes = themesResult.rows.map(row => ({
        name: row.name,
        count: parseInt(row.count),
        percentage: totalThemeCount > 0 
          ? Math.round((parseInt(row.count) / totalThemeCount) * 100)
          : 0,
      }));

      const entryData = entriesResult.rows[0];
      const streakData = streakResult.rows[0] || { current_streak: 0, longest_streak: 0 };

      res.json({
        success: true,
        summary: {
          entryCount: parseInt(entryData.entry_count),
          totalMinutes: Math.round(parseFloat(entryData.total_duration)),
          averageDuration: Math.round(parseFloat(entryData.avg_duration) * 10) / 10,
          sentiment: {
            overall: this.getSentimentLabel(dominantSentiment),
            breakdown: sentimentBreakdown,
          },
          topThemes,
          streak: parseInt(streakData.current_streak),
          longestStreak: parseInt(streakData.longest_streak),
        },
      });
    } catch (error) {
      console.error('Get weekly summary error:', error);
      res.status(500).json({
        error: 'Failed to fetch weekly summary',
        message: error.message,
      });
    }
  },

  /**
   * Get monthly analytics
   */
  async getMonthlyAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const { year, month } = req.query;

      if (!year || !month) {
        return res.status(400).json({
          error: 'Missing parameters',
          message: 'Year and month are required',
        });
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // Get basic stats
      const statsResult = await db.query(
        `SELECT 
          COUNT(*) as entry_count,
          COALESCE(SUM(duration), 0) as total_duration
        FROM journal_entries
        WHERE user_id = $1 AND created_at BETWEEN $2 AND $3`,
        [userId, startDate, endDate]
      );

      // Get daily sentiment trend
      const sentimentTrend = await db.query(
        `SELECT 
          DATE(created_at) as date,
          analysis->'sentiment'->>'overall' as sentiment
        FROM journal_entries
        WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
        ORDER BY created_at`,
        [userId, startDate, endDate]
      );

      // Get theme distribution
      const themeDistribution = await db.query(
        `SELECT 
          theme->>'name' as name,
          COUNT(*) as count
        FROM journal_entries,
        jsonb_array_elements(analysis->'themes') as theme
        WHERE user_id = $1 AND created_at BETWEEN $2 AND $3
        GROUP BY theme->>'name'
        ORDER BY count DESC`,
        [userId, startDate, endDate]
      );

      // Get action items stats
      const actionItemsResult = await db.query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed
        FROM action_items ai
        JOIN journal_entries je ON ai.entry_id = je.id
        WHERE je.user_id = $1 AND je.created_at BETWEEN $2 AND $3`,
        [userId, startDate, endDate]
      );

      const stats = statsResult.rows[0];
      const actionItems = actionItemsResult.rows[0];

      res.json({
        success: true,
        analytics: {
          entryCount: parseInt(stats.entry_count),
          totalMinutes: Math.round(parseFloat(stats.total_duration)),
          sentimentTrend: sentimentTrend.rows,
          themeDistribution: Object.fromEntries(
            themeDistribution.rows.map(row => [row.name, parseInt(row.count)])
          ),
          completedActionItems: parseInt(actionItems.completed) || 0,
          totalActionItems: parseInt(actionItems.total) || 0,
        },
      });
    } catch (error) {
      console.error('Get monthly analytics error:', error);
      res.status(500).json({
        error: 'Failed to fetch monthly analytics',
        message: error.message,
      });
    }
  },

  /**
   * Search transcripts
   */
  async searchTranscripts(req, res) {
    try {
      const userId = req.user.id;
      const { q, startDate, endDate } = req.query;

      if (!q) {
        return res.status(400).json({
          error: 'Missing query',
          message: 'Search query (q) is required',
        });
      }

      let query = `
        SELECT 
          id,
          transcript,
          created_at,
          ts_rank(to_tsvector('english', transcript), plainto_tsquery('english', $2)) as rank
        FROM journal_entries
        WHERE user_id = $1
        AND to_tsvector('english', transcript) @@ plainto_tsquery('english', $2)
      `;
      const params = [userId, q];

      if (startDate) {
        query += ' AND created_at >= $' + (params.length + 1);
        params.push(new Date(startDate));
      }

      if (endDate) {
        query += ' AND created_at <= $' + (params.length + 1);
        params.push(new Date(endDate));
      }

      query += ' ORDER BY rank DESC, created_at DESC LIMIT 20';

      const result = await db.query(query, params);

      // Extract relevant excerpts
      const results = result.rows.map(row => {
        const searchTerm = q.toLowerCase();
        const transcript = row.transcript.toLowerCase();
        const index = transcript.indexOf(searchTerm);
        
        let excerpt = row.transcript;
        if (index !== -1) {
          const start = Math.max(0, index - 50);
          const end = Math.min(row.transcript.length, index + searchTerm.length + 50);
          excerpt = (start > 0 ? '...' : '') + 
                    row.transcript.substring(start, end) + 
                    (end < row.transcript.length ? '...' : '');
        }

        return {
          id: row.id,
          entryId: row.id,
          excerpt,
          matchScore: parseFloat(row.rank),
          createdAt: row.created_at,
        };
      });

      res.json({
        success: true,
        results,
        count: results.length,
      });
    } catch (error) {
      console.error('Search transcripts error:', error);
      res.status(500).json({
        error: 'Search failed',
        message: error.message,
      });
    }
  },

  /**
   * Helper: Get sentiment label
   */
  getSentimentLabel(sentiment) {
    const labels = {
      positive: 'Mostly Positive',
      negative: 'Mostly Negative',
      neutral: 'Neutral',
      mixed: 'Mixed Emotions',
    };
    return labels[sentiment] || 'Neutral';
  },
};

module.exports = insightsController;
