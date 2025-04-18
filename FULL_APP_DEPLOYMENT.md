# Full Application Deployment Guide

This guide explains how to deploy the complete MyDentalFly application (React frontend + Express backend) to your domains.

## Prerequisites

Before starting the deployment, ensure you have:

1. All environment variables properly set up in the Replit Secrets panel:
   - Set "Expose to Deployments" toggle to ON for the following secrets:
     - `STRIPE_SECRET_KEY`
     - `VITE_STRIPE_PUBLIC_KEY`
     - `STRIPE_PUBLIC_KEY`
     - All other API keys your application uses

2. Verified your application works locally in development mode

## Deployment Steps

### Step 1: Update the Build Process

Create a production build script that properly builds the Vite app:

1. Create a file called `build-full-app.js`:

```javascript
/**
 * Full Application Build Script
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Clean previous build
if (fs.existsSync('./dist')) {
  console.log('Cleaning previous build...');
  execSync('rm -rf ./dist');
}

// Create dist directory
fs.mkdirSync('./dist', { recursive: true });
fs.mkdirSync('./dist/public', { recursive: true });

// Build the Vite app
console.log('Building Vite application...');
execSync('cd client && npm run build');

// Prepare server files
console.log('Preparing server files...');
execSync('cp -r server ./dist/');
execSync('cp -r shared ./dist/');

// Create start.mjs
const startScript = `
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import { registerRoutes } from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up Express
const app = express();
const PORT = process.env.PORT || 3000;

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Register all API routes
const httpServer = await registerRoutes(app);

// Serve static files from Vite build
app.use(express.static(join(__dirname, 'public')));

// Always return index.html for any unknown routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Start the server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server running on http://0.0.0.0:\${PORT}\`);
});
`;

fs.writeFileSync('./dist/start.mjs', startScript);

console.log('Build completed successfully!');
```

### Step 2: Update Deployment Configuration

1. Update `.replit.deploy` to use your full app:

```
run = "node dist/start.mjs"
entrypoint = "dist/start.mjs"
```

2. Create a pre-deploy script to build your app:

```javascript
// pre-deploy.js
const { execSync } = require('child_process');
console.log('Building full application for deployment...');
execSync('node build-full-app.js');
```

### Step 3: Deploy the Application

1. Click the "Deploy" button in the Replit interface
2. The pre-deploy script will build your full application
3. Replit will deploy your application to your domains
4. Verify that your application is working correctly

## Troubleshooting

If you encounter issues with the deployment:

1. Check the deployment logs for errors
2. Verify that all environment variables are correctly set up
3. Ensure that your application works correctly in development mode
4. Check the server logs for any runtime errors

## Switching Back to Landing Page

If you need to temporarily revert to the landing page deployment:

1. Restore the previous `.replit.deploy` configuration:
```
run = "node dist/start.mjs"
entrypoint = "dist/start.mjs"
```

2. Restore the landing page `dist/start.mjs` file
3. Deploy again

## Support

If you need further assistance with deployment, please contact support.