// Enhanced deployment server for MyDentalFly with Google Auth
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Display server startup information
console.log("Starting MyDentalFly production server...");
console.log("Server environment:", process.env.NODE_ENV || "production");
console.log("Current directory:", __dirname);

// Configuration check
const emailjsConfigured = !!(
  process.env.EMAILJS_SERVICE_ID &&
  process.env.EMAILJS_TEMPLATE_ID &&
  process.env.EMAILJS_PUBLIC_KEY
);
const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
const googleAuthConfigured = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

console.log("Configuration status:");
console.log("- EmailJS:", emailjsConfigured ? "Configured" : "Not configured");
console.log("- Stripe:", stripeConfigured ? "Configured" : "Not configured");
console.log(
  "- Google Auth:",
  googleAuthConfigured ? "Configured" : "Not configured",
);

// Session configuration
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
app.use(passport.session());

// Google OAuth Strategy
if (googleAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        // Here you would typically save the user to your database
        // For now, we'll just return the profile
        const user = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          picture: profile.photos[0].value,
          provider: "google",
        };
        return done(null, user);
      },
    ),
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
} else {
  console.warn("Google OAuth not configured - auth routes will not work");
}

// Basic logging middleware with more details
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip} - ${req.headers["user-agent"]}`,
  );
  next();
});

// Parse JSON bodies
app.use(express.json());

// Auth middleware to check if user is logged in
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: "Not authenticated" });
};

// Google Auth Routes
if (googleAuthConfigured) {
  // Start Google OAuth flow
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),
  );

  // Google OAuth callback
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login?error=auth_failed",
    }),
    (req, res) => {
      // Successful authentication, redirect to dashboard or home
      res.redirect("/dashboard");
    },
  );

  // Logout route
  app.get("/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Logout failed" });
      }
      res.redirect("/");
    });
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({
        success: true,
        user: req.user,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }
  });
} else {
  // Fallback routes when Google Auth is not configured
  app.get("/auth/google", (req, res) => {
    res.status(500).json({ error: "Google OAuth not configured" });
  });

  app.get("/api/auth/user", (req, res) => {
    res.status(500).json({ error: "Google OAuth not configured" });
  });
}

// Protected dashboard route (example)
app.get("/dashboard", requireAuth, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>MyDentalFly - Dashboard</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #0284c7; }
        .user-info { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; }
        .logout-btn { background: #dc2626; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to MyDentalFly Dashboard</h1>
        <div class="user-info">
          <h3>User Information:</h3>
          <p><strong>Name:</strong> ${req.user.name}</p>
          <p><strong>Email:</strong> ${req.user.email}</p>
          <img src="${req.user.picture}" alt="Profile" style="width: 50px; height: 50px; border-radius: 50%;">
        </div>
        <a href="/auth/logout" class="logout-btn">Logout</a>
      </div>
    </body>
    </html>
  `);
});

