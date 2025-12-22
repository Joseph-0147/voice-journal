const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../database/db');

/**
 * Auth Controller
 * Handles user authentication operations
 */

const authController = {
  /**
   * Register a new user
   */
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, displayName } = req.body;

      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rowCount > 0) {
        return res.status(400).json({
          error: 'User already exists',
          message: 'An account with this email already exists',
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const result = await db.query(
        `INSERT INTO users (email, password_hash, display_name, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id, email, display_name, created_at`,
        [email, passwordHash, displayName || null]
      );

      const user = result.rows[0];

      // Initialize user streak
      await db.query(
        `INSERT INTO user_streaks (user_id, current_streak, longest_streak, updated_at)
        VALUES ($1, 0, 0, NOW())`,
        [user.id]
      );

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Registration failed',
        message: error.message,
      });
    }
  },

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Get user from database
      const result = await db.query(
        `SELECT id, email, password_hash, display_name, profile_image_url, created_at
        FROM users WHERE email = $1`,
        [email]
      );

      if (result.rowCount === 0) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        });
      }

      const user = result.rows[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          profileImageUrl: user.profile_image_url,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login failed',
        message: error.message,
      });
    }
  },

  /**
   * Refresh token
   */
  async refreshToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          error: 'Token required',
          message: 'Refresh token is required',
        });
      }

      // Verify existing token (even if expired)
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET, {
          ignoreExpiration: true,
        });
      } catch (error) {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'The provided token is invalid',
        });
      }

      // Generate new token
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        success: true,
        token: newToken,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        error: 'Token refresh failed',
        message: error.message,
      });
    }
  },

  /**
   * Logout user
   */
  async logout(req, res) {
    try {
      // In a production app, you might want to blacklist the token
      // For now, client-side token removal is sufficient

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
        message: error.message,
      });
    }
  },
};

module.exports = authController;
