import { Router } from 'express';
import axios from 'axios';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

// Configure Flask service URL - this points to our Flask application
const FLASK_SERVICE_URL = process.env.FLASK_SERVICE_URL || 'http://localhost:8080';

// Create Flask proxy for quote builder components
const flaskProxy = createProxyMiddleware({
  target: FLASK_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/flask': '', // remove the /api/flask prefix
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add authentication headers if available
    if (req.session?.user) {
      proxyReq.setHeader('X-User-ID', req.session.user.id.toString());
      proxyReq.setHeader('X-User-Role', req.session.user.role || 'patient');
    }
    
    // Log the request for debugging
    console.log(`[Flask Proxy] Forwarding request to: ${FLASK_SERVICE_URL}${req.url.replace('/api/flask', '')}`);
  },
  onError: (err, req, res) => {
    console.error('[Flask Proxy] Error:', err);
    res.status(500).json({
      success: false,
      message: 'Flask service unavailable',
      error: err.message
    });
  }
});

// Apply the proxy middleware for direct Flask passthrough
router.use('/flask', flaskProxy);

// Endpoint to sync quote data between React and Flask
router.post('/quote-sync', async (req, res) => {
  try {
    const quoteData = req.body;
    console.log('[Flask Bridge] Syncing quote data with Flask:', JSON.stringify(quoteData).substring(0, 100) + '...');
    
    // Send to Flask
    const response = await axios.post(`${FLASK_SERVICE_URL}/api/quote-data-sync`, {
      quote: quoteData,
      user: req.session?.user || { id: 'anonymous' },
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: response.data,
      message: 'Successfully synchronized with Flask service'
    });
  } catch (error) {
    console.error('[Flask Bridge] Error syncing with Flask:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to synchronize with Flask service',
      error: error.message
    });
  }
});

// Interface to get promo code validation from Flask
router.post('/validate-promo', async (req, res) => {
  try {
    const { promoCode, quoteTotal, treatments } = req.body;
    console.log(`[Flask Bridge] Validating promo code: ${promoCode}`);
    
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
    console.error('[Flask Bridge] Error validating promo code:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to validate promo code',
      error: error.message
    });
  }
});

// Custom entry point for redirecting to Flask quote builder with parameters
router.get('/start-flask-quote', (req, res) => {
  try {
    // Extract parameters
    const { promoCode, clinicId, treatments } = req.query;
    
    // Build Flask URL with parameters
    let flaskUrl = `${FLASK_SERVICE_URL}/quote-builder/?`;
    
    if (promoCode) flaskUrl += `promo=${promoCode}&`;
    if (clinicId) flaskUrl += `clinic_id=${clinicId}&`;
    if (treatments) flaskUrl += `treatments=${treatments}&`;
    
    console.log(`[Flask Bridge] Redirecting to Flask quote builder: ${flaskUrl}`);
    
    // Redirect to the Flask quote builder
    res.redirect(flaskUrl);
  } catch (error) {
    console.error('[Flask Bridge] Error redirecting to Flask:', error);
    res.status(500).send('Error accessing quote builder');
  }
});

export default router;