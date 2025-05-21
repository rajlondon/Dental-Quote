import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, 
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
  ArrowRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TreatmentPlanViewer } from '@/components/TreatmentPlanViewer';

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
}

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  type: 'full' | 'deposit' | 'installment' | 'financing';
  amount: number;
  discount?: number;
  installments?: number;
  installmentAmount?: number;
  interestRate?: number;
  depositAmount?: number;
}

interface TreatmentPlanSectionProps {
  bookingId?: number;
}

const TreatmentPlanSection: React.FC<TreatmentPlanSectionProps> = ({ bookingId }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State variables for treatment plans
  const [isLoading, setIsLoading] = useState(true);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string | null>(null);
  const [isLoadingPaymentOptions, setIsLoadingPaymentOptions] = useState(false);
  const [showDetailedPlan, setShowDetailedPlan] = useState(false);
  
  // Fetch treatment plans from quotes and existing treatment plans
  useEffect(() => {
    const fetchTreatmentPlans = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
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
          allTreatmentPlans = [...treatmentPlansData.treatmentPlans];
        }
        
        // Convert quotes to treatment plans if available
        if (quotesData.success && quotesData.quotes) {
          const quoteBasedPlans = quotesData.quotes.map((quote: any) => {
            // Map the quote data to the treatment plan structure
            const treatmentItems = quote.treatments?.map((treatment: any, index: number) => ({
              id: `${quote.id}-item-${index}`,
              name: treatment.name,
              description: treatment.description,
              quantity: treatment.quantity || 1,
              unitPrice: treatment.price,
              totalPrice: treatment.price * (treatment.quantity || 1),
              currency: quote.currency || 'GBP',
              status: 'pending' as const
            })) || [];
            
            return {
              id: `quote-${quote.id}`,
              title: `Treatment Plan from Quote #${quote.quoteNumber || quote.id}`,
              description: quote.notes || 'Treatment plan based on your quote request',
              clinicId: quote.clinicId,
              clinicName: quote.clinicName,
              patientId: user.id,
              patientName: user.name || user.email || "Patient",
              createdAt: quote.createdAt || new Date().toISOString(),
              updatedAt: quote.updatedAt || new Date().toISOString(),
              status: 'proposed' as const,
              paymentStatus: 'unpaid' as const,
              totalAmount: quote.totalAmount || treatmentItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0),
              currency: quote.currency || 'GBP',
              deposit: quote.depositAmount || Math.round(quote.totalAmount * 0.2),
              depositPaid: false,
              items: treatmentItems,
              doctorName: quote.doctorName,
              doctorId: quote.doctorId,
              financingAvailable: true,
              pendingApproval: true,
              fromQuote: true,
              quoteId: quote.id
            };
          });
          
          // Add quote-based plans to all treatment plans
          allTreatmentPlans = [...allTreatmentPlans, ...quoteBasedPlans];
        }
        
        if (allTreatmentPlans.length > 0) {
          setTreatmentPlans(allTreatmentPlans);
          
          // Set the first treatment plan as selected
          setSelectedPlan(allTreatmentPlans[0]);
        } else {
          // If we have no treatment plans/quotes we should inform the user
          toast({
            title: "No Treatment Plans Found",
            description: "You don't have any active treatment plans yet. Complete a quote to see it here.",
            variant: "default"
          });
          // Initialize with empty array instead of sample data
          const emptyPlans: TreatmentPlan[] = [
            {
              id: '1',
              title: 'Full Dental Restoration Plan',
              description: 'Comprehensive dental restoration including implants, crowns, and whitening.',
              clinicId: 1,
              clinicName: 'DentSpa Istanbul',
              patientId: user.id,
              patientName: user.email || "Patient",
              createdAt: '2025-05-10T14:30:00Z',
              updatedAt: '2025-05-15T09:45:00Z',
              status: 'proposed',
              paymentStatus: 'unpaid',
              totalAmount: 4250,
              currency: 'GBP',
              deposit: 500,
              depositPaid: false,
              items: [
                {
                  id: '1',
                  name: 'Dental Implant',
                  description: 'Titanium implant with abutment',
                  quantity: 3,
                  unitPrice: 850,
                  totalPrice: 2550,
                  currency: 'GBP',
                  status: 'pending'
                },
                {
                  id: '2',
                  name: 'Porcelain Crown',
                  description: 'High-quality porcelain crown',
                  quantity: 5,
                  unitPrice: 280,
                  totalPrice: 1400,
                  currency: 'GBP',
                  status: 'pending'
                },
                {
                  id: '3',
                  name: 'Professional Whitening',
                  description: 'In-office teeth whitening session',
                  quantity: 1,
                  unitPrice: 300,
                  totalPrice: 300,
                  currency: 'GBP',
                  status: 'pending'
                }
              ],
              doctorName: 'Dr. Mehmet Yılmaz',
              doctorId: '1',
              financingAvailable: true,
              pendingApproval: true
            }
          ];
          
          // Just set empty treatment plans
          setTreatmentPlans([]);
        }
      } catch (error) {
        console.error('Error fetching treatment plans:', error);
        toast({
          title: t('common.error', 'Error'),
          description: t('patient.treatment_plans.fetch_error', 'Failed to load treatment plans'),
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTreatmentPlans();
  }, [user?.id, t, toast]);
  
  // Handle treatment plan approval
  const handleApproveTreatmentPlan = async () => {
    if (!selectedPlan) return;
    
    setIsSubmittingApproval(true);
    try {
      // In a real application, this would be an API call
      console.log('Approving treatment plan:', selectedPlan.id, 'Notes:', approvalNotes);
      
      // Update the local state to simulate approval
      const updatedPlans = treatmentPlans.map(plan => 
        plan.id === selectedPlan.id 
          ? { ...plan, status: 'approved' as const, pendingApproval: false } 
          : plan
      );
      
      setTreatmentPlans(updatedPlans);
      setSelectedPlan(prevPlan => 
        prevPlan ? { ...prevPlan, status: 'approved', pendingApproval: false } : null
      );
      
      toast({
        title: t('patient.treatment_plans.approved', 'Treatment Plan Approved'),
        description: t('patient.treatment_plans.approval_success', 'Your treatment plan has been successfully approved'),
      });
      
      setShowApproveDialog(false);
    } catch (error) {
      console.error('Error approving treatment plan:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('patient.treatment_plans.approval_error', 'Failed to approve treatment plan'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingApproval(false);
      setApprovalNotes('');
    }
  };
  
  // Load payment options
  const handleShowPaymentOptions = async () => {
    if (!selectedPlan) return;
    
    setIsLoadingPaymentOptions(true);
    try {
      // In a real application, this would fetch payment options from the API
      // For now, create sample payment options based on the selected plan
      const sampleOptions: PaymentOption[] = [
        {
          id: 'full',
          name: 'Full Payment',
          description: 'Pay the entire amount upfront and receive a 5% discount',
          type: 'full',
          amount: Math.round(selectedPlan.totalAmount * 0.95),
          discount: 5
        },
        {
          id: 'deposit',
          name: 'Pay Deposit Now',
          description: 'Pay the deposit now and the remainder at the clinic',
          type: 'deposit',
          amount: selectedPlan.deposit || 500,
          depositAmount: selectedPlan.deposit || 500
        },
        {
          id: 'installment',
          name: '3-Month Payment Plan',
          description: 'Split your payment into 3 monthly installments',
          type: 'installment',
          amount: selectedPlan.totalAmount,
          installments: 3,
          installmentAmount: Math.round(selectedPlan.totalAmount / 3)
        },
        {
          id: 'financing',
          name: 'Dental Financing',
          description: 'Finance your treatment with our partner credit provider',
          type: 'financing',
          amount: selectedPlan.totalAmount,
          installments: 12,
          installmentAmount: Math.round((selectedPlan.totalAmount * 1.08) / 12),
          interestRate: 8
        }
      ];
      
      setPaymentOptions(sampleOptions);
      setSelectedPaymentOption(sampleOptions[0].id);
      setShowPaymentOptions(true);
    } catch (error) {
      console.error('Error fetching payment options:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('patient.treatment_plans.payment_options_error', 'Failed to load payment options'),
        variant: 'destructive'
      });
    } finally {
      setIsLoadingPaymentOptions(false);
    }
  };
  
  // Process payment selection
  const handleProcessPayment = () => {
    if (!selectedPaymentOption || !selectedPlan) return;
    
    // In a real application, this would redirect to a payment page or initiate a payment flow
    console.log('Processing payment option:', selectedPaymentOption);
    
    // For now, just show a success message and close the dialog
    toast({
      title: 'Payment Option Selected',
      description: 'You will be redirected to the payment page.',
    });
    
    // Redirect to payment page (in a real app)
    // For now, just simulate with a local navigation
    window.location.href = `/treatment-payment/${selectedPlan.id}?option=${selectedPaymentOption}`;
    
    setShowPaymentOptions(false);
  };
  
  // Function to format date string
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Get status badge UI
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'proposed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Proposed</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case 'in_treatment':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">In Treatment</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Get payment status badge UI
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'unpaid':
        return <Badge variant="outline">Unpaid</Badge>;
      case 'deposit_paid':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Deposit Paid</Badge>;
      case 'partially_paid':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Partially Paid</Badge>;
      case 'fully_paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Fully Paid</Badge>;
      case 'refunded':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Refunded</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  // Calculate treatment progress
  const calculateProgress = (plan: TreatmentPlan) => {
    if (plan.treatmentProgress !== undefined) {
      return plan.treatmentProgress;
    }
    
    // If no explicit progress is provided, calculate based on item status
    if (!plan.items || plan.items.length === 0) return 0;
    
    const completedItems = plan.items.filter(item => item.status === 'completed').length;
    return Math.round((completedItems / plan.items.length) * 100) as number;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('patient.treatment_plans.title', 'My Treatment Plan')}</h2>
          <p className="text-muted-foreground">{t('patient.treatment_plans.description', 'View and manage your dental treatment plans')}</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : treatmentPlans.length === 0 ? (
        <Card className="py-8">
          <CardContent className="text-center">
            <PencilRuler className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No Treatment Plans</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You don't have any dental treatment plans yet. Please contact your clinic or request a quote.
            </p>
            <Button>Request Treatment Plan</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {treatmentPlans.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Treatment Plans</CardTitle>
                <CardDescription>
                  You have {treatmentPlans.length} treatment plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {treatmentPlans.map(plan => (
                    <div 
                      key={plan.id}
                      className={`p-3 rounded-md cursor-pointer flex justify-between items-center
                        ${selectedPlan?.id === plan.id ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted'}
                      `}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${selectedPlan?.id === plan.id ? 'bg-primary/10' : 'bg-muted'}`}>
                          <FileText className={`h-4 w-4 ${selectedPlan?.id === plan.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{plan.title}</p>
                          <p className="text-xs text-muted-foreground">{plan.clinicName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(plan.status)}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {selectedPlan && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>{selectedPlan.title}</CardTitle>
                      <CardDescription>
                        {selectedPlan.clinicName} • Created on {formatDate(selectedPlan.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedPlan.status)}
                      {getPaymentStatusBadge(selectedPlan.paymentStatus)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Overview Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Treatment Summary & Progress */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <ListChecks className="h-5 w-5 mr-2 text-primary" />
                        Treatment Summary
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Treatment Progress</span>
                          <span className="text-sm font-medium">{calculateProgress(selectedPlan)}%</span>
                        </div>
                        <Progress value={calculateProgress(selectedPlan)} className="h-2" />
                      </div>
                      
                      <div className="rounded-md border p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Treatment Items</span>
                          <span className="text-sm font-medium">{selectedPlan.items.length}</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Treatments Completed</span>
                          <span className="text-sm font-medium">
                            {selectedPlan.items.filter(item => item.status === 'completed').length}
                          </span>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Treatments Pending</span>
                          <span className="text-sm font-medium">
                            {selectedPlan.items.filter(item => item.status === 'pending' || item.status === 'scheduled').length}
                          </span>
                        </div>
                        
                        {selectedPlan.doctorName && (
                          <>
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Assigned Doctor</span>
                              <span className="text-sm font-medium">{selectedPlan.doctorName}</span>
                            </div>
                          </>
                        )}
                        
                        {selectedPlan.nextAppointment && (
                          <>
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Next Appointment</span>
                              <span className="text-sm font-medium">{formatDate(selectedPlan.nextAppointment)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Payment Summary */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <Receipt className="h-5 w-5 mr-2 text-primary" />
                        Payment Summary
                      </h3>
                      
                      <div className="rounded-md border p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Treatment Cost</span>
                          <span className="text-sm font-medium">
                            {selectedPlan.totalAmount} {selectedPlan.currency}
                          </span>
                        </div>
                        
                        {selectedPlan.deposit && (
                          <>
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Required Deposit</span>
                              <span className="text-sm font-medium">
                                {selectedPlan.deposit} {selectedPlan.currency}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Deposit Status</span>
                              <span className="text-sm font-medium">
                                {selectedPlan.depositPaid ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                                    Paid
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100">
                                    Not Paid
                                  </Badge>
                                )}
                              </span>
                            </div>
                            
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Remaining Balance</span>
                              <span className="text-sm font-medium">
                                {selectedPlan.totalAmount - (selectedPlan.depositPaid ? selectedPlan.deposit : 0)} {selectedPlan.currency}
                              </span>
                            </div>
                          </>
                        )}
                        
                        <Separator />
                        <div className="pt-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Payment Options</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleShowPaymentOptions}
                            >
                              View Options
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {selectedPlan.financingAvailable
                              ? "Financing options available for this treatment plan."
                              : "Multiple payment options available for your convenience."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Treatment Details */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium flex items-center">
                        <PencilRuler className="h-5 w-5 mr-2 text-primary" />
                        Treatment Details
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowDetailedPlan(true)}
                      >
                        Detailed View
                      </Button>
                    </div>
                    
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Treatment</th>
                            <th className="text-center p-3 text-sm font-medium text-muted-foreground">Qty</th>
                            <th className="text-right p-3 text-sm font-medium text-muted-foreground">Price</th>
                            <th className="text-right p-3 text-sm font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPlan.items.map((item, index) => (
                            <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                              <td className="p-3 text-sm">
                                <div className="font-medium">{item.name}</div>
                                {item.description && (
                                  <div className="text-xs text-muted-foreground">{item.description}</div>
                                )}
                              </td>
                              <td className="p-3 text-sm text-center">{item.quantity}</td>
                              <td className="p-3 text-sm text-right">{item.totalPrice} {item.currency}</td>
                              <td className="p-3 text-sm text-right">
                                {item.status === 'pending' && (
                                  <Badge variant="outline">Pending</Badge>
                                )}
                                {item.status === 'scheduled' && (
                                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Scheduled</Badge>
                                )}
                                {item.status === 'completed' && (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>
                                )}
                                {item.status === 'cancelled' && (
                                  <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-primary/5 font-medium">
                            <td className="p-3 text-sm" colSpan={2}>Total</td>
                            <td className="p-3 text-sm text-right" colSpan={2}>
                              {selectedPlan.totalAmount} {selectedPlan.currency}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Additional Information or Notes */}
                  {selectedPlan.additionalNotes && (
                    <div className="rounded-md border p-4 bg-muted/20">
                      <h4 className="text-sm font-medium mb-2">Additional Notes</h4>
                      <p className="text-sm text-muted-foreground">{selectedPlan.additionalNotes}</p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex flex-wrap gap-3 border-t pt-6">
                  {/* Action buttons based on treatment plan status */}
                  {selectedPlan.status === 'proposed' && selectedPlan.pendingApproval && (
                    <Button 
                      className="gap-2"
                      onClick={() => setShowApproveDialog(true)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve Treatment Plan
                    </Button>
                  )}
                  
                  {['proposed', 'approved'].includes(selectedPlan.status) && !selectedPlan.depositPaid && (
                    <Button 
                      variant={selectedPlan.status === 'proposed' && selectedPlan.pendingApproval ? 'outline' : 'default'}
                      className="gap-2"
                      onClick={handleShowPaymentOptions}
                    >
                      <CreditCard className="h-4 w-4" />
                      Make Payment
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => {
                      toast({
                        title: "Message Sent",
                        description: "Your message has been sent to the clinic.",
                      });
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message Clinic
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => {
                      toast({
                        title: "Plan Downloaded",
                        description: "Treatment plan has been downloaded.",
                      });
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download Plan
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Patient Actions or Next Steps */}
              {selectedPlan.status !== 'completed' && selectedPlan.status !== 'cancelled' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPlan.status === 'proposed' && selectedPlan.pendingApproval && (
                        <div className="flex gap-4 p-3 rounded-md bg-amber-50 border border-amber-100">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-amber-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-amber-800">Review and Approve Treatment Plan</h4>
                            <p className="text-sm text-amber-700 mt-1">
                              Please review your treatment plan details and approve it to proceed with your dental care.
                            </p>
                            <Button 
                              size="sm" 
                              className="mt-2 bg-amber-600 hover:bg-amber-700"
                              onClick={() => setShowApproveDialog(true)}
                            >
                              Approve Now
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {!selectedPlan.depositPaid && (
                        <div className="flex gap-4 p-3 rounded-md bg-blue-50 border border-blue-100">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-800">Make Deposit Payment</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              Pay your deposit to secure your treatment slot and confirm your booking.
                            </p>
                            <Button 
                              size="sm" 
                              className="mt-2 bg-blue-600 hover:bg-blue-700"
                              onClick={handleShowPaymentOptions}
                            >
                              Pay Now
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {['approved', 'in_treatment'].includes(selectedPlan.status) && !selectedPlan.nextAppointment && (
                        <div className="flex gap-4 p-3 rounded-md bg-green-50 border border-green-100">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <CalendarDays className="h-4 w-4 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-green-800">Schedule Your Appointment</h4>
                            <p className="text-sm text-green-700 mt-1">
                              Schedule your first or next treatment appointment with the clinic.
                            </p>
                            <Button 
                              size="sm" 
                              className="mt-2 bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                toast({
                                  title: "Redirecting",
                                  description: "Taking you to appointment scheduling.",
                                });
                              }}
                            >
                              Schedule Now
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Approval Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-primary" />
              Approve Treatment Plan
            </DialogTitle>
            <DialogDescription>
              Please confirm that you want to approve this treatment plan
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {selectedPlan && (
              <div className="p-3 rounded-md bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{selectedPlan.title}</p>
                    <p className="text-xs text-muted-foreground">{selectedPlan.clinicName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{selectedPlan.totalAmount} {selectedPlan.currency}</p>
                    <p className="text-xs text-muted-foreground">{selectedPlan.items.length} treatments</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="approvalNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="approvalNotes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Any comments or questions about your treatment plan"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="p-3 rounded-md bg-blue-50 border border-blue-100">
              <div className="flex items-start">
                <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  By approving this treatment plan, you're confirming that you understand the proposed treatments and agree to proceed with the dental work. You can still discuss details with your dental provider.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowApproveDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApproveTreatmentPlan}
              disabled={isSubmittingApproval}
            >
              {isSubmittingApproval && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Options Dialog */}
      <Dialog open={showPaymentOptions} onOpenChange={setShowPaymentOptions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-primary" />
              Payment Options
            </DialogTitle>
            <DialogDescription>
              Select how you would like to pay for your treatment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {isLoadingPaymentOptions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {paymentOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`p-3 rounded-md border cursor-pointer
                      ${selectedPaymentOption === option.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/30'}
                    `}
                    onClick={() => setSelectedPaymentOption(option.id)}
                  >
                    <div className="flex items-start">
                      <div className={`p-1.5 rounded-full mt-0.5 mr-3 ${selectedPaymentOption === option.id ? 'bg-primary text-white' : 'bg-muted'}`}>
                        {option.type === 'full' && <Receipt className="h-4 w-4" />}
                        {option.type === 'deposit' && <CreditCard className="h-4 w-4" />}
                        {option.type === 'installment' && <CalendarDays className="h-4 w-4" />}
                        {option.type === 'financing' && <Building className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{option.name}</h4>
                          <span className="font-bold text-primary">
                            {option.type === 'deposit' ? `${option.amount} ${selectedPlan?.currency}` : 
                              option.type === 'installment' ? `${option.installmentAmount} ${selectedPlan?.currency}/mo` :
                              `${option.amount} ${selectedPlan?.currency}`}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                        
                        {option.discount && (
                          <Badge className="mt-2 bg-green-100 text-green-800">
                            {option.discount}% Discount
                          </Badge>
                        )}
                        
                        {option.type === 'installment' && option.installments && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {option.installments} monthly payments of {option.installmentAmount} {selectedPlan?.currency}
                          </div>
                        )}
                        
                        {option.type === 'financing' && option.interestRate && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {option.interestRate}% APR, {option.installments} monthly payments
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentOptions(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleProcessPayment}
              disabled={!selectedPaymentOption || isLoadingPaymentOptions}
            >
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Detailed Treatment Plan Dialog */}
      <Dialog open={showDetailedPlan} onOpenChange={setShowDetailedPlan}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Detailed Treatment Plan
            </DialogTitle>
            <DialogDescription>
              Comprehensive view of your treatment plan
            </DialogDescription>
          </DialogHeader>
          
          <div className="pt-2">
            {selectedPlan && (
              <TreatmentPlanViewer treatmentPlanId={selectedPlan.id} patientView={true} />
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setShowDetailedPlan(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreatmentPlanSection;