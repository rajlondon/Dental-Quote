/**
 * Treatment Package API Routes
 * Handles operations related to treatment packages
 */
import express from 'express';

const router = express.Router();

// Sample treatment packages data with promo codes
export const treatmentPackages = [
  {
    id: "tp-001",
    title: "Complete Smile Makeover",
    description: "A comprehensive package including veneers, whitening, and any necessary implants for a complete smile transformation.",
    imageUrl: "/images/treatments/illustrations/smile-makeover.png",
    clinicId: "1", // DentGroup
    treatments: ["Veneers", "Whitening", "Implants"],
    basePrice: 2500,
    currency: "GBP",
    discountType: "percentage",
    discountValue: 15,
    promoCode: "NEWSMILE15",
    isActive: true,
    featured: true
  },
  {
    id: "tp-002",
    title: "All-on-4 Implant Solution",
    description: "Complete restoration of a full arch with just 4 implants, including temporary and permanent prosthesis.",
    imageUrl: "/images/treatments/illustrations/all-on-4.png",
    clinicId: "2", // Dent Istanbul
    treatments: ["All-on-4 Implants", "Full Arch Restoration"],
    basePrice: 5800,
    currency: "GBP",
    discountType: "percentage",
    discountValue: 10,
    promoCode: "ALLON4SAVE",
    isActive: true,
    featured: true
  },
  {
    id: "tp-003",
    title: "Hollywood Smile Package",
    description: "Transform your smile with premium porcelain veneers, teeth whitening and professional dental cleaning.",
    imageUrl: "/images/treatments/illustrations/hollywood-smile.png",
    clinicId: "3", // Istanbul Aesthetic Center
    treatments: ["Porcelain Veneers", "Teeth Whitening", "Dental Cleaning"],
    basePrice: 1950,
    currency: "GBP",
    discountType: "fixed_amount",
    discountValue: 200,
    promoCode: "HOLLYWOOD200",
    isActive: true,
    featured: true
  },
  {
    id: "tp-004",
    title: "Dental Implant & Crown",
    description: "Single dental implant with premium crown, includes all consultations and aftercare.",
    imageUrl: "/images/treatments/illustrations/dental-implants1.png",
    clinicId: "4", // DentalPark Turkey
    treatments: ["Dental Implant", "Dental Crown"],
    basePrice: 850,
    currency: "GBP",
    discountType: "percentage",
    discountValue: 20,
    promoCode: "IMPLANT20OFF",
    isActive: true,
    featured: false
  },
  {
    id: "tp-005",
    title: "Invisalign Orthodontic Package",
    description: "Complete Invisalign treatment including consultation, aligners, and retainers.",
    imageUrl: "/images/treatments/illustrations/invisalign.png",
    clinicId: "5", // Esta Istanbul
    treatments: ["Invisalign", "Orthodontic Consultation", "Retainers"],
    basePrice: 2200,
    currency: "GBP",
    discountType: "fixed_amount",
    discountValue: 300,
    promoCode: "INVISALIGN300",
    isActive: true,
    featured: true
  }
];

// Get all treatment packages
router.get('/', (req, res) => {
  res.json(treatmentPackages);
});

// Get active treatment packages for homepage
router.get('/homepage', (req, res) => {
  const homepagePackages = treatmentPackages
    .filter(pkg => pkg.isActive && pkg.featured)
    .slice(0, 4); // Limit to 4 packages for homepage
  
  res.json(homepagePackages);
});

// Get a specific treatment package by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const treatmentPackage = treatmentPackages.find(pkg => pkg.id === id);
  
  if (!treatmentPackage) {
    return res.status(404).json({
      success: false,
      message: 'Treatment package not found'
    });
  }
  
  res.json(treatmentPackage);
});

// Get treatment packages for a specific clinic
router.get('/clinic/:clinicId', (req, res) => {
  const { clinicId } = req.params;
  const clinicPackages = treatmentPackages.filter(pkg => pkg.clinicId === clinicId && pkg.isActive);
  
  res.json(clinicPackages);
});

export default router;