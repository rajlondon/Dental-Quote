/**
 * Simple static file server to serve the clinic login page
 * This avoids issues with React routing and promotion redirects
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Enable JSON parsing for form submissions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redirect root to the static clinic login
app.get('/', (req, res) => {
  res.redirect('/static-clinic-login');
});

// Serve the static clinic login page
app.get('/static-clinic-login', (req, res) => {
  const staticHtmlPath = path.join(__dirname, 'client', 'public', 'clinic-login.html');
  
  if (!fs.existsSync(staticHtmlPath)) {
    console.error(`Static HTML file not found at: ${staticHtmlPath}`);
    return res.status(404).send('Clinic login page not found');
  }
  
  console.log(`Serving static clinic login page from: ${staticHtmlPath}`);
  res.sendFile(staticHtmlPath);
});

// Proxy auth requests to the main application
app.post('/api/auth/clinic-login', (req, res) => {
  console.log('Received clinic login request, redirecting to main server');
  res.redirect(307, 'http://localhost:5000/api/auth/clinic-login');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Static clinic login server running at http://localhost:${PORT}`);
  console.log(`Access the login page at http://localhost:${PORT}/static-clinic-login`);
});