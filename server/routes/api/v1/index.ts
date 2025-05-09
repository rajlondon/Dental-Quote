import { Router } from 'express';
import quotesRoutes from './quotes';

const router = Router();

// Mount the routes
router.use('/quotes', quotesRoutes);

export default router;