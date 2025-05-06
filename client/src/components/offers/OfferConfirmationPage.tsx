import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuoteFlow } from '@/contexts/QuoteFlowContext';
import { Sparkles, ArrowLeft, ArrowRight, Check, CheckCircle, Building2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Types
interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  clinicId: string;
  clinicName: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed_amount';
  imageUrl: string;
  validUntil?: string;
}

interface TreatmentPackage {
  id: string;
  title: string;
  description: string;
  clinicId: string;
  clinicName: string;
  priceGBP: number;
  priceUSD: number;
  imageUrl: string;
  treatments: string[];
}

interface OfferConfirmationPageProps {
  onConfirm: () => void;
  onBack: () => void;
}

const OfferConfirmationPage: React.FC<OfferConfirmationPageProps> = ({ onConfirm, onBack }) => {
  const { toast } = useToast();
  const {
    source,
    offerId,
    packageId,
    clinicId,
    isSpecialOfferFlow,
    isPackageFlow
  } = useQuoteFlow();

  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<SpecialOffer | null>(null);
  const [treatmentPackage, setTreatmentPackage] = useState<TreatmentPackage | null>(null);

  // Fetch the offer/package details when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (isSpecialOfferFlow && offerId) {
          // Fetch special offer details
          const response = await fetch(`/api/special-offers/${offerId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch special offer details');
          }
          
          const data = await response.json();
          setOffer(data);
        } 
        else if (isPackageFlow && packageId) {
          // Fetch package details
          const response = await fetch(`/api/packages/${packageId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch treatment package details');
          }
          
          const data = await response.json();
          setTreatmentPackage(data);
        }
      } catch (error) {
        console.error('Error fetching offer details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load offer details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isSpecialOfferFlow, isPackageFlow, offerId, packageId, toast]);

  const handleConfirm = () => {
    toast({
      title: 'Selection Confirmed',
      description: isSpecialOfferFlow 
        ? `Special offer "${offer?.title}" has been applied to your quote.` 
        : `Treatment package "${treatmentPackage?.title}" has been applied to your quote.`,
      variant: 'default',
    });
    onConfirm();
  };
  
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Display different content based on whether it's a special offer or package
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (isSpecialOfferFlow && offer) {
      return (
        <Card className="mb-6 border-2 border-primary/30">
          <CardHeader className="bg-primary/10">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary h-5 w-5" />
                  <CardTitle className="text-xl font-bold text-primary">Special Offer Selected</CardTitle>
                </div>
                <CardDescription>Please confirm this special offer to continue your quote</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary px-3 py-1">
                {offer.discountType === 'percentage' ? 
                  `${offer.discountValue}% OFF` : 
                  `${formatCurrency(offer.discountValue)} OFF`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <img 
                  src={offer.imageUrl} 
                  alt={offer.title} 
                  className="w-full h-48 object-cover rounded-md shadow-md mb-3" 
                />
                
                {offer.validUntil && (
                  <div className="flex items-center text-sm text-gray-600 mt-2">
                    <Clock className="h-4 w-4 mr-1 text-amber-500" />
                    <span>Offer expires: {offer.validUntil}</span>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold mb-2">{offer.title}</h3>
                <p className="text-gray-700 mb-4">{offer.description}</p>
                
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Building2 className="h-4 w-4 mr-1 text-blue-500" />
                  <span>Available at: <strong>{offer.clinicName}</strong></span>
                </div>
                
                <div className="bg-green-50 border border-green-100 rounded-md p-3 mt-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Next Steps</p>
                      <p className="text-sm text-green-700">
                        After confirming this offer, you'll continue with your quote and the special discount will be automatically applied.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleConfirm}>
              Confirm Selection
              <Check className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      );
    }

    if (isPackageFlow && treatmentPackage) {
      return (
        <Card className="mb-6 border-2 border-primary/30">
          <CardHeader className="bg-primary/10">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary h-5 w-5" />
                  <CardTitle className="text-xl font-bold text-primary">Treatment Package Selected</CardTitle>
                </div>
                <CardDescription>Please confirm this treatment package to continue your quote</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary px-3 py-1">
                {formatCurrency(treatmentPackage.priceGBP)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <img 
                  src={treatmentPackage.imageUrl} 
                  alt={treatmentPackage.title} 
                  className="w-full h-48 object-cover rounded-md shadow-md mb-3" 
                />
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold mb-2">{treatmentPackage.title}</h3>
                <p className="text-gray-700 mb-4">{treatmentPackage.description}</p>
                
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Building2 className="h-4 w-4 mr-1 text-blue-500" />
                  <span>Available at: <strong>{treatmentPackage.clinicName}</strong></span>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">Included Treatments</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {treatmentPackage.treatments.map((treatment, index) => (
                      <li key={index} className="flex items-center text-sm text-blue-700">
                        <Check className="h-4 w-4 mr-1 text-blue-500" /> 
                        {treatment}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-100 rounded-md p-3 mt-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Next Steps</p>
                      <p className="text-sm text-green-700">
                        After confirming this package, you'll continue with your quote and the treatments will be automatically added to your plan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleConfirm}>
              Confirm Selection
              <Check className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-2">No Special Offer or Package Selected</h3>
        <p className="text-gray-600 mb-4">
          This page is only relevant when you've selected a special offer or treatment package.
        </p>
        <Button onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Quote
        </Button>
      </div>
    );
  };

  return (
    <div className="mt-4">
      {renderContent()}
    </div>
  );
};

export default OfferConfirmationPage;