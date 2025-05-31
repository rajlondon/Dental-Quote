const nodeMailjet = require('node-mailjet');

const mailjet = nodeMailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

async function sendVerificationEmail() {
  try {
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [{
        From: {
          Email: 'noreply@mydentalfly.co.uk',
          Name: 'MyDentalFly'
        },
        To: [{
          Email: 'rajsingh140186@googlemail.com',
          Name: 'Raj Singh'
        }],
        Subject: 'Welcome to MyDentalFly - Please Verify Your Email',
        HTMLPart: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to MyDentalFly!</h2>
            <p>Thank you for registering with MyDentalFly. Please click the link below to verify your email address:</p>
            <a href="https://mydentalfly.co.uk/verify-email?token=5d6fa8fae33b37454d76c3ae760cc9ecf7856518ab1bb5f22c83cb4f0b41e4f9" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Verify Email Address</a>
            <p>If you didn't create this account, please ignore this email.</p>
            <p>Best regards,<br>The MyDentalFly Team</p>
          </div>
        `
      }]
    });
    
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Failed to send verification email:', error.message);
  }
}

sendVerificationEmail();