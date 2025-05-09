import React, { useState } from 'react';
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
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { EnhancedQuoteFlowProvider, useEnhancedQuoteFlow } from '@/contexts/EnhancedQuoteFlowContext';
import { QuoteFlowProvider, useQuoteFlow } from '@/contexts/QuoteFlowContext';
import EnhancedTreatmentPlanBuilder from '@/components/EnhancedTreatmentPlanBuilder';
import TreatmentPlanBuilder from '@/components/TreatmentPlanBuilder';
import { TreatmentItem } from '@/components/TreatmentPlanBuilder';
import {
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Package,
  Gift,
  ShoppingBag,
  Tag
} from 'lucide-react';
import { treatmentCategoriesData } from '@/data/treatment-categories-data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Special Offer Test Scenarios
const scenarios = [
  {
    id: 'standard',
    name: 'Standard Quote',
    description: 'No special offers or promotions',
    params: '?source=standard'
  },
  {
    id: 'special_offer',
    name: 'Special Offer (20% Off)',
    description: 'Standard percentage discount',
    params: '?source=special_offer&offerId=test-offer-1&offerTitle=Spring%20Promotion&offerDiscountType=percentage&offerDiscount=20&clinicId=1'
  },
  {
    id: 'special_offer_fixed',
    name: 'Special Offer (£250 Off)',
    description: 'Fixed amount discount',
    params: '?source=special_offer&offerId=test-offer-2&offerTitle=Fixed%20Amount%20Discount&offerDiscountType=fixed_amount&offerDiscount=250&clinicId=1'
  },
  {
    id: 'package',
    name: 'Package Deal',
    description: 'Bundled treatment package',
    params: '?source=package&packageId=test-package-1&packageTitle=Smile%20Makeover%20Package&clinicId=1'
  },
  {
    id: 'promo_token',
    name: 'Promo Token',
    description: 'Special promotional code',
    params: '?source=promo_token&promoToken=SPRING2025&promoType=special_offer&promoTitle=Spring%20Promotion%20Code&discountType=percentage&discountValue=15&clinicId=1'
  }
];

// Custom URL Builder Component
const CustomUrlBuilder = ({ onApplyUrl }: { onApplyUrl: (url: string) => void }) => {
  const [source, setSource] = useState('special_offer');
  const [offerId, setOfferId] = useState('custom-offer');
  const [offerTitle, setOfferTitle] = useState('Custom Offer');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [clinicId, setClinicId] = useState('1');
  
  const generateUrl = () => {
    const params = new URLSearchParams();
    params.append('source', source);
    
    if (source === 'special_offer') {
      params.append('offerId', offerId);
      params.append('offerTitle', offerTitle);
      params.append('offerDiscountType', discountType);
      params.append('offerDiscount', discountValue);
      params.append('clinicId', clinicId);
    } else if (source === 'package') {
      params.append('packageId', offerId);
      params.append('packageTitle', offerTitle);
      params.append('clinicId', clinicId);
    } else if (source === 'promo_token') {
      params.append('promoToken', offerId);
      params.append('promoType', 'special_offer');
      params.append('promoTitle', offerTitle);
      params.append('discountType', discountType);
      params.append('discountValue', discountValue);
      params.append('clinicId', clinicId);
    }
    
    return `?${params.toString()}`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom URL Builder</CardTitle>
        <CardDescription>Create a custom test scenario</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="source">Offer Type</Label>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger id="source">
              <SelectValue placeholder="Select offer type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Quote</SelectItem>
              <SelectItem value="special_offer">Special Offer</SelectItem>
              <SelectItem value="package">Package Deal</SelectItem>
              <SelectItem value="promo_token">Promo Token</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="offerId">
            {source === 'special_offer' ? 'Offer ID' : 
             source === 'package' ? 'Package ID' : 
             source === 'promo_token' ? 'Promo Token' : 'ID'}
          </Label>
          <Input 
            id="offerId" 
            value={offerId} 
            onChange={(e) => setOfferId(e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="offerTitle">
            {source === 'special_offer' ? 'Offer Title' : 
             source === 'package' ? 'Package Title' : 
             source === 'promo_token' ? 'Promo Title' : 'Title'}
          </Label>
          <Input 
            id="offerTitle" 
            value={offerTitle} 
            onChange={(e) => setOfferTitle(e.target.value)} 
          />
        </div>
        
        {(source === 'special_offer' || source === 'promo_token') && (
          <>
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select 
                value={discountType} 
                onValueChange={(value) => setDiscountType(value as 'percentage' | 'fixed_amount')}
              >
                <SelectTrigger id="discountType">
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Amount (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                {discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount (£)'}
              </Label>
              <Input 
                id="discountValue" 
                type="number"
                value={discountValue} 
                onChange={(e) => setDiscountValue(e.target.value)} 
              />
            </div>
          </>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="clinicId">Clinic ID</Label>
          <Input 
            id="clinicId" 
            value={clinicId} 
            onChange={(e) => setClinicId(e.target.value)} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onApplyUrl(generateUrl())} className="w-full">
          Apply Custom URL
        </Button>
      </CardFooter>
    </Card>
  );
};

// Component that allows testing both implementations side by side
const SideBySideCompare = () => {
  // Old implementation (QuoteFlowContext)
  const oldImplementation = useQuoteFlow();
  
  // New implementation (EnhancedQuoteFlowContext)
  const newImplementation = useEnhancedQuoteFlow();
  
  // State for treatments
  const [oldTreatments, setOldTreatments] = useState<TreatmentItem[]>([]);
  const [newTreatments, setNewTreatments] = useState<TreatmentItem[]>([]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-gray-300">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-base">Current Implementation</CardTitle>
          <CardDescription>
            Special offers are standard items with isBonus flag
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[600px] overflow-auto">
            <TreatmentPlanBuilder 
              initialTreatments={oldTreatments}
              onTreatmentsChange={setOldTreatments}
              hideHeader
              treatmentCategoriesData={treatmentCategoriesData}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-base text-primary">New Implementation</CardTitle>
          <CardDescription>
            Enhanced special offer handling with proper UI sections
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[600px] overflow-auto">
            <EnhancedTreatmentPlanBuilder 
              initialTreatments={newTreatments}
              onTreatmentsChange={setNewTreatments}
              hideHeader
              treatmentCategoriesData={treatmentCategoriesData}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Test Page Component
const QuoteFlowTest: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState('');
  
  // Apply scenario
  const applyScenario = (scenarioParams: string) => {
    // Update the URL without refreshing the page
    window.history.pushState({}, '', scenarioParams);
    setCurrentUrl(scenarioParams);
    
    // Force initialization of both providers
    window.dispatchEvent(new Event('popstate'));
  };
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Special Offers Test Page</h1>
            <p className="text-gray-600 mt-2">
              Test and compare both implementations with different scenarios
            </p>
          </div>
          
          <Tabs defaultValue="compare" className="mb-8">
            <TabsList>
              <TabsTrigger value="compare">
                <RefreshCw className="h-4 w-4 mr-2" />
                Side by Side Comparison
              </TabsTrigger>
              <TabsTrigger value="scenarios">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Test Scenarios
              </TabsTrigger>
              <TabsTrigger value="custom">
                <Tag className="h-4 w-4 mr-2" />
                Custom Test
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="compare" className="mt-6">
              <SideBySideCompare />
            </TabsContent>
            
            <TabsContent value="scenarios" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                  <Card key={scenario.id} className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        {scenario.id === 'standard' ? (
                          <ShoppingBag className="h-4 w-4 mr-2 text-gray-600" />
                        ) : scenario.id.includes('special_offer') ? (
                          <Gift className="h-4 w-4 mr-2 text-green-600" />
                        ) : scenario.id === 'package' ? (
                          <Package className="h-4 w-4 mr-2 text-blue-600" />
                        ) : (
                          <Tag className="h-4 w-4 mr-2 text-purple-600" />
                        )}
                        {scenario.name}
                      </CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs bg-gray-100 p-2 rounded block whitespace-normal break-all">
                        {scenario.params}
                      </code>
                    </CardContent>
                    <CardFooter className="mt-auto pt-4">
                      <Button 
                        onClick={() => applyScenario(scenario.params)}
                        className="w-full"
                        variant={currentUrl === scenario.params ? "default" : "outline"}
                      >
                        Test Scenario
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="mt-6">
              <CustomUrlBuilder onApplyUrl={applyScenario} />
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Link href="/special-offers-rebuild">
              <Button>
                View Rebuild Progress
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

// Wrap the component with both providers for test comparison
const QuoteFlowTestWithProviders: React.FC = () => {
  return (
    <QuoteFlowProvider>
      <EnhancedQuoteFlowProvider>
        <QuoteFlowTest />
      </EnhancedQuoteFlowProvider>
    </QuoteFlowProvider>
  );
};

export default QuoteFlowTestWithProviders;