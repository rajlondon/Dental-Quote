import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle,
  XCircle,
  Tag
} from 'lucide-react';

const PromoTestPage: React.FC = () => {
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState<string>('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableCodes, setAvailableCodes] = useState<string[]>([
    'SMILE2025', 'VIPSTAY', 'SAVE2025', 'SUMMER25', 'FAMILY300', 'TEST50'
  ]);
  const [testPrice, setTestPrice] = useState<number>(1000);

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value);
  };

  const handleTestPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = parseInt(e.target.value);
    if (!isNaN(price) && price > 0) {
      setTestPrice(price);
    }
  };

  const handleValidatePromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code to validate",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promoCode }),
      });
      
      const data = await response.json();
      setValidationResult(data);
      
      if (data.valid) {
        toast({
          title: "Success",
          description: `Valid promo code: ${data.message}`,
        });
      } else {
        toast({
          title: "Invalid Code",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      toast({
        title: "Error",
        description: "Failed to validate promo code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateDiscount = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code to calculate discount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/promo-codes/calculate-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: promoCode,
          price: testPrice 
        }),
      });
      
      const data = await response.json();
      setValidationResult(data);
      
      if (data.valid) {
        toast({
          title: "Discount Calculated",
          description: `Original: £${data.originalPrice}, Discount: £${data.discountAmount}, Final: £${data.finalPrice}`,
        });
      } else {
        toast({
          title: "Invalid Code",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error calculating discount:', error);
      toast({
        title: "Error",
        description: "Failed to calculate discount. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyPromoCode = (code: string) => {
    setPromoCode(code);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Promo Code Test Page</h1>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Test Promo Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Promo Code</label>
                  <div className="flex gap-2">
                    <Input
                      value={promoCode}
                      onChange={handlePromoCodeChange}
                      placeholder="Enter promo code"
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleValidatePromoCode}
                      disabled={isLoading}
                    >
                      Validate
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Test Price (£)</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={testPrice}
                      onChange={handleTestPriceChange}
                      min={1}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleCalculateDiscount}
                      disabled={isLoading}
                    >
                      Calculate Discount
                    </Button>
                  </div>
                </div>
                
                {validationResult && (
                  <div className={`p-4 rounded-md ${validationResult.valid ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {validationResult.valid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-semibold">
                        Code: {validationResult.code}
                      </span>
                    </div>
                    
                    <p className={validationResult.valid ? 'text-green-700' : 'text-red-700'}>
                      {validationResult.message}
                    </p>
                    
                    {validationResult.valid && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-gray-600">Discount Type:</span>
                          <span className="font-medium">
                            {validationResult.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                          </span>
                          
                          <span className="text-gray-600">Discount Value:</span>
                          <span className="font-medium">
                            {validationResult.discountType === 'percentage' 
                              ? `${validationResult.discountValue}%` 
                              : `£${validationResult.discountValue}`}
                          </span>
                          
                          {validationResult.appliedTo && (
                            <>
                              <span className="text-gray-600">Applied To:</span>
                              <span className="font-medium capitalize">
                                {validationResult.appliedTo.replace('_', ' ')}
                              </span>
                            </>
                          )}
                          
                          {validationResult.title && (
                            <>
                              <span className="text-gray-600">Title:</span>
                              <span className="font-medium">{validationResult.title}</span>
                            </>
                          )}
                          
                          {validationResult.originalPrice !== undefined && (
                            <>
                              <span className="text-gray-600">Original Price:</span>
                              <span className="font-medium">£{validationResult.originalPrice}</span>
                              
                              <span className="text-gray-600">Discount Amount:</span>
                              <span className="font-medium text-green-600">£{validationResult.discountAmount}</span>
                              
                              <span className="text-gray-600">Final Price:</span>
                              <span className="font-medium text-green-700">£{validationResult.finalPrice}</span>
                              
                              <span className="text-gray-600">Saved:</span>
                              <span className="font-medium text-green-700">
                                {Math.round((validationResult.discountAmount / validationResult.originalPrice) * 100)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Available Promo Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Click on any of these promo codes to test them:
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {availableCodes.map((code) => (
                    <Badge 
                      key={code}
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1.5"
                      onClick={() => applyPromoCode(code)}
                    >
                      <Tag className="h-3.5 w-3.5 mr-1" />
                      {code}
                    </Badge>
                  ))}
                </div>
                
                <div className="mt-8 border-t pt-4">
                  <h3 className="font-semibold mb-2">How to Use Promo Codes</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Select a promo code from the list above or enter your own</li>
                    <li>Enter a test price in the price field (default is £1000)</li>
                    <li>Click "Validate" to check if the code is valid</li>
                    <li>Click "Calculate Discount" to see how much discount would be applied</li>
                    <li>View the validation results in the panel on the left</li>
                  </ol>
                  
                  <div className="mt-6">
                    <Link href="/quote">
                      <Button className="w-full">
                        Try Promo Codes in Quote Builder
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PromoTestPage;