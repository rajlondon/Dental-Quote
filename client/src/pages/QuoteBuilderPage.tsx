import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import QuoteBuilder from '@/components/quotes/QuoteBuilder';
import { Treatment, Package, Addon } from '@/hooks/use-quote-builder';
import { Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export default function QuoteBuilderPage() {
  const [isReady, setIsReady] = useState(false);
  
  // Track page view
  useEffect(() => {
    trackEvent('view_quote_builder', 'page_view');
  }, []);
  
  // Query for available treatments
  const { data: treatments, isLoading: isLoadingTreatments } = useQuery<Treatment[]>({
    queryKey: ['/api/treatments'],
    enabled: isReady,
  });
  
  // Query for available packages
  const { data: packages, isLoading: isLoadingPackages } = useQuery<Package[]>({
    queryKey: ['/api/packages'],
    enabled: isReady,
  });
  
  // Query for available add-ons
  const { data: addons, isLoading: isLoadingAddons } = useQuery<Addon[]>({
    queryKey: ['/api/addons'],
    enabled: isReady,
  });
  
  useEffect(() => {
    // In a real implementation, we would check if we have the required data
    // loaded before enabling the queries. For now, we'll just enable them after a short delay.
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const isLoading = isLoadingTreatments || isLoadingPackages || isLoadingAddons || !isReady;
  
  // For testing/demo purposes, let's create some mock data
  // In a real implementation, this would come from the backend
  const mockTreatments: Treatment[] = [
    { 
      id: 'dental-implant-standard', 
      name: 'Dental Implant (Standard)', 
      price: 1200,
      description: 'Standard dental implant including titanium post and crown'
    },
    { 
      id: 'porcelain-veneers', 
      name: 'Porcelain Veneers', 
      price: 600,
      description: 'Premium porcelain veneers for a natural and beautiful smile' 
    },
    { 
      id: 'root-canal', 
      name: 'Root Canal Treatment', 
      price: 450,
      description: 'Root canal therapy including cleaning and filling of root canals'
    },
    { 
      id: 'dental-crowns', 
      name: 'Dental Crowns', 
      price: 550,
      description: 'High-quality dental crowns for damaged teeth'
    },
    { 
      id: 'teeth-whitening', 
      name: 'Professional Teeth Whitening', 
      price: 350,
      description: 'In-office professional teeth whitening treatment'
    }
  ];
  
  const mockPackages: Package[] = [
    {
      id: 'smile-makeover',
      name: 'Smile Makeover Package',
      price: 2200,
      treatments: ['porcelain-veneers', 'teeth-whitening'],
      description: 'Complete smile transformation with veneers and professional whitening'
    },
    {
      id: 'implant-package',
      name: 'Dental Implant Package',
      price: 1700,
      treatments: ['dental-implant-standard', 'dental-crowns'],
      description: 'Full implant solution including implant, abutment, and crown'
    },
    {
      id: 'full-mouth-restoration',
      name: 'Full Mouth Restoration',
      price: 5500,
      treatments: ['dental-implant-standard', 'root-canal', 'dental-crowns', 'teeth-whitening'],
      description: 'Comprehensive treatment for full mouth rehabilitation'
    }
  ];
  
  const mockAddons: Addon[] = [
    {
      id: 'sedation',
      name: 'Sedation Dentistry',
      price: 200,
      description: 'Advanced sedation options for anxiety-free treatment'
    },
    {
      id: 'premium-materials',
      name: 'Premium Materials Upgrade',
      price: 150,
      description: 'Upgrade to premium materials for enhanced durability and aesthetics'
    },
    {
      id: 'accommodation',
      name: 'Premium Accommodation',
      price: 400,
      description: '3 nights stay in a premium hotel near the clinic'
    },
    {
      id: 'airport-transfer',
      name: 'Airport Transfer',
      price: 100,
      description: 'Luxury airport transfer service to and from your accommodation'
    }
  ];
  
  const handleSaveQuote = (quoteId: string) => {
    console.log('Quote saved with ID:', quoteId);
    trackEvent('save_quote_success', 'quote', quoteId);
    // In a real implementation, we would redirect to the quote detail page
    // or show a success message
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold mb-2">Loading Quote Builder</h2>
        <p className="text-muted-foreground">Please wait while we prepare everything for you...</p>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <div className="container mx-auto mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dental Quote Builder</h1>
        <p className="text-muted-foreground mb-8">
          Create your personalized dental treatment plan and get an instant quote
        </p>
      </div>
      
      <QuoteBuilder
        availableTreatments={treatments || mockTreatments}
        availablePackages={packages || mockPackages}
        availableAddons={addons || mockAddons}
        onSave={handleSaveQuote}
      />
    </div>
  );
}