import { CurrencyCode } from '@/utils/format-utils';

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

class TreatmentPackageService {
  // Mock packages for development
  private mockPackages: TreatmentPackage[] = [
    {
      id: 'pkg-001',
      name: 'Premium Implant Package',
      description: 'Complete implant solution with premium porcelain crown',
      treatments: [
        { id: 'treat-001', name: 'Dental Implant', description: 'Titanium implant placement', price: 850, category: 'implants', quantity: 1 },
        { id: 'treat-002', name: 'Porcelain Crown', description: 'Premium porcelain crown', price: 450, category: 'crowns', quantity: 1 },
        { id: 'treat-003', name: 'Initial Consultation', description: 'Comprehensive examination', price: 100, category: 'consultation', quantity: 1 }
      ],
      additionalServices: [
        { id: 'serv-001', name: 'Airport Transfer', description: 'Round-trip airport transfer', price: 50, included: true, type: 'transport' },
        { id: 'serv-002', name: 'Hotel Booking Assistance', description: 'Help with accommodation booking', price: 0, included: true, type: 'accommodation' }
      ],
      promoCode: 'IMPLANTCROWN30',
      regularPrice: 1500,
      discountedPrice: 1050,
      currency: 'USD',
      featured: true,
      clinicId: 'clinic-001'
    },
    {
      id: 'pkg-002',
      name: 'Smile Makeover Package',
      description: 'Complete smile transformation with veneers and teeth whitening',
      treatments: [
        { id: 'treat-005', name: 'Porcelain Veneer', description: 'Premium porcelain veneer', price: 550, category: 'cosmetic', quantity: 4 },
        { id: 'treat-004', name: 'Professional Teeth Whitening', description: 'In-office laser teeth whitening', price: 400, category: 'cosmetic', quantity: 1 }
      ],
      additionalServices: [
        { id: 'serv-001', name: 'Airport Transfer', description: 'Round-trip airport transfer', price: 50, included: true, type: 'transport' },
        { id: 'serv-003', name: 'Luxury Hotel Stay', description: '3 nights at 5-star hotel', price: 300, included: true, type: 'accommodation' }
      ],
      promoCode: 'LUXHOTEL20',
      regularPrice: 2900,
      discountedPrice: 2320,
      currency: 'USD',
      featured: true,
      clinicId: 'clinic-002'
    },
    {
      id: 'pkg-003',
      name: 'Travel & Treatment Bundle',
      description: 'All-inclusive dental vacation with sightseeing and premium care',
      treatments: [
        { id: 'treat-001', name: 'Dental Implant', description: 'Titanium implant placement', price: 850, category: 'implants', quantity: 2 },
        { id: 'treat-002', name: 'Porcelain Crown', description: 'Premium porcelain crown', price: 450, category: 'crowns', quantity: 2 },
        { id: 'treat-004', name: 'Professional Teeth Whitening', description: 'In-office laser teeth whitening', price: 400, category: 'cosmetic', quantity: 1 }
      ],
      additionalServices: [
        { id: 'serv-004', name: 'VIP Airport Service', description: 'Premium airport transfer and fast-track', price: 100, included: true, type: 'transport' },
        { id: 'serv-005', name: 'Deluxe Hotel Package', description: '5 nights at luxury hotel with spa access', price: 500, included: true, type: 'accommodation' },
        { id: 'serv-006', name: 'Istanbul City Tour', description: 'Guided tour of Istanbul highlights', price: 150, included: true, type: 'tourism' }
      ],
      promoCode: 'LUXTRAVEL',
      regularPrice: 4200,
      discountedPrice: 3360,
      currency: 'USD',
      featured: true,
      clinicId: 'clinic-003'
    }
  ];

  /**
   * Get all available treatment packages
   */
  async getAllPackages(): Promise<TreatmentPackage[]> {
    // In a real app, we would fetch this from an API
    return Promise.resolve(this.mockPackages);
  }

  /**
   * Get a specific package by ID
   */
  async getPackageById(id: string): Promise<TreatmentPackage | null> {
    // In a real app, we would fetch this from an API
    const foundPackage = this.mockPackages.find(pkg => pkg.id === id);
    return Promise.resolve(foundPackage || null);
  }

  /**
   * Get a package by its promo code
   */
  async getPackageByPromoCode(code: string): Promise<TreatmentPackage | null> {
    // In a real app, we would fetch this from an API
    const foundPackage = this.mockPackages.find(pkg => 
      pkg.promoCode.toLowerCase() === code.toLowerCase()
    );
    return Promise.resolve(foundPackage || null);
  }

  /**
   * Calculate the total regular price of a package (without discount)
   */
  calculatePackageRegularPrice(pkg: TreatmentPackage): number {
    const treatmentsTotal = pkg.treatments.reduce((sum, treatment) => 
      sum + (treatment.price * (treatment.quantity || 1)), 0);
    
    const additionalServicesTotal = pkg.additionalServices
      .filter(service => service.included)
      .reduce((sum, service) => sum + service.price, 0);
    
    return treatmentsTotal + additionalServicesTotal;
  }

  /**
   * Calculate the discounted price based on a package
   */
  calculateDiscountedPrice(pkg: TreatmentPackage): number {
    // In a real app, this might involve complex discount rules
    // For now, we'll just use the package's discounted price
    return pkg.discountedPrice;
  }

  /**
   * Get all treatments from a package as individual treatments
   * with quantities expanded (i.e., 2 implants becomes 2 separate treatment objects)
   */
  getExpandedTreatments(pkg: TreatmentPackage): Treatment[] {
    const expandedTreatments: Treatment[] = [];
    
    pkg.treatments.forEach(treatment => {
      const quantity = treatment.quantity || 1;
      
      for (let i = 0; i < quantity; i++) {
        expandedTreatments.push({
          ...treatment,
          quantity: 1 // Set quantity to 1 since we're expanding
        });
      }
    });
    
    return expandedTreatments;
  }
}

export default new TreatmentPackageService();