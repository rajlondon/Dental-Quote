import { Router } from 'express';
import fromPromoRouter from './fromPromoRoutes';

const quotesRouter = Router();

// Mount the routes
quotesRouter.use('/from-promo', fromPromoRouter);

export default quotesRouter;