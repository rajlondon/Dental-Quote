/**
 * Clinic Treatment Plan Component
 * 
 * Extends the base treatment plan component with clinic-specific functionality
 */
import React, { useState } from 'react';
import { Send, FileDown, Calendar, MessageSquare } from 'lucide-react';
import { BaseTreatmentPlan, BaseTreatmentPlanProps } from './BaseTreatmentPlan';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export interface ClinicTreatmentPlanProps extends Omit<BaseTreatmentPlanProps, 'onExportPdf' | 'onSendToPatient' | 'onComplete' | 'onCancel'> {
  onMessagePatient?: (planId: string) => void;
  onScheduleAppointment?: (planId: string) => void;
}

/**
 * Clinic-specific treatment plan component
 */
export function ClinicTreatmentPlan({
  planId,
  quoteId,
  packageId,
  specialOfferId,
  showActions = true,
  showFullDetails = false,
  readonly = false,
  onMessagePatient,
  onScheduleAppointment,
  className = '',
}: ClinicTreatmentPlanProps) {
  const { toast } = useToast();
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [sendMessage, setSendMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
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
        title: 'PDF Exported',
        description: 'The treatment plan has been exported as a PDF.',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export the treatment plan as a PDF.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle sending the treatment plan to the patient
  const handleSendToPatient = async (id: string) => {
    setIsSendDialogOpen(true);
  };
  
  // Handle submitting the send dialog
  const handleSendDialogSubmit = async () => {
    if (!planId) return;
    
    setIsSending(true);
    
    try {
      const response = await apiRequest('POST', `/api/v1/treatment-plans/${planId}/send`, {
        message: sendMessage || undefined,
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to send treatment plan');
      }
      
      toast({
        title: 'Treatment Plan Sent',
        description: 'The treatment plan has been sent to the patient.',
      });
      
      // Close the dialog and reset the message
      setIsSendDialogOpen(false);
      setSendMessage('');
    } catch (error) {
      console.error('Error sending treatment plan:', error);
      toast({
        title: 'Send Failed',
        description: error instanceof Error ? error.message : 'Failed to send the treatment plan.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };
  
  // Render the base component with clinic-specific props
  return (
    <>
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
          onSendToPatient={handleSendToPatient}
          className={className}
        />
        
        {/* Clinic-specific actions below the plan */}
        {showActions && planId && (
          <div className="flex flex-wrap justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => onMessagePatient && onMessagePatient(planId)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Message Patient
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onScheduleAppointment && onScheduleAppointment(planId)}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Schedule Appointment
            </Button>
            
            <Button
              onClick={() => handleSendToPatient(planId)}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send to Patient
            </Button>
          </div>
        )}
      </div>
      
      {/* Send dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Treatment Plan to Patient</DialogTitle>
            <DialogDescription>
              The patient will receive a notification and an email with a link to view the treatment plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <Label htmlFor="send-message">Optional Message</Label>
              <Textarea
                id="send-message"
                value={sendMessage}
                onChange={(e) => setSendMessage(e.target.value)}
                placeholder="Add a personalized message to the patient..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSendDialogOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendDialogSubmit}
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Send Treatment Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}