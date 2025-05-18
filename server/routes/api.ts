/**
 * Main API Router
 * This router consolidates all API endpoints
 */
import express from 'express';
import testQuoteDataRoutes from './test-quote-data-routes';
import flaskBridgeRoutes from './flask-bridge';
import axios from 'axios';

const router = express.Router();

// Configure Flask service URL
const FLASK_SERVICE_URL = process.env.FLASK_SERVICE_URL || 'http://localhost:8080';

// Mount Flask integration routes
router.use(flaskBridgeRoutes);

// Direct quote sync endpoint
router.post('/quote-sync', async (req, res) => {
  try {
    console.log('[API Router] Quote sync request received, forwarding to Flask');
    const quoteData = req.body;
    
    // Forward to Flask
    const response = await axios.post(`${FLASK_SERVICE_URL}/api/quote-data-sync`, {
      quote: quoteData,
      user: req.session?.user || { id: 'anonymous' },
      timestamp: new Date().toISOString()
    });
    
    console.log('[API Router] Received response from Flask');
    return res.json({
      success: true,
      data: response.data,
      message: 'Successfully synchronized with Flask service'
    });
  } catch (error) {
    console.error('[API Router] Error syncing with Flask:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to synchronize with Flask service',
      error: error.message
    });
  }
});

// Special promo code validation endpoint
router.post('/validate-promo', async (req, res) => {
  try {
    console.log('[API Router] Validating promo code');
    const { promoCode, quoteTotal, treatments } = req.body;
    
    // Forward to Flask
    const response = await axios.post(`${FLASK_SERVICE_URL}/api/validate-promo`, {
      promoCode,
      quoteTotal,
      treatments
    });
    
    return res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('[API Router] Error validating promo code:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate promo code',
      error: error.message
    });
  }
});

// Get special offers from Flask
router.get('/special-offers', async (req, res) => {
  try {
    console.log('[API Router] Getting special offers from Flask');
    
    // Get offers from Flask
    const response = await axios.get(`${FLASK_SERVICE_URL}/api/special-offers`);
    
    return res.json(response.data);
  } catch (error) {
    console.error('[API Router] Error getting special offers:', error);
    
    // Fallback to local test data if Flask is unavailable
    return res.json([
      {
        id: "ac36590b-b0dc-434e-ba74-d42ab2483f41",
        title: "Premium Implant Package",
        description: "Complete dental implant solution with premium materials",
        imageUrl: "/assets/special-offers/implant-package.jpg",
        discount: "30% off",
        price: 1450,
        oldPrice: 2100,
        promoCode: "IMPLANTCROWN30",
        limited: true,
        clinicId: 1,
        treatmentIds: [1, 2],
        expiryDate: "2025-07-30"
      },
      {
        id: "79a8f452-7398-4487-a5c9-35c4b998f2eb",
        title: "Luxury Smile Makeover",
        description: "Complete smile transformation with hotel accommodation included",
        imageUrl: "/assets/special-offers/smile-makeover.jpg",
        discount: "Save €3000",
        price: 2999,
        oldPrice: 5999,
        promoCode: "LUXHOTEL20",
        limited: true,
        clinicId: 2,
        treatmentIds: [5, 4, 2], 
        expiryDate: "2025-06-30"
      },
      {
        id: "5e68734d-6092-4822-a9ec-5099316c6d6f",
        title: "Travel & Treatment Bundle",
        description: "All-inclusive package with flights, luxury hotel, and premium treatments",
        imageUrl: "/assets/special-offers/travel-bundle.jpg",
        discount: "40% off",
        price: 1999,
        oldPrice: 3499,
        promoCode: "LUXTRAVEL",
        limited: false,
        clinicId: 3,
        treatmentIds: [1, 2, 6], 
        expiryDate: "2025-08-15"
      }
    ]);
  }
});

// Mount test routes for quote data
router.use('/treatments', testQuoteDataRoutes);
router.use('/treatment-packages', testQuoteDataRoutes);
router.use('/addons', testQuoteDataRoutes);
router.use('/promo', testQuoteDataRoutes);
router.use('/test-promo-applied', testQuoteDataRoutes);

// Special route to get test promo codes 
// This avoids conflict with the /api/promo-codes route that's already defined
router.use('/test-promo-codes', testQuoteDataRoutes);

// Dedicated route for test packages
router.use('/test-packages', testQuoteDataRoutes);

export default router;