import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'wouter';
import { TreatmentItem, TreatmentPlanBuilder } from '@/components/TreatmentPlanBuilder';
import { EnhancedTreatmentPlanBuilder } from '@/components/EnhancedTreatmentPlanBuilder';
import { treatmentCategoriesData } from '@/data/treatment-categories-data';
import specialOffersService, { SpecialOffer, Package, PromoToken } from '@/services/SpecialOffersService';
import { useSpecialOffers } from '@/hooks/use-special-offers';

/**
 * Test page for comparing the original TreatmentPlanBuilder with the enhanced version
 */
const QuoteFlowTest: React.FC = () => {
  const { toast } = useToast();
  const [navigate, setLocation] = useNavigate();
  
  // State for treatment plans
  const [originalTreatments, setOriginalTreatments] = useState<TreatmentItem[]>([]);
  const [enhancedTreatments, setEnhancedTreatments] = useState<TreatmentItem[]>([]);
  
  // State for special offers
  const [specialOfferParam, setSpecialOfferParam] = useState<string>('');
  const [packageParam, setPackageParam] = useState<string>('');
  const [promoTokenParam, setPromoTokenParam] = useState<string>('');
  
  // Handle loading special offers from URL parameters
  const loadParamsFromUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    
    // Check for special offer ID
    const offerParam = searchParams.get('specialOfferId');
    if (offerParam) {
      setSpecialOfferParam(offerParam);
    }
    
    // Check for package ID
    const packageIdParam = searchParams.get('packageId');
    if (packageIdParam) {
      setPackageParam(packageIdParam);
    }
    
    // Check for promo token
    const tokenParam = searchParams.get('promoToken');
    if (tokenParam) {
      setPromoTokenParam(tokenParam);
    }
  };
  
  // Load parameters on initial mount
  useEffect(() => {
    loadParamsFromUrl();
  }, []);
  
  // Handle applying special offer
  const handleApplySpecialOffer = () => {
    if (!specialOfferParam) {
      toast({
        title: "No special offer ID provided",
        description: "Please enter a special offer ID to test",
        variant: "destructive",
      });
      return;
    }
    
    // Add the special offer ID to the URL
    const params = new URLSearchParams();
    params.set('specialOfferId', specialOfferParam);
    
    setLocation(`/quote-flow-test?${params.toString()}`);
    window.location.reload(); // Reload to ensure that new parameters are processed
  };
  
  // Handle applying package
  const handleApplyPackage = () => {
    if (!packageParam) {
      toast({
        title: "No package ID provided",
        description: "Please enter a package ID to test",
        variant: "destructive",
      });
      return;
    }
    
    // Add the package ID to the URL
    const params = new URLSearchParams();
    params.set('packageId', packageParam);
    
    setLocation(`/quote-flow-test?${params.toString()}`);
    window.location.reload(); // Reload to ensure that new parameters are processed
  };
  
  // Handle applying promo token
  const handleApplyPromoToken = () => {
    if (!promoTokenParam) {
      toast({
        title: "No promo token provided",
        description: "Please enter a promo token to test",
        variant: "destructive",
      });
      return;
    }
    
    // Add the promo token to the URL
    const params = new URLSearchParams();
    params.set('promoToken', promoTokenParam);
    
    setLocation(`/quote-flow-test?${params.toString()}`);
    window.location.reload(); // Reload to ensure that new parameters are processed
  };
  
  // Handle resetting the URL parameters
  const handleReset = () => {
    setLocation('/quote-flow-test');
    setSpecialOfferParam('');
    setPackageParam('');
    setPromoTokenParam('');
    window.location.reload(); // Reload to clear parameters
  };
  
  // Handle adding a test treatment
  const handleAddTestTreatment = () => {
    // Create a simple test treatment item
    const testTreatment: TreatmentItem = {
      id: `test-treatment-${Date.now()}`,
      category: 'basic-dentistry',
      name: 'Test Treatment',
      quantity: 1,
      priceGBP: 100,
      priceUSD: 120,
      subtotalGBP: 100,
      subtotalUSD: 120,
      ukPriceGBP: 300,
      ukPriceUSD: 360
    };
    
    // Add to both sets of treatments
    setOriginalTreatments(prev => [...prev, testTreatment]);
    setEnhancedTreatments(prev => [...prev, testTreatment]);
    
    toast({
      title: "Test treatment added",
      description: "A test treatment has been added to both builders",
    });
  };
  
  // Get currently active parameters
  const getActiveParams = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const hasSpecialOffer = searchParams.has('specialOfferId');
    const hasPackage = searchParams.has('packageId');
    const hasPromoToken = searchParams.has('promoToken');
    
    return { hasSpecialOffer, hasPackage, hasPromoToken };
  };
  
  const { hasSpecialOffer, hasPackage, hasPromoToken } = getActiveParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Quote Flow Test Page</h1>
        <p className="text-gray-600 mb-4">
          This page allows you to test and compare the original treatment plan builder with the enhanced version
          that handles special offers and packages more effectively.
        </p>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Special Offer Tester */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Test Special Offer</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="specialOfferId">Special Offer ID</Label>
                <Input 
                  id="specialOfferId"
                  value={specialOfferParam}
                  onChange={(e) => setSpecialOfferParam(e.target.value)}
                  placeholder="Enter special offer ID"
                />
              </div>
              <Button 
                onClick={handleApplySpecialOffer}
                className="w-full"
                variant="default"
              >
                Apply Special Offer
              </Button>
              {hasSpecialOffer && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Special Offer Active
                </Badge>
              )}
            </div>
          </Card>
          
          {/* Package Tester */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Test Package</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="packageId">Package ID</Label>
                <Input 
                  id="packageId"
                  value={packageParam}
                  onChange={(e) => setPackageParam(e.target.value)}
                  placeholder="Enter package ID"
                />
              </div>
              <Button 
                onClick={handleApplyPackage}
                className="w-full"
                variant="default"
              >
                Apply Package
              </Button>
              {hasPackage && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Package Active
                </Badge>
              )}
            </div>
          </Card>
          
          {/* Promo Token Tester */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Test Promo Token</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="promoToken">Promo Token</Label>
                <Input 
                  id="promoToken"
                  value={promoTokenParam}
                  onChange={(e) => setPromoTokenParam(e.target.value)}
                  placeholder="Enter promo token"
                />
              </div>
              <Button 
                onClick={handleApplyPromoToken}
                className="w-full"
                variant="default"
              >
                Apply Promo Token
              </Button>
              {hasPromoToken && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Promo Token Active
                </Badge>
              )}
            </div>
          </Card>
          
          {/* Test Controls */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Test Controls</h3>
            <div className="space-y-3">
              <Button 
                onClick={handleAddTestTreatment}
                className="w-full"
                variant="outline"
              >
                Add Test Treatment
              </Button>
              <Button 
                onClick={handleReset}
                className="w-full"
                variant="destructive"
              >
                Reset Parameters
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full">Test Info</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Testing Instructions</AlertDialogTitle>
                    <AlertDialogDescription>
                      <p className="mb-2">
                        This testing page helps you compare the original treatment plan builder with the enhanced version.
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Add test treatments to both builders using the "Add Test Treatment" button</li>
                        <li>Apply a special offer ID to see how both builders handle it</li>
                        <li>Apply a package ID to see how both builders handle it</li>
                        <li>Apply a promo token to see how both builders handle it</li>
                      </ul>
                      <p className="mt-2">
                        The enhanced builder should properly display special offers as bonus items and handle packages
                        more intelligently.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <Tabs defaultValue="sideBySide">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="sideBySide">Side by Side</TabsTrigger>
          <TabsTrigger value="original">Original Builder</TabsTrigger>
          <TabsTrigger value="enhanced">Enhanced Builder</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sideBySide" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card className="p-4">
                <h2 className="text-xl font-bold mb-4">Original Treatment Plan Builder</h2>
                <TreatmentPlanBuilder 
                  initialTreatments={originalTreatments}
                  onTreatmentsChange={setOriginalTreatments}
                  hideHeader={true}
                  treatmentCategoriesData={treatmentCategoriesData}
                />
              </Card>
            </div>
            <div>
              <Card className="p-4">
                <h2 className="text-xl font-bold mb-4">Enhanced Treatment Plan Builder</h2>
                <EnhancedTreatmentPlanBuilder 
                  initialTreatments={enhancedTreatments}
                  onTreatmentsChange={setEnhancedTreatments}
                  hideHeader={true}
                  treatmentCategoriesData={treatmentCategoriesData}
                />
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="original">
          <Card className="p-4">
            <h2 className="text-xl font-bold mb-4">Original Treatment Plan Builder</h2>
            <TreatmentPlanBuilder 
              initialTreatments={originalTreatments}
              onTreatmentsChange={setOriginalTreatments}
              treatmentCategoriesData={treatmentCategoriesData}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="enhanced">
          <Card className="p-4">
            <h2 className="text-xl font-bold mb-4">Enhanced Treatment Plan Builder</h2>
            <EnhancedTreatmentPlanBuilder 
              initialTreatments={enhancedTreatments}
              onTreatmentsChange={setEnhancedTreatments}
              treatmentCategoriesData={treatmentCategoriesData}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuoteFlowTest;