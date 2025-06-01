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

console.log('Starting MyDentalFly production server with complete authentication...');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Trust proxy for Replit
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://mydentalfly.com', 'https://www.mydentalfly.com', 'https://mydentalfly.co.uk', 'https://www.mydentalfly.co.uk'] 
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      
      if (!user) {
        return done(null, false);
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let result = await pool.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);
      let user = result.rows[0];
      
      if (!user) {
        // Create new user
        const insertResult = await pool.query(
          'INSERT INTO users (email, first_name, last_name, role, email_verified, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [profile.emails[0].value, profile.name.givenName, profile.name.familyName, 'patient', true, 'active']
        );
        user = insertResult.rows[0];
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, firstName, lastName, email, password, phone } = req.body;
    
    // Parse name
    const name = fullName || (firstName && lastName ? `${firstName} ${lastName}` : '');
    const [fName, ...lNameParts] = name.split(' ');
    const lName = lNameParts.join(' ');
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide full name, email address, and password" 
      });
    }
    
    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "An account with this email address already exists. Please use a different email or try logging in.",
        field: "email",
        action: "login"
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
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
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/portal-login?auth=failed' }),
    (req, res) => {
      const user = req.user;
      if (user.role === 'admin') {
        res.redirect('/portal/admin');
      } else if (user.role === 'clinic_staff') {
        res.redirect('/portal/clinic');
      } else {
        res.redirect('/portal');
      }
    }
  );
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    auth: {
      googleOAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      database: !!process.env.DATABASE_URL
    }
  });
});

// Serve static files
const staticPath = path.join(__dirname, 'dist');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'MyDentalFly Server Running', 
      status: 'ready',
      environment: process.env.NODE_ENV || 'development'
    });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Google OAuth:', !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) ? 'enabled' : 'disabled');
  console.log('Database:', !!process.env.DATABASE_URL ? 'connected' : 'not configured');
});