// Simple production server for MyDentalFly registration
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Pool } from '@neondatabase/serverless';
import nodeMailjet from 'node-mailjet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Domain redirect
app.use((req, res, next) => {
  const host = req.get('host');
  if (host && host.includes('mydentalfly.com')) {
    return res.redirect(301, `https://mydentalfly.co.uk${req.originalUrl}`);
  }
  next();
});

// Database connection
let db = null;
if (process.env.DATABASE_URL) {
  db = new Pool({ connectionString: process.env.DATABASE_URL });
  console.log('Database connected');
}

// Mailjet connection
let mailjet = null;
if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) {
  mailjet = nodeMailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY
  );
  console.log('Mailjet connected');
}

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body.email);
    
    const { fullName, email, phone, password, consent } = req.body;
    
    if (!fullName || !email || !password || !consent) {
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

    // Check existing user
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Account already exists'
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const [firstName, ...lastNameParts] = fullName.trim().split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const result = await db.query(`
      INSERT INTO users (first_name, last_name, email, phone, password, email_verification_token, email_verified, status, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, false, 'pending', 'patient', NOW())
      RETURNING id, email, first_name, last_name
    `, [firstName, lastName, email.toLowerCase(), phone, hashedPassword, verificationToken]);

    const newUser = result.rows[0];
    console.log('User created:', newUser.email);

    // Send email
    if (mailjet) {
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;
      
      await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [{
          From: { Email: 'noreply@mydentalfly.com', Name: 'MyDentalFly' },
          To: [{ Email: email, Name: fullName }],
          Subject: 'Verify your email address',
          HTMLPart: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to MyDentalFly!</h2>
              <p>Hello ${firstName},</p>
              <p>Please verify your email address:</p>
              <p><a href="${verificationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
              <p>Or copy this link: ${verificationUrl}</p>
            </div>
          `
        }]
      });
      
      console.log('Verification email sent to:', email);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Check your email for verification.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
});

// Email verification
app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token || !db) {
      return res.status(400).send('Invalid verification link');
    }

    const result = await db.query(`
      UPDATE users 
      SET email_verified = true, email_verification_token = NULL, status = 'active' 
      WHERE email_verification_token = $1 
      RETURNING first_name
    `, [token]);

    if (result.rows.length === 0) {
      return res.status(400).send('Invalid or expired verification link');
    }

    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; text-align: center;">
        <h2>Email Verified!</h2>
        <p>Your email has been verified successfully.</p>
        <p><a href="/portal">Login to your account</a></p>
      </div>
    `);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send('Verification failed');
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
  console.log(`MyDentalFly server running on port ${PORT}`);
  console.log(`Database: ${db ? 'Connected' : 'Not connected'}`);
  console.log(`Mailjet: ${mailjet ? 'Connected' : 'Not connected'}`);
});