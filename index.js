// Enhanced deployment server for MyDentalFly
const express = require('express');
const path = require('path');
const app = express();

// Check if Stripe API key is set
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('WARNING: STRIPE_SECRET_KEY environment variable is not set!');
  console.error('Payment functionality may not work correctly.');
  // We'll continue anyway to allow non-payment features to work
}

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Parse JSON bodies
app.use(express.json());

// Serve static files from client build directory
app.use(express.static(path.join(__dirname, 'dist/public')));

// Basic API for EmailJS configuration
app.get('/api/config/emailjs', (req, res) => {
  // Check if EmailJS environment variables exist
  const serviceIdExists = !!process.env.EMAILJS_SERVICE_ID;
  const templateIdExists = !!process.env.EMAILJS_TEMPLATE_ID;
  const publicKeyExists = !!process.env.EMAILJS_PUBLIC_KEY;
  
  // Log the configuration
  console.log('EmailJS Config from env:', {
    serviceIdExists,
    templateIdExists,
    publicKeyExists
  });
  
  // Return configuration to client
  res.json({
    serviceId: process.env.EMAILJS_SERVICE_ID || '',
    templateId: process.env.EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
    available: serviceIdExists && templateIdExists && publicKeyExists
  });
});

// Health check API endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MyDentalFly server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    host: req.get('host'),
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    emailjsConfigured: !!(process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY)
  });
});

// SPA fallback route - return index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MyDentalFly production server running on port ${PORT}`);
  console.log(`http://0.0.0.0:${PORT}`);
});