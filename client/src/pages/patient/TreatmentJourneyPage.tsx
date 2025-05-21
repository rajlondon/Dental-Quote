import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useQuotes } from '@/hooks/use-quotes';
import { apiRequest } from '@/lib/queryClient';
import { PageHeader } from '@/components/page-header';
import TreatmentPlanViewer from '@/components/TreatmentPlanViewer';
import QuoteDetail from '@/components/quotes/quote-detail';

import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  FileText,
  Plus,
  PencilRuler,
  CheckCircle,
  Clock,
  CalendarDays,
  CreditCard,
  AlertCircle,
  Download,
  ListChecks,
  Receipt,
  MessageSquare,
  HelpCircle,
  User,
  Building,
  Loader2,
  ArrowRight,
  ChevronLeft,
  GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Types
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
  const params = useParams();
  const detailId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Quotes state
  const {
    userQuotesQuery,
    getQuoteQuery
  } = useQuotes();
  
  // Treatment plans state
  const [isLoading, setIsLoading] = useState(true);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
  const [showDetailedPlan, setShowDetailedPlan] = useState(false);
  const [activeTab, setActiveTab] = useState<"quotes" | "plans" | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  
  // Specific detail states
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | undefined>(undefined);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);
  
  // Load all data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Load user quotes
        await userQuotesQuery.refetch();
        
        // Load treatment plans
        if (user?.id) {
          await fetchTreatmentPlans();
        }
      } catch (error) {
        console.error('Error loading treatment journey data:', error);
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
  }, [user?.id]);
  
  // Parse detail ID from URL if provided
  useEffect(() => {
    if (detailId) {
      if (detailId.startsWith('quote-')) {
        const quoteId = parseInt(detailId.replace('quote-', ''));
        setSelectedQuoteId(quoteId);
        setViewMode('detail');
        setActiveTab('quotes');
      } else if (detailId.startsWith('plan-')) {
        const planId = detailId.replace('plan-', '');
        setSelectedPlanId(planId);
        setViewMode('detail');
        setActiveTab('plans');
      }
    } else {
      setViewMode('list');
    }
  }, [detailId]);
  
  // Fetch treatment plans
  const fetchTreatmentPlans = async () => {
    if (!user?.id) return;
    
    try {
      // First, get any existing treatment plans
      const treatmentPlansRes = await apiRequest('GET', '/api/patient/treatment-plans');
      const treatmentPlansData = await treatmentPlansRes.json();
      
      // Next, get the patient's quotes to convert them to treatment plans
      const quotesRes = await apiRequest('GET', '/api/patient/quotes');
      const quotesData = await quotesRes.json();
      
      let allTreatmentPlans: TreatmentPlan[] = [];
      
      // Process existing treatment plans if available
      if (treatmentPlansData.success && treatmentPlansData.treatmentPlans) {
        console.log('Found existing treatment plans:', treatmentPlansData.treatmentPlans.length);
        allTreatmentPlans = [...treatmentPlansData.treatmentPlans];
      }
      
      // Convert quotes to treatment plans if available
      if (quotesData.success && quotesData.quotes) {
        console.log('Found quotes to convert to treatment plans:', quotesData.quotes.length);
        const quoteBasedPlans = quotesData.quotes.map((quote: any) => {
          // Handle different formats of treatments data
          let treatmentItems: TreatmentItem[] = [];
          
          if (quote.treatments && Array.isArray(quote.treatments)) {
            treatmentItems = quote.treatments.map((treatment: any, index: number) => {
              // Convert treatment prices which might be strings to numbers
              const unitPrice = typeof treatment.price === 'string' 
                ? parseFloat(treatment.price) 
                : treatment.price || 0;
                
              const quantity = treatment.quantity || 1;
              
              return {
                id: typeof treatment.id === 'number' ? `${treatment.id}` : (treatment.id || `${quote.id}-item-${index}`),
                name: treatment.name || 'Unnamed Treatment',
                description: treatment.description || '',
                quantity,
                unitPrice,
                totalPrice: unitPrice * quantity,
                currency: quote.currency || 'GBP',
                status: 'pending' as const
              };
            });
          } else if (quote.treatmentDetails) {
            // Alternative format for treatments
            treatmentItems = Object.entries(quote.treatmentDetails).map(([name, details]: [string, any], index) => ({
              id: `${quote.id}-item-${index}`,
              name,
              description: details.description || '',
              quantity: details.quantity || 1,
              unitPrice: typeof details.price === 'string' ? parseFloat(details.price) : details.price || 0,
              totalPrice: (typeof details.price === 'string' ? parseFloat(details.price) : details.price || 0) * (details.quantity || 1),
              currency: quote.currency || 'GBP',
              status: 'pending' as const
            }));
          } else if (quote.selectedTreatments && Array.isArray(quote.selectedTreatments)) {
            // Format from the quote selection flow
            treatmentItems = quote.selectedTreatments.map((treatment: any, index: number) => {
              const unitPrice = typeof treatment.price === 'string' 
                ? parseFloat(treatment.price) 
                : treatment.price || 0;
                
              const quantity = treatment.quantity || 1;
              
              return {
                id: typeof treatment.id === 'number' ? `${treatment.id}` : (treatment.id || `${quote.id}-item-${index}`),
                name: treatment.name || treatment.treatmentName || 'Unnamed Treatment',
                description: treatment.description || '',
                quantity,
                unitPrice,
                totalPrice: unitPrice * quantity,
                currency: quote.currency || 'GBP',
                status: 'pending' as const
              };
            });
          }
          
          // Calculate total amount from treatments if not provided
          const calculatedTotal = treatmentItems.reduce((sum, item) => sum + item.totalPrice, 0);
          
          // Parse the total amount, handling string values
          let totalAmount = calculatedTotal;
          if (quote.totalAmount) {
            totalAmount = typeof quote.totalAmount === 'string' 
              ? parseFloat(quote.totalAmount) 
              : quote.totalAmount;
          }
          
          // Calculate deposit (20% of total by default)
          let deposit = Math.round(totalAmount * 0.2);
          if (quote.depositAmount) {
            deposit = typeof quote.depositAmount === 'string' 
              ? parseFloat(quote.depositAmount) 
              : quote.depositAmount;
          }
          
          // Get clinic information
          const clinicId = quote.clinicId || quote.selectedClinicId || 0;
          const clinicName = quote.clinicName || 'Selected Clinic';
          
          return {
            id: `quote-${quote.id}`,
            title: `Treatment Plan from Quote #${quote.quoteNumber || quote.id}`,
            description: quote.notes || 'Treatment plan based on your quote request',
            clinicId,
            clinicName,
            patientId: user.id,
            patientName: user.firstName ? `${user.firstName} ${user.lastName || ''}` : (user.email || "Patient"),
            createdAt: quote.createdAt || new Date().toISOString(),
            updatedAt: quote.updatedAt || new Date().toISOString(),
            status: 'proposed' as const,
            paymentStatus: 'unpaid' as const,
            totalAmount,
            currency: quote.currency || 'GBP',
            deposit,
            depositPaid: false,
            items: treatmentItems,
            doctorName: quote.doctorName || quote.dentistName || undefined,
            doctorId: quote.doctorId || quote.dentistId || undefined,
            financingAvailable: true,
            pendingApproval: true,
            fromQuote: true,
            quoteId: quote.id,
            promoApplied: quote.promoCode ? true : false,
            promoDetails: quote.promoCode ? {
              code: quote.promoCode,
              discount: quote.promoDiscount || 0,
              type: quote.promoDiscountType || 'percentage'
            } : undefined,
            appointmentDate: quote.preferredDate || undefined
          };
        });
        
        // Add quote-based plans to all treatment plans
        allTreatmentPlans = [...allTreatmentPlans, ...quoteBasedPlans];
      }
      
      if (allTreatmentPlans.length > 0) {
        console.log('Setting treatment plans:', allTreatmentPlans.length);
        // Sort treatment plans by date (newest first)
        allTreatmentPlans.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setTreatmentPlans(allTreatmentPlans);
        
        // Set the first treatment plan as selected if none is selected
        if (!selectedPlan) {
          setSelectedPlan(allTreatmentPlans[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching treatment plans:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('patient.treatment_plans.fetch_error', 'Failed to load treatment plans'),
        variant: 'destructive'
      });
    }
  };
  
  // Handle selecting a specific quote
  const handleSelectQuote = (quoteId: number) => {
    setSelectedQuoteId(quoteId);
    setViewMode('detail');
    setActiveTab('quotes');
    setLocation(`/patient/treatment-journey/quote-${quoteId}`);
  };
  
  // Handle selecting a specific treatment plan
  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setViewMode('detail');
    setActiveTab('plans');
    setLocation(`/patient/treatment-journey/plan-${planId}`);
  };
  
  // Handle navigating back to the list view
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedQuoteId(undefined);
    setSelectedPlanId(undefined);
    setLocation('/patient/treatment-journey');
  };
  
  // Get the specific quote details
  const quoteQuery = selectedQuoteId ? getQuoteQuery(selectedQuoteId) : null;
  
  // Get the specific treatment plan
  const selectedTreatmentPlan = selectedPlanId 
    ? treatmentPlans.find(plan => plan.id === selectedPlanId) 
    : null;
  
  // Filter quotes by status (active/completed)
  const getFilteredQuotes = () => {
    return userQuotesQuery.data || [];
  };
  
  // Loading state
  if (isLoading || userQuotesQuery.isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading your treatment journey...</p>
        </div>
      </div>
    );
  }
  
  // Detail view for a specific quote
  if (viewMode === 'detail' && activeTab === 'quotes' && selectedQuoteId) {
    if (quoteQuery?.isLoading) {
      return (
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading quote details...</p>
          </div>
        </div>
      );
    }
    
    if (quoteQuery?.error) {
      return (
        <div className="container mx-auto py-6 px-4">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive text-lg mb-4">Error loading quote: {quoteQuery?.error.message}</p>
            <Button onClick={handleBackToList}>Back to Treatment Journey</Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="container mx-auto py-6 px-4">
        <Button 
          variant="outline" 
          className="mb-6" 
          onClick={handleBackToList}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Treatment Journey
        </Button>
        
        {quoteQuery?.data && (
          <QuoteDetail
            quoteRequest={quoteQuery.data.quoteRequest}
            versions={quoteQuery.data.versions}
            portalType="patient"
            onBack={handleBackToList}
          />
        )}
      </div>
    );
  }
  
  // Detail view for a specific treatment plan
  if (viewMode === 'detail' && activeTab === 'plans' && selectedTreatmentPlan) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Button 
          variant="outline" 
          className="mb-6" 
          onClick={handleBackToList}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Treatment Journey
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{selectedTreatmentPlan.title}</CardTitle>
                <CardDescription className="mt-2">
                  {selectedTreatmentPlan.description || 'Your personalized treatment plan'}
                </CardDescription>
              </div>
              <Badge className={
                selectedTreatmentPlan.status === 'completed' ? 'bg-green-100 text-green-800' :
                selectedTreatmentPlan.status === 'in_treatment' ? 'bg-blue-100 text-blue-800' :
                selectedTreatmentPlan.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }>
                {selectedTreatmentPlan.status === 'proposed' ? 'Proposed' :
                 selectedTreatmentPlan.status === 'approved' ? 'Approved' :
                 selectedTreatmentPlan.status === 'in_treatment' ? 'In Treatment' :
                 selectedTreatmentPlan.status === 'completed' ? 'Completed' :
                 selectedTreatmentPlan.status === 'cancelled' ? 'Cancelled' : 'Draft'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Clinic</h3>
                <p className="text-base flex items-center">
                  <Building className="h-4 w-4 mr-2 inline text-primary" />
                  {selectedTreatmentPlan.clinicName}
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Created On</h3>
                <p className="text-base flex items-center">
                  <CalendarDays className="h-4 w-4 mr-2 inline text-primary" />
                  {format(new Date(selectedTreatmentPlan.createdAt), 'PPP')}
                </p>
              </div>
              
              {selectedTreatmentPlan.doctorName && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Doctor</h3>
                  <p className="text-base flex items-center">
                    <User className="h-4 w-4 mr-2 inline text-primary" />
                    {selectedTreatmentPlan.doctorName}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
                <p className="text-xl font-semibold flex items-center text-primary">
                  <Receipt className="h-4 w-4 mr-2 inline" />
                  {new Intl.NumberFormat('en-GB', {
                    style: 'currency',
                    currency: selectedTreatmentPlan.currency || 'GBP'
                  }).format(selectedTreatmentPlan.totalAmount)}
                </p>
              </div>
            </div>
            
            {selectedTreatmentPlan.fromQuote && selectedTreatmentPlan.quoteId && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-base font-medium text-blue-600">This treatment plan is based on your quote</h3>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  View the original quote for more details on your treatment options.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-blue-600 text-blue-600 hover:bg-blue-100"
                  onClick={() => handleSelectQuote(selectedTreatmentPlan.quoteId!)}
                >
                  View Related Quote
                </Button>
              </div>
            )}
            
            <Accordion type="single" collapsible defaultValue="treatments" className="w-full">
              <AccordionItem value="treatments">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <ListChecks className="h-5 w-5 mr-2" />
                    <span>Treatment Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-3 text-left text-sm font-medium text-muted-foreground">Treatment</th>
                          <th className="py-2 px-3 text-center text-sm font-medium text-muted-foreground">Quantity</th>
                          <th className="py-2 px-3 text-right text-sm font-medium text-muted-foreground">Unit Price</th>
                          <th className="py-2 px-3 text-right text-sm font-medium text-muted-foreground">Total</th>
                          <th className="py-2 px-3 text-right text-sm font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTreatmentPlan.items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-2 px-3 text-sm">
                              <div className="font-medium">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center text-sm">{item.quantity}</td>
                            <td className="py-2 px-3 text-right text-sm">
                              {new Intl.NumberFormat('en-GB', {
                                style: 'currency',
                                currency: item.currency || 'GBP'
                              }).format(item.unitPrice)}
                            </td>
                            <td className="py-2 px-3 text-right text-sm font-medium">
                              {new Intl.NumberFormat('en-GB', {
                                style: 'currency',
                                currency: item.currency || 'GBP'
                              }).format(item.totalPrice)}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <Badge variant={
                                item.status === 'completed' ? 'default' :
                                item.status === 'scheduled' ? 'outline' :
                                item.status === 'cancelled' ? 'destructive' : 'secondary'
                              } className="text-xs">
                                {item.status === 'pending' ? 'Pending' :
                                 item.status === 'scheduled' ? 'Scheduled' :
                                 item.status === 'completed' ? 'Completed' : 'Cancelled'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="py-3 px-3 text-right font-medium">Total</td>
                          <td className="py-3 px-3 text-right font-bold text-primary">
                            {new Intl.NumberFormat('en-GB', {
                              style: 'currency',
                              currency: selectedTreatmentPlan.currency || 'GBP'
                            }).format(selectedTreatmentPlan.totalAmount)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {selectedTreatmentPlan.additionalNotes && (
                <AccordionItem value="notes">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      <span>Additional Notes</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-3 whitespace-pre-wrap text-sm">
                      {selectedTreatmentPlan.additionalNotes}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
          <CardFooter className="flex flex-col md:flex-row gap-3 items-center justify-between pt-6">
            <div className="flex gap-2 w-full md:w-auto">
              {selectedTreatmentPlan.quoteId && (
                <Button
                  variant="outline"
                  onClick={() => handleSelectQuote(selectedTreatmentPlan.quoteId!)}
                  className="flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Quote
                </Button>
              )}
              
              {selectedTreatmentPlan.status === 'proposed' && selectedTreatmentPlan.pendingApproval && (
                <Button className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Plan
                </Button>
              )}
              
              {selectedTreatmentPlan.status === 'approved' && selectedTreatmentPlan.paymentStatus === 'unpaid' && (
                <Button className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Deposit
                </Button>
              )}
            </div>
            
            <span className="text-sm text-muted-foreground">
              Last updated: {format(new Date(selectedTreatmentPlan.updatedAt), 'PPP')}
            </span>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // List view showing all quotes and treatment plans
  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="Treatment Journey"
        description="Track your dental treatment journey from quotes to treatment plans"
        actions={
          <Button asChild>
            <a href="/quote-request" className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Quote Request
            </a>
          </Button>
        }
      />
      
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "quotes" | "plans" | "all")}
        className="mt-6"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="plans">Treatment Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="space-y-8">
            {/* Timeline View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Timeline className="h-5 w-5 mr-2" />
                  Your Treatment Timeline
                </CardTitle>
                <CardDescription>
                  A complete view of your dental journey from quotes to treatment plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Check if we have any data to display */}
                {(!userQuotesQuery.data || userQuotesQuery.data.length === 0) && 
                 (!treatmentPlans || treatmentPlans.length === 0) ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No treatment journey started yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Start your dental journey by requesting a quote from our partner clinics.
                      Compare options and prices to find the best treatment plan for you.
                    </p>
                    <Button asChild>
                      <a href="/quote-request">Get Your First Quote</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Combine quotes and plans and sort by date */}
                    {[...(userQuotesQuery.data || []), ...treatmentPlans]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((item, index) => {
                        const isQuote = 'quoteNumber' in item || !('fromQuote' in item);
                        const id = isQuote ? (item as any).id : (item as TreatmentPlan).id;
                        const title = isQuote 
                          ? `Quote #${(item as any).quoteNumber || (item as any).id}` 
                          : (item as TreatmentPlan).title;
                        const date = format(new Date(item.createdAt), 'PPP');
                        const status = isQuote 
                          ? (item as any).status 
                          : (item as TreatmentPlan).status;
                        
                        // Calculate badge variant based on status
                        const getBadgeVariant = () => {
                          if (isQuote) {
                            const quoteStatus = (item as any).status;
                            return quoteStatus === 'completed' || quoteStatus === 'accepted' 
                              ? 'bg-green-100 text-green-800'
                              : quoteStatus === 'rejected' || quoteStatus === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800';
                          } else {
                            const planStatus = (item as TreatmentPlan).status;
                            return planStatus === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : planStatus === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : planStatus === 'in_treatment' || planStatus === 'approved'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800';
                          }
                        };
                        
                        return (
                          <div key={id} className="flex">
                            {/* Timeline connector */}
                            <div className="flex flex-col items-center mr-4">
                              <div className={`w-3 h-3 rounded-full mt-1.5 ${
                                index === 0 ? 'bg-primary' : 'bg-muted-foreground'
                              }`} />
                              {index < [...(userQuotesQuery.data || []), ...treatmentPlans].length - 1 && (
                                <div className="w-0.5 h-full bg-muted" />
                              )}
                            </div>
                            
                            {/* Timeline content */}
                            <div className="flex-1 mb-8">
                              <div className="flex justify-between items-start mb-1">
                                <div className="text-sm text-muted-foreground">{date}</div>
                                <Badge className={getBadgeVariant()}>
                                  {status === 'pending' ? 'Pending' :
                                   status === 'in_progress' ? 'In Progress' :
                                   status === 'completed' ? 'Completed' :
                                   status === 'proposed' ? 'Proposed' :
                                   status === 'approved' ? 'Approved' :
                                   status === 'in_treatment' ? 'In Treatment' :
                                   status === 'cancelled' ? 'Cancelled' :
                                   status === 'rejected' ? 'Rejected' :
                                   status === 'accepted' ? 'Accepted' :
                                   status === 'expired' ? 'Expired' :
                                   status === 'sent' ? 'Sent' : 'Draft'}
                                </Badge>
                              </div>
                              
                              <Card className="mt-1">
                                <CardHeader className="p-4">
                                  <CardTitle className="text-base flex items-center">
                                    {isQuote 
                                      ? <FileText className="h-4 w-4 mr-2 text-primary" />
                                      : <PencilRuler className="h-4 w-4 mr-2 text-primary" />
                                    }
                                    {title}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                  {isQuote ? (
                                    // Quote summary
                                    <div>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {(item as any).treatment || 'Dental treatment quote'}
                                      </p>
                                      {(item as any).selectedClinicName && (
                                        <div className="flex items-center text-sm mb-2">
                                          <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                                          <span>{(item as any).selectedClinicName}</span>
                                        </div>
                                      )}
                                      {(item as any).totalAmount && (
                                        <div className="flex items-center text-sm font-medium">
                                          <Receipt className="h-4 w-4 mr-1 text-muted-foreground" />
                                          <span>{new Intl.NumberFormat('en-GB', {
                                            style: 'currency',
                                            currency: (item as any).currency || 'GBP'
                                          }).format((item as any).totalAmount)}</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    // Treatment plan summary
                                    <div>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {(item as TreatmentPlan).description || 'Your personalized treatment plan'}
                                      </p>
                                      <div className="flex items-center text-sm mb-2">
                                        <Building className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <span>{(item as TreatmentPlan).clinicName}</span>
                                      </div>
                                      <div className="flex items-center text-sm font-medium">
                                        <Receipt className="h-4 w-4 mr-1 text-muted-foreground" />
                                        <span>{new Intl.NumberFormat('en-GB', {
                                          style: 'currency',
                                          currency: (item as TreatmentPlan).currency || 'GBP'
                                        }).format((item as TreatmentPlan).totalAmount)}</span>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                                <CardFooter className="p-4 pt-0 flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (isQuote) {
                                        handleSelectQuote((item as any).id);
                                      } else {
                                        handleSelectPlan((item as TreatmentPlan).id);
                                      }
                                    }}
                                  >
                                    View Details
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                  </Button>
                                </CardFooter>
                              </Card>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="quotes" className="mt-6">
          {userQuotesQuery.data && userQuotesQuery.data.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {userQuotesQuery.data.map((quote) => (
                <Card key={quote.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">Quote #{quote.quoteNumber || quote.id}</CardTitle>
                      <Badge className={
                        quote.status === 'completed' || quote.status === 'accepted' 
                          ? 'bg-green-100 text-green-800' 
                          : quote.status === 'rejected' || quote.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                      }>
                        {quote.status === 'pending' ? 'Pending' :
                         quote.status === 'in_progress' ? 'In Progress' :
                         quote.status === 'completed' ? 'Completed' :
                         quote.status === 'sent' ? 'Sent' :
                         quote.status === 'accepted' ? 'Accepted' :
                         quote.status === 'rejected' ? 'Rejected' :
                         quote.status === 'cancelled' ? 'Cancelled' :
                         quote.status === 'expired' ? 'Expired' : 'Processing'}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1 flex items-center">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      {format(new Date(quote.createdAt), 'PPP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Treatment: </span>
                        <span>{quote.treatment || 'Multiple treatments'}</span>
                      </div>
                      
                      {quote.selectedClinicName && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Clinic: </span>
                          <span>{quote.selectedClinicName}</span>
                        </div>
                      )}
                      
                      {quote.totalAmount && (
                        <div className="text-sm font-medium mt-3">
                          <span className="text-muted-foreground">Total: </span>
                          <span className="text-primary">{new Intl.NumberFormat('en-GB', {
                            style: 'currency',
                            currency: quote.currency || 'GBP'
                          }).format(quote.totalAmount)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectQuote(quote.id)}
                    >
                      View Quote
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Get Your Dental Treatment Quote</CardTitle>
                <CardDescription>
                  Request a personalized quote from our partner clinics for your dental treatment
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center space-y-4 py-6">
                <FileText className="h-16 w-16 text-primary" />
                <div className="max-w-md">
                  <h3 className="text-xl font-semibold mb-2">Start Your Dental Journey Today</h3>
                  <p className="text-muted-foreground mb-6">
                    Get detailed quotes from top dental clinics in Turkey. Compare prices, read reviews, and make informed decisions about your dental treatment.
                  </p>
                  <Button size="lg" asChild>
                    <a href="/quote-request" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Request a Quote
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="plans" className="mt-6">
          {treatmentPlans && treatmentPlans.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {treatmentPlans.map((plan) => (
                <Card key={plan.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{plan.title}</CardTitle>
                      <Badge className={
                        plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                        plan.status === 'in_treatment' || plan.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        plan.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }>
                        {plan.status === 'proposed' ? 'Proposed' :
                         plan.status === 'approved' ? 'Approved' :
                         plan.status === 'in_treatment' ? 'In Treatment' :
                         plan.status === 'completed' ? 'Completed' :
                         plan.status === 'cancelled' ? 'Cancelled' : 'Draft'}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1 flex items-center">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      {format(new Date(plan.createdAt), 'PPP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Clinic: </span>
                        <span>{plan.clinicName}</span>
                      </div>
                      
                      {plan.items.length > 0 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Treatments: </span>
                          <span>{plan.items.length}</span>
                        </div>
                      )}
                      
                      {plan.totalAmount && (
                        <div className="text-sm font-medium mt-3">
                          <span className="text-muted-foreground">Total: </span>
                          <span className="text-primary">{new Intl.NumberFormat('en-GB', {
                            style: 'currency',
                            currency: plan.currency || 'GBP'
                          }).format(plan.totalAmount)}</span>
                        </div>
                      )}
                      
                      {plan.fromQuote && plan.quoteId && (
                        <div className="mt-3 flex items-center text-xs text-blue-600">
                          <FileText className="h-3 w-3 mr-1" />
                          <span>From Quote #{plan.quoteId}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      View Plan
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Treatment Plans Yet</CardTitle>
                <CardDescription>
                  Your treatment plans will appear here once you've accepted a quote
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center space-y-4 py-6">
                <PencilRuler className="h-16 w-16 text-muted-foreground" />
                <div className="max-w-md">
                  <h3 className="text-xl font-semibold mb-2">Treatment Plans Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    Once you've received and accepted a quote, your personalized treatment plan will appear here.
                  </p>
                  {userQuotesQuery.data && userQuotesQuery.data.length > 0 ? (
                    <Button variant="outline" onClick={() => setActiveTab('quotes')}>
                      View Your Quotes
                    </Button>
                  ) : (
                    <Button asChild>
                      <a href="/quote-request">Request a Quote</a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TreatmentJourneyPage;