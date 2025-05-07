// UK dental treatment price reference data
// This data is used to calculate savings compared to UK prices
// Formula: Istanbul prices = 35% of UK prices

export interface CountryPriceData {
  country: string;
  currencyCode: string;
  currencySymbol: string;
  conversionRate: number; // Conversion rate from GBP
  treatmentPrices: Record<string, number>; // Treatment name to price mapping
}

// UK dental treatment prices (in GBP)
export const ukPriceData: CountryPriceData = {
  country: "UK",
  currencyCode: "GBP",
  currencySymbol: "£",
  conversionRate: 1, // Base currency
  treatmentPrices: {
    // Basic treatments
    "Consultation": 80,
    "Dental Examination": 60,
    "X-ray (per film)": 15,
    "Panoramic X-ray": 85,
    "CT Scan / CBCT": 250,
    "Teeth Cleaning": 95,
    "Teeth Whitening (Professional)": 350,
    "Teeth Whitening (Home Kit)": 250,
    
    // Fillings and repairs
    "Composite Filling (1 surface)": 130,
    "Composite Filling (2+ surfaces)": 180,
    "Amalgam Filling": 120,
    "Temporary Filling": 70,
    "Inlay/Onlay": 650,
    
    // Root canal treatments
    "Root Canal (Anterior)": 450,
    "Root Canal (Premolar)": 550,
    "Root Canal (Molar)": 700,
    "Apicoectomy": 450,
    
    // Extractions
    "Simple Extraction": 150,
    "Surgical Extraction": 250,
    "Wisdom Tooth Extraction": 350,
    
    // Crown and bridge work
    "Porcelain Crown": 750,
    "Zirconia Crown": 850,
    "E-max Crown": 850,
    "Porcelain Fused to Metal Crown (PFM)": 650,
    "Temporary Crown": 200,
    "Post and Core": 300,
    "Dental Bridge (per unit)": 750,
    
    // Implants and associated work
    "Dental Implant (Standard)": 2000,
    "Dental Implant (Premium)": 2500,
    "Dental Implant (Straumann)": 2750,
    "Implant Abutment": 500,
    "Implant Crown": 850,
    "Bone Graft (minor)": 450,
    "Bone Graft (major)": 1200,
    "Sinus Lift": 1500,
    
    // Dentures
    "Complete Denture (Upper or Lower)": 1200,
    "Partial Denture": 850,
    "Flexible Denture": 950,
    "Denture Reline": 250,
    "Denture Repair": 150,
    
    // Cosmetic dentistry
    "Dental Veneer (Composite)": 350,
    "Dental Veneer (Porcelain)": 850,
    "Dental Veneer (E-max)": 950,
    "Smile Design (per tooth)": 850,
    
    // Periodontal treatments
    "Periodontal Treatment (per quadrant)": 250,
    "Gum Contouring (per tooth)": 200,
    "Gum Graft": 750,
    
    // Orthodontics
    "Braces (Traditional)": 4500,
    "Braces (Ceramic)": 5500,
    "Braces (Lingual)": 7500,
    "Clear Aligners (Full Treatment)": 5000,
    "Clear Aligners (Express)": 3000,
    "Retainer": 250,
  }
};

// Calculate Istanbul price based on UK price
// Different tiers of clinics have different pricing percentages
export function calculateIstanbulPrice(ukPrice: number, tier: 'affordable' | 'mid' | 'premium' = 'mid'): number {
  // Pricing factors based on clinic tier
  const pricingFactors = {
    'affordable': 0.30, // Affordable clinics at 30% of UK prices
    'mid': 0.35,        // Mid-tier clinics at 35% of UK prices
    'premium': 0.40     // Premium clinics at 40% of UK prices
  };
  
  return Math.round(ukPrice * pricingFactors[tier]);
}

// Calculate savings amount and percentage
export function calculateSavings(ukPrice: number, istanbulPrice: number): { savingsAmount: number, savingsPercentage: number } {
  const savingsAmount = ukPrice - istanbulPrice;
  const savingsPercentage = Math.round((savingsAmount / ukPrice) * 100);
  return { savingsAmount, savingsPercentage };
}

// Helper function to get UK price for a specific treatment
export function getUKPriceForTreatment(treatmentName: string): number | undefined {
  return ukPriceData.treatmentPrices[treatmentName];
}

// Process a treatment plan to add UK price comparisons
export function addUKPriceComparisons(treatmentPlan: any): any {
  const updatedPlan = { ...treatmentPlan };
  
  // Total values for comparison
  let totalUKPrice = 0;
  
  // Process each treatment item to add UK price and savings data
  updatedPlan.items = treatmentPlan.items.map((item: any) => {
    // Find the exact match in UK prices if possible
    let ukPrice = getUKPriceForTreatment(item.treatment);
    
    // If no exact match, use the existing price and calculate backwards (since Istanbul = 35% of UK)
    if (!ukPrice) {
      ukPrice = Math.round(item.priceGBP / 0.35);
    }
    
    const homeCountrySubtotalGBP = ukPrice * item.quantity;
    const { savingsAmount, savingsPercentage } = calculateSavings(homeCountrySubtotalGBP, item.subtotalGBP);
    
    totalUKPrice += homeCountrySubtotalGBP;
    
    return {
      ...item,
      homeCountryPriceGBP: ukPrice,
      homeCountrySubtotalGBP,
      savingsGBP: savingsAmount,
      savingsPercentage
    };
  });
  
  // Add total savings data to the plan
  const { savingsAmount, savingsPercentage } = calculateSavings(totalUKPrice, updatedPlan.totalGBP);
  
  updatedPlan.homeCountry = 'UK';
  updatedPlan.totalHomeCountryGBP = totalUKPrice;
  updatedPlan.totalSavingsGBP = savingsAmount;
  updatedPlan.totalSavingsPercentage = savingsPercentage;
  
  return updatedPlan;
}