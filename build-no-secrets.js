/**
 * Build script for MyDentalFly that creates a version without secret dependencies
 * 
 * This script creates a deployment that works without requiring any secrets/environment variables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting no-secrets build process...');

try {
  // Clean previous build
  if (fs.existsSync('./dist')) {
    console.log('Cleaning previous build...');
    fs.rmSync('./dist', { recursive: true, force: true });
  }

  // Create dist directory
  fs.mkdirSync('./dist', { recursive: true });
  fs.mkdirSync('./dist/public', { recursive: true });

  // Create a simplified server with no secret dependencies
  console.log('Creating simplified server...');
  const startScript = `
/**
 * MyDentalFly Server - No Secrets Version
 * 
 * This version doesn't require any secrets or environment variables
 * It serves static files and provides basic API endpoints
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simplified in-memory storage (static data)
const mockDatabase = {
  treatments: [
    { id: 1, name: 'Dental Implants', description: 'Replace missing teeth with artificial tooth roots', price: 500 },
    { id: 2, name: 'Veneers', description: 'Improve appearance of front teeth', price: 300 },
    { id: 3, name: 'Crowns', description: 'Cover and protect damaged teeth', price: 200 },
    { id: 4, name: 'Teeth Whitening', description: 'Brighten your smile', price: 150 },
  ],
  clinics: [
    { id: 1, name: 'Istanbul Dental Center', location: 'Istanbul, Turkey', rating: 4.9 },
    { id: 2, name: 'Premium Smile Clinic', location: 'Istanbul, Turkey', rating: 4.8 },
    { id: 3, name: 'Dental Excellence Turkey', location: 'Istanbul, Turkey', rating: 4.7 },
  ]
};

// Function to serve static files
function serveStaticFile(filePath, contentType, response) {
  try {
    const fullPath = path.join(__dirname, 'public', filePath);
    
    if (fs.existsSync(fullPath)) {
      response.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(fullPath).pipe(response);
    } else {
      // If the specific file doesn't exist, try to serve index.html (for SPA routing)
      if (filePath !== 'index.html') {
        serveStaticFile('index.html', 'text/html', response);
      } else {
        // If index.html doesn't exist either, serve the built-in landing page
        serveLandingPage(response);
      }
    }
  } catch (error) {
    console.error('Error serving static file:', error);
    serveLandingPage(response);
  }
}

// Landing page HTML as fallback
function serveLandingPage(response) {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(\`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyDentalFly - Premium Dental Care in Istanbul</title>
  <style>
    :root {
      --primary: #0284c7;
      --primary-dark: #0369a1; 
      --background: #f9fafb;
      --text: #1f2937;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--background);
      color: var(--text);
      line-height: 1.5;
    }
    
    .banner {
      background-color: var(--primary);
      color: white;
      text-align: center;
      padding: 0.5rem;
      font-weight: 500;
    }
    
    header {
      background-color: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 1rem 0;
    }
    
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .nav-links {
      display: none;
    }
    
    @media (min-width: 768px) {
      .nav-links {
        display: flex;
        gap: 2rem;
        list-style: none;
      }
      
      .mobile-menu-btn {
        display: none;
      }
    }
    
    .nav-links a {
      color: var(--text);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    
    .nav-links a:hover {
      color: var(--primary);
    }
    
    .mobile-menu-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text);
      cursor: pointer;
    }
    
    .hero {
      padding: 4rem 0;
    }
    
    .hero-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      align-items: center;
      text-align: center;
    }
    
    @media (min-width: 768px) {
      .hero-content {
        flex-direction: row;
        text-align: left;
      }
    }
    
    .hero-text {
      flex: 1;
    }
    
    .hero-image {
      flex: 1;
      max-width: 100%;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    }
    
    .hero-image img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
      line-height: 1.2;
    }
    
    .hero p {
      font-size: 1.125rem;
      margin-bottom: 2rem;
      color: #4b5563;
    }
    
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background-color: var(--primary);
      color: white;
      border: 1px solid var(--primary);
    }
    
    .btn-primary:hover {
      background-color: var(--primary-dark);
      border-color: var(--primary-dark);
    }
    
    .btn-outline {
      background-color: transparent;
      color: var(--primary);
      border: 1px solid var(--primary);
      margin-left: 0.5rem;
    }
    
    .btn-outline:hover {
      background-color: var(--gray-100);
    }
    
    .features {
      padding: 4rem 0;
      background-color: white;
    }
    
    .section-title {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .section-title h2 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    .section-title p {
      font-size: 1.125rem;
      color: #4b5563;
      max-width: 700px;
      margin: 0 auto;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 2rem;
    }
    
    @media (min-width: 640px) {
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (min-width: 1024px) {
      .features-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    .feature-card {
      background-color: var(--gray-100);
      border-radius: 0.5rem;
      padding: 2rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    }
    
    .feature-icon {
      width: 48px;
      height: 48px;
      background-color: rgba(2, 132, 199, 0.1);
      border-radius: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }
    
    .feature-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    footer {
      background-color: #1f2937;
      color: white;
      padding: 4rem 0 2rem;
    }
    
    .footer-content {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 2rem;
    }
    
    @media (min-width: 768px) {
      .footer-content {
        grid-template-columns: 2fr 1fr 1fr;
      }
    }
    
    .footer-logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      margin-bottom: 1rem;
      display: inline-block;
    }
    
    .footer-text {
      color: #d1d5db;
      margin-bottom: 1.5rem;
    }
    
    .footer h4 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    
    .footer-links {
      list-style: none;
    }
    
    .footer-links li {
      margin-bottom: 0.75rem;
    }
    
    .footer-links a {
      color: #d1d5db;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .footer-links a:hover {
      color: white;
    }
    
    .social-links {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    
    .social-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background-color: #374151;
      border-radius: 9999px;
      color: white;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    
    .social-icon:hover {
      background-color: var(--primary);
    }
    
    .copyright {
      text-align: center;
      border-top: 1px solid #374151;
      padding-top: 2rem;
      margin-top: 3rem;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="banner">🚀 Coming Soon - Our full website is under development</div>
  
  <header>
    <div class="container">
      <nav class="navbar">
        <a href="/" class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 22l10-10M16 8l-2 4 4 2-2 4"></path>
            <circle cx="12" cy="6" r="4"></circle>
          </svg>
          MyDentalFly
        </a>
        
        <ul class="nav-links">
          <li><a href="#services">Services</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#treatments">Treatments</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        
        <button class="mobile-menu-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <div class="hero-text">
          <h1>Your Perfect Smile Awaits in Istanbul</h1>
          <p>Compare treatment options from top-rated dental clinics in Istanbul. Get personalized quotes, book your appointment, and save up to 70% on UK dental prices.</p>
          <div>
            <a href="#contact" class="btn btn-primary">Request a Free Quote</a>
            <a href="#about" class="btn btn-outline">Learn More</a>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&auto=format&fit=crop&q=80" alt="Dental clinic in Istanbul">
        </div>
      </div>
    </div>
  </section>

  <section class="features" id="services">
    <div class="container">
      <div class="section-title">
        <h2>Why Choose MyDentalFly?</h2>
        <p>We connect you with the best dental clinics in Istanbul, offering quality care at affordable prices.</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">💰</div>
          <h3>Save Up to 70%</h3>
          <p>High-quality dental treatments at a fraction of UK prices, without compromising on quality.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">⭐</div>
          <h3>Top-Rated Clinics</h3>
          <p>All our partner clinics are carefully vetted and meet international standards for dental care.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">⏱️</div>
          <h3>Fast Treatment Times</h3>
          <p>Complete your dental work in days instead of months, with efficient treatment planning.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">📋</div>
          <h3>Free Quote Comparison</h3>
          <p>Receive personalized quotes from multiple clinics to compare prices and treatment options.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🛡️</div>
          <h3>Long-Term Guarantees</h3>
          <p>All treatments come with extended warranties and aftercare support for your peace of mind.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🏨</div>
          <h3>All-Inclusive Packages</h3>
          <p>Hotel accommodations, airport transfers, and local transport can be included in your treatment package.</p>
        </div>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-content">
        <div>
          <a href="/" class="footer-logo">MyDentalFly</a>
          <p class="footer-text">Your gateway to affordable, high-quality dental care in Istanbul. We connect patients with top-rated dental clinics for all treatments, from simple cleanings to complex full-mouth restorations.</p>
          <div class="social-links">
            <a href="#" class="social-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" class="social-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a href="#" class="social-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
        
        <div>
          <h4>Treatments</h4>
          <ul class="footer-links">
            <li><a href="#">Dental Implants</a></li>
            <li><a href="#">Veneers</a></li>
            <li><a href="#">Crowns & Bridges</a></li>
            <li><a href="#">Teeth Whitening</a></li>
            <li><a href="#">Smile Makeover</a></li>
          </ul>
        </div>
        
        <div>
          <h4>Contact Us</h4>
          <ul class="footer-links">
            <li><a href="mailto:info@mydentalfly.com">info@mydentalfly.com</a></li>
            <li><a href="tel:+441234567890">+44 1234 567890</a></li>
            <li><a href="#">Book Consultation</a></li>
            <li><a href="#">Request Quote</a></li>
          </ul>
        </div>
      </div>
      
      <div class="copyright">
        &copy; 2025 MyDentalFly. All rights reserved.
      </div>
    </div>
  </footer>
</body>
</html>\`);
}

// Create server
const server = http.createServer((req, res) => {
  console.log(\`Request received: \${req.method} \${req.url}\`);
  
  // Parse the URL
  const url = new URL(req.url, \`http://\${req.headers.host}\`);
  const pathname = url.pathname;
  
  // Handle API endpoints
  if (pathname.startsWith('/api/')) {
    handleApiRequest(pathname, req, res);
    return;
  }
  
  // Health check endpoint
  if (pathname === '/api/health' || pathname === '/_health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'MyDentalFly server is operational'
    }));
    return;
  }
  
  // Serve static files
  let filePath = pathname === '/' ? 'index.html' : pathname.substring(1);
  
  const contentTypeMap = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };
  
  const extname = path.extname(filePath);
  const contentType = contentTypeMap[extname] || 'text/plain';
  
  serveStaticFile(filePath, contentType, res);
});

// Handle API requests
function handleApiRequest(pathname, req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Handle different API endpoints
  if (pathname === '/api/treatments' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockDatabase.treatments));
    return;
  }
  
  if (pathname === '/api/clinics' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockDatabase.clinics));
    return;
  }
  
  // Default: endpoint not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'API endpoint not found' }));
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(\`MyDentalFly server running on port \${PORT}\`);
  console.log(\`Server ready at http://0.0.0.0:\${PORT}\`);
  console.log(\`Health check endpoint available at /api/health\`);
});
`;

  fs.writeFileSync('./dist/start.mjs', startScript);

  console.log('Build completed successfully!');
  console.log('Your application is ready for deployment WITHOUT any secrets!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}