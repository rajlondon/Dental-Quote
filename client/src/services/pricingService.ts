export interface TreatmentPrice {
  category: string;
  treatment: string;
  priceGBP: number;
  priceUSD: number;
  guarantee: string;
}

let treatmentPrices: TreatmentPrice[] = [];
let initialized = false;

// Manual CSV parsing function for browser compatibility
function parseCSV(csvText: string): TreatmentPrice[] {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  
  const categoryIndex = headers.findIndex(h => h === 'Category');
  const treatmentIndex = headers.findIndex(h => h === 'Treatment');
  const priceGBPIndex = headers.findIndex(h => h === 'Price (GBP)');
  const priceUSDIndex = headers.findIndex(h => h === 'Price (USD)');
  const guaranteeIndex = headers.findIndex(h => h === 'Guarantee');
  
  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      // Handle quoted fields with commas inside them
      const values: string[] = [];
      let inQuotes = false;
      let currentValue = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else if (char === "'" && (i === 0 || line[i-1] !== '\\')) {
          inQuotes = !inQuotes;
        } else {
          currentValue += char;
        }
      }
      
      // Don't forget to push the last value
      values.push(currentValue);
      
      return {
        category: values[categoryIndex]?.trim() || 'General',
        treatment: values[treatmentIndex]?.trim() || '',
        priceGBP: parseFloat(values[priceGBPIndex]) || 0,
        priceUSD: parseFloat(values[priceUSDIndex]) || 0,
        guarantee: values[guaranteeIndex]?.trim() || 'N/A'
      };
    });
}

export async function initializePrices(): Promise<void> {
  if (initialized) return;
  
  try {
    const response = await fetch('/data/structured_dental_prices.csv');
    const csvData = await response.text();
    
    treatmentPrices = parseCSV(csvData);
    
    initialized = true;
    console.log('Pricing data initialized successfully');
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

export function calculateTotal(treatments: Array<{ treatment: string, quantity: number }>): {
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
  }>
} {
  let totalGBP = 0;
  let totalUSD = 0;
  const items = [];

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

  return {
    totalGBP,
    totalUSD,
    items
  };
}