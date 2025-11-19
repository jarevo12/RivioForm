/**
 * Applicant Model
 * MongoDB schema for applicant data
 */

const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ],
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    organization: {
      type: String,
      required: [true, 'Organization is required'],
      trim: true,
      minlength: [2, 'Organization must be at least 2 characters'],
      maxlength: [100, 'Organization cannot exceed 100 characters'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
      minlength: [2, 'Position must be at least 2 characters'],
      maxlength: [100, 'Position cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^[\d\s\-\+\(\)]+$/,
        'Please provide a valid phone number'
      ],
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'scheduled', 'completed', 'cancelled'],
      default: 'pending',
    },
    interviewDate: {
      type: Date,
    },
    giftCardSent: {
      type: Boolean,
      default: false,
    },
    giftCardSentDate: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
applicantSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for faster queries
applicantSchema.index({ createdAt: -1 });
applicantSchema.index({ status: 1 });

// Pre-save hook to sanitize data
applicantSchema.pre('save', function (next) {
  // Capitalize first letter of names
  if (this.firstName) {
    this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1).toLowerCase();
  }
  if (this.lastName) {
    this.lastName = this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1).toLowerCase();
  }
  next();
});

// Static method to find by email
applicantSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get applicant stats
applicantSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await this.countDocuments();
  const giftCardsSent = await this.countDocuments({ giftCardSent: true });

  return {
    total,
    byStatus: stats,
    giftCardsSent,
  };
};

// Instance method to mark as contacted
applicantSchema.methods.markAsContacted = function () {
  this.status = 'contacted';
  return this.save();
};

// Instance method to schedule interview
applicantSchema.methods.scheduleInterview = function (date) {
  this.status = 'scheduled';
  this.interviewDate = date;
  return this.save();
};

// Instance method to mark interview as complete
applicantSchema.methods.completeInterview = function () {
  this.status = 'completed';
  return this.save();
};

// Instance method to send gift card
applicantSchema.methods.sendGiftCard = function () {
  this.giftCardSent = true;
  this.giftCardSentDate = new Date();
  return this.save();
};

const Applicant = mongoose.model('Applicant', applicantSchema);

module.exports = Applicant;
