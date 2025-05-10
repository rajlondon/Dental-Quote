import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import CouponCodeInput from '@/components/clinic/CouponCodeInput';
import PromoCodeSummary from '@/components/clinic/PromoCodeSummary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/PageHeader';
import FEATURES from '@/lib/feature-flags';

const DUMMY_CLINIC_ID = '1'; // Replace with actual clinic ID in production

const PromoCodeTestPage: React.FC = () => {
  const { toast } = useToast();
  const [quoteId, setQuoteId] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    subtotal: number;
    discount: number;
    total: number;
    promoLabel: string;
  } | null>(null);

  // Handle successful promo code application
  const handlePromoSuccess = (data: {
    subtotal: number;
    discount: number;
    total: number;
    promoLabel: string;
  }) => {
    setAppliedPromo({
      code: data.promoLabel.replace(' applied', ''),
      ...data,
    });
    
    toast({
      title: 'Success',
      description: 'Promo code applied successfully',
    });
  };

  return (
    <div className="container py-8">
      <PageHeader
        title="Promo Code Testing"
        description="Test the hybrid coupon code system"
      />

      {!FEATURES.COUPON_CODES ? (
        <Card className="mb-8 border-yellow-300 bg-yellow-50">
          <CardContent className="pt-6">
            <p>The coupon code feature is currently disabled. Enable it in feature-flags.ts to test.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="apply" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="apply">Apply Codes</TabsTrigger>
            <TabsTrigger value="manage">Manage Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="apply">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enter Quote ID</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="quote-id">Quote ID</Label>
                      <Input
                        id="quote-id"
                        placeholder="Enter quote ID"
                        value={quoteId}
                        onChange={(e) => setQuoteId(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (!quoteId) {
                          toast({
                            title: 'Error',
                            description: 'Please enter a valid quote ID',
                            variant: 'destructive',
                          });
                          return;
                        }
                        setFormVisible(true);
                      }}
                      className="w-full"
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {formVisible && (
                <div className="space-y-6">
                  <CouponCodeInput
                    quoteId={quoteId}
                    clinicId={DUMMY_CLINIC_ID}
                    onSuccess={handlePromoSuccess}
                  />

                  {appliedPromo && (
                    <PromoCodeSummary
                      code={appliedPromo.code}
                      discountType="PERCENT"
                      discountValue={20} // This would come from the API in a real implementation
                      subtotal={appliedPromo.subtotal}
                      discount={appliedPromo.discount}
                      total={appliedPromo.total}
                    />
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Code Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The code management interface is currently under development.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PromoCodeTestPage;