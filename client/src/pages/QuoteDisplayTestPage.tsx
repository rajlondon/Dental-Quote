import React, { useState } from 'react';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tag, Percent, Clock, CheckCircle2, ArrowUpDown, Download, Info } from 'lucide-react';

// Currency formatter helper function
const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Sample quote data with different promo codes for demonstration
 */
const SAMPLE_QUOTES: Record<string, any> = {
  'quote-123': {
    id: 'quote-123',
    reference: 'Q-2025-05-001',
    patientName: 'John Smith',
    createdAt: '2025-05-01T10:30:00Z',
    status: 'confirmed',
    currency: 'USD',
    totalAmount: 3600,
    discountAmount: 400,
    promoCode: 'WELCOME10',
    promoDescription: '10% off your first dental treatment',
    treatments: [
      { id: 't1', name: 'Dental Cleaning', quantity: 1, unitPrice: 150, totalPrice: 150 },
      { id: 't2', name: 'Dental Implant', quantity: 1, unitPrice: 1200, totalPrice: 1200 },
      { id: 't3', name: 'Porcelain Crown', quantity: 2, unitPrice: 800, totalPrice: 1600 },
      { id: 't4', name: 'X-Ray Full Mouth', quantity: 1, unitPrice: 300, totalPrice: 300 },
      { id: 't5', name: 'Consultation', quantity: 1, unitPrice: 150, totalPrice: 150 }
    ],
    clinic: {
      id: 'c1',
      name: 'DentSpa Istanbul Clinic',
      location: 'Istanbul, Turkey',
      rating: 4.8
    }
  },
  'quote-456': {
    id: 'quote-456',
    reference: 'Q-2025-05-002',
    patientName: 'Emma Johnson',
    createdAt: '2025-05-05T14:15:00Z',
    status: 'pending',
    currency: 'USD',
    totalAmount: 3200,
    discountAmount: 800,
    promoCode: 'SUMMER20',
    promoDescription: '20% summer season discount on all treatments',
    treatments: [
      { id: 't1', name: 'Root Canal Treatment', quantity: 1, unitPrice: 600, totalPrice: 600 },
      { id: 't2', name: 'All-On-4 Dental Implants', quantity: 1, unitPrice: 3000, totalPrice: 3000 },
      { id: 't3', name: 'Consultation', quantity: 1, unitPrice: 400, totalPrice: 400 }
    ],
    clinic: {
      id: 'c2',
      name: 'Best Dental Solutions',
      location: 'Antalya, Turkey',
      rating: 4.7
    }
  },
  'quote-789': {
    id: 'quote-789',
    reference: 'Q-2025-05-003',
    patientName: 'Michael Brown',
    createdAt: '2025-05-10T09:45:00Z',
    status: 'confirmed',
    currency: 'USD',
    totalAmount: 5000,
    discountAmount: 0,
    promoCode: null,
    treatments: [
      { id: 't1', name: 'Full Mouth Veneers', quantity: 1, unitPrice: 4000, totalPrice: 4000 },
      { id: 't2', name: 'Professional Whitening', quantity: 1, unitPrice: 600, totalPrice: 600 },
      { id: 't3', name: 'Dental Consultation', quantity: 1, unitPrice: 400, totalPrice: 400 }
    ],
    clinic: {
      id: 'c3',
      name: 'Premium Smile Center',
      location: 'Istanbul, Turkey',
      rating: 4.9
    }
  },
  'package-001': {
    id: 'package-001',
    reference: 'Q-2025-05-004',
    patientName: 'Sarah Wilson',
    createdAt: '2025-05-15T16:30:00Z',
    status: 'confirmed',
    currency: 'USD',
    totalAmount: 4200,
    discountAmount: 1800,
    promoCode: 'IMPLANTCROWN30',
    promoDescription: '30% off on our premium implant and crown package',
    treatments: [
      { id: 't1', name: 'Premium Dental Implant', quantity: 2, unitPrice: 1500, totalPrice: 3000 },
      { id: 't2', name: 'Ceramic Crown', quantity: 2, unitPrice: 1500, totalPrice: 3000 }
    ],
    clinic: {
      id: 'c4',
      name: 'Luxury Dental Care',
      location: 'Izmir, Turkey',
      rating: 4.8
    }
  }
};

interface QuoteDetailDisplayProps {
  quote: any;
}

/**
 * Quote Detail Display Component
 */
