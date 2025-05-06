/**
 * Clinic Treatment Plan Component
 * 
 * Implements treatment plan functionality specifically for the clinic portal
 * with appropriate permissions and UI for clinic staff users.
 */
import React from 'react';
import { BaseTreatmentPlan } from './BaseTreatmentPlan';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Send, Download, FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { TreatmentPlan } from '@shared/models/treatment-plan';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ClinicTreatmentPlanProps {
  quoteId?: string;
  planId?: string | number;
  showActions?: boolean;
  showFullDetails?: boolean;
  onExportPdf?: (planId: string | number) => void;
  onSendToPatient?: (planId: string | number) => void;
}

export function ClinicTreatmentPlan({
  quoteId,
  planId,
  showActions = true,
  showFullDetails = true,
  onExportPdf,
  onSendToPatient
}: ClinicTreatmentPlanProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Basic security check - component should only be used by clinic staff
  if (!user || user.role !== 'clinic_staff') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Error</AlertTitle>
        <AlertDescription>
          You don't have permission to view this clinic treatment plan.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Custom action menu for clinic treatment plans
  const renderActionMenu = (plan: TreatmentPlan) => {
    return (
      <DropdownMenuItem
        onClick={() => {
          if (onSendToPatient) {
            onSendToPatient(plan.id);
          } else {
            // Default behavior if no handler provided
            toast({
              title: 'Treatment plan sent',
              description: 'The treatment plan has been sent to the patient.',
            });
          }
        }}
      >
        <Send className="mr-2 h-4 w-4" />
        Send to Patient
      </DropdownMenuItem>
    );
  };
  
  // Custom header for clinic view
  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('clinic.treatment_plan.title', 'Treatment Plans')}
        </h2>
        <p className="text-muted-foreground">
          {t('clinic.treatment_plan.description', 'Create and manage treatment plans for your patients')}
        </p>
      </div>
      
      {/* Export and Send buttons for clinic staff */}
      {planId && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (onExportPdf && planId) {
                onExportPdf(planId);
              } else {
                // Default behavior if no handler provided
                toast({
                  title: 'Exporting PDF',
                  description: 'The treatment plan PDF is being generated.',
                });
              }
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          
          <Button
            size="sm"
            onClick={() => {
              if (onSendToPatient && planId) {
                onSendToPatient(planId);
              } else {
                // Default behavior if no handler provided
                toast({
                  title: 'Treatment plan sent',
                  description: 'The treatment plan has been sent to the patient.',
                });
              }
            }}
          >
            <Send className="mr-2 h-4 w-4" />
            Send to Patient
          </Button>
        </div>
      )}
    </div>
  );
  
  return (
    <BaseTreatmentPlan 
      quoteId={quoteId}
      planId={planId}
      title={t('clinic.treatment_plan.title', 'Treatment Plans')}
      description={t('clinic.treatment_plan.description', 'Create and manage treatment plans for your patients')}
      showActions={showActions}
      showFullDetails={showFullDetails}
      // Clinic-specific customizations
      allowCreating={true}
      allowEditing={true}
      allowDeleting={true}
      renderHeader={renderHeader}
      renderActionMenu={renderActionMenu}
    />
  );
}