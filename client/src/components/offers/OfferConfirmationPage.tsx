import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuoteFlow } from '@/contexts/QuoteFlowContext';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Check, X } from 'lucide-react';

export default function OfferConfirmationPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [offer, setOffer] = useState<any>(null);
  const [package_, setPackage] = useState<any>(null);
  
  // Get offer and clinic info from context
  const { 
    source, 
    offerId, 
    packageId, 
    clinicId,
    resetFlow
  } = useQuoteFlow();
  
  // If no source, redirect to home page
  useEffect(() => {
    if (!source) {
      toast({
        title: 'No selection found',
        description: 'Please select a special offer or package first',
        variant: 'destructive'
      });
      setLocation('/');
      return;
    }
    
    // Load offer details
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        if (source === 'special_offer' && offerId) {
          // Fetch special offer details
          const response = await apiRequest('GET', `/api/special-offers/${offerId}`);
          const data = await response.json();
          if (data.success && data.offer) {
            setOffer(data.offer);
          } else {
            throw new Error('Failed to load special offer details');
          }
        } else if (source === 'package' && packageId) {
          // Fetch package details
          const response = await apiRequest('GET', `/api/packages/${packageId}`);
          const data = await response.json();
          if (data.success && data.package) {
            setPackage(data.package);
          } else {
            throw new Error('Failed to load package details');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load selection details',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [source, offerId, packageId, clinicId, setLocation, toast]);
  
  // Function to create treatment plan from offer or package
  const createTreatmentPlan = async () => {
    try {
      setIsLoading(true);
      
      let response;
      if (source === 'special_offer' && offerId) {
        // Create treatment plan from special offer
        response = await apiRequest(
          'POST',
          '/api/treatment-plans/from-offer',
          { offerId, clinicId, notes: 'Created from special offer confirmation' }
        );
      } else if (source === 'package' && packageId) {
        // Create treatment plan from package
        response = await apiRequest(
          'POST',
          '/api/treatment-plans/from-package',
          { packageId, clinicId, notes: 'Created from package confirmation' }
        );
      } else {
        throw new Error('Invalid selection type');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${errorText}`);
      }
      
      const data = await response.json();
      
      // Reset the context
      reset();
      
      toast({
        title: 'Success!',
        description: source === 'special_offer' 
          ? 'Special offer added to your treatment plan' 
          : 'Treatment package added to your treatment plan',
        variant: 'default'
      });
      
      // Redirect to the treatment plan page
      if (data.planId) {
        setLocation(`/portal/patient/treatment-plan/${data.planId}`);
      } else if (data.quoteId) {
        setLocation(`/portal/quote/${data.quoteId}/review`);
      } else {
        // Fallback to patient portal
        setLocation('/portal/patient');
      }
    } catch (error) {
      console.error('Error creating treatment plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create treatment plan',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle cancellation
  const handleCancel = () => {
    reset();
    setLocation('/');
  };
  
  if (isLoading && !offer && !package_) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold">Loading your selection...</h2>
      </div>
    );
  }
  
  const selectedItem = offer || package_;
  
  if (!selectedItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <X className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">No selection found</h2>
        <p className="text-muted-foreground mb-6">There was a problem loading your selection</p>
        <Button onClick={() => setLocation('/')}>Return to Homepage</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => setLocation('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
      
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Confirm Your Selection</CardTitle>
          <CardDescription>
            {source === 'special_offer' 
              ? 'Review the special offer details before proceeding'
              : 'Review the treatment package details before proceeding'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-primary">
                {selectedItem.title}
              </h3>
              <p className="text-muted-foreground mt-1">
                {selectedItem.description || 'No description available'}
              </p>
            </div>
            
            {source === 'special_offer' && offer?.discount_value && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-medium">Special Offer Discount</h4>
                <p className="text-lg font-bold">
                  {offer.discount_type === 'percentage' 
                    ? `${offer.discount_value}% OFF` 
                    : `$${offer.discount_value} OFF`}
                </p>
                {offer.end_date && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Offer valid until {new Date(offer.end_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
            
            {source === 'package' && package_?.basePrice && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-medium">Package Price</h4>
                <p className="text-lg font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: package_.currency || 'USD'
                  }).format(package_.basePrice)}
                </p>
                {package_.category && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Category: {package_.category}
                  </p>
                )}
              </div>
            )}
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">What happens next?</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>
                    Your {source === 'special_offer' ? 'special offer' : 'treatment package'} will be added to your personal treatment plan
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>
                    You'll be able to view and manage your treatment plan in your patient portal
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>
                    Your selected clinic will be notified and may contact you to confirm details
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex-col sm:flex-row gap-3">
          <Button
            variant="default"
            className="w-full sm:w-auto"
            onClick={createTreatmentPlan}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Selection
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}