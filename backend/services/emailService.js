// backend/services/emailService.js
const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

/**
 * Generic send email function for admin and other custom emails
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'WyZar <noreply@wyzar.co.zw>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP via Email
 * @param {string} email - Email address
 * @param {string} otp - The OTP code to send
 * @returns {Promise} - Promise with email result
 */
const sendOTP = async (email, otp) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; letter-spacing: 5px; padding: 20px; background-color: white; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .warning { color: #d32f2f; font-weight: bold; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>WyZar Verification Code</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Your verification code is:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p class="warning">⚠️ Do not share this code with anyone. WyZar staff will never ask for your verification code.</p>
          </div>
          <div class="footer">
            <p>If you didn't request this code, please ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} WyZar. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await sendEmail({
      to: email,
      subject: 'Your WyZar Verification Code',
      html
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send password reset OTP via Email
 * @param {string} email - Email address
 * @param {string} otp - OTP code
 */
const sendPasswordResetOTP = async (email, otp) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #FF9800; text-align: center; letter-spacing: 5px; padding: 20px; background-color: white; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .warning { color: #d32f2f; font-weight: bold; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You requested to reset your WyZar account password. Your verification code is:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p class="warning">⚠️ If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>For security reasons, never share this code with anyone.</p>
            <p>&copy; ${new Date().getFullYear()} WyZar. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await sendEmail({
      to: email,
      subject: 'WyZar Password Reset Code',
      html
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendEmail,
  sendOTP,
  sendPasswordResetOTP,
  transporter,
};
