#!/usr/bin/env node

/**
 * MyDentalFly Deployment Server
 * Direct mirror of working development environment for deployment
 */

import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Environment setup
const port = process.env.PORT || 5000;
const isDev = true; // Force development mode for full functionality

console.log('=== MyDentalFly Deployment Server ===');
console.log(`Port: ${port}`);
console.log('Mode: Development (for complete features)');
console.log('======================================');

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Session store setup
const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  createTableIfMissing: true,
  conString: process.env.DATABASE_URL,
});

// Middleware setup
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Import and setup all routes
async function setupRoutes() {
  try {
    // Import all route modules
    const { default: authRoutes } = await import('./server/routes/auth.js');
    const { default: quotesRoutes } = await import('./server/routes/quotes.js');
    const { default: treatmentRoutes } = await import('./server/routes/treatment-packages.js');
    const { default: clinicRoutes } = await import('./server/routes/clinics.js');
    const { default: specialOffersRoutes } = await import('./server/routes/special-offers.js');
    const { default: promoCodeRoutes } = await import('./server/routes/promo-code-routes.js');
    const { default: promotionsRoutes } = await import('./server/routes/promotions.js');
    const { default: bookingRoutes } = await import('./server/routes/booking.js');
    const { default: notificationRoutes } = await import('./server/routes/notifications.js');
    
    // Setup API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/quotes', quotesRoutes);
    app.use('/api/treatment-packages', treatmentRoutes);
    app.use('/api/clinics', clinicRoutes);
    app.use('/api/special-offers', specialOffersRoutes);
    app.use('/api/promo-codes', promoCodeRoutes);
    app.use('/api/promotions', promotionsRoutes);
    app.use('/api/booking', bookingRoutes);
    app.use('/api/notifications', notificationRoutes);
    
    console.log('✓ All API routes loaded successfully');
  } catch (error) {
    console.error('Error loading routes:', error);
  }
}

// Setup Vite development server for frontend
async function setupVite() {
  try {
    const { createServer: createViteServer } = await import('vite');
    
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      optimizeDeps: {
        include: ['react', 'react-dom']
      }
    });
    
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
    
    console.log('✓ Vite development server configured');
  } catch (error) {
    console.error('Error setting up Vite:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'MyDentalFly Application Online',
    environment: 'deployment',
    port: port,
    timestamp: new Date().toISOString()
  });
});

// Initialize server
async function startServer() {
  try {
    await setupRoutes();
    await setupVite();
    
    server.listen(port, '0.0.0.0', () => {
      console.log('');
      console.log('🚀 MyDentalFly Deployment Server Started');
      console.log(`📍 Server running on port ${port}`);
      console.log('🌐 Application ready for deployment access');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();