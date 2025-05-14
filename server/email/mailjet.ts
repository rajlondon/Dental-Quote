import Mailjet from 'node-mailjet';

// Check for required environment variables
if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
  console.warn('Missing Mailjet API credentials. Email functionality will not work.');
}

// Initialize Mailjet client if credentials are available
const mailjet = process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY
  ? Mailjet.apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_SECRET_KEY
    )
  : null;

const DEFAULT_FROM_EMAIL = 'support@mydentalfly.com';
const DEFAULT_FROM_NAME = 'MyDentalFly Support';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
}

/**
 * Sends an email using Mailjet
 * 
 * @param options Email options including to, subject, text, html
 * @returns Promise resolving to boolean indicating success
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // If Mailjet is not configured, log a warning and return false
  if (!mailjet) {
    console.warn('Mailjet is not configured. Cannot send email.');
    return false;
  }

  try {
    const { to, subject, text, html, from = DEFAULT_FROM_EMAIL, fromName = DEFAULT_FROM_NAME, replyTo } = options;

    // Build the request
    const request = {
      Messages: [
        {
          From: {
            Email: from,
            Name: fromName
          },
          To: [
            {
              Email: to
            }
          ],
          Subject: subject,
          TextPart: text || '',
          HTMLPart: html || ''
        }
      ]
    };

    // Add reply-to if provided
    if (replyTo) {
      request.Messages[0].ReplyTo = {
        Email: replyTo
      };
    }

    // Send the email
    const response = await mailjet
      .post('send', { version: 'v3.1' })
      .request(request);

    console.log('Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Sends a welcome email to a new user
 * 
 * @param email User's email address
 * @param name User's name
 * @returns Promise resolving to boolean indicating success
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const subject = 'Welcome to MyDentalFly';
  const text = `
Hello ${name},

Welcome to MyDentalFly, your gateway to premium dental care!

We're excited to have you on board. With MyDentalFly, you can:
- Explore top-rated dental clinics in Istanbul
- Compare treatments and prices
- Get personalized quotes
- Book your dental procedures with confidence

If you have any questions, feel free to reply to this email.

Best regards,
The MyDentalFly Team
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to MyDentalFly</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .logo { max-width: 200px; }
    h1 { color: #4361ee; }
    .section { margin-bottom: 20px; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://mydentalfly.com/logo.png" alt="MyDentalFly Logo" class="logo">
      <h1>Welcome to MyDentalFly</h1>
    </div>
    
    <div class="section">
      <p>Hello ${name},</p>
      <p>Welcome to MyDentalFly, your gateway to premium dental care!</p>
      <p>We're excited to have you on board. With MyDentalFly, you can:</p>
      <ul>
        <li>Explore top-rated dental clinics in Istanbul</li>
        <li>Compare treatments and prices</li>
        <li>Get personalized quotes</li>
        <li>Book your dental procedures with confidence</li>
      </ul>
      <p>If you have any questions, feel free to reply to this email.</p>
    </div>
    
    <div class="section">
      <p>Best regards,<br>The MyDentalFly Team</p>
    </div>
    
    <div class="footer">
      <p>MyDentalFly - Your Gateway to Premium Dental Care</p>
      <p>© ${new Date().getFullYear()} MyDentalFly. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to: email,
    subject,
    text,
    html
  });
}

/**
 * Sends a password reset email to a user
 * 
 * @param email User's email address
 * @param resetToken Password reset token
 * @returns Promise resolving to boolean indicating success
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const resetLink = `https://mydentalfly.com/reset-password?token=${resetToken}`;
  const subject = 'Reset Your MyDentalFly Password';
  const text = `
Hello,

You recently requested to reset your password for your MyDentalFly account.

Please click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you did not request a password reset, please ignore this email or contact us if you have questions.

Best regards,
The MyDentalFly Team
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your MyDentalFly Password</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .logo { max-width: 200px; }
    h1 { color: #4361ee; }
    .section { margin-bottom: 20px; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4361ee; color: white; text-decoration: none; border-radius: 4px; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://mydentalfly.com/logo.png" alt="MyDentalFly Logo" class="logo">
      <h1>Reset Your Password</h1>
    </div>
    
    <div class="section">
      <p>Hello,</p>
      <p>You recently requested to reset your password for your MyDentalFly account.</p>
      <p>Please click the button below to reset your password:</p>
      <p style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request a password reset, please ignore this email or contact us if you have questions.</p>
    </div>
    
    <div class="section">
      <p>Best regards,<br>The MyDentalFly Team</p>
    </div>
    
    <div class="footer">
      <p>MyDentalFly - Your Gateway to Premium Dental Care</p>
      <p>© ${new Date().getFullYear()} MyDentalFly. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to: email,
    subject,
    text,
    html
  });
}

// Mock function for testing in environments without Mailjet credentials
export async function mockSendEmail(options: EmailOptions): Promise<boolean> {
  console.log('MOCK EMAIL:', options);
  return true;
}

export default {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  mockSendEmail
};