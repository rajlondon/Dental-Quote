import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuotes } from '@/hooks/use-quotes';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Clock, MapPin, FileText, CreditCard, CheckCircle, AlertCircle, Timer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TreatmentItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  scheduled?: string;
  completed?: string;
  notes?: string;
}

interface TreatmentPlan {
  id: string;
  title: string;
  description?: string;
  clinicId: number;
  clinicName: string;
  patientId: number;
  patientName: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'proposed' | 'approved' | 'in_treatment' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'deposit_paid' | 'partially_paid' | 'fully_paid' | 'refunded';
  totalAmount: number;
  currency: string;
  deposit?: number;
  depositPaid?: boolean;
  items: TreatmentItem[];
  doctorId?: string;
  doctorName?: string;
  startDate?: string;
  endDate?: string;
  nextAppointment?: string;
  treatmentProgress?: number;
  additionalNotes?: string;
  financingAvailable: boolean;
  documentIds?: string[];
  pendingApproval?: boolean;
  fromQuote?: boolean;
  quoteId?: number;
  promoApplied?: boolean;
  promoDetails?: any;
  appointmentDate?: string;
}

const TreatmentJourneyPage: React.FC = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Always call hooks first - never conditionally
  const { userQuotesQuery } = useQuotes();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [activeTab, setActiveTab] = useState('timeline');
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Load data effect
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Refetch user quotes
        await userQuotesQuery.refetch();
        
        // Convert quotes to treatment plans for display
        if (userQuotesQuery.data && Array.isArray(userQuotesQuery.data)) {
          const quotesData = userQuotesQuery.data;
          console.log('Found quotes data:', quotesData);
          const convertedPlans = quotesData
            .filter((quote: any) => quote && quote.id)
            .map((quote: any) => ({
              id: quote.id.toString(),
              title: `Treatment Quote #${quote.id}`,
              patientName: quote.name || 'Unknown',
              email: quote.email || '',
              phone: quote.phone || '',
              status: 'proposed' as const,
              createdAt: quote.createdAt || new Date().toISOString(),
              updatedAt: quote.updatedAt || new Date().toISOString(),
              totalAmount: 0,
              currency: 'EUR',
              items: [],
              clinicId: quote.selectedClinicId || 0,
              clinicName: 'Selected Clinic',
              patientId: quote.userId || 0,
              paymentStatus: 'unpaid' as const,
              financingAvailable: false,
              fromQuote: true,
              quoteId: quote.id
            }));
          
          console.log('Converted plans:', convertedPlans);
          setTreatmentPlans(convertedPlans);
        } else {
          console.log('No quotes data found:', userQuotesQuery.data);
        }
      } catch (error) {
        console.error('Error loading treatment journey:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your treatment data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id, userQuotesQuery.data]);

  // Early return if no user - after all hooks
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your treatment journey</h1>
          <Button onClick={() => setLocation('/auth')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_treatment': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      case 'proposed': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_treatment': return <Timer className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'proposed': return <Clock className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/patient-portal')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portal
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Treatment Journey
          </h1>
          <p className="text-gray-600 mt-1">
            Track your dental treatment progress and milestones
          </p>
        </div>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="quotes">My Quotes ({userQuotesQuery.data?.length || 0})</TabsTrigger>
          <TabsTrigger value="plans">Treatment Plans ({treatmentPlans.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          {/* Timeline View */}
          <div className="space-y-4">
            {treatmentPlans.length === 0 && (!userQuotesQuery.data || userQuotesQuery.data.length === 0) ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Treatment Journey Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start your journey by getting your first quote
                  </p>
                  <Button onClick={() => setLocation('/quote-request')}>
                    Get Your First Quote
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Quotes Timeline */}
                {userQuotesQuery.data?.map((quote: any, index: number) => (
                  <Card key={`quote-${quote.id}`} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              Quote Request #{quote.id}
                            </CardTitle>
                            <CardDescription>
                              Created {formatDate(quote.createdAt)}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Quote
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{quote.departureCity || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{quote.travelMonth || 'Flexible'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Budget: €{quote.budget || 'Open'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Treatment: {quote.treatment}</p>
                        {quote.specificTreatment && (
                          <p className="text-sm text-gray-600">Details: {quote.specificTreatment}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Treatment Plans Timeline */}
                {treatmentPlans.map((plan, index) => (
                  <Card key={`plan-${plan.id}`} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            {getStatusIcon(plan.status)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {plan.title}
                            </CardTitle>
                            <CardDescription>
                              {plan.clinicName} • {formatDate(plan.createdAt)}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">€{plan.totalAmount} {plan.currency}</span>
                        </div>
                        {plan.nextAppointment && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Next: {formatDate(plan.nextAppointment)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={
                            plan.paymentStatus === 'fully_paid' ? 'bg-green-50 text-green-700' :
                            plan.paymentStatus === 'deposit_paid' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-700'
                          }>
                            {plan.paymentStatus.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          {!userQuotesQuery.data || userQuotesQuery.data.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Quotes Yet</h3>
                <p className="text-gray-600 mb-4">
                  Get started by requesting your first dental treatment quote
                </p>
                <Button onClick={() => setLocation('/quote-request')}>
                  Request Quote
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {userQuotesQuery.data?.map((quote: any) => (
                <Card key={quote.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Quote #{quote.id}</CardTitle>
                      <Badge variant="outline">
                        {quote.status || 'Pending'}
                      </Badge>
                    </div>
                    <CardDescription>
                      {quote.treatment} • {formatDate(quote.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Treatment:</strong> {quote.treatment}</p>
                      {quote.specificTreatment && (
                        <p className="text-sm"><strong>Details:</strong> {quote.specificTreatment}</p>
                      )}
                      <p className="text-sm"><strong>Travel from:</strong> {quote.departureCity}</p>
                      <p className="text-sm"><strong>Preferred month:</strong> {quote.travelMonth}</p>
                      <p className="text-sm"><strong>Budget:</strong> €{quote.budget}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {treatmentPlans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Treatment Plans Yet</h3>
                <p className="text-gray-600 mb-4">
                  Treatment plans will appear here once clinics respond to your quotes
                </p>
                <Button onClick={() => setActiveTab('quotes')}>
                  View My Quotes
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {treatmentPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.title}</CardTitle>
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>
                      {plan.clinicName} • {formatDate(plan.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Total Amount:</strong> €{plan.totalAmount} {plan.currency}</p>
                      <p className="text-sm"><strong>Payment Status:</strong> {plan.paymentStatus.replace('_', ' ')}</p>
                      {plan.nextAppointment && (
                        <p className="text-sm"><strong>Next Appointment:</strong> {formatDate(plan.nextAppointment)}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TreatmentJourneyPage;