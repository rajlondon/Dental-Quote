import { Router } from 'express';
import path from 'path';

const router = Router();

// Serve the promo code testing page at /promo-test
router.get('/promo-test', (req, res) => {
  const promoTestPath = path.resolve('public/promo-test.html');
  res.sendFile(promoTestPath);
});

export default router;