#!/usr/bin/env node

/**
 * MyDentalFly Complete Server - Direct Copy of Working Development Setup
 * This file serves as the production entry point that mirrors the working development environment
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { createServer as createViteServer } from 'vite';

const app = express();
const server = createServer(app);

// Use the same port configuration as working development
const port = process.env.PORT || 5000;

console.log('=== MyDentalFly Complete Application Server ===');
console.log(`Starting on port: ${port}`);
console.log('Mode: Complete application with all features');

// Database and session setup
const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  createTableIfMissing: true,
  conString: process.env.DATABASE_URL,
});

// Middleware setup - exact same as working development
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

// Setup Vite development server (same as working environment)
async function setupVite() {
  try {
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
    console.error('Vite setup error:', error);
  }
}

// Load all API routes
async function loadRoutes() {
  try {
    // Import route modules
    const authModule = await import('./server/routes/auth.js');
    const quotesModule = await import('./server/routes/quotes.js');
    const treatmentModule = await import('./server/routes/treatment-packages.js');
    const clinicModule = await import('./server/routes/clinics.js');
    const specialOffersModule = await import('./server/routes/special-offers.js');
    const promoCodeModule = await import('./server/routes/promo-code-routes.js');
    const promotionsModule = await import('./server/routes/promotions.js');
    const bookingModule = await import('./server/routes/booking.js');
    const notificationModule = await import('./server/routes/notifications.js');
    
    // Setup routes
    app.use('/api/auth', authModule.default);
    app.use('/api/quotes', quotesModule.default);
    app.use('/api/treatment-packages', treatmentModule.default);
    app.use('/api/clinics', clinicModule.default);
    app.use('/api/special-offers', specialOffersModule.default);
    app.use('/api/promo-codes', promoCodeModule.default);
    app.use('/api/promotions', promotionsModule.default);
    app.use('/api/booking', bookingModule.default);
    app.use('/api/notifications', notificationModule.default);
    
    console.log('✓ All API routes loaded');
  } catch (error) {
    console.error('Route loading error:', error);
  }
}

// Health check that shows application is running
app.get('/health', (req, res) => {
  res.json({ 
    status: 'MyDentalFly Complete Application Online',
    mode: 'full-application',
    port: port,
    timestamp: new Date().toISOString()
  });
});

// Start the complete server
async function startServer() {
  try {
    await loadRoutes();
    await setupVite();
    
    server.listen(port, '0.0.0.0', () => {
      console.log('');
      console.log('🚀 MyDentalFly Complete Application Server Started');
      console.log(`📍 Server running on port ${port}`);
      console.log('🌐 Full application available');
      console.log('');
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();