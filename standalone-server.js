// Standalone Production Server - Zero Dependencies
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const path = require('path');

console.log('🚀 MyDentalFly Standalone Server Starting...');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: [
    'https://mydentalfly.com', 
    'https://www.mydentalfly.com', 
    'https://mydentalfly.co.uk', 
    'https://www.mydentalfly.co.uk'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'mydentalfly-standalone-' + Date.now(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Check OAuth credentials
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('OAuth Configuration Check:');
console.log('- Google Client ID:', googleClientId ? 'Present' : 'Missing');
console.log('- Google Client Secret:', googleClientSecret ? 'Present' : 'Missing');

// Google OAuth Strategy
if (googleClientId && googleClientSecret) {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        provider: 'google'
      };
      console.log('✅ Google OAuth user authenticated:', user.email);
      return done(null, user);
    } catch (error) {
      console.error('❌ OAuth error:', error);
      return done(error);
    }
  }));

  console.log('✅ Google OAuth strategy configured');
} else {
  console.log('⚠️ Google OAuth not configured - missing environment variables');
}

// Passport serialization
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: 'standalone-production',
    timestamp: new Date().toISOString(),
    authentication: {
      googleOAuth: !!(googleClientId && googleClientSecret)
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Standalone server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
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
      console.log('✅ Google OAuth callback successful for:', req.user?.email);
      res.redirect('/?auth=success&method=google');
    }
  );

  console.log('✅ Google OAuth routes registered');
} else {
  // Fallback routes when OAuth not configured
  app.get('/api/auth/google', (req, res) => {
    res.status(503).json({ 
      error: 'Google OAuth not configured',
      message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
    });
  });

  app.get('/api/auth/google/callback', (req, res) => {
    res.redirect('/?auth=failed&reason=not_configured');
  });

  console.log('⚠️ OAuth fallback routes registered');
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
      name: req.user.name,
      provider: req.user.provider
    }
  });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

// Landing page
app.get('/', (req, res) => {
  const authStatus = req.query.auth;
  const authMethod = req.query.method;
  
  if (req.isAuthenticated()) {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MyDentalFly - Dashboard</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .content { background: #f8fafc; padding: 20px; border-radius: 8px; }
            .btn { background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome back, ${req.user.name}!</h1>
            <p>Email: ${req.user.email}</p>
          </div>
          <div class="content">
            <p>✅ You are successfully authenticated with MyDentalFly.</p>
            <p>🔐 Authentication Provider: ${req.user.provider}</p>
            <p><a href="/api/auth/logout" class="btn">Logout</a></p>
          </div>
        </body>
      </html>
    `);
  } else {
    let message = 'Premium Dental Tourism Platform for UK & Europe';
    if (authStatus === 'success') {
      message = `✅ Welcome! You're now logged in via ${authMethod || 'authentication'}.`;
    } else if (authStatus === 'failed') {
      message = '❌ Authentication failed. Please try again.';
    }

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MyDentalFly - Premium Dental Tourism</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
            .content { text-align: center; }
            .auth-btn { background: #4285f4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .status { background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .links a { margin: 0 15px; color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MyDentalFly</h1>
            <p>Premium Dental Tourism Platform</p>
          </div>
          <div class="content">
            <div class="status">${message}</div>
            <a href="/api/auth/google" class="auth-btn">🔐 Sign in with Google</a>
            <div class="links">
              <a href="/api/health">System Status</a>
              <a href="/api/test">Server Test</a>
            </div>
          </div>
        </body>
      </html>
    `);
  }
});

// Catch-all route
app.get('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    server: 'standalone-production',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MyDentalFly Standalone Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔐 Google OAuth: ${!!(googleClientId && googleClientSecret) ? 'Enabled' : 'Disabled'}`);
  console.log('🚀 Ready for production deployment');
});