// Global interfaces
interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
  plausible: (...args: any[]) => void;
  mixpanel?: any;
  clinicLoginInProgress?: boolean;
}

// Special offers
type SpecialOfferDetails = {
  id: string;
  name: string;
  description?: string;
  discount?: number;
  discountType?: string;
  applicableTreatments?: string[];
  clinicId?: number;
  image?: string;
  expiry?: string;
  bonusFeatures?: string[];
};