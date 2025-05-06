import { useState } from "react";
import { useNavigate } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface PackageCardProps {
  package: {
    id: string;
    title: string;
    description?: string;
    image?: string;
    clinicId: string;
    clinicName?: string;
    basePrice?: number;
    currency?: string;
    category?: string;
  }
}

/**
 * PackageCard component that follows MVP spec
 * 
 * Same as OfferCard but payload packageId not offerId.
 * Draft Quote contains packageLine (non-removable) + required base treatments.
 * Redirect ⇒ /portal/quote/:quoteId/review.
 */
export function PackageCard({ package: pkg }: PackageCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Background image style with fallback
  const backgroundImage = pkg.image 
    ? `url(${pkg.image})`
    : 'linear-gradient(to right, #0f172a, #1e293b)';
  
  // Format the price
  const formatPrice = () => {
    if (!pkg.basePrice) return null;
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pkg.currency || 'USD',
    });
    
    return formatter.format(pkg.basePrice);
  };
  
  const handlePackageClick = async () => {
    try {
      setIsProcessing(true);
      
      // If user is not logged in, redirect to login page with package info
      if (!user) {
        // Save the package ID to session storage to retrieve after login
        sessionStorage.setItem('pendingPackage', JSON.stringify(pkg));
        sessionStorage.setItem('processingPackage', pkg.id);
        
        // Redirect to login page
        navigate('/portal-login');
        return;
      }
      
      // User is logged in, we can directly create a quote from the package
      await createQuoteFromPackage(pkg.id, pkg.clinicId);
      
    } catch (error) {
      console.error('Error processing treatment package:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process package",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  // Function to create a quote from a package via the API
  const createQuoteFromPackage = async (packageId: string, clinicId: string) => {
    try {
      const response = await apiRequest(
        'POST', 
        `/api/v1/packages/${packageId}/start`,
        { clinicId }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create quote from package');
      }
      
      const data = await response.json();
      
      // Check if we have a quote ID and URL to redirect to
      if (data.quoteId && data.quoteUrl) {
        toast({
          title: "Success",
          description: "Treatment package applied to your quote"
        });
        
        // Clear processing state from session storage
        sessionStorage.removeItem('processingPackage');
        
        // Redirect to the quote review page
        navigate(data.quoteUrl);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating quote from package:', error);
      setIsProcessing(false);
      throw error;
    }
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
      <div 
        className="h-40 bg-cover bg-center" 
        style={{ backgroundImage }}
        aria-hidden="true"
      />
      
      <CardHeader className="relative pb-2">
        {formatPrice() && (
          <Badge 
            className="absolute -top-5 right-4 bg-primary text-white font-bold"
            variant="default"
          >
            {formatPrice()}
          </Badge>
        )}
        <CardTitle className="text-xl">{pkg.title}</CardTitle>
        {pkg.clinicName && (
          <CardDescription>
            {pkg.clinicName}
          </CardDescription>
        )}
        {pkg.category && (
          <Badge variant="outline" className="mt-1">
            {pkg.category}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600">
          {pkg.description || "Complete treatment package that includes all necessary procedures."}
        </p>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handlePackageClick}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Processing
            </>
          ) : (
            "Get This Package"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}