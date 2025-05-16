import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useQuoteStore } from '../../stores/quoteStore';
import { TreatmentPackageSelector } from '../packages/TreatmentPackageSelector';
import { SpecialOffersSelector } from '../offers/SpecialOffersSelector';
// Fix import statement to match the export in QuoteSummary.tsx
import { QuoteSummary } from './QuoteSummary';
import { useToast } from '../../hooks/use-toast';

// Import the hooks for special offers and packages
import { useTreatmentPackages } from '../../hooks/use-treatment-packages';
import { useSpecialOffers } from '../../hooks/use-special-offers';

// Placeholder for dental chart - to be integrated
const DentalChart = ({ onSelectTooth }: { onSelectTooth: (toothData: any) => void }) => {
  // This is a placeholder for the actual dental chart component
  // In a real implementation, this would be a proper dental chart
  const teethNumbers = Array.from({ length: 32 }, (_, i) => i + 1);
  
  return (
    <div className="p-4 border rounded-md">
      <h3 className="font-medium mb-2">Dental Chart (Placeholder)</h3>
      <div className="grid grid-cols-8 gap-2">
        {teethNumbers.map(toothNumber => (
          <button
            key={toothNumber}
            className="p-2 bg-gray-100 hover:bg-blue-100 rounded text-sm"
            onClick={() => onSelectTooth({ 
              toothNumber, 
              position: toothNumber <= 16 ? 'upper' : 'lower',
              side: toothNumber % 16 <= 8 ? 'right' : 'left'
            })}
          >
            {toothNumber}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Click on a tooth to add a treatment for that specific tooth.
      </p>
    </div>
  );
};

// Placeholder for the patient info form - to be implemented
const PatientInfoForm = ({ 
  patientInfo, 
  onUpdate,
  onSubmit 
}: { 
  patientInfo: any;
  onUpdate: (info: any) => void;
  onSubmit: () => void;
}) => {
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">First Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={patientInfo?.firstName || ''}
            onChange={(e) => onUpdate({ ...patientInfo, firstName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Last Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md"
            value={patientInfo?.lastName || ''}
            onChange={(e) => onUpdate({ ...patientInfo, lastName: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full p-2 border rounded-md"
          value={patientInfo?.email || ''}
          onChange={(e) => onUpdate({ ...patientInfo, email: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Phone</label>
        <input
          type="tel"
          className="w-full p-2 border rounded-md"
          value={patientInfo?.phone || ''}
          onChange={(e) => onUpdate({ ...patientInfo, phone: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Preferred Date</label>
        <input
          type="date"
          className="w-full p-2 border rounded-md"
          value={patientInfo?.preferredDate || ''}
          onChange={(e) => onUpdate({ ...patientInfo, preferredDate: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          className="w-full p-2 border rounded-md"
          rows={3}
          value={patientInfo?.notes || ''}
          onChange={(e) => onUpdate({ ...patientInfo, notes: e.target.value })}
        />
      </div>
      <div className="pt-2">
        <Button type="submit">Submit Information</Button>
      </div>
    </form>
  );
};

export function ComprehensiveQuoteBuilder() {
  // Quote store state and actions
  const {
    treatments,
    addTreatment,
    removeTreatment,
    updateQuantity,
    subtotal,
    discount,
    total,
    discountPercentage,
    promoCode,
    applyPromoCode,
    clearPromoCode,
    patientInfo,
    updatePatientInfo,
    currentStep,
    setCurrentStep,
    saveQuote,
    selectPackage,
    selectedPackage,
    selectOffer,
    selectedOffer,
    error,
    success,
    loading
  } = useQuoteStore();

  // State for treatment packages and special offers
  const { 
    packages, 
    packageSavings,
    isLoading: isLoadingPackages 
  } = useTreatmentPackages();
  
  const { 
    offers, 
    offerDiscount,
    isLoading: isLoadingOffers 
  } = useSpecialOffers();

  // State for promo code input
  const [promoInput, setPromoInput] = useState('');
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('treatments');

  const { toast } = useToast();

  // Handle promo code submission
  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyPromoCode(promoInput);
      // We'll keep the input value so user can see what they entered
    }
  };

  // Handle save quote
  const handleSaveQuote = async () => {
    const success = await saveQuote({
      treatments,
      patientInfo,
      packageInfo: selectedPackage,
      offerInfo: selectedOffer,
      promoCode,
      subtotal,
      discount,
      total
    });

    if (success) {
      toast({
        title: "Quote Saved Successfully",
        description: "Your quote has been saved and can be accessed from your dashboard.",
        variant: "default",
      });
    } else {
      toast({
        title: "Error Saving Quote",
        description: "There was a problem saving your quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get the current step content
  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Tabs defaultValue="treatments" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="specialoffers">Special Offers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="treatments" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Select Treatments</h3>
                  <div className="space-y-2">
                    {/* Dental Chart */}
                    <Card>
                      <CardContent className="pt-4">
                        <DentalChart onSelectTooth={(toothData) => {
                          // Handle tooth selection and add treatment
                          addTreatment({
                            id: `tooth-${toothData.toothNumber}`,
                            name: `Treatment for Tooth ${toothData.toothNumber}`,
                            description: `Dental treatment for tooth ${toothData.toothNumber}`,
                            price: 150, // Default price
                            category: 'dental',
                            quantity: 1,
                            toothData
                          });
                        }} />
                      </CardContent>
                    </Card>
                    
                    {/* Regular treatment list */}
                    <Card>
                      <CardContent className="pt-4">
                        <h4 className="font-medium mb-2">Common Treatments</h4>
                        {/* List of common treatments */}
                        {[
                          { id: 't1', name: 'Dental Checkup', description: 'Basic dental examination', price: 50, category: 'preventive' },
                          { id: 't2', name: 'Teeth Cleaning', description: 'Professional teeth cleaning', price: 75, category: 'preventive' },
                          { id: 't3', name: 'X-Ray', description: 'Dental X-ray imaging', price: 120, category: 'diagnostic' },
                          { id: 't4', name: 'Filling', description: 'Dental filling procedure', price: 150, category: 'restorative' },
                          { id: 't5', name: 'Root Canal', description: 'Complete root canal therapy', price: 800, category: 'restorative' }
                        ].map(treatment => (
                          <div key={treatment.id} className="flex justify-between items-center p-2 border-b">
                            <div>
                              <p className="font-medium">{treatment.name}</p>
                              <p className="text-sm text-muted-foreground">£{treatment.price}</p>
                            </div>
                            <Button 
                              onClick={() => addTreatment(treatment)}
                              size="sm"
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Your Treatments</h3>
                  <Card>
                    <CardContent className="pt-4">
                      {treatments.length === 0 ? (
                        <p className="text-muted-foreground italic">No treatments selected</p>
                      ) : (
                        <div className="space-y-2">
                          {treatments.map(treatment => (
                            <div key={treatment.id} className="flex justify-between items-center p-2 border-b">
                              <div>
                                <p className="font-medium">{treatment.name}</p>
                                <p className="text-sm text-muted-foreground">£{treatment.price} each</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateQuantity(treatment.id, Math.max(1, treatment.quantity - 1))}
                                >
                                  -
                                </Button>
                                <span>{treatment.quantity}</span>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateQuantity(treatment.id, treatment.quantity + 1)}
                                >
                                  +
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => removeTreatment(treatment.id)}
                                  className="text-red-500"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Quote Summary */}
                  <QuoteSummary 
                    treatments={treatments}
                    subtotal={subtotal}
                    discount={discount}
                    total={total}
                    promoCode={promoCode}
                    discountPercentage={discountPercentage}
                    packageName={selectedPackage?.name}
                    packageSavings={packageSavings}
                    offerName={selectedOffer?.name}
                    offerDiscount={offerDiscount}
                    className="mt-4"
                  />
                  
                  {/* Promo Code Form */}
                  <Card className="mt-4">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Promo Code</h4>
                      {promoCode ? (
                        <div className="flex items-center justify-between">
                          <p>
                            Applied: <strong>{promoCode}</strong> ({discountPercentage}% off)
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => clearPromoCode()}
                            className="text-red-500"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handlePromoSubmit} className="flex space-x-2">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            placeholder="Enter promo code"
                            className="flex-1 px-3 py-2 border rounded-md"
                          />
                          <Button type="submit" disabled={loading.promoCode}>
                            {loading.promoCode ? 'Applying...' : 'Apply'}
                          </Button>
                        </form>
                      )}
                      {error.promoCode && (
                        <p className="text-red-500 text-sm mt-1">{error.promoCode}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="packages" className="space-y-4">
              <TreatmentPackageSelector 
                packages={packages}
                selectedPackageId={selectedPackage?.id}
                onSelectPackage={selectPackage}
                isLoading={isLoadingPackages}
              />
              
              {/* Show selected package details */}
              {selectedPackage && (
                <Card className="mt-4">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Selected Package: {selectedPackage.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{selectedPackage.description}</p>
                    <p className="font-medium">Savings: £{packageSavings}</p>
                    
                    {/* Show package treatments */}
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Included Treatments:</h5>
                      <ul className="list-disc list-inside">
                        {selectedPackage.treatments.map(treatment => (
                          <li key={treatment.id}>
                            {treatment.name} (£{treatment.price})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Quote Summary for the Package tab */}
              <QuoteSummary 
                treatments={treatments}
                subtotal={subtotal}
                discount={discount}
                total={total}
                promoCode={promoCode}
                discountPercentage={discountPercentage}
                packageName={selectedPackage?.name}
                packageSavings={packageSavings}
                offerName={selectedOffer?.name}
                offerDiscount={offerDiscount}
                className="mt-4"
              />
            </TabsContent>
            
            <TabsContent value="specialoffers" className="space-y-4">
              <SpecialOffersSelector 
                offers={offers}
                selectedOfferId={selectedOffer?.id}
                onSelectOffer={selectOffer}
                isLoading={isLoadingOffers}
              />
              
              {/* Show selected offer details */}
              {selectedOffer && (
                <Card className="mt-4">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Selected Offer: {selectedOffer.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{selectedOffer.description}</p>
                    <p className="font-medium">
                      Discount: {selectedOffer.discountType === 'percentage' 
                        ? `${selectedOffer.discountValue}%` 
                        : `£${selectedOffer.discountValue}`}
                    </p>
                    <p className="text-sm font-medium mt-2">
                      Promo Code: <span className="text-primary">{selectedOffer.promoCode}</span>
                    </p>
                    
                    {/* Apply offer button */}
                    <div className="mt-4">
                      <Button onClick={() => {
                        applyPromoCode(selectedOffer.promoCode);
                        setPromoInput(selectedOffer.promoCode);
                        setActiveTab('treatments');
                        toast({
                          title: "Promo Code Applied",
                          description: `${selectedOffer.promoCode} has been applied to your quote.`,
                        });
                      }}>
                        Apply Offer Discount
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Quote Summary for the Special Offers tab */}
              <QuoteSummary 
                treatments={treatments}
                subtotal={subtotal}
                discount={discount}
                total={total}
                promoCode={promoCode}
                discountPercentage={discountPercentage}
                packageName={selectedPackage?.name}
                packageSavings={packageSavings}
                offerName={selectedOffer?.name}
                offerDiscount={offerDiscount}
                className="mt-4"
              />
            </TabsContent>
          </Tabs>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Patient Information</h3>
            <PatientInfoForm 
              patientInfo={patientInfo} 
              onUpdate={updatePatientInfo}
              onSubmit={() => setCurrentStep(3)}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quote Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Patient Information</h4>
                  {patientInfo ? (
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {patientInfo.firstName} {patientInfo.lastName}</p>
                      <p><span className="font-medium">Email:</span> {patientInfo.email}</p>
                      <p><span className="font-medium">Phone:</span> {patientInfo.phone}</p>
                      <p><span className="font-medium">Preferred Date:</span> {patientInfo.preferredDate}</p>
                      {patientInfo.notes && (
                        <p><span className="font-medium">Notes:</span> {patientInfo.notes}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No patient information provided</p>
                  )}
                </CardContent>
              </Card>
              
              <QuoteSummary 
                treatments={treatments}
                subtotal={subtotal}
                discount={discount}
                total={total}
                promoCode={promoCode}
                discountPercentage={discountPercentage}
                packageName={selectedPackage?.name}
                packageSavings={packageSavings}
                offerName={selectedOffer?.name}
                offerDiscount={offerDiscount}
              />
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </Button>
              <Button 
                onClick={handleSaveQuote}
                disabled={loading.saveQuote}
              >
                {loading.saveQuote ? 'Saving...' : 'Save Quote'}
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Comprehensive Dental Quote Builder</h2>
        
        <div className="flex items-center space-x-4">
          {currentStep > 1 && currentStep < 3 && (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </Button>
          )}
          {currentStep < 3 && (
            <Button 
              onClick={() => {
                // For step 1, we need treatments
                if (currentStep === 1 && treatments.length === 0) {
                  toast({
                    title: "No Treatments Selected",
                    description: "Please select at least one treatment to proceed.",
                    variant: "destructive",
                  });
                  return;
                }
                
                // For step 2, we need patient info
                if (currentStep === 2 && (!patientInfo || !patientInfo.firstName)) {
                  toast({
                    title: "Patient Information Required",
                    description: "Please fill out the patient information form to proceed.",
                    variant: "destructive",
                  });
                  return;
                }
                
                setCurrentStep(currentStep + 1);
              }}
            >
              Next
            </Button>
          )}
        </div>
      </div>
      
      <div className="bg-card rounded-lg border p-6">
        {getCurrentStepContent()}
      </div>
    </div>
  );
}