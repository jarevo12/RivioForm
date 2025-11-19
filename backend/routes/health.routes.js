/**
 * Health Check Routes
 * API endpoints for system health monitoring
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// @route   GET /api/health
// @desc    Basic health check
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// @route   GET /api/health/database
// @desc    Database health check
// @access  Public
router.get('/database', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    database: {
      status: states[dbState],
      healthy: isHealthy,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown',
    },
    timestamp: new Date().toISOString(),
  });
});

// @route   GET /api/health/detailed
// @desc    Detailed health check
// @access  Public
router.get('/detailed', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbHealthy = dbState === 1;

  const healthData = {
    success: isDbHealthy,
    timestamp: new Date().toISOString(),
    server: {
      status: 'running',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
      node: process.version,
      environment: process.env.NODE_ENV || 'development',
    },
    database: {
      status: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState],
      healthy: isDbHealthy,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown',
    },
  };

  res.status(isDbHealthy ? 200 : 503).json(healthData);
});

module.exports = router;
