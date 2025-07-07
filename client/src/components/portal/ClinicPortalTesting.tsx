import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Users, 
  FileText, 
  MessageSquare, 
  Calendar,
  Shield,
  Lock,
  Eye,
  Database
} from 'lucide-react';

// Define portal features with proper fallbacks
const getPortalFeatures = (portalType: string) => {
  const features = {
    clinic: [
      { name: 'Quote Management', status: 'active', icon: FileText },
      { name: 'Patient Communication', status: 'active', icon: MessageSquare },
      { name: 'Appointment Scheduling', status: 'active', icon: Calendar },
      { name: 'Document Management', status: 'active', icon: Database },
      { name: 'Treatment Planning', status: 'active', icon: Users },
      { name: 'Media Upload', status: 'active', icon: Eye }
    ],
    patient: [
      { name: 'Quote Requests', status: 'active', icon: FileText },
      { name: 'Treatment Comparison', status: 'active', icon: Users },
      { name: 'Appointment Booking', status: 'active', icon: Calendar },
      { name: 'Document Upload', status: 'active', icon: Database }
    ],
    admin: [
      { name: 'System Management', status: 'active', icon: Shield },
      { name: 'User Management', status: 'active', icon: Users },
      { name: 'Quote Assignment', status: 'active', icon: FileText },
      { name: 'Analytics Dashboard', status: 'active', icon: Eye }
    ]
  };

  return features[portalType as keyof typeof features] || [];
};

const getWorkflowSteps = (portalType: string) => {
  const workflows = {
    clinic: [
      'Log into clinic portal',
      'Review assigned quotes',
      'Upload clinic media',
      'Create treatment plans',
      'Communicate with patients',
      'Schedule appointments'
    ],
    patient: [
      'Submit quote request',
      'Upload medical documents',
      'Review clinic responses',
      'Compare treatment options',
      'Book appointments',
      'Make payments'
    ],
    admin: [
      'Monitor system health',
      'Assign quotes to clinics',
      'Review communications',
      'Generate reports',
      'Manage system settings'
    ]
  };

  return workflows[portalType as keyof typeof workflows] || [];
};

const getSecurityFeatures = (portalType: string) => {
  const security = {
    clinic: [
      { name: 'Role-based Access Control', status: 'active' },
      { name: 'Session Management', status: 'active' },
      { name: 'Data Encryption', status: 'active' },
      { name: 'GDPR Compliance', status: 'active' }
    ],
    patient: [
      { name: 'Email Verification', status: 'active' },
      { name: 'Secure File Upload', status: 'active' },
      { name: 'Privacy Controls', status: 'active' },
      { name: 'Data Protection', status: 'active' }
    ],
    admin: [
      { name: 'Multi-factor Authentication', status: 'active' },
      { name: 'Admin Role Verification', status: 'active' },
      { name: 'Audit Logging', status: 'active' },
      { name: 'System Monitoring', status: 'active' }
    ]
  };

  return security[portalType as keyof typeof security] || [];
};

interface ClinicPortalTestingProps {
  setActiveSection?: (section: string) => void;
}

const ClinicPortalTesting: React.FC<ClinicPortalTestingProps> = ({ setActiveSection }) => {
  // Placeholder translation function
  const t = (key: string, fallback?: string) => fallback || key;
  const portalType = 'clinic';

  const features = getPortalFeatures(portalType);
  const workflowSteps = getWorkflowSteps(portalType);
  const securityFeatures = getSecurityFeatures(portalType);

  // Mock data for testing - this should be replaced with actual API calls
  const testData = {
    patients: [
      { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", status: "pending" }
    ],
    quotes: [
      { id: 1, patientName: "John Doe", treatment: "Dental Implants", amount: 2500 },
      { id: 2, patientName: "Jane Smith", treatment: "Veneers", amount: 1800 }
    ],
    appointments: [
      { id: 1, patientName: "John Doe", date: "2024-01-15", time: "10:00 AM" },
      { id: 2, patientName: "Jane Smith", date: "2024-01-16", time: "2:00 PM" }
    ]
  };

  // Safe access to data with fallbacks
  const patients = testData?.patients || [];
  const quotes = testData?.quotes || [];
  const appointments = testData?.appointments || [];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Clinic Portal Testing Guide</h2>
        <p className="text-muted-foreground">
          Test all clinic portal features and workflows
        </p>
      </div>

      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portal Features</CardTitle>
              <CardDescription>
                Test each feature to ensure proper functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{feature.name}</div>
                        <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                          {feature.status}
                        </Badge>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testing Workflows</CardTitle>
              <CardDescription>
                Follow these steps to test the complete clinic workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workflowSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Features</CardTitle>
              <CardDescription>
                Verify all security measures are working properly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium">{feature.name}</span>
                    </div>
                    <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                      {feature.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Credentials</CardTitle>
              <CardDescription>
                Use these credentials to test clinic portal access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Clinic Portal Access:</strong><br />
                  Email: clinic@mydentalfly.com<br />
                  Password: Clinic123!
                </AlertDescription>
              </Alert>

              <div className="mt-4 space-y-2">
                <h4 className="font-medium">Testing Checklist:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Login with clinic credentials</li>
                  <li>• Navigate between different sections</li>
                  <li>• Test quote management features</li>
                  <li>• Verify patient communication</li>
                  <li>• Check document upload/download</li>
                  <li>• Test appointment scheduling</li>
                  <li>• Verify security features</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button 
          onClick={() => setActiveSection?.('dashboard')}
          className="w-full max-w-md"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ClinicPortalTesting;