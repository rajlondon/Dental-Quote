/**
 * Main Server Routes for MyDentalFly
 * 
 * This file registers all API routes and serves the React frontend
 */
import express, { Express } from 'express';
import cors from 'cors';
import { createServer, Server } from 'http';
import { registerAuthRoutes } from './routes/auth';
import { registerApiRoutes } from './routes/api';
import { registerFlaskBridge } from './routes/flask-bridge';

export function registerRoutes(app: Express): Server {
  // Middleware setup
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Register various API routes
  registerAuthRoutes(app);
  registerApiRoutes(app);
  
  // Register Flask bridge routes
  registerFlaskBridge(app);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Return the HTTP server
  return httpServer;
}