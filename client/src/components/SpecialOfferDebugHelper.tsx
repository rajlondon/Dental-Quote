import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Cross2Icon, ReloadIcon } from "@radix-ui/react-icons";

export function SpecialOfferDebugHelper() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [pendingOffer, setPendingOffer] = useState<any>(null);
  const [processingOffer, setProcessingOffer] = useState<string | null>(null);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [offerError, setOfferError] = useState<string | null>(null);
  
  // Keep track of saved offers in localStorage
  const [persistentOffer, setPersistentOffer] = useState<any>(null);
  
  // Mock data for testing
  const testOffers = [
    { 
      id: "offer1", 
      title: "Free Consultation Package", 
      clinicId: "1",
      discountValue: 100,
      discountType: "percentage",
      applicableTreatment: "Dental Implants"
    },
    { 
      id: "offer2", 
      title: "Premium Hotel Deal", 
      clinicId: "2",
      discountValue: 200,
      discountType: "fixed",
      applicableTreatment: "Veneers"
    },
    { 
      id: "offer3", 
      title: "Dental Implant + Crown Bundle", 
      clinicId: "3",
      discountValue: 15,
      discountType: "percentage",
      applicableTreatment: "Dental Implants"
    }
  ];
  
  // Refresh storage state
  const refreshState = () => {
    try {
      const pendingData = sessionStorage.getItem('pendingSpecialOffer');
      const processingData = sessionStorage.getItem('processingSpecialOffer');
      const activeData = sessionStorage.getItem('activeSpecialOffer');
      const persistentData = localStorage.getItem('pendingSpecialOfferAfterVerification');
      
      setPendingOffer(pendingData ? JSON.parse(pendingData) : null);
      setProcessingOffer(processingData);
      setActiveOffer(activeData ? JSON.parse(activeData) : null);
      setPersistentOffer(persistentData ? JSON.parse(persistentData) : null);
      
      setOfferError(null);
    } catch (error) {
      console.error("Error parsing storage data:", error);
      setOfferError(`Error parsing storage: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Initialize on mount
  useEffect(() => {
    refreshState();
    
    // Add storage event listener to update when storage changes
    const handleStorageChange = () => refreshState();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Manually set a test offer
  const setTestOffer = (offer: any) => {
    try {
      sessionStorage.setItem('pendingSpecialOffer', JSON.stringify(offer));
      toast({
        title: "Test Offer Set",
        description: `Set pending offer: ${offer.title}`
      });
      refreshState();
    } catch (error) {
      toast({
        title: "Error Setting Offer",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };
  
  // Clear all offer data
  const clearAllOffers = () => {
    sessionStorage.removeItem('pendingSpecialOffer');
    sessionStorage.removeItem('processingSpecialOffer');
    sessionStorage.removeItem('activeSpecialOffer');
    localStorage.removeItem('pendingSpecialOfferAfterVerification');
    
    toast({
      title: "All Offers Cleared",
      description: "Cleared all special offer data from storage"
    });
    
    refreshState();
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Special Offer Debugger</span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={refreshState}
            title="Refresh"
          >
            <ReloadIcon className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Inspect and manipulate special offer flow data
        </CardDescription>
        {user && (
          <Badge variant="outline" className="mt-2">
            Logged in as: {user.email}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {offerError && (
          <div className="bg-red-50 p-3 rounded-md text-red-800 text-sm">
            {offerError}
          </div>
        )}
        
        <div className="space-y-2">
          <Label>Session Storage State</Label>
          <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
            <p>
              <span className="font-semibold">pendingSpecialOffer:</span> 
              {pendingOffer ? (
                <span className="ml-1 text-green-700">Present</span>
              ) : (
                <span className="ml-1 text-gray-500">None</span>
              )}
            </p>
            <p>
              <span className="font-semibold">processingSpecialOffer:</span> 
              {processingOffer ? (
                <span className="ml-1 text-green-700">{processingOffer}</span>
              ) : (
                <span className="ml-1 text-gray-500">None</span>
              )}
            </p>
            <p>
              <span className="font-semibold">activeSpecialOffer:</span> 
              {activeOffer ? (
                <span className="ml-1 text-green-700">Present</span>
              ) : (
                <span className="ml-1 text-gray-500">None</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Local Storage State (Persists)</Label>
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <p>
              <span className="font-semibold">pendingSpecialOfferAfterVerification:</span> 
              {persistentOffer ? (
                <span className="ml-1 text-green-700">Present</span>
              ) : (
                <span className="ml-1 text-gray-500">None</span>
              )}
            </p>
          </div>
        </div>
        
        {(pendingOffer || activeOffer || persistentOffer) && (
          <div className="space-y-2">
            <Label>Current Offer Details</Label>
            <div className="bg-gray-50 p-3 rounded-md text-sm space-y-2">
              {pendingOffer && (
                <div>
                  <p className="font-semibold text-blue-700">Pending Offer:</p>
                  <pre className="overflow-x-auto text-xs p-2 bg-gray-100 rounded mt-1">
                    {JSON.stringify(pendingOffer, null, 2)}
                  </pre>
                </div>
              )}
              
              {activeOffer && (
                <div>
                  <p className="font-semibold text-green-700">Active Offer:</p>
                  <pre className="overflow-x-auto text-xs p-2 bg-gray-100 rounded mt-1">
                    {JSON.stringify(activeOffer, null, 2)}
                  </pre>
                </div>
              )}
              
              {persistentOffer && (
                <div>
                  <p className="font-semibold text-purple-700">Persistent Offer:</p>
                  <pre className="overflow-x-auto text-xs p-2 bg-gray-100 rounded mt-1">
                    {JSON.stringify(persistentOffer, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
        
        <Separator />
        
        <div className="space-y-2">
          <Label>Test Actions</Label>
          <div className="grid grid-cols-1 gap-2">
            {testOffers.map((offer) => (
              <Button 
                key={offer.id}
                variant="outline"
                size="sm"
                onClick={() => setTestOffer(offer)}
                className="justify-start"
              >
                <span className="truncate">{offer.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="destructive" 
          size="sm"
          onClick={clearAllOffers}
          className="flex items-center"
        >
          <Cross2Icon className="mr-1 h-4 w-4" />
          Clear All Offer Data
        </Button>
        
        <Button 
          variant="default" 
          size="sm"
          onClick={refreshState}
        >
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
}