import { SpecialOfferDebugHelper } from "@/components/SpecialOfferDebugHelper";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function TestSpecialOffersPage() {
  const { toast } = useToast();
  const { user, loginMutation, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  // Handle quick login as test patient
  const loginAsTestPatient = async () => {
    if (user) {
      toast({
        title: "Already logged in",
        description: `Currently logged in as ${user.email}`,
      });
      return;
    }
    
    try {
      await loginMutation.mutateAsync({
        email: "patient@example.com",
        password: "password123"
      });
      
      toast({
        title: "Logged in as test patient",
        description: "You are now logged in as patient@example.com"
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You are not currently logged in",
      });
      return;
    }
    
    try {
      await logoutMutation.mutateAsync();
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully"
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Special Offers Test Page</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setLocation('/')}>
            Go to Homepage
          </Button>
          {user ? (
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button variant="default" onClick={loginAsTestPatient}>
              Login as Test Patient
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Special Offer Testing Instructions</h2>
            
            <div className="prose">
              <p>
                This page helps test and debug the special offers flow to ensure it works correctly
                from selection to conversion into a treatment plan.
              </p>
              
              <h3>The Special Offer Flow</h3>
              <ol>
                <li>
                  <strong>Select an offer on homepage</strong> - Either from carousel, card, or clinic page
                </li>
                <li>
                  <strong>Authentication check</strong> - If not logged in, redirect to login page
                </li>
                <li>
                  <strong>Create treatment plan</strong> - Convert offer to treatment plan with its properties
                </li>
                <li>
                  <strong>Save to patient portal</strong> - Make treatment plan accessible in patient dashboard
                </li>
              </ol>
              
              <h3>Common Issues</h3>
              <ul>
                <li>User has to re-enter details after logging in</li>
                <li>Special offer not showing in patient portal after selection</li>
                <li>Results page showing all clinics instead of specific offer</li>
                <li>Session state lost during login</li>
              </ul>
              
              <h3>Testing Tools</h3>
              <p>
                Use the test helper in the sidebar to test various aspects of the special offers flow.
                You can log in/out, select offers, create treatment plans, and inspect session storage.
              </p>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Test Special Offer Flow</h3>
              <p className="mb-4">Click the button below to test the complete flow from homepage:</p>
              
              <div className="flex space-x-4">
                <Button 
                  onClick={() => {
                    // Clear any existing session data
                    sessionStorage.removeItem('pendingSpecialOffer');
                    sessionStorage.removeItem('processingSpecialOffer');
                    sessionStorage.removeItem('activeSpecialOffer');
                    
                    // Redirect to homepage to start fresh
                    setLocation('/');
                    
                    toast({
                      title: "Test Started",
                      description: "Navigate to homepage and select a special offer"
                    });
                  }}
                >
                  Start Fresh Homepage Test
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Clear any existing session data
                    sessionStorage.removeItem('pendingSpecialOffer');
                    sessionStorage.removeItem('processingSpecialOffer');
                    sessionStorage.removeItem('activeSpecialOffer');
                    
                    // First logout if logged in
                    if (user) {
                      logoutMutation.mutate();
                    }
                    
                    // Redirect to homepage to start fresh
                    setTimeout(() => {
                      setLocation('/');
                      
                      toast({
                        title: "Logged Out Test Started",
                        description: "Navigate to homepage, select an offer, and test the login flow"
                      });
                    }, 500);
                  }}
                >
                  Test Logged-Out Flow
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-4">
          <SpecialOfferDebugHelper />
        </div>
      </div>
    </div>
  );
}