import React, { useState } from 'react';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  RefreshCw, 
  Rocket, 
  Code, 
  Check,
  Sparkles,
  Gift,
  Package,
  ListTree,
  FileCode,
  Bug
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

/**
 * Special offers test page to compare implementations
 */
const QuoteFlowTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Function to generate test URLs with different parameters
  const generateTestUrl = (params: Record<string, string>, enhanced: boolean = false) => {
    const urlParams = new URLSearchParams();
    
    // Add enhanced flag if requested
    if (enhanced) {
      urlParams.append('enhanced', 'true');
    }
    
    // Add all other params
    Object.entries(params).forEach(([key, value]) => {
      urlParams.append(key, value);
    });
    
    return `/your-quote?${urlParams.toString()}`;
  };
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Special Offers Quote Flow Test
              <span className="ml-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm px-2 py-1 rounded">
                Development
              </span>
            </h1>
            <p className="text-gray-600">
              Test and compare different implementations of the special offers quote flow
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">
                <ListTree className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="old-implementation">
                <Code className="h-4 w-4 mr-2" />
                Current Implementation
              </TabsTrigger>
              <TabsTrigger value="new-implementation">
                <Rocket className="h-4 w-4 mr-2" />
                New Implementation
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                    Special Offers Implementation Comparison
                  </CardTitle>
                  <CardDescription>
                    This page helps test and compare different approaches to handling special offers in the quote flow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      The current implementation has several issues with handling special offers and treatment packages:
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <Bug className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Fragmented Logic:</span> Special offer handling is scattered across multiple components without centralized management.
                        </p>
                      </div>
                      <div className="flex items-start">
                        <Bug className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Inconsistent Data Model:</span> The TreatmentItem interface evolved organically with confusing, overlapping properties.
                        </p>
                      </div>
                      <div className="flex items-start">
                        <Bug className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Missing Core Architecture:</span> No dedicated service to handle the complex logic of applying offers to treatments.
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <p>
                      The new implementation addresses these issues with:
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Centralized Service:</span> SpecialOffersService manages all special offer logic in one place.
                        </p>
                      </div>
                      <div className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Consistent Hook API:</span> useSpecialOffers hook provides a unified interface for components.
                        </p>
                      </div>
                      <div className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Enhanced UI Components:</span> EnhancedTreatmentPlanBuilder with better special offer display.
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <p className="text-sm">
                      Use the tabs above to test each implementation with different special offer scenarios.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="old-implementation" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="h-5 w-5 mr-2 text-blue-500" />
                    Current Implementation Tests
                  </CardTitle>
                  <CardDescription>
                    Click the links below to test the current implementation with different special offer scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-blue-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Gift className="h-4 w-4 mr-2 text-green-600" />
                          Standard Special Offer
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Basic special offer with percentage discount
                        </p>
                        <Link href={generateTestUrl({
                          source: 'special_offer',
                          offerId: 'ac36590b-b0dc-434e-ba74-d42ab2485e81',
                          specialOffer: 'ac36590b-b0dc-434e-ba74-d42ab2485e81',
                          offerTitle: 'Free Consultation Package',
                          clinicId: '1',
                          offerClinic: '1',
                          treatment: 'dental_implant_standard',
                          step: 'start',
                          skipInfo: 'true',
                          offerDiscount: '100',
                          offerDiscountType: 'percentage',
                          t: Date.now().toString(),
                          origin: 'homepage_carousel'
                        })}>
                          <Button variant="outline" className="w-full mt-2">
                            Test Standard Offer <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Package className="h-4 w-4 mr-2 text-blue-600" />
                          Treatment Package
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Complete treatment package with multiple items
                        </p>
                        <Link href={generateTestUrl({
                          source: 'package',
                          packageId: 'pg-123456',
                          packageTitle: 'Hollywood Smile Package',
                          clinicId: '2',
                          step: 'start',
                          skipInfo: 'true',
                          t: Date.now().toString(),
                          origin: 'packages_page'
                        })}>
                          <Button variant="outline" className="w-full mt-2">
                            Test Package <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <FileCode className="h-4 w-4 mr-2 text-purple-600" />
                          Promo Token Flow
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Promotional token with discount
                        </p>
                        <Link href={generateTestUrl({
                          source: 'promo_token',
                          promoToken: 'promo-12345',
                          promoType: 'special_offer',
                          promoTitle: 'Summer Special 20% Off',
                          clinicId: '3',
                          step: 'start',
                          skipInfo: 'true',
                          discountType: 'percentage',
                          discountValue: '20',
                          t: Date.now().toString(),
                          origin: 'promo_email'
                        })}>
                          <Button variant="outline" className="w-full mt-2">
                            Test Promo Token <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Bug className="h-4 w-4 mr-2 text-red-600" />
                          Problematic Case
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Case that triggers issues in current implementation
                        </p>
                        <Link href={generateTestUrl({
                          source: 'special_offer',
                          offerId: 'broken-offer-id',
                          specialOffer: 'broken-offer-id',
                          offerTitle: 'Fixed Amount Discount',
                          clinicId: '4',
                          step: 'start',
                          skipInfo: 'true',
                          offerDiscount: '200',
                          offerDiscountType: 'fixed_amount',
                          treatment: 'porcelain_veneer',
                          t: Date.now().toString(),
                          origin: 'test_page'
                        })}>
                          <Button variant="outline" className="w-full mt-2">
                            Test Problematic Case <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="new-implementation" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Rocket className="h-5 w-5 mr-2 text-purple-500" />
                    New Implementation Tests
                  </CardTitle>
                  <CardDescription>
                    Click the links below to test the new implementation with different special offer scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-purple-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Gift className="h-4 w-4 mr-2 text-green-600" />
                          Standard Special Offer
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Basic special offer with percentage discount
                        </p>
                        <Link href={generateTestUrl({
                          source: 'special_offer',
                          offerId: 'ac36590b-b0dc-434e-ba74-d42ab2485e81',
                          specialOffer: 'ac36590b-b0dc-434e-ba74-d42ab2485e81',
                          offerTitle: 'Free Consultation Package',
                          clinicId: '1',
                          offerClinic: '1',
                          treatment: 'dental_implant_standard',
                          step: 'start',
                          skipInfo: 'true',
                          offerDiscount: '100',
                          offerDiscountType: 'percentage',
                          t: Date.now().toString(),
                          origin: 'homepage_carousel'
                        }, true)}>
                          <Button variant="outline" className="w-full mt-2">
                            Test Standard Offer <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-purple-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <Package className="h-4 w-4 mr-2 text-blue-600" />
                          Treatment Package
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Complete treatment package with multiple items
                        </p>
                        <Link href={generateTestUrl({
                          source: 'package',
                          packageId: 'pg-123456',
                          packageTitle: 'Hollywood Smile Package',
                          clinicId: '2',
                          step: 'start',
                          skipInfo: 'true',
                          t: Date.now().toString(),
                          origin: 'packages_page'
                        }, true)}>
                          <Button variant="outline" className="w-full mt-2">
                            Test Package <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-purple-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <FileCode className="h-4 w-4 mr-2 text-purple-600" />
                          Promo Token Flow
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Promotional token with discount
                        </p>
                        <Link href={generateTestUrl({
                          source: 'promo_token',
                          promoToken: 'promo-12345',
                          promoType: 'special_offer',
                          promoTitle: 'Summer Special 20% Off',
                          clinicId: '3',
                          step: 'start',
                          skipInfo: 'true',
                          discountType: 'percentage',
                          discountValue: '20',
                          t: Date.now().toString(),
                          origin: 'promo_email'
                        }, true)}>
                          <Button variant="outline" className="w-full mt-2">
                            Test Promo Token <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-purple-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <RefreshCw className="h-4 w-4 mr-2 text-green-600" />
                          Fixed Problem Case
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          Case that would break the old implementation
                        </p>
                        <Link href={generateTestUrl({
                          source: 'special_offer',
                          offerId: 'fixed-offer-id',
                          specialOffer: 'fixed-offer-id',
                          offerTitle: 'Fixed Amount Discount',
                          clinicId: '4',
                          step: 'start',
                          skipInfo: 'true',
                          offerDiscount: '200',
                          offerDiscountType: 'fixed_amount',
                          treatment: 'porcelain_veneer',
                          t: Date.now().toString(),
                          origin: 'test_page'
                        }, true)}>
                          <Button variant="outline" className="w-full mt-2">
                            Test Fixed Case <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-8">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3 flex-shrink-0">
                <RefreshCw className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-700">How to Test:</h3>
                <p className="text-sm text-blue-600 mt-1">
                  Click the test links above to try different special offer scenarios with both implementations.
                  The current implementation uses the standard YourQuotePage, while the new implementation uses
                  our enhanced component with the new architecture.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default QuoteFlowTest;