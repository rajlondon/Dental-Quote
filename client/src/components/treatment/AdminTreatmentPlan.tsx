/**
 * Admin Treatment Plan Component
 * 
 * Extends the base treatment plan component with admin-specific functionality
 */
import React, { useState } from 'react';
import { FileDown, Send, Clipboard, BarChart3, Users, Building } from 'lucide-react';
import { useLocation } from 'wouter';
import { BaseTreatmentPlan, BaseTreatmentPlanProps } from './BaseTreatmentPlan';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { TreatmentPlan } from '@shared/models/treatment-plan';

export interface AdminTreatmentPlanProps extends Omit<BaseTreatmentPlanProps, 'onExportPdf' | 'onSendToPatient' | 'onComplete' | 'onCancel'> {
  onExportData?: () => Promise<void>;
  onViewAnalytics?: () => void;
}

/**
 * Admin-specific treatment plan component
 */
export function AdminTreatmentPlan({
  planId,
  quoteId,
  packageId,
  specialOfferId,
  showActions = true,
  showFullDetails = false,
  readonly = false,
  onExportData,
  onViewAnalytics,
  className = '',
}: AdminTreatmentPlanProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [planData, setPlanData] = useState<TreatmentPlan | null>(null);
  const [clinics, setClinics] = useState<Array<{ id: string; name: string }>>([]);
  
  // Handle exporting the treatment plan as PDF
  const handleExportPdf = async (id: string) => {
    try {
      const response = await apiRequest('GET', `/api/v1/treatment-plans/${id}/pdf`, null, {
        responseType: 'blob' as any
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
  
  // Handle assigning the plan to a clinic
  const handleAssignToClinic = async () => {
    if (!planId || !selectedClinicId) return;
    
    setIsAssigning(true);
    
    try {
      const response = await apiRequest('PATCH', `/api/v1/treatment-plans/${planId}/assign-clinic`, {
        clinicId: selectedClinicId,
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to assign treatment plan to clinic');
      }
      
      toast({
        title: 'Clinic Assigned',
        description: 'The treatment plan has been assigned to the selected clinic.',
      });
      
      // Close the dialog and reset the selection
      setIsAssignDialogOpen(false);
      setSelectedClinicId('');
    } catch (error) {
      console.error('Error assigning clinic:', error);
      toast({
        title: 'Assignment Failed',
        description: error instanceof Error ? error.message : 'Failed to assign the treatment plan to the clinic.',
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };
  
  // Handle opening the assign dialog
  const handleOpenAssignDialog = async () => {
    if (!planId) return;
    
    try {
      // Fetch plan data if we don't have it yet
      if (!planData) {
        const planResponse = await apiRequest('GET', `/api/v1/treatment-plans/${planId}`);
        const planResult = await planResponse.json();
        
        if (!planResult.success || !planResult.data) {
          throw new Error(planResult.message || 'Failed to fetch treatment plan data');
        }
        
        setPlanData(planResult.data);
      }
      
      // Fetch available clinics
      const clinicsResponse = await apiRequest('GET', '/api/v1/clinics');
      const clinicsResult = await clinicsResponse.json();
      
      if (!clinicsResult.success || !clinicsResult.data) {
        throw new Error(clinicsResult.message || 'Failed to fetch available clinics');
      }
      
      setClinics(clinicsResult.data);
      setSelectedClinicId(planData?.clinicId || '');
      setIsAssignDialogOpen(true);
    } catch (error) {
      console.error('Error preparing assign dialog:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to prepare the clinic assignment dialog.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle viewing the plan statistics
  const handleViewStatistics = async () => {
    if (!planId) return;
    
    try {
      // Fetch plan data if we don't have it yet
      if (!planData) {
        const planResponse = await apiRequest('GET', `/api/v1/treatment-plans/${planId}`);
        const planResult = await planResponse.json();
        
        if (!planResult.success || !planResult.data) {
          throw new Error(planResult.message || 'Failed to fetch treatment plan data');
        }
        
        setPlanData(planResult.data);
      }
      
      setIsStatsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching plan statistics:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch treatment plan statistics.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle copying the plan ID to clipboard
  const handleCopyId = () => {
    if (!planId) return;
    
    navigator.clipboard.writeText(planId)
      .then(() => {
        toast({
          title: 'ID Copied',
          description: 'Treatment plan ID has been copied to clipboard.',
        });
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        toast({
          title: 'Copy Failed',
          description: 'Failed to copy treatment plan ID to clipboard.',
          variant: 'destructive',
        });
      });
  };
  
  // Render the base component with admin-specific props
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
          className={className}
        />
        
        {/* Admin-specific actions below the plan */}
        {showActions && planId && (
          <div className="flex flex-wrap justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleCopyId}
              className="flex items-center gap-2"
            >
              <Clipboard className="h-4 w-4" />
              Copy ID
            </Button>
            
            <Button
              variant="outline"
              onClick={handleOpenAssignDialog}
              className="flex items-center gap-2"
            >
              <Building className="h-4 w-4" />
              Assign to Clinic
            </Button>
            
            <Button
              variant="outline"
              onClick={handleViewStatistics}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              View Statistics
            </Button>
            
            <Button
              onClick={() => setLocation(`/admin-portal/treatment-plans/patient-view/${planId}`)}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              View as Patient
            </Button>
          </div>
        )}
        
        {/* For plan lists, include additional actions */}
        {!planId && onExportData && onViewAnalytics && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-xl">Treatment Plans Management</CardTitle>
              <CardDescription>
                Administrative tools for managing treatment plans across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={onExportData}
                  className="flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Export All Data
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onViewAnalytics}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Assign to clinic dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Treatment Plan to Clinic</DialogTitle>
            <DialogDescription>
              Select a clinic to handle this treatment plan. The clinic will be notified about this assignment.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignToClinic}
              disabled={isAssigning || !selectedClinicId}
            >
              {isAssigning ? 'Assigning...' : 'Assign Clinic'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Statistics dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Treatment Plan Statistics</DialogTitle>
            <DialogDescription>
              Detailed statistics for this treatment plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {planData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Creation & Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(planData.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{new Date(planData.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Status</span>
                      <span>{planData.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status</span>
                      <span>{planData.paymentStatus}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Treatments & Pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Treatments</span>
                      <span>{planData.treatments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Price</span>
                      <span>£{planData.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span>{planData.discountPercentage || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Final Price</span>
                      <span>£{planData.finalPrice.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Source Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source Type</span>
                      <span>{planData.sourceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source ID</span>
                      <span>{planData.sourceId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Patient ID</span>
                      <span>{planData.patientId || 'Not assigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clinic ID</span>
                      <span>{planData.clinicId || 'Not assigned'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading plan statistics...</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsStatsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}