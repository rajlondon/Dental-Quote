// Enhanced deployment server for MyDentalFly
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Display server startup information
console.log('Starting MyDentalFly production server...');
console.log('Server environment:', process.env.NODE_ENV || 'production');
console.log('Current directory:', __dirname);

// Configuration check
const emailjsConfigured = !!(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY);
const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;

console.log('Configuration status:');
console.log('- EmailJS:', emailjsConfigured ? 'Configured' : 'Not configured');
console.log('- Stripe:', stripeConfigured ? 'Configured' : 'Not configured');

// Basic logging middleware with more details
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip} - ${req.headers['user-agent']}`);
  next();
});

// Parse JSON bodies
app.use(express.json());

// Serve the domain test HTML as the root
app.get('/', (req, res) => {
  const domainTestPath = path.join(__dirname, 'public/domaintest.html');
  
  if (fs.existsSync(domainTestPath)) {
    return res.sendFile(domainTestPath);
  } else {
    // If the domain test file doesn't exist, render a simple HTML response
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
            <p>Your domain is correctly configured and is reaching this server at <strong>${req.headers.host || 'unknown host'}</strong></p>
          </div>
          
          <h2>Request Details</h2>
          <p>Time: ${new Date().toISOString()}</p>
          <p>IP: ${req.ip}</p>
          <p>Protocol: ${req.protocol}</p>
          
          <h2>All Request Headers</h2>
          <pre>${JSON.stringify(req.headers, null, 2)}</pre>
          
          <p>Try these endpoints:</p>
          <ul>
            <li><a href="/api/domain-info">/api/domain-info</a> - JSON with domain information</li>
            <li><a href="/api/health">/api/health</a> - Server health check</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  }
});

// Serve static assets from public directory
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
    ip: req.ip,
    path: req.path,
    stripeConfigured: stripeConfigured,
    emailjsConfigured: emailjsConfigured,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Domain info endpoint
app.get('/api/domain-info', (req, res) => {
  res.json({
    domain: req.get('host'),
    headers: req.headers,
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
    ip: req.ip,
    path: req.path,
    protocol: req.protocol,
    secure: req.secure,
    server: {
      node: process.version,
      platform: process.platform,
      uptime: process.uptime()
    }
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MyDentalFly production server running on port ${PORT}`);
  console.log(`Server is listening at http://0.0.0.0:${PORT}`);
  console.log(`Server is ready to handle requests`);
});