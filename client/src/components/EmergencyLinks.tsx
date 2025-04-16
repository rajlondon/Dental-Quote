import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Provides direct links to various portal pages for emergency access
 * This component bypasses the normal authentication flow
 */
const EmergencyLinks: React.FC = () => {
  return (
    <div className="container mx-auto my-8 max-w-4xl">
      <Card className="border-red-300 bg-red-50">
        <CardHeader className="bg-red-100 border-b border-red-200">
          <CardTitle className="text-red-700">Emergency Access Links</CardTitle>
          <CardDescription className="text-red-600">
            These links bypass the normal authentication flow. Use them for testing when normal login doesn't work.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Direct Portal Access</h3>
              <div className="space-y-2">
                <a href="/#/client-portal" className="block w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Client Portal
                  </Button>
                </a>
                <a href="/#/clinic-portal" className="block w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Clinic Portal
                  </Button>
                </a>
                <a href="/#/admin-portal" className="block w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Admin Portal
                  </Button>
                </a>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Direct Section Access</h3>
              <div className="space-y-2">
                <a href="/#/client-portal?section=messages&clinic=clinic_001" className="block w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Client Messages
                  </Button>
                </a>
                <a href="/#/client-portal?section=treatment-plan" className="block w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Treatment Plan
                  </Button>
                </a>
                <a href="/#/client-portal?section=comparison" className="block w-full">
                  <Button variant="outline" className="w-full justify-start">
                    Treatment Comparison
                  </Button>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-red-200">
            <h3 className="font-semibold mb-2">Direct Links (Copy and paste into address bar)</h3>
            <div className="space-y-2 text-sm font-mono bg-white p-2 rounded border">
              <div><code>/#/client-portal</code></div>
              <div><code>/#/clinic-portal</code></div>
              <div><code>/#/admin-portal</code></div>
              <div><code>/#/client-portal?section=messages&clinic=clinic_001</code></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyLinks;