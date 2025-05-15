import { Router } from 'express';
import quotesRouter from './quotes';
import standaloneQuoteRoutes from './standalone-quote-routes';

const router = Router();

// Register all API routes
router.use('/quotes', quotesRouter);

// Standalone quote test API routes
router.use('/', standaloneQuoteRoutes);

// Additional routes can be registered here
// router.use('/promo-codes', promoCodesRouter);
// router.use('/special-offers', specialOffersRouter);

export default router;