// Custom deploy script for Replit
const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy index.html to public directory for deployment
const sourceIndexHtml = path.join(__dirname, 'public', 'index.html');
const destIndexHtml = path.join(publicDir, 'index.html');

if (fs.existsSync(sourceIndexHtml)) {
  fs.copyFileSync(sourceIndexHtml, destIndexHtml);
  console.log('Index.html copied to public directory');
} else {
  console.error('Source index.html not found');
}

console.log('Deployment preparation complete');