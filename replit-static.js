// Static file server for Replit deployment
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map file extensions to MIME types
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
  '.woff2': 'font/woff2',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Log startup information
console.log('Starting static file server for Replit deployment...');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', __dirname);
console.log('Public directory:', path.join(__dirname, 'public'));

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - Request for ${req.url} from ${req.headers.host || 'unknown'}`);
  
  // Parse URL to get path
  let filePath;
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'public', 'index.html');
  } else {
    filePath = path.join(__dirname, 'public', req.url);
  }
  
  // Handle API endpoints
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Static file server is running',
      timestamp: new Date().toISOString(),
      host: req.headers.host || 'unknown'
    }));
    return;
  }
  
  if (req.url === '/api/domain-info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      domain: req.headers.host || 'unknown',
      headers: req.headers,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
      server: {
        node: process.version,
        platform: process.platform
      }
    }));
    return;
  }
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, try index.html
        console.log(`File not found: ${filePath}, serving index.html instead`);
        filePath = path.join(__dirname, 'public', 'index.html');
        
        fs.readFile(filePath, (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end(`Error: ${err.code}`);
            return;
          }
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }
    
    // If it's a directory, try to serve index.html from that directory
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    
    // Read file and serve
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Error reading file: ${err.code}`);
        return;
      }
      
      // Get file extension and content type
      const extname = path.extname(filePath);
      const contentType = mimeTypes[extname] || 'text/plain';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});