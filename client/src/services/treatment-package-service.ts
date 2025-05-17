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

// Mock treatment packages data for demonstration
const mockPackages: TreatmentPackage[] = [
  {
    id: 'pkg-001',
    name: 'Premium Implant Package',
    description: 'Complete dental implant solution with 6 implants and crowns',
    promoCode: 'IMPLANTCROWN30',
    clinicId: 'clinic-001',
    treatments: [
      {
        id: '1',
        name: 'Dental Implant',
        description: 'Titanium post surgically placed into the jawbone',
        price: 1200,
        category: 'Implants',
        quantity: 6
      },
      {
        id: '2',
        name: 'Porcelain Crown',
        description: 'Custom-made porcelain cap placed over a damaged tooth',
        price: 800,
        category: 'Crowns',
        quantity: 6
      }
    ],
    additionalServices: [
      {
        name: 'CT Scan',
        description: 'Detailed 3D imagery for precise implant planning',
        included: true
      },
      {
        name: 'Hotel Accommodation (3 nights)',
        description: 'Stay at a luxury hotel during your treatment',
        included: true
      },
      {
        name: 'Airport Transfer',
        description: 'Pick-up and drop-off service to/from airport',
        included: true
      }
    ],
    regularPrice: 12000,
    discountedPrice: 8400,
    discountPercentage: 30,
    currency: 'USD',
    imageUrl: 'https://example.com/implant-package.jpg'
  },
  {
    id: 'pkg-002',
    name: 'Luxury Smile Makeover',
    description: 'Complete smile transformation with veneers and whitening',
    promoCode: 'LUXHOTEL20',
    clinicId: 'clinic-002',
    treatments: [
      {
        id: '5',
        name: 'Dental Veneers (per tooth)',
        description: 'Thin shells custom-made to cover front surface of teeth',
        price: 900,
        category: 'Cosmetic',
        quantity: 8
      },
      {
        id: '4',
        name: 'Teeth Whitening',
        description: 'Professional whitening treatment for brighter smile',
        price: 350,
        category: 'Cosmetic',
        quantity: 1
      }
    ],
    additionalServices: [
      {
        name: 'Smile Design Consultation',
        description: 'Personalized smile design with digital preview',
        included: true
      },
      {
        name: 'Five-Star Hotel (5 nights)',
        description: 'Stay at a luxury five-star hotel during your treatment',
        included: true
      },
      {
        name: 'Private Transfer Service',
        description: 'Luxury car transfer service to all appointments',
        included: true
      },
      {
        name: 'Tourist Attractions Tour',
        description: 'Guided tour of city attractions on non-treatment days',
        included: false
      }
    ],
    regularPrice: 7550,
    discountedPrice: 6040,
    discountPercentage: 20,
    currency: 'USD',
    imageUrl: 'https://example.com/veneer-package.jpg'
  },
  {
    id: 'pkg-003',
    name: 'Travel & Treatment Bundle',
    description: 'Complete dental care with travel arrangements included',
    promoCode: 'LUXTRAVEL',
    clinicId: 'clinic-003',
    treatments: [
      {
        id: '1',
        name: 'Dental Implant',
        description: 'Titanium post surgically placed into the jawbone',
        price: 1200,
        category: 'Implants',
        quantity: 2
      },
      {
        id: '2',
        name: 'Porcelain Crown',
        description: 'Custom-made porcelain cap placed over a damaged tooth',
        price: 800,
        category: 'Crowns',
        quantity: 4
      },
      {
        id: '3',
        name: 'Root Canal',
        description: 'Removal of infected pulp from inside the tooth',
        price: 650,
        category: 'Endodontics',
        quantity: 1
      }
    ],
    additionalServices: [
      {
        name: 'Return Flight (Economy)',
        description: 'Round-trip flights from your location',
        included: true
      },
      {
        name: 'Hotel Accommodation (7 nights)',
        description: '4-star hotel accommodation during your treatment',
        included: true
      },
      {
        name: 'Airport Transfer',
        description: 'Pick-up and drop-off service to/from airport',
        included: true
      },
      {
        name: 'City Excursions (2 days)',
        description: 'Guided tours of local attractions',
        included: true
      }
    ],
    regularPrice: 8200,
    discountedPrice: 6560,
    discountPercentage: 20,
    currency: 'USD',
    imageUrl: 'https://example.com/travel-package.jpg'
  },
];

/**
 * Service for handling treatment packages
 */
const TreatmentPackageService = {
  /**
   * Get all available treatment packages
   */
  async getAllPackages(): Promise<TreatmentPackage[]> {
    // In a real application, this would be an API call
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        resolve(mockPackages);
      }, 500);
    });
  },

  /**
   * Get a treatment package by its ID
   */
  async getPackageById(id: string): Promise<TreatmentPackage | null> {
    // In a real application, this would be an API call
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const pkg = mockPackages.find(p => p.id === id);
        resolve(pkg || null);
      }, 300);
    });
  },

  /**
   * Get a treatment package by promo code
   */
  async getPackageByPromoCode(code: string): Promise<TreatmentPackage | null> {
    // In a real application, this would be an API call
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const pkg = mockPackages.find(p => p.promoCode.toUpperCase() === code.toUpperCase());
        resolve(pkg || null);
      }, 300);
    });
  },
  
  /**
   * Get all available treatments from all packages
   */
  async getAllTreatments(): Promise<TreatmentItem[]> {
    // In a real application, this would be an API call
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const allTreatments: TreatmentItem[] = [];
        
        mockPackages.forEach(pkg => {
          pkg.treatments.forEach(treatment => {
            if (!allTreatments.some(t => t.id === treatment.id)) {
              allTreatments.push(treatment);
            }
          });
        });
        
        resolve(allTreatments);
      }, 300);
    });
  }
};

export default TreatmentPackageService;