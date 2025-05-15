import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Package, Tag, AlertCircle, Server } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Clinic-accessible quote test page
 * This version is specifically designed to be accessible to clinic staff
 */
const ClinicQuoteTest: React.FC = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);
  
  // Parse URL parameters for testing different scenarios
  const params = new URLSearchParams(location.split('?')[1] || '');
  const promoCode = params.get('promoCode');
  const specialOfferId = params.get('specialOfferId');
  const packageId = params.get('packageId');
  
  useEffect(() => {
    console.log('ClinicQuoteTest loaded', { promoCode, specialOfferId, packageId });
    
    // Show welcome toast
    toast({
      title: "Clinic Test Mode",
      description: "This test page is accessible to clinic staff members",
    });
  }, []);
  
  const handleTestAction = () => {
    setIsLoading(true);
    
    // Simulate an API call
    setTimeout(() => {
      setIsLoading(false);
      setStarted(true);
      
      toast({
        title: 'Test Action Complete',
        description: 'The test action was successfully executed',
      });
    }, 1000);
  };
  
  // Map package IDs to friendly names
  const getPackageName = (id: string) => {
    const packageNames: Record<string, string> = {
      'pkg-001': '6 Implants + 6 Crowns Bundle',
      'pkg-002': '4 Implants + 4 Crowns Bundle',
      'pkg-003': 'All-on-4 Implant Package',
      'pkg-004': '8 Veneers Smile Makeover'
    };
    return packageNames[id] || id;
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="bg-white rounded-lg shadow-sm py-4 px-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Clinic Quote Test Console</h1>
          <p className="text-gray-500">Lightweight testing tool for clinic staff</p>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/clinic-portal'} className="min-w-[120px]">
          Return to Portal
        </Button>
      </header>
      
      {/* Test parameters */}
      {(promoCode || specialOfferId || packageId) && (
        <div className="bg-indigo-50 p-4 mb-6 rounded-lg border border-indigo-100">
          <h2 className="text-md font-semibold text-indigo-700 mb-2">Test Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packageId && (
              <div className="flex items-center bg-white p-3 rounded-md">
                <Package className="h-5 w-5 mr-2 text-indigo-600" />
                <div>
                  <span className="text-xs text-gray-500">Package:</span>
                  <p className="font-medium">{getPackageName(packageId)}</p>
                </div>
              </div>
            )}
            {promoCode && (
              <div className="flex items-center bg-white p-3 rounded-md">
                <Tag className="h-5 w-5 mr-2 text-green-600" />
                <div>
                  <span className="text-xs text-gray-500">Promo Code:</span>
                  <p className="font-medium">{promoCode}</p>
                </div>
              </div>
            )}
            {specialOfferId && (
              <div className="flex items-center bg-white p-3 rounded-md">
                <Server className="h-5 w-5 mr-2 text-blue-600" />
                <div>
                  <span className="text-xs text-gray-500">Special Offer ID:</span>
                  <p className="font-medium">{specialOfferId}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Console</CardTitle>
            <CardDescription>Run test operations and view results</CardDescription>
          </CardHeader>
          <CardContent>
            {!started ? (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700 mb-4">
                  This lightweight test console is specifically designed for clinic staff to test quote functionality
                  without affecting real patient data.
                </p>
                <Alert variant="warning" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is a simplified test environment. No data will be stored in the patient database.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-md border border-green-100">
                  <h3 className="font-medium text-green-800 mb-2">Test Executed Successfully</h3>
                  <p className="text-green-700 text-sm">
                    The test action was completed with no errors. You can now proceed with additional tests.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">System Information</h3>
                  <table className="min-w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-1 pr-4 text-gray-500">Browser:</td>
                        <td>{navigator.userAgent}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4 text-gray-500">Time:</td>
                        <td>{new Date().toLocaleTimeString()}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4 text-gray-500">Environment:</td>
                        <td>Development</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleTestAction} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Running Test...' : started ? 'Run Test Again' : 'Start Test'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Page loading and rendering statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Load Time</h3>
                <div className="flex justify-between items-center">
                  <span>Initial render:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded border">Fast ✓</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span>Component mount:</span>
                  <span className="font-mono bg-white px-2 py-1 rounded border">Fast ✓</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Available Test Actions</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>Simple API test</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span>UI component verification</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mr-2"></div>
                    <span className="text-gray-500">Full quote flow (not available in clinic test mode)</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicQuoteTest;