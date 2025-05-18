/**
 * API Routes for MyDentalFly
 */
import { Express, Request, Response } from 'express';

// Sample treatment packages data
const treatmentPackages = [
  {
    id: "pkg-001",
    title: "Dental Implant Package",
    description: "Complete dental implant procedure including consultation, surgery, and crown",
    image: "/images/packages/implant-package.jpg",
    price: 850,
    originalPrice: 1200,
    currency: "EUR",
    discount: "29%",
    clinicId: 1,
    treatments: [
      { id: 1, name: "Dental Implant", price: 750 },
      { id: 2, name: "Crown", price: 450 }
    ]
  },
  {
    id: "pkg-002",
    title: "Smile Makeover Package",
    description: "Complete smile transformation with veneers and teeth whitening",
    image: "/images/packages/smile-makeover.jpg",
    price: 1200,
    originalPrice: 1800,
    currency: "EUR",
    discount: "33%",
    clinicId: 2,
    treatments: [
      { id: 3, name: "Porcelain Veneers (6 units)", price: 1200 },
      { id: 4, name: "Teeth Whitening", price: 600 }
    ]
  },
  {
    id: "pkg-003",
    title: "All-on-4 Dental Implants",
    description: "Full arch restoration with just 4 implants",
    image: "/images/packages/all-on-4.jpg",
    price: 3500,
    originalPrice: 5000,
    currency: "EUR",
    discount: "30%",
    clinicId: 3,
    treatments: [
      { id: 5, name: "All-on-4 Implants", price: 3500 }
    ]
  }
];

export function registerApiRoutes(app: Express) {
  // Get treatment packages
  app.get('/api/treatment-packages', (req: Request, res: Response) => {
    console.log('Serving treatment packages from direct handler');
    res.json(treatmentPackages);
  });
  
  // Get treatment package by ID
  app.get('/api/treatment-packages/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const treatmentPackage = treatmentPackages.find(p => p.id === id);
    
    if (!treatmentPackage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Treatment package not found' 
      });
    }
    
    res.json(treatmentPackage);
  });
  
  // Apply promo code to treatment package
  app.post('/api/apply-promo', (req: Request, res: Response) => {
    const { promoCode, packageId } = req.body;
    
    // Simple promo code logic - could be replaced with database lookup
    const validPromoCodes = {
      'WELCOME10': { type: 'percentage', value: 10 },
      'SAVE50': { type: 'fixed', value: 50 },
      'IMPLANTCROWN30': { type: 'percentage', value: 30 },
      'LUXHOTEL20': { type: 'percentage', value: 20 },
      'LUXTRAVEL': { type: 'percentage', value: 40 }
    };
    
    if (!promoCode) {
      return res.status(400).json({
        success: false,
        message: 'No promo code provided'
      });
    }
    
    if (!validPromoCodes[promoCode]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid promo code'
      });
    }
    
    // Find the package if packageId is provided
    let targetPackage = null;
    if (packageId) {
      targetPackage = treatmentPackages.find(p => p.id === packageId);
      
      if (!targetPackage) {
        return res.status(404).json({
          success: false,
          message: 'Treatment package not found'
        });
      }
    }
    
    const promo = validPromoCodes[promoCode];
    let discount = 0;
    
    if (targetPackage) {
      // Calculate discount for specific package
      if (promo.type === 'percentage') {
        discount = (promo.value / 100) * targetPackage.price;
      } else {
        discount = Math.min(promo.value, targetPackage.price);
      }
      
      const discountedPrice = targetPackage.price - discount;
      
      res.json({
        success: true,
        data: {
          originalPrice: targetPackage.price,
          discountedPrice,
          discount,
          discountType: promo.type,
          discountValue: promo.value,
          promoCode,
          message: `Promo code ${promoCode} applied! You saved ${discount}€`
        }
      });
    } else {
      // Just return promo code info if no package specified
      res.json({
        success: true,
        data: {
          promoCode,
          discountType: promo.type,
          discountValue: promo.value,
          message: `Valid promo code: ${promoCode}`
        }
      });
    }
  });
}