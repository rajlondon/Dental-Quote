// Production server for MyDentalFly domains
const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Pool } = require('@neondatabase/serverless');
const nodeMailjet = require('node-mailjet');

const app = express();

// Debug mode for Replit environment
const DEBUG = process.env.DEBUG || false;

// Load environment variables and secrets
function loadEnvironment() {
  try {
    console.log('Loading environment variables...');
    
    // First try to load from .env file
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('Loading from .env file');
      const envContents = fs.readFileSync(envPath, 'utf8');
      envContents.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
          const parts = line.split('=');
          if (parts.length >= 2) {
            const key = parts[0].trim();
            // Join back in case there are multiple = in the value
            const value = parts.slice(1).join('=').trim().replace(/^['"](.*)['"]$/, '$1'); // Remove quotes if present
            
            if (key && value) {
              process.env[key] = value;
              if (DEBUG) console.log(`Loaded ${key} from .env file`);
            }
          }
        }
      });
    }

    // Explicitly set critical variables from environment - use fallbacks if needed
    console.log('Setting critical environment variables...');
    
    // Force direct assignment of Stripe variables from environment
    if (process.env.STRIPE_SECRET_KEY) {
      console.log('STRIPE_SECRET_KEY already set in environment');
    } else {
      // Try different possible environment variable names for Stripe Secret Key
      const possibleSecretKeyNames = [
        'STRIPE_SECRET_KEY', 'REPLIT_STRIPE_SECRET_KEY', 
        'STRIPE_SK', 'REPLIT_STRIPE_SK'
      ];
      
      for (const varName of possibleSecretKeyNames) {
        if (process.env[varName]) {
          process.env.STRIPE_SECRET_KEY = process.env[varName];
          console.log(`Set STRIPE_SECRET_KEY from ${varName}`);
          break;
        }
      }
      
      // If still not set, use a placeholder for development only
      if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'production') {
        console.log('WARNING: Using placeholder STRIPE_SECRET_KEY for development');
        process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder_for_development_only';
      }
    }
    
    // Same for public key
    if (process.env.STRIPE_PUBLIC_KEY) {
      console.log('STRIPE_PUBLIC_KEY already set in environment');
    } else {
      const possiblePublicKeyNames = [
        'STRIPE_PUBLIC_KEY', 'REPLIT_STRIPE_PUBLIC_KEY',
        'STRIPE_PK', 'REPLIT_STRIPE_PK'
      ];
      
      for (const varName of possiblePublicKeyNames) {
        if (process.env[varName]) {
          process.env.STRIPE_PUBLIC_KEY = process.env[varName];
          console.log(`Set STRIPE_PUBLIC_KEY from ${varName}`);
          break;
        }
      }
      
      // If still not set, use a placeholder for development only
      if (!process.env.STRIPE_PUBLIC_KEY && process.env.NODE_ENV !== 'production') {
        console.log('WARNING: Using placeholder STRIPE_PUBLIC_KEY for development');
        process.env.STRIPE_PUBLIC_KEY = 'pk_test_placeholder_for_development_only';
      }
    }
    
    // Same for Vite public key
    if (process.env.VITE_STRIPE_PUBLIC_KEY) {
      console.log('VITE_STRIPE_PUBLIC_KEY already set in environment');
    } else {
      if (process.env.STRIPE_PUBLIC_KEY) {
        process.env.VITE_STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY;
        console.log('Set VITE_STRIPE_PUBLIC_KEY from STRIPE_PUBLIC_KEY');
      } else {
        const possibleViteKeyNames = [
          'VITE_STRIPE_PUBLIC_KEY', 'REPLIT_VITE_STRIPE_PUBLIC_KEY'
        ];
        
        for (const varName of possibleViteKeyNames) {
          if (process.env[varName]) {
            process.env.VITE_STRIPE_PUBLIC_KEY = process.env[varName];
            console.log(`Set VITE_STRIPE_PUBLIC_KEY from ${varName}`);
            break;
          }
        }
      }
      
      // If still not set, use a placeholder for development only
      if (!process.env.VITE_STRIPE_PUBLIC_KEY && process.env.NODE_ENV !== 'production') {
        console.log('WARNING: Using placeholder VITE_STRIPE_PUBLIC_KEY for development');
        process.env.VITE_STRIPE_PUBLIC_KEY = 'pk_test_placeholder_for_development_only';
      }
    }

    // Log environment status
    console.log('Environment variables status:');
    console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET');
    console.log('- STRIPE_PUBLIC_KEY:', process.env.STRIPE_PUBLIC_KEY ? 'SET' : 'NOT SET');
    console.log('- VITE_STRIPE_PUBLIC_KEY:', process.env.VITE_STRIPE_PUBLIC_KEY ? 'SET' : 'NOT SET');
    
    return true;
  } catch (error) {
    console.error('Error loading environment:', error);
    return false;
  }
}

// Load environment variables
loadEnvironment();

// Domain redirect middleware - redirect .com to .co.uk
app.use((req, res, next) => {
  const host = req.get('host');
  
  // If request comes from .com domain, redirect to .co.uk
  if (host && host.includes('mydentalfly.com')) {
    const redirectUrl = `https://mydentalfly.co.uk${req.originalUrl}`;
    console.log(`Redirecting ${host} to mydentalfly.co.uk`);
    return res.redirect(301, redirectUrl);
  }
  
  next();
});

// Configure Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Test endpoint to verify deployment
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server updated successfully', 
    timestamp: new Date().toISOString(),
    version: '2.0'
  });
});

// Registration endpoint with database and email support
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
        
        console.log(`Verification email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
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

    // Find user with this verification token
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

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// For single page application routing - send index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MyDentalFly production server running on port ${PORT}`);
  console.log(`Database: ${db ? 'Connected' : 'Not available'}`);
  console.log(`Mailjet: ${mailjet ? 'Connected' : 'Not available'}`);
  console.log(`Registration endpoint: /api/auth/register`);
});