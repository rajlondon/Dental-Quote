// Simple standalone server for Replit deployment
const express = require('express');
const path = require('path');
const app = express();

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check API endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MyDentalFly server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    host: req.get('host')
  });
});

// SPA fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://0.0.0.0:${PORT}`);
});