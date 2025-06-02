// Simple production deployment entry point
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

console.log('🚀 MyDentalFly Production Server v4.0 - Complete Authentication System');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.set('trust proxy', 1);

// CORS
app.use(cors({
  origin: ['https://mydentalfly.com', 'https://www.mydentalfly.com', 'https://mydentalfly.co.uk', 'https://www.mydentalfly.co.uk'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'mydentalfly-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      
      if (!user || !await bcrypt.compare(password, user.password)) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth Strategy
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret) {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      let user = result.rows[0];
      
      if (!user) {
        const insertResult = await pool.query(
          'INSERT INTO users (email, first_name, last_name, role, email_verified, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [email, profile.name.givenName, profile.name.familyName, 'patient', true, 'active']
        );
        user = insertResult.rows[0];
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    server: 'production-v4',
    timestamp: new Date().toISOString(),
    auth: {
      googleOAuth: !!(googleClientId && googleClientSecret),
      database: !!process.env.DATABASE_URL
    }
  });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, firstName, lastName, email, password, phone } = req.body;
    const name = fullName || (firstName && lastName ? `${firstName} ${lastName}` : '');
    const [fName, ...lNameParts] = name.split(' ');
    const lName = lNameParts.join(' ');
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide full name, email address, and password" 
      });
    }
    
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "An account with this email address already exists.",
        field: "email",
        action: "login"
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, first_name, last_name, password, phone, role, email_verified, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [email.toLowerCase(), fName, lName, hashedPassword, phone, 'patient', false, 'pending']
    );
    
    const user = result.rows[0];
    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email for verification instructions.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Registration failed. Please try again." 
    });
  }
});

app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
  res.json({ success: true, user: req.user });
});

app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

app.get('/api/auth/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  res.json({ success: true, user: req.user });
});

// Google OAuth routes
if (googleClientId && googleClientSecret) {
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/?auth=failed' }),
    (req, res) => {
      const user = req.user;
      // Redirect to homepage with success indicator since user is now authenticated
      res.redirect('/?auth=success&method=google');
    }
  );
} else {
  console.log('⚠️ Google OAuth not configured - missing credentials');
}

// Static files
const staticPath = path.join(__dirname, 'dist');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'MyDentalFly Server v4.0', 
      status: 'ready',
      environment: process.env.NODE_ENV || 'development'
    });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Google OAuth: ${!!(googleClientId && googleClientSecret) ? 'enabled' : 'disabled'}`);
  console.log(`💾 Database: ${!!process.env.DATABASE_URL ? 'connected' : 'not configured'}`);
});