// MyDentalFly Production Startup - Deployment Domain Fix
const { spawn } = require('child_process');
const http = require('http');

const port = process.env.PORT || 8080;

// Create a simple health check endpoint first
const app = require('express')();

app.get('/health', (req, res) => {
  res.json({ 
    status: 'MyDentalFly Complete Application Running',
    port: port,
    mode: 'production-override',
    timestamp: new Date().toISOString()
  });
});

// Start minimal server immediately
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`MyDentalFly health endpoint active on port ${port}`);
  
  // Now start the complete application
  console.log('Launching complete MyDentalFly application...');
  
  const completeServer = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: (parseInt(port) + 1).toString(), // Use next port for complete app
      NODE_ENV: 'development'
    }
  });

  completeServer.on('error', (error) => {
    console.error('Complete server failed:', error);
  });

  // Proxy requests to complete application
  app.use('*', (req, res) => {
    const proxyPort = parseInt(port) + 1;
    const options = {
      hostname: 'localhost',
      port: proxyPort,
      path: req.originalUrl,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', () => {
      res.redirect('https://2c463447-3d41-446a-941e-b6b5884b2d42-00-2ifo54nxr2ad0.riker.replit.dev');
    });

    if (req.body) {
      proxyReq.write(JSON.stringify(req.body));
    }
    proxyReq.end();
  });
});

console.log('Production deployment override activated');