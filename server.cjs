const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MyDentalFly - Domain Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f0f7ff;
            color: #333;
          }
          .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 30px;
            max-width: 600px;
            width: 100%;
          }
          h1 {
            color: #0284c7;
            margin-top: 0;
          }
          .success {
            background-color: #e0f2fe;
            border-left: 4px solid #0284c7;
            padding: 15px;
            margin: 20px 0;
          }
          .details {
            margin-top: 30px;
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 4px;
          }
          .logo {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo img {
            max-width: 200px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>MyDentalFly</h1>
          </div>
          
          <div class="success">
            <p><strong>✅ Domain verified!</strong></p>
            <p>You're seeing this page at: <strong>${req.headers.host}</strong></p>
          </div>
          
          <p>Your domain is properly configured and pointing to this server. The DNS setup is working correctly.</p>
          
          <div class="details">
            <p><strong>Technical Details:</strong></p>
            <p>Time: ${new Date().toISOString()}</p>
            <p>Request IP: ${req.ip}</p>
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
    message: 'MyDentalFly domain verification server',
    time: new Date().toISOString(),
    host: req.headers.host
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Domain verification server running on port ${port}`);
});