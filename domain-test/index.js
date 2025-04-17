const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Special test endpoint for domain testing
app.get('/api/domain-test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Domain test successful',
    host: req.get('host'),
    protocol: req.protocol,
    timestamp: new Date().toISOString()
  });
});

// Serve our test HTML for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
});