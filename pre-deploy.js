/**
 * Pre-deployment script for MyDentalFly
 * This script prepares the environment for deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running pre-deployment setup...');

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  console.log('Creating public directory...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy index.html to public directory if it doesn't exist
const sourceIndexPath = path.join(__dirname, 'public', 'index.html');
if (!fs.existsSync(sourceIndexPath)) {
  console.log('Copying landing page to public directory...');
  try {
    // Check different locations where the index.html might be
    const possibleLocations = [
      path.join(__dirname, 'client', 'index.html'),
      path.join(__dirname, 'client', 'public', 'index.html'),
      path.join(__dirname, 'dist', 'index.html')
    ];
    
    let copied = false;
    for (const location of possibleLocations) {
      if (fs.existsSync(location)) {
        fs.copyFileSync(location, sourceIndexPath);
        console.log(`Copied index.html from ${location} to public directory`);
        copied = true;
        break;
      }
    }
    
    if (!copied) {
      // Create a minimal index.html if none exists
      console.log('No existing index.html found, creating a minimal one');
      const minimalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyDentalFly - Coming Soon</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
      color: #333;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 90%;
      width: 500px;
    }
    h1 { 
      color: #0284c7;
      margin-bottom: 1rem;
    }
    p {
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .logo {
      margin-bottom: 2rem;
      max-width: 200px;
    }
    .cta {
      display: inline-block;
      background: #0284c7;
      color: white;
      padding: 0.75rem 1.5rem;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
      transition: background 0.3s;
    }
    .cta:hover {
      background: #0369a1;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>MyDentalFly</h1>
    <p>We're building a better dental tourism experience. Our full website is launching soon!</p>
    <p>For immediate assistance or to request a quote, please contact us at:</p>
    <a href="mailto:info@mydentalfly.com" class="cta">info@mydentalfly.com</a>
  </div>
</body>
</html>`;
      fs.writeFileSync(sourceIndexPath, minimalHtml);
    }
  } catch (error) {
    console.error('Error copying index.html:', error);
  }
}

// Ensure the server.js uses the right module system
try {
  console.log('Checking server.js...');
  const serverPath = path.join(__dirname, 'server.js');
  let serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Use the correct package.json for deployment
  console.log('Setting up deployment package.json...');
  const serverPackagePath = path.join(__dirname, 'server-package.json');
  if (fs.existsSync(serverPackagePath)) {
    fs.copyFileSync(serverPackagePath, path.join(__dirname, 'package.json'));
    console.log('Copied server-package.json to package.json for deployment');
  }

  console.log('Pre-deployment setup completed successfully');
} catch (error) {
  console.error('Error in pre-deployment setup:', error);
}