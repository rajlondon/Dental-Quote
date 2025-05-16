import { useState, useEffect } from 'react';
import { TreatmentPackage } from '../stores/quoteStore';

// Sample treatment packages data
const SAMPLE_PACKAGES: TreatmentPackage[] = [
  {
    id: 'pkg-001',
    name: 'Dental Implant Package',
    description: 'Complete dental implant package including consultation, surgery, and crown.',
    price: 1200,
    originalPrice: 1500,
    treatments: [
      { 
        id: 'impl-001', 
        name: 'Dental Implant', 
        description: 'Titanium dental implant procedure', 
        price: 800, 
        quantity: 1,
        category: 'dental_implant_standard'
      },
      { 
        id: 'crown-001', 
        name: 'Porcelain Crown', 
        description: 'High-quality porcelain crown placement', 
        price: 400, 
        quantity: 1,
        category: 'dental_crowns'
      },
      { 
        id: 'consult-001', 
        name: 'Dental Consultation', 
        description: 'Initial consultation and treatment planning', 
        price: 100, 
        quantity: 1,
        category: 'consultation'
      }
    ]
  },
  {
    id: 'pkg-002',
    name: 'Hollywood Smile Package',
    description: 'Complete smile makeover with teeth whitening and veneers.',
    price: 2500,
    originalPrice: 3200,
    treatments: [
      { 
        id: 'veneer-001', 
        name: 'Porcelain Veneers (6 teeth)', 
        description: 'Premium porcelain veneers for front teeth', 
        price: 2000, 
        quantity: 1,
        category: 'porcelain_veneers'
      },
      { 
        id: 'whiten-001', 
        name: 'Professional Teeth Whitening', 
        description: 'In-office teeth whitening treatment', 
        price: 300, 
        quantity: 1,
        category: 'teeth_whitening'
      },
      { 
        id: 'consult-002', 
        name: 'Cosmetic Consultation', 
        description: 'Smile design consultation and planning', 
        price: 150, 
        quantity: 1,
        category: 'consultation'
      }
    ]
  },
  {
    id: 'pkg-003',
    name: 'Full Mouth Rehabilitation',
    description: 'Complete rehabilitation for patients with multiple dental issues.',
    price: 5000,
    originalPrice: 6500,
    treatments: [
      { 
        id: 'impl-multi', 
        name: 'Multiple Dental Implants (4)', 
        description: 'Four dental implants for stable foundation', 
        price: 3200, 
        quantity: 1,
        category: 'dental_implant_standard'
      },
      { 
        id: 'bridge-001', 
        name: 'Dental Bridge', 
        description: 'Fixed dental bridge for replacing missing teeth', 
        price: 1200, 
        quantity: 1,
        category: 'bridges'
      },
      { 
        id: 'perio-001', 
        name: 'Periodontal Treatment', 
        description: 'Comprehensive gum disease treatment', 
        price: 800, 
        quantity: 1,
        category: 'periodontal_treatment'
      },
      { 
        id: 'consult-003', 
        name: 'Comprehensive Consultation', 
        description: 'Detailed examination and treatment planning', 
        price: 200, 
        quantity: 1,
        category: 'consultation'
      }
    ]
  }
];

export function useTreatmentPackages() {
  const [packages, setPackages] = useState<TreatmentPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<TreatmentPackage | null>(null);
  const [packageSavings, setPackageSavings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch packages on component mount
  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/treatment-packages');
        // const data = await response.json();
        
        // Using sample data for now
        setTimeout(() => {
          setPackages(SAMPLE_PACKAGES);
          setIsLoading(false);
        }, 500); // Simulate API delay
      } catch (err) {
        setError('Failed to load treatment packages');
        setIsLoading(false);
      }
    };
    
    fetchPackages();
  }, []);

  // Calculate savings when a package is selected
  const selectPackage = (pkg: TreatmentPackage | null) => {
    setSelectedPackage(pkg);
    
    if (pkg) {
      // Calculate the savings compared to buying treatments individually
      const savings = pkg.originalPrice - pkg.price;
      setPackageSavings(savings);
    } else {
      setPackageSavings(0);
    }
  };

  return {
    packages,
    selectedPackage,
    selectPackage,
    packageSavings,
    isLoading,
    error
  };
}