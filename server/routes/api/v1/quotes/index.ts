import { Router } from 'express';
import fromPromoRoutes from './fromPromoRoutes';

const router = Router();

// Mount the routes
router.use(fromPromoRoutes);

export default router;