// Simplified deployment script for Replit
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting deployment preparation...');

try {
  // Create a dist folder if it doesn't exist
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  // Create a simple server.js file that can run in production
  const serverJs = `
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Special test endpoint for domain testing
app.get('/api/domain-test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Domain test successful',
    host: req.get('host'),
    protocol: req.protocol,
    timestamp: new Date().toISOString()
  });
});

// Catch-all route to serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

  // Write the server.js file to the dist directory
  fs.writeFileSync(path.join('dist', 'server.js'), serverJs);
  
  // Create a package.json file for the dist directory
  const packageJson = {
    name: "mydentalfly",
    version: "1.0.0",
    description: "MyDentalFly production deployment",
    main: "server.js",
    scripts: {
      "start": "node server.js"
    },
    dependencies: {
      "express": "^4.18.2"
    }
  };
  
  fs.writeFileSync(
    path.join('dist', 'package.json'), 
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create a simple HTML test file
  const testHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyDentalFly - Domain Test</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f7fa;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2563eb;
      margin-top: 0;
    }
    .status {
      margin: 20px 0;
      padding: 15px;
      border-radius: 5px;
    }
    .success {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #34d399;
    }
    .loading {
      background-color: #fff7ed;
      color: #9a3412;
      border: 1px solid #fdba74;
    }
    .error {
      background-color: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fca5a5;
    }
    .api-test {
      margin-top: 30px;
    }
    button {
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background-color: #1d4ed8;
    }
    pre {
      background-color: #f1f5f9;
      padding: 15px;
      border-radius: 5px;
      overflow: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>MyDentalFly - Domain Test</h1>
    
    <div id="status" class="status loading">
      Testing server connection...
    </div>
    
    <div class="api-test">
      <h2>API Status</h2>
      <button id="check-api">Check API</button>
      <pre id="api-result">Click button to test API connection</pre>
    </div>
    
    <div class="api-test">
      <h2>Domain Information</h2>
      <pre id="domain-info">Loading domain information...</pre>
    </div>
  </div>

  <script>
    // Test domain
    const domainInfo = document.getElementById('domain-info');
    domainInfo.textContent = \`Current URL: \${window.location.href}
Host: \${window.location.host}
Protocol: \${window.location.protocol}
Search Parameters: \${window.location.search}\`;

    // Test API
    const apiResult = document.getElementById('api-result');
    const checkApiBtn = document.getElementById('check-api');
    
    checkApiBtn.addEventListener('click', async () => {
      apiResult.textContent = 'Testing API connection...';
      try {
        const response = await fetch('/api/domain-test');
        if (response.ok) {
          const data = await response.json();
          apiResult.textContent = \`Connection successful!\n\${JSON.stringify(data, null, 2)}\`;
          updateStatus('success', 'Server is accessible! API connection successful.');
        } else {
          apiResult.textContent = \`Error: \${response.status} \${response.statusText}\`;
          updateStatus('error', 'API connection failed with HTTP error.');
        }
      } catch (error) {
        apiResult.textContent = \`Connection error: \${error.message}\`;
        updateStatus('error', 'API connection failed.');
      }
    });

    // Update status
    function updateStatus(type, message) {
      const status = document.getElementById('status');
      status.className = \`status \${type}\`;
      status.textContent = message;
    }

    // Automatically check API on load
    window.addEventListener('load', () => {
      setTimeout(() => {
        checkApiBtn.click();
      }, 1000);
    });
  </script>
</body>
</html>`;
  
  // Make sure we have a public directory
  if (!fs.existsSync(path.join('dist', 'public'))) {
    fs.mkdirSync(path.join('dist', 'public'), { recursive: true });
  }
  
  // Write the test HTML file
  fs.writeFileSync(path.join('dist', 'public', 'index.html'), testHtml);
  fs.writeFileSync(path.join('dist', 'public', 'domaintest.html'), testHtml);
  
  console.log('✅ Deployment files prepared successfully');
  console.log('📝 Next steps:');
  console.log('1. Use the Replit "Deploy" button in the top right');
  console.log('2. After deployment, test your custom domain');
  
} catch (error) {
  console.error('❌ Deployment preparation failed:', error);
}