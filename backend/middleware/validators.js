/**
 * Validation Middleware
 * Express-validator rules for request validation
 */

const { body } = require('express-validator');

/**
 * Validate applicant data
 */
exports.validateApplicant = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('Email cannot exceed 100 characters'),

  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

  body('organization')
    .trim()
    .notEmpty().withMessage('Organization is required')
    .isLength({ min: 2, max: 100 }).withMessage('Organization must be between 2 and 100 characters'),

  body('position')
    .trim()
    .notEmpty().withMessage('Position is required')
    .isLength({ min: 2, max: 100 }).withMessage('Position must be between 2 and 100 characters'),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Please provide a valid phone number')
    .isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters'),
];
