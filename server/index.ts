import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import cors from "cors";
import { logError } from "./services/error-logger";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./db";
import { users } from "../shared/schema"; 
import { eq } from "drizzle-orm";

// Make sure Stripe env variables are set
if (!process.env.STRIPE_SECRET_KEY) {
  // Copy from environment secrets if available
  if (process.env.REPLIT_STRIPE_SECRET_KEY) {
    process.env.STRIPE_SECRET_KEY = process.env.REPLIT_STRIPE_SECRET_KEY;
    log("STRIPE_SECRET_KEY set from REPLIT_STRIPE_SECRET_KEY");
  } else {
    log("WARNING: STRIPE_SECRET_KEY environment variable is not set");
    // Set a placeholder for development - DO NOT use in production
    if (process.env.NODE_ENV !== "production") {
      process.env.STRIPE_SECRET_KEY = "sk_test_placeholder";
      log("Using placeholder STRIPE_SECRET_KEY for development");
    }
  }
}

// Check Google Auth configuration
const googleAuthConfigured = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

log("Configuration status:");
log(`- Google Auth: ${googleAuthConfigured ? "Configured" : "Not configured"}`);

const app = express();
// Enable trust proxy for rate limiters in Replit environment
app.set("trust proxy", 1);

// Session configuration (add before passport)
app.use(
  session({
    secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize Passport
app.use(passport.initialize());
// Auth middleware to check if user is logged in
const requireAuth = (req: any, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: "Not authenticated" });
};

app.use(passport.session());

// Google OAuth Strategy
  // Enhanced Google Auth integration for server/index.ts
  // Replace your existing Google Auth section with this:

  // Google OAuth Strategy with database integration
  if (googleAuthConfigured) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email provided by Google"), null);
            }

            // Check if user exists in your database
            const existingUserResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
            const existingUser = existingUserResult[0];

            if (existingUser) {
              // User exists - return them with their role
              log(`Existing user logged in: ${email} (${existingUser.role})`);

              // Update last login
              await db.update(users)
                .set({ 
                  lastLoginAt: new Date(),
                  profileImage: profile.photos?.[0]?.value 
                })
                .where(eq(users.id, existingUser.id));

              return done(null, {
                id: existingUser.id,
                email: existingUser.email,
                name: `${existingUser.firstName} ${existingUser.lastName}`,
                role: existingUser.role,
                picture: profile.photos?.[0]?.value || existingUser.profileImage,
                provider: "google",
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                clinicId: existingUser.clinicId,
                emailVerified: true // Google accounts are pre-verified
              });
            } else {
              // New user - create account as patient by default
              // They can be upgraded to clinic later through admin
              const [firstName, ...lastNameParts] = profile.displayName?.split(" ") || ["", ""];
              const lastName = lastNameParts.join(" ");

            const newUserResult = await db.insert(users).values({
              email: email,
              firstName: firstName || profile.displayName || "Google",
              lastName: lastName || "User",
              role: "patient",
              emailVerified: true,
              status: "active",
              profileImage: profile.photos?.[0]?.value,
              createdAt: new Date(),
              lastLoginAt: new Date()
            }).returning();
            const newUser = newUserResult[0];

              log(`New user created via Google: ${email} (patient)`);

              return done(null, {
                id: newUser.id,
                email: newUser.email,
                name: `${newUser.firstName} ${newUser.lastName}`,
                role: newUser.role,
                picture: profile.photos?.[0]?.value,
                provider: "google",
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                clinicId: null,
                emailVerified: true
              });
            }
          } catch (error) {
            log(`Error in Google OAuth: ${error}`);
            return done(error, null);
          }
        }
      )
    );

    // Google OAuth callback with smart routing
    app.get(
      "/auth/google/callback",
      passport.authenticate("google", {
        failureRedirect: "/login?error=auth_failed",
      }),
      async (req: any, res) => {
        try {
          const user = req.user;

          // Route based on user role
          switch (user.role) {
            case "patient":
              res.redirect("/patient-portal");
              break;
            case "clinic":
              res.redirect("/clinic-portal");
              break;
            case "admin":
              res.redirect("/admin-portal");
              break;
            default:
              // Fallback for unknown roles
              res.redirect("/portal-selection");
          }
        } catch (error) {
          log(`Error in OAuth callback: ${error}`);
          res.redirect("/login?error=callback_failed");
        }
      }
    );

    // Portal selection page for edge cases
    app.get("/portal-selection", requireAuth, (req: any, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>MyDentalFly - Select Portal</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; background: #f8fafc; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #0284c7; text-align: center; margin-bottom: 30px; }
            .portal-btn { 
              display: block; 
              width: 100%; 
              background: #0284c7; 
              color: white; 
              padding: 15px 20px; 
              border: none; 
              border-radius: 8px; 
              font-size: 16px;
              text-decoration: none; 
              text-align: center; 
              margin: 15px 0;
              transition: background 0.2s;
            }
            .portal-btn:hover { background: #0369a1; }
            .user-info { background: #e0f2fe; padding: 15px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to MyDentalFly</h1>
            <div class="user-info">
              <img src="${req.user.picture}" alt="Profile" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px;">
              <p><strong>${req.user.name}</strong></p>
              <p>${req.user.email}</p>
            </div>
            <h2 style="text-align: center; margin-bottom: 20px;">Choose your portal:</h2>
            <a href="/patient-portal" class="portal-btn">🦷 Patient Portal</a>
            <a href="/clinic-portal" class="portal-btn">🏥 Clinic Portal</a>
            <p style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              Your account role: <strong>${req.user.role}</strong><br>
              <a href="/auth/logout" style="color: #dc2626;">Logout</a>
            </p>
          </div>
        </body>
        </html>
      `);
    });

    // Enhanced API endpoint with role information
    app.get("/api/auth/user", (req: any, res) => {
      if (req.isAuthenticated()) {
        res.json({
          success: true,
          user: req.user,
          portalAccess: {
            patient: true, // Everyone can access patient portal
            clinic: req.user.role === "clinic" || req.user.role === "admin",
            admin: req.user.role === "admin"
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }
    });

    // Role upgrade endpoint (for admin use)
    app.post("/api/auth/upgrade-role", requireAuth, async (req: any, res) => {
      try {
        const { userId, newRole } = req.body;

        // Only admins can upgrade roles
        if (req.user.role !== "admin") {
          return res.status(403).json({
            success: false,
            message: "Only admins can upgrade user roles"
          });
        }

        // Update user role in database

        // Update user role in database
        await db.update(users)
          .set({ role: newRole })
          .where(eq(users.id, userId));

        res.json({
          success: true,
          message: `User role updated to ${newRole}`
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to update user role"
        });
      }
    });

    log("Enhanced Google Auth with portal routing configured successfully");
  } else {
    // Fallback routes when Google Auth is not configured
    app.get("/auth/google", (req, res) => {
      res.status(500).json({ error: "Google OAuth not configured" });
    });

    app.get("/api/auth/user", (req, res) => {
      res.status(500).json({ error: "Google OAuth not configured" });
    });

    log("Google Auth fallback routes registered");
  }

// Configure CORS to explicitly support credentials
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://mydentalfly.com", "https://www.mydentalfly.com"]
        : [
            "http://localhost:5000",
            "http://0.0.0.0:5000",
            "http://127.0.0.1:5000",
            "https://c2ea1272-6e7e-49ff-be73-8b18837ae1fb-00-2vkeb1dlsf3ae.janeway.replit.dev",
          ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Auth middleware to check if user is logged in

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
  const PORT = process.env.PORT || 5000;
  const port = PORT;

// Kill any existing processes on the port before starting
const killExistingProcesses = () => {
  try {
    const { execSync } = require('child_process');
    execSync(`pkill -f "node.*${PORT}"`, { stdio: 'ignore' });
    console.log(`Killed existing processes on port ${PORT}`);
  } catch (error) {
    // Ignore errors - likely no existing process
  }
};

killExistingProcesses();
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    log(`Server is accessible at http://0.0.0.0:${port}`);
    log(`For Replit environments, use the "Open in new tab" button`);
    if (googleAuthConfigured) {
      log("Google OAuth is ready - /auth/google endpoint available");
    } else {
      log("Google OAuth NOT configured - add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
    }
  });
})();