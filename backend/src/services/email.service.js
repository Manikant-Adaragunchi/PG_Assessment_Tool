const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Create Transporter
// In Production: Use valid SMTP (SendGrid, AWS SES, Gmail, etc)
// In Development: Can use Ethereal or just Console Log if vars missing
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass'
  }
});

exports.sendOnboardingEmail = async (email, password, role, fullName = 'User') => {
  try {
    if (!process.env.SMTP_HOST) {
      logger.info(`[MOCK EMAIL] To: ${email} | Pwd: ${password} | Role: ${role}`);
      return;
    }

    const loginLink = 'http://localhost:5173/login'; // Env var in prod

    const info = await transporter.sendMail({
      from: '"SDM Medical Science and Hospital Admin" <admin@sdmmedical.edu>',
      to: email,
      subject: 'Welcome to SDM Medical Science and Hospital - Your Login Credentials',
      html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
  <div style="max-width: 600px; margin: auto; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px;">
    
    <h2 style="color: #0066cc; text-align: center;">Welcome to SDM Medical Science and Hospital</h2>
    <p>Dear <b>${fullName}</b>,</p>

    <p>Your account has been successfully created in the <b>SDM Medical Science and Hospital – PG Assessment Tool</b>.</p>

    <h3 style="color: #0066cc;">Your Login Credentials</h3>
    <p><b>Email:</b> ${email}</p>
    <p><b>Your Unique Login Code:</b> 
      <span style="display:inline-block;background:#f4f4f4;padding:8px 12px;border-radius:4px;font-size:15px;">
        ${password}
      </span>
    </p>

    <p>You can log in using the link below:</p>
    <p>
      <a href="${loginLink}" 
         style="background:#0066cc;color:#fff;padding:10px 16px;text-decoration:none;border-radius:5px;display:inline-block;">
        Login to SDM Medical Science and Hospital
      </a>
    </p>

    <br/>

    <h3 style="color: #0066cc;">Next Steps</h3>
    <ol>
      <li>Use the login code above to access your account.</li>
      <li>After your first login, you can update your password.</li>
      <li>For any issues, contact the HOD or Admin.</li>
    </ol>

    <br/>
    <p>Regards,<br/>
    <b>SDM Medical Science and Hospital Administration Team</b></p>

  </div>
</body>
</html>
            `
    });

    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error('Email Send Error:', error);
    // Don't crash the request if email fails, but log it
    logger.warn(`[FALLBACK] To: ${email} | Pwd: ${password}`);
  }
};
