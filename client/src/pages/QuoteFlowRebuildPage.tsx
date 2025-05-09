import React from 'react';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedQuoteFlowProvider, useEnhancedQuoteFlow } from '@/contexts/EnhancedQuoteFlowContext';
import EnhancedTreatmentPlanBuilder from '@/components/EnhancedTreatmentPlanBuilder';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  ArrowLeft,
  Code,
  Rocket,
  Construction,
  CheckCircle,
  CircleX,
  Wrench,
  Package,
  Gift,
  FileCode,
  RefreshCw,
  Info,
  Star
} from 'lucide-react';

// Component to display the rebuild progress
const RebuildProgress = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Rebuild Progress</h2>
      
      <div className="space-y-3">
        {/* Completed Items */}
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">SpecialOffersService</p>
            <p className="text-sm text-gray-600">
              Core service to centralize special offer creation and management
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">useSpecialOffers Hook</p>
            <p className="text-sm text-gray-600">
              Hook to provide a consistent API for components to interact with special offers
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">EnhancedTreatmentPlanBuilder</p>
            <p className="text-sm text-gray-600">
              Improved component with dedicated UI sections for special offers and packages
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">EnhancedQuoteFlowContext</p>
            <p className="text-sm text-gray-600">
              Extended context with proper handling for special offers, packages, and promo tokens
            </p>
          </div>
        </div>
        
        {/* In Progress Items */}
        <div className="flex items-start">
          <Construction className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">Enhanced Quote Flow Pages</p>
            <p className="text-sm text-gray-600">
              Pages that use the new systems for a consistent treatment flow
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Construction className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium">TreatmentSummaryComponent</p>
            <p className="text-sm text-gray-600">
              Improved component for displaying treatment plans with special offers
            </p>
          </div>
        </div>
        
        {/* Remaining Items */}
        <div className="flex items-start">
          <CircleX className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-500">API Integration</p>
            <p className="text-sm text-gray-400">
              New endpoints for handling special offers and package data
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <CircleX className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-500">Migration Strategy</p>
            <p className="text-sm text-gray-400">
              Plan for gradually replacing the old components without breaking existing functionality
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example Component to show the new TreatmentPlanBuilder
const TreatmentPlanDemo = () => {
  const {
    treatmentData,
    setTreatmentData,
    isSpecialOfferFlow,
    specialOffer,
    isPackageFlow,
    packageData,
    processSpecialOffers
  } = useEnhancedQuoteFlow();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Treatment Plan Builder Demo</h2>
        
        <div className="flex items-center space-x-2">
          {isSpecialOfferFlow && specialOffer && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Gift className="mr-1 h-3 w-3" />
              Special Offer Active
            </span>
          )}
          
          {isPackageFlow && packageData && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Package className="mr-1 h-3 w-3" />
              Package Active
            </span>
          )}
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <EnhancedTreatmentPlanBuilder
            initialTreatments={treatmentData}
            onTreatmentsChange={setTreatmentData}
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Main Page Component
const QuoteFlowRebuildPage: React.FC = () => {
  return (
    <EnhancedQuoteFlowProvider>
      <PageContent />
    </EnhancedQuoteFlowProvider>
  );
};

// Page Content - Needs to be inside the provider
const PageContent = () => {
  const {
    initializeQuoteFlow,
    isSpecialOfferFlow,
    isPackageFlow,
    isPromoTokenFlow,
    specialOffer,
    packageData
  } = useEnhancedQuoteFlow();
  
  // Initialize on first render
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    initializeQuoteFlow({ queryParams: searchParams });
  }, [initializeQuoteFlow]);
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">Special Offers Quote Flow Rebuild</h1>
              <span className="ml-3 px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                In Progress
              </span>
            </div>
            <p className="text-gray-600 mt-2">
              Complete rebuild of the quote flow system with proper special offers integration
            </p>
          </div>
          
          <Tabs defaultValue="overview" className="mt-8">
            <TabsList>
              <TabsTrigger value="overview">
                <Info className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="demo">
                <Star className="h-4 w-4 mr-2" />
                Demo
              </TabsTrigger>
              <TabsTrigger value="progress">
                <Wrench className="h-4 w-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="technical">
                <Code className="h-4 w-4 mr-2" />
                Technical Details
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Rocket className="mr-2 h-5 w-5 text-primary" />
                    Quote Flow System Rebuild
                  </CardTitle>
                  <CardDescription>
                    A comprehensive rebuild of the quote flow system to properly handle special offers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    After analyzing the existing implementation, we've identified several structural issues that prevent
                    special offers from working correctly. Instead of continuing with incremental fixes,
                    we're rebuilding the core components with a proper architecture.
                  </p>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Key Improvements</h3>
                    
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Card className="border-green-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <FileCode className="h-4 w-4 mr-2 text-green-600" />
                            Centralized Special Offers Service
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">
                            Single source of truth for all special offer related functionality.
                            No more scattered logic across multiple components.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-green-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <RefreshCw className="h-4 w-4 mr-2 text-green-600" />
                            Consistent Data Model
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">
                            Clear and consistent treatment data model with proper support for
                            special offers, packages, and promotional items.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-green-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <Package className="h-4 w-4 mr-2 text-blue-600" />
                            Package Support
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">
                            First-class support for treatment packages with proper UI representation
                            and data handling.
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-green-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            <Gift className="h-4 w-4 mr-2 text-purple-600" />
                            Special Offer Handling
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">
                            Correct implementation of special offers as bonus line items with
                            detailed discount information.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700">
                        This rebuild focuses on creating a solid foundation for all promotional functionality,
                        ensuring that future changes will be easier to implement and less error-prone.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => window.history.back()}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    
                    <Link href="/quote-flow-test">
                      <Button>
                        Test Different Scenarios
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="demo" className="mt-6">
              <TreatmentPlanDemo />
            </TabsContent>
            
            <TabsContent value="progress" className="mt-6">
              <RebuildProgress />
            </TabsContent>
            
            <TabsContent value="technical" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Architecture</CardTitle>
                  <CardDescription>
                    The new components and how they work together
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-medium">SpecialOffersService</h3>
                    <p className="text-sm text-gray-600">
                      A singleton service that manages creation and processing of special offers,
                      packages, and promo tokens. It provides factory methods for creating treatment
                      items with the correct structure.
                    </p>
                    
                    <h3 className="font-medium">useSpecialOffers Hook</h3>
                    <p className="text-sm text-gray-600">
                      A React hook that provides a nice API for components to interact with the
                      SpecialOffersService. It handles parsing URL parameters, tracking the
                      special offer state, and processing treatments.
                    </p>
                    
                    <h3 className="font-medium">EnhancedQuoteFlowContext</h3>
                    <p className="text-sm text-gray-600">
                      An extended version of the QuoteFlowContext that properly integrates with
                      the special offers functionality. It manages the quote flow state and
                      provides methods for initializing the flow from URL parameters.
                    </p>
                    
                    <h3 className="font-medium">EnhancedTreatmentPlanBuilder</h3>
                    <p className="text-sm text-gray-600">
                      A rebuilt version of the TreatmentPlanBuilder component with proper support
                      for special offers, packages, and promo tokens. It separates treatments into
                      different sections based on their type.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default QuoteFlowRebuildPage;