/**
 * Base Treatment Plan Component
 * A reusable component for viewing and managing treatment plans
 * Used by all three portals (patient, clinic, admin) with role-based permissions
 */
import React, { useState, useEffect } from 'react';
import { useUnifiedTreatmentPlans } from '@/hooks/use-unified-treatment-plans';
import { useTreatmentMappings } from '@/hooks/use-treatment-mappings';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, FileEdit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { TreatmentPlan, TreatmentPlanStatus, TreatmentItem } from '@shared/models/treatment-plan';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/format-currency';
import { useTranslation } from 'react-i18next';

// Props for the base treatment plan component
interface BaseTreatmentPlanProps {
  // Identifiers
  quoteId?: string;
  planId?: string | number;
  
  // Display options
  title?: string;
  description?: string;
  showActions?: boolean;
  showFullDetails?: boolean;
  allowEditing?: boolean;
  allowDeleting?: boolean;
  allowCreating?: boolean;
  
  // Custom handlers (optional)
  onPlanCreated?: (plan: TreatmentPlan) => void;
  onPlanUpdated?: (plan: TreatmentPlan) => void;
  onPlanDeleted?: (planId: string | number) => void;
  
  // Custom renderers (optional)
  renderHeader?: () => React.ReactNode;
  renderStatusBadge?: (status: string) => React.ReactNode;
  renderActionMenu?: (plan: TreatmentPlan) => React.ReactNode;
  
  // Filtering and pagination
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  onPageChange?: (page: number) => void;
}

export function BaseTreatmentPlan({
  // Apply defaults to props
  quoteId,
  planId,
  title = 'Treatment Plan',
  description = 'View and manage your treatment plan',
  showActions = true,
  showFullDetails = true,
  allowEditing = true,
  allowDeleting = true,
  allowCreating = true,
  onPlanCreated,
  onPlanUpdated,
  onPlanDeleted,
  renderHeader,
  renderStatusBadge,
  renderActionMenu,
  page = 1,
  limit = 10,
  status,
  search,
  onPageChange
}: BaseTreatmentPlanProps) {
  // State for dialogs
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
  const [selectedTreatments, setSelectedTreatments] = useState<TreatmentItem[]>([]);
  
  // Hooks
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { categories: treatmentCategories, loading: loadingTreatments } = useTreatmentMappings();
  
  // Get treatment plan data from the unified hook
  const {
    treatmentPlans,
    isLoadingPlans,
    plansError,
    hasPermission,
    createTreatmentPlan,
    updateTreatmentPlan,
    deleteTreatmentPlan,
    addTreatmentToPlan,
    updateTreatmentInPlan,
    removeTreatmentFromPlan
  } = useUnifiedTreatmentPlans({
    quoteId,
    planId,
    page,
    limit,
    status,
    search
  });
  
  // Handle viewing a plan
  const handleViewPlan = (plan: TreatmentPlan) => {
    setSelectedPlan(plan);
    setIsViewDialogOpen(true);
  };
  
  // Handle editing a plan
  const handleEditPlan = (plan: TreatmentPlan) => {
    setSelectedPlan(plan);
    
    // If the plan has treatment details, set them in our state
    if (plan.treatmentDetails && Array.isArray(plan.treatmentDetails)) {
      setSelectedTreatments(plan.treatmentDetails as TreatmentItem[]);
    } else {
      setSelectedTreatments([]);
    }
    
    setIsEditDialogOpen(true);
  };
  
  // Handle deleting a plan
  const handleDeletePlan = (plan: TreatmentPlan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle confirming plan deletion
  const confirmDeletePlan = async () => {
    if (!selectedPlan) return;
    
    try {
      await deleteTreatmentPlan.mutateAsync(selectedPlan.id);
      
      // Call the custom handler if provided
      if (onPlanDeleted) {
        onPlanDeleted(selectedPlan.id);
      }
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete treatment plan:', error);
    }
  };
  
  // Render a status badge
  const getStatusBadge = (status: string) => {
    // If a custom renderer is provided, use it
    if (renderStatusBadge) {
      return renderStatusBadge(status);
    }
    
    // Default status badge rendering
    let variant = 'default';
    
    switch (status.toLowerCase()) {
      case TreatmentPlanStatus.DRAFT.toLowerCase():
        variant = 'outline';
        break;
      case TreatmentPlanStatus.SENT.toLowerCase():
        variant = 'secondary';
        break;
      case TreatmentPlanStatus.ACCEPTED.toLowerCase():
        variant = 'default';
        break;
      case TreatmentPlanStatus.IN_PROGRESS.toLowerCase():
        variant = 'primary';
        break;
      case TreatmentPlanStatus.COMPLETED.toLowerCase():
        variant = 'success';
        break;
      case TreatmentPlanStatus.CANCELLED.toLowerCase():
      case TreatmentPlanStatus.REJECTED.toLowerCase():
        variant = 'destructive';
        break;
      default:
        variant = 'outline';
    }
    
    return (
      <Badge variant={variant as any}>{status}</Badge>
    );
  };
  
  // Render action menu for a plan
  const getActionMenu = (plan: TreatmentPlan) => {
    // If a custom renderer is provided, use it
    if (renderActionMenu) {
      return renderActionMenu(plan);
    }
    
    // Default action menu rendering
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {hasPermission('view') && (
            <DropdownMenuItem onClick={() => handleViewPlan(plan)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          )}
          
          {hasPermission('update') && allowEditing && (
            <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
              <FileEdit className="mr-2 h-4 w-4" />
              Edit Plan
            </DropdownMenuItem>
          )}
          
          {hasPermission('delete') && allowDeleting && (
            <DropdownMenuItem 
              onClick={() => handleDeletePlan(plan)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Plan
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Calculate total cost for a plan
  const calculateTotalCost = (plan: TreatmentPlan): number => {
    if (!plan.treatmentDetails || !Array.isArray(plan.treatmentDetails)) {
      return 0;
    }
    
    return plan.treatmentDetails.reduce((total, treatment: any) => {
      const price = treatment.price || 0;
      const quantity = treatment.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };
  
  // Render error state
  if (plansError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load treatment plans. {plansError instanceof Error ? plansError.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Render loading state
  if (isLoadingPlans) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Determine what we're displaying
  const isSinglePlan = !!planId;
  const plansData = isSinglePlan 
    ? (treatmentPlans ? [treatmentPlans] : []) 
    : (Array.isArray(treatmentPlans?.treatmentPlans) ? treatmentPlans.treatmentPlans : []);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      {renderHeader ? (
        renderHeader()
      ) : (
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      )}
      
      {/* Create button */}
      {hasPermission('create') && allowCreating && (
        <div className="flex justify-end">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Treatment Plan
          </Button>
        </div>
      )}
      
      {/* Plans list or single plan view */}
      {plansData.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground">No treatment plans found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {plansData.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle>{plan.patientName || 'Treatment Plan'}</CardTitle>
                {showActions && getActionMenu(plan)}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Plan metadata */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="font-medium">Status:</span>{' '}
                      {getStatusBadge(plan.status)}
                    </div>
                    {plan.clinicName && (
                      <div>
                        <span className="font-medium">Clinic:</span>{' '}
                        {plan.clinicName}
                      </div>
                    )}
                    {plan.createdAt && (
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {/* Treatment details */}
                  {showFullDetails && plan.treatmentDetails && Array.isArray(plan.treatmentDetails) && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Treatment Details</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Treatment</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plan.treatmentDetails.map((treatment: any, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {treatment.name || treatment.description || 'Treatment'}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(treatment.price || 0, plan.currency || 'GBP')}
                              </TableCell>
                              <TableCell className="text-center">
                                {treatment.quantity || 1}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(
                                  (treatment.price || 0) * (treatment.quantity || 1),
                                  plan.currency || 'GBP'
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">
                              Total:
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(calculateTotalCost(plan), plan.currency || 'GBP')}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  {/* Notes */}
                  {plan.notes && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Notes</h3>
                      <p className="text-sm">{plan.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Treatment Plan Details
            </DialogTitle>
            <DialogDescription>
              View the details of this treatment plan
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-4">
              {/* Plan metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Patient:</span>{' '}
                  {selectedPlan.patientName || 'Unknown Patient'}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  {getStatusBadge(selectedPlan.status)}
                </div>
                {selectedPlan.clinicName && (
                  <div>
                    <span className="font-medium">Clinic:</span>{' '}
                    {selectedPlan.clinicName}
                  </div>
                )}
                {selectedPlan.createdAt && (
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(selectedPlan.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              {/* Treatment details */}
              {selectedPlan.treatmentDetails && Array.isArray(selectedPlan.treatmentDetails) && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Treatment Details</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Treatment</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPlan.treatmentDetails.map((treatment: any, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {treatment.name || treatment.description || 'Treatment'}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(treatment.price || 0, selectedPlan.currency || 'GBP')}
                          </TableCell>
                          <TableCell className="text-center">
                            {treatment.quantity || 1}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              (treatment.price || 0) * (treatment.quantity || 1),
                              selectedPlan.currency || 'GBP'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">
                          Total:
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(calculateTotalCost(selectedPlan), selectedPlan.currency || 'GBP')}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Notes */}
              {selectedPlan.notes && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Notes</h3>
                  <p className="text-sm">{selectedPlan.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            
            {hasPermission('update') && allowEditing && selectedPlan && (
              <Button 
                onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEditPlan(selectedPlan);
                }}
              >
                Edit Plan
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Treatment Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this treatment plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeletePlan}
              disabled={deleteTreatmentPlan.isPending}
            >
              {deleteTreatmentPlan.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Plan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}