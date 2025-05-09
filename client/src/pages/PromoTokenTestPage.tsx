import React, { useState } from 'react';
import { usePromoApi } from '@/hooks/use-promo-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function PromoTokenTestPage() {
  const [promoToken, setPromoToken] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [quoteId, setQuoteId] = useState<string | null>(null);

  const { createQuoteFromPromoMutation } = usePromoApi();

  const handleCreateQuote = async () => {
    if (!promoToken) {
      toast({
        title: 'Error',
        description: 'Please enter a promotion token',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await createQuoteFromPromoMutation.mutateAsync({
        token: promoToken,
        visitorEmail: visitorEmail || undefined,
      });

      if (result.success) {
        setQuoteId(result.quoteId);
        toast({
          title: 'Success',
          description: `Quote created with ID: ${result.quoteId}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create quote',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Promo Token Test</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create Quote from Promotion Token</CardTitle>
          <CardDescription>
            Test the promotional quote creation API by providing a valid promo token and optional visitor email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="promoToken">Promotion Token (required)</Label>
            <Input
              id="promoToken"
              value={promoToken}
              onChange={(e) => setPromoToken(e.target.value)}
              placeholder="Enter promotion token"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visitorEmail">Visitor Email (optional)</Label>
            <Input
              id="visitorEmail"
              type="email"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              placeholder="Enter visitor email"
            />
            <p className="text-sm text-muted-foreground">
              If provided, this email will be associated with the quote for future notifications.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setPromoToken('');
              setVisitorEmail('');
              setQuoteId(null);
            }}
          >
            Reset
          </Button>
          <Button
            onClick={handleCreateQuote}
            disabled={createQuoteFromPromoMutation.isPending}
          >
            {createQuoteFromPromoMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              'Create Quote'
            )}
          </Button>
        </CardFooter>
      </Card>

      {quoteId && (
        <>
          <Separator className="my-6" />
          <Card>
            <CardHeader>
              <CardTitle>Quote Created</CardTitle>
              <CardDescription>The quote was created successfully.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-md">
                <p className="font-mono break-all">Quote ID: {quoteId}</p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  This quote is now saved in the database and associated with the promotion token.
                  It can be viewed from the admin or clinic dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}