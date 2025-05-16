import React, { useEffect, useState } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { ChevronLeft, Calendar, Printer, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currency-formatter';
import { quoteService, Quote } from '@/services/quote-service';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from '@/hooks/use-toast';

function QuoteDetailPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/quotes/:id');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (params?.id) {
      setLoading(true);
      try {
        const foundQuote = quoteService.getQuoteById(params.id);
        if (foundQuote) {
          setQuote(foundQuote);
        } else {
          toast({
            title: 'Quote Not Found',
            description: 'The requested quote could not be found.',
            variant: 'destructive'
          });
          navigate('/quotes');
        }
      } catch (error) {
        console.error('Error loading quote:', error);
        toast({
          title: 'Error Loading Quote',
          description: 'There was a problem loading the quote details.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
  }, [params?.id, navigate]);
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handlePrintQuote = () => {
    toast({
      title: 'Print Feature',
      description: 'Print functionality will be implemented soon.',
    });
  };
  
  const handleEmailQuote = () => {
    toast({
      title: 'Email Feature',
      description: 'Email functionality will be implemented soon.',
    });
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!quote) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Quote Not Found</h2>
            <p className="mb-6 text-gray-600">The quote you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/quotes">Back to Quotes</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-5xl">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" asChild>
            <Link href="/quotes">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Quotes
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quote summary */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Quote #{quote.id.substring(0, 8)}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Created on {formatDate(quote.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(quote.status)}>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Selected Treatments</h3>
                    <div className="space-y-2">
                      {quote.treatments.map((treatment, index) => (
                        <div key={index} className="flex justify-between border-b pb-2 last:border-b-0 last:pb-0">
                          <div>
                            <p className="font-medium">{treatment.name}</p>
                            {treatment.description && (
                              <p className="text-sm text-gray-500">{treatment.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(treatment.price)}</p>
                            {treatment.quantity > 1 && (
                              <p className="text-sm text-gray-500">Qty: {treatment.quantity}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {quote.selectedPackage && (
                    <div>
                      <h3 className="font-semibold mb-2">Package</h3>
                      <div className="border rounded-md p-3 bg-gray-50">
                        <div className="flex justify-between mb-2">
                          <p className="font-medium">{quote.selectedPackage.name}</p>
                          <p className="font-medium">{formatCurrency(quote.selectedPackage.price)}</p>
                        </div>
                        <p className="text-sm text-gray-600">{quote.selectedPackage.description}</p>
                      </div>
                    </div>
                  )}
                  
                  {quote.appliedOffer && (
                    <div>
                      <h3 className="font-semibold mb-2">Special Offer</h3>
                      <div className="border rounded-md p-3 bg-green-50">
                        <div className="flex justify-between mb-2">
                          <p className="font-medium">{quote.appliedOffer.title}</p>
                          <p className="font-medium text-green-600">
                            {quote.appliedOffer.discountType === 'percentage' 
                              ? `${quote.appliedOffer.discount}% off` 
                              : formatCurrency(quote.appliedOffer.discount)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">{quote.appliedOffer.description}</p>
                      </div>
                    </div>
                  )}
                  
                  {quote.promoCode && (
                    <div>
                      <h3 className="font-semibold mb-2">Promo Code</h3>
                      <div className="border rounded-md p-3 bg-blue-50">
                        <p className="font-medium">
                          Code <span className="text-blue-600 font-bold">{quote.promoCode}</span> applied
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
                    </div>
                    
                    {quote.savings > 0 && (
                      <div className="flex justify-between mb-2 text-green-600">
                        <span>Savings:</span>
                        <span>-{formatCurrency(quote.savings)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatCurrency(quote.total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button onClick={handlePrintQuote} variant="outline">
                  <Printer className="h-4 w-4 mr-2" /> Print Quote
                </Button>
                <Button onClick={handleEmailQuote} variant="outline">
                  <Mail className="h-4 w-4 mr-2" /> Email Quote
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Patient details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="font-medium">{quote.patientName}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="font-medium">{quote.patientEmail}</p>
                  </div>
                  
                  {quote.patientPhone && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p className="font-medium">{quote.patientPhone}</p>
                    </div>
                  )}
                  
                  {quote.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                      <p className="text-sm">{quote.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Request Appointment</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default QuoteDetailPage;