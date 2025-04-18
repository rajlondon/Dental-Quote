// Enhanced deployment server for MyDentalFly
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Check if Stripe API key is set
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('WARNING: STRIPE_SECRET_KEY environment variable is not set!');
  console.error('Payment functionality may not work correctly.');
  // We'll continue anyway to allow non-payment features to work
}

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Parse JSON bodies
app.use(express.json());

// First try to serve from the dist directory (production build)
app.use(express.static(path.join(__dirname, 'dist/public')));

// Then fallback to the public directory (for static assets)
app.use(express.static(path.join(__dirname, 'public')));

// Basic API for EmailJS configuration
app.get('/api/config/emailjs', (req, res) => {
  // Check if EmailJS environment variables exist
  const serviceIdExists = !!process.env.EMAILJS_SERVICE_ID;
  const templateIdExists = !!process.env.EMAILJS_TEMPLATE_ID;
  const publicKeyExists = !!process.env.EMAILJS_PUBLIC_KEY;
  
  // Log the configuration
  console.log('EmailJS Config from env:', {
    serviceIdExists,
    templateIdExists,
    publicKeyExists
  });
  
  // Return configuration to client
  res.json({
    serviceId: process.env.EMAILJS_SERVICE_ID || '',
    templateId: process.env.EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
    available: serviceIdExists && templateIdExists && publicKeyExists
  });
});

// Health check API endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MyDentalFly server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    host: req.get('host'),
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    emailjsConfigured: !!(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY)
  });
});

// Domain info endpoint
app.get('/api/domain-info', (req, res) => {
  res.json({
    domain: req.get('host'),
    headers: req.headers,
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Serve a simple fallback index if needed
app.get('/simple', (req, res) => {
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

// SPA fallback route - return index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Try to serve from dist/public first
  const distPath = path.join(__dirname, 'dist/public/index.html');
  const publicPath = path.join(__dirname, 'public/index.html');
  
  try {
    if (fs.existsSync(distPath)) {
      return res.sendFile(distPath);
    } else if (fs.existsSync(publicPath)) {
      return res.sendFile(publicPath);
    } else {
      // Fallback to a simple HTML response
      return res.redirect('/simple');
    }
  } catch (err) {
    console.error('Error serving index.html:', err);
    return res.redirect('/simple');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MyDentalFly production server running on port ${PORT}`);
  console.log(`http://0.0.0.0:${PORT}`);
});