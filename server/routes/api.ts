/**
 * Main API Router
 * This router consolidates all API endpoints
 */
import express from 'express';
import testQuoteDataRoutes from './test-quote-data-routes';

const router = express.Router();

// Mount test routes for quote data
router.use('/treatments', testQuoteDataRoutes);
router.use('/treatment-packages', testQuoteDataRoutes);
router.use('/addons', testQuoteDataRoutes);
router.use('/promo', testQuoteDataRoutes);
router.use('/special-offers', testQuoteDataRoutes);
router.use('/test-promo-applied', testQuoteDataRoutes);

// Special route to get test promo codes 
// This avoids conflict with the /api/promo-codes route that's already defined
router.use('/test-promo-codes', testQuoteDataRoutes);

export default router;