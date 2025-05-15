import { Router } from 'express';
import path from 'path';

const router = Router();

// Serve the promo code testing page at /promo-test
router.get('/promo-test', (req, res) => {
  const promoTestPath = path.resolve('public/promo-test.html');
  res.sendFile(promoTestPath);
});

// Serve clinic direct test page access
router.get('/clinic-test-direct', (req, res) => {
  const clinicTestDirectPath = path.resolve('client/public/clinic-test-direct.html');
  res.sendFile(clinicTestDirectPath);
});

// Alternative shortcut URL for clinic staff to access test page
router.get('/clinic-test', (req, res) => {
  res.redirect('/clinic-quote-test');
});

// Standalone quote test page that doesn't require authentication
router.get('/quote-management', (req, res) => {
  const standalonePath = path.resolve('public/standalone-quote-test.html');
  res.sendFile(standalonePath);
});

export default router;