// Login page
app.get("/login", (req, res) => {
  const error = req.query.error;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>MyDentalFly - Login</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; background: #f8fafc; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #0284c7; text-align: center; }
        .google-btn { background: #4285f4; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; display: block; text-align: center; margin: 20px 0; }
        .error { background: #fee2e2; color: #991b1b; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Login to MyDentalFly</h1>
        ${error === "auth_failed" ? '<div class="error">Authentication failed. Please try again.</div>' : ""}
        <a href="/auth/google" class="google-btn">Sign in with Google</a>
      </div>
    </body>
    </html>
  `);
});

// Serve the domain test HTML as the root
app.get("/", (req, res) => {
  const domainTestPath = path.join(__dirname, "public/domaintest.html");

  if (fs.existsSync(domainTestPath)) {
    return res.sendFile(domainTestPath);
  } else {
    // Enhanced root page with auth info
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MyDentalFly - Domain Test</title>
        <style>
          body {
            font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.5;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 { color: #0284c7; }
          .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin: 20px 0;
            padding: 20px;
          }
          .success {
            background-color: #e0f2fe;
            border-left: 4px solid #0284c7;
            padding: 15px;
            margin-bottom: 20px;
          }
          .auth-btn {
            background: #4285f4;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
            margin: 10px 5px;
          }
          pre {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
          }
        </style>
      </head>
      <body>
        <h1>MyDentalFly Domain Test</h1>

        <div class="card">
          <div class="success">
            <p><strong>✅ Domain Verification Successful</strong></p>
            <p>Your domain is correctly configured and is reaching this server at <strong>${req.headers.host || "unknown host"}</strong></p>
          </div>

          <h2>Authentication Status</h2>
          <p>Google Auth: ${googleAuthConfigured ? "✅ Configured" : "❌ Not configured"}</p>
          ${
            googleAuthConfigured
              ? `
            <a href="/login" class="auth-btn">Login</a>
            <a href="/dashboard" class="auth-btn">Dashboard</a>
          `
              : ""
          }

          <h2>Request Details</h2>
          <p>Time: ${new Date().toISOString()}</p>
          <p>IP: ${req.ip}</p>
          <p>Protocol: ${req.protocol}</p>

          <p>Try these endpoints:</p>
          <ul>
            <li><a href="/api/domain-info">/api/domain-info</a> - JSON with domain information</li>
            <li><a href="/api/health">/api/health</a> - Server health check</li>
            <li><a href="/api/auth/user">/api/auth/user</a> - Current user info (requires auth)</li>
            ${googleAuthConfigured ? '<li><a href="/auth/google">/auth/google</a> - Start Google OAuth</li>' : ""}
          </ul>
        </div>
      </body>
      </html>
    `);
  }
});

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, "public")));

// Basic API for EmailJS configuration
app.get("/api/config/emailjs", (req, res) => {
  const serviceIdExists = !!process.env.EMAILJS_SERVICE_ID;
  const templateIdExists = !!process.env.EMAILJS_TEMPLATE_ID;
  const publicKeyExists = !!process.env.EMAILJS_PUBLIC_KEY;

  console.log("EmailJS Config from env:", {
    serviceIdExists,
    templateIdExists,
    publicKeyExists,
  });

  res.json({
    serviceId: process.env.EMAILJS_SERVICE_ID || "",
    templateId: process.env.EMAILJS_TEMPLATE_ID || "",
    publicKey: process.env.EMAILJS_PUBLIC_KEY || "",
    available: serviceIdExists && templateIdExists && publicKeyExists,
  });
});

// Health check API endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "MyDentalFly server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    host: req.get("host"),
    ip: req.ip,
    path: req.path,
    stripeConfigured: stripeConfigured,
    emailjsConfigured: emailjsConfigured,
    googleAuthConfigured: googleAuthConfigured,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Domain info endpoint
app.get("/api/domain-info", (req, res) => {
  res.json({
    domain: req.get("host"),
    headers: req.headers,
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
    ip: req.ip,
    path: req.path,
    protocol: req.protocol,
    secure: req.secure,
    server: {
      node: process.version,
      platform: process.platform,
      uptime: process.uptime(),
    },
  });
});

// Serve a simple fallback index if needed
app.get("/simple", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>MyDentalFly</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #0284c7; }
        .status { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>MyDentalFly</h1>
        <div class="status">
          <p>Server is running successfully at <strong>${req.headers.host}</strong></p>
          <p>DNS configuration is working correctly.</p>
        </div>
        <p>Your dental tourism platform is coming soon.</p>
      </div>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`MyDentalFly production server running on port ${PORT}`);
  console.log(`Server is listening at http://0.0.0.0:${PORT}`);
  console.log(`Server is ready to handle requests`);
  if (googleAuthConfigured) {
    console.log("Google OAuth is configured and ready");
  } else {
    console.log(
      "Google OAuth is NOT configured - set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET",
    );
  }
});
