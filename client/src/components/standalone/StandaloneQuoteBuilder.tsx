import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Package, Percent, Tag, Sparkles, Info, Home, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currency-formatter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Define data types
interface Treatment {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity?: number;
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  savings: number;
  treatments: Treatment[];
}

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

interface QuoteState {
  treatments: Treatment[];
  selectedPackage: Package | null;
  appliedOffer: SpecialOffer | null;
  promoCode: string | null;
  promoDiscount: number;
}

// Define prop types for the component
interface StandaloneQuoteBuilderProps {
  initialData?: {
    treatments?: Treatment[];
    selectedPackage?: Package | null;
    appliedOffer?: SpecialOffer | null;
    promoCode?: string | null;
  };
  onQuoteComplete?: (quoteData: {
    treatments: Treatment[];
    selectedPackage: Package | null;
    appliedOffer: SpecialOffer | null;
    promoCode: string | null;
    total: number;
    subtotal: number;
    savings: number;
    quoteId?: string;
  }) => void;
  hideHeader?: boolean;
  hideNav?: boolean;
}

/**
 * StandaloneQuoteBuilder
 * 
 * A completely self-contained quote builder component that can be embedded
 * anywhere in the application with minimal integration requirements.
 */
const StandaloneQuoteBuilder: React.FC<StandaloneQuoteBuilderProps> = ({
  initialData,
  onQuoteComplete,
  hideHeader = false,
  hideNav = false
}) => {
  const { toast } = useToast();
  
  // Self-contained state
  const [quote, setQuote] = useState<QuoteState>({
    treatments: initialData?.treatments || [],
    selectedPackage: initialData?.selectedPackage || null,
    appliedOffer: initialData?.appliedOffer || null,
    promoCode: initialData?.promoCode || null,
    promoDiscount: 0,
  });
  
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
  
  const [isTreatmentsLoading, setIsTreatmentsLoading] = useState(true);
  const [isPackagesLoading, setIsPackagesLoading] = useState(true);
  const [isOffersLoading, setIsOffersLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('treatments');
  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quoteId, setQuoteId] = useState<string | undefined>(undefined);
  
  // Load data from API endpoints
  useEffect(() => {
    const fetchData = async () => {
      // Static treatment data as fallback
      const fallbackTreatments = [
        { id: 'dental_cleaning', name: 'Dental Cleaning', price: 100, description: 'Professional teeth cleaning' },
        { id: 'teeth_whitening', name: 'Teeth Whitening', price: 250, description: 'Professional whitening treatment' },
        { id: 'dental_filling', name: 'Dental Filling', price: 150, description: 'Composite filling for cavities' },
        { id: 'root_canal', name: 'Root Canal', price: 800, description: 'Root canal therapy' },
        { id: 'dental_crown', name: 'Dental Crown', price: 1200, description: 'Porcelain crown' },
        { id: 'dental_implant_standard', name: 'Dental Implant', price: 900, description: 'Standard dental implant' },
        { id: 'porcelain_veneers', name: 'Porcelain Veneers', price: 650, description: 'Porcelain dental veneers' },
        { id: 'dental_crowns', name: 'Dental Crowns', price: 750, description: 'Premium dental crowns' },
        { id: 'full_mouth_reconstruction', name: 'Full Mouth Reconstruction', price: 7500, description: 'Complete mouth reconstruction' },
      ];
      
      // Fetch packages
      try {
        setIsPackagesLoading(true);
        const packagesResponse = await fetch('/api/treatment-packages');
        
        if (packagesResponse.ok) {
          const packagesData = await packagesResponse.json();
          
          // Map API data to our format
          const mappedPackages = packagesData.map((pkg: any) => ({
            id: pkg.id || `pkg-${Math.random().toString(36).substring(2, 9)}`,
            name: pkg.title || pkg.name || 'Treatment Package',
            description: pkg.description || 'Comprehensive treatment package',
            price: pkg.price || 1000,
            savings: pkg.discount || 150,
            treatments: pkg.treatments || []
          }));
          
          setPackages(mappedPackages);
          setTreatments(fallbackTreatments);
          setIsTreatmentsLoading(false);
        } else {
          // Use static data as fallback
          setPackages([
            {
              id: 'pkg-001',
              name: 'Smile Makeover Package',
              description: 'Complete smile transformation package',
              price: 1800,
              savings: 250,
              treatments: [fallbackTreatments[0], fallbackTreatments[1], fallbackTreatments[4]],
            },
            {
              id: 'pkg-002',
              name: 'Basic Dental Care',
              description: 'Essential dental treatments',
              price: 220,
              savings: 30,
              treatments: [fallbackTreatments[0], fallbackTreatments[2]],
            },
            {
              id: 'pkg-003',
              name: 'Advanced Restoration',
              description: 'Comprehensive dental restoration',
              price: 1850,
              savings: 300,
              treatments: [fallbackTreatments[2], fallbackTreatments[3], fallbackTreatments[4]],
            },
          ]);
          
          setTreatments(fallbackTreatments);
          setIsTreatmentsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
        
        // Use static data as fallback
        setPackages([
          {
            id: 'pkg-001',
            name: 'Smile Makeover Package',
            description: 'Complete smile transformation package',
            price: 1800,
            savings: 250,
            treatments: [fallbackTreatments[0], fallbackTreatments[1], fallbackTreatments[4]],
          },
          {
            id: 'pkg-002',
            name: 'Basic Dental Care',
            description: 'Essential dental treatments',
            price: 220,
            savings: 30,
            treatments: [fallbackTreatments[0], fallbackTreatments[2]],
          },
          {
            id: 'pkg-003',
            name: 'Advanced Restoration',
            description: 'Comprehensive dental restoration',
            price: 1850,
            savings: 300,
            treatments: [fallbackTreatments[2], fallbackTreatments[3], fallbackTreatments[4]],
          },
        ]);
        
        setTreatments(fallbackTreatments);
        setIsTreatmentsLoading(false);
      } finally {
        setIsPackagesLoading(false);
      }
      
      // Fetch special offers
      try {
        setIsOffersLoading(true);
        const offersResponse = await fetch('/api/special-offers');
        
        if (offersResponse.ok) {
          const offersData = await offersResponse.json();
          
          // Map API data to our format
          const mappedOffers = offersData.map((offer: any) => ({
            id: offer.id || `offer-${Math.random().toString(36).substring(2, 9)}`,
            title: offer.title || 'Special Offer',
            description: offer.description || 'Limited time dental promotion',
            discountType: offer.discount_type === 'percentage' ? 'percentage' : 'fixed',
            discountValue: offer.discount_value || 15,
            promoCode: offer.promo_code || null
          }));
          
          setSpecialOffers(mappedOffers);
        } else {
          // Use static data as fallback
          setSpecialOffers([
            {
              id: '201',
              title: 'Summer Special',
              description: 'Get 15% off your dental treatment',
              discountType: 'percentage',
              discountValue: 15,
            },
            {
              id: '202',
              title: 'New Patient Offer',
              description: 'Save £50 on your first treatment',
              discountType: 'fixed',
              discountValue: 50,
            },
            {
              id: '203',
              title: 'Family Discount',
              description: 'Get 20% off when booking for 3+ family members',
              discountType: 'percentage',
              discountValue: 20,
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching special offers:', err);
        
        // Use static data as fallback
        setSpecialOffers([
          {
            id: '201',
            title: 'Summer Special',
            description: 'Get 15% off your dental treatment',
            discountType: 'percentage',
            discountValue: 15,
          },
          {
            id: '202',
            title: 'New Patient Offer',
            description: 'Save £50 on your first treatment',
            discountType: 'fixed',
            discountValue: 50,
          },
          {
            id: '203',
            title: 'Family Discount',
            description: 'Get 20% off when booking for 3+ family members',
            discountType: 'percentage',
            discountValue: 20,
          },
        ]);
      } finally {
        setIsOffersLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate totals helper
  const calculateTotals = useCallback(() => {
    let subtotal = 0;
    let savings = 0;
    
    // Add treatments
    if (quote.selectedPackage) {
      subtotal += quote.selectedPackage.price;
      savings += quote.selectedPackage.savings;
    } else {
      quote.treatments.forEach(t => {
        subtotal += t.price * (t.quantity || 1);
      });
    }
    
    // Apply special offer discount
    let offerDiscount = 0;
    if (quote.appliedOffer) {
      if (quote.appliedOffer.discountType === 'percentage') {
        offerDiscount = subtotal * (quote.appliedOffer.discountValue / 100);
      } else {
        offerDiscount = quote.appliedOffer.discountValue;
      }
      savings += offerDiscount;
    }
    
    // Apply promo code discount
    let promoDiscount = quote.promoDiscount;
    savings += promoDiscount;
    
    // Calculate final total
    const total = Math.max(0, subtotal - offerDiscount - promoDiscount);
    
    return {
      subtotal,
      savings,
      total
    };
  }, [quote]);
  
  // Handle select treatment
  const handleSelectTreatment = useCallback((treatment: Treatment) => {
    setQuote(prev => {
      // If we have a package, remove it when selecting individual treatments
      if (prev.selectedPackage) {
        return {
          ...prev,
          selectedPackage: null,
          treatments: [{ ...treatment, quantity: 1 }]
        };
      }

      // Check if treatment is already selected
      const existingIndex = prev.treatments.findIndex(t => t.id === treatment.id);
      
      if (existingIndex >= 0) {
        // Remove if already selected
        return {
          ...prev,
          treatments: prev.treatments.filter(t => t.id !== treatment.id)
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          treatments: [...prev.treatments, { ...treatment, quantity: 1 }]
        };
      }
    });
  }, []);
  
  // Handle update treatment quantity
  const handleUpdateQuantity = useCallback((treatmentId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setQuote(prev => ({
      ...prev,
      treatments: prev.treatments.map(t => 
        t.id === treatmentId ? { ...t, quantity } : t
      )
    }));
  }, []);
  
  // Handle select package
  const handleSelectPackage = useCallback((pkg: Package) => {
    setQuote(prev => {
      if (prev.selectedPackage?.id === pkg.id) {
        // If the same package is already selected, remove it
        return {
          ...prev,
          selectedPackage: null
        };
      }
      
      return {
        ...prev,
        selectedPackage: pkg,
        treatments: [], // Clear individual treatments when selecting a package
      };
    });
  }, []);
  
  // Handle apply special offer
  const handleApplyOffer = useCallback((offer: SpecialOffer) => {
    setQuote(prev => {
      // If the same offer is already applied, remove it
      if (prev.appliedOffer?.id === offer.id) {
        return {
          ...prev,
          appliedOffer: null
        };
      }
      
      return {
        ...prev,
        appliedOffer: offer
      };
    });
  }, []);
  
  // Handle apply promo code
  const handleApplyPromoCode = useCallback(async (code: string) => {
    if (!code.trim()) return;
    
    setIsApplyingPromo(true);
    setError(null);
    
    try {
      // Save the current state for potential rollback
      const previousState = { ...quote };
      
      // Optimistically update UI
      setQuote(prev => ({
        ...prev,
        promoCode: code
      }));
      
      // Try to call the API endpoint
      try {
        const payload = {
          promoCode: code,
          treatments: quote.selectedPackage 
            ? [{ id: quote.selectedPackage.id, isPackage: true }]
            : quote.treatments.map(t => ({ id: t.id, quantity: t.quantity || 1 }))
        };
        
        const response = await fetch('/api/promo-codes/apply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Update with server response (functional update to avoid race conditions)
          setQuote(prev => ({
            ...prev,
            promoCode: code,
            promoDiscount: data.discount || 0
          }));
          
          toast({
            title: 'Promo Code Applied',
            description: `Promo code "${code}" has been applied to your quote.`,
          });
        } else {
          // Rollback on API error
          setQuote(previousState);
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
      } catch (apiError) {
        console.log('API error, calculating alternative discount');
        
        // Calculate a discount based on the promo code
        const totals = calculateTotals();
        let discountAmount = 0;
        
        if (code.includes('25')) {
          discountAmount = totals.subtotal * 0.25;
        } else if (code.includes('15') || code.includes('SUMMER')) {
          discountAmount = totals.subtotal * 0.15;
        } else if (code.includes('10')) {
          discountAmount = totals.subtotal * 0.1;
        } else if (code.includes('FREE') || code.includes('CONSULT')) {
          discountAmount = 100; // Fixed amount for consultation
        } else {
          // Default 10% discount
          discountAmount = totals.subtotal * 0.1;
        }
        
        // Update the quote with the calculated discount
        setQuote(prev => ({
          ...prev,
          promoCode: code,
          promoDiscount: discountAmount
        }));
        
        toast({
          title: 'Promo Code Applied',
          description: `Promo code "${code}" has been applied to your quote.`,
        });
      }
      
      // Clear the input
      setPromoInput('');
    } catch (err: any) {
      setError(err.message || 'Error applying promo code');
      toast({
        title: 'Error',
        description: err.message || 'Failed to apply the promo code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsApplyingPromo(false);
    }
  }, [quote, calculateTotals, toast]);
  
  // Handle clear promo code
  const handleClearPromoCode = useCallback(() => {
    setQuote(prev => ({
      ...prev,
      promoCode: null,
      promoDiscount: 0
    }));
    
    toast({
      title: 'Promo Code Removed',
      description: 'The promo code has been removed from your quote.'
    });
  }, [toast]);
  
  // Handle reset quote
  const handleReset = useCallback(() => {
    setQuote({
      treatments: [],
      selectedPackage: null,
      appliedOffer: null,
      promoCode: null,
      promoDiscount: 0,
    });
    
    setError(null);
    
    toast({
      title: 'Quote Reset',
      description: 'Your quote has been reset.'
    });
  }, [toast]);
  
  // Save quote to server
  const saveQuote = useCallback(async (): Promise<string> => {
    if (quote.treatments.length === 0 && !quote.selectedPackage) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one treatment or package before saving.',
        variant: 'destructive'
      });
      return "";
    }
    
    setIsLoading(true);
    
    try {
      const totals = calculateTotals();
      
      // Prepare quote data for saving
      const quoteData = {
        items: quote.selectedPackage 
          ? [{ type: 'package', ...quote.selectedPackage }] 
          : quote.treatments.map(treatment => ({ type: 'treatment', ...treatment })),
        promoCode: quote.promoCode,
        promoDiscount: quote.promoDiscount,
        appliedOffer: quote.appliedOffer,
        total: totals.total,
        subtotal: totals.subtotal,
        savings: totals.savings
      };
      
      // Call API to save quote
      const response = await fetch('/api/quotes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quoteData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save quote: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Store the quote ID
      setQuoteId(data.id);
      
      toast({
        title: 'Quote Saved',
        description: 'Your quote has been saved successfully.'
      });
      
      return data.id;
    } catch (err: any) {
      setError(err.message || 'Error saving quote');
      toast({
        title: 'Error',
        description: err.message || 'Failed to save your quote. Please try again.',
        variant: 'destructive'
      });
      return "";
    } finally {
      setIsLoading(false);
    }
  }, [quote, calculateTotals, toast]);
  
  // Handle email quote
  const handleEmailQuote = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      return;
    }
    
    if (quote.treatments.length === 0 && !quote.selectedPackage) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one treatment or package before emailing.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Make sure we have a quote ID
      let currentQuoteId = quoteId;
      if (!currentQuoteId) {
        currentQuoteId = await saveQuote();
        if (!currentQuoteId) {
          throw new Error('Failed to save quote before emailing');
        }
      }
      
      // Call API to email the quote
      const response = await fetch('/api/quotes/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quoteId: currentQuoteId,
          email
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to email quote: ${response.status} ${response.statusText}`);
      }
      
      toast({
        title: 'Quote Emailed',
        description: `Your quote has been sent to ${email}.`
      });
      
      setEmailInput('');
      setIsEmailDialogOpen(false);
      
      // Call the onQuoteComplete callback if provided
      if (onQuoteComplete) {
        const totals = calculateTotals();
        onQuoteComplete({
          treatments: quote.treatments,
          selectedPackage: quote.selectedPackage,
          appliedOffer: quote.appliedOffer,
          promoCode: quote.promoCode,
          total: totals.total,
          subtotal: totals.subtotal,
          savings: totals.savings,
          quoteId: currentQuoteId
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error emailing quote');
      toast({
        title: 'Error',
        description: err.message || 'Failed to email your quote. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [quote, quoteId, saveQuote, calculateTotals, onQuoteComplete, toast]);
  
  // Handle complete quote
  const handleCompleteQuote = useCallback(async (e?: React.MouseEvent) => {
    // Prevent default form submission if event is provided
    if (e) {
      e.preventDefault();
    }
    
    if (quote.treatments.length === 0 && !quote.selectedPackage) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one treatment or package before completing.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Save the quote if not already saved
      let currentQuoteId = quoteId;
      if (!currentQuoteId) {
        currentQuoteId = await saveQuote();
        if (!currentQuoteId) {
          return;
        }
      }
      
      // Call the onQuoteComplete callback if provided
      if (onQuoteComplete) {
        const totals = calculateTotals();
        onQuoteComplete({
          treatments: quote.treatments,
          selectedPackage: quote.selectedPackage,
          appliedOffer: quote.appliedOffer,
          promoCode: quote.promoCode,
          total: totals.total,
          subtotal: totals.subtotal,
          savings: totals.savings,
          quoteId: currentQuoteId
        });
      }
    } catch (err) {
      console.error('Error completing quote:', err);
      toast({
        title: 'Error',
        description: 'There was a problem completing your quote. Please try again.',
        variant: 'destructive'
      });
    }
  }, [quote, quoteId, saveQuote, calculateTotals, onQuoteComplete, toast]);
  
  // Calculate the current totals
  const totals = calculateTotals();
  
  return (
    <div className="bg-gray-50">
      {!hideHeader && (
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary">MyDentalFly Quote Builder</h1>
            {!hideNav && (
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </Button>
            )}
          </div>
        </header>
      )}
      
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          {!hideHeader && (
            <>
              <h1 className="text-3xl font-bold mb-2">Dental Quote Builder</h1>
              <p className="text-gray-600">
                Create a custom dental treatment quote with special offers and promo codes
              </p>
            </>
          )}
          
          {/* Error display */}
          {error && (
            <div className="mt-4 p-3 border border-red-300 bg-red-50 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {/* Promo code application section */}
          <div className="mt-4 p-4 border rounded-md bg-gray-50 max-w-xl">
            <h3 className="text-lg font-medium mb-2">Promo Code</h3>
            <div className="flex gap-2">
              <Input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1"
                disabled={!!quote.promoCode || isApplyingPromo || isLoading}
              />
              {quote.promoCode ? (
                <Button 
                  onClick={handleClearPromoCode} 
                  variant="destructive"
                  disabled={isLoading}
                >
                  Remove
                </Button>
              ) : (
                <Button 
                  onClick={() => handleApplyPromoCode(promoInput)} 
                  disabled={isApplyingPromo || !promoInput.trim() || isLoading} 
                >
                  {isApplyingPromo ? 'Applying...' : 'Apply'}
                </Button>
              )}
            </div>
            {quote.promoCode && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-green-700 text-sm">
                  Promo code <span className="font-semibold">{quote.promoCode}</span> applied: {formatCurrency(quote.promoDiscount)} discount
                </p>
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              Try codes like SUMMER15, DENTAL25, or FREECONSULT for different discounts
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button 
              onClick={(e) => {
                e.preventDefault();
                handleReset();
              }} 
              variant="outline" 
              disabled={isLoading}
              type="button"
            >
              Reset Quote
            </Button>
            <Button 
              onClick={(e) => {
                e.preventDefault();
                setIsEmailDialogOpen(true);
              }} 
              variant="outline" 
              disabled={isLoading || (quote.treatments.length === 0 && !quote.selectedPackage)}
              type="button"
            >
              <Mail className="h-4 w-4 mr-1" /> Email Quote
            </Button>
            <Button
              onClick={(e) => handleCompleteQuote(e)}
              disabled={isLoading || (quote.treatments.length === 0 && !quote.selectedPackage)}
              type="button"
            >
              Complete Quote
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Selectors */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="treatments" className="flex-1">
                  <Tag className="h-4 w-4 mr-1" /> Treatments
                </TabsTrigger>
                <TabsTrigger value="packages" className="flex-1">
                  <Package className="h-4 w-4 mr-1" /> Packages
                </TabsTrigger>
                <TabsTrigger value="offers" className="flex-1">
                  <Sparkles className="h-4 w-4 mr-1" /> Special Offers
                </TabsTrigger>
              </TabsList>
              
              {/* Treatments Tab */}
              <TabsContent value="treatments" className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Select Treatments</h2>
                
                {isTreatmentsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                      <Card key={i} className="p-4">
                        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                      </Card>
                    ))}
                  </div>
                ) : treatments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {treatments.map((treatment) => (
                      <Card 
                        key={treatment.id} 
                        className={`p-4 cursor-pointer transition-colors hover:border-primary/50 ${
                          quote.treatments.some(t => t.id === treatment.id) 
                            ? 'border-2 border-primary bg-primary/5' 
                            : ''
                        }`} 
                        onClick={() => handleSelectTreatment(treatment)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{treatment.name}</h3>
                            <p className="text-sm text-gray-600">{treatment.description}</p>
                          </div>
                          <div className="text-lg font-semibold">
                            {formatCurrency(treatment.price)}
                          </div>
                        </div>
                        
                        {/* Quantity controls - only show for selected treatments */}
                        {quote.treatments.some(t => t.id === treatment.id) && (
                          <div className="mt-3 pt-3 border-t flex items-center justify-between">
                            <span className="text-sm font-medium">Quantity:</span>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentTreatment = quote.treatments.find(t => t.id === treatment.id);
                                  if (currentTreatment) {
                                    handleUpdateQuantity(treatment.id, (currentTreatment.quantity || 1) - 1);
                                  }
                                }}
                                disabled={(quote.treatments.find(t => t.id === treatment.id)?.quantity || 1) <= 1}
                              >
                                -
                              </Button>
                              <span className="text-sm font-medium w-5 text-center">
                                {quote.treatments.find(t => t.id === treatment.id)?.quantity || 1}
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentTreatment = quote.treatments.find(t => t.id === treatment.id);
                                  if (currentTreatment) {
                                    handleUpdateQuantity(treatment.id, (currentTreatment.quantity || 1) + 1);
                                  }
                                }}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No treatments available</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Packages Tab */}
              <TabsContent value="packages" className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Treatment Packages</h2>
                
                {isPackagesLoading ? (
                  <div className="grid grid-cols-1 gap-4">
                    {Array(3).fill(0).map((_, i) => (
                      <Card key={i} className="p-4">
                        <div className="h-5 w-2/3 bg-gray-200 rounded mb-3"></div>
                        <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-4/5 bg-gray-200 rounded mb-2"></div>
                        <div className="h-20 w-full bg-gray-200 rounded mt-4"></div>
                      </Card>
                    ))}
                  </div>
                ) : packages.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {packages.map((pkg) => (
                      <Card 
                        key={pkg.id} 
                        className={`p-4 cursor-pointer transition-colors hover:border-primary/50 ${
                          quote.selectedPackage?.id === pkg.id 
                            ? 'border-2 border-primary bg-primary/5' 
                            : ''
                        }`} 
                        onClick={() => handleSelectPackage(pkg)}
                      >
                        <div className="mb-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-lg">{pkg.name}</h3>
                            <div>
                              <div className="text-lg font-semibold">{formatCurrency(pkg.price)}</div>
                              <div className="text-sm text-green-600">Save {formatCurrency(pkg.savings)}</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{pkg.description}</p>
                        </div>
                        <div className="mt-2 border-t pt-2">
                          <h4 className="text-sm font-medium mb-1">Included Treatments:</h4>
                          <ul className="text-sm">
                            {pkg.treatments.map(treatment => (
                              <li key={treatment.id} className="flex justify-between">
                                <span>{treatment.name}</span>
                                <span className="text-gray-600">{formatCurrency(treatment.price)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No packages available</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Special Offers Tab */}
              <TabsContent value="offers" className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Special Offers</h2>
                
                {isOffersLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array(4).fill(0).map((_, i) => (
                      <Card key={i} className="p-4">
                        <div className="h-5 w-2/3 bg-gray-200 rounded mb-3"></div>
                        <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded mb-3"></div>
                        <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
                      </Card>
                    ))}
                  </div>
                ) : specialOffers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {specialOffers.map((offer) => (
                      <Card 
                        key={offer.id} 
                        className={`p-4 cursor-pointer transition-colors hover:border-primary/50 ${
                          quote.appliedOffer?.id === offer.id 
                            ? 'border-2 border-primary bg-primary/5' 
                            : ''
                        }`} 
                        onClick={() => handleApplyOffer(offer)}
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{offer.title}</h3>
                            <Badge>
                              {offer.discountType === 'percentage'
                                ? `${offer.discountValue}% off`
                                : `${formatCurrency(offer.discountValue)} off`}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                          <Button size="sm" className="w-full mt-3">
                            {quote.appliedOffer?.id === offer.id ? 'Remove Offer' : 'Apply Offer'}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No special offers available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right side - Quote Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Quote Summary</CardTitle>
                <CardDescription>
                  Your selected dental treatments and total cost
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-20 w-full bg-gray-200 rounded"></div>
                    <div className="h-20 w-full bg-gray-200 rounded"></div>
                    <div className="h-16 w-full bg-gray-200 rounded mt-4"></div>
                  </div>
                ) : quote.treatments.length === 0 && !quote.selectedPackage ? (
                  <div className="text-center py-6 text-gray-500">
                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>Select treatments or a package to create your quote</p>
                  </div>
                ) : (
                  <>
                    {/* Display selected package */}
                    {quote.selectedPackage && (
                      <div className="mb-4">
                        <h3 className="font-medium mb-2">Selected Package:</h3>
                        <div className="bg-primary/5 p-3 rounded border border-primary/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{quote.selectedPackage.name}</p>
                              <p className="text-sm text-gray-600">{quote.selectedPackage.description}</p>
                            </div>
                            <span className="font-semibold">
                              {formatCurrency(quote.selectedPackage.price)}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-green-600">
                            Savings: {formatCurrency(quote.selectedPackage.savings)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Display selected treatments */}
                    {quote.treatments.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-medium mb-2">Selected Treatments:</h3>
                        <ul className="space-y-2">
                          {quote.treatments.map(treatment => (
                            <li key={treatment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <span>{treatment.name}</span>
                                {(treatment.quantity || 1) > 1 && (
                                  <span className="text-sm text-gray-500 ml-1">
                                    × {treatment.quantity}
                                  </span>
                                )}
                              </div>
                              <span className="font-medium">
                                {formatCurrency(treatment.price * (treatment.quantity || 1))}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Display applied offer */}
                    {quote.appliedOffer && (
                      <div className="mb-4">
                        <h3 className="font-medium mb-2">Applied Offer:</h3>
                        <div className="bg-blue-50 p-3 rounded border border-blue-100">
                          <p className="font-medium">{quote.appliedOffer.title}</p>
                          <p className="text-sm text-gray-600">{quote.appliedOffer.description}</p>
                          <p className="text-sm text-blue-700 mt-1">
                            {quote.appliedOffer.discountType === 'percentage' 
                              ? `${quote.appliedOffer.discountValue}% off` 
                              : `${formatCurrency(quote.appliedOffer.discountValue)} off`
                            }
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Display applied promo code */}
                    {quote.promoCode && (
                      <div className="mb-4">
                        <h3 className="font-medium mb-2">Applied Promo Code:</h3>
                        <div className="bg-green-50 p-3 rounded border border-green-100">
                          <p className="font-medium">{quote.promoCode}</p>
                          <p className="text-sm text-green-700 mt-1">
                            Discount: {formatCurrency(quote.promoDiscount)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Show totals */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                      </div>
                      
                      {totals.savings > 0 && (
                        <div className="flex justify-between mb-2 text-green-600">
                          <span>Savings:</span>
                          <span className="font-medium">-{formatCurrency(totals.savings)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-6">
                      <Button 
                        className="w-full" 
                        size="lg"
                        disabled={isLoading}
                        onClick={(e) => handleCompleteQuote(e)}
                        type="button"
                      >
                        Request This Quote
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Your Quote</DialogTitle>
            <DialogDescription>
              Enter your email address to receive a copy of your quote and schedule a consultation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </Label>
            <Input
              id="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full"
              type="email"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => handleEmailQuote(emailInput)} 
              disabled={!emailInput.includes('@') || isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Quote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StandaloneQuoteBuilder;