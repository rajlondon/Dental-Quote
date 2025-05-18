import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  FilePlus, 
  Loader2 
} from 'lucide-react';
import QuoteIntegrationWidget from '@/components/quotes/QuoteIntegrationWidget';
import { useQuoteSystem } from '@/hooks/use-quote-system';
import { formatDate } from '@/utils/format-utils';
import { useToast } from '@/hooks/use-toast';

const PatientQuotesPage: React.FC = () => {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const { quotes, loading, error, refetchQuotes } = useQuoteSystem('patient');
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const handleQuoteSelected = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
  };

  const handleBackToList = () => {
    setSelectedQuoteId(null);
  };

  const handleCreateNewQuote = () => {
    // In a real implementation, this would navigate to the quote builder
    toast({
      title: 'Create New Quote',
      description: 'This would navigate to the quote builder in a real implementation.',
      variant: 'default',
    });
  };

  // Loading state
  if (loading && quotes.length === 0) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <div className="flex justify-center my-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading your quotes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && quotes.length === 0) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <Card className="text-center py-8">
          <CardContent>
            <div className="flex flex-col items-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => refetchQuotes()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If a quote is selected, show the quote details
  if (selectedQuoteId) {
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={handleBackToList}
            className="mb-4"
          >
            ← Back to My Quotes
          </Button>
        </div>
        {/* Use our new enhanced quote detail component */}
        <React.Suspense fallback={
          <div className="flex justify-center my-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading quote details...</p>
            </div>
          </div>
        }>
          {/* Dynamic import of PatientQuoteDetail to prevent initial loading */}
          {React.lazy(() => import('@/components/patient/PatientQuoteDetail'))({ id: selectedQuoteId })}
        </React.Suspense>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Dental Quotes</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your dental treatment quotes
          </p>
        </div>
        <Button onClick={handleCreateNewQuote}>
          <FilePlus className="mr-2 h-4 w-4" /> Create New Quote
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Quotes</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Quotes</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {quotes.filter(q => q.status !== 'completed' && q.status !== 'rejected').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotes
                .filter(q => q.status !== 'completed' && q.status !== 'rejected')
                .map(quote => (
                  <Card key={quote.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleQuoteSelected(quote.id)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Quote #{quote.id.substring(0, 8)}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> {formatDate(quote.createdAt, 'short')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Treatments:</span>
                          <span className="font-medium">{quote.treatments.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-semibold">${quote.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                            ${quote.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                              quote.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                              quote.status === 'sent' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'}`
                          }>
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </span>
                        </div>
                        {quote.promoCode && (
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-muted-foreground">Promo:</span>
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                              {quote.promoCode}
                              {quote.discountAmount > 0 && (
                                <span className="ml-1">(-${quote.discountAmount.toFixed(2)})</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuoteSelected(quote.id);
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <div className="flex flex-col items-center">
                  <p className="text-muted-foreground mb-4">You don't have any active quotes</p>
                  <Button onClick={handleCreateNewQuote}>Create Your First Quote</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {quotes.filter(q => q.status === 'completed').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotes
                .filter(q => q.status === 'completed')
                .map(quote => (
                  <Card key={quote.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleQuoteSelected(quote.id)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Quote #{quote.id.substring(0, 8)}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> {formatDate(quote.createdAt, 'short')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Treatments:</span>
                          <span className="font-medium">{quote.treatments.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-semibold">${quote.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            Completed
                          </span>
                        </div>
                        {quote.promoCode && (
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-muted-foreground">Promo:</span>
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium flex items-center">
                              {quote.promoCode}
                              {quote.discountAmount > 0 && (
                                <span className="ml-1">(-${quote.discountAmount.toFixed(2)})</span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuoteSelected(quote.id);
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <div className="flex flex-col items-center">
                  <p className="text-muted-foreground mb-4">You don't have any completed quotes</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="all">
          {quotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotes.map(quote => (
                <Card key={quote.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleQuoteSelected(quote.id)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Quote #{quote.id.substring(0, 8)}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> {formatDate(quote.createdAt, 'short')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Treatments:</span>
                        <span className="font-medium">{quote.treatments.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-semibold">${quote.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${quote.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                            quote.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            quote.status === 'sent' ? 'bg-blue-100 text-blue-800' : 
                            quote.status === 'completed' ? 'bg-purple-100 text-purple-800' : 
                            'bg-gray-100 text-gray-800'}`
                        }>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuoteSelected(quote.id);
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <div className="flex flex-col items-center">
                  <p className="text-muted-foreground mb-4">You don't have any quotes</p>
                  <Button onClick={handleCreateNewQuote}>Create Your First Quote</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientQuotesPage;