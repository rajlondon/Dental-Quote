/**
 * Treatment Categories API routes
 * Provides treatments grouped by category for the patient portal
 */
import express from 'express';
import { storage } from '../storage';
import { AppError, catchAsync } from '../middleware/error-handler';

const router = express.Router();

// Mock treatments with categories for testing
const MOCK_TREATMENTS = [
  {
    id: 1,
    name: "Dental Implant",
    price: 700,
    category: "Implants",
    description: "Titanium implant with abutment"
  },
  {
    id: 2,
    name: "Porcelain Veneer",
    price: 350,
    category: "Cosmetic",
    description: "Premium porcelain veneer for front teeth"
  },
  {
    id: 3,
    name: "Teeth Whitening",
    price: 250,
    category: "Cosmetic",
    description: "In-office laser whitening treatment"
  },
  {
    id: 4,
    name: "Dental Cleaning",
    price: 80,
    category: "Preventive",
    description: "Professional dental cleaning and polishing"
  },
  {
    id: 5,
    name: "Root Canal",
    price: 350,
    category: "Endodontics",
    description: "Complete root canal treatment"
  },
  {
    id: 6,
    name: "Tooth Extraction",
    price: 150,
    category: "Oral Surgery",
    description: "Simple tooth removal procedure"
  },
  {
    id: 7,
    name: "Zirconia Crown",
    price: 450,
    category: "Restorative",
    description: "High-quality zirconia crown"
  },
  {
    id: 8,
    name: "Composite Filling",
    price: 120,
    category: "Restorative",
    description: "Tooth-colored composite restoration"
  }
];

/**
 * Get all treatment categories
 * Groups treatments by their category 
 */
router.get('/api/treatments/categories', catchAsync(async (req, res) => {
  try {
    // Since getTreatments is not implemented in the storage layer yet,
    // we'll use the mock data for now
    let treatments = MOCK_TREATMENTS;
    
    // Log this operation
    console.log(`[DEBUG] Returning ${treatments.length} mock treatments for categories endpoint`)
    
    // Group treatments by category
    const categoriesMap = new Map();
    
    for (const treatment of treatments) {
      const categoryName = treatment.category || 'Other Treatments';
      
      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, {
          id: categoryName.toLowerCase().replace(/\s+/g, '-'),
          name: categoryName,
          treatments: []
        });
      }
      
      categoriesMap.get(categoryName).treatments.push(treatment);
    }
    
    // Convert map to array
    const categories = Array.from(categoriesMap.values());
    
    // Return categories
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching treatment categories:', error);
    throw new AppError('Failed to fetch treatment categories', 500);
  }
}));

export default router;