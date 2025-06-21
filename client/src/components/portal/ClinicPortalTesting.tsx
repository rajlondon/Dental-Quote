import React from 'react';
// Removed react-i18next
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, CheckCircle2, Clock, TestTube, AlertCircle } from 'lucide-react';
import { getPortalFeatures, getWorkflowSteps, getSecurityFeatures } from './PortalTestingGuide';

interface ClinicPortalTestingProps {
  setActiveSection: (section: string) => void;
}

const ClinicPortalTesting: React.FC<ClinicPortalTestingProps> = ({ setActiveSection }) => {
  // Placeholder translation function
  const t = (key: string, fallback: string) => fallback;
  const portalType = 'clinic';
  
  const features = getPortalFeatures(portalType);
  const workflowSteps = getWorkflowSteps(portalType);
  const securityFeatures = getSecurityFeatures(portalType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <TestTube className="h-6 w-6 mr-2 text-blue-600" />
            {t('testing.clinic_portal.title', 'Clinic Portal Testing Mode')}
          </h2>
          <p className="text-gray-500 mt-1">
            {t('testing.clinic_portal.description', 'Test and validate clinic portal functionality')}
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setActiveSection('dashboard')}
        >
          {t('testing.back_to_dashboard', 'Back to Dashboard')}
        </Button>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <TestTube className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-700">
          {t('testing.test_mode_active', 'Testing Mode Active')}
        </AlertTitle>
        <AlertDescription className="text-blue-600">
          {t('testing.test_mode_description', 'Use this testing interface to validate clinic portal functionality. This mode allows you to test features without affecting production data.')}
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="features">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="features">{t('testing.tabs.features', 'Features')}</TabsTrigger>
          <TabsTrigger value="workflow">{t('testing.tabs.workflow', 'Workflow')}</TabsTrigger>
          <TabsTrigger value="security">{t('testing.tabs.security', 'Security')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="features" className="space-y-4">
          <h3 className="text-lg font-semibold mb-2">
            {t('testing.feature_list.title', 'Clinic Portal Features')}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader className="py-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md font-medium">{feature.name}</CardTitle>
                    <Badge className={
                      feature.status === 'complete' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      feature.status === 'partial' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                      'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }>
                      {feature.status === 'complete' ? t('testing.status.complete', 'Complete') :
                       feature.status === 'partial' ? t('testing.status.partial', 'Partial') :
                       t('testing.status.planned', 'Planned')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </CardContent>
                <CardFooter className="pt-0 pb-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 p-0 h-auto hover:text-blue-800 hover:bg-transparent"
                    onClick={() => {
                      if (feature.navigationTarget) {
                        setActiveSection(feature.navigationTarget);
                      }
                    }}
                    disabled={!feature.navigationTarget || feature.status === 'planned'}
                  >
                    {feature.status === 'planned' ? 
                      t('testing.coming_soon', 'Coming Soon') : 
                      t('testing.test_feature', 'Test Feature')} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="workflow" className="space-y-4">
          <h3 className="text-lg font-semibold mb-2">
            {t('testing.workflow.title', 'Clinic User Workflow')}
          </h3>
          
          <Card>
            <CardContent className="pt-6">
              <ol className="relative border-l border-gray-200 ml-3 space-y-6">
                {workflowSteps.map((step, index) => (
                  <li key={index} className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                      {index + 1}
                    </span>
                    <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
                      {step.title}
                      {step.completed && (
                        <span className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded ml-3 flex items-center">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          {t('testing.workflow.completed', 'Completed')}
                        </span>
                      )}
                      {step.inProgress && (
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded ml-3 flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {t('testing.workflow.in_progress', 'In Progress')}
                        </span>
                      )}
                    </h3>
                    <p className="mb-2 text-base font-normal text-gray-500">
                      {step.description}
                    </p>
                    {step.note && (
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-md text-sm text-amber-800">
                        <strong>{t('testing.workflow.note', 'Note')}:</strong> {step.note}
                      </div>
                    )}
                    {step.navigationTarget && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setActiveSection(step.navigationTarget)}
                      >
                        {t('testing.workflow.test_step', 'Test This Step')}
                      </Button>
                    )}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <h3 className="text-lg font-semibold mb-2">
            {t('testing.security.title', 'Clinic Portal Security')}
          </h3>
          
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('testing.security.important', 'Important Security Information')}</AlertTitle>
            <AlertDescription>
              {t('testing.security.description', 'This portal requires proper authentication. Testing credentials have been provided in the portal testing hub.')}
            </AlertDescription>
          </Alert>
          
          <div className="grid md:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-md">{feature.name}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 list-disc pl-5 text-sm">
                    {feature.bulletPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Separator className="my-6" />
          
          <Card>
            <CardHeader>
              <CardTitle>{t('testing.test_credentials.title', 'Test Credentials')}</CardTitle>
              <CardDescription>
                {t('testing.test_credentials.description', 'Use these credentials for testing clinic portal access.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">{t('testing.test_credentials.username', 'Username')}:</p>
                  <p className="font-mono bg-gray-100 p-2 rounded mt-1">clinic@mydentalfly.com</p>
                </div>
                <div>
                  <p className="font-medium">{t('testing.test_credentials.password', 'Password')}:</p>
                  <p className="font-mono bg-gray-100 p-2 rounded mt-1">Clinic123!</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>
                  <strong>{t('testing.test_credentials.note', 'Note')}:</strong> {t('testing.test_credentials.note_text', 'These credentials are for testing purposes only and provide access to a demo clinic account.')}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/#/portal-login'}
              >
                {t('testing.test_credentials.go_to_login', 'Go to Login Page')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicPortalTesting;