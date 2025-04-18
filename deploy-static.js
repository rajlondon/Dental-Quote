// Simplified static server for Replit deployment
const http = require('http');
const fs = require('fs');
const path = require('path');

// Log environment
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Starting simplified static server');
console.log('Current directory:', __dirname);
console.log('Files in public directory:');
try {
  const files = fs.readdirSync(path.join(__dirname, 'public'));
  console.log(files);
} catch (error) {
  console.error('Error reading public directory:', error);
}

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
  '.ico': 'image/x-icon'
};

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url} from ${req.headers.host}`);
  
  // Handle API requests
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      host: req.headers.host
    }));
    return;
  }
  
  // Determine file path
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
      // File not found, serve index.html
      filePath = path.join(__dirname, 'public', 'index.html');
      
      // Serve the file
      fs.readFile(filePath, (err, content) => {
        if (err) {
          console.error(`Error reading file: ${filePath}`, err);
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
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});