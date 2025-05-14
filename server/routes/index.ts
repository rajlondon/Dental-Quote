import { Router } from 'express';
import quotesRouter from './quotes';

const router = Router();

// Register all API routes
router.use('/quotes', quotesRouter);

// Additional routes can be registered here
// router.use('/promo-codes', promoCodesRouter);
// router.use('/special-offers', specialOffersRouter);

export default router;