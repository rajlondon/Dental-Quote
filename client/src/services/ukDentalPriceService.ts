/**
 * UK Dental Price Service
 * 
 * This service provides UK private dental treatment pricing based on research data
 * from real UK dental clinics in London and Manchester.
 */

// UK price data by treatment type in GBP
// Data is provided as price ranges (low-high) for London and Manchester
// based on research from UK private dental clinics
interface UKPriceData {
  london: {
    min: number;
    max: number;
    average: number;
  };
  manchester: {
    min: number;
    max: number;
    average: number;
  };
  // National average considering both London and Manchester prices
  average: number;
}

// Price data organized by treatment type from UK dental research
const ukPricesByTreatment: Record<string, UKPriceData> = {
  // Implants - single tooth implant with crown
  "Dental Implant": {
    london: {
      min: 2000,
      max: 3500,
      average: 2750
    },
    manchester: {
      min: 1800,
      max: 2800,
      average: 2300
    },
    average: 2525
  },
  
  // Crowns - per tooth
  "Dental Crown": {
    london: {
      min: 800,
      max: 1200,
      average: 950
    },
    manchester: {
      min: 650,
      max: 950,
      average: 800
    },
    average: 875
  },

  // Veneers - per tooth
  "Porcelain Veneer": {
    london: {
      min: 700,
      max: 1000,
      average: 850
    },
    manchester: {
      min: 600,
      max: 900,
      average: 750
    },
    average: 800
  },

  // Root canal treatment
  "Root Canal Treatment": {
    london: {
      min: 600,
      max: 1200,
      average: 900
    },
    manchester: {
      min: 450,
      max: 950,
      average: 700
    },
    average: 800
  },

  // White fillings
  "White Filling": {
    london: {
      min: 120,
      max: 300,
      average: 210
    },
    manchester: {
      min: 100,
      max: 250,
      average: 175
    },
    average: 193
  },

  // Teeth whitening
  "Teeth Whitening": {
    london: {
      min: 350,
      max: 700,
      average: 525
    },
    manchester: {
      min: 300,
      max: 550,
      average: 425
    },
    average: 475
  },

  // Bridges - per unit
  "Dental Bridge (per unit)": {
    london: {
      min: 750,
      max: 1100,
      average: 925
    },
    manchester: {
      min: 650,
      max: 950,
      average: 800
    },
    average: 863
  },

  // Extractions - simple
  "Tooth Extraction": {
    london: {
      min: 150,
      max: 300,
      average: 225
    },
    manchester: {
      min: 120,
      max: 250,
      average: 185
    },
    average: 205
  },
  
  // Extractions - surgical/wisdom tooth
  "Surgical Extraction": {
    london: {
      min: 250,
      max: 450,
      average: 350
    },
    manchester: {
      min: 200,
      max: 400,
      average: 300
    },
    average: 325
  },

  // Dentures - full set
  "Full Dentures": {
    london: {
      min: 1200,
      max: 2500,
      average: 1850
    },
    manchester: {
      min: 1000,
      max: 2000,
      average: 1500
    },
    average: 1675
  },

  // Dentures - partial
  "Partial Dentures": {
    london: {
      min: 600,
      max: 1200,
      average: 900
    },
    manchester: {
      min: 450,
      max: 1000,
      average: 725
    },
    average: 813
  },

  // Hygienist visit/Scale and polish
  "Hygienist Visit": {
    london: {
      min: 90,
      max: 150,
      average: 120
    },
    manchester: {
      min: 70,
      max: 120,
      average: 95
    },
    average: 108
  },

  // All-on-4/6 Implant Solutions
  "All-on-4 Implants (Full Arch)": {
    london: {
      min: 15000,
      max: 25000,
      average: 20000
    },
    manchester: {
      min: 12000,
      max: 20000,
      average: 16000
    },
    average: 18000
  },

  "All-on-6 Implants (Full Arch)": {
    london: {
      min: 18000,
      max: 30000,
      average: 24000
    },
    manchester: {
      min: 15000,
      max: 25000,
      average: 20000
    },
    average: 22000
  },

  // Gum Treatments
  "Gum Disease Treatment": {
    london: {
      min: 200,
      max: 500,
      average: 350
    },
    manchester: {
      min: 150,
      max: 400,
      average: 275
    },
    average: 313
  },

  "Deep Cleaning (Scaling & Root Planing)": {
    london: {
      min: 150,
      max: 400,
      average: 275
    },
    manchester: {
      min: 120,
      max: 300,
      average: 210
    },
    average: 243
  },

  // Oral Surgery
  "Bone Grafting": {
    london: {
      min: 800,
      max: 1500,
      average: 1150
    },
    manchester: {
      min: 600,
      max: 1200,
      average: 900
    },
    average: 1025
  },

  "Sinus Lift": {
    london: {
      min: 1200,
      max: 2500,
      average: 1850
    },
    manchester: {
      min: 1000,
      max: 2000,
      average: 1500
    },
    average: 1675
  },

  // Advanced Cosmetic
  "Smile Makeover (Complete)": {
    london: {
      min: 8000,
      max: 15000,
      average: 11500
    },
    manchester: {
      min: 6000,
      max: 12000,
      average: 9000
    },
    average: 10250
  },

  "Composite Bonding": {
    london: {
      min: 200,
      max: 400,
      average: 300
    },
    manchester: {
      min: 150,
      max: 350,
      average: 250
    },
    average: 275
  }
};

