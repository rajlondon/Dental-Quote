import { CurrencyCode } from "@/utils/format-utils";

export interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  quantity?: number;
  clinicReferenceCode?: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  included: boolean;
  type: 'accommodation' | 'transport' | 'wellness' | 'tourism';
  icon?: string;
}

export interface TreatmentPackage {
  id: string;
  name: string;
  description: string;
  treatments: Treatment[];
  additionalServices: AdditionalService[];
  promoCode: string;
  regularPrice: number;
  discountedPrice: number;
  currency: CurrencyCode;
  clinicId?: string;
  featured: boolean;
  details?: string;
  terms?: string;
}

// Mock data for packages
const mockPackages: TreatmentPackage[] = [
  {
    id: 'pkg-001',
    name: 'Premium All-on-6 Implant Package',
    description: 'Complete smile restoration with 6 dental implants and porcelain crowns',
    treatments: [
      {
        id: 'treat-001',
        name: 'Dental Implant',
        description: 'Titanium dental implant placement',
        price: 850,
        category: 'implants',
        quantity: 6,
        clinicReferenceCode: 'IMP-TI-PRO'
      },
      {
        id: 'treat-002',
        name: 'Porcelain Crown',
        description: 'Premium porcelain crown',
        price: 450,
        category: 'crowns',
        quantity: 6,
        clinicReferenceCode: 'CRN-POR-PRE'
      },
      {
        id: 'treat-003',
        name: 'CT Scan',
        description: '3D CT scan for precise implant placement',
        price: 200,
        category: 'diagnostic',
        quantity: 1,
        clinicReferenceCode: 'DIAG-CT-3D'
      },
      {
        id: 'treat-004',
        name: 'Temporary Teeth',
        description: 'Immediate load temporary prosthesis',
        price: 800,
        category: 'prosthetics',
        quantity: 1,
        clinicReferenceCode: 'PROT-TEMP-IL'
      }
    ],
    additionalServices: [
      {
        id: 'svc-001',
        name: '3-Night Luxury Hotel Stay',
        description: 'Stay at a 5-star hotel during your treatment',
        price: 600,
        included: true,
        type: 'accommodation'
      },
      {
        id: 'svc-002',
        name: 'Airport Transfer',
        description: 'Round-trip airport transfers',
        price: 120,
        included: true,
        type: 'transport'
      },
      {
        id: 'svc-003',
        name: 'City Tour',
        description: 'Guided city tour with lunch',
        price: 80,
        included: false,
        type: 'tourism'
      }
    ],
    promoCode: 'IMPLANTCROWN30',
    regularPrice: 12000,
    discountedPrice: 8400,
    currency: 'USD',
    clinicId: 'clinic-001',
    featured: true,
    details: 'This premium package includes everything you need for a complete smile transformation with the All-on-6 technique. The procedure involves placing 6 dental implants that support a full arch of prosthetic teeth.',
    terms: 'Valid for bookings until August 30, 2025. Includes 3-year warranty on implants and 2-year warranty on crowns. Additional procedures may incur extra costs.'
  },
  {
    id: 'pkg-002',
    name: 'VIP Smile Makeover Experience',
    description: 'Transform your smile with premium veneers and professional whitening',
    treatments: [
      {
        id: 'treat-005',
        name: 'Porcelain Veneer',
        description: 'Premium porcelain veneer',
        price: 550,
        category: 'cosmetic',
        quantity: 8,
        clinicReferenceCode: 'VEN-POR-PRE'
      },
      {
        id: 'treat-006',
        name: 'Professional Teeth Whitening',
        description: 'In-office laser teeth whitening',
        price: 400,
        category: 'cosmetic',
        quantity: 1,
        clinicReferenceCode: 'WHT-LSR-PRO'
      },
      {
        id: 'treat-007',
        name: 'Digital Smile Design',
        description: 'Customized digital smile design',
        price: 350,
        category: 'diagnostic',
        quantity: 1,
        clinicReferenceCode: 'DSD-PRO'
      }
    ],
    additionalServices: [
      {
        id: 'svc-004',
        name: '5-Night Luxury Hotel Stay',
        description: 'Stay at a 5-star hotel during your treatment',
        price: 800,
        included: true,
        type: 'accommodation'
      },
      {
        id: 'svc-005',
        name: 'VIP Airport Transfer',
        description: 'Private VIP airport transfers',
        price: 180,
        included: true,
        type: 'transport'
      },
      {
        id: 'svc-006',
        name: 'Spa Package',
        description: 'Luxury spa day with facial and massage',
        price: 220,
        included: true,
        type: 'wellness'
      }
    ],
    promoCode: 'LUXHOTEL20',
    regularPrice: 7550,
    discountedPrice: 6040,
    currency: 'USD',
    clinicId: 'clinic-002',
    featured: true,
    details: 'Our VIP Smile Makeover transforms your smile with premium porcelain veneers and professional teeth whitening. The package includes a personalized smile design consultation and digital previews of your results.',
    terms: 'Valid for bookings until July 15, 2025. Includes 2-year warranty on veneers. Follow-up whitening treatments available at discounted rates.'
  },
  {
    id: 'pkg-003',
    name: 'Dental Tourism Complete Package',
    description: 'All-inclusive package with flights, hotel, and comprehensive dental treatment',
    treatments: [
      {
        id: 'treat-008',
        name: 'Dental Implant',
        description: 'Titanium dental implant placement',
        price: 850,
        category: 'implants',
        quantity: 2,
        clinicReferenceCode: 'IMP-TI-STD'
      },
      {
        id: 'treat-009',
        name: 'Porcelain Crown',
        description: 'Premium porcelain crown',
        price: 450,
        category: 'crowns',
        quantity: 4,
        clinicReferenceCode: 'CRN-POR-STD'
      },
      {
        id: 'treat-010',
        name: 'Root Canal Treatment',
        description: 'Standard root canal treatment',
        price: 350,
        category: 'endodontics',
        quantity: 2,
        clinicReferenceCode: 'ENDO-RC-STD'
      },
      {
        id: 'treat-011',
        name: 'Professional Cleaning',
        description: 'Deep cleaning and scaling',
        price: 100,
        category: 'hygiene',
        quantity: 1,
        clinicReferenceCode: 'HYG-CLN-DEP'
      }
    ],
    additionalServices: [
      {
        id: 'svc-007',
        name: 'Round-trip Flights',
        description: 'Economy class round-trip flights',
        price: 850,
        included: true,
        type: 'transport'
      },
      {
        id: 'svc-008',
        name: '7-Night Hotel Stay',
        description: 'Stay at a 4-star hotel during your treatment',
        price: 950,
        included: true,
        type: 'accommodation'
      },
      {
        id: 'svc-009',
        name: 'Airport Transfers',
        description: 'Round-trip airport transfers',
        price: 120,
        included: true,
        type: 'transport'
      },
      {
        id: 'svc-010',
        name: 'City Excursions Package',
        description: 'Three guided city excursions with lunch',
        price: 250,
        included: true,
        type: 'tourism'
      }
    ],
    promoCode: 'LUXTRAVEL',
    regularPrice: 8200,
    discountedPrice: 6560,
    currency: 'USD',
    clinicId: 'clinic-003',
    featured: true,
    details: 'This comprehensive package includes everything from flights and accommodation to your complete dental treatment. It's the ultimate worry-free dental tourism experience with all logistics handled for you.',
    terms: 'Valid for bookings until September 30, 2025. Flights from major European cities only. 2-year warranty on all dental work. Additional treatments can be added at special rates.'
  }
];

