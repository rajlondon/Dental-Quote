import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/currency-formatter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { quoteService } from '@/services/quote-service';
import { emailService } from '@/services/email-service';
import MainLayout from '@/components/layout/MainLayout';
import PatientInfoDialog from '@/components/quotes/PatientInfoDialog';

// Define simple types
interface Treatment {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  savings: number;
  treatments: Treatment[];
}

interface SpecialOffer {
  id: number;
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

// Sample data
const SAMPLE_TREATMENTS: Treatment[] = [
  { id: 1, name: 'Dental Cleaning', price: 100, description: 'Professional teeth cleaning' },
  { id: 2, name: 'Teeth Whitening', price: 250, description: 'Professional whitening treatment' },
  { id: 3, name: 'Dental Filling', price: 150, description: 'Composite filling for cavities' },
  { id: 4, name: 'Root Canal', price: 800, description: 'Root canal therapy' },
  { id: 5, name: 'Dental Crown', price: 1200, description: 'Porcelain crown' },
];

const SAMPLE_PACKAGES: Package[] = [
  {
    id: 101,
    name: 'Smile Makeover Package',
    description: 'Complete smile transformation package',
    price: 1800,
    savings: 250,
    treatments: [SAMPLE_TREATMENTS[0], SAMPLE_TREATMENTS[1], SAMPLE_TREATMENTS[4]],
  },
  {
    id: 102,
    name: 'Basic Dental Care',
    description: 'Essential dental treatments',
    price: 220,
    savings: 30,
    treatments: [SAMPLE_TREATMENTS[0], SAMPLE_TREATMENTS[2]],
  },
  {
    id: 103,
    name: 'Advanced Restoration',
    description: 'Comprehensive dental restoration',
    price: 1850,
    savings: 300,
    treatments: [SAMPLE_TREATMENTS[2], SAMPLE_TREATMENTS[3], SAMPLE_TREATMENTS[4]],
  },
];

const SAMPLE_OFFERS: SpecialOffer[] = [
  {
    id: 201,
    title: 'Summer Special',
    description: 'Get 15% off your dental treatment',
    discountType: 'percentage',
    discountValue: 15,
  },
  {
    id: 202,
    title: 'New Patient Offer',
    description: 'Save $50 on your first treatment',
    discountType: 'fixed',
    discountValue: 50,
  },
  {
    id: 203,
    title: 'Family Discount',
    description: 'Get 20% off when booking for 3+ family members',
    discountType: 'percentage',
    discountValue: 20,
  },
];

// Promo codes
const VALID_PROMO_CODES: Record<string, { discountValue: number, discountType: 'percentage' | 'fixed' }> = {
  'NEWSMILE': { discountValue: 100, discountType: 'fixed' },
  'DENTAL25': { discountValue: 25, discountType: 'percentage' },
  'SUMMER2025': { discountValue: 15, discountType: 'percentage' },
};

export default function BasicQuoteDemo() {
  // Navigation hook
  const [, navigate] = useLocation();
  
  // Initialize component state
  const [quote, setQuote] = useState<QuoteState>({
    treatments: [],
    selectedPackage: null,
    appliedOffer: null,
    promoCode: null,
    promoDiscount: 0,
  });
  
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  
  // Patient form state
  const [patientInfo, setPatientInfo] = useState({ name: '', email: '' });
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let savings = 0;
    
    // Add treatments
    if (quote.selectedPackage) {
      subtotal += quote.selectedPackage.price;
      savings += quote.selectedPackage.savings;
    } else {
      quote.treatments.forEach(t => {
        subtotal += t.price;
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
    const total = subtotal - offerDiscount - promoDiscount;
    
    return {
      subtotal,
      savings,
      total
    };
  };
  
  const totals = calculateTotals();
  
  // Handlers
  const handleSelectTreatment = (treatment: Treatment) => {
    // If we have a package, remove it when selecting individual treatments
    if (quote.selectedPackage) {
      setQuote({
        ...quote,
        selectedPackage: null,
        treatments: [treatment]
      });
    } else {
      // Check if treatment is already selected
      const exists = quote.treatments.find(t => t.id === treatment.id);
      
      if (exists) {
        // Remove if already selected
        setQuote({
          ...quote,
          treatments: quote.treatments.filter(t => t.id !== treatment.id)
        });
      } else {
        // Add if not selected
        setQuote({
          ...quote,
          treatments: [...quote.treatments, treatment]
        });
      }
    }
  };
  
  const handleSelectPackage = (pkg: Package) => {
    setQuote({
      ...quote,
      selectedPackage: pkg,
      treatments: [] // Clear individual treatments when selecting a package
    });
  };
  
  const handleApplyOffer = (offer: SpecialOffer) => {
    setQuote({
      ...quote,
      appliedOffer: offer
    });
  };
  
  const handleApplyPromoCode = () => {
    setIsApplyingPromo(true);
    setPromoError('');
    
    // Simulate API delay
    setTimeout(() => {
      try {
        const promoCode = promoInput.trim().toUpperCase();
        
        if (!promoCode) {
          setPromoError('Please enter a promo code');
          return;
        }
        
        const promoInfo = VALID_PROMO_CODES[promoCode as keyof typeof VALID_PROMO_CODES];
        
        if (!promoInfo) {
          setPromoError('Invalid promo code');
          return;
        }
        
        // Calculate discount
        let discount = 0;
        if (promoInfo.discountType === 'percentage') {
          discount = totals.subtotal * (promoInfo.discountValue / 100);
        } else {
          discount = promoInfo.discountValue;
        }
        
        setQuote({
          ...quote,
          promoCode: promoCode,
          promoDiscount: discount
        });
        
        // Clear input
        setPromoInput('');
      } catch (error) {
        setPromoError('Error applying promo code');
        console.error('Promo code error:', error);
      } finally {
        setIsApplyingPromo(false);
      }
    }, 800); // Simulate network delay
  };
  
  const handleClearPromoCode = () => {
    setQuote({
      ...quote,
      promoCode: null,
      promoDiscount: 0
    });
    setPromoInput('');
    setPromoError('');
  };
  
  const handleReset = () => {
    setQuote({
      treatments: [],
      selectedPackage: null,
      appliedOffer: null,
      promoCode: null,
      promoDiscount: 0,
    });
    setPromoInput('');
    setPromoError('');
  };
  
  // Handle saving the quote
  const handleSaveQuote = async () => {
    if (!patientInfo.name || !patientInfo.email) {
      return;
    }
    
    setIsSaving(true);
    try {
      // Get current totals
      const { subtotal, savings, total } = calculateTotals();
      
      // Prepare quote data with quantity property for each treatment
      const treatmentsWithQuantity = quote.treatments.map(treatment => ({
        ...treatment,
        quantity: 1, // Default quantity for each treatment
        id: String(treatment.id) // Ensure ID is a string
      }));
      
      // Prepare the selected package with correct structure
      const formattedPackage = quote.selectedPackage ? {
        ...quote.selectedPackage,
        id: String(quote.selectedPackage.id),
        treatments: quote.selectedPackage.treatments.map(t => ({
          ...t,
          quantity: 1,
          id: String(t.id)
        }))
      } : null;
      
      // Prepare offer with correct structure
      const formattedOffer = quote.appliedOffer ? {
        ...quote.appliedOffer,
        id: String(quote.appliedOffer.id),
        clinicId: String(quote.appliedOffer.id), // Using ID as clinic ID for demo
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        discount: quote.appliedOffer.discountValue,
        discountType: quote.appliedOffer.discountType
      } : null;
      
      // Prepare quote data
      const quoteData = {
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        patientPhone: patientInfo.phone,
        treatments: treatmentsWithQuantity,
        selectedPackage: formattedPackage,
        appliedOffer: formattedOffer,
        promoCode: quote.promoCode,
        subtotal,
        savings,
        total
      };
      
      // Save quote to local storage
      const savedQuote = quoteService.saveQuote(quoteData);
      
      // Reset form
      setIsPatientDialogOpen(false);
      
      // Show success message
      toast({
        title: "Quote Saved Successfully",
        description: `Quote #${savedQuote.id} has been saved.`,
      });
      
      // Navigate to the quote detail page
      setTimeout(() => {
        navigate(`/quotes/${savedQuote.id}`);
      }, 1000);
    } catch (error) {
      console.error('Error saving quote:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your quote.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle sending the quote via email
  const handleSendEmail = async () => {
    if (!patientInfo.name || !patientInfo.email) {
      return;
    }
    
    setIsSendingEmail(true);
    try {
      // Get current totals
      const { subtotal, savings, total } = calculateTotals();
      
      // Prepare quote data
      const quoteData = {
        id: `temp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        treatments: quote.treatments,
        selectedPackage: quote.selectedPackage,
        appliedOffer: quote.appliedOffer,
        promoCode: quote.promoCode,
        subtotal,
        savings,
        total,
        status: 'pending' as const
      };
      
      // Send email
      await emailService.sendQuoteEmail(quoteData);
      
      // Reset form
      setShowPatientForm(false);
      
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Email Failed",
        description: "There was an error sending the email.",
        variant: "destructive", 
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dental Quote System Demo</h1>
        <p className="text-gray-600">
          Create a custom dental treatment quote with special offers and promo codes
        </p>
        
        {/* Direct promo code application section */}
        <div className="mt-4 p-4 border rounded-md bg-gray-50 max-w-xl">
          <h3 className="text-lg font-medium mb-2">Quick Promo Code Application</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Enter promo code (e.g., NEWSMILE)"
              className="flex-1 p-2 border rounded"
              disabled={!!quote.promoCode || isApplyingPromo}
            />
            {quote.promoCode ? (
              <Button onClick={handleClearPromoCode} variant="destructive">
                Remove Code
              </Button>
            ) : (
              <Button 
                onClick={handleApplyPromoCode} 
                disabled={isApplyingPromo || !promoInput.trim()} 
                variant="default"
              >
                {isApplyingPromo ? 'Applying...' : 'Apply'}
              </Button>
            )}
          </div>
          {promoError && (
            <p className="text-red-500 text-sm mt-2">{promoError}</p>
          )}
          {quote.promoCode && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700 text-sm">
                Promo code <span className="font-semibold">{quote.promoCode}</span> applied: {formatCurrency(quote.promoDiscount)} discount
              </p>
            </div>
          )}
          <div className="mt-2 text-xs text-gray-500">
            Try: NEWSMILE (£100 off), DENTAL25 (25% off), SUMMER2025 (15% off)
          </div>
        </div>
        
        <div className="mt-4">
          <Button onClick={handleReset} variant="outline">Reset Quote</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="treatments">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="treatments" className="flex-1">Treatments</TabsTrigger>
              <TabsTrigger value="packages" className="flex-1">Packages</TabsTrigger>
              <TabsTrigger value="offers" className="flex-1">Special Offers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="treatments" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Select Treatments</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SAMPLE_TREATMENTS.map((treatment) => (
                  <Card key={treatment.id} className={`p-4 cursor-pointer transition-colors ${
                    quote.treatments.some(t => t.id === treatment.id) ? 'border-2 border-blue-500 bg-blue-50' : ''
                  }`} onClick={() => handleSelectTreatment(treatment)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{treatment.name}</h3>
                        <p className="text-sm text-gray-600">{treatment.description}</p>
                      </div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(treatment.price)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="packages" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Treatment Packages</h2>
              <div className="grid grid-cols-1 gap-4">
                {SAMPLE_PACKAGES.map((pkg) => (
                  <Card key={pkg.id} className={`p-4 cursor-pointer transition-colors ${
                    quote.selectedPackage?.id === pkg.id ? 'border-2 border-blue-500 bg-blue-50' : ''
                  }`} onClick={() => handleSelectPackage(pkg)}>
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
            </TabsContent>
            
            <TabsContent value="offers" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Special Offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SAMPLE_OFFERS.map((offer) => (
                  <Card key={offer.id} className={`p-4 cursor-pointer transition-colors ${
                    quote.appliedOffer?.id === offer.id ? 'border-2 border-blue-500 bg-blue-50' : ''
                  }`} onClick={() => handleApplyOffer(offer)}>
                    <div>
                      <h3 className="font-medium">{offer.title}</h3>
                      <p className="text-sm text-gray-600">{offer.description}</p>
                    </div>
                    <div className="mt-2">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {offer.discountType === 'percentage' 
                          ? `${offer.discountValue}% off` 
                          : `${formatCurrency(offer.discountValue)} off`
                        }
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 p-4 border rounded-md">
                <h3 className="text-lg font-medium mb-2">Apply Promo Code</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 p-2 border rounded"
                    disabled={!!quote.promoCode || isApplyingPromo}
                  />
                  {quote.promoCode ? (
                    <Button onClick={handleClearPromoCode} variant="destructive">
                      Remove Code
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleApplyPromoCode} 
                      disabled={isApplyingPromo || !promoInput.trim()} 
                      variant="default"
                    >
                      {isApplyingPromo ? 'Applying...' : 'Apply'}
                    </Button>
                  )}
                </div>
                {promoError && (
                  <p className="text-red-500 text-sm mt-2">{promoError}</p>
                )}
                {quote.promoCode && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-700 text-sm">
                      Promo code <span className="font-semibold">{quote.promoCode}</span> applied successfully!
                    </p>
                  </div>
                )}
                <div className="mt-4 text-sm text-gray-500">
                  <p>Available codes for testing: NEWSMILE (£100 off), DENTAL25 (25% off), SUMMER2025 (15% off)</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="md:col-span-1">
          <Card className="sticky top-4">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Quote Summary</h2>
            </div>
            <div className="p-4">
              {quote.treatments.length === 0 && !quote.selectedPackage && (
                <div className="text-center py-6 text-gray-500">
                  <p>Select treatments or a package to create your quote</p>
                </div>
              )}
              
              {/* Display selected package */}
              {quote.selectedPackage && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Selected Package:</h3>
                  <div className="bg-blue-50 p-3 rounded border border-blue-100">
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
                        <span>{treatment.name}</span>
                        <span className="font-medium">{formatCurrency(treatment.price)}</span>
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
              
              {/* Show totals if something is selected */}
              {(quote.treatments.length > 0 || quote.selectedPackage) && (
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
              )}
              
              {/* Save and checkout buttons */}
              {(quote.treatments.length > 0 || quote.selectedPackage) && (
                <div className="mt-6 space-y-3">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setIsPatientDialogOpen(true)}
                  >
                    Save Quote
                  </Button>
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}