import { CurrencyCode } from '@/utils/format-utils';

export interface TreatmentItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  quantity?: number;
}

export interface AdditionalService {
  name: string;
  description: string;
  included: boolean;
}

export interface TreatmentPackage {
  id: string;
  name: string;
  description: string;
  promoCode: string;
  clinicId?: string;
  treatments: TreatmentItem[];
  additionalServices: AdditionalService[];
  regularPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  currency: CurrencyCode;
  imageUrl?: string;
}

// Mock data for treatment packages linked to promo codes
const treatmentPackages: TreatmentPackage[] = [
  {
    id: 'pkg-001',
    name: 'Dental Implant Complete Package',
    description: 'Full implant treatment including consultation, surgery, and crown',
    promoCode: 'IMPLANTCROWN30',
    clinicId: 'clinic-001',
    treatments: [
      {
        id: '1',
        name: 'Dental Implant',
        description: 'Titanium post surgically placed into the jawbone',
        price: 1200,
        category: 'Implants',
        quantity: 1
      },
      {
        id: '2',
        name: 'Porcelain Crown',
        description: 'Custom-made porcelain cap placed over a damaged tooth',
        price: 800,
        category: 'Crowns',
        quantity: 1
      },
      {
        id: '4',
        name: 'Dental X-Ray',
        description: 'Comprehensive X-Ray imaging',
        price: 150,
        category: 'Diagnostics',
        quantity: 1
      }
    ],
    additionalServices: [
      {
        name: 'Free Consultation',
        description: 'Initial consultation with dental specialist',
        included: true
      },
      {
        name: 'Airport Transfer',
        description: 'Complimentary pickup from airport to hotel',
        included: true
      }
    ],
    regularPrice: 2150,
    discountedPrice: 1505,
    discountPercentage: 30,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1470&auto=format&fit=crop'
  },
  {
    id: 'pkg-002',
    name: 'Hollywood Smile Package',
    description: 'Complete smile makeover with veneers and whitening',
    promoCode: 'FREEWHITE',
    clinicId: 'clinic-002',
    treatments: [
      {
        id: '5',
        name: 'Dental Veneers (per tooth)',
        description: 'Thin shells custom-made to cover front surface of teeth',
        price: 900,
        category: 'Cosmetic',
        quantity: 6
      },
      {
        id: '6',
        name: 'Professional Teeth Whitening',
        description: 'In-office teeth whitening procedure',
        price: 350,
        category: 'Cosmetic',
        quantity: 1
      }
    ],
    additionalServices: [
      {
        name: 'Luxury Accommodation',
        description: '3 nights stay at partner 5-star hotel',
        included: true
      },
      {
        name: 'Dental Care Kit',
        description: 'Premium dental care kit for post-treatment maintenance',
        included: true
      }
    ],
    regularPrice: 5750,
    discountedPrice: 5400,
    discountPercentage: 6.1,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1581585504607-89fa2e7056da?q=80&w=1470&auto=format&fit=crop'
  },
  {
    id: 'pkg-003',
    name: 'All-on-4 Implants Premium Package',
    description: 'Full arch restoration with just 4 implants and luxury accommodations',
    promoCode: 'LUXTRAVEL',
    clinicId: 'clinic-003',
    treatments: [
      {
        id: '1',
        name: 'Dental Implant',
        description: 'Titanium post surgically placed into the jawbone',
        price: 1200,
        category: 'Implants',
        quantity: 4
      },
      {
        id: '7',
        name: 'Full Arch Prosthesis',
        description: 'Fixed full-arch prosthesis attached to implants',
        price: 3500,
        category: 'Prosthetics',
        quantity: 1
      },
      {
        id: '4',
        name: 'Dental X-Ray',
        description: 'Comprehensive X-Ray imaging',
        price: 150,
        category: 'Diagnostics',
        quantity: 1
      },
      {
        id: '8',
        name: 'Dental CT Scan',
        description: '3D imaging of teeth and jawbone',
        price: 250,
        category: 'Diagnostics',
        quantity: 1
      }
    ],
    additionalServices: [
      {
        name: 'Luxury Accommodation',
        description: '7 nights stay at partner 5-star hotel',
        included: true
      },
      {
        name: 'VIP Transportation',
        description: 'Private car service for all local transportation needs',
        included: true
      },
      {
        name: 'Guided City Tour',
        description: 'Private guided tour of local attractions',
        included: true
      }
    ],
    regularPrice: 8700,
    discountedPrice: 7830,
    discountPercentage: 10,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1470&auto=format&fit=crop'
  },
  {
    id: 'pkg-004',
    name: 'Hotel & Dental Package',
    description: 'Dental treatment with luxury hotel stay included',
    promoCode: 'LUXHOTEL20',
    clinicId: 'clinic-002',
    treatments: [
      {
        id: '3',
        name: 'Root Canal',
        description: 'Removal of infected pulp from inside the tooth',
        price: 650,
        category: 'Endodontics',
        quantity: 1
      },
      {
        id: '2',
        name: 'Porcelain Crown',
        description: 'Custom-made porcelain cap placed over a damaged tooth',
        price: 800,
        category: 'Crowns',
        quantity: 1
      }
    ],
    additionalServices: [
      {
        name: 'Luxury Accommodation',
        description: '5 nights stay at partner 5-star hotel',
        included: true
      },
      {
        name: 'Airport Transfer',
        description: 'Complimentary pickup from airport to hotel',
        included: true
      }
    ],
    regularPrice: 1450,
    discountedPrice: 1160,
    discountPercentage: 20,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1470&auto=format&fit=crop'
  },
  {
    id: 'pkg-005',
    name: 'Free Consultation Special',
    description: 'Comprehensive dental consultation with no obligation',
    promoCode: 'FREECONSULT',
    treatments: [
      {
        id: '9',
        name: 'Dental Consultation',
        description: 'Comprehensive dental examination and treatment planning',
        price: 100,
        category: 'Consultations',
        quantity: 1
      }
    ],
    additionalServices: [
      {
        name: 'Digital X-Rays',
        description: 'If needed for diagnosis',
        included: true
      },
      {
        name: 'Treatment Plan',
        description: 'Detailed treatment options and cost estimates',
        included: true
      }
    ],
    regularPrice: 100,
    discountedPrice: 0,
    discountPercentage: 100,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=1470&auto=format&fit=crop'
  }
];

/**
 * Service for handling treatment packages
 */
export const TreatmentPackageService = {
  /**
   * Get all available treatment packages
   */
  getAllPackages(): Promise<TreatmentPackage[]> {
    return Promise.resolve(treatmentPackages);
  },
  
  /**
   * Get a treatment package by its ID
   */
  getPackageById(id: string): Promise<TreatmentPackage | null> {
    const pkg = treatmentPackages.find(p => p.id === id);
    return Promise.resolve(pkg || null);
  },
  
  /**
   * Get a treatment package by promo code
   */
  getPackageByPromoCode(code: string): Promise<TreatmentPackage | null> {
    const pkg = treatmentPackages.find(p => p.promoCode.toUpperCase() === code.toUpperCase());
    return Promise.resolve(pkg || null);
  },
  
  /**
   * Get all available treatments from all packages
   */
  getAllTreatments(): Promise<TreatmentItem[]> {
    // Collect all treatments from all packages, removing duplicates
    const allTreatments = treatmentPackages.flatMap(pkg => pkg.treatments);
    
    // Remove duplicates by ID
    const uniqueTreatments = allTreatments.filter((treatment, index, self) => 
      index === self.findIndex(t => t.id === treatment.id)
    );
    
    return Promise.resolve(uniqueTreatments);
  }
};

export default TreatmentPackageService;