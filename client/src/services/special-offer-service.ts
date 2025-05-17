import { CurrencyCode } from "@/utils/format-utils";
import TreatmentPackageService, { TreatmentPackage } from "./treatment-package-service";

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  featured: boolean;
  promoCode: string;
  packageId?: string;
  clinicId?: string;
  endDate?: string;
  discountPercentage?: number;
  discountType: 'percentage' | 'fixed_amount';
  regularPrice?: number;
  discountedPrice?: number;
  currency: CurrencyCode;
  slug: string;
}

// Mock special offers for demonstration
const mockSpecialOffers: SpecialOffer[] = [
  {
    id: "offer-001",
    title: "All-on-6 Dental Implant Special",
    description: "Get a complete smile transformation with our premium All-on-6 dental implant package. This comprehensive treatment includes 6 high-quality dental implants and a full set of porcelain crowns. Also includes CT scan, consultation, and 3-night luxury hotel stay.",
    shortDescription: "Complete smile restoration with 6 implants and crowns plus luxury accommodation",
    imageUrl: "https://example.com/implant-package.jpg",
    featured: true,
    promoCode: "IMPLANTCROWN30",
    packageId: "pkg-001",
    clinicId: "clinic-001",
    endDate: "2025-08-30",
    discountPercentage: 30,
    discountType: 'percentage',
    regularPrice: 12000,
    discountedPrice: 8400,
    currency: "USD",
    slug: "all-on-6-implant-special"
  },
  {
    id: "offer-002",
    title: "VIP Smile Makeover Experience",
    description: "Transform your smile with our deluxe makeover package including 8 premium porcelain veneers and professional teeth whitening. Enjoy 5 nights in a five-star hotel, private transfers, and personalized smile design consultation.",
    shortDescription: "Premium veneers and whitening treatment with luxury accommodations",
    imageUrl: "https://example.com/veneer-package.jpg",
    featured: true,
    promoCode: "LUXHOTEL20",
    packageId: "pkg-002",
    clinicId: "clinic-002",
    endDate: "2025-07-15",
    discountPercentage: 20,
    discountType: 'percentage',
    regularPrice: 7550,
    discountedPrice: 6040,
    currency: "USD",
    slug: "vip-smile-makeover"
  },
  {
    id: "offer-003",
    title: "Dental Tourism Complete Package",
    description: "The ultimate worry-free dental tourism experience! This package includes round-trip flights, 7 nights at a 4-star hotel, airport transfers, city excursions, and a comprehensive dental treatment plan including implants, crowns and necessary root canal work.",
    shortDescription: "All-inclusive dental care with flights, accommodation and tourism activities",
    imageUrl: "https://example.com/travel-package.jpg",
    featured: true,
    promoCode: "LUXTRAVEL",
    packageId: "pkg-003",
    clinicId: "clinic-003",
    endDate: "2025-09-30",
    discountPercentage: 20,
    discountType: 'percentage',
    regularPrice: 8200,
    discountedPrice: 6560,
    currency: "USD",
    slug: "dental-tourism-complete"
  },
  {
    id: "offer-004",
    title: "New Patient Special: 25% Off All Treatments",
    description: "New to our clinic? Enjoy 25% off all dental procedures including cleanings, fillings, crowns, and more. Book your consultation today!",
    shortDescription: "Save 25% on all dental procedures for new patients",
    imageUrl: "https://example.com/new-patient-special.jpg",
    featured: false,
    promoCode: "DENTAL25",
    clinicId: "clinic-001",
    endDate: "2025-12-31",
    discountPercentage: 25,
    discountType: 'percentage',
    currency: "USD",
    slug: "new-patient-special"
  },
  {
    id: "offer-005",
    title: "Summer Smile Sale: 15% Off",
    description: "Get ready for summer with our limited-time offer. Save 15% on all cosmetic dental procedures including teeth whitening, veneers, and more!",
    shortDescription: "15% discount on all cosmetic dental treatments this summer",
    imageUrl: "https://example.com/summer-special.jpg",
    featured: false,
    promoCode: "SUMMER15",
    clinicId: "clinic-002",
    endDate: "2025-08-31",
    discountPercentage: 15,
    discountType: 'percentage',
    currency: "USD",
    slug: "summer-smile-sale"
  }
];

/**
 * Service for handling special offers that can be displayed on the homepage
 * and used as direct links into the quote builder with pre-filled packages
 */
const SpecialOfferService = {
  /**
   * Get all available special offers
   */
  async getAllOffers(): Promise<SpecialOffer[]> {
    // In a real application, this would be an API call
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        resolve(mockSpecialOffers);
      }, 500);
    });
  },

  /**
   * Get featured special offers for homepage display
   */
  async getFeaturedOffers(): Promise<SpecialOffer[]> {
    // In a real application, this would be an API call
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        resolve(mockSpecialOffers.filter(offer => offer.featured));
      }, 500);
    });
  },

  /**
   * Get a special offer by its ID
   */
  async getOfferById(id: string): Promise<SpecialOffer | null> {
    // In a real application, this would be an API call
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const offer = mockSpecialOffers.find(o => o.id === id);
        resolve(offer || null);
      }, 300);
    });
  },

  /**
   * Get a special offer by slug for SEO-friendly URLs
   */
  async getOfferBySlug(slug: string): Promise<SpecialOffer | null> {
    // In a real application, this would be an API call
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const offer = mockSpecialOffers.find(o => o.slug === slug);
        resolve(offer || null);
      }, 300);
    });
  },

  /**
   * Get a special offer by promo code
   */
  async getOfferByPromoCode(code: string): Promise<SpecialOffer | null> {
    // In a real application, this would be an API call
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const offer = mockSpecialOffers.find(o => o.promoCode.toUpperCase() === code.toUpperCase());
        resolve(offer || null);
      }, 300);
    });
  },

  /**
   * Get the associated package for a special offer
   */
  async getPackageForOffer(offerId: string): Promise<TreatmentPackage | null> {
    try {
      const offer = await this.getOfferById(offerId);
      if (!offer || !offer.packageId) return null;
      
      return await TreatmentPackageService.getPackageById(offer.packageId);
    } catch (error) {
      console.error('Error fetching package for offer:', error);
      return null;
    }
  }
};

export default SpecialOfferService;