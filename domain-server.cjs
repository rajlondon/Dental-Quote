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
    message: 'Server updated successfully', 
    timestamp: new Date().toISOString(),
    version: '2.0'
  });
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, firstName, lastName, email, phone, password, consent, consentcontacts } = req.body;
    
    // Handle both fullName and firstName/lastName formats
    const name = fullName || (firstName && lastName ? `${firstName} ${lastName}` : '');
    const userConsent = consent || consentcontacts;
    
    if (!name || !email || !password || !userConsent) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT email FROM users WHERE email = $1',
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
    console.log('User created successfully:', newUser.email);

    // Send verification email
    if (mailjet) {
      try {
        const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;
        
        await mailjet.post('send', { version: 'v3.1' }).request({
          Messages: [{
            From: {
              Email: 'noreply@mydentalfly.com',
              Name: 'MyDentalFly'
            },
            To: [{
              Email: email,
              Name: name
            }],
            Subject: 'Verify Your MyDentalFly Account',
            HTMLPart: `
              <h2>Welcome to MyDentalFly!</h2>
              <p>Thank you for registering with MyDentalFly. Please click the link below to verify your email address:</p>
              <p><a href="${verificationUrl}" style="background-color: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
              <p>If you didn't create this account, please ignore this email.</p>
            `
          }]
        });
        
        console.log('Verification email sent to', email);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
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
    console.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
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