import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";
import { WebSocket } from 'ws';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure WebSocket for Neon Serverless in Node.js environment
// This is required for Replit environment
if (!globalThis.WebSocket) {
  console.log("Setting up WebSocket for Neon Serverless in Node.js environment");
  (globalThis as any).WebSocket = WebSocket;
}

// Create a connection pool to the database with enhanced error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Increase max connection attempts and timeout
  maxUses: 10,
  maxLifetimeSeconds: 30,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

// Create a drizzle instance using the pool
export const db = drizzle(pool, { schema });