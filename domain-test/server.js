const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Root endpoint with domain verification info
app.get('/', (req, res) => {
  const host = req.headers.host || 'unknown';
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MyDentalFly - Domain Test</title>
      <style>
        body {
          font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.5;
          color: #333;
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
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        table, th, td {
          border: 1px solid #ddd;
        }
        th, td {
          text-align: left;
          padding: 8px;
        }
        th {
          background-color: #f8fafc;
        }
        code {
          background: #f1f5f9;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <h1>MyDentalFly Domain Test</h1>
      
      <div class="card">
        <div class="success">
          <p><strong>✅ Domain Test Server Running</strong></p>
          <p>This server is correctly receiving requests at: <strong>${host}</strong></p>
        </div>
        
        <h2>Request Information</h2>
        <table>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Host</td>
            <td>${host}</td>
          </tr>
          <tr>
            <td>Protocol</td>
            <td>${req.protocol}</td>
          </tr>
          <tr>
            <td>Remote Address</td>
            <td>${req.ip}</td>
          </tr>
          <tr>
            <td>User Agent</td>
            <td>${req.headers['user-agent'] || 'Not provided'}</td>
          </tr>
          <tr>
            <td>Time</td>
            <td>${new Date().toISOString()}</td>
          </tr>
        </table>
        
        <h2>All Request Headers</h2>
        <pre>${JSON.stringify(req.headers, null, 2)}</pre>
      </div>
      
      <div class="card">
        <h2>DNS Verification</h2>
        <p>If you're seeing this page, it means:</p>
        <ul>
          <li>The DNS records for <strong>${host}</strong> are correctly pointing to this server</li>
          <li>The server is properly handling HTTP requests</li>
          <li>Your browser can successfully connect to this server</li>
        </ul>
        
        <p>Try these additional test endpoints:</p>
        <ul>
          <li><a href="/api/health">/api/health</a> - JSON health check endpoint</li>
          <li><a href="/api/dns-info">/api/dns-info</a> - Detailed DNS information</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MyDentalFly domain test server is operational',
    timestamp: new Date().toISOString(),
    host: req.headers.host || 'unknown'
  });
});

// DNS info endpoint
app.get('/api/dns-info', (req, res) => {
  res.json({
    host: req.headers.host,
    headers: req.headers,
    connection: {
      ip: req.ip,
      ips: req.ips,
      protocol: req.protocol,
      secure: req.secure
    },
    server: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: port
    }
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Domain test server running on port ${port}`);
});