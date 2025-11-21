/**
 * Authentication Routes
 * Handles admin login authentication
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate admin user and return JWT token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      logger.error('Admin credentials not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Check username
    if (username !== adminUsername) {
      logger.warn(`Failed login attempt for username: ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, adminPassword);

    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for username: ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    logger.info(`Successful admin login: ${username}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        username
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

/**
 * @route   POST /api/auth/verify
 * @desc    Verify JWT token is valid
 * @access  Public
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({
      success: true,
      data: {
        username: decoded.username,
        role: decoded.role
      }
    });

  } catch (error) {
    logger.warn('Token verification failed:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

module.exports = router;
