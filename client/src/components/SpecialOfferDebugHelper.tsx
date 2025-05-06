import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export function SpecialOfferDebugHelper() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState<Record<string, any>>({});
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  
  // Get homepage offers to test with
  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ['/api/special-offers/homepage'],
    queryFn: async () => {
      const res = await fetch('/api/special-offers/homepage');
      return res.json();
    },
    refetchOnWindowFocus: false
  });
  
  // Check for existing treatment plans linked to this offer
  const { data: existingPlan, refetch: refetchExistingPlan } = useQuery({
    queryKey: ['/api/offers/existing-plan', selectedOffer],
    queryFn: async () => {
      if (!selectedOffer || !user) return null;
      try {
        const res = await fetch(`/api/offers/${selectedOffer}/last`);
        if (res.status === 404) return null;
        return res.json();
      } catch (error) {
        console.error("Error fetching existing plan:", error);
        return null;
      }
    },
    enabled: !!selectedOffer && !!user,
    retry: false
  });
  
  // Get session storage data
  const refreshSessionStorage = () => {
    const data: Record<string, any> = {};
    
    // Check for special offer related items
    const pendingOffer = sessionStorage.getItem('pendingSpecialOffer');
    const processingOffer = sessionStorage.getItem('processingSpecialOffer');
    const activeOffer = sessionStorage.getItem('activeSpecialOffer');
    
    if (pendingOffer) data.pendingSpecialOffer = JSON.parse(pendingOffer);
    if (processingOffer) data.processingSpecialOffer = processingOffer;
    if (activeOffer) data.activeSpecialOffer = JSON.parse(activeOffer);
    
    setSessionData(data);
  };
  
  // Refresh on mount and when user changes
  useEffect(() => {
    refreshSessionStorage();
  }, [user]);
  
  // Create a treatment plan from the selected offer
  const createTreatmentPlan = async () => {
    if (!selectedOffer || !user) {
      toast({
        title: "Cannot create treatment plan",
        description: "Please select an offer and ensure you are logged in",
        variant: "destructive"
      });
      return;
    }
    
    setIsTestRunning(true);
    
    try {
      // Find the clinic ID for the selected offer
      const offer = offers.find((o: any) => o.id === selectedOffer);
      if (!offer) throw new Error("Offer not found");
      
      const response = await apiRequest('POST', `/api/offers/${selectedOffer}/start`, {
        clinicId: offer.clinic_id,
        patientId: user.id,
        additionalNotes: "Created for testing special offer flow"
      });
      
      const result = await response.json();
      
      toast({
        title: "Treatment plan created",
        description: `Created plan ID: ${result.treatmentPlanId}`,
      });
      
      // Refresh the session storage display
      refreshSessionStorage();
      // Refresh existing plan query
      refetchExistingPlan();
      
    } catch (error) {
      console.error("Error creating treatment plan:", error);
      toast({
        title: "Failed to create treatment plan",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsTestRunning(false);
    }
  };
  
  // Clear all session storage data related to special offers
  const clearSessionStorage = () => {
    sessionStorage.removeItem('pendingSpecialOffer');
    sessionStorage.removeItem('processingSpecialOffer');
    sessionStorage.removeItem('activeSpecialOffer');
    
    toast({
      title: "Session storage cleared",
      description: "All special offer session data has been removed"
    });
    
    refreshSessionStorage();
  };
  
  // Test offer selection flow
  const testOfferSelection = async () => {
    if (!selectedOffer) {
      toast({
        title: "No offer selected",
        description: "Please select an offer to test with",
        variant: "destructive"
      });
      return;
    }
    
    setIsTestRunning(true);
    
    try {
      // Find the offer in the list
      const offer = offers.find((o: any) => o.id === selectedOffer);
      if (!offer) throw new Error("Offer not found");
      
      // Clear existing session storage first
      sessionStorage.removeItem('pendingSpecialOffer');
      sessionStorage.removeItem('processingSpecialOffer');
      sessionStorage.removeItem('activeSpecialOffer');
      
      // Create the standardized offer data
      const standardizedOfferData = {
        id: offer.id,
        title: offer.title,
        clinicId: offer.clinic_id,
        discountValue: offer.discount_value,
        discountType: offer.discount_type,
        applicableTreatment: offer.applicable_treatments?.[0] || 'Dental Implants'
      };
      
      // Store in session storage like the real flow
      if (user) {
        // User is logged in, simulate clicking on offer from homepage
        sessionStorage.setItem('activeSpecialOffer', JSON.stringify(standardizedOfferData));
        toast({
          title: "Simulated logged-in flow",
          description: "Offer saved to activeSpecialOffer in session storage"
        });
      } else {
        // User is not logged in, simulate clicking on offer when logged out
        sessionStorage.setItem('pendingSpecialOffer', JSON.stringify(standardizedOfferData));
        toast({
          title: "Simulated logged-out flow",
          description: "Offer saved to pendingSpecialOffer in session storage"
        });
      }
      
      refreshSessionStorage();
      
    } catch (error) {
      console.error("Error testing offer selection:", error);
      toast({
        title: "Test failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsTestRunning(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h2 className="text-lg font-semibold mb-4">Special Offer Test Helper</h2>
      
      <div className="space-y-4">
        {/* User Status */}
        <div className="bg-blue-50 p-3 rounded">
          <h3 className="font-medium mb-2">User Status</h3>
          {user ? (
            <div className="text-sm">
              <p><span className="font-medium">Logged in as:</span> {user.email}</p>
              <p><span className="font-medium">User ID:</span> {user.id}</p>
              <p><span className="font-medium">Role:</span> {user.role}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Not logged in. Some tests require authentication.
            </p>
          )}
        </div>
        
        {/* Offer Selection */}
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-medium mb-2">Step 1: Select an Offer</h3>
          {offersLoading ? (
            <p className="text-sm text-muted-foreground">Loading offers...</p>
          ) : offers && offers.length > 0 ? (
            <div className="space-y-2">
              <select 
                className="w-full p-2 border rounded"
                value={selectedOffer || ''}
                onChange={(e) => setSelectedOffer(e.target.value)}
              >
                <option value="">-- Select an offer --</option>
                {offers.map((offer: any) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.title} (Clinic: {offer.clinic_id})
                  </option>
                ))}
              </select>
              
              {selectedOffer && (
                <div className="bg-green-50 p-2 rounded text-sm">
                  <p className="font-medium">Selected: {offers.find((o: any) => o.id === selectedOffer)?.title}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No offers available</p>
          )}
        </div>
        
        {/* Session Storage Data */}
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Session Storage</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshSessionStorage}
            >
              Refresh
            </Button>
          </div>
          
          {Object.keys(sessionData).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(sessionData).map(([key, value]) => (
                <div key={key} className="bg-white p-2 rounded border text-sm">
                  <p className="font-medium">{key}:</p>
                  <pre className="text-xs overflow-auto max-h-20 bg-gray-50 p-1 rounded">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
              <Button
                variant="destructive"
                size="sm"
                onClick={clearSessionStorage}
              >
                Clear All Session Data
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No special offer data in session storage</p>
          )}
        </div>
        
        {/* Existing Plan Check */}
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-medium mb-2">Existing Treatment Plans</h3>
          {selectedOffer && user ? (
            existingPlan ? (
              <div className="bg-green-50 p-2 rounded text-sm">
                <p className="font-medium">Found existing plan:</p>
                <p>Plan ID: {existingPlan.treatmentPlanId}</p>
                <p>URL: {existingPlan.treatmentPlanUrl}</p>
                <a 
                  href={existingPlan.treatmentPlanUrl}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Plan
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No existing plan found for this offer and user</p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              Select an offer and log in to check for existing plans
            </p>
          )}
        </div>
        
        {/* Test Actions */}
        <div className="bg-gray-50 p-3 rounded">
          <h3 className="font-medium mb-3">Test Actions</h3>
          <div className="space-y-2">
            <Button
              onClick={testOfferSelection}
              disabled={!selectedOffer || isTestRunning}
              className="w-full"
            >
              Test Offer Selection Flow
            </Button>
            
            <Button
              onClick={createTreatmentPlan}
              disabled={!selectedOffer || !user || isTestRunning}
              className="w-full"
              variant="outline"
            >
              Create Treatment Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}