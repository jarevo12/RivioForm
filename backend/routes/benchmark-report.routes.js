/**
 * Benchmark Report Routes
 * API endpoints for generating personalized benchmark reports
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/benchmark-report.controller');

// @route   GET /api/reports/benchmark/:id/preview
// @desc    Get report preview (calculations only, no PDF)
// @access  Private
router.get('/:id/preview', reportController.getReportPreview);

// @route   POST /api/reports/benchmark/:id
// @desc    Generate benchmark report for specific survey response
// @access  Private
router.post('/:id', reportController.generateBenchmarkReport);

// @route   POST /api/reports/benchmark/batch
// @desc    Generate benchmark reports in batch
// @access  Private
router.post('/batch', reportController.generateBatchReports);

module.exports = router;
