/**
 * SurveyResponse Model
 * MongoDB schema for Credit Risk Management Survey responses
 */

const mongoose = require('mongoose');

const surveyResponseSchema = new mongoose.Schema(
  {
    // ========== QUALIFICATION (Q1-Q2) ==========
    q1_b2b_percentage: {
      type: String,
      required: [true, 'B2B percentage is required'],
      enum: ['less-than-25', '25-50', '51-75', '76-100'],
    },
    screenedOut: {
      type: Boolean,
      default: false,
      // True if q1_b2b_percentage === 'less-than-25'
    },
    q2_role: {
      type: String,
      required: function() { return !this.screenedOut; },
      enum: [
        'cfo-finance-director',
        'credit-manager',
        'controller-treasurer',
        'ar-collections-manager',
        'ceo-owner',
        'coo',
        'other'
      ],
    },
    q2_role_other: {
      type: String,
      trim: true,
      maxlength: [100, 'Role description cannot exceed 100 characters'],
    },

    // ========== CREDIT MANAGEMENT (Q3-Q4) ==========
    q3_payment_terms: {
      type: String,
      required: function() { return !this.screenedOut; },
      // Single selection
      enum: [
        'net-15-or-shorter',
        'net-30',
        'net-60',
        'net-90',
        'more-than-net-90',
        'cash-payment-on-delivery'
      ],
    },
    q4_bad_debt_experience: {
      type: String,
      required: function() { return !this.screenedOut; },
      enum: ['yes-multiple', 'yes-once-or-twice', 'no-never', 'prefer-not-say'],
    },

    // ========== BAD DEBT EXPERIENCES (Q5-Q7a) - Conditional on Q4 ==========
    q5_bad_debt_amount: {
      type: String,
      enum: [
        'less-than-50k',
        '50k-250k',
        '250k-1m',
        '1m-5m',
        'over-5m',
        'prefer-not-say'
      ],
      // Only filled if q4 is 'yes-multiple' or 'yes-once-or-twice'
    },
    q6_bad_debt_impact: {
      type: Number,
      min: 1,
      max: 5,
      // Scale 1-5, only filled if bad debt experienced
    },
    q7_changed_approach: {
      type: String,
      enum: ['yes-significant', 'yes-minor', 'no-same-approach'],
      // Only filled if bad debt experienced
    },
    q7a_changes_made: {
      type: [String],
      enum: [
        'stricter-credit-approval',
        'trade-credit-insurance',
        'factoring-invoice-financing',
        'ar-management-software',
        'letters-of-credit',
        'shortened-payment-terms',
        'deposits-advance-payments',
        'other'
      ],
      // Only filled if q7 is 'yes-significant' or 'yes-minor'
    },
    q7a_changes_other: {
      type: String,
      trim: true,
      maxlength: [200, 'Changes description cannot exceed 200 characters'],
    },

    // ========== CURRENT PRACTICES (Q8-Q9) ==========
    q8_credit_assessment_methods: {
      type: [String],
      required: function() { return !this.screenedOut; },
      // Multi-select, top 3
      enum: [
        'credit-bureau-reports',
        'financial-statements',
        'bank-trade-references',
        'third-party-assessments',
        'personal-relationship',
        'industry-standard-terms',
        'no-formal-assessment'
      ],
    },
    q9_ar_tracking_tools: {
      type: [String],
      required: function() { return !this.screenedOut; },
      // Multi-select
      enum: [
        'erp-system',
        'accounting-software',
        'ar-collections-software',
        'spreadsheets',
        'no-specific-tools'
      ],
    },

    // ========== RISK MITIGATION (Q10) ==========
    q10_risk_mechanisms: {
      type: [String],
      required: function() { return !this.screenedOut; },
      // Multi-select
      enum: [
        'trade-credit-insurance',
        'invoice-factoring',
        'letters-of-credit',
        'bank-guarantees',
        'internal-reserves',
        'none',
        'other'
      ],
    },
    q10_risk_mechanisms_other: {
      type: String,
      trim: true,
      maxlength: [200, 'Risk mechanism description cannot exceed 200 characters'],
    },
    q10a_tci_non_usage_reasons: {
      type: [String],
      enum: [
        'never-heard',
        'too-expensive',
        'no-value',
        'too-complex'
      ],
      // Only filled if TCI is NOT used (conditional question)
    },
    usesTCI: {
      type: Boolean,
      default: false,
      // Flag set to true if 'trade-credit-insurance' is in q10_risk_mechanisms
    },

    // ========== TCI DEEP-DIVE (Q11-Q16) - Conditional on usesTCI ==========
    q11_tci_duration: {
      type: String,
      enum: ['less-than-1-year', '1-3-years', '3-5-years', 'over-5-years'],
      // Only filled if usesTCI is true
    },
    q12_tci_coverage: {
      type: String,
      enum: [
        'entire-portfolio',
        'only-high-risk',
        'only-large-customers',
        'specific-segments',
        'other'
      ],
      // Only filled if usesTCI is true
    },
    q12_tci_coverage_other: {
      type: String,
      trim: true,
      maxlength: [200, 'Coverage description cannot exceed 200 characters'],
    },
    q13_tci_provider: {
      type: [String],
      enum: [
        'allianz-trade',
        'atradius',
        'coface',
        'aig',
        'zurich',
        'other',
        'prefer-not-say'
      ],
      // Only filled if usesTCI is true
      // Multi-select array
    },
    q13_tci_provider_other: {
      type: String,
      trim: true,
      maxlength: [100, 'Provider name cannot exceed 100 characters'],
    },
    q14_tci_interaction_frequency: {
      type: String,
      enum: [
        'weekly-or-more',
        'monthly',
        'quarterly',
        'only-when-issues',
        'rarely-annual-only'
      ],
      // Only filled if usesTCI is true
    },
    q15_tci_satisfaction: {
      type: Number,
      min: 1,
      max: 5,
      // Scale 1-5, only filled if usesTCI is true
    },
    q16_tci_challenges: {
      type: [String],
      // Multi-select, up to 3
      enum: [
        'high-premiums',
        'slow-approval',
        'complex-claims',
        'coverage-gaps',
        'administrative-burden',
        'poor-communication',
        'difficult-integration',
        'other'
      ],
      // Only filled if usesTCI is true
    },
    q16_tci_challenges_other: {
      type: String,
      trim: true,
      maxlength: [200, 'Challenge description cannot exceed 200 characters'],
    },

    // ========== COMPANY PROFILE (Q17-Q20) ==========
    q17_annual_revenue: {
      type: String,
      required: function() { return !this.screenedOut; },
      enum: [
        'under-10m',
        '10-50m',
        '50-100m',
        '100-500m',
        'over-500m',
        'prefer-not-say'
      ],
    },
    q18_primary_industry: {
      type: String,
      required: function() { return !this.screenedOut; },
      enum: [
        'manufacturing',
        'wholesale-distribution',
        'technology-software',
        'construction',
        'healthcare',
        'professional-services',
        'transportation-logistics',
        'retail',
        'food-beverage',
        'chemicals',
        'textiles-apparel',
        'other'
      ],
    },
    q18_primary_industry_other: {
      type: String,
      trim: true,
      maxlength: [100, 'Industry cannot exceed 100 characters'],
    },
    q19_company_headquarters: {
      type: String,
      required: function() { return !this.screenedOut; },
      enum: [
        'united-states',
        'canada',
        'united-kingdom',
        'germany',
        'france',
        'netherlands',
        'belgium',
        'spain',
        'italy',
        'switzerland',
        'australia',
        'china',
        'india',
        'japan',
        'singapore',
        'other'
      ],
    },
    q19_company_headquarters_other: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters'],
    },
    q20_international_sales_percentage: {
      type: String,
      required: function() { return !this.screenedOut; },
      enum: ['0-10', '10-25', '25-50', '50-75', '75-100'],
    },

    // ========== EMAIL CAPTURE & DELIVERABLES ==========
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ],
      index: true,
    },
    contactName: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    wantsStayInTouch: {
      type: Boolean,
      default: false,
    },
    wantsBenchmarkReport: {
      type: Boolean,
      default: false,
    },
    wantsResearchReport: {
      type: Boolean,
      default: false,
    },
    wantsConsultation: {
      type: Boolean,
      default: false,
    },
    consultationPhone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    consultationBestTime: {
      type: String,
      trim: true,
      maxlength: [200, 'Best time cannot exceed 200 characters'],
    },

    // ========== SURVEY METADATA ==========
    surveyPath: {
      type: String,
      enum: ['no-bad-debt-no-tci', 'bad-debt-no-tci', 'no-bad-debt-with-tci', 'full-path'],
      // Tracks which conditional path the user took
    },
    totalQuestions: {
      type: Number,
      min: 14,
      max: 20,
      // Number of questions actually shown to this respondent
    },
    completionTime: {
      type: Number,
      // Time in seconds to complete survey
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
surveyResponseSchema.index({ createdAt: -1 });
surveyResponseSchema.index({ surveyPath: 1 });
surveyResponseSchema.index({ screenedOut: 1 });
surveyResponseSchema.index({ usesTCI: 1 });
surveyResponseSchema.index({ q17_annual_revenue: 1 });
surveyResponseSchema.index({ q18_primary_industry: 1 });

// Pre-save hook to set computed fields
surveyResponseSchema.pre('save', function (next) {
  // Set screenedOut flag
  if (this.q1_b2b_percentage === 'less-than-25') {
    this.screenedOut = true;
  }

  // Set usesTCI flag
  if (this.q10_risk_mechanisms && this.q10_risk_mechanisms.includes('trade-credit-insurance')) {
    this.usesTCI = true;
  }

  // Determine survey path
  const hasBadDebt = this.q4_bad_debt_experience === 'yes-multiple' ||
                     this.q4_bad_debt_experience === 'yes-once-or-twice';

  if (this.screenedOut) {
    this.surveyPath = 'screened-out';
    this.totalQuestions = 1;
  } else if (!hasBadDebt && !this.usesTCI) {
    this.surveyPath = 'no-bad-debt-no-tci';
    this.totalQuestions = 14;
  } else if (hasBadDebt && !this.usesTCI) {
    this.surveyPath = 'bad-debt-no-tci';
    this.totalQuestions = 18;
  } else if (!hasBadDebt && this.usesTCI) {
    this.surveyPath = 'no-bad-debt-with-tci';
    this.totalQuestions = 20;
  } else {
    this.surveyPath = 'full-path';
    this.totalQuestions = 20;
  }

  next();
});

// Static method to get survey statistics
surveyResponseSchema.statics.getStats = async function () {
  const total = await this.countDocuments();
  const screenedOut = await this.countDocuments({ screenedOut: true });
  const completed = await this.countDocuments({ screenedOut: false });

  const byPath = await this.aggregate([
    { $match: { screenedOut: false } },
    {
      $group: {
        _id: '$surveyPath',
        count: { $sum: 1 },
      },
    },
  ]);

  const byIndustry = await this.aggregate([
    { $match: { screenedOut: false } },
    {
      $group: {
        _id: '$q18_primary_industry',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const tciUsers = await this.countDocuments({ usesTCI: true });

  const avgCompletionTime = await this.aggregate([
    { $match: { screenedOut: false, completionTime: { $exists: true } } },
    {
      $group: {
        _id: null,
        avgTime: { $avg: '$completionTime' },
      },
    },
  ]);

  const emailCaptureRate = await this.countDocuments({
    screenedOut: false,
    email: { $exists: true, $ne: null, $ne: '' }
  });

  return {
    total,
    screenedOut,
    completed,
    byPath,
    byIndustry,
    tciUsers,
    avgCompletionTime: avgCompletionTime.length > 0 ? avgCompletionTime[0].avgTime : 0,
    emailCaptureRate: completed > 0 ? (emailCaptureRate / completed * 100).toFixed(1) : 0,
  };
};

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

module.exports = SurveyResponse;
