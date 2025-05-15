/**
 * Test Quote Data Routes
 * 
 * This file contains routes for serving test data for quotes, treatments,
 * special offers, and packages that can be used for testing the UI.
 */
import { Router } from 'express';
import { Request, Response } from 'express';
import { catchAsync } from '../middleware/error-handler';

const router = Router();

// Sample test data for treatments
const testTreatments = [
  { id: 'tr-001', name: 'Dental Implant', price: 700, quantity: 1 },
  { id: 'tr-002', name: 'Crown', price: 350, quantity: 1 },
  { id: 'tr-003', name: 'Veneer', price: 300, quantity: 1 },
  { id: 'tr-004', name: 'Root Canal', price: 400, quantity: 1 },
  { id: 'tr-005', name: 'Teeth Whitening', price: 250, quantity: 1 },
];

// Sample test data for special offers
const testSpecialOffers = [
  {
    id: 'offer-001',
    title: 'Welcome Discount',
    description: '20% off your first treatment',
    discountPercentage: 20,
    minPurchaseAmount: 500,
    maxDiscountAmount: 300,
    applicableTreatments: ['tr-001', 'tr-002', 'tr-003'],
    imageUrl: '/images/offers/welcome-discount.jpg'
  },
  {
    id: 'offer-002',
    title: 'Implant Package',
    description: '15% off implant + crown combination',
    discountPercentage: 15,
    minPurchaseAmount: 1000,
    maxDiscountAmount: 400,
    applicableTreatments: ['tr-001', 'tr-002'],
    imageUrl: '/images/offers/implant-package.jpg'
  },
  {
    id: 'offer-003',
    title: 'Smile Makeover',
    description: 'Free teeth whitening with 4+ veneers',
    discountPercentage: 100, // 100% off the teeth whitening
    minPurchaseAmount: 1200,
    maxDiscountAmount: 250, // Max discount is the price of teeth whitening
    applicableTreatments: ['tr-003', 'tr-005'],
    imageUrl: '/images/offers/smile-makeover.jpg'
  }
];

// Sample test data for treatment packages
const testTreatmentPackages = [
  {
    id: 'pkg-001',
    title: 'Complete Implant Solution',
    description: 'Dental implant with crown at a bundle price',
    originalPrice: 1050, // Sum of individual treatments
    packagePrice: 950, // Discounted package price
    savings: 100,
    includedTreatments: [
      { treatmentId: 'tr-001', quantity: 1 },
      { treatmentId: 'tr-002', quantity: 1 }
    ],
    imageUrl: '/images/packages/implant-solution.jpg'
  },
  {
    id: 'pkg-002',
    title: 'Smile Transformation',
    description: '4 veneers and teeth whitening for a complete smile makeover',
    originalPrice: 1450, // Sum of individual treatments
    packagePrice: 1250, // Discounted package price
    savings: 200,
    includedTreatments: [
      { treatmentId: 'tr-003', quantity: 4 },
      { treatmentId: 'tr-005', quantity: 1 }
    ],
    imageUrl: '/images/packages/smile-transformation.jpg'
  },
  {
    id: 'pkg-003',
    title: 'Full Mouth Rehabilitation',
    description: 'Comprehensive treatment package for full mouth restoration',
    originalPrice: 3000, // Sum of individual treatments
    packagePrice: 2500, // Discounted package price
    savings: 500,
    includedTreatments: [
      { treatmentId: 'tr-001', quantity: 2 },
      { treatmentId: 'tr-002', quantity: 2 },
      { treatmentId: 'tr-004', quantity: 2 }
    ],
    imageUrl: '/images/packages/full-mouth-rehab.jpg'
  }
];

// GET /api/treatments - Return test treatments
router.get('/treatments', catchAsync(async (req: Request, res: Response) => {
  res.json(testTreatments);
}));

// GET /api/offers - Return test special offers
router.get('/offers', catchAsync(async (req: Request, res: Response) => {
  res.json(testSpecialOffers);
}));

// GET /api/packages - Return test treatment packages
router.get('/packages', catchAsync(async (req: Request, res: Response) => {
  res.json(testTreatmentPackages);
}));

export default router;