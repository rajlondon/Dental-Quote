/**
 * Flask Bridge Server Routes
 * 
 * These routes create a bridge between the Express server and the Flask backend
 * This allows the React client to communicate with the Flask service
 */
import { Express, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import session from 'express-session';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

let flaskProcess: ChildProcess | null = null;

export function registerFlaskBridge(app: Express) {
  // Start Flask server if not already running
  startFlaskServer();

  // Setup proxy to Flask server for all /api/flask routes
  const flaskProxy = createProxyMiddleware({
    target: 'http://localhost:8080',
    changeOrigin: true,
    pathRewrite: {
      '^/api/flask': '', // remove the /api/flask prefix when forwarding to flask
    },
    onProxyReq: (proxyReq, req, res) => {
      // Copy session data to Flask when proxying
      if (req.session) {
        proxyReq.setHeader('X-Session-Data', JSON.stringify(req.session));
      }
    },
    onError: (err, req, res) => {
      console.error('Flask proxy error:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Flask service unavailable',
        error: err.message
      });
    }
  });

  // Special offers endpoint
  app.get('/api/special-offers', async (req: Request, res: Response) => {
    try {
      // Hardcoded special offers as a fallback when Flask is not available
      const fallbackOffers = [
        {
          id: 'ac36590b-b0dc-434e-ba74-d42ab2486a21',
          title: 'Premium Implant Package',
          description: 'Complete dental implant solution with premium materials',
          image_path: 'images/offers/implant-package.jpg',
          discount: '30% off',
          price: 1450,
          old_price: 2100,
          promo_code: 'IMPLANTCROWN30',
          limited: true,
          clinicId: 1,
          treatmentIds: [1, 2],
          expiry_date: '2025-07-30'
        },
        {
          id: 'c451b302-9d1e-4d9a-b8bc-8f10c579e19f',
          title: 'Luxury Smile Makeover',
          description: 'Complete smile transformation with hotel accommodation included',
          image_path: 'images/offers/smile-makeover.jpg',
          discount: 'Save €3000',
          price: 2999,
          old_price: 5999,
          promo_code: 'LUXHOTEL20',
          limited: true,
          clinicId: 2,
          treatmentIds: [5, 4, 2],
          expiry_date: '2025-06-30'
        },
        {
          id: '7e89d21a-0c3e-4fe5-baf4-0e9d8a35f8e2',
          title: 'Travel & Treatment Bundle',
          description: 'All-inclusive package with flights, luxury hotel, and premium treatments',
          image_path: 'images/offers/travel-bundle.jpg',
          discount: '40% off',
          price: 1999,
          old_price: 3499,
          promo_code: 'LUXTRAVEL',
          limited: false,
          clinicId: 3,
          treatmentIds: [1, 2, 6],
          expiry_date: '2025-08-15'
        }
      ];

      try {
        // Try to get offers from Flask server
        await fetch('http://localhost:8080/api/special-offers');
        // If the fetch is successful, proxy to the Flask service
        flaskProxy(req, res);
      } catch (error) {
        // If Flask is not available, use fallback data
        console.warn('Flask service not available, using fallback special offers data');
        res.json(fallbackOffers);
      }
    } catch (error) {
      console.error('Error in special offers endpoint:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving special offers' 
      });
    }
  });

  // Mount the proxy for all Flask API routes
  app.use('/api/flask', flaskProxy);

  // Helper bridge endpoints
  app.get('/api/flask-status', (req: Request, res: Response) => {
    res.json({
      running: flaskProcess !== null && flaskProcess.exitCode === null,
      pid: flaskProcess?.pid
    });
  });

  app.post('/api/restart-flask', (req: Request, res: Response) => {
    try {
      stopFlaskServer();
      startFlaskServer();
      res.json({ success: true, message: 'Flask server restarted' });
    } catch (error) {
      console.error('Error restarting Flask server:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error restarting Flask server',
        error
      });
    }
  });
}

function startFlaskServer() {
  if (flaskProcess !== null) {
    console.log('Flask server is already running');
    return;
  }

  try {
    console.log('Starting Flask server...');
    const flaskPath = path.join(process.cwd(), 'dental-system/run.py');
    
    // Ensure the path exists
    if (!fs.existsSync(flaskPath)) {
      console.error(`Flask server path not found: ${flaskPath}`);
      return;
    }

    // Start the Flask server
    flaskProcess = spawn('python3', [flaskPath], {
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
      stdio: 'pipe'
    });

    // Handle Flask output
    flaskProcess.stdout?.on('data', (data) => {
      console.log(`[Flask] ${data.toString().trim()}`);
    });

    flaskProcess.stderr?.on('data', (data) => {
      console.error(`[Flask Error] ${data.toString().trim()}`);
    });

    flaskProcess.on('close', (code) => {
      console.log(`Flask server process exited with code ${code}`);
      flaskProcess = null;
    });

    flaskProcess.on('error', (err) => {
      console.error('Failed to start Flask server:', err);
      flaskProcess = null;
    });

    console.log(`Flask server started with PID ${flaskProcess.pid}`);
  } catch (error) {
    console.error('Error starting Flask server:', error);
    flaskProcess = null;
  }
}

function stopFlaskServer() {
  if (flaskProcess !== null) {
    console.log('Stopping Flask server...');
    flaskProcess.kill();
    flaskProcess = null;
  }
}