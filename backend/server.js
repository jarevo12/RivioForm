/**
 * Rivio Backend Server
 * Main entry point for the Express application
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Import custom modules
const logger = require('./config/logger');
const { connectDB } = require('./config/database');
const applicantRoutes = require('./routes/applicant.routes');
const surveyRoutes = require('./routes/survey.routes');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const benchmarkReportRoutes = require('./routes/benchmark-report.routes');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for form submissions
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 form submissions per hour
  message: 'Too many form submissions from this IP, please try again later.',
  skipSuccessfulRequests: false,
});

// ==================== ROUTES ====================

// Health check endpoint
app.use('/api/health', healthRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Applicant routes - form limiter only on POST
const applicantRouter = require('express').Router();

// Apply strict rate limiting only to POST (form submission)
applicantRouter.post('/', formLimiter);

// Mount applicant routes
applicantRouter.use('/', applicantRoutes);
app.use('/api/applicants', applicantRouter);

// Survey routes - form limiter on POST
const surveyRouter = require('express').Router();
surveyRouter.post('/', formLimiter);
surveyRouter.use('/', surveyRoutes);
app.use('/api/survey', surveyRouter);

// Benchmark report routes
app.use('/api/reports/benchmark', benchmarkReportRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Rivio API Server',
    version: '1.1.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      applicants: '/api/applicants',
      survey: '/api/survey',
      reports: '/api/reports/benchmark',
      docs: '/api/docs'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// ==================== DATABASE & SERVER STARTUP ====================

/**
 * Start the server and connect to database
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('✅ Database connected successfully');

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Rivio Backend Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export for testing
module.exports = app;
