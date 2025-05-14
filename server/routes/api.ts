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
router.use('/promo-codes', testQuoteDataRoutes);
router.use('/promo', testQuoteDataRoutes);

export default router;