/**
 * Service for handling treatment packages and associated treatments
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
   * Get a specific package by ID
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
   * Get a package by its promo code
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
   * Calculate the total regular price of a package (without discount)
   */
  calculatePackageRegularPrice(pkg: TreatmentPackage): number {
    let total = 0;
    
    // Add up treatment costs
    pkg.treatments.forEach(treatment => {
      total += treatment.price * (treatment.quantity || 1);
    });
    
    // Add up included additional services
    pkg.additionalServices.forEach(service => {
      if (service.included) {
        total += service.price;
      }
    });
    
    return total;
  },

  /**
   * Calculate the discounted price based on a package
   */
  calculateDiscountedPrice(pkg: TreatmentPackage): number {
    const regularPrice = this.calculatePackageRegularPrice(pkg);
    return pkg.discountedPrice || regularPrice;
  },
  
  /**
   * Get all treatments from a package as individual treatments
   * with quantities expanded (i.e., 2 implants becomes 2 separate treatment objects)
   */
  getExpandedTreatments(pkg: TreatmentPackage): Treatment[] {
    const expandedTreatments: Treatment[] = [];
    
    pkg.treatments.forEach(treatment => {
      // Add the treatment the specified number of times based on quantity
      const quantity = treatment.quantity || 1;
      
      for (let i = 0; i < quantity; i++) {
        expandedTreatments.push({
          ...treatment,
          quantity: 1  // Reset quantity to 1 as we're expanding them
        });
      }
    });
    
    return expandedTreatments;
  }
};

export default TreatmentPackageService;