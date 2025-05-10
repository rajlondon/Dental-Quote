import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Calculator, Tag, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import CouponCodeInput from "@/components/clinic/CouponCodeInput";
import PromoCodeSummary from "@/components/clinic/PromoCodeSummary";
import { formatCurrency } from '@/lib/format';

/**
 * Test page for demonstrating promo code functionality
 */
export default function PromocodeTestPage() {
  const [subtotal, setSubtotal] = useState<number>(1000);
  const [discount, setDiscount] = useState<number>(0);
  const [total, setTotal] = useState<number>(1000);
  const [hasPromo, setHasPromo] = useState<boolean>(false);
  const [promoData, setPromoData] = useState<any>(null);
  const { toast } = useToast();

  // Simulate applying a code
  const handleApplyCode = async (code: string): Promise<boolean> => {
    // This would normally call the API endpoint
    // For demo, we'll simulate a successful code application for "WELCOME20"
    if (code.toUpperCase() === "WELCOME20") {
      // Calculate 20% discount
      const discountAmount = subtotal * 0.2;
      const finalPrice = subtotal - discountAmount;
      
      setDiscount(discountAmount);
      setTotal(finalPrice);
      setHasPromo(true);
      setPromoData({
        id: "demo-promo-1",
        title: "Welcome Discount",
        code: "WELCOME20",
        discount_type: "PERCENT",
        discount_value: 20
      });
      
      toast({
        title: "Discount applied",
        description: `${formatCurrency(discountAmount)} discount applied to your quote.`,
      });
      
      return true;
    }
    
    // Simulate failed code application
    toast({
      title: "Invalid code",
      description: "The code you entered is invalid or expired.",
      variant: "destructive",
    });
    
    return false;
  };

  // Simulate removing a code
  const handleRemoveCode = () => {
    setDiscount(0);
    setTotal(subtotal);
    setHasPromo(false);
    setPromoData(null);
    
    toast({
      title: "Discount removed",
      description: "The discount has been removed from your quote.",
    });
  };

  // Simulate updating the subtotal
  const handleUpdateSubtotal = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formElement = e.target as HTMLFormElement;
    const newSubtotalStr = (formElement.elements.namedItem("subtotal") as HTMLInputElement)?.value;
    
    if (newSubtotalStr) {
      const newSubtotal = parseFloat(newSubtotalStr);
      
      if (!isNaN(newSubtotal) && newSubtotal >= 0) {
        setSubtotal(newSubtotal);
        
        // Recalculate discount if promo is applied
        if (hasPromo && promoData) {
          if (promoData.discount_type === "PERCENT") {
            const newDiscount = newSubtotal * (promoData.discount_value / 100);
            setDiscount(newDiscount);
            setTotal(newSubtotal - newDiscount);
          } else {
            // For fixed amount discounts
            const newDiscount = Math.min(promoData.discount_value, newSubtotal);
            setDiscount(newDiscount);
            setTotal(newSubtotal - newDiscount);
          }
        } else {
          setTotal(newSubtotal);
        }
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader 
        title="Promo Code Test Page" 
        description="This page demonstrates the functionality of promotional codes"
      />
      
      <div className="grid md:grid-cols-3 gap-8 mt-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-primary" />
                <CardTitle>Quote Simulator</CardTitle>
              </div>
              <CardDescription>
                Update the quote subtotal and apply promotional codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSubtotal} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Quote Subtotal</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="subtotal"
                      name="subtotal"
                      type="number" 
                      min="0" 
                      step="100"
                      defaultValue={subtotal.toString()} 
                    />
                    <Button type="submit">Update</Button>
                  </div>
                </div>
              </form>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Price Breakdown</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-2 text-primary" />
                      <span className={`${discount > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        Discount:
                      </span>
                    </div>
                    <span className={discount > 0 ? 'text-primary font-medium' : ''}>
                      {discount > 0 ? `-${formatCurrency(discount)}` : '—'}
                    </span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Tag className="h-5 w-5 mr-2 text-primary" />
                <CardTitle>Testing Instructions</CardTitle>
              </div>
              <CardDescription>
                How to test the promotional code functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h3 className="text-sm font-medium mb-2">Valid Promo Code</h3>
                <div className="grid place-items-center bg-primary/10 rounded-md p-3 font-mono text-lg font-bold tracking-wide">
                  WELCOME20
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use this code to get a 20% discount on the quote subtotal.
                </p>
              </div>
              
              <ol className="list-decimal list-inside space-y-2 ml-2 text-sm">
                <li>Enter a subtotal amount and click <strong>Update</strong></li>
                <li>Enter the promo code <strong>WELCOME20</strong> in the sidebar</li>
                <li>Click <strong>Apply Code</strong> to calculate the discount</li>
                <li>To remove the discount, click <strong>Remove</strong> in the promo summary</li>
                <li>Try an invalid code to see the error handling</li>
              </ol>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Promotional Code</h3>
          
          {!hasPromo ? (
            <CouponCodeInput onApplyCode={handleApplyCode} />
          ) : (
            <PromoCodeSummary
              promoData={promoData}
              originalPrice={subtotal}
              discountAmount={discount}
              finalPrice={total}
              onRemove={handleRemoveCode}
            />
          )}
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This demonstration shows how promotional codes are validated and applied to quotes.
                In a production environment, these codes would be validated against a database.
              </p>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">
                The actual implementation uses the server-side <code>/api/apply-code</code> endpoint
                to validate codes and calculate discounts.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}