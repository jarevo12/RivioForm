/**
 * Email Configuration
 * Nodemailer setup for sending emails
 */

const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Create email transporter
 */
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  return nodemailer.createTransporter(config);
};

/**
 * Send email notification
 * @param {Object} options - Email options
 * @returns {Promise}
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Rivio" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

/**
 * Send applicant notification email to admin
 * @param {Object} applicant - Applicant data
 */
const sendApplicantNotification = async (applicant) => {
  const subject = `New Application Received - ${applicant.firstName} ${applicant.lastName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .field { margin: 15px 0; padding: 12px; background: white; border-radius: 6px; border-left: 3px solid #3b82f6; }
        .label { font-weight: bold; color: #1e40af; margin-bottom: 5px; }
        .value { color: #334155; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #64748b; font-size: 12px; }
        .badge { display: inline-block; background: #22c55e; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🎉 New Application Received</h1>
          <p style="margin: 10px 0 0 0;">Rivio Trade Credit Insurance Interview</p>
        </div>
        <div class="content">
          <p>A new applicant has submitted their information for the $50 Amazon gift card interview:</p>

          <div class="field">
            <div class="label">Full Name</div>
            <div class="value">${applicant.firstName} ${applicant.lastName}</div>
          </div>

          <div class="field">
            <div class="label">Email Address</div>
            <div class="value">${applicant.email}</div>
          </div>

          <div class="field">
            <div class="label">Organization</div>
            <div class="value">${applicant.organization}</div>
          </div>

          <div class="field">
            <div class="label">Position</div>
            <div class="value">${applicant.position}</div>
          </div>

          ${applicant.phone ? `
          <div class="field">
            <div class="label">Phone Number</div>
            <div class="value">${applicant.phone}</div>
          </div>
          ` : ''}

          <div class="field">
            <div class="label">Submitted On</div>
            <div class="value">${new Date(applicant.createdAt).toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
            <span class="badge">New</span>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Rivio. All rights reserved.</p>
          <p>Making trade credit insurance compliance effortless.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Application Received - Rivio Trade Credit Insurance Interview

Applicant Details:
- Name: ${applicant.firstName} ${applicant.lastName}
- Email: ${applicant.email}
- Organization: ${applicant.organization}
- Position: ${applicant.position}
${applicant.phone ? `- Phone: ${applicant.phone}` : ''}
- Submitted: ${new Date(applicant.createdAt).toLocaleString()}

Please schedule their 30-minute interview and arrange the $50 Amazon gift card delivery.
  `;

  return sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@rivio.com',
    subject,
    text,
    html,
  });
};

/**
 * Send confirmation email to applicant
 * @param {Object} applicant - Applicant data
 */
const sendApplicantConfirmation = async (applicant) => {
  const subject = 'Thank You for Your Application - Rivio';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .highlight { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #64748b; font-size: 12px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">✅ Application Received!</h1>
          <p style="margin: 10px 0 0 0;">Thank you for your interest</p>
        </div>
        <div class="content">
          <p>Dear ${applicant.firstName},</p>

          <p>Thank you for submitting your application to participate in our trade credit insurance research interview!</p>

          <div class="highlight">
            <h3 style="margin-top: 0;">🎁 What's Next?</h3>
            <p>Our team will review your application and reach out within <strong>2-3 business days</strong> to schedule your 30-minute interview.</p>
            <p>Upon completion of the interview, you'll receive your <strong>$50 Amazon gift card</strong> as promised!</p>
          </div>

          <p><strong>Your Details:</strong></p>
          <ul>
            <li>Email: ${applicant.email}</li>
            <li>Organization: ${applicant.organization}</li>
            <li>Position: ${applicant.position}</li>
          </ul>

          <p>If you have any questions in the meantime, feel free to reply to this email.</p>

          <p>Best regards,<br>The Rivio Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Rivio. All rights reserved.</p>
          <p>Making trade credit insurance compliance effortless.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Dear ${applicant.firstName},

Thank you for submitting your application to participate in our trade credit insurance research interview!

What's Next?
Our team will review your application and reach out within 2-3 business days to schedule your 30-minute interview.

Upon completion of the interview, you'll receive your $50 Amazon gift card as promised!

Your Details:
- Email: ${applicant.email}
- Organization: ${applicant.organization}
- Position: ${applicant.position}

If you have any questions in the meantime, feel free to reply to this email.

Best regards,
The Rivio Team

© ${new Date().getFullYear()} Rivio. All rights reserved.
Making trade credit insurance compliance effortless.
  `;

  return sendEmail({
    to: applicant.email,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendEmail,
  sendApplicantNotification,
  sendApplicantConfirmation,
};