const QuoteDetailDisplay: React.FC<QuoteDetailDisplayProps> = ({ quote }) => {
  if (!quote) {
    return <div className="p-8 text-center text-muted-foreground">Please select a quote to display</div>;
  }
  
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const downloadPdf = () => {
    alert('PDF download functionality - would connect to backend PDF generation service in production');
  };
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Quote #{quote.reference}</h1>
          <p className="text-muted-foreground">
            <Clock className="inline mr-2 h-4 w-4" />
            Created on {formatDate(quote.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-start md:items-end">
          <Badge className={getStatusBadgeColor(quote.status)}>
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">
            Patient: {quote.patientName}
          </p>
        </div>
      </div>
      
      {quote.promoCode && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
          <Tag className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-800">Promo Code Applied: {quote.promoCode}</h3>
            <p className="text-green-700 text-sm mt-1">{quote.promoDescription}</p>
          </div>
        </div>
      )}
      
      <div>
        <h2 className="font-semibold text-lg mb-4">Treatment Details</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Treatment</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quote.treatments.map((treatment: any) => (
              <TableRow key={treatment.id}>
                <TableCell>{treatment.name}</TableCell>
                <TableCell className="text-right">{treatment.quantity}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(treatment.unitPrice, quote.currency)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(treatment.totalPrice, quote.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="bg-muted p-4 rounded-md">
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>{formatCurrency(quote.totalAmount + quote.discountAmount, quote.currency)}</span>
        </div>
        
        {quote.discountAmount > 0 && (
          <div className="flex justify-between mb-2 text-green-600">
            <span className="flex items-center">
              <Percent className="h-4 w-4 mr-1" /> 
              Discount{quote.promoCode ? ` (${quote.promoCode})` : ''}:
            </span>
            <span>-{formatCurrency(quote.discountAmount, quote.currency)}</span>
          </div>
        )}
        
        <Separator className="my-2" />
        
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span className="text-lg">{formatCurrency(quote.totalAmount, quote.currency)}</span>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="font-semibold flex items-center text-blue-800">
          <Info className="h-4 w-4 mr-2" />
          Clinic Information
        </h3>
        <div className="mt-2">
          <p className="font-medium">{quote.clinic.name}</p>
          <p className="text-sm text-muted-foreground">{quote.clinic.location}</p>
          <div className="flex items-center mt-1">
            <span className="text-yellow-500">★</span>
            <span className="ml-1 text-sm">{quote.clinic.rating} / 5</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button className="flex items-center" onClick={downloadPdf}>
          <Download className="h-4 w-4 mr-2" />
          Download Quote PDF
        </Button>
      </div>
    </div>
  );
};

/**
 * Test page to demonstrate the enhanced quote display with promo codes
 */
const QuoteDisplayTestPage: React.FC = () => {
  // Set default quote to show on page load
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('quote-123');
  const [customQuoteId, setCustomQuoteId] = useState<string>('');
  
  const handleViewQuote = () => {
    if (customQuoteId) {
      setSelectedQuoteId(customQuoteId);
    }
  };
  
  const getQuoteById = (id: string) => {
    return SAMPLE_QUOTES[id] || null;
  };
  
  return (
    <Container>
      <PageHeader
        title="Enhanced Quote Display Demo"
        description="Test the enhanced quote detail display with promo code information"
      />
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              This demo page allows you to test the enhanced quote display component that prominently 
              shows promo codes and discount information.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <p className="font-medium mb-2">Available Sample Quote IDs:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><code>quote-123</code> - Quote with "WELCOME10" promo code (10% off)</li>
                  <li><code>quote-456</code> - Quote with "SUMMER20" promo code (20% off)</li>
                  <li><code>quote-789</code> - Quote without a promo code</li>
                  <li><code>package-001</code> - Quote with a package discount (IMPLANTCROWN30)</li>
                </ul>
              </div>
              
              <div className="flex-1">
                <p className="font-medium mb-2">Features Demonstrated:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Promo code display with green highlight box</li>
                  <li>Savings amount calculation and display</li>
                  <li>PDF download functionality</li>
                  <li>Responsive layout across all devices</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 flex flex-wrap gap-3">
              {Object.keys(SAMPLE_QUOTES).map((quoteId) => (
                <Button
                  key={quoteId}
                  variant={selectedQuoteId === quoteId ? "default" : "outline"}
                  onClick={() => setSelectedQuoteId(quoteId)}
                  className="flex-grow-0"
                >
                  {quoteId}
                </Button>
              ))}
            </div>
            
            <div className="pt-4 border-t flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Or enter a custom Quote ID
                </label>
                <Input 
                  value={customQuoteId} 
                  onChange={(e) => setCustomQuoteId(e.target.value)}
                  placeholder="e.g., quote-123"
                />
              </div>
              <Button onClick={handleViewQuote} disabled={!customQuoteId}>
                View Quote
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="border rounded-lg p-6 my-8 bg-card">
        <h2 className="text-xl font-bold mb-6">Quote Display:</h2>
        <QuoteDetailDisplay quote={getQuoteById(selectedQuoteId)} />
      </div>
    </Container>
  );
};

export default QuoteDisplayTestPage;