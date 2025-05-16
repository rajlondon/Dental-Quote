import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

// Define Treatment type
interface Treatment {
  id: string;
  name: string;
  price: number;
  description?: string;
  quantity: number;
}

// Define PromoCode type
interface PromoCode {
  code: string;
  discountPercentage: number;
  isValid: boolean;
}

/**
 * A completely isolated implementation with separate state variables for 
 * treatments and promo code information.
 */
export default function BasicQuoteDemo() {
  // Separate state variables for treatments and promo code
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [promoCode, setPromoCode] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [backupTreatments, setBackupTreatments] = useState<Treatment[]>([]);

  // Debug state to track state changes
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Log to both console and debug state
  const logDebug = (message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Load sample treatments when component mounts
  useEffect(() => {
    logDebug("Component mounted");
    
    // Load sample treatments
    const sampleTreatments: Treatment[] = [
      { id: "t1", name: "Dental Implant", price: 1200, description: "Titanium implant with crown", quantity: 1 },
      { id: "t2", name: "Teeth Whitening", price: 300, description: "Professional whitening treatment", quantity: 1 },
      { id: "t3", name: "Root Canal", price: 500, description: "Complete root canal treatment", quantity: 1 },
      { id: "t4", name: "Dental Veneers", price: 800, description: "Porcelain veneers (per tooth)", quantity: 1 },
      { id: "t5", name: "Dental Crown", price: 650, description: "Full porcelain crown", quantity: 1 }
    ];
    
    setTreatments(sampleTreatments);
    logDebug(`Loaded ${sampleTreatments.length} sample treatments`);
    
    return () => {
      logDebug("Component unmounting");
    };
  }, []);

  // Calculate totals
  const calculateSubtotal = () => {
    return treatments.reduce((sum, t) => sum + (t.price * t.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    return (calculateSubtotal() * appliedPromo.discountPercentage) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  // Toggle treatment selection
  const toggleTreatment = (treatment: Treatment) => {
    logDebug(`Toggling treatment: ${treatment.name}`);
    
    // Create backup before modifying treatments
    setBackupTreatments([...treatments]);
    
    setTreatments(prev => {
      const exists = prev.some(t => t.id === treatment.id);
      
      if (exists) {
        logDebug(`Removing treatment: ${treatment.name}`);
        return prev.filter(t => t.id !== treatment.id);
      } else {
        logDebug(`Adding treatment: ${treatment.name}`);
        return [...prev, { ...treatment, quantity: 1 }];
      }
    });
  };

  // Update treatment quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    logDebug(`Updating quantity for treatment ${id} to ${quantity}`);
    
    // Create backup before modifying treatments
    setBackupTreatments([...treatments]);
    
    setTreatments(prev => 
      prev.map(t => t.id === id ? { ...t, quantity } : t)
    );
  };

  // Apply promo code
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }

    logDebug(`Applying promo code: ${promoCode}`);
    
    // Backup treatments before applying promo code
    setBackupTreatments([...treatments]);
    
    setIsLoading(true);
    
    try {
      // Simulate API call with artificial delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test promo codes (in a real app, this would be an API call)
      let promoResult: PromoCode | null = null;
      
      if (promoCode.toLowerCase() === "discount10") {
        promoResult = { code: promoCode, discountPercentage: 10, isValid: true };
      } else if (promoCode.toLowerCase() === "discount20") {
        promoResult = { code: promoCode, discountPercentage: 20, isValid: true };
      } else if (promoCode.toLowerCase() === "discount50") {
        promoResult = { code: promoCode, discountPercentage: 50, isValid: true };
      } else {
        toast({
          title: "Invalid Promo Code",
          description: "The promo code you entered is not valid",
          variant: "destructive",
        });
        setAppliedPromo(null);
        setIsLoading(false);
        return;
      }
      
      // Important: Apply the promo code without modifying treatments
      logDebug(`Valid promo code applied: ${promoResult.code} with ${promoResult.discountPercentage}% discount`);
      setAppliedPromo(promoResult);
      
      toast({
        title: "Promo Code Applied",
        description: `Discount of ${promoResult.discountPercentage}% has been applied`,
      });
      
      // Check if treatments were accidentally cleared (this shouldn't happen with this implementation)
      if (treatments.length === 0 && backupTreatments.length > 0) {
        logDebug("WARNING: Treatments were cleared! Restoring from backup.");
        setTreatments([...backupTreatments]);
      }
      
    } catch (error) {
      console.error("Error applying promo code:", error);
      toast({
        title: "Error",
        description: "Failed to apply promo code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove promo code
  const removePromoCode = () => {
    logDebug("Removing applied promo code");
    setAppliedPromo(null);
    setPromoCode("");
    
    toast({
      title: "Promo Code Removed",
      description: "Discount has been removed from your quote",
    });
  };

  // Save quote
  const saveQuote = () => {
    logDebug("Saving quote");
    
    const quoteData = {
      treatments: treatments,
      promoCode: appliedPromo,
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      total: calculateTotal()
    };
    
    console.log("Quote data:", quoteData);
    
    toast({
      title: "Quote Saved",
      description: "Your quote has been saved successfully",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Basic Quote Builder Demo</h1>
      <p className="text-center mb-8 text-gray-600">
        This is a completely isolated implementation with separate state variables for treatments and promo code.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Treatment selection */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Treatments</CardTitle>
              <CardDescription>Select treatments to add to your quote</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "t1", name: "Dental Implant", price: 1200, description: "Titanium implant with crown", quantity: 1 },
                  { id: "t2", name: "Teeth Whitening", price: 300, description: "Professional whitening treatment", quantity: 1 },
                  { id: "t3", name: "Root Canal", price: 500, description: "Complete root canal treatment", quantity: 1 },
                  { id: "t4", name: "Dental Veneers", price: 800, description: "Porcelain veneers (per tooth)", quantity: 1 },
                  { id: "t5", name: "Dental Crown", price: 650, description: "Full porcelain crown", quantity: 1 }
                ].map(treatment => {
                  const isSelected = treatments.some(t => t.id === treatment.id);
                  const selectedTreatment = treatments.find(t => t.id === treatment.id);
                  
                  return (
                    <div key={treatment.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium">{treatment.name}</div>
                        <div className="text-sm text-gray-500">{treatment.description}</div>
                        <div className="text-sm font-medium mt-1">${treatment.price.toFixed(2)}</div>
                      </div>
                      
                      {isSelected ? (
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => updateQuantity(treatment.id, (selectedTreatment?.quantity || 1) - 1)}
                            disabled={(selectedTreatment?.quantity || 0) <= 1}
                          >
                            -
                          </Button>
                          
                          <div className="w-8 text-center">
                            {selectedTreatment?.quantity || 1}
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => updateQuantity(treatment.id, (selectedTreatment?.quantity || 1) + 1)}
                          >
                            +
                          </Button>
                          
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => toggleTreatment(treatment)}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => toggleTreatment(treatment)}
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Debug logs */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Debug Logs</CardTitle>
              <CardDescription>Real-time state updates and event tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-md h-48 overflow-y-auto font-mono text-xs">
                {debugLogs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quote summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
              <CardDescription>
                Selected treatments: {treatments.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {treatments.length > 0 ? (
                <div className="space-y-4">
                  {treatments.map(treatment => (
                    <div key={treatment.id} className="flex justify-between">
                      <div>
                        <div className="font-medium">{treatment.name}</div>
                        <div className="text-sm text-gray-500">Qty: {treatment.quantity}</div>
                      </div>
                      <div className="font-medium">
                        ${(treatment.price * treatment.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    
                    {appliedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({appliedPromo.discountPercentage}%):</span>
                        <span>-${calculateDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold mt-2 text-lg">
                      <span>Total:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No treatments selected yet
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="flex space-x-2 w-full">
                <div className="flex-1">
                  <Label htmlFor="promo-code" className="sr-only">Promo Code</Label>
                  <Input
                    id="promo-code"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={!!appliedPromo || isLoading}
                  />
                </div>
                
                {appliedPromo ? (
                  <Button 
                    variant="outline" 
                    onClick={removePromoCode}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                ) : (
                  <Button 
                    onClick={applyPromoCode}
                    disabled={!promoCode.trim() || isLoading}
                  >
                    Apply
                  </Button>
                )}
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={saveQuote}
                disabled={treatments.length === 0 || isLoading}
              >
                Save Quote
              </Button>

              <div className="text-xs text-gray-500 mt-2">
                <p className="mb-1"><strong>Test Promo Codes:</strong></p>
                <ul className="list-disc list-inside">
                  <li>discount10 - 10% off</li>
                  <li>discount20 - 20% off</li>
                  <li>discount50 - 50% off</li>
                </ul>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}