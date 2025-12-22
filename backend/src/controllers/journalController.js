const { validationResult } = require('express-validator');
const openaiService = require('../services/openaiService');
const s3Service = require('../services/s3Service');
const db = require('../database/db');

/**
 * Journal Controller
 * Handles all journal entry operations
 */

const journalController = {
  /**
   * Create a new journal entry
   */
  async createEntry(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Audio file is required' });
      }

      const userId = req.user.id;
      const { tagline, gradient } = req.body;

      // Upload audio to S3
      const audioUrl = await s3Service.uploadAudio(
        req.file.buffer,
        `${userId}/${Date.now()}_${req.file.originalname}`
      );

      // Process audio with AI
      const aiResult = await openaiService.processJournalEntry(
        req.file.buffer,
        req.file.originalname
      );

      // Save to database
      const entry = await db.query(
        `INSERT INTO journal_entries 
        (user_id, audio_url, tagline, gradient, transcript, duration, analysis, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
        RETURNING *`,
        [
          userId,
          audioUrl,
          tagline || 'A moment of clarity',
          gradient || 'default',
          aiResult.transcript,
          aiResult.duration,
          JSON.stringify(aiResult.analysis),
        ]
      );

      // Save action items
      if (aiResult.analysis.actionItems) {
        for (const item of aiResult.analysis.actionItems) {
          await db.query(
            `INSERT INTO action_items (entry_id, task, priority, context, completed) 
            VALUES ($1, $2, $3, $4, false)`,
            [entry.rows[0].id, item.task, item.priority, item.context]
          );
        }
      }

      // Save milestones
      if (aiResult.analysis.audioMilestones) {
        for (const milestone of aiResult.analysis.audioMilestones) {
          await db.query(
            `INSERT INTO audio_milestones (entry_id, type, description, excerpt, significance) 
            VALUES ($1, $2, $3, $4, $5)`,
            [
              entry.rows[0].id,
              milestone.type,
              milestone.description,
              milestone.excerpt,
              milestone.significance,
            ]
          );
        }
      }

      res.status(201).json({
        success: true,
        entry: entry.rows[0],
        transcript: aiResult.transcript,
        analysis: aiResult.analysis,
      });
    } catch (error) {
      console.error('Create entry error:', error);
      res.status(500).json({
        error: 'Failed to create journal entry',
        message: error.message,
      });
    }
  },

  /**
   * Get all journal entries for a user
   */
  async getEntries(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 50, offset = 0, order = 'DESC' } = req.query;

      const entries = await db.query(
        `SELECT * FROM journal_entries 
        WHERE user_id = $1 
        ORDER BY created_at ${order} 
        LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      res.json({
        success: true,
        entries: entries.rows,
        count: entries.rowCount,
      });
    } catch (error) {
      console.error('Get entries error:', error);
      res.status(500).json({
        error: 'Failed to fetch journal entries',
        message: error.message,
      });
    }
  },

  /**
   * Get a specific journal entry
   */
  async getEntry(req, res) {
    try {
      const userId = req.user.id;
      const entryId = req.params.id;

      const entry = await db.query(
        `SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2`,
        [entryId, userId]
      );

      if (entry.rowCount === 0) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }

      // Get associated action items and milestones
      const actionItems = await db.query(
        `SELECT * FROM action_items WHERE entry_id = $1`,
        [entryId]
      );

      const milestones = await db.query(
        `SELECT * FROM audio_milestones WHERE entry_id = $1`,
        [entryId]
      );

      res.json({
        success: true,
        entry: entry.rows[0],
        actionItems: actionItems.rows,
        milestones: milestones.rows,
      });
    } catch (error) {
      console.error('Get entry error:', error);
      res.status(500).json({
        error: 'Failed to fetch journal entry',
        message: error.message,
      });
    }
  },

  /**
   * Update a journal entry
   */
  async updateEntry(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const entryId = req.params.id;
      const { tagline, gradient } = req.body;

      const result = await db.query(
        `UPDATE journal_entries 
        SET tagline = COALESCE($1, tagline), 
            gradient = COALESCE($2, gradient),
            updated_at = NOW()
        WHERE id = $3 AND user_id = $4 
        RETURNING *`,
        [tagline, gradient, entryId, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }

      res.json({
        success: true,
        entry: result.rows[0],
      });
    } catch (error) {
      console.error('Update entry error:', error);
      res.status(500).json({
        error: 'Failed to update journal entry',
        message: error.message,
      });
    }
  },

  /**
   * Delete a journal entry
   */
  async deleteEntry(req, res) {
    try {
      const userId = req.user.id;
      const entryId = req.params.id;

      // Get entry to delete audio file from S3
      const entry = await db.query(
        `SELECT audio_url FROM journal_entries WHERE id = $1 AND user_id = $2`,
        [entryId, userId]
      );

      if (entry.rowCount === 0) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }

      // Delete from S3
      await s3Service.deleteAudio(entry.rows[0].audio_url);

      // Delete from database (cascade will delete related records)
      await db.query(
        `DELETE FROM journal_entries WHERE id = $1 AND user_id = $2`,
        [entryId, userId]
      );

      res.json({
        success: true,
        message: 'Journal entry deleted successfully',
      });
    } catch (error) {
      console.error('Delete entry error:', error);
      res.status(500).json({
        error: 'Failed to delete journal entry',
        message: error.message,
      });
    }
  },

  /**
   * Manually trigger AI processing for an entry
   */
  async processEntry(req, res) {
    try {
      const userId = req.user.id;
      const entryId = req.params.id;

      const entry = await db.query(
        `SELECT * FROM journal_entries WHERE id = $1 AND user_id = $2`,
        [entryId, userId]
      );

      if (entry.rowCount === 0) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }

      // Download audio from S3
      const audioBuffer = await s3Service.downloadAudio(entry.rows[0].audio_url);

      // Process with AI
      const aiResult = await openaiService.processJournalEntry(
        audioBuffer,
        'recording.m4a'
      );

      // Update database
      await db.query(
        `UPDATE journal_entries 
        SET transcript = $1, analysis = $2, updated_at = NOW() 
        WHERE id = $3`,
        [aiResult.transcript, JSON.stringify(aiResult.analysis), entryId]
      );

      res.json({
        success: true,
        transcript: aiResult.transcript,
        analysis: aiResult.analysis,
      });
    } catch (error) {
      console.error('Process entry error:', error);
      res.status(500).json({
        error: 'Failed to process journal entry',
        message: error.message,
      });
    }
  },
};

module.exports = journalController;
