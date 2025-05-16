import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { quoteService } from '@/services/quote-service';
import { emailService } from '@/services/email-service';
import { formatCurrency } from '@/utils/currency-formatter';
import { Download, Printer, Mail, ArrowLeft } from 'lucide-react';

export default function QuoteDetailPage() {
  const [location, navigate] = useLocation();
  const [quote, setQuote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Extract the quote ID from the URL
  const quoteId = location.split('/').pop();
  
  useEffect(() => {
    if (quoteId) {
      // Fetch quote details
      const quoteData = quoteService.getQuoteById(quoteId);
      
      if (quoteData) {
        setQuote(quoteData);
      } else {
        // If quote not found, navigate back to quotes list
        navigate('/quotes');
      }
      
      setIsLoading(false);
    }
  }, [quoteId, navigate]);
  
  const handleSendEmail = async () => {
    if (!quote) return;
    
    setIsSendingEmail(true);
    try {
      await emailService.sendQuoteEmail(quote);
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  if (isLoading) {
    return <div className="container mx-auto p-8 text-center">Loading quote details...</div>;
  }
  
  if (!quote) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Quote Not Found</h1>
        <p className="mb-6">The quote you're looking for couldn't be found.</p>
        <Button onClick={() => navigate('/quotes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quotes
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/quotes')}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Quote Details</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quote #{quote.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Patient Info */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Patient Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{quote.patientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{quote.patientEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date Created</p>
                        <p className="font-medium">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <div className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${quote.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                          ${quote.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Treatment Details */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Treatment Details</h3>
                  
                  {quote.selectedPackage ? (
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{quote.selectedPackage.name}</h4>
                          <p className="text-sm text-gray-600">
                            {quote.selectedPackage.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(quote.selectedPackage.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-blue-600">
                        Package includes multiple treatments for optimal savings
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-md divide-y">
                      {quote.treatments.map((treatment: any) => (
                        <div 
                          key={treatment.id} 
                          className="flex justify-between items-center p-3"
                        >
                          <div>
                            <h4 className="font-medium">{treatment.name}</h4>
                            <p className="text-sm text-gray-500">
                              {treatment.description}
                            </p>
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(treatment.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Special Offers and Promo Code */}
                {(quote.appliedOffer || quote.promoCode) && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Discounts Applied</h3>
                    <div className="space-y-3">
                      {quote.appliedOffer && (
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                          <h4 className="font-medium">Special Offer</h4>
                          <p className="text-sm">{quote.appliedOffer.title}</p>
                        </div>
                      )}
                      
                      {quote.promoCode && (
                        <div className="bg-green-50 p-3 rounded-md border border-green-100">
                          <h4 className="font-medium">Promo Code</h4>
                          <p className="text-sm font-mono bg-white inline-block px-2 py-1 rounded border border-green-200">
                            {quote.promoCode}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
                </div>
                
                {quote.savings > 0 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Savings:</span>
                    <span className="font-medium">
                      -{formatCurrency(quote.savings)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(quote.total)}</span>
                </div>
                
                <div className="mt-6 space-y-3 pt-4 border-t">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {isSendingEmail ? 'Sending...' : 'Email Quote'}
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Quote
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}