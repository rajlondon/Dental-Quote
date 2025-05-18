import { Router } from 'express';
import axios from 'axios';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Configure Flask service URL
const FLASK_SERVICE_URL = process.env.FLASK_SERVICE_URL || 'http://localhost:8080';

const router = Router();

// Create a proxy middleware for direct Flask passthrough
const flaskProxy = createProxyMiddleware({
  target: FLASK_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/flask': '', // remove the /api/flask prefix
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add any authentication headers if needed
    if (req.session?.user) {
      proxyReq.setHeader('X-User-ID', req.session.user.id.toString());
      proxyReq.setHeader('X-User-Role', req.session.user.role || 'patient');
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

// Apply the proxy middleware to all Flask API routes
router.use('/flask', flaskProxy);

// Special entry point for quote builder with parameters
router.get('/quote-builder', (req, res) => {
  // Construct Flask URL with parameters
  const { promoCode, clinicId, treatments } = req.query;
  let flaskUrl = `${FLASK_SERVICE_URL}/quote-builder/?`;
  
  if (promoCode) flaskUrl += `promo=${promoCode}&`;
  if (clinicId) flaskUrl += `clinic_id=${clinicId}&`;
  if (treatments) flaskUrl += `treatments=${treatments}&`;
  
  // Redirect to the Flask quote builder
  res.redirect(flaskUrl);
});

// Sync Flask session data with main application
router.post('/quote-sync', async (req, res) => {
  try {
    // Get quote data from the request
    const quoteData = req.body;
    
    // Send to Flask for processing and storage
    const response = await axios.post(`${FLASK_SERVICE_URL}/api/sync-quote`, {
      quote: quoteData,
      user: req.session?.user,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: response.data,
      message: 'Successfully synchronized with Flask service'
    });
  } catch (error) {
    console.error('Error syncing with Flask:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to synchronize with Flask service',
      error: error.message
    });
  }
});

// Get quote data from Flask
router.get('/quote/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get quote data from Flask
    const response = await axios.get(`${FLASK_SERVICE_URL}/api/quote/${id}`);
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error retrieving quote from Flask:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to retrieve quote data',
      error: error.message
    });
  }
});

// Apply promo code through Flask validation
router.post('/validate-promo', async (req, res) => {
  try {
    const { promoCode, quoteTotal, treatments } = req.body;
    
    // Validate promo code through Flask service
    const response = await axios.post(`${FLASK_SERVICE_URL}/api/validate-promo`, {
      promoCode,
      quoteTotal,
      treatments
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to validate promo code',
      error: error.message
    });
  }
});

export default router;