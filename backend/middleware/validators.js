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

/**
 * Validate survey response data
 * Validates required fields based on conditional logic
 */
exports.validateSurveyResponse = [
  // Q1 - Required for all
  body('q1_b2b_percentage')
    .notEmpty().withMessage('B2B percentage is required')
    .isIn(['less-than-25', '25-50', '51-75', '76-100'])
    .withMessage('Invalid B2B percentage value'),

  // Q2 - Required if not screened out
  body('q2_role')
    .if(body('q1_b2b_percentage').not().equals('less-than-25'))
    .notEmpty().withMessage('Role is required')
    .isIn(['cfo-finance-director', 'credit-manager', 'controller-treasurer', 'ar-collections-manager', 'ceo-owner', 'coo', 'other'])
    .withMessage('Invalid role value'),

  body('q2_role_other')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Role description cannot exceed 100 characters'),

  // Q3 - Payment terms (array)
  body('q3_payment_terms')
    .if(body('q1_b2b_percentage').not().equals('less-than-25'))
    .isArray({ min: 1 }).withMessage('At least one payment term must be selected')
    .custom((value) => {
      const validTerms = ['net-30', 'net-60', 'net-90-or-longer', 'net-15-or-shorter', 'varies-by-customer', 'cash-payment-on-delivery'];
      return value.every(term => validTerms.includes(term));
    }).withMessage('Invalid payment terms'),

  // Q4 - Bad debt experience
  body('q4_bad_debt_experience')
    .if(body('q1_b2b_percentage').not().equals('less-than-25'))
    .notEmpty().withMessage('Bad debt experience is required')
    .isIn(['yes-multiple', 'yes-once-or-twice', 'no-never', 'prefer-not-say'])
    .withMessage('Invalid bad debt experience value'),

  // Q8 - Credit assessment methods (array, top 3)
  body('q8_credit_assessment_methods')
    .if(body('q1_b2b_percentage').not().equals('less-than-25'))
    .isArray({ min: 1, max: 3 }).withMessage('Select 1-3 credit assessment methods')
    .custom((value) => {
      const validMethods = ['credit-bureau-reports', 'financial-statements', 'bank-trade-references', 'third-party-assessments', 'personal-relationship', 'industry-standard-terms', 'no-formal-assessment'];
      return value.every(method => validMethods.includes(method));
    }).withMessage('Invalid credit assessment methods'),

  // Q9 - AR tracking tools (array)
  body('q9_ar_tracking_tools')
    .if(body('q1_b2b_percentage').not().equals('less-than-25'))
    .isArray({ min: 1 }).withMessage('At least one AR tracking tool must be selected')
    .custom((value) => {
      const validTools = ['erp-system', 'accounting-software', 'ar-collections-software', 'spreadsheets', 'no-specific-tools'];
      return value.every(tool => validTools.includes(tool));
    }).withMessage('Invalid AR tracking tools'),

  // Q10 - Risk mechanisms (array)
  body('q10_risk_mechanisms')
    .if(body('q1_b2b_percentage').not().equals('less-than-25'))
    .isArray({ min: 1 }).withMessage('At least one risk mechanism must be selected')
    .custom((value) => {
      const validMechanisms = ['trade-credit-insurance', 'invoice-factoring', 'letters-of-credit', 'bank-guarantees', 'internal-reserves', 'none', 'other'];
      return value.every(mechanism => validMechanisms.includes(mechanism));
    }).withMessage('Invalid risk mechanisms'),

  // Q17 - Annual revenue
  body('q17_annual_revenue')
    .if(body('q1_b2b_percentage').not().equals('less-than-25'))
    .notEmpty().withMessage('Annual revenue is required')
    .isIn(['under-10m', '10-50m', '50-100m', '100-500m', 'over-500m', 'prefer-not-say'])
    .withMessage('Invalid annual revenue value'),

  // Q18 - Primary industry
  body('q18_primary_industry')
    .if(body('q1_b2b_percentage').not().equals('less-than-25'))
    .trim()
    .notEmpty().withMessage('Primary industry is required')
    .isLength({ max: 100 }).withMessage('Industry cannot exceed 100 characters'),

  // Q19 - Company headquarters
  body('q19_company_headquarters')
    .if(body('q1_b2b_percentage').not().equals('less-than-25'))
    .trim()
    .notEmpty().withMessage('Company headquarters is required')
    .isLength({ max: 100 }).withMessage('Country cannot exceed 100 characters'),

  // Q20 - International sales percentage
  body('q20_international_sales_percentage')
    .if(body('q1_b2b_percentage').not().equals('less-than-25'))
    .notEmpty().withMessage('International sales percentage is required')
    .isIn(['0-10', '10-25', '25-50', '50-75', '75-100'])
    .withMessage('Invalid international sales percentage value'),

  // Email - Optional
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  // Completion time - Optional
  body('completionTime')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('Completion time must be a positive number'),
];
