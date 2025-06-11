import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import cors from "cors";
import { logError } from "./services/error-logger";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";

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
    ? ['https://mydentalfly.com', 'https://www.mydentalfly.com'] 
    : ['http://localhost:5000', 'http://0.0.0.0:5000', 'http://127.0.0.1:5000'],
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
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
    log(`Server is accessible at http://0.0.0.0:${port}`);
    log(`For Replit environments, use the "Open in new tab" button`);
  });
})();
