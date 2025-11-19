/**
 * Applicant Controller
 * Business logic for applicant operations
 */

const Applicant = require('../models/Applicant');
const logger = require('../config/logger');
const { sendApplicantNotification, sendApplicantConfirmation } = require('../config/email');
const { validationResult } = require('express-validator');

/**
 * @desc    Create new applicant
 * @route   POST /api/applicants
 * @access  Public
 */
exports.createApplicant = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, firstName, lastName, organization, position, phone } = req.body;

    // Check if applicant already exists
    const existingApplicant = await Applicant.findByEmail(email);
    if (existingApplicant) {
      return res.status(409).json({
        success: false,
        message: 'An application with this email already exists',
        applicantId: existingApplicant._id,
      });
    }

    // Create new applicant
    const applicant = await Applicant.create({
      email,
      firstName,
      lastName,
      organization,
      position,
      phone: phone || undefined,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    });

    logger.info(`New applicant created: ${email}`);

    // Send emails (don't await, run in background)
    Promise.all([
      sendApplicantNotification(applicant).catch(err =>
        logger.error('Failed to send admin notification:', err)
      ),
      sendApplicantConfirmation(applicant).catch(err =>
        logger.error('Failed to send applicant confirmation:', err)
      ),
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: applicant._id,
        email: applicant.email,
        fullName: applicant.fullName,
        createdAt: applicant.createdAt,
      },
    });

  } catch (error) {
    logger.error('Error creating applicant:', error);
    next(error);
  }
};

/**
 * @desc    Get all applicants
 * @route   GET /api/applicants
 * @access  Private
 */
exports.getAllApplicants = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { organization: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const applicants = await Applicant.find(filter)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip(skip)
      .select('-__v');

    const total = await Applicant.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: applicants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    logger.error('Error fetching applicants:', error);
    next(error);
  }
};

/**
 * @desc    Get applicant by ID
 * @route   GET /api/applicants/:id
 * @access  Private
 */
exports.getApplicantById = async (req, res, next) => {
  try {
    const applicant = await Applicant.findById(req.params.id).select('-__v');

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    res.status(200).json({
      success: true,
      data: applicant,
    });

  } catch (error) {
    logger.error('Error fetching applicant:', error);
    next(error);
  }
};

/**
 * @desc    Update applicant
 * @route   PUT /api/applicants/:id
 * @access  Private
 */
exports.updateApplicant = async (req, res, next) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'organization', 'position', 'phone', 'status', 'notes'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    logger.info(`Applicant updated: ${applicant.email}`);

    res.status(200).json({
      success: true,
      message: 'Applicant updated successfully',
      data: applicant,
    });

  } catch (error) {
    logger.error('Error updating applicant:', error);
    next(error);
  }
};

/**
 * @desc    Delete applicant
 * @route   DELETE /api/applicants/:id
 * @access  Private
 */
exports.deleteApplicant = async (req, res, next) => {
  try {
    const applicant = await Applicant.findByIdAndDelete(req.params.id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    logger.info(`Applicant deleted: ${applicant.email}`);

    res.status(200).json({
      success: true,
      message: 'Applicant deleted successfully',
    });

  } catch (error) {
    logger.error('Error deleting applicant:', error);
    next(error);
  }
};

/**
 * @desc    Get applicant statistics
 * @route   GET /api/applicants/stats
 * @access  Private
 */
exports.getStats = async (req, res, next) => {
  try {
    const stats = await Applicant.getStats();

    res.status(200).json({
      success: true,
      data: stats,
    });

  } catch (error) {
    logger.error('Error fetching stats:', error);
    next(error);
  }
};

/**
 * @desc    Mark applicant as contacted
 * @route   POST /api/applicants/:id/contact
 * @access  Private
 */
exports.markAsContacted = async (req, res, next) => {
  try {
    const applicant = await Applicant.findById(req.params.id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    await applicant.markAsContacted();

    logger.info(`Applicant marked as contacted: ${applicant.email}`);

    res.status(200).json({
      success: true,
      message: 'Applicant marked as contacted',
      data: applicant,
    });

  } catch (error) {
    logger.error('Error marking applicant as contacted:', error);
    next(error);
  }
};

/**
 * @desc    Schedule interview for applicant
 * @route   POST /api/applicants/:id/schedule
 * @access  Private
 */
exports.scheduleInterview = async (req, res, next) => {
  try {
    const { interviewDate } = req.body;

    if (!interviewDate) {
      return res.status(400).json({
        success: false,
        message: 'Interview date is required',
      });
    }

    const applicant = await Applicant.findById(req.params.id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    await applicant.scheduleInterview(new Date(interviewDate));

    logger.info(`Interview scheduled for: ${applicant.email}`);

    res.status(200).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: applicant,
    });

  } catch (error) {
    logger.error('Error scheduling interview:', error);
    next(error);
  }
};

/**
 * @desc    Mark interview as completed
 * @route   POST /api/applicants/:id/complete
 * @access  Private
 */
exports.completeInterview = async (req, res, next) => {
  try {
    const applicant = await Applicant.findById(req.params.id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    await applicant.completeInterview();

    logger.info(`Interview completed for: ${applicant.email}`);

    res.status(200).json({
      success: true,
      message: 'Interview marked as completed',
      data: applicant,
    });

  } catch (error) {
    logger.error('Error completing interview:', error);
    next(error);
  }
};

/**
 * @desc    Mark gift card as sent
 * @route   POST /api/applicants/:id/gift-card
 * @access  Private
 */
exports.sendGiftCard = async (req, res, next) => {
  try {
    const applicant = await Applicant.findById(req.params.id);

    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    await applicant.sendGiftCard();

    logger.info(`Gift card sent to: ${applicant.email}`);

    res.status(200).json({
      success: true,
      message: 'Gift card marked as sent',
      data: applicant,
    });

  } catch (error) {
    logger.error('Error sending gift card:', error);
    next(error);
  }
};
