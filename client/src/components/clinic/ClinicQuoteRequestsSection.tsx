import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Phone, Mail, FileText, Heart, User, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface QuoteRequest {
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

export default function ClinicQuoteRequestsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<number | null>(null);
  const [responseNote, setResponseNote] = useState('');

  useEffect(() => {
    fetchClinicQuotes();
  }, []);

  const fetchClinicQuotes = async () => {
    try {
      const response = await fetch('/api/quote-responses/clinic', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setQuotes(result.data || []);
      } else {
        setError('Failed to load quote requests');
      }
    } catch (err) {
      setError('Error loading quote requests');
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (quoteId: number, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/quote-responses/${quoteId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status,
          clinicNotes: notes
        })
      });

      if (response.ok) {
        // Refresh the quotes list
        fetchClinicQuotes();
        setSelectedQuote(null);
        setResponseNote('');
        
        toast({
          title: "Status Updated",
          description: `Quote request has been marked as ${status}`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update quote status",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error updating quote:', err);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'New Request';
      case 'under_review': return 'Under Review';
      case 'quoted': return 'Quote Sent';
      case 'booked': return 'Booked';
      default: return status;
    }
  };

  const getPriorityLevel = (quote: QuoteRequest) => {
    if (quote.dentalChart?.painLevel && quote.dentalChart.painLevel >= 7) return 'High';
    if (quote.promoCode) return 'Medium';
    return 'Normal';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading quote requests...</span>
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
            <Button onClick={fetchClinicQuotes} className="mt-4">Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const newRequests = quotes.filter(q => q.status === 'submitted');
  const underReview = quotes.filter(q => q.status === 'under_review');
  const completed = quotes.filter(q => ['quoted', 'booked'].includes(q.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Patient Quote Requests</h2>
        <div className="flex space-x-2">
          <Badge variant="outline" className="bg-blue-50">
            {newRequests.length} New
          </Badge>
          <Badge variant="outline" className="bg-yellow-50">
            {underReview.length} In Review
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            {completed.length} Completed
          </Badge>
        </div>
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Quote Requests</h3>
              <p>No patients have submitted quote requests to your clinic yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* New Requests */}
          {newRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-700">New Requests ({newRequests.length})</h3>
              {newRequests.map((quote) => (
                <QuoteRequestCard
                  key={quote.id}
                  quote={quote}
                  onUpdateStatus={updateQuoteStatus}
                  selectedQuote={selectedQuote}
                  setSelectedQuote={setSelectedQuote}
                  responseNote={responseNote}
                  setResponseNote={setResponseNote}
                />
              ))}
            </div>
          )}

          {/* Under Review */}
          {underReview.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-yellow-700">Under Review ({underReview.length})</h3>
              {underReview.map((quote) => (
                <QuoteRequestCard
                  key={quote.id}
                  quote={quote}
                  onUpdateStatus={updateQuoteStatus}
                  selectedQuote={selectedQuote}
                  setSelectedQuote={setSelectedQuote}
                  responseNote={responseNote}
                  setResponseNote={setResponseNote}
                />
              ))}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-700">Completed ({completed.length})</h3>
              {completed.map((quote) => (
                <QuoteRequestCard
                  key={quote.id}
                  quote={quote}
                  onUpdateStatus={updateQuoteStatus}
                  selectedQuote={selectedQuote}
                  setSelectedQuote={setSelectedQuote}
                  responseNote={responseNote}
                  setResponseNote={setResponseNote}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuoteRequestCard({
  quote,
  onUpdateStatus,
  selectedQuote,
  setSelectedQuote,
  responseNote,
  setResponseNote
}: {
  quote: QuoteRequest;
  onUpdateStatus: (id: number, status: string, notes?: string) => void;
  selectedQuote: number | null;
  setSelectedQuote: (id: number | null) => void;
  responseNote: string;
  setResponseNote: (note: string) => void;
}) {
  const priority = getPriorityLevel(quote);
  const isExpanded = selectedQuote === quote.id;

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <User className="h-5 w-5 mr-2" />
            {quote.patientInfo.firstName} {quote.patientInfo.lastName}
          </CardTitle>
          <div className="flex space-x-2">
            <Badge className={getPriorityColor(priority)}>
              {priority} Priority
            </Badge>
            <Badge className={getStatusColor(quote.status)}>
              {getStatusText(quote.status)}
            </Badge>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500 space-x-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {format(new Date(quote.createdAt), 'MMM dd, yyyy HH:mm')}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {quote.patientInfo.city}, {quote.patientInfo.country}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Patient Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-500" />
            <a href={`mailto:${quote.patientInfo.email}`} className="text-blue-600 hover:underline">
              {quote.patientInfo.email}
            </a>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-gray-500" />
            <a href={`tel:${quote.patientInfo.phone}`} className="text-blue-600 hover:underline">
              {quote.patientInfo.phone}
            </a>
          </div>
        </div>

        {/* Treatment Summary */}
        <div>
          <h4 className="font-medium mb-2">Requested Treatments</h4>
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
              <span>Estimated Total</span>
              <span>£{quote.totalEstimate.gbp}</span>
            </div>
          </div>
        </div>

        {/* Promo Code Applied */}
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

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedQuote(isExpanded ? null : quote.id)}
          >
            {isExpanded ? 'Show Less' : 'View Details'}
          </Button>
          
          {quote.status === 'submitted' && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(quote.id, 'under_review')}
            >
              Start Review
            </Button>
          )}
          
          {quote.status === 'under_review' && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setSelectedQuote(quote.id)}
            >
              Send Quote
            </Button>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            {/* Medical Information */}
            {(quote.patientInfo.medicalHistory || quote.patientInfo.concerns || quote.patientInfo.expectations) && (
              <div>
                <h4 className="font-medium mb-2">Medical Information</h4>
                <div className="bg-blue-50 rounded-lg p-3 space-y-2 text-sm">
                  {quote.patientInfo.medicalHistory && (
                    <div>
                      <span className="font-medium">Medical History:</span>
                      <p className="text-gray-700">{quote.patientInfo.medicalHistory}</p>
                    </div>
                  )}
                  {quote.patientInfo.concerns && (
                    <div>
                      <span className="font-medium">Concerns:</span>
                      <p className="text-gray-700">{quote.patientInfo.concerns}</p>
                    </div>
                  )}
                  {quote.patientInfo.expectations && (
                    <div>
                      <span className="font-medium">Expectations:</span>
                      <p className="text-gray-700">{quote.patientInfo.expectations}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dental Chart Conditions */}
            {quote.dentalChart?.selectedConditions && quote.dentalChart.selectedConditions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Dental Chart Conditions</h4>
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {quote.dentalChart.selectedConditions.map((condition, idx) => (
                      <div key={idx} className="flex items-center">
                        <Heart className="h-3 w-3 mr-1 text-red-500" />
                        Tooth {condition.toothNumber}: {condition.condition}
                        {condition.severity && <span className="text-gray-500"> ({condition.severity})</span>}
                      </div>
                    ))}
                  </div>
                  {quote.dentalChart.painLevel && (
                    <div className="mt-2 text-sm text-red-700 font-medium">
                      Pain Level: {quote.dentalChart.painLevel}/10
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Response Section */}
            {quote.status === 'under_review' && (
              <div>
                <h4 className="font-medium mb-2">Send Response to Patient</h4>
                <Textarea
                  placeholder="Enter your response, treatment recommendations, or quote details..."
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  className="mb-3"
                  rows={4}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onUpdateStatus(quote.id, 'quoted', responseNote)}
                    disabled={!responseNote.trim()}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Quote
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedQuote(null);
                      setResponseNote('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Previous Response */}
            {quote.clinicNotes && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-medium text-green-800 mb-1">Your Response</h4>
                <p className="text-sm text-green-700">{quote.clinicNotes}</p>
                <div className="text-xs text-green-600 mt-2">
                  {quote.clinicReviewedAt && `Sent: ${format(new Date(quote.clinicReviewedAt), 'MMM dd, yyyy HH:mm')}`}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getPriorityLevel(quote: QuoteRequest) {
  if (quote.dentalChart?.painLevel && quote.dentalChart.painLevel >= 7) return 'High';
  if (quote.promoCode) return 'Medium';
  return 'Normal';
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'High': return 'bg-red-100 text-red-800';
    case 'Medium': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}