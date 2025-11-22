/**
 * Survey Routes
 * API endpoints for survey response management
 */

const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/survey.controller');
const { validateSurveyResponse } = require('../middleware/validators');

// @route   POST /api/survey
// @desc    Create new survey response
// @access  Public
router.post('/', validateSurveyResponse, surveyController.createSurveyResponse);

// @route   GET /api/survey
// @desc    Get all survey responses (with pagination and filtering)
// @access  Private
router.get('/', surveyController.getAllResponses);

// @route   GET /api/survey/stats
// @desc    Get survey statistics
// @access  Private
router.get('/stats', surveyController.getStats);

// @route   GET /api/survey/export/csv
// @desc    Export survey responses to CSV
// @access  Private
router.get('/export/csv', surveyController.exportToCSV);

// @route   GET /api/survey/:id
// @desc    Get survey response by ID
// @access  Private
router.get('/:id', surveyController.getResponseById);

// @route   PUT /api/survey/:id
// @desc    Update survey response
// @access  Private
router.put('/:id', surveyController.updateResponse);

// @route   DELETE /api/survey/:id
// @desc    Delete survey response
// @access  Private
router.delete('/:id', surveyController.deleteResponse);

module.exports = router;
