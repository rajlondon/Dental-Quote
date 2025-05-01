import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Download } from "lucide-react";
import { useTreatmentPlan } from '@/hooks/use-treatment-plans';
import { TreatmentPlanStatus, PaymentStatus } from '@shared/models/treatment-plan';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface ViewTreatmentPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatmentPlanId: number;
}

export const ViewTreatmentPlanDialog: React.FC<ViewTreatmentPlanDialogProps> = ({
  open,
  onOpenChange,
  treatmentPlanId,
}) => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useTreatmentPlan(treatmentPlanId);
  const { toast } = useToast();
  const treatmentPlan = data?.data?.treatmentPlan;

  // Get language code and corresponding locale from the i18n instance
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const locale = currentLanguage === 'tr' ? 'tr-TR' : 'en-GB';
  
  // Function to format currency based on user locale
  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Function to format dates based on user locale
  const formatDate = (dateString?: string) => {
    if (!dateString) return t("common.not_available", "N/A");
    return new Date(dateString).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle download PDF
  const handleDownload = () => {
    // In a real application, this would trigger a PDF download
    // For now, we'll just show a success toast
    toast({
      title: t("clinic.treatment_plans.download.title", "Download Started"),
      description: t("clinic.treatment_plans.download.preparing", "The treatment plan PDF is being generated and downloaded."),
    });
  };

  // Handle send to patient
  const handleSendToPatient = () => {
    // In a real application, this would send an email to the patient with the plan
    // For now, we'll just show a success toast
    toast({
      title: t("clinic.treatment_plans.send.success_title", "Email Sent"),
      description: t("clinic.treatment_plans.send.success_description", "The treatment plan has been sent to the patient's email."),
    });
  };

  // Get color for status badge
  const getStatusColor = (status: TreatmentPlanStatus) => {
    switch(status) {
      case TreatmentPlanStatus.DRAFT:
        return "bg-gray-200 text-gray-800";
      case TreatmentPlanStatus.SENT:
        return "bg-blue-100 text-blue-800";
      case TreatmentPlanStatus.ACCEPTED:
        return "bg-green-100 text-green-800";
      case TreatmentPlanStatus.IN_PROGRESS:
        return "bg-amber-100 text-amber-800";
      case TreatmentPlanStatus.COMPLETED:
        return "bg-green-200 text-green-900";
      case TreatmentPlanStatus.REJECTED:
        return "bg-red-100 text-red-800";
      case TreatmentPlanStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Get color for payment status badge
  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch(status) {
      case PaymentStatus.PAID:
        return "bg-green-100 text-green-800";
      case PaymentStatus.PARTIAL:
        return "bg-yellow-100 text-yellow-800";
      case PaymentStatus.PENDING:
        return "bg-gray-200 text-gray-800";
      case PaymentStatus.REFUNDED:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{t("clinic.treatment_plans.view.title", "Treatment Plan Details")}</DialogTitle>
          <DialogDescription>
            {t("clinic.treatment_plans.view.description", "View all details of this treatment plan.")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError || !treatmentPlan ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{t("clinic.treatment_plans.view.error", "Error loading treatment plan. Please try again.")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main treatment plan info card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{treatmentPlan.title}</CardTitle>
                    <CardDescription>{treatmentPlan.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(treatmentPlan.status)}>
                      {t(`clinic.treatment_plans.status.${treatmentPlan.status.toLowerCase()}`, treatmentPlan.status.replace('_', ' '))}
                    </Badge>
                    <Badge className={getPaymentStatusColor(treatmentPlan.paymentStatus)}>
                      {t(`clinic.treatment_plans.payment.${treatmentPlan.paymentStatus.toLowerCase()}`, treatmentPlan.paymentStatus)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">{t("clinic.treatment_plans.view.patient", "Patient")}</h3>
                    <p>{treatmentPlan.patientName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">{t("clinic.treatment_plans.view.clinic", "Clinic")}</h3>
                    <p>{treatmentPlan.clinicName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">{t("clinic.treatment_plans.view.created", "Created")}</h3>
                    <p>{formatDate(treatmentPlan.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">{t("clinic.treatment_plans.view.updated", "Last Updated")}</h3>
                    <p>{formatDate(treatmentPlan.updatedAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">{t("clinic.treatment_plans.view.appointment_date", "Appointment Date")}</h3>
                    <p>{formatDate(treatmentPlan.appointmentDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground">{t("clinic.treatment_plans.view.duration", "Estimated Duration")}</h3>
                    <p>{treatmentPlan.estimatedDuration || t("clinic.treatment_plans.view.not_specified", "Not specified")}</p>
                  </div>
                </div>

                {treatmentPlan.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">{t("clinic.treatment_plans.view.notes", "Additional Notes")}</h3>
                    <p className="text-sm">{treatmentPlan.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Treatment items */}
            <div>
              <h3 className="font-semibold mb-2">{t("clinic.treatment_plans.view.treatment_items", "Treatment Items")}</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">{t("clinic.treatment_plans.view.item", "Item")}</th>
                      <th className="px-4 py-3 text-right">{t("clinic.treatment_plans.view.price", "Price")}</th>
                      <th className="px-4 py-3 text-right">{t("clinic.treatment_plans.view.qty", "Qty")}</th>
                      <th className="px-4 py-3 text-right">{t("clinic.treatment_plans.view.total", "Total")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {treatmentPlan.treatmentItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500">{item.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {formatCurrency(item.price, treatmentPlan.currency)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm font-medium text-right">
                          {formatCurrency(item.price * item.quantity, treatmentPlan.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-medium">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right">
                        {t("clinic.treatment_plans.view.total", "Total")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(treatmentPlan.totalPrice, treatmentPlan.currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("common.close", "Close")}
              </Button>
              <Button 
                variant="outline" 
                className="gap-1"
                onClick={handleSendToPatient}
              >
                <Send className="h-4 w-4" />
                {t("clinic.treatment_plans.actions.send_to_patient", "Send to Patient")}
              </Button>
              <Button 
                className="gap-1"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                {t("clinic.treatment_plans.download.button", "Download PDF")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};