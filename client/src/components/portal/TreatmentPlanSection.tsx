import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  FileText, 
  AlertCircle, 
  ArrowRight, 
  Download, 
  ShieldCheck, 
  Calendar, 
  ThumbsUp, 
  Clock, 
  Info,
  FileUp,
  Edit,
  PencilLine,
  BarChart3,
  Briefcase,
  Plane,
  PiggyBank,
  Percent,
  History,
  Receipt,
  PlusCircle,
  CreditCard
} from 'lucide-react';
import { TreatmentPlanViewer } from '@/components/TreatmentPlanViewer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { TreatmentPlan, TreatmentItem, TreatmentPlanVersion } from '@/types/clientPortal';
import { addUKPriceComparisons } from '@/data/treatmentPrices';

// Mock data for development
const mockTreatmentPlan: TreatmentPlan = {
  items: [
    {
      id: "1",
      treatment: "Dental Implant (Straumann)",
      priceGBP: 550,
      priceUSD: 720,
      quantity: 2,
      subtotalGBP: 1100,
      subtotalUSD: 1440,
      guarantee: "Lifetime guarantee on implant, 5 years on crown"
    },
    {
      id: "2",
      treatment: "Porcelain Crown",
      priceGBP: 175,
      priceUSD: 230,
      quantity: 4,
      subtotalGBP: 700,
      subtotalUSD: 920,
      guarantee: "5-year guarantee"
    },
    {
      id: "3",
      treatment: "Teeth Whitening (Professional)",
      priceGBP: 120,
      priceUSD: 155,
      quantity: 1,
      subtotalGBP: 120,
      subtotalUSD: 155,
      guarantee: "1-year guarantee"
    }
  ],
  totalGBP: 1920,
  totalUSD: 2515,
  notes: "Treatment plan includes all materials, laboratory work, and follow-up appointments during your stay. The treatment will be completed over 5-7 days with 2-3 appointments.",
  guaranteeDetails: "All procedures come with guarantees ranging from 1-5 years depending on the treatment. Dental implants have a lifetime guarantee on the implant fixture itself. Guarantee conditions apply as detailed in your contract.",
  version: 1,
  lastUpdated: "2025-04-10T14:30:00Z",
  approvedByPatient: false,
  approvedByClinic: true
};

// FAQ items for treatment details
const treatmentFaqs = [
  {
    question: "What is a dental implant?",
    answer: "A dental implant is an artificial tooth root made of titanium that is placed into your jaw to hold a replacement tooth or bridge. Implants are an ideal option for people with good general oral health who have lost a tooth or teeth due to periodontal disease, an injury, or some other reason."
  },
  {
    question: "How long does the treatment take?",
    answer: "The entire treatment process for implants typically takes 5-7 days in Istanbul. You'll need 2-3 appointments spaced over this period to complete the treatment. For crowns and veneers, the process usually takes 5 days with 2 appointments."
  },
  {
    question: "Is the procedure painful?",
    answer: "Dental procedures are performed under local anesthesia to minimize discomfort. Most patients report minimal pain during the recovery period, which can be managed with over-the-counter pain medication."
  },
  {
    question: "What aftercare is required?",
    answer: "After treatment, you'll receive detailed aftercare instructions specific to your procedure. Generally, this includes guidelines on oral hygiene, temporary dietary restrictions, and follow-up care. Our team provides continuous support during your recovery period, both in person and remotely after you return home."
  }
];

interface TreatmentPlanSectionProps {
  bookingId?: number;
}

