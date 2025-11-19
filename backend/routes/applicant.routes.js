/**
 * Applicant Routes
 * API endpoints for applicant management
 */

const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicant.controller');
const { validateApplicant } = require('../middleware/validators');

// @route   POST /api/applicants
// @desc    Create new applicant
// @access  Public
router.post('/', validateApplicant, applicantController.createApplicant);

// @route   GET /api/applicants
// @desc    Get all applicants (with pagination and filtering)
// @access  Private (would need auth middleware in production)
router.get('/', applicantController.getAllApplicants);

// @route   GET /api/applicants/stats
// @desc    Get applicant statistics
// @access  Private
router.get('/stats', applicantController.getStats);

// @route   GET /api/applicants/:id
// @desc    Get applicant by ID
// @access  Private
router.get('/:id', applicantController.getApplicantById);

// @route   PUT /api/applicants/:id
// @desc    Update applicant
// @access  Private
router.put('/:id', applicantController.updateApplicant);

// @route   DELETE /api/applicants/:id
// @desc    Delete applicant
// @access  Private
router.delete('/:id', applicantController.deleteApplicant);

// @route   POST /api/applicants/:id/contact
// @desc    Mark applicant as contacted
// @access  Private
router.post('/:id/contact', applicantController.markAsContacted);

// @route   POST /api/applicants/:id/schedule
// @desc    Schedule interview for applicant
// @access  Private
router.post('/:id/schedule', applicantController.scheduleInterview);

// @route   POST /api/applicants/:id/complete
// @desc    Mark interview as completed
// @access  Private
router.post('/:id/complete', applicantController.completeInterview);

// @route   POST /api/applicants/:id/gift-card
// @desc    Mark gift card as sent
// @access  Private
router.post('/:id/gift-card', applicantController.sendGiftCard);

module.exports = router;
