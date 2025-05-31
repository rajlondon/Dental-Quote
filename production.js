// Production server for Replit deployment
// This is a simplified version without TypeScript and complex dependencies
const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Pool } = require('@neondatabase/serverless');
const nodeMailjet = require('node-mailjet');

// Create Express app
const app = express();
app.use(express.json());

// Database connection
let db = null;
if (process.env.DATABASE_URL) {
  db = new Pool({ connectionString: process.env.DATABASE_URL });
  console.log('Database connected for registration');
}

// Mailjet connection
let mailjet = null;
if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) {
  mailjet = nodeMailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY
  );
  console.log('Mailjet connected for registration');
}

// Prepare directory for static files
const staticDir = path.join(__dirname, 'public');
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
  // Create a simple index.html if it doesn't exist
  if (!fs.existsSync(path.join(staticDir, 'index.html'))) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>MyDentalFly</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; background: #f5f9fc; color: #333; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { color: #3182ce; margin-top: 0; }
    .status { background: #ebf8ff; border-left: 4px solid #3182ce; padding: 15px; margin: 20px 0; }
    button { background: #3182ce; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #2c5282; }
    pre { background: #f1f5f9; padding: 15px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>MyDentalFly</h1>
    <div class="status">
      Server is running in production mode
    </div>
    <div>
      <h2>API Status</h2>
      <button id="check-api">Check API</button>
      <pre id="result">Click button to test API</pre>
    </div>
    <div>
      <h2>Server Information</h2>
      <pre id="info"></pre>
    </div>
  </div>
  <script>
    // Display server information
    document.getElementById('info').textContent = 
      \`URL: \${window.location.href}
Host: \${window.location.host}
Protocol: \${window.location.protocol}\`;
    
    // Test API
    document.getElementById('check-api').addEventListener('click', async () => {
      const result = document.getElementById('result');
      result.textContent = 'Testing API...';
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        result.textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        result.textContent = \`Error: \${error.message}\`;
      }
    });
  </script>
</body>
</html>`;
    fs.writeFileSync(path.join(staticDir, 'index.html'), html);
  }
}

// Serve static files
app.use(express.static(staticDir));

// API endpoint for testing
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MyDentalFly API is running',
    timestamp: new Date().toISOString(),
    host: req.get('host'),
    protocol: req.protocol,
    environment: process.env.NODE_ENV || 'production'
  });
});

// Domain information endpoint
app.get('/api/domain-info', (req, res) => {
  res.json({
    domain: req.get('host'),
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration request received for:', req.body.email);
    
    const { fullName, firstName, lastName, email, phone, password, consent, consentcontacts } = req.body;
    
    // Handle both fullName and firstName/lastName formats
    const name = fullName || (firstName && lastName ? `${firstName} ${lastName}` : '');
    const userConsent = consent || consentcontacts;
    
    if (!name || !email || !password || !userConsent) {
      let missingFields = [];
      if (!name) missingFields.push('full name');
      if (!email) missingFields.push('email address');
      if (!password) missingFields.push('password');
      if (!userConsent) missingFields.push('privacy consent');
      
      return res.status(400).json({ 
        success: false, 
        message: `Please provide: ${missingFields.join(', ')}`,
        field: missingFields[0]
      });
    }

    if (!db) {
      console.error('Database not available for registration');
      return res.status(500).json({
        success: false,
        message: 'Our service is temporarily unavailable. Please try again in a few moments.',
        retry: true
      });
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please use a different email or try logging in.',
        field: 'email',
        action: 'login'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Split name into firstName and lastName
    const nameParts = name.trim().split(' ');
    const userFirstName = nameParts[0];
    const userLastName = nameParts.slice(1).join(' ') || '';

    // Insert user into database
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, phone, password, email_verification_token, email_verified, status, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, 'pending', 'patient', NOW())
       RETURNING id, email, first_name, last_name`,
      [userFirstName, userLastName, email.toLowerCase(), phone, hashedPassword, verificationToken]
    );

    const newUser = result.rows[0];
    console.log(`User created successfully: ${newUser.email}`);

    // Send verification email
    if (mailjet) {
      try {
        const verificationUrl = `https://mydentalfly.co.uk/verify-email?token=${verificationToken}`;
        
        await mailjet.post('send', { version: 'v3.1' }).request({
          Messages: [{
            From: {
              Email: 'noreply@mydentalfly.co.uk',
              Name: 'MyDentalFly'
            },
            To: [{
              Email: email.toLowerCase(),
              Name: `${userFirstName} ${userLastName}`
            }],
            Subject: 'Welcome to MyDentalFly - Please Verify Your Email',
            HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Welcome to MyDentalFly!</h2>
                <p>Thank you for registering with MyDentalFly. Please click the link below to verify your email address:</p>
                <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Verify Email Address</a>
                <p>If you didn't create this account, please ignore this email.</p>
                <p>Best regards,<br>The MyDentalFly Team</p>
              </div>
            `
          }]
        });
        
        console.log(`Verification email sent to ${email}`);
      } catch (emailError) {
        console.error(`Failed to send verification email: ${emailError}`);
        return res.status(201).json({
          success: true,
          message: 'Account created successfully! We had trouble sending the verification email. Please contact support if you need assistance.',
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.first_name,
            lastName: newUser.last_name
          },
          emailSent: false
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification instructions.',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name
      },
      emailSent: true
    });
  } catch (error) {
    console.error(`Registration error: ${error}`);
    
    if (error.message && error.message.includes('duplicate key')) {
      return res.status(400).json({ 
        success: false, 
        message: 'An account with this email address already exists. Please use a different email or try logging in.',
        field: 'email',
        action: 'login'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'We encountered an unexpected error. Please try again, and contact support if the problem continues.',
      retry: true
    });
  }
});

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on port ${PORT}`);
});