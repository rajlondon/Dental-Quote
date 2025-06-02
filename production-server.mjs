// MyDentalFly Production Server - Unified Architecture
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodeMailjet from 'node-mailjet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 MyDentalFly Production Server Starting...');
console.log('📂 Directory:', __dirname);
console.log('🌍 Environment:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for production deployment
app.set('trust proxy', 1);

// Production CORS configuration
app.use(cors({
  origin: [
    'https://mydentalfly.com', 
    'https://www.mydentalfly.com', 
    'https://mydentalfly.co.uk', 
    'https://www.mydentalfly.co.uk'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize database connection
let db = null;
if (process.env.DATABASE_URL) {
  try {
    db = new Pool({ connectionString: process.env.DATABASE_URL });
    console.log('✅ Database connection initialized');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
} else {
  console.log('⚠️ DATABASE_URL not configured');
}

// Initialize Mailjet
let mailjet = null;
if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) {
  try {
    mailjet = nodeMailjet.apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_SECRET_KEY
    );
    console.log('✅ Mailjet connection initialized');
  } catch (error) {
    console.error('❌ Mailjet connection failed:', error);
  }
} else {
  console.log('⚠️ Mailjet not configured');
}

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'mydentalfly-production-' + Date.now(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS required in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  name: 'mydentalfly.sid'
};

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('🔐 OAuth Configuration:');
console.log('  Google Client ID:', googleClientId ? 'Present' : 'Missing');
console.log('  Google Client Secret:', googleClientSecret ? 'Present' : 'Missing');

if (googleClientId && googleClientSecret) {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔍 Google OAuth callback for:', profile.emails[0].value);
      
      if (!db) {
        return done(new Error('Database not available'));
      }

      const email = profile.emails[0].value;
      const firstName = profile.name.givenName || '';
      const lastName = profile.name.familyName || '';

      // Check if user exists
      const existingUser = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      let user;
      if (existingUser.rows.length > 0) {
        user = existingUser.rows[0];
        console.log('✅ Existing user logged in:', email);
      } else {
        // Create new user
        const result = await db.query(
          `INSERT INTO users (first_name, last_name, email, email_verified, status, role, created_at, auth_provider)
           VALUES ($1, $2, $3, true, 'active', 'patient', NOW(), 'google')
           RETURNING *`,
          [firstName, lastName, email.toLowerCase()]
        );
        user = result.rows[0];
        console.log('✅ New user created via Google:', email);
      }

      return done(null, user);
    } catch (error) {
      console.error('❌ Google OAuth error:', error);
      return done(error);
    }
  }));

  console.log('✅ Google OAuth strategy configured');
} else {
  console.log('❌ Google OAuth not configured - missing credentials');
}

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  if (!db) {
    return done(new Error('Database not available'));
  }
  
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: 'production-unified',
    timestamp: new Date().toISOString(),
    services: {
      database: !!db,
      mailjet: !!mailjet,
      googleOAuth: !!(googleClientId && googleClientSecret)
    }
  });
});

// Google OAuth routes
if (googleClientId && googleClientSecret) {
  app.get('/api/auth/google',
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      prompt: 'select_account'
    })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { 
      failureRedirect: '/?auth=failed',
      failureMessage: true
    }),
    (req, res) => {
      console.log('✅ Google OAuth success for:', req.user?.email);
      res.redirect('/?auth=success&method=google');
    }
  );

  console.log('✅ Google OAuth routes registered');
}

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ authenticated: false, message: 'Authentication required' });
}

// User authentication status
app.get('/api/auth/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authenticated: false });
  }
  
  res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      role: req.user.role,
      verified: req.user.email_verified
    }
  });
});

// Email registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Registration request received');
    
    const { fullName, firstName, lastName, email, phone, password, consent } = req.body;
    
    const name = fullName || (firstName && lastName ? `${firstName} ${lastName}` : '');
    
    if (!name || !email || !password || !consent) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, and consent'
      });
    }

    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database service temporarily unavailable'
      });
    }

    // Check existing user
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Account already exists with this email address'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Split name
    const nameParts = name.trim().split(' ');
    const userFirstName = nameParts[0];
    const userLastName = nameParts.slice(1).join(' ') || '';

    // Create user
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, phone, password, email_verification_token, 
                         email_verified, status, role, created_at, auth_provider)
       VALUES ($1, $2, $3, $4, $5, $6, false, 'pending', 'patient', NOW(), 'email')
       RETURNING id, email, first_name, last_name`,
      [userFirstName, userLastName, email.toLowerCase(), phone, hashedPassword, verificationToken]
    );

    const newUser = result.rows[0];
    console.log('✅ User created:', newUser.email);

    // Send verification email
    if (mailjet) {
      try {
        const verificationUrl = `https://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;
        
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
            Subject: 'Verify your MyDentalFly account',
            HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">Welcome to MyDentalFly!</h2>
                <p>Hello ${userFirstName},</p>
                <p>Thank you for joining MyDentalFly. Please verify your email address to activate your account:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" 
                     style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Verify Email Address
                  </a>
                </div>
                <p>Or copy this link: ${verificationUrl}</p>
                <p>Best regards,<br>The MyDentalFly Team</p>
              </div>
            `
          }]
        });
        
        console.log('✅ Verification email sent to:', email);
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
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
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
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

    const result = await db.query(
      `UPDATE users SET email_verified = true, email_verification_token = NULL, status = 'active' 
       WHERE email_verification_token = $1 RETURNING email, first_name`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).send('Invalid or expired verification link');
    }

    const user = result.rows[0];
    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; text-align: center; padding: 20px;">
        <h2 style="color: #2563eb;">Email Verified Successfully!</h2>
        <p>Hello ${user.first_name}, your email has been verified.</p>
        <p><a href="/" style="color: #2563eb;">Continue to MyDentalFly</a></p>
      </div>
    `);
  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).send('Verification failed. Please try again.');
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Session cleanup failed' });
      }
      res.clearCookie('mydentalfly.sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

// Serve static files
const staticPath = path.join(__dirname, 'dist');
if (staticPath) {
  app.use(express.static(staticPath));
}

// Root route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`
      <html>
        <head><title>MyDentalFly - Dashboard</title></head>
        <body>
          <h1>Welcome back, ${req.user.first_name}!</h1>
          <p>You are successfully logged in to MyDentalFly.</p>
          <p><a href="/api/auth/logout">Logout</a></p>
        </body>
      </html>
    `);
  } else {
    res.send(`
      <html>
        <head><title>MyDentalFly - Premium Dental Tourism</title></head>
        <body>
          <h1>MyDentalFly</h1>
          <p>Premium Dental Tourism Platform</p>
          <p><a href="/api/auth/google">Sign in with Google</a></p>
          <p><a href="/api/health">System Status</a></p>
        </body>
      </html>
    `);
  }
});

// Catch-all for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      error: 'Not Found',
      path: req.path,
      server: 'production-unified'
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MyDentalFly Production Server running on port ${PORT}`);
  console.log(`🌍 Server accessible at http://0.0.0.0:${PORT}`);
  console.log(`🔐 Authentication: ${!!(googleClientId && googleClientSecret) ? 'Enabled' : 'Disabled'}`);
  console.log(`📧 Email service: ${!!mailjet ? 'Enabled' : 'Disabled'}`);
  console.log(`💾 Database: ${!!db ? 'Connected' : 'Disconnected'}`);
});