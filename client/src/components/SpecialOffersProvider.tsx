import React, { createContext, useContext, useState, useEffect } from 'react';
import { SpecialOffer, TreatmentPackage } from '../../../shared/schema';
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SpecialOffersContextType {
  offers: SpecialOffer[];
  packages: TreatmentPackage[];
  loading: boolean;
  error: Error | null;
  
  // Offer methods
  applyOfferToTreatment: (treatmentId: string, offerId: string) => number;
  getApplicableOffers: (treatmentId: string, clinicId: number) => SpecialOffer[];
  getHighlightedOffers: () => SpecialOffer[];
  
  // Package methods
  getAvailablePackages: (clinicId: number) => TreatmentPackage[];
  calculatePackageSavings: (packageId: string) => { original: number, discounted: number, savings: number };
  
  // Refresh methods
  refreshOffers: () => Promise<void>;
  refreshPackages: () => Promise<void>;
}

export const SpecialOffersContext = createContext<SpecialOffersContextType | null>(null);

export const SpecialOffersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [packages, setPackages] = useState<TreatmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  // Fetch offers and packages on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          refreshOffers(),
          refreshPackages()
        ]);
      } catch (error) {
        console.error('Failed to load offers and packages:', error);
        setError(error instanceof Error ? error : new Error('Unknown error loading offers'));
        toast({
          title: 'Error',
          description: 'Failed to load special offers and packages',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Refresh functions
  const refreshOffers = async () => {
    try {
      const response = await apiRequest('GET', '/api/special-offers');
      const data = await response.json();
      setOffers(data);
      queryClient.setQueryData(['/api/special-offers'], data);
    } catch (error) {
      console.error('Error refreshing offers:', error);
      throw error;
    }
  };

  const refreshPackages = async () => {
    try {
      const response = await apiRequest('GET', '/api/treatment-packages');
      const data = await response.json();
      setPackages(data);
      queryClient.setQueryData(['/api/treatment-packages'], data);
    } catch (error) {
      console.error('Error refreshing packages:', error);
      throw error;
    }
  };

  // Special Offer Methods
  const applyOfferToTreatment = (treatmentId: string, offerId: string): number => {
    const offer = offers.find(offer => offer.id === offerId);
    if (!offer) return 0;

    // Get the treatment price from somewhere (this would come from a treatment list)
    // For now, we'll just return a placeholder discount
    const dummyTreatmentPrice = 1000; // This should be retrieved from actual data
    
    if (offer.discountType === 'percentage') {
      const discountAmount = dummyTreatmentPrice * (Number(offer.discountValue) / 100);
      return Math.min(discountAmount, Number(offer.maxDiscountAmount || Infinity));
    } else {
      return Number(offer.discountValue);
    }
  };

  const getApplicableOffers = (treatmentId: string, clinicId: number): SpecialOffer[] => {
    return offers.filter(offer => {
      // Check if offer is for the right clinic
      if (offer.clinicId !== clinicId) return false;
      
      // Check if offer applies to this treatment
      if (offer.applicableTreatments && Array.isArray(offer.applicableTreatments)) {
        return offer.applicableTreatments.includes(treatmentId) || offer.applicableTreatments.length === 0;
      }
      
      return false;
    });
  };

  const getHighlightedOffers = (): SpecialOffer[] => {
    // For now, just return all offers - in a real implementation we'd filter by a "highlighted" flag
    return offers;
  };

  // Package Methods
  const getAvailablePackages = (clinicId: number): TreatmentPackage[] => {
    return packages.filter(pkg => pkg.clinicId === clinicId);
  };

  const calculatePackageSavings = (packageId: string): { original: number, discounted: number, savings: number } => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) {
      return { original: 0, discounted: 0, savings: 0 };
    }

    // Calculate price based on discount percentage and total price
    const discountPct = Number(pkg.discountPct || 0);
    const totalPrice = Number(pkg.totalPriceGBP || 0);
    const original = totalPrice;
    const discounted = totalPrice * (1 - (discountPct / 100));
    const savings = original - discounted;

    return { original, discounted, savings };
  };

  const contextValue: SpecialOffersContextType = {
    offers,
    packages,
    loading,
    error,
    applyOfferToTreatment,
    getApplicableOffers,
    getHighlightedOffers,
    getAvailablePackages,
    calculatePackageSavings,
    refreshOffers,
    refreshPackages
  };

  return (
    <SpecialOffersContext.Provider value={contextValue}>
      {children}
    </SpecialOffersContext.Provider>
  );
};

export const useSpecialOffers = () => {
  const context = useContext(SpecialOffersContext);
  if (!context) {
    throw new Error('useSpecialOffers must be used within a SpecialOffersProvider');
  }
  return context;
};