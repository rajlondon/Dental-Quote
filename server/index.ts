import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import cors from "cors";
import { logError } from "./services/error-logger";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Pool } from "@neondatabase/serverless";
import nodeMailjet from "node-mailjet";
import { setupGoogleAuth } from "./auth/google-auth";
import fs from "fs";

// Load environment variables from .env file
function loadEnvironmentVariables() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContents = fs.readFileSync(envPath, 'utf8');
      envContents.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^['"](.*)['"]$/, '$1');
            if (key.trim() && value) {
              process.env[key.trim()] = value;
            }
          }
        }
      });
      log('Environment variables loaded from .env file');
    }
  } catch (error) {
    log('Warning: Could not load .env file:', error);
  }
}

// Load environment variables before anything else
loadEnvironmentVariables();

// Log Google OAuth configuration status
log('Google OAuth Configuration:');
log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Present' : 'Missing');
log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing');

// Make sure Stripe env variables are set
if (!process.env.STRIPE_SECRET_KEY) {
  // Copy from environment secrets if available
  if (process.env.REPLIT_STRIPE_SECRET_KEY) {
    process.env.STRIPE_SECRET_KEY = process.env.REPLIT_STRIPE_SECRET_KEY;
    log("STRIPE_SECRET_KEY set from REPLIT_STRIPE_SECRET_KEY");
  } else {
    log("WARNING: STRIPE_SECRET_KEY environment variable is not set");
    // Set a placeholder for development - DO NOT use in production
    if (process.env.NODE_ENV !== 'production') {
      process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder';
      log("Using placeholder STRIPE_SECRET_KEY for development");
    }
  }
}

const app = express();
// Enable trust proxy for rate limiters in Replit environment
app.set('trust proxy', 1);

// Configure CORS to explicitly support credentials
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://mydentalfly.com', 'https://www.mydentalfly.com', 'https://mydentalfly.co.uk', 'https://www.mydentalfly.co.uk'] 
    : ['http://localhost:5000', 'http://0.0.0.0:5000', 'http://127.0.0.1:5000', 'https://4a8d63a8-0c27-4d42-977b-381f0b8a3327-00-2nulpa5o3ztvp.worf.replit.dev'],
  credentials: true, // CRITICAL: This allows cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize database connection for registration
let db: any = null;
if (process.env.DATABASE_URL) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = pool;
  log('Database connection initialized for registration');
}

// Initialize Mailjet for registration emails
let mailjet: any = null;
if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) {
  mailjet = nodeMailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY
  );
  log('Mailjet connection initialized for registration');
}

// Test endpoint to verify deployment
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ 
    message: 'MyDentalFly API is running', 
    timestamp: new Date().toISOString(),
    version: '2.0',
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Simple connectivity test
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: !!db,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      mailjet: !!(process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY),
      gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

// Admin endpoint to delete user by email
app.delete('/api/admin/user/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database not available'
      });
    }

    const result = await db.query(
      'DELETE FROM users WHERE email = $1 RETURNING email',
      [email.toLowerCase()]
    );

    if (result.rows.length > 0) {
      log(`User deleted: ${email}`);
      res.json({
        success: true,
        message: `User ${email} deleted successfully`
      });
    } else {
      res.status(404).json({
        success: false,
        message: `User ${email} not found`
      });
    }
  } catch (error) {
    log(`Delete user error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Registration endpoint - must be before other routes
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    log('Registration request received');
    
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
        field: missingFields[0] // For frontend to focus on first missing field
      });
    }

    if (!db) {
      log('Database not available for registration');
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
        action: 'login' // Suggests user should try logging in instead
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
    log(`User created successfully: ${newUser.email}`);

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
        
        log(`Verification email sent to ${email}`);
      } catch (emailError) {
        log(`Failed to send verification email: ${emailError}`);
        // Still return success since user was created, but note email issue
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
    log(`Registration error: ${error}`);
    
    // Handle specific database constraint errors
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

// Frontend verification route handler - redirects to API endpoint
app.get('/verify-email', async (req: Request, res: Response) => {
  const { token } = req.query;
  if (token) {
    // Redirect to the actual API endpoint
    return res.redirect(`/api/auth/verify-email?token=${token}`);
  }
  res.status(400).send('Invalid verification link');
});

// Email verification endpoint
app.get('/api/auth/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || !db) {
      return res.status(400).send('Invalid verification link');
    }

    const result = await db.query(
      'UPDATE users SET email_verified = true, email_verification_token = NULL, status = \'active\' WHERE email_verification_token = $1 RETURNING email, first_name',
      [token as string]
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
    log(`Email verification error: ${error}`);
    res.status(500).send('Verification failed. Please try again.');
  }
});

(async () => {
  const server = await registerRoutes(app);

  // Only apply our custom error handlers to API routes
  // This prevents interference with Vite's handling of frontend routes
  app.use('/api', notFoundHandler);
  app.use('/api', errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // Serve static files from the dist/public directory
    app.use(express.static(join(__dirname, '../dist/public')));
    
    // Handle API routes before the catch-all
    app.use('/api', (req, res, next) => next());
    
    // Serve index.html for client-side routing
    app.get('*', (req, res) => {
      res.sendFile(join(__dirname, '../dist/public/index.html'));
    });
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 3000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
    log(`Server is accessible at http://0.0.0.0:${port}`);
    log(`For Replit environments, use the "Open in new tab" button`);
  });
})();
