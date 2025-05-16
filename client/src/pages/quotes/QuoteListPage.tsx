import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { quoteService } from '@/services/quote-service';
import { formatCurrency } from '@/utils/currency-formatter';
import { Eye, Plus, MailPlus, Download } from 'lucide-react';

export default function QuoteListPage() {
  const [, navigate] = useLocation();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load quotes from service
    const loadedQuotes = quoteService.getAllQuotes();
    setQuotes(loadedQuotes);
    setIsLoading(false);
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Navigate to quote detail page
  const viewQuote = (quoteId: string) => {
    navigate(`/quotes/${quoteId}`);
  };
  
  if (isLoading) {
    return <div className="container mx-auto p-8 text-center">Loading saved quotes...</div>;
  }
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Saved Quotes</h1>
        <Button onClick={() => navigate('/basic-quote-demo')}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Quote
        </Button>
      </div>
      
      {quotes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-medium mb-3">No Saved Quotes</h2>
            <p className="text-gray-500 mb-6">
              You haven't saved any quotes yet. Create your first dental treatment quote to get started.
            </p>
            <Button onClick={() => navigate('/basic-quote-demo')}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Quote
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quotes.map(quote => (
            <Card key={quote.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row">
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-lg">
                        {quote.patientName}'s Quote
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created on {formatDate(quote.createdAt)}
                      </p>
                    </div>
                    <div className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${quote.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                      ${quote.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <div className="mr-4">
                      <span className="font-medium">Email:</span> {quote.patientEmail}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span> {formatCurrency(quote.total)}
                    </div>
                  </div>
                  
                  <div className="mt-4 space-x-2">
                    <Button size="sm" variant="outline" onClick={() => viewQuote(quote.id)}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <MailPlus className="mr-1 h-3 w-3" />
                      Email
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="sm:w-48 p-4 bg-blue-50 flex flex-col justify-center sm:justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Quote Total</div>
                    <div className="text-2xl font-bold">{formatCurrency(quote.total)}</div>
                  </div>
                  
                  {quote.savings > 0 && (
                    <div className="mt-2 text-sm text-green-600">
                      Savings: {formatCurrency(quote.savings)}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}