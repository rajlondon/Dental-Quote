// Specialized static server for domains (mydentalfly.com and mydentalfly.co.uk)
const http = require('http');
const fs = require('fs');
const path = require('path');

// Log environment
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Starting domain deployment server');
console.log('Current directory:', __dirname);

// Load environment variables and secrets
function loadEnvironment() {
  try {
    // First try to load from .env file
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContents = fs.readFileSync(envPath, 'utf8');
      envContents.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^['"](.*)['"]$/, '$1'); // Remove quotes if present
          }
        }
      });
      console.log('Loaded environment variables from .env file');
    }

    // Ensure Stripe keys are set
    if (!process.env.STRIPE_SECRET_KEY && process.env.REPLIT_STRIPE_SECRET_KEY) {
      process.env.STRIPE_SECRET_KEY = process.env.REPLIT_STRIPE_SECRET_KEY;
      console.log('Set STRIPE_SECRET_KEY from Replit secrets');
    }
    
    if (!process.env.STRIPE_PUBLIC_KEY && process.env.REPLIT_STRIPE_PUBLIC_KEY) {
      process.env.STRIPE_PUBLIC_KEY = process.env.REPLIT_STRIPE_PUBLIC_KEY;
      console.log('Set STRIPE_PUBLIC_KEY from Replit secrets');
    }
    
    if (!process.env.VITE_STRIPE_PUBLIC_KEY && process.env.REPLIT_VITE_STRIPE_PUBLIC_KEY) {
      process.env.VITE_STRIPE_PUBLIC_KEY = process.env.REPLIT_VITE_STRIPE_PUBLIC_KEY;
      console.log('Set VITE_STRIPE_PUBLIC_KEY from Replit secrets');
    }

    console.log('Environment loaded successfully');
  } catch (error) {
    console.error('Error loading environment:', error);
  }
}

// Load environment
loadEnvironment();

// Basic file type to MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// Simple static file server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url} from ${req.headers.host}`);
  
  // Handle API requests - can expand this section later
  if (req.url.startsWith('/api/')) {
    if (req.url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        host: req.headers.host,
        environment: process.env.NODE_ENV || 'production'
      }));
      return;
    }
    
    // Other API endpoints can be added here
    
    // Default API response if endpoint not found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
    return;
  }
  
  // Determine file path for static content
  let filePath;
  if (req.url === '/' || req.url === '') {
    filePath = path.join(__dirname, 'public', 'index.html');
  } else {
    // Remove query parameters from URL
    const urlPath = req.url.split('?')[0];
    filePath = path.join(__dirname, 'public', urlPath);
  }
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`File not found: ${filePath}, serving index.html instead`);
      // File not found, serve index.html for SPA routing
      filePath = path.join(__dirname, 'public', 'index.html');
      
      // Serve the file
      fs.readFile(filePath, (err, content) => {
        if (err) {
          console.error(`Error reading index.html: ${filePath}`, err);
          res.writeHead(500);
          res.end('500 Internal Server Error');
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      });
      return;
    }
    
    // Get the file extension
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'text/plain';
    
    // Serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.error(`Error reading file: ${filePath}`, err);
        res.writeHead(500);
        res.end('500 Internal Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`MyDentalFly Domain Server running at http://0.0.0.0:${PORT}/`);
  console.log(`Serving static files from ${path.join(__dirname, 'public')}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log('Server ready to accept connections');
});