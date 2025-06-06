// MyDentalFly Deployment Server - Minimal Production Configuration
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Basic middleware
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  next();
});

// Health check for deployment
app.get('/health', (req, res) => {
  res.json({ status: 'OK', port, timestamp: new Date().toISOString() });
});

// Check for built files
const distExists = fs.existsSync(path.join(__dirname, 'dist'));

if (distExists) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Deployment status page
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MyDentalFly - Deployment Status</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; text-align: center; }
          .status { padding: 20px; border-radius: 8px; margin: 20px 0; }
          .building { background: #fff3cd; border: 1px solid #ffeaa7; }
          .ready { background: #d4edda; border: 1px solid #c3e6cb; }
        </style>
      </head>
      <body>
        <h1>MyDentalFly</h1>
        <div class="status building">
          <h2>Deployment Status</h2>
          <p>Application is initializing...</p>
          <p><strong>Environment:</strong> Production</p>
          <p><strong>Port:</strong> ${port}</p>
          <p><strong>Build Status:</strong> In Progress</p>
        </div>
        <p>The application will be available shortly.</p>
      </body>
      </html>
    `);
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`MyDentalFly server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Static files: ${distExists ? 'Available' : 'Building'}`);
});