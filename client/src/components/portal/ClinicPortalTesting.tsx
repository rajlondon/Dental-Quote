import React from 'react';
import PortalTestingGuide from './PortalTestingGuide';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Lightbulb, 
  ListChecks, 
  MessageSquare, 
  Calendar, 
  ClipboardPlus 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Clinic Portal Testing Component
 * 
 * This component provides a testing interface for the Clinic Portal
 * features including:
 * - Quote response management
 * - Patient document review
 * - Treatment plan creation
 * - Patient communication
 * - Appointment scheduling
 */
const ClinicPortalTesting: React.FC<{
  setActiveSection: (section: string) => void;
}> = ({ setActiveSection }) => {
  const { toast } = useToast();
  
  // Quick action to create a demo treatment plan
  const createDemoTreatmentPlan = () => {
    toast({
      title: "Demo Treatment Plan Created",
      description: "A sample treatment plan has been created for testing purposes.",
    });
    
    setTimeout(() => {
      setActiveSection('treatment_plans');
    }, 1500);
  };
  
  // Quick action to create a demo appointment
  const createDemoAppointment = () => {
    toast({
      title: "Demo Appointment Created",
      description: "A sample patient appointment has been scheduled for testing.",
    });
    
    setTimeout(() => {
      setActiveSection('appointments');
    }, 1500);
  };
  
  // Quick action to create a demo quote response
  const createDemoQuoteResponse = () => {
    toast({
      title: "Demo Quote Response Created",
      description: "A sample quote response has been prepared for a patient request.",
    });
    
    setTimeout(() => {
      setActiveSection('quote_requests');
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clinic Portal Testing</h1>
          <p className="text-muted-foreground">
            Test and verify all Clinic Portal functionality
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
          You're in testing mode. This guide will help you verify all Clinic Portal functionality.
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
          <PortalTestingGuide portalType="clinic" />
        </TabsContent>
        
        <TabsContent value="quick-actions" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <ListChecks className="h-5 w-5 mr-2 text-primary" />
                  Create Treatment Plan
                </CardTitle>
                <CardDescription>
                  Create a sample treatment plan for a patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will generate a demo treatment plan with common dental procedures, 
                  allowing you to test the treatment planning features.
                </p>
                <Button onClick={createDemoTreatmentPlan} className="w-full">
                  Create Demo Plan
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Schedule Appointment
                </CardTitle>
                <CardDescription>
                  Create a test patient appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will create a sample appointment with a test patient, allowing you to
                  test the appointment scheduling and management features.
                </p>
                <Button onClick={createDemoAppointment} className="w-full">
                  Create Demo Appointment
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <ClipboardPlus className="h-5 w-5 mr-2 text-primary" />
                  Prepare Quote Response
                </CardTitle>
                <CardDescription>
                  Create a sample quote response for a patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will generate a sample quote response for a test patient request,
                  allowing you to test the quote management workflow.
                </p>
                <Button onClick={createDemoQuoteResponse} className="w-full">
                  Create Demo Response
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
              <CardTitle>Clinic Portal Feature Status</CardTitle>
              <CardDescription>
                Current implementation status of all clinic portal features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FeatureStatus 
                    name="Secure Login" 
                    status="complete" 
                    description="Role-based clinic staff access" 
                  />
                  <FeatureStatus 
                    name="Quote Management" 
                    status="complete" 
                    description="Respond to patient quote requests" 
                  />
                  <FeatureStatus 
                    name="Patient Documents" 
                    status="complete" 
                    description="Review patient-uploaded documents" 
                  />
                  <FeatureStatus 
                    name="Treatment Plans" 
                    status="complete" 
                    description="Create and send treatment plans" 
                  />
                  <FeatureStatus 
                    name="Patient Messaging" 
                    status="complete" 
                    description="Direct communication with patients" 
                  />
                  <FeatureStatus 
                    name="Appointment Scheduling" 
                    status="partial" 
                    description="Manage patient appointments" 
                  />
                  <FeatureStatus 
                    name="Treatment Records" 
                    status="complete" 
                    description="Upload treatment documentation" 
                  />
                  <FeatureStatus 
                    name="Treatment Mapper" 
                    status="partial" 
                    description="Map standard treatments to clinic procedures" 
                  />
                  <FeatureStatus 
                    name="Performance Metrics" 
                    status="partial" 
                    description="Clinic-specific analytics" 
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

export default ClinicPortalTesting;