/**
 * Patient Treatment Plan Component
 * 
 * Implements treatment plan functionality specifically for the patient portal
 * with appropriate permissions and UI for patient users.
 */
import React from 'react';
import { BaseTreatmentPlan } from './BaseTreatmentPlan';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PatientTreatmentPlanProps {
  quoteId?: string;
  planId?: string | number;
  showActions?: boolean;
  showFullDetails?: boolean;
}

export function PatientTreatmentPlan({
  quoteId,
  planId,
  showActions = true,
  showFullDetails = true
}: PatientTreatmentPlanProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Basic security check - component should only be used by patients
  if (!user || user.role !== 'patient') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Error</AlertTitle>
        <AlertDescription>
          You don't have permission to view this treatment plan.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Custom header for patient view
  const renderHeader = () => (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">
        {t('patient.treatment_plan.title', 'My Treatment Plan')}
      </h2>
      <p className="text-muted-foreground">
        {t('patient.treatment_plan.description', 'View and manage your dental treatment plan')}
      </p>
    </div>
  );
  
  // Add help information after the plan
  const renderHelpInfo = () => (
    <Alert className="mt-6">
      <HelpCircle className="h-4 w-4" />
      <AlertTitle>
        {t('patient.treatment_plan.help.title', 'Need assistance?')}
      </AlertTitle>
      <AlertDescription>
        {t('patient.treatment_plan.help.description', 'If you have questions about your treatment plan, please contact your dental clinic or our support team through the messaging system.')}
      </AlertDescription>
    </Alert>
  );
  
  return (
    <div className="space-y-4">
      <BaseTreatmentPlan 
        quoteId={quoteId}
        planId={planId}
        title={t('patient.treatment_plan.title', 'My Treatment Plan')}
        description={t('patient.treatment_plan.description', 'View and manage your dental treatment plan')}
        showActions={showActions}
        showFullDetails={showFullDetails}
        // Patient-specific customizations
        allowCreating={false} // Patients can't create treatment plans directly
        allowDeleting={false} // Patients can't delete treatment plans
        renderHeader={renderHeader}
      />
      
      {renderHelpInfo()}
    </div>
  );
}