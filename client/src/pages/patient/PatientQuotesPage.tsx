import React, { useEffect, useState } from 'react';
import { useQuoteSystem } from '@/hooks/use-quote-system';
import QuoteIntegrationWidget from '@/components/quotes/QuoteIntegrationWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/format-utils';
import { useToast } from '@/hooks/use-toast';

const PatientQuotesPage: React.FC = () => {
  const { quotes, loading, loadQuotes } = useQuoteSystem('patient');
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadQuotes()
      .catch(error => {
        console.error('Error loading quotes:', error);
      });
  }, [loadQuotes]);

  const handleViewQuote = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Dental Quotes</h1>
        <p className="text-muted-foreground">
          View and manage your dental treatment quotes
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : selectedQuoteId ? (
        <div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedQuoteId(null)}
            className="mb-6"
          >
            ← Back to all quotes
          </Button>
          <QuoteIntegrationWidget
            quoteId={selectedQuoteId}
            portalType="patient"
            mode="edit"
          />
        </div>
      ) : (
        <div>
          {quotes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground mb-4"
                  >
                    <path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1h3Z" />
                    <path d="M8 6H5a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7a1 1 0 0 0-1-1H8Z" />
                  </svg>
                  <h2 className="text-xl font-semibold mb-2">No quotes yet</h2>
                  <p className="text-muted-foreground mb-4">
                    You don't have any dental treatment quotes yet.
                  </p>
                  <Button
                    onClick={() => {
                      toast({
                        title: "Quote Builder",
                        description: "The quote builder would launch from here in the full application."
                      });
                    }}
                  >
                    Create New Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quotes.map((quote) => (
                <Card
                  key={quote.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {quote.clinicName || 'Dental Treatment Quote'}
                      </CardTitle>
                      <Badge className={
                        quote.status === 'accepted' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                        quote.status === 'rejected' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                        quote.status === 'sent' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                        quote.status === 'completed' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                        'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created on {formatDate(quote.createdAt, 'short')}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium">Total</div>
                        <div className="text-2xl font-bold">
                          ${quote.total.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Treatments</div>
                        <div className="text-sm text-muted-foreground">
                          {quote.treatments.length} {quote.treatments.length === 1 ? 'item' : 'items'}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleViewQuote(quote.id)}
                        className="w-full mt-2"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientQuotesPage;