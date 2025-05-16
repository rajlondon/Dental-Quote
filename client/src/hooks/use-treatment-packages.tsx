import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Treatment } from '../stores/quoteStore';

// Define treatment package type
export type TreatmentPackage = {
  id: string;
  name: string;
  description: string;
  treatments: Treatment[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  imageUrl?: string;
  featured?: boolean;
}

// Define packages query result type
export interface UsePackagesResult {
  packages: TreatmentPackage[];
  isLoading: boolean;
  error: Error | null;
  selectedPackage: TreatmentPackage | null;
  selectPackage: (packageData: TreatmentPackage | null) => void;
  packageSavings: number;
}

export function useTreatmentPackages(): UsePackagesResult {
  const [selectedPackage, setSelectedPackage] = useState<TreatmentPackage | null>(null);
  
  // Query to fetch packages from the API
  const { 
    data: packages = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/packages'],
    queryFn: async () => {
      try {
        // In a real implementation, this would fetch from the API
        // Using mock data for now
        return getMockPackages();
      } catch (error) {
        console.error('Error fetching packages:', error);
        throw error;
      }
    },
  });
  
  // Function to select a package
  const selectPackage = (packageData: TreatmentPackage | null) => {
    setSelectedPackage(packageData);
  };
  
  // Calculate package savings
  const calculatePackageSavings = () => {
    if (!selectedPackage) return 0;
    
    // Calculate total price of all treatments in the package
    const totalPrice = selectedPackage.treatments.reduce(
      (sum, treatment) => sum + (treatment.price * (treatment.quantity || 1)), 
      0
    );
    
    if (selectedPackage.discountType === 'percentage') {
      return totalPrice * (selectedPackage.discount / 100);
    } else {
      // Fixed discount
      return selectedPackage.discount;
    }
  };
  
  return {
    packages,
    isLoading,
    error,
    selectedPackage,
    selectPackage,
    packageSavings: calculatePackageSavings()
  };
}

// Mock data function for development
function getMockPackages(): TreatmentPackage[] {
  return [
    {
      id: 'pkg1',
      name: 'Smile Makeover Package',
      description: 'Complete smile transformation package including cleaning, whitening, and cosmetic treatments',
      treatments: [
        { id: 'p1t1', name: 'Dental Examination', description: 'Comprehensive dental check-up', price: 75, quantity: 1 },
        { id: 'p1t2', name: 'Teeth Cleaning', description: 'Professional teeth cleaning', price: 100, quantity: 1 },
        { id: 'p1t3', name: 'Teeth Whitening', description: 'Professional whitening treatment', price: 250, quantity: 1 },
        { id: 'p1t4', name: 'Cosmetic Consultation', description: 'Consultation for cosmetic improvements', price: 120, quantity: 1 }
      ],
      discount: 20,
      discountType: 'percentage',
      imageUrl: 'https://placehold.co/600x400/e2f4ff/0a5282?text=Smile+Makeover',
      featured: true
    },
    {
      id: 'pkg2',
      name: 'Dental Implant Package',
      description: 'Complete dental implant procedure including consultation, surgery, and crown placement',
      treatments: [
        { id: 'p2t1', name: 'Implant Consultation', description: 'Initial evaluation for dental implant', price: 150, quantity: 1 },
        { id: 'p2t2', name: 'CT Scan', description: 'Detailed 3D imaging of jawbone', price: 300, quantity: 1 },
        { id: 'p2t3', name: 'Implant Surgery', description: 'Placement of dental implant', price: 1200, quantity: 1 },
        { id: 'p2t4', name: 'Abutment Placement', description: 'Connecting component for crown', price: 450, quantity: 1 },
        { id: 'p2t5', name: 'Implant Crown', description: 'Custom-made tooth crown', price: 800, quantity: 1 }
      ],
      discount: 15,
      discountType: 'percentage',
      imageUrl: 'https://placehold.co/600x400/f5fff2/2a7d19?text=Dental+Implant'
    },
    {
      id: 'pkg3',
      name: 'Family Dental Package',
      description: 'Comprehensive family package for up to 4 family members including examinations and cleanings',
      treatments: [
        { id: 'p3t1', name: 'Dental Examination', description: 'Comprehensive dental check-up', price: 75, quantity: 4 },
        { id: 'p3t2', name: 'Teeth Cleaning', description: 'Professional teeth cleaning', price: 100, quantity: 4 },
        { id: 'p3t3', name: 'Fluoride Treatment', description: 'Preventive fluoride application', price: 50, quantity: 4 },
        { id: 'p3t4', name: 'Oral Hygiene Education', description: 'Personal guidance on oral care', price: 60, quantity: 1 }
      ],
      discount: 300,
      discountType: 'fixed',
      imageUrl: 'https://placehold.co/600x400/fff8f2/824b2a?text=Family+Package'
    }
  ];
}