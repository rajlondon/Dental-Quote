import React, { useState, useEffect } from 'react';
import { QuoteProvider, useQuote } from '../contexts/QuoteContext';
import { QuoteSummary } from '../components/QuoteSummary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Sample treatments for testing
const sampleTreatments = [
  { id: 'dental-implants', name: 'Dental Implants', price: 650 },
  { id: 'veneers', name: 'Veneers', price: 300 },
  { id: 'crowns', name: 'Crowns', price: 200 },
  { id: 'whitening', name: 'Teeth Whitening', price: 150 },
  { id: 'cleaning', name: 'Dental Cleaning', price: 80 },
];

export default function PromoTestPage() {
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Handler for adding/removing treatments
  const toggleTreatment = (id: string) => {
    setSelectedTreatments(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id) 
        : [...prev, id]
    );
  };
  
  // Get the currently selected treatment objects
  const selectedTreatmentObjects = sampleTreatments.filter(t => 
    selectedTreatments.includes(t.id)
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Promo Code Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Treatments</CardTitle>
              <CardDescription>
                Select treatments to add to your quote
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {sampleTreatments.map(treatment => (
                  <div 
                    key={treatment.id}
                    className={`p-4 border rounded-lg flex justify-between items-center cursor-pointer transition-colors ${
                      selectedTreatments.includes(treatment.id) 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleTreatment(treatment.id)}
                  >
                    <div>
                      <h3 className="font-medium">{treatment.name}</h3>
                      <p className="text-sm text-gray-500">Treatment ID: {treatment.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {new Intl.NumberFormat('en-GB', { 
                          style: 'currency', 
                          currency: 'GBP' 
                        }).format(treatment.price)}
                      </span>
                      <div 
                        className={`w-6 h-6 flex items-center justify-center rounded-full border ${
                          selectedTreatments.includes(treatment.id) 
                            ? 'bg-primary text-white border-primary' 
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedTreatments.includes(treatment.id) && (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Selected: {selectedTreatments.length} treatments
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Sample Promo Codes",
                    description: "Try these codes: TEST50 (50% off) or SAVE100 (£100 off)",
                  });
                }}
              >
                Show Sample Promo Codes
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <QuoteProvider>
            <PromoCodeTester treatments={selectedTreatmentObjects} />
          </QuoteProvider>
        </div>
      </div>
    </div>
  );
}

// Helper component to connect test page with QuoteContext
function PromoCodeTester({ treatments }: { treatments: Array<{ id: string; name: string; price: number }> }) {
  const quoteContext = useQuote();
  
  // Add selected treatments to the quote context
  useEffect(() => {
    // Safely access the context methods
    if (quoteContext) {
      const { addTreatment, removeTreatment, treatments: contextTreatments } = quoteContext;
      
      // Check if the treatments have actually changed before updating
      const currentIds = contextTreatments.map(t => t.id).sort().join(',');
      const newIds = treatments.map(t => t.id).sort().join(',');
      
      // Only update if the selection has changed to prevent flickering
      if (currentIds !== newIds) {
        // First remove all existing treatments
        if (contextTreatments && contextTreatments.length > 0) {
          // Create a copy of the array to avoid mutation during iteration
          const treatmentsToRemove = [...contextTreatments];
          treatmentsToRemove.forEach(treatment => {
            if (treatment && treatment.id) {
              removeTreatment(treatment.id);
            }
          });
        }
        
        // Then add the new selected treatments
        treatments.forEach(treatment => {
          addTreatment(treatment);
        });
      }
    }
  }, [treatments, quoteContext]);
  
  return <QuoteSummary />;
}