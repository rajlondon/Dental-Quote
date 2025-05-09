import React, { useState } from 'react';
import { usePromoApi } from '@/hooks/use-promo-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PromoTokenTestPage: React.FC = () => {
  const { createQuoteFromPromo } = usePromoApi();
  const { toast } = useToast();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [generatedQuoteId, setGeneratedQuoteId] = useState<string | null>(null);

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Token required",
        description: "Please enter a promo token to continue",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await createQuoteFromPromo.mutateAsync({
        token,
        visitorEmail: email || undefined,
      });
      
      setGeneratedQuoteId(result.quoteId);
      
      toast({
        title: "Success!",
        description: `Quote created successfully with ID: ${result.quoteId}`,
      });
    } catch (error) {
      console.error('Failed to create quote:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Promo Token Tester</h1>
      <p className="text-gray-600 mb-6">
        This page allows you to test the promo token API by creating a quote from a token.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create Quote from Promo Token</h2>
          <form onSubmit={handleCreateQuote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Promo Token (required)</Label>
              <Input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter promo token"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Visitor Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter visitor email for notifications"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={createQuoteFromPromo.isPending}
            >
              {createQuoteFromPromo.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating quote...
                </>
              ) : (
                'Create Quote from Token'
              )}
            </Button>
          </form>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          
          {createQuoteFromPromo.isPending ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : generatedQuoteId ? (
            <div className="space-y-4">
              <Alert variant="success" className="bg-green-50 border-green-200">
                <AlertTitle className="text-green-800">Quote Created Successfully!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your quote has been created with the following details:
                </AlertDescription>
              </Alert>
              
              <div className="rounded-md bg-slate-50 p-4">
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Quote ID:</span>
                    <code className="ml-2 bg-slate-200 px-2 py-1 rounded text-sm">{generatedQuoteId}</code>
                  </div>
                  <div>
                    <span className="font-semibold">Token Used:</span>
                    <code className="ml-2 bg-slate-200 px-2 py-1 rounded text-sm">{token}</code>
                  </div>
                  {email && (
                    <div>
                      <span className="font-semibold">Notification Email:</span>
                      <span className="ml-2">{email}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Next Steps:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>View the quote details in the patient portal</li>
                  <li>Check for any special offers or packages applied</li>
                  <li>Verify that the quote lines match expectations</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              No quote created yet. Fill out the form and submit to test the API.
            </div>
          )}
        </Card>
      </div>
      
      <div className="mt-8 p-4 bg-slate-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">API Information</h3>
        <p className="text-sm text-gray-600 mb-4">
          This test page uses the <code className="bg-slate-200 px-1 rounded">/api/v1/quotes/from-promo</code> 
          endpoint to create quotes from promo tokens.
        </p>
        
        <div className="bg-slate-900 text-slate-100 p-4 rounded text-sm font-mono overflow-x-auto">
          <pre>{`// Example API Request
POST /api/v1/quotes/from-promo
{
  "token": "your-promo-token",
  "visitorEmail": "optional-email@example.com"
}

// Example Success Response
{
  "success": true,
  "quoteId": "generated-uuid-for-quote"
}`}</pre>
        </div>
      </div>
    </div>
  );
};

export default PromoTokenTestPage;