/**
 * Get the UK price for a specific dental treatment
 * 
 * @param treatmentName The name of the dental treatment
 * @returns The UK price data object or undefined if not found
 */
export function getUKPriceForTreatment(treatmentName: string): UKPriceData | undefined {
  return ukPricesByTreatment[treatmentName];
}

/**
 * Get the average UK price for a treatment
 * 
 * @param treatmentName The name of the dental treatment
 * @returns The average UK price or 0 if not found
 */
export function getAverageUKPrice(treatmentName: string): number {
  const priceData = getUKPriceForTreatment(treatmentName);
  return priceData ? priceData.average : 0;
}

/**
 * Calculate the total UK price for multiple treatments
 * 
 * @param treatments Array of treatment names
 * @param quantities Array of quantities corresponding to treatments
 * @returns The total average UK price for all treatments
 */
export function calculateTotalUKPrice(
  treatments: string[], 
  quantities: number[]
): number {
  let total = 0;
  
  for (let i = 0; i < treatments.length; i++) {
    const treatmentName = treatments[i];
    const quantity = quantities[i] || 1;
    const priceData = getUKPriceForTreatment(treatmentName);
    
    if (priceData) {
      total += priceData.average * quantity;
    }
  }
  
  return total;
}

/**
 * Translate a treatment name from our system to match UK price database
 * 
 * @param istanbulTreatmentName The treatment name from the Istanbul pricing system
 * @returns The corresponding UK treatment name or the original if no match
 */
export function mapTreatmentNameToUKSystem(istanbulTreatmentName: string): string {
  // Map of Istanbul treatment names to UK treatment names
  const treatmentNameMap: Record<string, string> = {
    // Direct mappings
    "Dental Implant": "Dental Implant",
    "Dental Crown": "Dental Crown",
    "Porcelain Veneer": "Porcelain Veneer",
    "Root Canal Treatment": "Root Canal Treatment",
    "White Filling": "White Filling",
    "Teeth Whitening": "Teeth Whitening",
    "Tooth Extraction": "Tooth Extraction",
    
    // Alternate names that might be used in the Istanbul system
    "Implant": "Dental Implant",
    "Crown": "Dental Crown",
    "Veneer": "Porcelain Veneer",
    "Root Canal": "Root Canal Treatment",
    "Composite Filling": "White Filling",
    "Tooth Colored Filling": "White Filling",
    "Extraction": "Tooth Extraction",
    "Wisdom Tooth Extraction": "Surgical Extraction",
    "Bridge": "Dental Bridge (per unit)",
    "Dental Bridge": "Dental Bridge (per unit)",
    "Complete Denture": "Full Dentures",
    "Full Denture": "Full Dentures",
    "Partial Denture": "Partial Dentures",
    "Scale and Polish": "Hygienist Visit"
  };
  
  return treatmentNameMap[istanbulTreatmentName] || istanbulTreatmentName;
}

/**
 * Get UK Price for a treatment as it appears in the Istanbul system
 * 
 * @param istanbulTreatmentName The treatment name from the Istanbul pricing system
 * @returns The average UK price for the equivalent treatment
 */
export function getUKPriceForIstanbulTreatment(istanbulTreatmentName: string): number {
  const ukTreatmentName = mapTreatmentNameToUKSystem(istanbulTreatmentName);
  return getAverageUKPrice(ukTreatmentName);
}

export default {
  getUKPriceForTreatment,
  getAverageUKPrice,
  calculateTotalUKPrice,
  mapTreatmentNameToUKSystem,
  getUKPriceForIstanbulTreatment
};