import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Display server startup information
console.log('Starting MyDentalFly minimal server...');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', __dirname);

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  const clientIP = req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  console.log(`${timestamp} - ${clientIP} - ${req.method} ${req.url} - ${userAgent}`);
  console.log(`Host header: ${req.headers.host || 'Not provided'}`);
  
  // Set CORS headers to allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle health check endpoint
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'MyDentalFly minimal server is running',
      timestamp: new Date().toISOString(),
      host: req.headers.host
    }));
    return;
  }
  
  // Handle domain info endpoint
  if (req.url === '/api/domain-info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      domain: req.headers.host,
      headers: req.headers,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Serve a simple HTML page for the root
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MyDentalFly - Domain Test (Minimal)</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.5;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
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
          padding: 10px;
          overflow-x: auto;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <h1>MyDentalFly Domain Test</h1>
      
      <div class="card">
        <div class="success">
          <p><strong>✅ Minimal Server Connection Successful</strong></p>
          <p>Your domain is correctly reaching this server at: <strong>${req.headers.host || 'unknown'}</strong></p>
        </div>
        
        <h2>Domain Information</h2>
        <p>This is a minimal HTTP server running on Node.js.</p>
        <p>URL: ${req.url}</p>
        <p>Method: ${req.method}</p>
        <p>Time: ${new Date().toISOString()}</p>
        
        <h2>Request Headers</h2>
        <pre>${JSON.stringify(req.headers, null, 2)}</pre>
        
        <div style="margin-top: 20px;">
          <p>Try these endpoints:</p>
          <ul>
            <li><a href="/api/health">/api/health</a> - Simple health check</li>
            <li><a href="/api/domain-info">/api/domain-info</a> - Domain information</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal server running on port ${PORT}`);
  console.log(`http://0.0.0.0:${PORT}`);
});