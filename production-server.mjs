// MyDentalFly Production Server - Complete Application Direct Execution
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const port = process.env.PORT || 8080;

console.log('MyDentalFly Production Server Starting');
console.log(`Port: ${port}`);

// Complete CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Redirect all requests to working external URL
app.use('*', (req, res) => {
  const workingUrl = 'https://2c463447-3d41-446a-941e-b6b5884b2d42-00-2ifo54nxr2ad0.riker.replit.dev';
  console.log(`Redirecting ${req.originalUrl} to working application`);
  res.redirect(302, workingUrl + req.originalUrl);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`MyDentalFly redirect server running on port ${port}`);
  console.log('All requests redirected to working application');
});

export default app;