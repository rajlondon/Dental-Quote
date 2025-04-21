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
  Users,
  BarChart3,
  Building,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Admin Portal Testing Component
 * 
 * This component provides a testing interface for the Admin Portal
 * features including:
 * - User account management
 * - Quote oversight
 * - Clinic management
 * - Document verification
 * - Communication monitoring
 * - Analytics dashboard
 */
const AdminPortalTesting: React.FC<{
  setActiveSection: (section: string) => void;
}> = ({ setActiveSection }) => {
  const { toast } = useToast();
  
  // Quick action to review user accounts
  const reviewUserAccounts = () => {
    toast({
      title: "Demo User Accounts Loaded",
      description: "Sample user accounts have been loaded for review.",
    });
    
    setTimeout(() => {
      setActiveSection('user_management');
    }, 1500);
  };
  
  // Quick action to view analytics dashboard
  const viewAnalyticsDashboard = () => {
    toast({
      title: "Demo Analytics Dashboard",
      description: "Sample analytics data has been loaded for review.",
    });
    
    setTimeout(() => {
      setActiveSection('analytics');
    }, 1500);
  };
  
  // Quick action to review clinic profiles
  const reviewClinicProfiles = () => {
    toast({
      title: "Demo Clinic Profiles Loaded",
      description: "Sample clinic profiles have been loaded for review.",
    });
    
    setTimeout(() => {
      setActiveSection('clinics');
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Portal Testing</h1>
          <p className="text-muted-foreground">
            Test and verify all Admin Portal functionality
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
          You're in testing mode. This guide will help you verify all Admin Portal functionality.
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
          <PortalTestingGuide portalType="admin" />
        </TabsContent>
        
        <TabsContent value="quick-actions" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Review User Accounts
                </CardTitle>
                <CardDescription>
                  View and manage sample user accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will load sample user accounts (patients and clinic staff)
                  for testing the user management functionality.
                </p>
                <Button onClick={reviewUserAccounts} className="w-full">
                  Load User Accounts
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Building className="h-5 w-5 mr-2 text-primary" />
                  Manage Clinic Profiles
                </CardTitle>
                <CardDescription>
                  Review and edit sample clinic profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will load sample clinic profiles for testing the clinic
                  management and editing functionality.
                </p>
                <Button onClick={reviewClinicProfiles} className="w-full">
                  Load Clinic Profiles
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  View Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  Explore sample analytics and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will load a sample analytics dashboard with test data to review
                  platform performance metrics and statistics.
                </p>
                <Button onClick={viewAnalyticsDashboard} className="w-full">
                  Load Analytics Dashboard
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
              <CardTitle>Admin Portal Feature Status</CardTitle>
              <CardDescription>
                Current implementation status of all admin portal features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FeatureStatus 
                    name="Secure Admin Login" 
                    status="complete" 
                    description="Role-based admin access" 
                  />
                  <FeatureStatus 
                    name="User Account Management" 
                    status="complete" 
                    description="Manage patients and clinic staff" 
                  />
                  <FeatureStatus 
                    name="Quote Oversight" 
                    status="complete" 
                    description="Monitor quotes and approvals" 
                  />
                  <FeatureStatus 
                    name="Clinic Management" 
                    status="complete" 
                    description="Manage clinic profiles and services" 
                  />
                  <FeatureStatus 
                    name="Document Verification" 
                    status="complete" 
                    description="Review and approve documents" 
                  />
                  <FeatureStatus 
                    name="Communication Monitoring" 
                    status="complete" 
                    description="Oversee patient-clinic messages" 
                  />
                  <FeatureStatus 
                    name="Booking Management" 
                    status="partial" 
                    description="Track and manage treatment bookings" 
                  />
                  <FeatureStatus 
                    name="Content Management" 
                    status="partial" 
                    description="Edit website content and FAQs" 
                  />
                  <FeatureStatus 
                    name="Analytics Dashboard" 
                    status="partial" 
                    description="Review platform performance metrics" 
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

export default AdminPortalTesting;