export interface QuoteItem {
  treatment: string;
  priceGBP: number;
  priceUSD: number;
  quantity: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
}

export interface ClinicInfo {
  id: string;
  name: string;
  tier: 'affordable' | 'mid' | 'premium';
  priceGBP: number;
  priceUSD: number;
  location: string;
  rating: number;
  guarantee: string;
  materials: string[];
  conciergeType: 'ids' | 'clinic';
  features: string[];
  description: string;
}

export interface QuoteData {
  items: QuoteItem[];
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  travelMonth?: string;
  departureCity?: string;
  flightCostGBP?: number;
  flightCostUSD?: number;
  hasLondonConsult?: boolean;
  londonConsultCostGBP?: number;
  londonConsultCostUSD?: number;
  selectedClinicIndex?: number;
}