const TreatmentPlanSection: React.FC<TreatmentPlanSectionProps> = ({ bookingId = 123 }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan>(mockTreatmentPlan);
  const [showTreatmentPlanViewer, setShowTreatmentPlanViewer] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  
  // Apply UK price comparisons when component mounts
  useEffect(() => {
    // Process treatment plan to add UK price comparisons
    const treatmentPlanWithUKComparisons = addUKPriceComparisons(treatmentPlan);
    console.log("Treatment plan with UK comparisons:", treatmentPlanWithUKComparisons);
    setTreatmentPlan(treatmentPlanWithUKComparisons);
  }, []);
  
  // Function to format currency
  const formatCurrency = (amount: number, currency: 'GBP' | 'USD') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // States for deposit flow
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [isPayingDeposit, setIsPayingDeposit] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);
  
  // Function to handle treatment plan approval
  const handleApproveTreatmentPlan = () => {
    setIsApproving(true);
    
    // In a real app, this would be an API call to approve the treatment plan
    setTimeout(() => {
      setTreatmentPlan({
        ...treatmentPlan,
        approvedByPatient: true
      });
      setIsApproving(false);
      setShowApproveDialog(false);
      
      toast({
        title: t('portal.treatment_plan.approved', 'Treatment Plan Approved'),
        description: t('portal.treatment_plan.approved_desc', 'Your treatment plan has been approved successfully.'),
      });
      
      // Show deposit dialog after approval
      setTimeout(() => {
        setShowDepositDialog(true);
      }, 500);
    }, 1500);
  };
  
  // Function to handle deposit payment
  const handlePayDeposit = () => {
    setIsPayingDeposit(true);
    
    // In a real app, this would integrate with Stripe
    setTimeout(() => {
      setDepositPaid(true);
      setIsPayingDeposit(false);
      setShowDepositDialog(false);
      
      toast({
        title: 'Deposit Paid',
        description: 'Your £200 refundable deposit has been successfully processed.',
      });
    }, 1500);
  };
  
  // Function to download treatment plan as PDF
  const handleDownloadPlan = () => {
    // In a real app, this would download the PDF
    toast({
      title: t('portal.treatment_plan.downloading', 'Downloading Treatment Plan'),
      description: t('portal.treatment_plan.download_started', 'Your download has started.'),
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>{t('portal.treatment_plan.title', 'Treatment Plan')}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                <PencilLine className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPlan}>
                <Download className="h-4 w-4 mr-2" />
                {t('portal.treatment_plan.download', 'Download')}
              </Button>
              {treatmentPlan.approvedByPatient ? (
                <Badge className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t('portal.treatment_plan.approved_badge', 'Approved')}
                </Badge>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => setShowApproveDialog(true)}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {t('portal.treatment_plan.approve', 'Approve Plan')}
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-muted-foreground mt-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>
                {t('portal.treatment_plan.version', 'Version')}: {treatmentPlan.version}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <Clock className="h-4 w-4" />
              <span>
                {t('portal.treatment_plan.last_updated', 'Last updated')}: {new Date(treatmentPlan.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {/* Add option to toggle between legacy view and new treatment plan viewer */}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowTreatmentPlanViewer(!showTreatmentPlanViewer)}>
              <FileUp className="h-4 w-4 mr-2" />
              {showTreatmentPlanViewer ? 'Switch to Summary View' : 'View with File Manager'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-hidden p-0">
          {showTreatmentPlanViewer ? (
            // New enhanced treatment plan viewer with file management
            <TreatmentPlanViewer 
              treatmentPlanId={123} // In real implementation, use actual treatment plan ID
              canUploadFiles={true}
              patientView={true}
              onFileUploaded={(file) => {
                toast({
                  title: 'File Uploaded',
                  description: `${file.filename} has been added to your treatment plan.`
                });
              }}
            />
          ) : (
            // Legacy view with summary information
            <ScrollArea className="h-[calc(65vh-8rem)]">
              <div className="px-6 py-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Receipt className="h-5 w-5 mr-2 text-blue-500" />
                    {t('portal.treatment_plan.treatment_details', 'Treatment Details')}
                  </h3>
                  
                  <Tabs defaultValue="details" className="mb-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="details">Treatment Details</TabsTrigger>
                      <TabsTrigger value="savings">UK Price Comparison</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details">
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-12 px-4 py-3 bg-gray-100 text-sm font-medium">
                          <div className="col-span-5">{t('portal.treatment_plan.treatment', 'Treatment')}</div>
                          <div className="col-span-2 text-center">{t('portal.treatment_plan.quantity', 'Qty')}</div>
                          <div className="col-span-2 text-right">{t('portal.treatment_plan.price_per_unit', 'Price')}</div>
                          <div className="col-span-3 text-right">{t('portal.treatment_plan.subtotal', 'Subtotal')}</div>
                        </div>
                        
                        {treatmentPlan.items.map((item, index) => (
                          <div 
                            key={item.id} 
                            className={`grid grid-cols-12 px-4 py-3 text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          >
                            <div className="col-span-5">
                              <div className="font-medium">{item.treatment}</div>
                              <div className="text-gray-500 text-xs mt-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger className="flex items-center">
                                      <ShieldCheck className="h-3 w-3 text-green-600 mr-1" />
                                      <span>{t('portal.treatment_plan.guaranteed', 'Guaranteed')}</span>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p>{item.guarantee}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                            <div className="col-span-2 text-center self-center">{item.quantity}</div>
                            <div className="col-span-2 text-right self-center">
                              <div>{formatCurrency(item.priceGBP, 'GBP')}</div>
                              <div className="text-xs text-gray-500">{formatCurrency(item.priceUSD, 'USD')}</div>
                            </div>
                            <div className="col-span-3 text-right self-center">
                              <div>{formatCurrency(item.subtotalGBP, 'GBP')}</div>
                              <div className="text-xs text-gray-500">{formatCurrency(item.subtotalUSD, 'USD')}</div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="grid grid-cols-12 px-4 py-3 bg-blue-50 text-sm font-medium border-t border-blue-100">
                          <div className="col-span-9 text-right">{t('portal.treatment_plan.total', 'Total')}</div>
                          <div className="col-span-3 text-right">
                            <div className="font-bold">{formatCurrency(treatmentPlan.totalGBP, 'GBP')}</div>
                            <div className="text-gray-600">{formatCurrency(treatmentPlan.totalUSD, 'USD')}</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="savings">
                      {/* UK Price Comparison View */}
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-14 px-4 py-3 bg-gray-100 text-sm font-medium">
                          <div className="col-span-4">Treatment</div>
                          <div className="col-span-2 text-center">Qty</div>
                          <div className="col-span-3 text-right">UK Price</div>
                          <div className="col-span-3 text-right">Our Price</div>
                          <div className="col-span-2 text-right">Savings</div>
                        </div>
                        
                        {treatmentPlan.items.map((item, index) => (
                          <div 
                            key={item.id} 
                            className={`grid grid-cols-14 px-4 py-3 text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          >
                            <div className="col-span-4">
                              <div className="font-medium">{item.treatment}</div>
                            </div>
                            <div className="col-span-2 text-center self-center">{item.quantity}</div>
                            <div className="col-span-3 text-right self-center">
                              {item.homeCountryPriceGBP && (
                                <>
                                  <div>{formatCurrency(item.homeCountryPriceGBP, 'GBP')}</div>
                                  <div className="text-xs text-gray-500">{formatCurrency(item.homeCountrySubtotalGBP || 0, 'GBP')} total</div>
                                </>
                              )}
                            </div>
                            <div className="col-span-3 text-right self-center">
                              <div>{formatCurrency(item.priceGBP, 'GBP')}</div>
                              <div className="text-xs text-gray-500">{formatCurrency(item.subtotalGBP, 'GBP')} total</div>
                            </div>
                            <div className="col-span-2 text-right self-center">
                              {item.savingsPercentage && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  {item.savingsPercentage}% off
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Total row with savings */}
                        <div className="grid grid-cols-14 px-4 py-4 bg-blue-50 text-sm font-medium border-t border-blue-100">
                          <div className="col-span-6 text-right">Total</div>
                          <div className="col-span-3 text-right">
                            <div className="font-bold">{formatCurrency(treatmentPlan.totalHomeCountryGBP || 0, 'GBP')}</div>
                            <div className="text-xs text-gray-500">UK Price</div>
                          </div>
                          <div className="col-span-3 text-right">
                            <div className="font-bold">{formatCurrency(treatmentPlan.totalGBP, 'GBP')}</div>
                            <div className="text-xs text-gray-500">Turkey Price</div>
                          </div>
                          <div className="col-span-2 text-right">
                            <div className="text-green-600 font-bold">{treatmentPlan.totalSavingsPercentage}% off</div>
                          </div>
                        </div>
                        
                        {/* Savings highlight box */}
                        <div className="p-4 bg-green-50 border-t border-green-100">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <PiggyBank className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-green-800">Total Savings: {formatCurrency(treatmentPlan.totalSavingsGBP || 0, 'GBP')}</h4>
                              <p className="text-sm text-green-700">
                                You save {treatmentPlan.totalSavingsPercentage}% compared to UK prices for the same treatments
                              </p>
                            </div>
                          </div>
                          
                          {treatmentPlan.totalSavingsGBP && treatmentPlan.totalSavingsGBP > 0 && (
                            <div className="mt-3">
                              <div className="text-xs text-green-700 mb-1">Savings amount</div>
                              <Progress 
                                value={treatmentPlan.totalSavingsPercentage} 
                                className="h-2 bg-green-200"
                              />
                              <div className="flex justify-between text-xs mt-1">
                                <span>0%</span>
                                <span>{treatmentPlan.totalSavingsPercentage}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                
                {treatmentPlan.notes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {t('portal.treatment_plan.notes', 'Treatment Notes')}
                    </h3>
                    <Card className="bg-blue-50 border-blue-100">
                      <CardContent className="p-4">
                        <div className="flex">
                          <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-blue-800">{treatmentPlan.notes}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {treatmentPlan.guaranteeDetails && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      {t('portal.treatment_plan.guarantee_details', 'Guarantee Information')}
                    </h3>
                    <Card className="bg-green-50 border-green-100">
                      <CardContent className="p-4">
                        <div className="flex">
                          <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-green-800">{treatmentPlan.guaranteeDetails}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    {t('portal.treatment_plan.faq', 'Frequently Asked Questions')}
                  </h3>
                  
                  <Accordion type="single" collapsible className="bg-white rounded-lg border">
                    {treatmentFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-3">
                          <p className="text-gray-700">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    {t('portal.treatment_plan.timeline', 'Treatment Timeline')}
                  </h3>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="relative border-l-2 border-blue-200 pl-5 pb-2">
                        <div className="mb-8 relative">
                          <div className="absolute -left-[25px] bg-blue-500 rounded-full h-4 w-4 mt-1 border-2 border-white"></div>
                          <h4 className="font-medium">Free Online Consultation</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Choose a time and date in the appointment section. You'll receive email confirmations and calendar invites.
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Before Travel
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-8 relative">
                          <div className="absolute -left-[25px] bg-yellow-500 rounded-full h-4 w-4 mt-1 border-2 border-white"></div>
                          <h4 className="font-medium">Review & Confirm Treatment Plan</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            After your consultation, review your detailed treatment plan. Click "Approve Plan" and pay a £200 refundable deposit to secure your booking.
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Before Travel
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-8 relative">
                          <div className="absolute -left-[25px] bg-blue-500 rounded-full h-4 w-4 mt-1 border-2 border-white"></div>
                          <h4 className="font-medium">Day 1: Arrival & Initial Consultation</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Fill out the new patient form (bring passport/ID). X-rays and a full consultation will be done. Any treatment changes will be discussed, with you having full control. Check the price list in your treatment plan for transparency.
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              In Istanbul
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-8 relative">
                          <div className="absolute -left-[25px] bg-blue-500 rounded-full h-4 w-4 mt-1 border-2 border-white"></div>
                          <h4 className="font-medium">Days 1-2: Treatment & Recovery</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Treatment begins. Healing and medicine will be provided by the clinic. Rest at your hotel where special dietary needs (e.g., soft foods) can be accommodated.
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              In Istanbul
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-8 relative">
                          <div className="absolute -left-[25px] bg-blue-500 rounded-full h-4 w-4 mt-1 border-2 border-white"></div>
                          <h4 className="font-medium">Day 3: Clinic Check-up & Laboratory Work</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Return to the clinic for a check-up. Any laboratory work for custom dental pieces will be processed.
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              In Istanbul
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute -left-[25px] bg-green-500 rounded-full h-4 w-4 mt-1 border-2 border-white"></div>
                          <h4 className="font-medium">Day 4: Final Placement</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Final placement of any crowns, veneers, or other restorations. Final adjustments and post-treatment care instructions will be provided.
                          </p>
                          <div className="mt-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              In Istanbul
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
        
        <CardFooter className="border-t pt-4">
          {!treatmentPlan.approvedByPatient ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 w-full">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {t('portal.treatment_plan.approval_needed', 'Treatment Plan Approval Required')}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {t('portal.treatment_plan.approval_desc', 'Please review and approve your treatment plan to proceed with scheduling your appointments.')}
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowApproveDialog(true)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {t('portal.treatment_plan.approve', 'Approve Treatment Plan')}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full">
              <div className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <div className="w-full">
                  <p className="text-sm font-medium text-green-800">
                    {t('portal.treatment_plan.approved_status', 'Treatment Plan Approved')}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {t('portal.treatment_plan.next_steps', 'Your treatment plan has been approved. The clinic will contact you to schedule your appointments.')}
                  </p>
                  
                  {/* Deposit section */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex-1">
                      {depositPaid ? (
                        <div className="flex items-center mt-2 bg-green-100 rounded-lg p-2">
                          <div className="bg-green-200 p-1 rounded-full mr-2">
                            <CheckCircle2 className="h-4 w-4 text-green-700" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-green-800">£200 Deposit Paid</p>
                            <p className="text-xs text-green-700">Refundable if canceled 14+ days before appointment</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center mt-2 bg-blue-50 rounded-lg p-2">
                          <div className="bg-blue-100 p-1 rounded-full mr-2">
                            <PiggyBank className="h-4 w-4 text-blue-700" />
                          </div>
                          <div className="mr-4">
                            <p className="text-xs font-medium text-blue-800">£200 Refundable Deposit Required</p>
                            <p className="text-xs text-blue-700">Secures your appointment and is deducted from final cost</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      {depositPaid ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white"
                          onClick={() => {
                            // Navigate to appointments in a real app
                            toast({
                              title: t('portal.treatment_plan.scheduling', 'Appointments'),
                              description: t('portal.treatment_plan.schedule_desc', 'Appointment scheduling will be available soon.'),
                            });
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Appointment
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setShowDepositDialog(true)}
                        >
                          <PiggyBank className="h-4 w-4 mr-2" />
                          Pay Deposit Now
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {depositPaid && (
                    <div className="mt-3">
                      <p className="text-xs text-green-700">
                        Your appointment is confirmed for <span className="font-medium">May 15-19, 2025</span>. 
                        For any changes, please contact the MyDentalFly team at least 14 days before to maintain deposit refund eligibility.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
      
      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('portal.treatment_plan.approve_dialog_title', 'Approve Treatment Plan')}</DialogTitle>
            <DialogDescription>
              {t('portal.treatment_plan.approve_dialog_desc', 'By approving this treatment plan, you confirm that you understand and accept the proposed treatments, costs, and timeline.')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <p className="font-medium text-gray-800">{t('portal.treatment_plan.summary', 'Summary')}</p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{t('portal.treatment_plan.summary_treatments', 'Treatments')}: {treatmentPlan.items.map(item => item.treatment).join(', ')}</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{t('portal.treatment_plan.summary_total', 'Total Cost')}: {formatCurrency(treatmentPlan.totalGBP, 'GBP')} / {formatCurrency(treatmentPlan.totalUSD, 'USD')}</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{t('portal.treatment_plan.summary_duration', 'Expected Duration')}: 5-7 days</span>
              </li>
            </ul>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={isApproving}
            >
              {t('portal.treatment_plan.cancel', 'Cancel')}
            </Button>
            <Button
              variant="default"
              onClick={handleApproveTreatmentPlan}
              disabled={isApproving}
            >
              {isApproving ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent border-white"></div>
                  {t('portal.treatment_plan.approving', 'Approving...')}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t('portal.treatment_plan.confirm_approve', 'Confirm Approval')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit Payment Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <PiggyBank className="h-5 w-5 mr-2 text-blue-500" />
              Secure Your Treatment with £200 Deposit
            </DialogTitle>
            <DialogDescription>
              Your deposit secures your treatment slot and is fully refundable if canceled 14+ days before your appointment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                Deposit Contract
              </h3>
              
              <div className="bg-white border rounded-md p-4 text-sm">
                <p className="font-semibold mb-2">MyDentalFly.com Deposit Agreement</p>
                <p className="mb-2">This agreement confirms that the patient agrees to pay a £200 deposit to secure their dental treatment as described in the approved treatment plan.</p>
                
                <div className="space-y-2 mb-3">
                  <p className="font-medium">Key Terms:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>The £200 deposit will be deducted from your final treatment cost</li>
                    <li>100% refundable if canceled 14+ days before your scheduled appointment</li>
                    <li>50% refundable if canceled 7-13 days before your scheduled appointment</li>
                    <li>Non-refundable if canceled less than 7 days before your scheduled appointment</li>
                  </ul>
                </div>
                
                <p>By clicking "Pay Deposit Now", you confirm you have read and understood these terms.</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2 flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-gray-600" />
                Payment Details
              </h3>
              
              <div className="p-4 border rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-medium">Refundable Deposit</p>
                    <p className="text-gray-500 text-sm">Secures your treatment appointment</p>
                  </div>
                  <div className="text-xl font-bold">£200</div>
                </div>
                
                {/* This would be replaced with actual Stripe payment form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm mb-1">Card Number</label>
                      <div className="border rounded-md p-2 bg-gray-50">
                        <div className="flex items-center">
                          <span className="text-gray-400">••••</span>
                          <span className="mx-1 text-gray-400">••••</span>
                          <span className="mx-1 text-gray-400">••••</span>
                          <span className="mx-1">4242</span>
                          <CreditCard className="ml-auto h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Expiration</label>
                      <div className="border rounded-md p-2 bg-gray-50">
                        <span>12/25</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">CVC</label>
                      <div className="border rounded-md p-2 bg-gray-50">
                        <span className="text-gray-400">•••</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDepositDialog(false)}
              disabled={isPayingDeposit}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handlePayDeposit}
              disabled={isPayingDeposit}
            >
              {isPayingDeposit ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent border-white"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <PiggyBank className="h-4 w-4 mr-2" />
                  Pay Deposit Now
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2 text-blue-500" />
              Edit Treatment Plan
            </DialogTitle>
            <DialogDescription>
              Make changes to your treatment plan. All changes will be tracked in the version history.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="treatments" className="mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="history">Version History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="treatments" className="max-h-[60vh] overflow-y-auto p-1">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Current Treatment Items</h3>
                  
                  <div className="space-y-3">
                    {treatmentPlan.items.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-md border">
                        <div>
                          <div className="font-medium">{item.treatment}</div>
                          <div className="text-sm text-gray-500">
                            {item.quantity} × {formatCurrency(item.priceGBP, 'GBP')} = {formatCurrency(item.subtotalGBP, 'GBP')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <PencilLine className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="mt-4 w-full" variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Treatment Item
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="max-h-[60vh] overflow-y-auto p-1">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Treatment Notes</h3>
                  <textarea 
                    className="w-full min-h-[120px] rounded-md border border-input bg-white p-3 text-sm"
                    defaultValue={treatmentPlan.notes}
                    placeholder="Enter treatment notes here..."
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Guarantee Details</h3>
                  <textarea 
                    className="w-full min-h-[120px] rounded-md border border-input bg-white p-3 text-sm"
                    defaultValue={treatmentPlan.guaranteeDetails}
                    placeholder="Enter guarantee details here..."
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="max-h-[60vh] overflow-y-auto p-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <History className="h-4 w-4 mr-2 text-blue-500" />
                  Version History
                </h3>
                
                <div className="relative border-l-2 border-gray-200 pl-5 space-y-6">
                  {treatmentPlan.versionHistory ? (
                    treatmentPlan.versionHistory.map((version, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[15px] bg-blue-500 rounded-full h-3 w-3 mt-1.5 border-2 border-white"></div>
                        <div className="mb-1">
                          <span className="text-sm font-medium">Version {version.versionNumber}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(version.timestamp).toLocaleDateString()} {new Date(version.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Edited by: </span>
                          <span className="font-medium">{version.editedBy}</span>
                          <Badge className="ml-2 text-xs" variant="outline">{version.editedByRole}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{version.changes}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-3 text-center text-sm text-gray-500">
                      No version history available
                    </div>
                  )}
                  
                  {/* Current version */}
                  <div className="relative">
                    <div className="absolute -left-[15px] bg-green-500 rounded-full h-3 w-3 mt-1.5 border-2 border-white"></div>
                    <div className="mb-1">
                      <span className="text-sm font-medium">Version {treatmentPlan.version} (Current)</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(treatmentPlan.lastUpdated).toLocaleDateString()} {new Date(treatmentPlan.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Edited by: </span>
                      <span className="font-medium">{treatmentPlan.lastEditedBy || 'Clinic Staff'}</span>
                      <Badge className="ml-2 text-xs" variant="outline">{treatmentPlan.lastEditedByRole || 'clinic'}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Initial treatment plan created</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // In a real app, this would save the edited treatment plan
                toast({
                  title: "Treatment Plan Updated",
                  description: "Your changes have been saved and a new version has been created.",
                });
                setShowEditDialog(false);
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreatmentPlanSection;