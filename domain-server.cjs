/**
 * Full application server for MyDentalFly domains
 * CommonJS module with registration and full app functionality
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Pool } = require('@neondatabase/serverless');
const nodeMailjet = require('node-mailjet');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment variables
const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;
const MAILJET_API_KEY = process.env.MAILJET_API_KEY;
const MAILJET_SECRET_KEY = process.env.MAILJET_SECRET_KEY;

// Database connection
let db;
if (DATABASE_URL) {
  db = new Pool({ 
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// Mailjet connection
let mailjet;
if (MAILJET_API_KEY && MAILJET_SECRET_KEY) {
  mailjet = nodeMailjet.apiConnect(
    MAILJET_API_KEY,
    MAILJET_SECRET_KEY
  );
}

// Test endpoint to verify deployment
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Registration server updated with improved error handling', 
    timestamp: new Date().toISOString(),
    version: '3.1'
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

// Serve static files
app.use(express.static('dist'));

// Catch-all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`MyDentalFly server running on port ${PORT}`);
});

module.exports = server;