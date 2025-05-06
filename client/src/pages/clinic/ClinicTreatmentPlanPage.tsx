/**
 * Clinic Treatment Plan Page
 * 
 * Displays and allows management of treatment plans for clinic staff
 * Uses the unified treatment plan components
 */
import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Download, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClinicTreatmentPlan } from '@/components/treatment';
import { ensureUuidFormat } from '@/utils/id-converter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function ClinicTreatmentPlanPage() {
  const params = useParams<{id?: string}>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  const [isSendingPlan, setIsSendingPlan] = useState(false);
  
  // Get the plan ID from the URL params
  const planId = params?.id;
  
  // Convert numeric ID to UUID format if needed
  const formattedPlanId = planId ? ensureUuidFormat(planId) : undefined;
  
  // Function to handle going back to the treatment plans list
  const handleBackToPlans = () => {
    setLocation('/clinic-portal/treatment-plans');
  };
  
  // Function to export a treatment plan as PDF
  const handleExportPdf = async (planId: string | number) => {
    setIsPdfExporting(true);
    
    try {
      const response = await apiRequest('GET', `/api/treatment-plans/${planId}/pdf`, null, {
        responseType: 'blob'
      });
      
      // Create a blob URL for the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and click it to download the PDF
      const a = document.createElement('a');
      a.href = url;
      a.download = `treatment-plan-${planId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'PDF exported',
        description: 'The treatment plan has been exported as a PDF.',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export the treatment plan as a PDF.',
        variant: 'destructive',
      });
    } finally {
      setIsPdfExporting(false);
    }
  };
  
  // Function to send a treatment plan to a patient
  const handleSendToPatient = async (planId: string | number) => {
    setIsSendingPlan(true);
    
    try {
      const response = await apiRequest('POST', `/api/treatment-plans/${planId}/send`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to send treatment plan');
      }
      
      toast({
        title: 'Treatment plan sent',
        description: 'The treatment plan has been sent to the patient.',
      });
    } catch (error) {
      console.error('Error sending treatment plan:', error);
      toast({
        title: 'Send failed',
        description: error instanceof Error ? error.message : 'Failed to send the treatment plan to the patient.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingPlan(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBackToPlans}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Treatment Plans
        </Button>
        
        {/* Action buttons for clinic staff */}
        {planId && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExportPdf(planId)}
              disabled={isPdfExporting}
            >
              {isPdfExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </>
              )}
            </Button>
            
            <Button
              onClick={() => handleSendToPatient(planId)}
              disabled={isSendingPlan}
            >
              {isSendingPlan ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Patient
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      
      {/* Display the treatment plan */}
      <ClinicTreatmentPlan
        planId={planId}
        showActions={true}
        showFullDetails={true}
        onExportPdf={handleExportPdf}
        onSendToPatient={handleSendToPatient}
      />
    </div>
  );
}