import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
import { Trash2, ExternalLink, Eye, ArrowDown } from 'lucide-react';

// Define types for saved special offers
interface SavedSpecialOffer {
  id: number;
  userId: number;
  specialOfferId: string;
  clinicId: number | null;
  offerDetails: any; // The full special offer data
  savedAt: string;
  viewed: boolean;
  status: 'active' | 'redeemed' | 'expired';
  redemptionDate?: string;
  notes?: string;
}

export default function SavedSpecialOffersSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [savedOffers, setSavedOffers] = useState<SavedSpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOffers, setExpandedOffers] = useState<number[]>([]);

  // Fetch saved special offers
  useEffect(() => {
    const fetchSavedOffers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/special-offers/saved');
        if (!response.ok) {
          throw new Error('Failed to fetch saved offers');
        }
        const data = await response.json();
        setSavedOffers(data.data || []);
      } catch (error) {
        console.error('Error fetching saved offers:', error);
        toast({
          title: "Error Loading Offers",
          description: "We couldn't load your saved special offers. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSavedOffers();
  }, [toast]);

  // Toggle offer expansion
  const toggleOfferExpansion = (offerId: number) => {
    setExpandedOffers(prev => 
      prev.includes(offerId)
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  // Mark offer as viewed
  const markOfferAsViewed = async (offerId: number) => {
    try {
      const response = await fetch(`/api/special-offers/saved/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ viewed: true }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark offer as viewed');
      }
      
      // Update local state
      setSavedOffers(prev => 
        prev.map(offer => 
          offer.id === offerId
            ? { ...offer, viewed: true }
            : offer
        )
      );
    } catch (error) {
      console.error('Error marking offer as viewed:', error);
    }
  };

  // Delete a saved offer
  const deleteSavedOffer = async (offerId: number) => {
    try {
      const response = await fetch(`/api/special-offers/saved/${offerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete saved offer');
      }
      
      // Remove from local state
      setSavedOffers(prev => prev.filter(offer => offer.id !== offerId));
      
      toast({
        title: "Offer Removed",
        description: "The special offer has been removed from your saved items.",
      });
    } catch (error) {
      console.error('Error deleting saved offer:', error);
      toast({
        title: "Error",
        description: "Failed to delete the offer. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Navigate to clinic or view offer details
  const viewClinicDetails = (clinicId: number) => {
    window.location.href = `/clinic/${clinicId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Function to save a test special offer
  const saveTestSpecialOffer = async () => {
    try {
      setLoading(true);
      const testOffer = {
        id: `test-offer-${Date.now()}`,
        clinic_id: "1",
        title: "Test Special Offer",
        description: "This is a test special offer to verify the saved offers functionality.",
        discount_type: "percentage",
        discount_value: 15,
        applicable_treatments: ["Dental Implants", "Crowns"],
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        promotion_level: "standard",
        terms_conditions: "Test terms and conditions. This offer is for testing purposes only.",
        clinic_name: "Test Dental Clinic",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Save the test offer using the API endpoint
      const response = await fetch('/api/special-offers/save-to-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          specialOfferId: testOffer.id,
          clinicId: parseInt(testOffer.clinic_id),
          offerDetails: testOffer,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Test Offer Saved",
          description: "A test special offer has been saved to your account.",
        });
        
        // Refresh the saved offers list
        const refreshResponse = await fetch('/api/special-offers/saved');
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setSavedOffers(data.data || []);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to save test offer: " + result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving test offer:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving the test offer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (savedOffers.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{t('portal.saved_offers.title', 'Your Saved Special Offers')}</CardTitle>
          <CardDescription>
            {t('portal.saved_offers.no_offers', 'You have no saved special offers yet.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">
              {t('portal.saved_offers.browse_message', 'Browse clinics and special offers to find deals that interest you.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Button 
                variant="default" 
                onClick={() => window.location.href = '/clinics'}
              >
                {t('portal.saved_offers.browse_clinics', 'Browse Clinics')}
              </Button>
              
              {/* Add test button - this would be hidden in production */}
              {process.env.NODE_ENV !== 'production' && (
                <Button 
                  variant="outline" 
                  onClick={saveTestSpecialOffer}
                >
                  Add Test Offer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {t('portal.saved_offers.title', 'Your Saved Special Offers')}
          </h2>
          <p className="text-gray-500">
            {t('portal.saved_offers.description', 'Special offers you\'ve saved for future reference.')}
          </p>
        </div>
        
        {/* Add test button when there are already offers - hidden in production */}
        {process.env.NODE_ENV !== 'production' && (
          <Button 
            variant="outline" 
            onClick={saveTestSpecialOffer}
            size="sm"
          >
            Add Test Offer
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {savedOffers.map((savedOffer) => {
          const offer = savedOffer.offerDetails;
          const isExpanded = expandedOffers.includes(savedOffer.id);
          
          // If this offer hasn't been viewed, mark it as viewed
          if (!savedOffer.viewed) {
            markOfferAsViewed(savedOffer.id);
          }
          
          return (
            <Card key={savedOffer.id} className={`overflow-hidden transition-all duration-300 ${!savedOffer.viewed ? 'border-blue-400 shadow-blue-100 shadow-md' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{offer.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Saved on {format(new Date(savedOffer.savedAt), 'MMMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant={savedOffer.status === 'active' ? 'default' : savedOffer.status === 'redeemed' ? 'success' : 'destructive'}>
                      {savedOffer.status.charAt(0).toUpperCase() + savedOffer.status.slice(1)}
                    </Badge>
                    {offer.promotion_level && (
                      <Badge variant={
                        offer.promotion_level === 'premium' ? 'default' : 
                        offer.promotion_level === 'featured' ? 'secondary' : 
                        'outline'
                      }>
                        {offer.promotion_level.charAt(0).toUpperCase() + offer.promotion_level.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-semibold">
                      {offer.discount_type === 'percentage' 
                        ? `${offer.discount_value}% off` 
                        : `£${offer.discount_value} off`}
                    </span>
                    {offer.applicable_treatments && offer.applicable_treatments.length > 0 && (
                      <span className="text-gray-600 text-sm ml-2">
                        on {offer.applicable_treatments.join(', ')}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {offer.end_date && (
                      <span>
                        Expires: {format(new Date(offer.end_date), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Expandable details */}
                {isExpanded && (
                  <div className="mt-3 space-y-3">
                    <Separator />
                    <p className="mt-2">{offer.description}</p>
                    
                    {offer.terms_conditions && (
                      <div className="mt-3">
                        <h4 className="font-semibold text-sm">Terms & Conditions</h4>
                        <p className="text-sm text-gray-600 mt-1">{offer.terms_conditions}</p>
                      </div>
                    )}
                    
                    {savedOffer.notes && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-md">
                        <h4 className="font-semibold text-sm">Your Notes</h4>
                        <p className="text-sm mt-1">{savedOffer.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleOfferExpansion(savedOffer.id)}
                >
                  {isExpanded ? "Show Less" : "Show More"} 
                  <ArrowDown className={`ml-2 h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
                
                <div className="flex space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteSavedOffer(savedOffer.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove from saved offers</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {savedOffer.clinicId && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => viewClinicDetails(savedOffer.clinicId!)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View clinic details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}