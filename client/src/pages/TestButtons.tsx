import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

/**
 * A component with direct login buttons for testing purposes
 */
const TestButtons: React.FC = () => {
  const { toast } = useToast();
  
  const goToClientPortal = () => {
    toast({
      title: "Client Test Login",
      description: "Logging in as a test client user...",
    });
    window.location.href = '/#/client-portal';
  };
  
  const goToAdminPortal = () => {
    toast({
      title: "Admin Test Login",
      description: "Logging in as a test admin user...",
    });
    window.location.href = '/#/admin-portal';
  };
  
  const goToClinicPortal = () => {
    toast({
      title: "Clinic Test Login",
      description: "Logging in as a test clinic user...",
    });
    window.location.href = '/#/clinic-portal';
  };
  
  const goToClientMessagesWithClinic = () => {
    const clinicId = localStorage.getItem('selectedClinicId') || 'clinic_001';
    toast({
      title: "Client Portal with Messages",
      description: `Going to messages with clinic ${clinicId}...`,
    });
    window.location.href = `/#/client-portal?section=messages&clinic=${clinicId}`;
  };
  
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Emergency Test Access</CardTitle>
        <CardDescription>
          These buttons will directly navigate to the portal pages, bypassing the normal login flow.
          Use them if the regular login is not working.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" onClick={goToClientPortal}>
            Go to Client Portal
          </Button>
          
          <Button variant="outline" onClick={goToAdminPortal}>
            Go to Admin Portal
          </Button>
          
          <Button variant="outline" onClick={goToClinicPortal}>
            Go to Clinic Portal
          </Button>
          
          <Button variant="default" onClick={goToClientMessagesWithClinic}>
            Go to Client Messages Section
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestButtons;