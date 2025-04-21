import React from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Lightbulb, 
  User, 
  Users, 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  LockKeyhole,
  Info
} from 'lucide-react';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

/**
 * Portal Testing Hub
 * 
 * This component provides a central location to access testing guides and
 * functionality verification for all three portals: Patient, Clinic, and Admin.
 */
const PortalTestingHub: React.FC = () => {
  const [, navigate] = useLocation();
  
  return (
    <div className="container py-8 px-4">
      <Breadcrumbs 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Portal Testing Hub', href: '/portal-testing', current: true }
        ]}
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">MyDentalFly Portal Testing Hub</h1>
        <p className="text-muted-foreground max-w-3xl">
          Welcome to the testing hub. This area allows you to verify the functionality
          of all three portals: Patient, Clinic, and Admin. Select a portal to begin testing
          or view implementation status.
        </p>
      </div>
      
      <Alert className="mb-8 bg-blue-50 border-blue-200">
        <Lightbulb className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-800">Testing Environment</AlertTitle>
        <AlertDescription className="text-blue-700">
          <p>This is a comprehensive testing environment that provides guides and verification tools for all portal components.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div className="flex items-center">
              <div className="bg-white p-1.5 rounded-md mr-2">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm"><strong>Patient Portal:</strong> patient@mydentalfly.com / Patient123!</span>
            </div>
            <div className="flex items-center">
              <div className="bg-white p-1.5 rounded-md mr-2">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm"><strong>Clinic Portal:</strong> clinic@mydentalfly.com / Clinic123!</span>
            </div>
            <div className="flex items-center">
              <div className="bg-white p-1.5 rounded-md mr-2">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm"><strong>Admin Portal:</strong> admin@mydentalfly.com / Admin123!</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patient">Patient Portal</TabsTrigger>
          <TabsTrigger value="clinic">Clinic Portal</TabsTrigger>
          <TabsTrigger value="admin">Admin Portal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PortalCard 
              title="Patient Portal" 
              description="Test the patient experience from quote generation to treatment booking"
              icon={<User className="h-6 w-6 text-blue-600" />}
              color="blue"
              features={[
                { name: "Account Creation", status: "complete" },
                { name: "Quote Generation", status: "complete" },
                { name: "Document Upload", status: "complete" },
                { name: "Treatment Selection", status: "complete" },
                { name: "Payment Processing", status: "complete" }
              ]}
              buttonAction={() => navigate('/client-portal?section=testing')}
              buttonLabel="Test Patient Portal"
              testURL="/portal-login"
              testLabel="Login to Test"
              testCredentials="patient@mydentalfly.com / Patient123!"
            />
            
            <PortalCard 
              title="Clinic Portal" 
              description="Test the clinic experience from quote response to treatment planning"
              icon={<Building className="h-6 w-6 text-green-600" />}
              color="green"
              features={[
                { name: "Quote Response", status: "complete" },
                { name: "Treatment Planning", status: "complete" },
                { name: "Patient Messaging", status: "complete" },
                { name: "Document Management", status: "complete" },
                { name: "Appointment Scheduling", status: "partial" }
              ]}
              buttonAction={() => navigate('/clinic-portal?section=testing')}
              buttonLabel="Test Clinic Portal"
              testURL="/portal-login"
              testLabel="Login to Test"
              testCredentials="clinic@mydentalfly.com / Clinic123!"
            />
            
            <PortalCard 
              title="Admin Portal" 
              description="Test the administrative experience from user management to oversight"
              icon={<Users className="h-6 w-6 text-purple-600" />}
              color="purple"
              features={[
                { name: "User Management", status: "complete" },
                { name: "Clinic Management", status: "complete" },
                { name: "Quote Oversight", status: "complete" },
                { name: "Document Verification", status: "complete" },
                { name: "Analytics Dashboard", status: "partial" }
              ]}
              buttonAction={() => navigate('/admin-portal?section=testing')}
              buttonLabel="Test Admin Portal"
              testURL="/portal-login"
              testLabel="Login to Test"
              testCredentials="admin@mydentalfly.com / Admin123!"
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LockKeyhole className="h-5 w-5 mr-2" />
                Security & Compliance
              </CardTitle>
              <CardDescription>
                Information about security measures and GDPR compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      Authentication & Authorization
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Role-based authentication using secure password hashing (bcrypt) and
                      cookie-based session management. Each portal has specific permissions.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      Data Protection
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      All sensitive data is encrypted in transit using HTTPS. Personal and 
                      medical data storage follows GDPR guidelines.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      GDPR Compliance
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      User consent is obtained for data collection and processing. Users have
                      access to their data and can request deletion.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      Secure Communications
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      All patient-clinic communications are encrypted and access-controlled.
                      Medical discussions are compliant with healthcare privacy regulations.
                    </p>
                  </div>
                </div>
                
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Testing Environment Note</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    This is a testing environment. While all security measures are implemented, no real patient data should be used here.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patient" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Patient Portal Testing Guide
              </CardTitle>
              <CardDescription>
                Comprehensive testing guide for the Patient Portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The Patient Portal provides dental treatment seekers with tools to generate quotes,
                  upload medical documents, communicate with clinics, and manage their treatment journey.
                </p>
                
                <h3 className="text-lg font-medium mt-4">Key Features to Test:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <FeatureTestCard 
                    title="Account Creation & Login" 
                    description="Register a new user account or log in with test credentials" 
                    testSteps={[
                      "Navigate to the login page",
                      "Test registration with a new email",
                      "Test login with test credentials",
                      "Verify successful access to the dashboard"
                    ]}
                  />
                  
                  <FeatureTestCard 
                    title="Quote Generation" 
                    description="Create a dental treatment quote request" 
                    testSteps={[
                      "Navigate to Your Quote page",
                      "Select dental treatments needed",
                      "Add travel preferences if needed",
                      "Submit the quote request",
                      "Verify confirmation of submission"
                    ]}
                  />
                  
                  <FeatureTestCard 
                    title="Document Upload" 
                    description="Upload X-rays and medical documents" 
                    testSteps={[
                      "Go to Documents section in the portal",
                      "Click 'Upload Document' button",
                      "Select a file and document type",
                      "Submit the upload",
                      "Verify document appears in your list"
                    ]}
                  />
                  
                  <FeatureTestCard 
                    title="Treatment Selection" 
                    description="Compare and choose clinic treatment options" 
                    testSteps={[
                      "Go to Treatment Comparison section",
                      "Review different clinic options",
                      "Compare prices and offerings",
                      "Select a preferred clinic",
                      "Verify clinic selection is confirmed"
                    ]}
                  />
                </div>
                
                <Alert className="bg-blue-50 border-blue-200 mt-6">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Testing Credentials</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Use <strong>patient@mydentalfly.com</strong> with password <strong>Patient123!</strong> for testing.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
              
              <Button asChild>
                <Link href="/client-portal?section=testing">
                  Test Patient Portal
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="clinic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-green-600" />
                Clinic Portal Testing Guide
              </CardTitle>
              <CardDescription>
                Comprehensive testing guide for the Clinic Portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The Clinic Portal enables dental clinics to respond to patient quote requests,
                  review medical documents, create treatment plans, and communicate with patients.
                </p>
                
                <h3 className="text-lg font-medium mt-4">Key Features to Test:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <FeatureTestCard 
                    title="Quote Response Management" 
                    description="Review and respond to patient quote requests" 
                    testSteps={[
                      "Log in to the Clinic Portal",
                      "Review pending quote requests",
                      "Create a personalized response",
                      "Include pricing and treatment options",
                      "Submit the quote response"
                    ]}
                  />
                  
                  <FeatureTestCard 
                    title="Patient Document Review" 
                    description="Access and review patient-uploaded documents" 
                    testSteps={[
                      "Navigate to Documents section",
                      "Filter documents by patient",
                      "Open X-rays or medical records",
                      "Review document details",
                      "Add clinical notes if needed"
                    ]}
                  />
                  
                  <FeatureTestCard 
                    title="Treatment Plan Creation" 
                    description="Create detailed treatment plans for patients" 
                    testSteps={[
                      "Go to Treatment Plans section",
                      "Create a new plan for a patient",
                      "Add required procedures and pricing",
                      "Include treatment notes and timelines",
                      "Send the plan to the patient"
                    ]}
                  />
                  
                  <FeatureTestCard 
                    title="Patient Communication" 
                    description="Message patients directly through the portal" 
                    testSteps={[
                      "Go to Messages section",
                      "Select a patient conversation",
                      "Compose and send a message",
                      "Attach documents if needed",
                      "Verify message delivery"
                    ]}
                  />
                </div>
                
                <Alert className="bg-green-50 border-green-200 mt-6">
                  <Info className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Testing Credentials</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Use <strong>clinic@mydentalfly.com</strong> with password <strong>Clinic123!</strong> for testing.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
              
              <Button asChild>
                <Link href="/clinic-portal?section=testing">
                  Test Clinic Portal
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Admin Portal Testing Guide
              </CardTitle>
              <CardDescription>
                Comprehensive testing guide for the Admin Portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The Admin Portal provides complete oversight of the platform, including
                  user management, clinic oversight, quote monitoring, and analytics.
                </p>
                
                <h3 className="text-lg font-medium mt-4">Key Features to Test:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <FeatureTestCard 
                    title="User Account Management" 
                    description="Manage patient and clinic accounts" 
                    testSteps={[
                      "Log in to the Admin Portal",
                      "Navigate to User Management",
                      "Filter users by type (patient/clinic)",
                      "View user details and edit permissions",
                      "Verify changes are saved successfully"
                    ]}
                  />
                  
                  <FeatureTestCard 
                    title="Clinic Management" 
                    description="Oversee clinic profiles and services" 
                    testSteps={[
                      "Go to Clinic Management section",
                      "Review clinic details and offerings",
                      "Edit clinic information or services",
                      "Update pricing or availability",
                      "Verify changes are reflected correctly"
                    ]}
                  />
                  
                  <FeatureTestCard 
                    title="Quote Oversight" 
                    description="Monitor quote requests and responses" 
                    testSteps={[
                      "Navigate to Quote Management",
                      "Review active quote requests",
                      "Check clinic responses",
                      "Approve or adjust quotes if needed",
                      "Track conversion metrics"
                    ]}
                  />
                  
                  <FeatureTestCard 
                    title="Analytics Dashboard" 
                    description="Review platform performance metrics" 
                    testSteps={[
                      "Access the Analytics Dashboard",
                      "Review user acquisition metrics",
                      "Check quote-to-booking conversion rates",
                      "View clinic performance statistics",
                      "Test data export functionality"
                    ]}
                  />
                </div>
                
                <Alert className="bg-purple-50 border-purple-200 mt-6">
                  <Info className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-800">Testing Credentials</AlertTitle>
                  <AlertDescription className="text-purple-700">
                    Use <strong>admin@mydentalfly.com</strong> with password <strong>Admin123!</strong> for testing.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
              
              <Button asChild>
                <Link href="/admin-portal?section=testing">
                  Test Admin Portal
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for portal cards
interface PortalCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple';
  features: { name: string; status: 'complete' | 'partial' | 'planned' }[];
  buttonAction: () => void;
  buttonLabel: string;
  testURL: string;
  testLabel: string;
  testCredentials: string;
}

const PortalCard: React.FC<PortalCardProps> = ({
  title,
  description,
  icon,
  color,
  features,
  buttonAction,
  buttonLabel,
  testURL,
  testLabel,
  testCredentials
}) => {
  const colorClasses = {
    blue: {
      card: 'border-blue-100',
      header: 'bg-blue-50',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: 'bg-blue-100'
    },
    green: {
      card: 'border-green-100',
      header: 'bg-green-50',
      button: 'bg-green-600 hover:bg-green-700 text-white',
      icon: 'bg-green-100'
    },
    purple: {
      card: 'border-purple-100',
      header: 'bg-purple-50',
      button: 'bg-purple-600 hover:bg-purple-700 text-white',
      icon: 'bg-purple-100'
    }
  };
  
  return (
    <Card className={`border ${colorClasses[color].card}`}>
      <CardHeader className={colorClasses[color].header}>
        <div className="flex items-center">
          <div className={`p-2 rounded-md mr-3 ${colorClasses[color].icon}`}>
            {icon}
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium mb-3">Features to Test:</h3>
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              {feature.status === 'complete' ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600 mr-2 flex-shrink-0" />
              )}
              <span>{feature.name}</span>
              {feature.status === 'partial' && (
                <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Partial
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="text-xs text-muted-foreground border-t pt-3 mt-3">
          <strong>Test with:</strong> {testCredentials}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          className={`w-full ${colorClasses[color].button}`}
          onClick={buttonAction}
        >
          {buttonLabel}
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link href={testURL}>{testLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Helper component for feature test cards
interface FeatureTestCardProps {
  title: string;
  description: string;
  testSteps: string[];
}

const FeatureTestCard: React.FC<FeatureTestCardProps> = ({
  title,
  description,
  testSteps
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/30 p-4">
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="p-4">
        <h4 className="text-xs font-medium uppercase mb-2 text-muted-foreground">
          Testing Steps:
        </h4>
        <ol className="list-decimal pl-5 text-sm space-y-1">
          {testSteps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default PortalTestingHub;