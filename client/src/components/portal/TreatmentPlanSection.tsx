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
  Receipt
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
  
  // Function to format currency
  const formatCurrency = (amount: number, currency: 'GBP' | 'USD') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
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
                  <h3 className="text-lg font-semibold mb-3">
                    {t('portal.treatment_plan.treatment_details', 'Treatment Details')}
                  </h3>
                  
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
                  <h3 className="text-lg font-semibold mb-3">
                    {t('portal.treatment_plan.timeline', 'Treatment Timeline')}
                  </h3>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="relative border-l-2 border-blue-200 pl-5 pb-2">
                        <div className="mb-8 relative">
                          <div className="absolute -left-[25px] bg-blue-500 rounded-full h-4 w-4 mt-1 border-2 border-white"></div>
                          <h4 className="font-medium">{t('portal.treatment_plan.day1', 'Day 1: Initial Consultation')}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Meet with your dentist for evaluation, X-rays and 3D scans if needed. Your treatment plan will be confirmed.
                          </p>
                        </div>
                        
                        <div className="mb-8 relative">
                          <div className="absolute -left-[25px] bg-blue-500 rounded-full h-4 w-4 mt-1 border-2 border-white"></div>
                          <h4 className="font-medium">{t('portal.treatment_plan.day2', 'Day 2-3: Preparation')}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Implant placement (if applicable) and preparation of teeth for crowns or other restorations.
                          </p>
                        </div>
                        
                        <div className="mb-8 relative">
                          <div className="absolute -left-[25px] bg-blue-500 rounded-full h-4 w-4 mt-1 border-2 border-white"></div>
                          <h4 className="font-medium">{t('portal.treatment_plan.day4', 'Day 4-5: Laboratory Work')}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Custom crowns, veneers, or other restorations are prepared in the laboratory.
                          </p>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute -left-[25px] bg-blue-500 rounded-full h-4 w-4 mt-1 border-2 border-white"></div>
                          <h4 className="font-medium">{t('portal.treatment_plan.day6', 'Day 6-7: Final Placement')}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Permanent placement of crowns or restorations, final adjustments, and post-treatment instructions.
                          </p>
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
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {t('portal.treatment_plan.approved_status', 'Treatment Plan Approved')}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {t('portal.treatment_plan.next_steps', 'Your treatment plan has been approved. The clinic will contact you to schedule your appointments.')}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-white"
                    onClick={() => {
                      // Navigate to appointments in a real app
                      toast({
                        title: t('portal.treatment_plan.scheduling', 'Appointments'),
                        description: t('portal.treatment_plan.schedule_desc', 'Appointment scheduling will be available soon.'),
                      });
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('portal.treatment_plan.schedule', 'Schedule Appointments')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
      
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
    </div>
  );
};

export default TreatmentPlanSection;