// Standalone production server for MyDentalFly
const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Pool } = require('@neondatabase/serverless');
const nodeMailjet = require('node-mailjet');

const app = express();

// Load environment variables
function loadEnvironment() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContents = fs.readFileSync(envPath, 'utf8');
      envContents.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
          const parts = line.split('=');
          if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^['"](.*)['"]$/, '$1');
            if (key && value) {
              process.env[key] = value;
            }
          }
        }
      });
    }
    return true;
  } catch (error) {
    console.error('Error loading environment:', error);
    return false;
  }
}

loadEnvironment();

// Configure Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Domain redirect middleware
app.use((req, res, next) => {
  const host = req.get('host');
  if (host && host.includes('mydentalfly.com')) {
    const redirectUrl = `https://mydentalfly.co.uk${req.originalUrl}`;
    return res.redirect(301, redirectUrl);
  }
  next();
});

// Initialize database connection
let db = null;
if (process.env.DATABASE_URL) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = pool;
  console.log('Database connection initialized');
}

// Initialize Mailjet
let mailjet = null;
if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) {
  mailjet = nodeMailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY
  );
  console.log('Mailjet connection initialized');
}

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { fullName, email, phone, password, consent } = req.body;
    
    if (!fullName || !email || !password || !consent) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (!db) {
      console.error('Database not available');
      return res.status(500).json({
        success: false,
        message: 'Database not available'
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
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Split fullName into firstName and lastName
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Insert user into database
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, phone, password, email_verification_token, email_verified, status, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, 'pending', 'patient', NOW())
       RETURNING id, email, first_name, last_name`,
      [firstName, lastName, email.toLowerCase(), phone, hashedPassword, verificationToken]
    );

    const newUser = result.rows[0];
    console.log('User created successfully:', newUser.email);

    // Send verification email
    if (mailjet) {
      try {
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;
        
        const emailResult = await mailjet.post('send', { version: 'v3.1' }).request({
          Messages: [{
            From: {
              Email: 'noreply@mydentalfly.com',
              Name: 'MyDentalFly'
            },
            To: [{
              Email: email,
              Name: fullName
            }],
            Subject: 'Please verify your email address',
            HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to MyDentalFly!</h2>
                <p>Hello ${firstName},</p>
                <p>Thank you for registering with MyDentalFly. Please click the link below to verify your email address:</p>
                <p><a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email Address</a></p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p>${verificationUrl}</p>
                <p>Best regards,<br>The MyDentalFly Team</p>
              </div>
            `
          }]
        });
        
        console.log(`Verification email sent to ${email}:`, emailResult.body);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }
    } else {
      console.error('Mailjet not configured');
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification.',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// Email verification endpoint
app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token || !db) {
      return res.status(400).send('Invalid verification link');
    }

    const result = await db.query(
      'UPDATE users SET email_verified = true, email_verification_token = NULL, status = \'active\' WHERE email_verification_token = $1 RETURNING email, first_name',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).send('Invalid or expired verification link');
    }

    const user = result.rows[0];
    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; text-align: center;">
        <h2>Email Verified Successfully!</h2>
        <p>Hello ${user.first_name}, your email has been verified.</p>
        <p>You can now <a href="/portal">login to your account</a>.</p>
      </div>
    `);
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).send('Verification failed. Please try again.');
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MyDentalFly production server running on port ${PORT}`);
  console.log(`Database: ${db ? 'Connected' : 'Not available'}`);
  console.log(`Mailjet: ${mailjet ? 'Connected' : 'Not available'}`);
  console.log(`Registration endpoint: /api/auth/register`);
});