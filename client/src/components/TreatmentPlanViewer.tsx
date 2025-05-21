import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  Check, 
  X, 
  Calendar, 
  Clock, 
  DollarSign, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Treatment {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}

interface TreatmentPlan {
  id: string;
  title: string;
  status: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  clinicId: string;
  clinicName: string;
  clinicLogo?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  patientName: string;
  summary: string;
  totalAmount: number;
  depositAmount?: number;
  currency: string;
  treatments: Treatment[];
  notes?: string;
  doctorName?: string;
  doctorNotes?: string;
  timeline?: {
    startDate?: string;
    endDate?: string;
    duration?: string;
    appointmentCount?: number;
  };
  paymentOptions?: {
    fullPayment: number;
    deposit: number;
    financing?: {
      monthly: number;
      term: number;
      interestRate: number;
    };
  };
  additionalServices?: string[];
  terms?: string[];
  documents?: {
    id: string;
    name: string;
    type: string;
    url?: string;
  }[];
}

interface TreatmentPlanViewerProps {
  plan: TreatmentPlan;
  onBack?: () => void;
  onApprove?: () => void;
  onDecline?: () => void;
  onPay?: () => void;
  onViewDocuments?: () => void;
  onScheduleConsultation?: () => void;
}

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const StatusBadge: React.FC<{ status: TreatmentPlan['status'] }> = ({ status }) => {
  switch (status) {
    case 'proposed':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Proposed</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approved</Badge>;
    case 'in_progress':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">In Progress</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Completed</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Cancelled</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const TreatmentPlanViewer: React.FC<TreatmentPlanViewerProps> = ({
  plan,
  onBack,
  onApprove,
  onDecline,
  onPay,
  onViewDocuments,
  onScheduleConsultation
}) => {
  const { t } = useTranslation();
  const [showAllTreatments, setShowAllTreatments] = useState(false);
  
  const visibleTreatments = showAllTreatments ? plan.treatments : plan.treatments.slice(0, 3);
  const hasMoreTreatments = plan.treatments.length > 3;
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2">
                <ArrowLeft className="mr-1 h-4 w-4" />
                {t('back', 'Back')}
              </Button>
            )}
            <CardTitle>{plan.title || t('treatment_plan.title', 'Treatment Plan')}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {t('treatment_plan.id', 'Plan ID')}: {plan.id}
              <StatusBadge status={plan.status} />
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-1 h-4 w-4" />
              {t('treatment_plan.download_pdf', 'Download PDF')}
            </Button>
            <div className="text-sm text-muted-foreground">
              {t('treatment_plan.created', 'Created')}: {formatDate(plan.createdAt)}
            </div>
            {plan.expiresAt && (
              <div className="text-sm text-muted-foreground">
                {t('treatment_plan.expires', 'Expires')}: {formatDate(plan.expiresAt)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-0">
        <div className="flex flex-col-reverse md:flex-row gap-6">
          {/* Left column: Treatment details */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3">
              {t('treatment_plan.treatment_details', 'Treatment Details')}
            </h3>
            
            <div className="rounded-lg border mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">{t('treatment_plan.treatment', 'Treatment')}</TableHead>
                    <TableHead className="text-center">{t('treatment_plan.qty', 'Qty')}</TableHead>
                    <TableHead className="text-right">{t('treatment_plan.price', 'Price')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTreatments.map((treatment, index) => (
                    <TableRow key={`${treatment.name}-${index}`}>
                      <TableCell className="font-medium">
                        {treatment.name}
                        {treatment.description && (
                          <p className="text-xs text-muted-foreground mt-1">{treatment.description}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{treatment.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(treatment.totalPrice, plan.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {hasMoreTreatments && (
                    <TableRow>
                      <TableCell colSpan={3} className="py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllTreatments(!showAllTreatments)}
                          className="w-full text-muted-foreground text-xs"
                        >
                          {showAllTreatments ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              {t('treatment_plan.show_less', 'Show fewer treatments')}
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              {t('treatment_plan.show_more', 'Show all treatments')} 
                              ({plan.treatments.length - visibleTreatments.length} {t('treatment_plan.more', 'more')})
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Totals */}
                  <TableRow className="border-t-2">
                    <TableCell colSpan={2} className="font-semibold text-right">
                      {t('treatment_plan.subtotal', 'Subtotal')}:
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(plan.totalAmount, plan.currency)}
                    </TableCell>
                  </TableRow>
                  
                  {plan.depositAmount && (
                    <TableRow>
                      <TableCell colSpan={2} className="font-medium text-right">
                        {t('treatment_plan.deposit', 'Required Deposit')}:
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(plan.depositAmount, plan.currency)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Timeline */}
            {plan.timeline && (
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">
                  {t('treatment_plan.timeline', 'Treatment Timeline')}
                </h4>
                <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-md">
                  {plan.timeline.startDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {t('treatment_plan.start_date', 'Start Date')}: {formatDate(plan.timeline.startDate)}
                      </span>
                    </div>
                  )}
                  
                  {plan.timeline.endDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {t('treatment_plan.end_date', 'End Date')}: {formatDate(plan.timeline.endDate)}
                      </span>
                    </div>
                  )}
                  
                  {plan.timeline.duration && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {t('treatment_plan.duration', 'Duration')}: {plan.timeline.duration}
                      </span>
                    </div>
                  )}
                  
                  {plan.timeline.appointmentCount && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {t('treatment_plan.appointments', 'Total Appointments')}: {plan.timeline.appointmentCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Payment options */}
            {plan.paymentOptions && (
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">
                  {t('treatment_plan.payment_options', 'Payment Options')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-md border">
                    <div className="font-medium mb-1">{t('treatment_plan.full_payment', 'Full Payment')}</div>
                    <div className="text-lg font-semibold text-primary">
                      {formatCurrency(plan.paymentOptions.fullPayment, plan.currency)}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-md border">
                    <div className="font-medium mb-1">{t('treatment_plan.deposit_payment', 'Deposit Required')}</div>
                    <div className="text-lg font-semibold text-primary">
                      {formatCurrency(plan.paymentOptions.deposit, plan.currency)}
                    </div>
                  </div>
                  
                  {plan.paymentOptions.financing && (
                    <div className="bg-slate-50 p-3 rounded-md border md:col-span-2">
                      <div className="font-medium mb-1">{t('treatment_plan.financing', 'Financing Available')}</div>
                      <div className="text-lg font-semibold text-primary">
                        {formatCurrency(plan.paymentOptions.financing.monthly, plan.currency)} / {t('treatment_plan.month', 'month')}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t('treatment_plan.financing_terms', '{{term}} months at {{rate}}% interest', {
                          term: plan.paymentOptions.financing.term,
                          rate: plan.paymentOptions.financing.interestRate
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Attached documents */}
            {plan.documents && plan.documents.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-md font-semibold">
                    {t('treatment_plan.documents', 'Attached Documents')}
                  </h4>
                  {onViewDocuments && (
                    <Button variant="outline" size="sm" onClick={onViewDocuments}>
                      {t('treatment_plan.view_all_documents', 'View All')}
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {plan.documents.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex items-center p-2 border rounded-md hover:bg-slate-50">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      <div className="flex-grow">
                        <div className="text-sm font-medium">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">{doc.type}</div>
                      </div>
                      {doc.url && (
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {plan.documents.length > 3 && (
                    <div className="text-sm text-center text-muted-foreground">
                      +{plan.documents.length - 3} {t('treatment_plan.more_documents', 'more documents')}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Additional notes */}
            {plan.notes && (
              <div className="mt-4">
                <Accordion type="single" collapsible defaultValue="notes">
                  <AccordionItem value="notes">
                    <AccordionTrigger>
                      {t('treatment_plan.notes', 'Additional Notes')}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm whitespace-pre-wrap">
                        {plan.notes}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
          
          {/* Right column: Clinic info and actions */}
          <div className="w-full md:w-64 shrink-0">
            {/* Clinic information */}
            <div className="border rounded-lg p-4 mb-4">
              <div className="flex items-center mb-3">
                <Avatar className="h-10 w-10 mr-3">
                  {plan.clinicLogo ? (
                    <AvatarImage src={plan.clinicLogo} alt={plan.clinicName} />
                  ) : (
                    <AvatarFallback>{plan.clinicName?.charAt(0) || 'C'}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{plan.clinicName}</div>
                  <div className="text-xs text-muted-foreground">
                    {t('treatment_plan.treatment_provider', 'Treatment Provider')}
                  </div>
                </div>
              </div>
              
              {plan.clinicAddress && (
                <div className="flex items-start mb-2">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <div className="text-xs">{plan.clinicAddress}</div>
                </div>
              )}
              
              {plan.clinicPhone && (
                <div className="flex items-center mb-2">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="text-xs">{plan.clinicPhone}</div>
                </div>
              )}
              
              {plan.clinicEmail && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="text-xs">{plan.clinicEmail}</div>
                </div>
              )}
              
              {plan.doctorName && (
                <>
                  <Separator className="my-3" />
                  <div className="text-xs font-medium mb-1">
                    {t('treatment_plan.assigned_doctor', 'Assigned Doctor')}
                  </div>
                  <div className="text-sm">{plan.doctorName}</div>
                </>
              )}
            </div>
            
            {/* Actions */}
            <div className="space-y-2">
              {/* Approval actions - only show if plan is proposed */}
              {plan.status === 'proposed' && (
                <>
                  {onApprove && (
                    <Button className="w-full" onClick={onApprove}>
                      <Check className="mr-2 h-4 w-4" />
                      {t('treatment_plan.approve_plan', 'Approve Plan')}
                    </Button>
                  )}
                  
                  {onDecline && (
                    <Button variant="outline" className="w-full" onClick={onDecline}>
                      <X className="mr-2 h-4 w-4" />
                      {t('treatment_plan.decline', 'Decline')}
                    </Button>
                  )}
                </>
              )}
              
              {/* Payment action - show if plan is approved but not paid */}
              {plan.status === 'approved' && onPay && (
                <Button className="w-full" onClick={onPay}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  {t('treatment_plan.pay_deposit', 'Pay Deposit')}
                </Button>
              )}
              
              {/* Schedule consultation */}
              {onScheduleConsultation && (
                <Button 
                  variant={plan.status === 'proposed' ? "outline" : "default"} 
                  className="w-full"
                  onClick={onScheduleConsultation}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {t('treatment_plan.schedule_consultation', 'Schedule Consultation')}
                </Button>
              )}
              
              {/* Share */}
              <Button variant="outline" className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                {t('treatment_plan.share', 'Share Plan')}
              </Button>
              
              {/* Print */}
              <Button variant="outline" className="w-full">
                <Printer className="mr-2 h-4 w-4" />
                {t('treatment_plan.print', 'Print Plan')}
              </Button>
            </div>
            
            {/* Terms and conditions */}
            {plan.terms && plan.terms.length > 0 && (
              <div className="mt-4">
                <Accordion type="single" collapsible>
                  <AccordionItem value="terms">
                    <AccordionTrigger className="text-sm">
                      {t('treatment_plan.terms', 'Terms & Conditions')}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-xs space-y-1 list-disc pl-4">
                        {plan.terms.map((term, index) => (
                          <li key={index}>{term}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-6 pb-4 flex flex-col sm:flex-row sm:justify-between items-center">
        <div className="text-xs text-muted-foreground mb-2 sm:mb-0">
          {t('treatment_plan.last_updated', 'Last updated')}: {formatDate(plan.updatedAt)}
        </div>
        
        {/* Support link */}
        <Button variant="link" className="text-xs h-auto p-0">
          {t('treatment_plan.need_help', 'Need help with this treatment plan?')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TreatmentPlanViewer;