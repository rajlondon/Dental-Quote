// Ultra-simple server for domain testing
const express = require('express');
const app = express();
const path = require('path');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Basic test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Domain test server is working',
    timestamp: new Date().toISOString(),
    host: req.get('host')
  });
});

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Domain test server running on port ${PORT}`);
  console.log(`http://0.0.0.0:${PORT}`);
});