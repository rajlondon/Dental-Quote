// Production server for Replit deployment
// This is a simplified version without TypeScript and complex dependencies
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
app.use(express.json());

// Prepare directory for static files
const staticDir = path.join(__dirname, 'public');
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
  // Create a simple index.html if it doesn't exist
  if (!fs.existsSync(path.join(staticDir, 'index.html'))) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>MyDentalFly</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; background: #f5f9fc; color: #333; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { color: #3182ce; margin-top: 0; }
    .status { background: #ebf8ff; border-left: 4px solid #3182ce; padding: 15px; margin: 20px 0; }
    button { background: #3182ce; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
    button:hover { background: #2c5282; }
    pre { background: #f1f5f9; padding: 15px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>MyDentalFly</h1>
    <div class="status">
      Server is running in production mode
    </div>
    <div>
      <h2>API Status</h2>
      <button id="check-api">Check API</button>
      <pre id="result">Click button to test API</pre>
    </div>
    <div>
      <h2>Server Information</h2>
      <pre id="info"></pre>
    </div>
  </div>
  <script>
    // Display server information
    document.getElementById('info').textContent = 
      \`URL: \${window.location.href}
Host: \${window.location.host}
Protocol: \${window.location.protocol}\`;
    
    // Test API
    document.getElementById('check-api').addEventListener('click', async () => {
      const result = document.getElementById('result');
      result.textContent = 'Testing API...';
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        result.textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        result.textContent = \`Error: \${error.message}\`;
      }
    });
  </script>
</body>
</html>`;
    fs.writeFileSync(path.join(staticDir, 'index.html'), html);
  }
}

// Serve static files
app.use(express.static(staticDir));

// API endpoint for testing
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MyDentalFly API is running',
    timestamp: new Date().toISOString(),
    host: req.get('host'),
    protocol: req.protocol,
    environment: process.env.NODE_ENV || 'production'
  });
});

// Domain information endpoint
app.get('/api/domain-info', (req, res) => {
  res.json({
    domain: req.get('host'),
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on port ${PORT}`);
});