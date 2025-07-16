/**
 * Treatment Package API Routes
 * Handles operations related to treatment packages
 */
import { enhancePackageFromDatabase } from "../scripts/enhance-package-response";

// Database imports
import { db } from '../db';
import { treatmentPackages, packageTreatments, packageInclusions } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { catchAsync } from '../middleware/error-handler';

export const treatmentPackageRouter = Router();

export const hardcodedTreatmentPackages = [
  {
    id: 'hollywood-smile-vacation',
    title: 'Hollywood Smile Luxury Family Vacation',
    description: 'The ultimate luxury dental vacation for discerning families. Combine premium Hollywood Smile treatments with an exclusive 7-day Istanbul experience featuring 5-star accommodations, VIP services, and curated cultural excursions.',
    clinicId: 'maltepe-dental-clinic',
    price: 4250,
    currency: 'GBP',
    originalPrice: 11000,
    savings: 6750,
    treatments: [
      { id: 'porcelain_veneer', name: 'Premium Porcelain Veneer', quantity: 10 },
      { id: 'teeth_whitening', name: 'Teeth Whitening', quantity: 1 },
      { id: 'dental_checkup_cleaning', name: 'Smile Design Consultation', quantity: 1 }
    ],
    clinic: {
      id: 'maltepe-dental-clinic',
      name: 'Maltepe Dental Clinic',
      location: 'Maltepe, Istanbul',
      image: '/images/carousel/clinic.png'
    },
    hotel: {
      name: 'Hilton Istanbul Bomonti',
      stars: 5,
      area: 'Şişli',
      image: '/images/hotels/luxury-hotel.jpg'
    },
    accommodation: {
      nights: 6,
      days: 7,
      stars: 5,
      description: '5-star luxury hotel accommodation'
    },
    duration: '7 days, 6 nights',
    includedServices: {
      hotel: true,
      transfers: true,
      consultation: true,
      cityTour: true,
      excursions: true
    },
    excursions: [
      {
        id: 'bosphorus-cruise',
        name: 'Bosphorus Cruise',
        description: 'Experience Istanbul from the water with scenic views',
        included: true,
        duration: '2-3 hours'
      },
      {
        id: 'old-city-tour',
        name: 'Old City Walking Tour',
        description: 'Explore historic Istanbul with expert guide',
        included: true,
        duration: '6-7 hours'
      },
      {
        id: 'turkish-bath',
        name: 'Traditional Turkish Bath',
        description: 'Relax with traditional hammam experience',
        included: true,
        duration: '1-2 hours'
      },
      {
        id: 'culinary-tour',
        name: 'Turkish Culinary Tour',
        description: 'Sample authentic Turkish cuisine',
        included: true,
        duration: '4-5 hours'
      }
    ],
    tier: 'gold',
    imageUrl: '/images/packages/hollywood-smile-vacation.png',
    promoCode: 'HOLLYWOOD_SMILE',
    discountType: 'fixed_amount',
    discountValue: 6750,
    isActive: true
  },
  {
    id: 'dental-implant-city-experience',
    title: 'Dental Implant & City Experience',
    description: 'Restore your smile with quality dental implants and enjoy exploring Istanbul with included hotel stay and select city experiences.',
    clinicId: 'dentgroup-istanbul',
    price: 2850,
    currency: 'GBP',
    originalPrice: 4350,
    savings: 1500,
    treatments: [
      { id: 'single_dental_implant', name: 'Single Dental Implant', quantity: 2 },
      { id: 'zirconia_crown', name: 'Zirconia Crown', quantity: 2 },
      { id: 'dental_checkup_cleaning', name: 'Dental Consultation', quantity: 1 }
    ],
    clinic: {
      id: 'dentgroup-istanbul',
      name: 'DentGroup Istanbul',
      location: 'Şişli, Istanbul',
      image: '/images/carousel/clinic.png'
    },
    hotel: {
      name: 'Radisson Blu Istanbul',
      stars: 4,
      area: 'Şişli',
      image: '/images/hotels/standard-hotel.jpg'
    },
    accommodation: {
      nights: 4,
      days: 5,
      stars: 4,
      description: '4-star hotel accommodation'
    },
    duration: '5 days, 4 nights',
    includedServices: {
      hotel: true,
      transfers: true,
      consultation: true,
      cityTour: true,
      excursions: true
    },
    excursions: [
      {
        id: 'bosphorus-cruise',
        name: 'Bosphorus Cruise',
        description: 'Experience Istanbul from the water with scenic views',
        included: true,
        duration: '2-3 hours'
      },
      {
        id: 'culinary-tour',
        name: 'Turkish Culinary Tour',
        description: 'Sample authentic Turkish cuisine',
        included: true,
        duration: '4-5 hours'
      }
    ],
    tier: 'silver',
    imageUrl: '/images/packages/dental-implant-city-experience.png',
    promoCode: 'DENTAL_IMPLANT_CITY',
    discountType: 'fixed_amount',
    discountValue: 1500,
    isActive: true
  },
  {
    id: 'value-veneer-istanbul-discovery',
    title: 'Value Veneer & Istanbul Discovery',
    description: 'Get affordable veneers to enhance your smile while exploring the highlights of Istanbul with basic accommodations and essential services.',
    clinicId: 'istanbul-dental-care',
    price: 1650,
    currency: 'GBP',
    originalPrice: 2600,
    savings: 950,
    treatments: [
      { id: 'porcelain_veneer', name: 'Porcelain Veneer', quantity: 6 },
      { id: 'teeth_whitening', name: 'Teeth Whitening', quantity: 1 }
    ],
    clinic: {
      id: 'istanbul-dental-care',
      name: 'Istanbul Dental Care',
      location: 'Kadıköy, Istanbul',
      image: '/images/carousel/clinic.png'
    },
    hotel: {
      name: 'Ibis Istanbul City',
      stars: 3,
      area: 'Kadıköy',
      image: '/images/hotels/value-hotel.jpg'
    },
    accommodation: {
      nights: 3,
      days: 4,
      stars: 3,
      description: '3-star hotel accommodation'
    },
    duration: '4 days, 3 nights',
    includedServices: {
      hotel: true,
      transfers: true,
      consultation: true,
      cityTour: false,
      excursions: false
    },
    excursions: [
      {
        id: 'turkish-bath',
        name: 'Traditional Turkish Bath',
        description: 'Relax with traditional hammam experience',
        included: true,
        duration: '1-2 hours'
      }
    ],
    tier: 'bronze',
    imageUrl: '/images/packages/value-veneer-istanbul-discovery.png',
    promoCode: 'VALUE_VENEER_ISTANBUL',
    discountType: 'fixed_amount',
    discountValue: 950,
    isActive: true
  },
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
    data: (await db.select().from(treatmentPackages)).map(enhancePackageFromDatabase)
  });
}));

// Get treatment package by ID
treatmentPackageRouter.get('/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const dbPackage = await db.select().from(treatmentPackages).where(eq(treatmentPackages.id, id));
  const packageData = dbPackage[0] ? enhancePackageFromDatabase(dbPackage[0]) : null;
  
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
  const packages = hardcodedTreatmentPackages.filter(pkg => pkg.clinicId === clinicId);
  
  res.json({
    success: true,
    data: packages
  });
}));

export default treatmentPackageRouter;