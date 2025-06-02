// Complete standalone server with Google OAuth
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 MyDentalFly Complete Server - Google OAuth Enabled');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Replit
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: ['https://mydentalfly.com', 'https://www.mydentalfly.com', 'https://mydentalfly.co.uk', 'https://www.mydentalfly.co.uk'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'mydentalfly-session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('Google OAuth Check:', {
  clientId: googleClientId ? 'Present' : 'Missing',
  clientSecret: googleClientSecret ? 'Present' : 'Missing'
});

if (googleClientId && googleClientSecret) {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Simple user object for testing
      const user = {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        role: 'patient'
      };
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  console.log('✅ Google OAuth strategy configured');
} else {
  console.log('❌ Google OAuth not configured - missing credentials');
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    server: 'complete-standalone',
    timestamp: new Date().toISOString(),
    auth: {
      googleOAuth: !!(googleClientId && googleClientSecret)
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Complete server is running',
    timestamp: new Date().toISOString(),
    google: !!(googleClientId && googleClientSecret)
  });
});

// Google OAuth routes
if (googleClientId && googleClientSecret) {
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/?auth=failed' }),
    (req, res) => {
      console.log('Google OAuth callback successful for user:', req.user?.email);
      res.redirect('/?auth=success&method=google');
    }
  );
  
  console.log('✅ Google OAuth routes registered');
} else {
  console.log('❌ Google OAuth routes not registered - missing credentials');
}

// Basic auth check
app.get('/api/auth/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true, user: req.user });
});

// Serve static files
const staticPath = path.join(__dirname, 'dist');
app.use(express.static(staticPath));

// Root route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>MyDentalFly</title></head>
      <body>
        <h1>MyDentalFly Server</h1>
        <p>Server Status: Running</p>
        <p>Google OAuth: ${!!(googleClientId && googleClientSecret) ? 'Enabled' : 'Disabled'}</p>
        <p><a href="/api/auth/google">Sign in with Google</a></p>
        <p><a href="/api/health">Health Check</a></p>
        <p><a href="/api/test">Test Endpoint</a></p>
      </body>
    </html>
  `);
});

// Catch all route
app.get('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    server: 'complete-standalone'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Google OAuth: ${!!(googleClientId && googleClientSecret) ? 'enabled' : 'disabled'}`);
});