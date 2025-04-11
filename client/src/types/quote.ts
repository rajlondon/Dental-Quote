// Define interface for quote items
export interface QuoteItem {
  treatment: string;
  priceGBP: number;
  priceUSD: number;
  quantity: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
}

// Define clinic information interface
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

// Interface for clinic comparison in quotes
export interface ClinicComparison {
  name: string;
  priceGBP: number;
  extras?: string;
  location?: string;
  guarantee?: string;
  rating?: string;
}

// Interface for uploaded X-ray files
export interface UploadedFile {
  filename: string;
  originalname: string;
  path: string;
  size: number;
  mimetype: string;
}

// Main interface for quote data
export interface QuoteData {
  items: QuoteItem[];
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  travelMonth?: string;
  departureCity?: string;
  clinics?: ClinicComparison[];
  hasXrays?: boolean;
  xrayCount?: number;
  selectedClinicIndex?: number;
  xrayFiles?: UploadedFile[];
  hasLondonConsult?: boolean;
  londonConsult?: 'yes' | 'no';
  londonConsultCostGBP?: number;
  londonConsultCostUSD?: number;
}