// MyDentalFly Production Server - Complete Application with Build Fallback
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const port = process.env.PORT || 8080;

console.log('=== MyDentalFly Production Deployment ===');
console.log(`Port: ${port}`);

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Try to serve built files, fallback to development server
const distPath = path.resolve(__dirname, 'dist/public');
const hasBuiltFiles = fs.existsSync(distPath);

if (hasBuiltFiles) {
  console.log('Serving built files from dist/public');
  app.use(express.static(distPath));
  
  // Fallback to index.html for SPA
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
  
  server.listen(port, '0.0.0.0', () => {
    console.log(`MyDentalFly serving built files on port ${port}`);
  });
} else {
  console.log('No built files found, starting development server');
  
  // Import and start development server
  import('./server/index.js').then(() => {
    console.log('Development server loaded');
  }).catch(async () => {
    console.log('Starting server via spawn');
    const { spawn } = await import('child_process');
    
    const serverProcess = spawn('tsx', ['server/index.ts'], {
      stdio: 'inherit',
      env: { 
        ...process.env, 
        PORT: port.toString(),
        NODE_ENV: 'development'
      }
    });

    serverProcess.on('error', (error) => {
      console.error('Server startup failed:', error);
      process.exit(1);
    });
  });
}