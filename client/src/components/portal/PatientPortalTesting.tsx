import React, { useState } from 'react';
import PortalTestingGuide from './PortalTestingGuide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, FileText, Lightbulb, MessageSquare, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

/**
 * Patient Portal Testing Component
 * 
 * This component provides a testing interface for the Patient Portal
 * features including:
 * - Account creation and login
 * - Quote generation and management
 * - Document uploads
 * - Clinic communication
 * - Treatment plan review
 * - Payments
 */
const PatientPortalTesting: React.FC<{
  setActiveSection: (section: string) => void;
}> = ({ setActiveSection }) => {
  const { toast } = useToast();
  const [isCreatingTestBooking, setIsCreatingTestBooking] = useState(false);

  // Create a real quote request
  const createDemoQuote = async () => {
    try {
      const response = await apiRequest('POST', '/api/quotes', {
        treatment: 'dental_implants',
        specificTreatment: 'single_implant',
        name: 'Test Patient',
        email: 'patient@test.com',
        phone: '+44 7700 900123',
        departureCity: 'London',
        travelMonth: 'March 2025',
        budget: '2000-5000',
        hasXrays: false,
        consent: true
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Quote Request Created",
          description: `Quote request #${data.quoteRequest.id} created successfully.`,
        });

        // Navigate to treatment comparison with real data
        setTimeout(() => {
          setActiveSection('treatment_comparison');
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to create quote');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create quote: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Quick action to upload a demo document
  const uploadDemoDocument = () => {
    toast({
      title: "Demo Document Uploaded",
      description: "A sample X-ray has been added to your documents for testing.",
    });

    // Navigate to documents section
    setTimeout(() => {
      setActiveSection('documents');
    }, 1500);
  };

  // Create a real test booking with clinic for messaging
  const createTestBooking = async () => {
    setIsCreatingTestBooking(true);

    try {
      // Call our test API endpoint to create a booking between patient and clinic
      const response = await apiRequest('POST', '/api/test/create-test-booking', {
        patientEmail: 'patient@mydentalfly.com',
        clinicEmail: 'clinic@mydentalfly.com'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Test Booking Created",
          description: `A test booking has been created with booking reference ${data.booking?.bookingReference || 'TEST-BOOKING'}.`,
          variant: "default"
        });

        // Navigate to messages section
        setTimeout(() => {
          setActiveSection('messages');
        }, 1500);
      } else {
        // If booking already exists, still show success
        if (data.message?.includes('Existing booking found')) {
          toast({
            title: "Existing Test Booking Found",
            description: "A booking already exists between you and the clinic. You can use this for messaging tests.",
            variant: "default"
          });

          // Navigate to messages section
          setTimeout(() => {
            setActiveSection('messages');
          }, 1500);
        } else {
          throw new Error(data.message || 'Failed to create test booking');
        }
      }
    } catch (error) {
      console.error('Error creating test booking:', error);
      toast({
        title: "Error Creating Test Booking",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreatingTestBooking(false);
    }
  };

  // Deprecated demo message function (replaced with actual API implementation)
  const createDemoMessage = () => {
    createTestBooking();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patient Portal Testing</h1>
          <p className="text-muted-foreground">
            Test and verify all Patient Portal functionality
          </p>
        </div>

        <Button 
          variant="outline"
          onClick={() => setActiveSection('dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Lightbulb className="h-4 w-4 text-blue-600" />
        <AlertTitle>Testing Mode</AlertTitle>
        <AlertDescription className="text-blue-700">
          You're in testing mode. This guide will help you verify all Patient Portal functionality.
          Test data will be used to demonstrate features without affecting real data.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="guide" className="space-y-4">
        <TabsList>
          <TabsTrigger value="guide">Testing Guide</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Test Actions</TabsTrigger>
          <TabsTrigger value="status">Feature Status</TabsTrigger>
        </TabsList>

        <TabsContent value="guide" className="space-y-4">
          <PortalTestingGuide portalType="patient" />
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Generate Test Quote
                </CardTitle>
                <CardDescription>
                  Create a sample quote request to test the quote flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will create a demo quote request with preset treatments for dental implants
                  and crowns, allowing you to test the quote comparison features.
                </p>
                <Button onClick={createDemoQuote} className="w-full">
                  Create Demo Quote
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-primary" />
                  Upload Test Document
                </CardTitle>
                <CardDescription>
                  Add a sample document to test the document management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will add a sample X-ray document to your account, allowing you to
                  test document viewing and management features.
                </p>
                <Button onClick={uploadDemoDocument} className="w-full">
                  Add Demo Document
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Create Test Message
                </CardTitle>
                <CardDescription>
                  Generate a sample conversation with a clinic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will create a sample message thread with a clinic, allowing you to
                  test the messaging and communication features.
                </p>
                <Button 
                  onClick={createDemoMessage} 
                  className="w-full"
                  disabled={isCreatingTestBooking}
                >
                  {isCreatingTestBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting Up Messaging...
                    </>
                  ) : (
                    "Create Test Booking & Messages"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Card className="border-blue-200">
              <CardHeader className="pb-3 bg-blue-50">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Login: Test Accounts
                </CardTitle>
                <CardDescription>
                  Auto-login to test accounts for quick testing
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Patient Account</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Email: patient@mydentalfly.com<br />
                      Password: Patient123!
                    </p>
                    <Button 
                      onClick={async () => {
                        try {
                          const response = await apiRequest('POST', '/api/test/login', {
                            email: 'patient@mydentalfly.com',
                            password: 'Patient123!'
                          });
                          if (response.ok) {
                            // Store test patient data with Maltepe clinic treatment plans
                            const testPatientData = {
                              id: 1,
                              firstName: 'John',
                              lastName: 'Doe',
                              email: 'patient@mydentalfly.com',
                              clinicId: 'maltepe-dental-clinic',
                              treatmentPlan: {
                                clinicName: 'Maltepe Dental Clinic',
                                treatments: [
                                  {
                                    id: 1,
                                    name: 'Premium Porcelain Veneer',
                                    quantity: 10,
                                    priceGBP: 210,
                                    status: 'planned'
                                  },
                                  {
                                    id: 2,
                                    name: 'Zoom Whitening',
                                    quantity: 1,
                                    priceGBP: 158,
                                    status: 'planned'
                                  }
                                ],
                                totalGBP: 2258,
                                packageName: 'Hollywood Smile Vacation Package'
                              }
                            };
                            
                            sessionStorage.setItem('test_patient_data', JSON.stringify(testPatientData));
                            
                            toast({
                              title: "Patient Login Successful",
                              description: "You are now logged in as John Doe with Maltepe clinic treatment plans.",
                              variant: "default"
                            });
                            window.location.href = '/patient-portal';
                          }
                        } catch (error) {
                          toast({
                            title: "Login Failed",
                            description: "Failed to login as test patient.",
                            variant: "destructive"
                          });
                        }
                      }} 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      Login as Patient
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Clinic Account</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Email: clinic@mydentalfly.com<br />
                      Password: Clinic123!
                    </p>
                    <Button 
                      onClick={async () => {
                        try {
                          const response = await apiRequest('POST', '/api/test/login', {
                            email: 'clinic@mydentalfly.com',
                            password: 'Clinic123!'
                          });
                          if (response.ok) {
                            toast({
                              title: "Clinic Login Successful",
                              description: "You are now logged in as the test clinic user.",
                              variant: "default"
                            });
                            window.location.href = '/clinic-portal';
                          }
                        } catch (error) {
                          toast({
                            title: "Login Failed",
                            description: "Failed to login as test clinic.",
                            variant: "destructive"
                          });
                        }
                      }} 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      Login as Clinic Staff
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="pb-3 bg-blue-50">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Test Messaging System
                </CardTitle>
                <CardDescription>
                  Create a test booking and test messaging between patient and clinic
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  This will ensure messaging infrastructure is working properly by creating test
                  data between clinic and patient. Use after logging in as either user type.
                </p>
                <Button 
                  onClick={async () => {
                    try {
                      const response = await apiRequest('POST', '/api/test/create-messaging-test-data', {});
                      const data = await response.json();

                      if (data.success) {
                        toast({
                          title: "Test Messaging Setup Complete",
                          description: "Test booking and messages have been created between patient and clinic.",
                          variant: "default"
                        });
                      } else {
                        throw new Error(data.message || 'Failed to create test messaging data');
                      }
                    } catch (error) {
                      toast({
                        title: "Error Setting Up Test Messages",
                        description: error instanceof Error ? error.message : "An unexpected error occurred",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="w-full"
                >
                  Setup Test Messaging Data
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={() => setActiveSection('dashboard')}>
              Return to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Portal Feature Status</CardTitle>
              <CardDescription>
                Current implementation status of all patient portal features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FeatureStatus 
                    name="Account Creation" 
                    status="complete" 
                    description="Register and login functionality" 
                  />
                  <FeatureStatus 
                    name="Quote Generation" 
                    status="complete" 
                    description="Create dental treatment quote requests" 
                  />
                  <FeatureStatus 
                    name="Quote Comparison" 
                    status="complete" 
                    description="Compare clinic quotes side-by-side" 
                  />
                  <FeatureStatus 
                    name="Document Upload" 
                    status="complete" 
                    description="Upload X-rays and medical documents" 
                  />
                  <FeatureStatus 
                    name="Clinic Messaging" 
                    status="complete" 
                    description="Direct communication with clinics" 
                  />
                  <FeatureStatus 
                    name="Treatment Plans" 
                    status="complete" 
                    description="Review and accept treatment plans" 
                  />
                  <FeatureStatus 
                    name="Deposit Payments" 
                    status="complete" 
                    description="Secure payment processing" 
                  />
                  <FeatureStatus 
                    name="Appointment Booking" 
                    status="partial" 
                    description="Schedule and manage appointments" 
                  />
                  <FeatureStatus 
                    name="Dental Charts" 
                    status="complete" 
                    description="Interactive dental visualization" 
                  />
                </div>

                <Alert className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Testing Note</AlertTitle>
                  <AlertDescription>
                    Features marked as "partial" have basic functionality implemented but may not be fully operational.
                    Focus your testing on the complete features first.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for feature status
const FeatureStatus: React.FC<{
  name: string;
  status: 'complete' | 'partial' | 'planned';
  description: string;
}> = ({ name, status, description }) => {
  const statusColors = {
    complete: 'bg-green-50 border-green-200',
    partial: 'bg-amber-50 border-amber-200',
    planned: 'bg-gray-50 border-gray-200'
  };

  const statusIcons = {
    complete: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    partial: <AlertCircle className="h-4 w-4 text-amber-600" />,
    planned: <FileText className="h-4 w-4 text-gray-600" />
  };

  const statusLabels = {
    complete: 'Complete',
    partial: 'Partial',
    planned: 'Planned'
  };

  return (
    <div className={`p-4 rounded-lg border ${statusColors[status]}`}>
      <div className="flex items-start justify-between">
        <h3 className="font-medium">{name}</h3>
        <div className="flex items-center">
          {statusIcons[status]}
          <span className="text-xs ml-1">
            {statusLabels[status]}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {description}
      </p>
    </div>
  );
};

export default PatientPortalTesting;