import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Phone, Mail, FileText, Heart, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';

interface QuoteResponse {
  id: number;
  patientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    medicalHistory?: string;
    concerns?: string;
    expectations?: string;
  };
  treatments: Array<{
    id: string;
    name: string;
    quantity: number;
    priceGBP: number;
    subtotalGBP: number;
    category: string;
  }>;
  dentalChart?: {
    selectedConditions: Array<{
      toothNumber: string;
      condition: string;
      severity?: string;
    }>;
    painLevel?: number;
  };
  promoCode?: {
    code: string;
    title?: string;
    benefits?: Array<{
      description: string;
      value: string;
    }>;
  };
  selectedClinic?: {
    clinicName: string;
    estimatedTotal: number;
    currency: string;
  };
  totalEstimate: {
    gbp: number;
    usd: number;
    savings?: number;
  };
  status: string;
  createdAt: string;
  submittedAt?: string;
  clinicReviewedAt?: string;
  clinicNotes?: string;
}

export default function MyQuotesSection() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyQuotes();
  }, []);

  const fetchMyQuotes = async () => {
    try {
      const response = await fetch('/api/quote-responses/my-quotes', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setQuotes(result.data || []);
      } else {
        setError('Failed to load your quotes');
      }
    } catch (err) {
      setError('Error loading quotes');
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Submitted to Clinic';
      case 'under_review': return 'Under Review';
      case 'quoted': return 'Quote Received';
      case 'booked': return 'Booked';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading your quotes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{error}</p>
            <Button onClick={fetchMyQuotes} className="mt-4">Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Quote Requests Yet</h3>
            <p className="mb-4">You haven't submitted any treatment quotes yet.</p>
            <Button onClick={() => window.open('/your-quote', '_blank')}>
              Create Your First Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Quote Requests</h2>
        <Badge variant="outline">{quotes.length} total quotes</Badge>
      </div>

      {quotes.map((quote) => (
        <Card key={quote.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Quote #{quote.id} - {quote.selectedClinic?.clinicName || 'Multiple Clinics'}
              </CardTitle>
              <Badge className={getStatusColor(quote.status)}>
                {getStatusText(quote.status)}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {format(new Date(quote.createdAt), 'MMM dd, yyyy')}
              </div>
              {quote.selectedClinic && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Istanbul, Turkey
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Treatment Summary */}
            <div>
              <h4 className="font-medium mb-2">Selected Treatments</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                {quote.treatments.map((treatment, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <span className="text-sm">
                      {treatment.name} {treatment.quantity > 1 && `x${treatment.quantity}`}
                    </span>
                    <span className="text-sm font-medium">£{treatment.subtotalGBP}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                  <span>Total Estimate</span>
                  <span>£{quote.totalEstimate.gbp}</span>
                </div>
                {quote.totalEstimate.savings && (
                  <div className="text-green-600 text-sm">
                    You save £{quote.totalEstimate.savings} compared to UK prices
                  </div>
                )}
              </div>
            </div>

            {/* Promo Code */}
            {quote.promoCode && (
              <div>
                <h4 className="font-medium mb-2">Applied Special Offer</h4>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Badge className="bg-purple-600 text-white mr-2">
                      {quote.promoCode.code}
                    </Badge>
                    <span className="font-medium">{quote.promoCode.title}</span>
                  </div>
                  {quote.promoCode.benefits?.map((benefit, idx) => (
                    <div key={idx} className="text-sm text-purple-700">
                      • {benefit.description} ({benefit.value})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dental Conditions */}
            {quote.dentalChart?.selectedConditions && quote.dentalChart.selectedConditions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Dental Conditions</h4>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {quote.dentalChart.selectedConditions.map((condition, idx) => (
                      <div key={idx} className="flex items-center">
                        <Heart className="h-3 w-3 mr-1 text-blue-500" />
                        Tooth {condition.toothNumber}: {condition.condition}
                      </div>
                    ))}
                  </div>
                  {quote.dentalChart.painLevel && (
                    <div className="mt-2 text-sm text-blue-700">
                      Pain Level: {quote.dentalChart.painLevel}/10
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Updates */}
            <div className="border-t pt-3">
              <h4 className="font-medium mb-2">Status Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Quote created - {format(new Date(quote.createdAt), 'MMM dd, yyyy HH:mm')}
                </div>
                {quote.submittedAt && (
                  <div className="flex items-center text-blue-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submitted to clinic - {format(new Date(quote.submittedAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                )}
                {quote.clinicReviewedAt && (
                  <div className="flex items-center text-yellow-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Clinic reviewed - {format(new Date(quote.clinicReviewedAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                )}
              </div>
            </div>

            {/* Clinic Notes */}
            {quote.clinicNotes && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-medium text-green-800 mb-1">Clinic Response</h4>
                <p className="text-sm text-green-700">{quote.clinicNotes}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  {quote.patientInfo.email}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  {quote.patientInfo.phone}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}