/**
 * Survey Controller
 * Business logic for survey response operations
 */

const SurveyResponse = require('../models/SurveyResponse');
const logger = require('../config/logger');
const { validationResult } = require('express-validator');

/**
 * @desc    Create new survey response
 * @route   POST /api/survey
 * @access  Public
 */
exports.createSurveyResponse = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Create new survey response
    const surveyResponse = await SurveyResponse.create({
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    });

    logger.info(`New survey response created. Path: ${surveyResponse.surveyPath}, Email: ${surveyResponse.email || 'not provided'}`);

    res.status(201).json({
      success: true,
      message: 'Survey submitted successfully',
      data: {
        id: surveyResponse._id,
        surveyPath: surveyResponse.surveyPath,
        totalQuestions: surveyResponse.totalQuestions,
        submittedAt: surveyResponse.submittedAt,
      },
    });

  } catch (error) {
    logger.error('Error creating survey response:', error);
    next(error);
  }
};

/**
 * @desc    Get all survey responses
 * @route   GET /api/survey
 * @access  Private
 */
exports.getAllResponses = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};

    // Filter by survey path
    if (req.query.surveyPath) {
      filter.surveyPath = req.query.surveyPath;
    }

    // Filter by screened out
    if (req.query.screenedOut !== undefined) {
      filter.screenedOut = req.query.screenedOut === 'true';
    }

    // Filter by TCI users
    if (req.query.usesTCI !== undefined) {
      filter.usesTCI = req.query.usesTCI === 'true';
    }

    // Filter by industry
    if (req.query.industry) {
      filter.q18_primary_industry = { $regex: req.query.industry, $options: 'i' };
    }

    // Filter by revenue
    if (req.query.revenue) {
      filter.q17_annual_revenue = req.query.revenue;
    }

    // Search by email or company
    if (req.query.search) {
      filter.$or = [
        { email: { $regex: req.query.search, $options: 'i' } },
        { companyName: { $regex: req.query.search, $options: 'i' } },
        { contactName: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const responses = await SurveyResponse.find(filter)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip(skip)
      .select('-__v -ipAddress -userAgent');

    const total = await SurveyResponse.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: responses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    logger.error('Error fetching survey responses:', error);
    next(error);
  }
};

/**
 * @desc    Get survey response by ID
 * @route   GET /api/survey/:id
 * @access  Private
 */
exports.getResponseById = async (req, res, next) => {
  try {
    const response = await SurveyResponse.findById(req.params.id).select('-__v');

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Survey response not found',
      });
    }

    res.status(200).json({
      success: true,
      data: response,
    });

  } catch (error) {
    logger.error('Error fetching survey response:', error);
    next(error);
  }
};

/**
 * @desc    Get survey statistics
 * @route   GET /api/survey/stats
 * @access  Private
 */
exports.getStats = async (req, res, next) => {
  try {
    const stats = await SurveyResponse.getStats();

    res.status(200).json({
      success: true,
      data: stats,
    });

  } catch (error) {
    logger.error('Error fetching survey stats:', error);
    next(error);
  }
};

/**
 * @desc    Update survey response (for admin notes, etc.)
 * @route   PUT /api/survey/:id
 * @access  Private
 */
exports.updateResponse = async (req, res, next) => {
  try {
    // Only allow updating certain admin fields, not the survey responses themselves
    const allowedUpdates = ['email', 'contactName', 'companyName'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const response = await SurveyResponse.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Survey response not found',
      });
    }

    logger.info(`Survey response updated: ${response._id}`);

    res.status(200).json({
      success: true,
      message: 'Survey response updated successfully',
      data: response,
    });

  } catch (error) {
    logger.error('Error updating survey response:', error);
    next(error);
  }
};

/**
 * @desc    Delete survey response
 * @route   DELETE /api/survey/:id
 * @access  Private
 */
exports.deleteResponse = async (req, res, next) => {
  try {
    const response = await SurveyResponse.findByIdAndDelete(req.params.id);

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Survey response not found',
      });
    }

    logger.info(`Survey response deleted: ${response._id}`);

    res.status(200).json({
      success: true,
      message: 'Survey response deleted successfully',
    });

  } catch (error) {
    logger.error('Error deleting survey response:', error);
    next(error);
  }
};

/**
 * @desc    Export survey responses as CSV
 * @route   GET /api/survey/export/csv
 * @access  Private
 */
exports.exportToCSV = async (req, res, next) => {
  try {
    const responses = await SurveyResponse.find({ screenedOut: false }).select('-__v -ipAddress -userAgent').lean();

    if (responses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No survey responses to export',
      });
    }

    // Convert to CSV
    const headers = Object.keys(responses[0]).filter(key => key !== '_id');
    const csvRows = [headers.join(',')];

    for (const response of responses) {
      const values = headers.map(header => {
        const value = response[header];
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        }
        if (value === null || value === undefined) {
          return '';
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="survey-responses-${Date.now()}.csv"`);
    res.status(200).send(csvContent);

  } catch (error) {
    logger.error('Error exporting survey responses:', error);
    next(error);
  }
};
