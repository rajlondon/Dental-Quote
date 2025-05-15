import { Router } from 'express';
import { SpecialOffer, TreatmentPackage } from '../../shared/offer-types';

const router = Router();

// Mock data for testing
const mockSpecialOffers: SpecialOffer[] = [
  {
    id: 'offer-001',
    title: 'Summer Dental Special',
    description: '20% off on dental implants',
    clinicId: 'dentgroup-istanbul',
    discountType: 'percentage',
    discountValue: 20,
    applicableTreatments: ['tr-001', 'tr-002'],
    startDate: '2025-05-01',
    endDate: '2025-08-31',
    featuredImage: '/images/offers/summer-special.jpg',
    terms: 'Valid for treatments booked before August 31, 2025'
  },
  {
    id: 'offer-002',
    title: 'Whitening Special',
    description: 'Free teeth whitening with any veneer package',
    clinicId: 'maltepe-dental-clinic',
    discountType: 'fixed',
    discountValue: 150,
    applicableTreatments: ['tr-003', 'tr-004'],
    startDate: '2025-05-01',
    endDate: '2025-07-31',
    featuredImage: '/images/offers/whitening-special.jpg'
  }
];

const mockTreatmentPackages: TreatmentPackage[] = [
  {
    id: 'pkg-001',
    title: 'Full Smile Makeover',
    description: 'Complete package including implants and veneers',
    clinicId: 'dentgroup-istanbul',
    includedTreatments: [
      { treatmentId: 'tr-001', quantity: 2, standardPrice: 600 },
      { treatmentId: 'tr-003', quantity: 4, standardPrice: 1200 }
    ],
    packagePrice: 1500,
    savings: 300,
    additionalPerks: ['Free consultation', 'Free airport transfer'],
    startDate: '2025-05-01',
    endDate: '2025-12-31',
    featuredImage: '/images/packages/smile-makeover.jpg'
  },
  {
    id: 'pkg-002',
    title: 'Hollywood Smile',
    description: '8 veneers with free whitening',
    clinicId: 'istanbul-dental-care',
    includedTreatments: [
      { treatmentId: 'tr-003', quantity: 8, standardPrice: 2400 },
      { treatmentId: 'tr-006', quantity: 1, standardPrice: 200 }
    ],
    packagePrice: 2000,
    savings: 600,
    additionalPerks: ['Free whitening treatment', '1 night hotel accommodation'],
    startDate: '2025-04-01',
    endDate: '2025-10-31',
    featuredImage: '/images/packages/hollywood-smile.jpg'
  }
];

// Mock treatments data for testing
const treatmentsData: Record<string, { name: string, price: number }> = {
  'tr-001': { name: 'Dental Implant', price: 500 },
  'tr-002': { name: 'Crown', price: 300 },
  'tr-003': { name: 'Veneer', price: 300 },
  'tr-004': { name: 'Root Canal', price: 250 },
  'tr-005': { name: 'Extraction', price: 150 },
  'tr-006': { name: 'Teeth Whitening', price: 200 }
};

// Get available special offers based on selected treatments
router.post('/available-offers', (req, res) => {
  const { treatmentIds } = req.body;
  if (!treatmentIds || !Array.isArray(treatmentIds)) {
    return res.status(400).json({ message: 'Invalid treatment IDs' });
  }

  // Filter offers that are applicable to the selected treatments
  const applicableOffers = mockSpecialOffers.filter(offer => {
    return offer.applicableTreatments.some(treatmentId => 
      treatmentIds.includes(treatmentId)
    );
  });

  res.json({ offers: applicableOffers });
});

// Get available treatment packages based on selected treatments
router.post('/available-packages', (req, res) => {
  const { treatmentIds } = req.body;
  if (!treatmentIds || !Array.isArray(treatmentIds)) {
    return res.status(400).json({ message: 'Invalid treatment IDs' });
  }

  // Filter packages that include at least one of the selected treatments
  const applicablePackages = mockTreatmentPackages.filter(pkg => {
    return pkg.includedTreatments.some(item => 
      treatmentIds.includes(item.treatmentId)
    );
  });

  res.json({ packages: applicablePackages });
});

// Apply a special offer to a quote
router.post('/apply-offer/:offerId', (req, res) => {
  const { offerId } = req.params;
  const { treatments, subtotal } = req.body;

  // Find the requested offer
  const offer = mockSpecialOffers.find(o => o.id === offerId);
  if (!offer) {
    return res.status(404).json({ message: 'Special offer not found' });
  }

  // Calculate discount
  let discountAmount = 0;
  if (offer.discountType === 'percentage') {
    discountAmount = subtotal * (offer.discountValue / 100);
  } else {
    discountAmount = offer.discountValue;
  }

  // Apply any caps or limitations here if needed
  
  res.json({
    offerId,
    discountAmount,
    appliedTo: treatments.map((t: { id: string }) => t.id)
  });
});

// Apply a treatment package to a quote
router.post('/apply-package/:packageId', (req, res) => {
  const { packageId } = req.params;
  const { currentTreatments } = req.body;

  // Find the requested package
  const packageData = mockTreatmentPackages.find(p => p.id === packageId);
  if (!packageData) {
    return res.status(404).json({ message: 'Treatment package not found' });
  }

  // Transform package into treatments for the quote
  const packagedTreatments = packageData.includedTreatments.map(item => {
    const treatment = treatmentsData[item.treatmentId];
    return {
      id: item.treatmentId,
      name: treatment.name,
      price: item.standardPrice / item.quantity, // Calculate per-unit price
      quantity: item.quantity,
      type: 'treatment'
    };
  });

  // Include any treatments that weren't part of the package
  const nonPackageTreatmentIds = packageData.includedTreatments.map(t => t.treatmentId);
  const remainingTreatments = currentTreatments.filter(
    t => !nonPackageTreatmentIds.includes(t.id)
  );

  res.json({
    packageId,
    packagePrice: packageData.packagePrice,
    packagedTreatments: [...packagedTreatments, ...remainingTreatments],
    savings: packageData.savings,
    additionalPerks: packageData.additionalPerks
  });
});

// Remove a special offer from a quote
router.post('/remove-offer', (req, res) => {
  const { quoteId } = req.body;
  
  // In a real implementation, we would update the database
  // For this mock, we just return success
  
  res.json({
    success: true,
    message: 'Special offer removed successfully'
  });
});

// Remove a treatment package from a quote
router.post('/remove-package', (req, res) => {
  const { quoteId } = req.body;
  
  // In a real implementation, we would restore the original treatments
  // For this mock, we return some dummy original treatments
  
  const originalTreatments = [
    { id: 'tr-001', name: 'Dental Implant', price: 500, quantity: 2, type: 'treatment' },
    { id: 'tr-003', name: 'Veneer', price: 300, quantity: 4, type: 'treatment' },
  ];
  
  const originalSubtotal = originalTreatments.reduce(
    (total, t) => total + (t.price * t.quantity), 
    0
  );
  
  res.json({
    success: true,
    originalTreatments,
    originalSubtotal,
    message: 'Treatment package removed successfully'
  });
});

export default router;