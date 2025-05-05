import React, { useEffect, useState } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import clinicsData from '@/data/clinics.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, ArrowLeft, Check, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ClinicDebugPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/clinic-debug/:id?');
  const [clinicId, setClinicId] = useState<string>(params?.id || '');
  const [clinicData, setClinicData] = useState<any>(null);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'valid' | 'invalid'>('pending');
  const [directLinkActive, setDirectLinkActive] = useState(false);

  // Load clinic data when ID changes
  useEffect(() => {
    if (params?.id) {
      setClinicId(params.id);
      validateClinicId(params.id);
    }
  }, [params]);

  // Validate the clinic ID
  const validateClinicId = (id: string) => {
    if (!id) {
      setValidationStatus('pending');
      setClinicData(null);
      return;
    }

    console.log(`Validating clinic ID: ${id}`);
    
    // Find the clinic in our data
    const clinic = clinicsData.find(c => c.id === id);
    
    if (clinic) {
      console.log(`Found clinic: ${clinic.name}`);
      setClinicData(clinic);
      setValidationStatus('valid');
      toast({
        title: "Clinic Found",
        description: `Found clinic with name: ${clinic.name}`,
        variant: "default",
      });
    } else {
      console.error(`No clinic found with ID: ${id}`);
      setClinicData(null);
      setValidationStatus('invalid');
      toast({
        title: "Clinic Not Found",
        description: `No clinic found with ID: ${id}`,
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateClinicId(clinicId);
    navigate(`/clinic-debug/${clinicId}`);
  };

  // Generate links to test with
  const getStandardClinicLink = () => `/clinic/${clinicId}`;
  const getTestClinicLink = () => `/clinic-test/${clinicId}`;
  const getDirectLink = () => {
    // This sets up a forced direct navigation
    return `javascript:window.location.href='/clinic/${clinicId}'`;
  };

  // Handle the direct link click
  const handleDirectLinkClick = () => {
    setDirectLinkActive(true);
    window.location.href = `/clinic/${clinicId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="flex items-center text-primary hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Clinic Detail Debug Tool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                This tool helps diagnose issues with clinic detail pages.
                Enter a clinic ID below to validate it and test different routing methods.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="clinicId">Clinic ID</Label>
                  <Input
                    id="clinicId"
                    placeholder="Enter clinic ID (e.g., dentgroup-istanbul)"
                    value={clinicId}
                    onChange={(e) => setClinicId(e.target.value)}
                  />
                </div>
                <Button type="submit">Validate Clinic ID</Button>
              </form>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Validation Results</h3>
              
              <div className="mb-6 p-4 rounded-md bg-gray-100">
                <div className="flex items-center mb-2">
                  <span className="font-medium mr-2">Status:</span>
                  {validationStatus === 'valid' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      Valid
                    </div>
                  )}
                  {validationStatus === 'invalid' && (
                    <div className="flex items-center text-red-600">
                      <AlertTriangle className="w-5 h-5 mr-1" />
                      Invalid - Clinic not found
                    </div>
                  )}
                  {validationStatus === 'pending' && (
                    <div className="text-gray-500">
                      Awaiting validation
                    </div>
                  )}
                </div>
                
                {clinicData && (
                  <div className="bg-white rounded-md p-3 mt-2">
                    <h4 className="font-medium mb-2">Clinic Details:</h4>
                    <ul className="space-y-1 text-sm">
                      <li><span className="font-medium">ID:</span> {clinicData.id}</li>
                      <li><span className="font-medium">Name:</span> {clinicData.name}</li>
                      <li><span className="font-medium">Location:</span> {clinicData.location.area}, {clinicData.location.city}</li>
                      <li><span className="font-medium">Tier:</span> {clinicData.tier}</li>
                    </ul>
                  </div>
                )}
              </div>
              
              {validationStatus === 'valid' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Test Links</h3>
                  <p className="text-sm text-gray-600">
                    Try these different methods to visit the clinic detail page:
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Standard Link (Router)</h4>
                      <Link href={getStandardClinicLink()}>
                        <Button variant="outline" className="w-full justify-start">
                          Visit Clinic Detail Page (Standard)
                        </Button>
                      </Link>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Test Router Link</h4>
                      <Link href={getTestClinicLink()}>
                        <Button variant="outline" className="w-full justify-start">
                          Visit Clinic Detail Page (Test Router)
                        </Button>
                      </Link>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Direct Link (window.location)</h4>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleDirectLinkClick}
                        disabled={directLinkActive}
                      >
                        Visit Clinic Detail Page (Direct Navigation)
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Available Clinic IDs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {clinicsData.map((clinic) => (
              <div key={clinic.id} className="p-3 bg-white rounded-md shadow-sm">
                <div className="font-medium">{clinic.name}</div>
                <div className="text-sm text-gray-600">ID: {clinic.id}</div>
                <Button 
                  variant="link" 
                  size="sm"
                  className="p-0 h-auto mt-1"
                  onClick={() => {
                    setClinicId(clinic.id);
                    validateClinicId(clinic.id);
                    navigate(`/clinic-debug/${clinic.id}`);
                  }}
                >
                  Use this ID
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicDebugPage;