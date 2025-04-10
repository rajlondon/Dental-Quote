import { dentalPricesCSV } from './dentalPricesData';
import { getFlightEstimateForCity } from './flightEstimatesService';

export interface TreatmentPrice {
  category: string;
  treatment: string;
  priceGBP: number;
  priceUSD: number;
  guarantee: string;
  description?: string;
  image?: string;
  benefits?: string[];
  duration?: string;
  recovery?: string;
}

let treatmentPrices: TreatmentPrice[] = [];
let initialized = false;

// Manual CSV parsing function for browser compatibility
function parseCSV(csvText: string): TreatmentPrice[] {
  console.log("CSV parsing started");
  
  const lines = csvText.split('\n');
  console.log(`Found ${lines.length} lines in CSV`);
  
  const headers = lines[0].split(',');
  console.log("Headers:", headers);
  
  const categoryIndex = headers.findIndex(h => h === 'Category');
  const treatmentIndex = headers.findIndex(h => h === 'Treatment');
  const priceGBPIndex = headers.findIndex(h => h === 'Price (GBP)');
  const priceUSDIndex = headers.findIndex(h => h === 'Price (USD)');
  const guaranteeIndex = headers.findIndex(h => h === 'Guarantee');
  
  console.log("Column indices:", {
    categoryIndex,
    treatmentIndex,
    priceGBPIndex,
    priceUSDIndex,
    guaranteeIndex
  });
  
  const results = lines.slice(1)
    .filter(line => line.trim() !== '')
    .map((line, idx) => {
      // Handle quoted fields with commas inside them
      const values: string[] = [];
      let inQuotes = false;
      let currentValue = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else if ((char === "'" || char === '"') && (i === 0 || line[i-1] !== '\\')) {
          inQuotes = !inQuotes;
        } else {
          currentValue += char;
        }
      }
      
      // Don't forget to push the last value
      values.push(currentValue);
      
      if (idx < 3) {
        console.log(`Example row ${idx}:`, {line, values});
      }
      
      const result = {
        category: values[categoryIndex]?.trim() || 'General',
        treatment: values[treatmentIndex]?.trim() || '',
        priceGBP: parseFloat(values[priceGBPIndex]) || 0,
        priceUSD: parseFloat(values[priceUSDIndex]) || 0,
        guarantee: values[guaranteeIndex]?.trim() || 'N/A'
      };
      
      if (idx < 3) {
        console.log(`Example processed row ${idx}:`, result);
      }
      
      return result;
    });
    
  console.log(`Processed ${results.length} treatment records`);
  
  // Filter out items with empty treatments
  const validResults = results.filter(item => item.treatment.trim() !== '');
  console.log(`Valid treatment records: ${validResults.length} (filtered out ${results.length - validResults.length} empty treatments)`);
  
  return validResults;
}

// Add detailed descriptions and other information to treatments
function enhanceTreatmentData(treatments: TreatmentPrice[]): TreatmentPrice[] {
  // Common treatment descriptions, benefits, and other details
  const treatmentDetails: Record<string, Partial<TreatmentPrice>> = {
    // VENEERS
    'Porcelain Veneers': {
      description: 'Thin shells of porcelain that are bonded to the front surface of teeth to improve their appearance.',
      benefits: ['Natural-looking results', 'Stain-resistant', 'Durable (10-15 years)', 'Minimal enamel removal'],
      duration: '2-3 visits over 1-2 weeks',
      recovery: 'Minimal to none; immediate return to normal activities',
      image: '/treatments/porcelain-veneers.svg',
    },
    'Composite Veneers': {
      description: 'Tooth-colored composite resin applied to the front surface of teeth for a complete smile makeover.',
      benefits: ['More affordable than porcelain', 'Usually completed in a single visit', 'Less enamel removal', 'Easy to repair'],
      duration: '1 visit (2-3 hours)',
      recovery: 'Immediate; no downtime',
      image: '/treatments/composite-veneers.svg',
    },
    'E-Max Veneers': {
      description: 'Premium quality, ultra-thin porcelain veneers made from lithium disilicate, known for their exceptional strength and translucency.',
      benefits: ['Higher strength than traditional porcelain', 'Excellent translucency for natural appearance', 'Thinner than other options', 'Highly durable'],
      duration: '2 visits over 1 week',
      recovery: 'Minimal sensitivity; immediate return to normal activities',
      image: '/treatments/emax-veneers.svg',
    },
    'Lumineers': {
      description: 'Ultra-thin, highly translucent veneers that require minimal to no tooth reduction before placement.',
      benefits: ['Little to no tooth reduction needed', 'Reversible treatment', 'Natural appearance', 'Long-lasting results'],
      duration: '2 visits over 2-3 weeks',
      recovery: 'No recovery time needed',
      image: '/treatments/lumineers.svg',
    },

    // IMPLANTS
    'Premium Implant': {
      description: 'Premium grade implant system with the highest quality materials from top European, American, or Korean manufacturers.',
      benefits: ['Superior quality materials', 'Latest implant technology', 'Brand-specific features', 'Enhanced aesthetics', '95%+ success rate'],
      duration: '2-3 visits over 3-6 months',
      recovery: '1-2 weeks for initial healing; 3-6 months for complete osseointegration',
      image: '/treatments/single-implant.svg',
    },
    'Single Tooth Implant': {
      description: 'A titanium post surgically placed into the jawbone to replace a missing tooth root, topped with a crown.',
      benefits: ['Prevents bone loss', 'Restores full function', 'No impact on adjacent teeth', '95% success rate'],
      duration: '2-3 visits over 3-6 months',
      recovery: '1-2 weeks for initial healing; 3-6 months for complete osseointegration',
      image: '/treatments/single-implant.svg',
    },
    'All-on-4 Implants': {
      description: 'A full-arch restoration that uses only 4 implants to support an entire set of teeth, ideal for those with significant tooth loss.',
      benefits: ['Immediate function', 'Full arch replacement', 'Prevents further bone loss', 'Fixed, non-removable teeth'],
      duration: '1-2 visits over 2-3 days',
      recovery: '2-3 weeks for initial recovery; 3-6 months for complete healing',
      image: '/treatments/all-on-4.svg',
    },
    'All-on-6 Implants': {
      description: 'Similar to All-on-4 but with 6 implants for additional support and stability, particularly in the upper jaw.',
      benefits: ['Excellent stability', 'Better distribution of chewing forces', 'Ideal for upper jaw', 'Higher success rate in some cases'],
      duration: '1-2 visits over 2-3 days',
      recovery: '2-3 weeks for initial recovery; 3-6 months for complete healing',
      image: '/treatments/all-on-6.svg',
    },
    'Implant Supported Dentures': {
      description: 'Removable dentures that attach to dental implants, providing better stability and comfort than traditional dentures.',
      benefits: ['Improved stability', 'Better chewing ability', 'Prevents bone loss', 'More comfortable than traditional dentures'],
      duration: '3-4 visits over 3-6 months',
      recovery: '1-2 weeks for surgical recovery; 3-6 months for complete healing',
      image: '/treatments/implant-dentures.svg',
    },

    // CROWNS
    'Porcelain Crown': {
      description: 'A cap that covers a damaged tooth to restore its shape, size, strength, and improve its appearance.',
      benefits: ['Natural-looking aesthetics', 'Full protection for damaged teeth', 'Custom-shaped to match your bite', 'Long-lasting restoration'],
      duration: '2 visits over 1-2 weeks',
      recovery: 'Minimal; temporary sensitivity may occur',
      image: '/treatments/porcelain-crown.svg',
    },
    'Zirconia Crown': {
      description: 'Made from zirconium dioxide, these crowns offer exceptional strength and a natural appearance.',
      benefits: ['Metal-free option', 'Extremely strong material', 'Excellent aesthetics', 'Biocompatible'],
      duration: '2 visits over 1-2 weeks',
      recovery: 'Minimal; immediate return to normal activities',
      image: '/treatments/zirconia-crown.svg',
    },
    'E-Max Crown': {
      description: 'Made from lithium disilicate ceramic, E-Max crowns offer superior aesthetics with excellent strength.',
      benefits: ['Highly translucent for natural appearance', 'Stronger than traditional porcelain', 'Excellent fit', 'Metal-free'],
      duration: '2 visits over 1-2 weeks',
      recovery: 'Minimal sensitivity; immediate return to normal activities',
      image: '/treatments/emax-crown.svg',
    },

    // ROOT CANAL
    'Root Canal Treatment': {
      description: 'A procedure to save an infected or severely damaged tooth by removing the infected pulp and sealing the canal.',
      benefits: ['Saves natural tooth', 'Eliminates pain', 'Prevents further infection', 'High success rate'],
      duration: '1-2 visits over 1-2 weeks',
      recovery: 'Mild discomfort for 1-2 days; full recovery within a week',
      image: '/treatments/root-canal.svg',
    },

    // WHITENING
    'Zoom Whitening': {
      description: 'An in-office whitening procedure that uses proprietary light technology to accelerate the bleaching process.',
      benefits: ['Immediate results', 'Supervised by professionals', 'Up to 8 shades lighter', 'Custom treatment intensity'],
      duration: '1 visit (1-2 hours)',
      recovery: 'None; temporary sensitivity may occur',
      image: '/treatments/zoom-whitening.svg',
    },
    'Laser Whitening': {
      description: 'Uses laser light to activate the whitening agent, providing fast and effective results with minimal sensitivity.',
      benefits: ['Precise control', 'Reduced sensitivity', 'Faster process', 'Long-lasting results'],
      duration: '1 visit (1 hour)',
      recovery: 'None; minimal sensitivity',
      image: '/treatments/laser-whitening.svg',
    },

    // BRIDGES
    'Dental Bridge': {
      description: 'A fixed prosthetic device that bridges the gap between one or more missing teeth by anchoring to adjacent teeth.',
      benefits: ['Restores proper chewing function', 'Maintains face shape', 'Prevents remaining teeth from shifting', 'Fixed solution (not removable)'],
      duration: '2-3 visits over 2-3 weeks',
      recovery: 'Minimal adjustment period of a few days',
      image: '/treatments/dental-bridge.svg',
    },

    // HOLLYWOOD SMILE
    'Hollywood Smile': {
      description: 'A comprehensive smile makeover combining multiple procedures (typically veneers, whitening, and sometimes orthodontics) to create a perfect smile.',
      benefits: ['Comprehensive transformation', 'Addresses multiple issues at once', 'Custom-designed result', 'Long-lasting results'],
      duration: '2-3 visits over 1-2 weeks',
      recovery: 'Varies depending on procedures involved',
      image: '/treatments/hollywood-smile.svg',
    },
  };

  // Enhance each treatment with additional data if available
  return treatments.map(treatment => {
    const details = treatmentDetails[treatment.treatment];
    if (details) {
      return {
        ...treatment,
        ...details
      };
    }
    return treatment;
  });
}

export async function initializePrices(): Promise<void> {
  if (initialized) return;
  
  try {
    console.log('Using embedded CSV data...');
    
    const csvData = dentalPricesCSV;
    console.log('CSV data length:', csvData.length);
    
    if (csvData.length < 10) {
      console.error('CSV data is too short or empty');
      throw new Error('CSV data is too short or empty');
    }
    
    console.log('CSV data first 50 chars:', csvData.substring(0, 50));
    
    // Parse basic treatment data from CSV
    const basicTreatments = parseCSV(csvData);
    
    // Enhance treatment data with descriptions and other details
    treatmentPrices = enhanceTreatmentData(basicTreatments);
    
    initialized = true;
    console.log('Pricing data initialized successfully with', treatmentPrices.length, 'items');
  } catch (error) {
    console.error('Error initializing pricing data:', error);
    throw error;
  }
}

export function getAllTreatments(): TreatmentPrice[] {
  return treatmentPrices;
}

export function searchTreatments(query: string): TreatmentPrice[] {
  const normalizedQuery = query.toLowerCase().trim();
  return treatmentPrices.filter(tp => 
    tp.treatment.toLowerCase().includes(normalizedQuery) ||
    tp.category.toLowerCase().includes(normalizedQuery)
  );
}

export function getTreatmentByName(name: string): TreatmentPrice | undefined {
  const normalizedName = name.toLowerCase().trim();
  return treatmentPrices.find(tp => 
    tp.treatment.toLowerCase() === normalizedName
  );
}

export function getTreatmentsByCategory(category: string): TreatmentPrice[] {
  const normalizedCategory = category.toLowerCase().trim();
  return treatmentPrices.filter(tp => 
    tp.category.toLowerCase() === normalizedCategory
  );
}

export function getCategories(): string[] {
  const categories = new Set<string>();
  treatmentPrices.forEach(tp => {
    if (tp.category) categories.add(tp.category);
  });
  return Array.from(categories);
}

export function calculateTotal(
  treatments: Array<{ treatment: string, quantity: number }>,
  flightInfo?: { city: string, month: string },
  options?: { londonConsult?: 'yes' | 'no' }
): {
  totalGBP: number,
  totalUSD: number,
  items: Array<{
    treatment: string,
    priceGBP: number,
    priceUSD: number,
    quantity: number,
    subtotalGBP: number,
    subtotalUSD: number,
    guarantee: string
  }>,
  hasFlightCost: boolean,
  flightCostGBP?: number,
  flightCostUSD?: number,
  hasLondonConsult?: boolean,
  londonConsultCostGBP?: number,
  londonConsultCostUSD?: number
} {
  let totalGBP = 0;
  let totalUSD = 0;
  const items = [];
  let hasFlightCost = false;
  let flightCostGBP: number | undefined;
  let flightCostUSD: number | undefined;
  let hasLondonConsult = options?.londonConsult === 'yes';
  let londonConsultCostGBP: number | undefined;
  let londonConsultCostUSD: number | undefined;
  
  // London consultation fee
  const LONDON_CONSULT_FEE_GBP = 150;
  const LONDON_CONSULT_FEE_USD = Math.round(LONDON_CONSULT_FEE_GBP * 1.29); // Using approximate exchange rate

  // Calculate treatment costs
  for (const item of treatments) {
    const treatmentData = getTreatmentByName(item.treatment);
    if (treatmentData) {
      const subtotalGBP = treatmentData.priceGBP * item.quantity;
      const subtotalUSD = treatmentData.priceUSD * item.quantity;
      
      totalGBP += subtotalGBP;
      totalUSD += subtotalUSD;
      
      items.push({
        treatment: treatmentData.treatment,
        priceGBP: treatmentData.priceGBP,
        priceUSD: treatmentData.priceUSD,
        quantity: item.quantity,
        subtotalGBP,
        subtotalUSD,
        guarantee: treatmentData.guarantee
      });
    }
  }

  // If flight information is provided, calculate flight cost
  if (flightInfo && flightInfo.city && flightInfo.month) {
    try {
      // Use the imported flight estimates service
      const flightEstimate = getFlightEstimateForCity(flightInfo.city, flightInfo.month);
      
      if (flightEstimate) {
        // Convert flight cost from EUR to GBP and USD
        flightCostGBP = Math.round(flightEstimate * 0.85); // Approximate EUR to GBP conversion
        flightCostUSD = Math.round(flightEstimate * 1.1);  // Approximate EUR to USD conversion
        
        // Add flight cost to the total
        totalGBP += flightCostGBP;
        totalUSD += flightCostUSD;
        hasFlightCost = true;
        
        // Add flight cost as a line item
        items.push({
          treatment: `Return Flights (${flightInfo.city} to Istanbul)`,
          priceGBP: flightCostGBP,
          priceUSD: flightCostUSD,
          quantity: 1,
          subtotalGBP: flightCostGBP,
          subtotalUSD: flightCostUSD,
          guarantee: 'N/A'
        });
        
        console.log(`Added flight cost: £${flightCostGBP} / $${flightCostUSD} for ${flightInfo.city} in ${flightInfo.month}`);
      } else {
        console.log(`No flight estimate found for ${flightInfo.city} in ${flightInfo.month}`);
      }
    } catch (error) {
      console.error('Error calculating flight costs:', error);
    }
  }

  // Add London consultation fee if selected
  if (hasLondonConsult) {
    londonConsultCostGBP = LONDON_CONSULT_FEE_GBP;
    londonConsultCostUSD = LONDON_CONSULT_FEE_USD;
    
    // Add the consultation fee to the total
    totalGBP += londonConsultCostGBP;
    totalUSD += londonConsultCostUSD;
    
    // Add the consultation fee as a line item
    items.push({
      treatment: 'London Consultation Fee',
      priceGBP: londonConsultCostGBP,
      priceUSD: londonConsultCostUSD,
      quantity: 1,
      subtotalGBP: londonConsultCostGBP,
      subtotalUSD: londonConsultCostUSD,
      guarantee: 'N/A'
    });
    
    console.log(`Added London consultation fee: £${londonConsultCostGBP} / $${londonConsultCostUSD}`);
  }

  return {
    totalGBP,
    totalUSD,
    items,
    hasFlightCost,
    flightCostGBP,
    flightCostUSD,
    hasLondonConsult,
    londonConsultCostGBP,
    londonConsultCostUSD
  };
}