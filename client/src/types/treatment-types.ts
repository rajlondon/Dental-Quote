export interface Treatment {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface TreatmentPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  items: { treatmentId: string; quantity: number }[];
  promoCode: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  price: number;
  description: string;
}