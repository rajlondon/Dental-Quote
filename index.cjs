// Simple Express server for testing domain connection
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MyDentalFly - Domain Test</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; background: #f0f9ff; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #0284c7; }
        .status { background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; }
        .info { background: #f1f5f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
        code { font-family: monospace; background: #f1f5f9; padding: 2px 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>MyDentalFly Domain Test</h1>
        <div class="status">
          <p>✅ <strong>Success!</strong> DNS configuration is working correctly.</p>
          <p>Domain: <strong>${req.headers.host}</strong></p>
        </div>
        
        <p>If you can see this page, it means your domain is correctly pointed to this server. Your DNS configuration is working as expected.</p>
        
        <div class="info">
          <h3>Technical Information:</h3>
          <p>Server time: ${new Date().toISOString()}</p>
          <p>User agent: ${req.headers['user-agent']}</p>
          <p>Protocol: ${req.protocol}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    host: req.headers.host,
    message: 'Domain test server running correctly'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Domain test server running on port ${PORT}`);
  console.log(`http://0.0.0.0:${PORT}`);
});