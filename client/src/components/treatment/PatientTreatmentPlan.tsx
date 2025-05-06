/**
 * Patient Treatment Plan Component
 * 
 * Extends the base treatment plan component with patient-specific functionality
 */
import React from 'react';
import { ArrowRight, Calendar, FileDown } from 'lucide-react';
import { BaseTreatmentPlan, BaseTreatmentPlanProps } from './BaseTreatmentPlan';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { TreatmentPlan } from '@shared/models/treatment-plan';

export interface PatientTreatmentPlanProps extends Omit<BaseTreatmentPlanProps, 'onExportPdf' | 'onSendToPatient' | 'onComplete' | 'onCancel'> {
  onBookAppointment?: (plan: TreatmentPlan) => void;
}

/**
 * Patient-specific treatment plan component
 */
export function PatientTreatmentPlan({
  planId,
  quoteId,
  packageId,
  specialOfferId,
  showActions = true,
  showFullDetails = false,
  readonly = false,
  onBookAppointment,
  className = '',
}: PatientTreatmentPlanProps) {
  const { toast } = useToast();
  
  // Handle exporting the treatment plan as PDF
  const handleExportPdf = async (id: string) => {
    try {
      const response = await apiRequest('GET', `/api/v1/treatment-plans/${id}/pdf`, null, {
        responseType: 'blob'
      });
      
      // Create a blob URL for the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and click it to download the PDF
      const a = document.createElement('a');
      a.href = url;
      a.download = `treatment-plan-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Your treatment plan has been downloaded as a PDF.',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download the treatment plan. Please try again later.',
        variant: 'destructive',
      });
    }
  };
  
  // Render the base component with patient-specific props
  return (
    <div className="space-y-4">
      <BaseTreatmentPlan
        planId={planId}
        quoteId={quoteId}
        packageId={packageId}
        specialOfferId={specialOfferId}
        showActions={showActions}
        showFullDetails={showFullDetails}
        readonly={readonly}
        onExportPdf={handleExportPdf}
        className={className}
      />
      
      {/* Patient-specific actions below the plan */}
      {showActions && planId && (
        <div className="flex flex-wrap justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => handleExportPdf(planId)}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Download PDF
          </Button>
          
          <Button
            onClick={() => onBookAppointment && planId && onBookAppointment({
              id: planId,
              title: 'Treatment Plan',
              status: 'ACCEPTED',
              totalPrice: 0,
              finalPrice: 0,
              paymentStatus: 'UNPAID',
              treatments: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              sourceType: 'CUSTOM'
            })}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Book Appointment
          </Button>
          
          <Button
            variant="link"
            onClick={() => window.open(`/portal/treatment-comparison?planId=${planId}`, '_blank')}
            className="flex items-center gap-1"
          >
            Compare with other clinics
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}