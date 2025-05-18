/**
 * Treatment Package API Routes
 * Handles operations related to treatment packages
 */
import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { catchAsync } from '../middleware/error-handler';

export const treatmentPackageRouter = Router();

export const treatmentPackages = [
  {
    id: 'pkg_1',
    title: 'Complete Smile Makeover',
    description: 'Full mouth rehabilitation with premium materials and luxury accommodation',
    clinicId: 'maltepe-dental',
    price: 2200,
    currency: 'GBP',
    treatments: ['dental-implants', 'veneers', 'crowns'],
    imageUrl: '/images/treatments/smile-makeover.jpg',
    promoCode: 'SMILE2025',
    discountType: 'percentage',
    discountValue: 15,
    isActive: true
  },
  {
    id: 'pkg_2',
    title: 'VIP Dental Holiday',
    description: 'Combines essential dental treatments with a 5-star Istanbul experience',
    clinicId: 'dentakay-clinic',
    price: 1899,
    currency: 'GBP',
    treatments: ['dental-implants', 'teeth-whitening'],
    imageUrl: '/images/treatments/vip-holiday.jpg',
    promoCode: 'VIPSTAY',
    discountType: 'fixed_amount',
    discountValue: 200,
    isActive: true
  },
  {
    id: 'pkg_3',
    title: 'Budget Implant Package',
    description: 'Quality dental implants at an affordable price with standard accommodation',
    clinicId: 'crown-dental',
    price: 1200,
    currency: 'GBP',
    treatments: ['dental-implants'],
    imageUrl: '/images/treatments/budget-implant.jpg',
    promoCode: 'SAVE2025',
    discountType: 'percentage',
    discountValue: 10,
    isActive: true
  },
  {
    id: 'pkg_4',
    title: 'Summer Dental Special',
    description: 'Special summer package including teeth whitening and cleaning',
    clinicId: 'maltepe-dental',
    price: 1500,
    currency: 'GBP',
    treatments: ['teeth-whitening', 'cleaning'],
    imageUrl: '/images/treatments/summer-special.jpg',
    promoCode: 'SUMMER25',
    discountType: 'percentage',
    discountValue: 25,
    isActive: true
  },
  {
    id: 'pkg_5',
    title: 'Family Dental Package',
    description: 'Comprehensive dental care for the whole family with group discount',
    clinicId: 'crown-dental',
    price: 2500,
    currency: 'GBP',
    treatments: ['checkup', 'cleaning', 'whitening'],
    imageUrl: '/images/treatments/family-package.jpg',
    promoCode: 'FAMILY300',
    discountType: 'fixed_amount',
    discountValue: 300,
    isActive: true
  },
  {
    id: 'test_package',
    title: 'Test Discount Package',
    description: 'Special package for testing promo code functionality',
    clinicId: 'maltepe-dental',
    price: 1000,
    currency: 'GBP',
    treatments: ['test'],
    imageUrl: '/images/treatments/test.jpg',
    promoCode: 'TEST50',
    discountType: 'percentage',
    discountValue: 50,
    isActive: true
  }
];

// Get all treatment packages
treatmentPackageRouter.get('/', catchAsync(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: treatmentPackages
  });
}));

// Get treatment package by ID
treatmentPackageRouter.get('/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const packageData = treatmentPackages.find(pkg => pkg.id === id);
  
  if (!packageData) {
    return res.status(404).json({
      success: false,
      message: 'Treatment package not found'
    });
  }
  
  res.json({
    success: true,
    data: packageData
  });
}));

// Get treatment packages by clinic ID
treatmentPackageRouter.get('/clinic/:clinicId', catchAsync(async (req: Request, res: Response) => {
  const { clinicId } = req.params;
  const packages = treatmentPackages.filter(pkg => pkg.clinicId === clinicId);
  
  res.json({
    success: true,
    data: packages
  });
}));

export default treatmentPackageRouter;