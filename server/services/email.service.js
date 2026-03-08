/**
 * services/email.service.js
 * Nodemailer wrapper for transactional emails.
 */

const nodemailer = require("nodemailer");
const { SMTP } = require("../config/env");

const transporter = nodemailer.createTransport({
    host: SMTP.host,
    port: SMTP.port,
    secure: SMTP.port === 465,
    auth: {
        user: SMTP.user,
        pass: SMTP.pass,
    },
});

/**
 * Send a generic email.
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
    if (!SMTP.user || !SMTP.pass) {
        console.warn("[EMAIL] SMTP credentials not configured — skipping email send.");
        return;
    }
    const info = await transporter.sendMail({ from: SMTP.from, to, subject, html });
    console.log(`[EMAIL] Sent to ${to}: ${info.messageId}`);
    return info;
};

/**
 * Welcome email after registration.
 */
const sendWelcomeEmail = async (to, displayName) => {
    return sendEmail({
        to,
        subject: "Welcome to Alumni Platform 🎓",
        html: `
      <h2>Hi ${displayName}, welcome aboard!</h2>
      <p>Your account has been created. You can now log in and explore the platform.</p>
      <p>If you registered as an <strong>alumni</strong>, your account will be verified by an admin shortly.</p>
      <br/>
      <p>— The Alumni Platform Team</p>
    `,
    });
};

/**
 * Mentor request notification email.
 */
const sendMentorRequestEmail = async (to, mentorName, studentEmail) => {
    return sendEmail({
        to,
        subject: "New Mentorship Request",
        html: `
      <h2>Hi ${mentorName},</h2>
      <p>You have received a new mentorship request from <strong>${studentEmail}</strong>.</p>
      <p>Log in to the platform to accept or reject the request.</p>
      <br/>
      <p>— Alumni Platform</p>
    `,
    });
};

module.exports = { sendEmail, sendWelcomeEmail, sendMentorRequestEmail };
