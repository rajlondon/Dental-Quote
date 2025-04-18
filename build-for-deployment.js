/**
 * MyDentalFly Production Build Script
 * This script creates a production-ready build for deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting production build process...');

// Ensure we're in a clean state
try {
  // Create dist/public directory if it doesn't exist
  const publicDir = path.join(__dirname, 'dist', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Create public directory if it doesn't exist
  const rootPublicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(rootPublicDir)) {
    fs.mkdirSync(rootPublicDir, { recursive: true });
  }

  // Build the client-side app
  console.log('Building client application...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Client build successful!');
  } catch (error) {
    console.error('Client build failed:', error);
    process.exit(1);
  }

  // Copy from dist/public to public
  console.log('Copying build files to public directory...');
  try {
    // Ensure we have something in dist/public before trying to copy
    const distPublicFiles = fs.readdirSync(path.join(__dirname, 'dist', 'public'));
    if (distPublicFiles.length > 0) {
      // Copy all files from dist/public to public
      distPublicFiles.forEach(file => {
        const sourcePath = path.join(__dirname, 'dist', 'public', file);
        const targetPath = path.join(__dirname, 'public', file);
        
        if (fs.lstatSync(sourcePath).isDirectory()) {
          // Recursively copy directory
          copyDir(sourcePath, targetPath);
        } else {
          // Copy file
          fs.copyFileSync(sourcePath, targetPath);
        }
      });
      console.log('Files copied successfully!');
    } else {
      console.warn('No files found in dist/public. Check the build process.');
    }
  } catch (error) {
    console.error('Error copying files:', error);
  }

  // Create a simple index.html if needed
  if (!fs.existsSync(path.join(__dirname, 'public', 'index.html'))) {
    console.log('Creating fallback index.html...');
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyDentalFly - Premium Dental Care</title>
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
    fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), fallbackHtml);
    console.log('Fallback index.html created.');
  }

  console.log('Build process completed successfully!');
  console.log('You can now deploy the application by clicking the Deploy button.');
} catch (error) {
  console.error('Build process failed:', error);
}

// Helper function to recursively copy directories
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  // Get all files and subdirectories in the source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  // Copy each entry
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy subdirectory
      copyDir(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  }
}