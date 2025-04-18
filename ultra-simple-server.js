// Simplest possible Node.js server with zero dependencies
const http = require('http');

// Our landing page HTML
const landingPage = `<!DOCTYPE html>
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
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background-color: var(--background);
      color: var(--text);
      line-height: 1.5;
    }
    .banner {
      background-color: var(--primary);
      color: white;
      text-align: center;
      padding: 0.5rem;
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
    }
    .hero {
      padding: 4rem 0;
      text-align: center;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    p {
      margin-bottom: 2rem;
      color: #666;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background-color: var(--primary);
      color: white;
      text-decoration: none;
      border-radius: 0.25rem;
      font-weight: 500;
    }
    footer {
      background-color: #1f2937;
      color: white;
      padding: 2rem 0;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="banner">🚀 Coming Soon - Our full website is under development</div>
  
  <header>
    <div class="container">
      <nav class="navbar">
        <a href="/" class="logo">MyDentalFly</a>
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <h1>Your Perfect Smile Awaits in Istanbul</h1>
      <p>Compare treatment options from top-rated dental clinics in Istanbul. Get personalized quotes, book your appointment, and save up to 70% on UK dental prices.</p>
      <a href="#" class="btn">Learn More</a>
    </div>
  </section>

  <footer>
    <div class="container">
      &copy; 2025 MyDentalFly. All rights reserved.
    </div>
  </footer>
</body>
</html>`;

// Create server
const server = http.createServer((req, res) => {
  // Handle health check endpoint for Replit
  if (req.url === '/api/health' || req.url === '/_health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
    return;
  }
  
  // For all other routes, serve the landing page
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(landingPage);
});

// Get port from environment (Replit sets this) or use 3000 as fallback
const PORT = process.env.PORT || 3000;

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check endpoint available at /api/health`);
});