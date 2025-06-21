const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building MyDentalFly for production deployment...');

// Clean previous build
if (fs.existsSync('./dist')) {
  console.log('Cleaning previous build...');
  execSync('rm -rf ./dist');
}

// Create dist directory
fs.mkdirSync('./dist', { recursive: true });

// Build the Vite app
console.log('Building Vite application...');
try {
  execSync('cd client && npm run build', { stdio: 'inherit' });

  // Copy Vite build to dist/public
  execSync('cp -r client/dist/* ./dist/');
  console.log('✅ Vite build completed');
} catch (error) {
  console.error('❌ Vite build failed:', error.message);
  process.exit(1);
}

// Prepare server files
console.log('Preparing server files...');
execSync('cp -r server ./dist/');
execSync('cp -r shared ./dist/');
execSync('cp -r public ./dist/public-assets');

// Copy package.json for dependencies
execSync('cp package.json ./dist/');

// Create production start script
const startScript = `
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { registerRoutes } from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting MyDentalFly production server...');

const app = express();
const PORT = process.env.PORT || 5000;

// Set production mode
process.env.NODE_ENV = 'production';

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: 'production'
  });
});

// Register API routes
const httpServer = await registerRoutes(app);

// Serve static files
app.use(express.static(join(__dirname, '.')));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(\`✅ MyDentalFly server running on http://0.0.0.0:\${PORT}\`);
  console.log('🚀 Production deployment ready');
});
`;

fs.writeFileSync('./dist/start.mjs', startScript);

console.log('✅ Production build completed successfully!');
console.log('📦 Files ready in ./dist directory');