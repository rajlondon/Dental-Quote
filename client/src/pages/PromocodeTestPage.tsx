import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { InfoIcon, TicketIcon } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { CouponCodeInput } from "@/components/clinic/CouponCodeInput";
import { PromoCodeSummary } from "@/components/clinic/PromoCodeSummary";
import { ApplyCodeResponse, PromoDetails, QuoteDetails } from "@/hooks/use-apply-code";

// Mock data for testing purposes
const mockQuote: QuoteDetails = {
  id: "f8a7b6c5-1234-5678-90ab-cdef12345678",
  subtotal: 1200,
  discount: 0,
  total_price: 1200,
  patient_id: "patient-123",
  clinic_id: "clinic-456",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const samplePromos: PromoDetails[] = [
  {
    id: "promo-123",
    title: "Welcome Discount 20%",
    code: "WELCOME20",
    discount_type: "PERCENT",
    discount_value: 20,
    is_active: true,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  },
  {
    id: "promo-456",
    title: "Summer Special €50 Off",
    code: "SUMMER50",
    discount_type: "AMOUNT",
    discount_value: 50,
    is_active: true,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
  }
];

/**
 * Test page for demonstrating promo code functionality
 */
export default function PromocodeTestPage() {
  const [quote, setQuote] = useState<QuoteDetails>(mockQuote);
  const [appliedPromo, setAppliedPromo] = useState<PromoDetails | null>(null);
  const [testTab, setTestTab] = useState<string>("apply");

  // Simulate applying a promo code
  const handlePromoApplied = (response: ApplyCodeResponse) => {
    if (response.success && response.quote && response.promo) {
      setQuote(response.quote);
      setAppliedPromo(response.promo);
      setTestTab("summary");
    }
  };

  // Simulate removing a promo code
  const handlePromoRemoved = () => {
    setQuote({
      ...mockQuote,
      discount: 0,
      total_price: mockQuote.subtotal,
      promo_id: undefined
    });
    setAppliedPromo(null);
    setTestTab("apply");
  };

  // Simulate direct application of a sample promo
  const applyMockPromo = (promo: PromoDetails) => {
    const discountAmount = promo.discount_type === "PERCENT" 
      ? (mockQuote.subtotal * (promo.discount_value / 100)) 
      : Math.min(promo.discount_value, mockQuote.subtotal);
    
    const updatedQuote = {
      ...mockQuote,
      discount: discountAmount,
      total_price: mockQuote.subtotal - discountAmount,
      promo_id: promo.id
    };
    
    setQuote(updatedQuote);
    setAppliedPromo(promo);
    setTestTab("summary");
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <PageHeader 
        title="Promo Code Testing" 
        description="Test the hybrid promotional system with both automatic and manual code entry"
      />

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TicketIcon className="h-5 w-5" />
                Coupon Code System
              </CardTitle>
              <CardDescription>
                Apply promotional codes to quotes for instant discounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={testTab} onValueChange={setTestTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="apply">Apply Code</TabsTrigger>
                  <TabsTrigger value="summary" disabled={!appliedPromo}>Summary</TabsTrigger>
                </TabsList>
                <TabsContent value="apply" className="space-y-4 pt-4">
                  {!appliedPromo ? (
                    <>
                      <div className="space-y-4">
                        <h3 className="font-medium">Enter Coupon Code</h3>
                        <CouponCodeInput 
                          quoteId={quote.id} 
                          onApplied={() => handlePromoApplied({
                            success: true,
                            message: "Promo code applied successfully",
                            quote: {
                              ...quote,
                              discount: 240, // 20% of 1200
                              total_price: 960,
                              promo_id: "promo-123"
                            },
                            promo: samplePromos[0]
                          })}
                        />
                        
                        <Separator className="my-4" />
                        
                        <h3 className="font-medium">Or Select a Sample Promo</h3>
                        <div className="grid gap-2">
                          {samplePromos.map((promo) => (
                            <Button 
                              key={promo.id} 
                              variant="outline" 
                              className="justify-start"
                              onClick={() => applyMockPromo(promo)}
                            >
                              <TicketIcon className="mr-2 h-4 w-4" />
                              {promo.title} - Code: <span className="font-bold ml-1">{promo.code}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t mt-4">
                        <h3 className="font-medium mb-2">Current Quote</h3>
                        <div className="flex justify-between py-1">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(quote.subtotal)}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Discount:</span>
                          <span>{formatCurrency(quote.discount)}</span>
                        </div>
                        <div className="flex justify-between py-1 font-bold">
                          <span>Total:</span>
                          <span>{formatCurrency(quote.total_price)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center p-8">
                      <Button onClick={() => setTestTab("summary")}>
                        View Applied Promo
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="summary" className="pt-4">
                  {appliedPromo ? (
                    <PromoCodeSummary 
                      promo={appliedPromo} 
                      quote={quote} 
                      onRemove={handlePromoRemoved} 
                    />
                  ) : (
                    <div className="flex items-center justify-center p-8 text-center">
                      <div>
                        <InfoIcon className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                        <p>No promotion has been applied yet</p>
                        <Button variant="outline" onClick={() => setTestTab("apply")} className="mt-4">
                          Apply a Promo Code
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Overview of the hybrid promotional system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Key Features</h3>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Support for both percentage and fixed-amount discounts</li>
                  <li>Manual coupon code entry for patient-initiated discounts</li>
                  <li>Automatic token-based special offers from marketing campaigns</li>
                  <li>Comprehensive validation for eligibility, expiration, and clinic association</li>
                  <li>Integration with analytics for campaign tracking</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Testing Instructions</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Try the following sample codes:
                </p>
                <ul className="space-y-1 text-sm">
                  <li><span className="font-mono bg-muted px-1 rounded">WELCOME20</span> - 20% off your treatment</li>
                  <li><span className="font-mono bg-muted px-1 rounded">SUMMER50</span> - €50 off your treatment</li>
                  <li><span className="font-mono bg-muted px-1 rounded">INVALID</span> - Should return an error</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Technical Implementation</h3>
                <p className="text-sm text-muted-foreground">
                  This hybrid system integrates with both the existing token-based special 
                  offers and the new manual coupon code entry. The backend validates codes, 
                  applies discounts, and tracks usage for analytics.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}