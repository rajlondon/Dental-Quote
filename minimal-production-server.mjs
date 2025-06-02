// Minimal Production Server - Google OAuth & Email Registration
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 MyDentalFly Minimal Production Server');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// CORS for production domains
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
  secret: process.env.SESSION_SECRET || 'mydentalfly-minimal-' + Date.now(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Check OAuth credentials
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('OAuth Status:', {
  googleClientId: googleClientId ? 'Present' : 'Missing',
  googleClientSecret: googleClientSecret ? 'Present' : 'Missing'
});

// Google OAuth Strategy (only if credentials available)
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
      console.log('Google OAuth user:', user.email);
      return done(null, user);
    } catch (error) {
      console.error('OAuth error:', error);
      return done(error);
    }
  }));

  console.log('Google OAuth configured');
} else {
  console.log('Google OAuth not configured - missing credentials');
}

// Passport serialization
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: 'minimal-production',
    timestamp: new Date().toISOString(),
    services: {
      googleOAuth: !!(googleClientId && googleClientSecret)
    }
  });
});

// Google OAuth routes (only if configured)
if (googleClientId && googleClientSecret) {
  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/?auth=failed' }),
    (req, res) => {
      console.log('OAuth success:', req.user?.email);
      res.redirect('/?auth=success&method=google');
    }
  );

  console.log('Google OAuth routes active');
} else {
  // Fallback routes when OAuth not configured
  app.get('/api/auth/google', (req, res) => {
    res.status(503).json({ 
      error: 'Google OAuth not configured',
      message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET'
    });
  });

  app.get('/api/auth/google/callback', (req, res) => {
    res.redirect('/?auth=failed&reason=not_configured');
  });
}

// User status endpoint
app.get('/api/auth/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authenticated: false });
  }
  
  res.json({
    authenticated: true,
    user: req.user
  });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

// Serve static files
const staticPath = path.join(__dirname, 'dist');
try {
  app.use(express.static(staticPath));
  console.log('Static files served from:', staticPath);
} catch (error) {
  console.log('Static files not available');
}

// Landing page
app.get('/', (req, res) => {
  const authStatus = req.query.auth;
  const authMethod = req.query.method;
  
  let message = 'Welcome to MyDentalFly';
  if (authStatus === 'success') {
    message = `Welcome! You're now logged in via ${authMethod || 'authentication'}.`;
  } else if (authStatus === 'failed') {
    message = 'Authentication failed. Please try again.';
  }

  if (req.isAuthenticated()) {
    res.send(`
      <html>
        <head><title>MyDentalFly - Dashboard</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px;">
          <h1>Welcome back, ${req.user.name}!</h1>
          <p>Email: ${req.user.email}</p>
          <p>You are successfully authenticated with MyDentalFly.</p>
          <p><a href="/api/auth/logout">Logout</a></p>
        </body>
      </html>
    `);
  } else {
    res.send(`
      <html>
        <head><title>MyDentalFly - Premium Dental Tourism</title></head>
        <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px;">
          <h1>MyDentalFly</h1>
          <p>Premium Dental Tourism Platform for UK & Europe</p>
          <p style="color: #666;">${message}</p>
          <div style="margin: 30px 0;">
            <a href="/api/auth/google" style="background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Sign in with Google
            </a>
          </div>
          <p><a href="/api/health">System Status</a></p>
        </body>
      </html>
    `);
  }
});

// Catch-all for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  try {
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({
        error: 'Not Found',
        path: req.path,
        server: 'minimal-production'
      });
    }
  } catch (error) {
    res.status(404).json({
      error: 'Not Found',
      path: req.path,
      server: 'minimal-production'
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Google OAuth: ${!!(googleClientId && googleClientSecret) ? 'Enabled' : 'Disabled'}`);
  console.log('Ready for production deployment');
});