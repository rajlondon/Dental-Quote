/**
 * Base Treatment Plan Component
 * 
 * This component serves as the foundation for all treatment plan views
 * across the patient, clinic, and admin portals.
 */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import {
  PlusIcon,
  Save,
  Loader2,
  Trash2,
  Check,
  X,
  FileEdit,
  PencilIcon,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedTreatmentPlans } from '@/hooks/use-unified-treatment-plans';
import {
  TreatmentPlan,
  TreatmentItem,
  TreatmentPlanStatus,
  PaymentStatus,
} from '@shared/models/treatment-plan';
import { formatCurrency } from '@/utils/format-currency';

// Treatment plan status colors
const statusColors = {
  [TreatmentPlanStatus.DRAFT]: 'bg-gray-200 text-gray-700',
  [TreatmentPlanStatus.PROPOSED]: 'bg-blue-100 text-blue-700',
  [TreatmentPlanStatus.ACCEPTED]: 'bg-green-100 text-green-700',
  [TreatmentPlanStatus.REJECTED]: 'bg-red-100 text-red-700',
  [TreatmentPlanStatus.IN_PROGRESS]: 'bg-amber-100 text-amber-700',
  [TreatmentPlanStatus.COMPLETED]: 'bg-indigo-100 text-indigo-700',
  [TreatmentPlanStatus.CANCELLED]: 'bg-gray-100 text-gray-700',
};

// Payment status colors
const paymentColors = {
  [PaymentStatus.UNPAID]: 'bg-gray-100 text-gray-700',
  [PaymentStatus.PARTIAL]: 'bg-amber-100 text-amber-700',
  [PaymentStatus.DEPOSIT_PAID]: 'bg-blue-100 text-blue-700',
  [PaymentStatus.PAID]: 'bg-green-100 text-green-700',
  [PaymentStatus.REFUNDED]: 'bg-red-100 text-red-700',
};

// Props for the base treatment plan component
export interface BaseTreatmentPlanProps {
  planId?: string;
  quoteId?: string;
  packageId?: string;
  specialOfferId?: string;
  showActions?: boolean;
  showFullDetails?: boolean;
  readonly?: boolean;
  onExportPdf?: (id: string) => Promise<void>;
  onSendToPatient?: (id: string) => Promise<void>;
  onComplete?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  className?: string;
}

/**
 * Base component for displaying and editing treatment plans
 */
export function BaseTreatmentPlan({
  planId,
  quoteId,
  packageId,
  specialOfferId,
  showActions = true,
  showFullDetails = false,
  readonly = false,
  onExportPdf,
  onSendToPatient,
  onComplete,
  onCancel,
  className = '',
}: BaseTreatmentPlanProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [focusedTreatmentId, setFocusedTreatmentId] = useState<string | null>(null);
  const [newTreatment, setNewTreatment] = useState<Partial<TreatmentItem>>({
    name: '',
    price: 0,
    quantity: 1,
  });
  const [editedPlan, setEditedPlan] = useState<Partial<TreatmentPlan>>({});
  
  // Get treatment plan data and utilities from our hook
  const {
    useTreatmentPlan,
    createTreatmentPlan,
    updateTreatmentPlan,
    deleteTreatmentPlan,
    changeTreatmentPlanStatus,
    convertQuoteToTreatmentPlan,
    convertPackageToTreatmentPlan,
    convertSpecialOfferToTreatmentPlan,
    getTreatmentPlanTotalPrice,
    calculateFinalPrice,
    userRole,
    canEdit,
    canDelete,
    canChangeStatus,
  } = useUnifiedTreatmentPlans();
  
  // If we have a planId, fetch the treatment plan directly
  const {
    data: planData,
    isLoading: isPlanLoading,
    error: planError,
  } = useTreatmentPlan(planId);
  
  // Initialize plan from fetched data
  useEffect(() => {
    if (planData) {
      setEditedPlan({
        ...planData,
        treatments: [...planData.treatments],
      });
    }
  }, [planData]);
  
  // Handle conversion from quote, package, or special offer if needed
  useEffect(() => {
    const convertIfNeeded = async () => {
      try {
        if (quoteId && !planId) {
          // Convert quote to treatment plan
          const { data } = await convertQuoteToTreatmentPlan.mutateAsync({
            quoteId,
            options: {
              includeAttachments: true,
              preserveNotes: true
            }
          });
          
          if (data?.id) {
            setLocation(`/portal/treatment-plan/${data.id}`);
          }
        } else if (packageId && !planId) {
          // Convert package to treatment plan
          const { data } = await convertPackageToTreatmentPlan.mutateAsync({
            packageId,
            options: {
              autoAssignClinic: true
            }
          });
          
          if (data?.id) {
            setLocation(`/portal/treatment-plan/${data.id}`);
          }
        } else if (specialOfferId && !planId) {
          // Convert special offer to treatment plan
          const { data } = await convertSpecialOfferToTreatmentPlan.mutateAsync({
            offerId: specialOfferId,
            options: {
              autoAssignClinic: true
            }
          });
          
          if (data?.id) {
            setLocation(`/portal/treatment-plan/${data.id}`);
          }
        }
      } catch (error) {
        console.error('Error converting to treatment plan:', error);
      }
    };
    
    if ((quoteId || packageId || specialOfferId) && !planId) {
      convertIfNeeded();
    }
  }, [quoteId, packageId, specialOfferId, planId]);
  
  // Handler for starting edit mode
  const handleEdit = () => {
    if (!planData || !canEdit(planData)) return;
    
    setIsEditing(true);
    setEditedPlan({
      ...planData,
      treatments: [...planData.treatments],
    });
  };
  
  // Handler for canceling edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (planData) {
      setEditedPlan({
        ...planData,
        treatments: [...planData.treatments],
      });
    }
  };
  
  // Handler for saving changes
  const handleSave = async () => {
    if (!planData || !editedPlan || !canEdit(planData)) return;
    
    try {
      await updateTreatmentPlan.mutateAsync({
        id: planData.id,
        ...editedPlan,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving treatment plan:', error);
    }
  };
  
  // Handler for adding a new treatment
  const handleAddTreatment = () => {
    if (!editedPlan.treatments) return;
    
    const treatmentToAdd: TreatmentItem = {
      id: `temp-${Date.now()}`, // Temporary ID that will be replaced by the server
      name: newTreatment.name || 'New Treatment',
      description: newTreatment.description || '',
      price: newTreatment.price || 0,
      quantity: newTreatment.quantity || 1,
      categoryId: newTreatment.categoryId,
      categoryName: newTreatment.categoryName,
      notes: newTreatment.notes || '',
    };
    
    setEditedPlan({
      ...editedPlan,
      treatments: [...editedPlan.treatments, treatmentToAdd],
    });
    
    // Reset the new treatment form
    setNewTreatment({
      name: '',
      price: 0,
      quantity: 1,
    });
  };
  
  // Handler for removing a treatment
  const handleRemoveTreatment = (id: string) => {
    if (!editedPlan.treatments) return;
    
    setEditedPlan({
      ...editedPlan,
      treatments: editedPlan.treatments.filter(t => t.id !== id),
    });
  };
  
  // Handler for changing treatment details
  const handleChangeTreatment = (id: string, field: keyof TreatmentItem, value: any) => {
    if (!editedPlan.treatments) return;
    
    const updatedTreatments = editedPlan.treatments.map(t => {
      if (t.id === id) {
        return { ...t, [field]: value };
      }
      return t;
    });
    
    setEditedPlan({
      ...editedPlan,
      treatments: updatedTreatments,
    });
  };
  
  // Handler for deleting the plan
  const handleDelete = async () => {
    if (!planData || !canDelete(planData)) return;
    
    if (confirm('Are you sure you want to delete this treatment plan? This action cannot be undone.')) {
      try {
        await deleteTreatmentPlan.mutateAsync(planData.id);
        setLocation(userRole === 'patient' ? '/patient-portal' : (userRole === 'clinic' ? '/clinic-portal' : '/admin-portal'));
      } catch (error) {
        console.error('Error deleting treatment plan:', error);
      }
    }
  };
  
  // Handler for changing plan status
  const handleChangeStatus = async (status: TreatmentPlanStatus) => {
    if (!planData || !canChangeStatus(planData)) return;
    
    try {
      await changeTreatmentPlanStatus.mutateAsync({ id: planData.id, status });
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };
  
  // Calculate the total and final prices
  const calculatePrices = () => {
    if (!editedPlan.treatments) return { totalPrice: 0, finalPrice: 0 };
    
    const totalPrice = getTreatmentPlanTotalPrice(editedPlan.treatments);
    const finalPrice = calculateFinalPrice(totalPrice, editedPlan.discountPercentage);
    
    return { totalPrice, finalPrice };
  };
  
  // If we're still loading, show a spinner
  if (isPlanLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If there was an error loading the plan, show an error message
  if (planError && planId) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Treatment Plan</h3>
            <p className="text-muted-foreground mb-4">
              {planError instanceof Error ? planError.message : 'Failed to load the treatment plan.'}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If we don't have plan data yet and no IDs were provided, show placeholder
  if (!planData && !planId && !quoteId && !packageId && !specialOfferId) {
    return (
      <Card className={`shadow-md ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No Treatment Plan Selected</h3>
            <p className="text-muted-foreground mb-4">
              Please select a treatment plan to view or provide a quote, package, or special offer ID to convert.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate prices for display
  const { totalPrice, finalPrice } = calculatePrices();
  
  return (
    <Card className={`shadow-md ${className}`}>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">
              {isEditing ? (
                <Input
                  value={editedPlan.title || ''}
                  onChange={(e) => setEditedPlan({ ...editedPlan, title: e.target.value })}
                  className="text-2xl font-bold h-auto py-1"
                />
              ) : (
                planData?.title || 'Treatment Plan'
              )}
            </CardTitle>
            
            <CardDescription className="mt-1">
              {planData?.createdAt && (
                <span className="block text-sm text-muted-foreground">
                  Created: {format(new Date(planData.createdAt), 'PPP')}
                </span>
              )}
              
              {planData?.updatedAt && planData.updatedAt !== planData.createdAt && (
                <span className="block text-sm text-muted-foreground">
                  Last updated: {format(new Date(planData.updatedAt), 'PPP')}
                </span>
              )}
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {planData?.status && (
              <Badge className={statusColors[planData.status] || 'bg-gray-100'}>
                {planData.status.replace(/_/g, ' ')}
              </Badge>
            )}
            
            {planData?.paymentStatus && (
              <Badge className={paymentColors[planData.paymentStatus] || 'bg-gray-100'}>
                {planData.paymentStatus.replace(/_/g, ' ')}
              </Badge>
            )}
            
            {planData?.sourceType && (
              <Badge variant="outline" className="bg-white">
                {planData.sourceType === 'QUOTE' ? 'From Quote' :
                 planData.sourceType === 'PACKAGE' ? 'From Package' :
                 planData.sourceType === 'SPECIAL_OFFER' ? 'Special Offer' : 'Custom'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Description */}
        {(showFullDetails || isEditing) && (
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            {isEditing ? (
              <Textarea
                id="description"
                value={editedPlan.description || ''}
                onChange={(e) => setEditedPlan({ ...editedPlan, description: e.target.value })}
                placeholder="Enter plan description..."
                className="min-h-[100px]"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {planData?.description || 'No description provided.'}
              </p>
            )}
          </div>
        )}
        
        {/* Treatments */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Treatments</h3>
            {isEditing && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFocusedTreatmentId(null)}
                className="flex items-center gap-1"
              >
                <PlusIcon className="h-4 w-4" /> Add Treatment
              </Button>
            )}
          </div>
          
          {/* New treatment form */}
          {isEditing && focusedTreatmentId === null && (
            <Card className="border border-dashed border-primary/50">
              <CardContent className="pt-6 pb-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-treatment-name">Treatment Name</Label>
                    <Input
                      id="new-treatment-name"
                      value={newTreatment.name || ''}
                      onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
                      placeholder="Enter treatment name..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-treatment-price">Price</Label>
                      <Input
                        id="new-treatment-price"
                        type="number"
                        value={newTreatment.price || ''}
                        onChange={(e) => setNewTreatment({ ...newTreatment, price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-treatment-quantity">Quantity</Label>
                      <Input
                        id="new-treatment-quantity"
                        type="number"
                        value={newTreatment.quantity || ''}
                        onChange={(e) => setNewTreatment({ ...newTreatment, quantity: parseInt(e.target.value) || 1 })}
                        placeholder="1"
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-treatment-description">Description</Label>
                    <Textarea
                      id="new-treatment-description"
                      value={newTreatment.description || ''}
                      onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                      placeholder="Enter treatment description..."
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFocusedTreatmentId(undefined)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddTreatment}
                      disabled={!newTreatment.name}
                    >
                      Add Treatment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Treatment list */}
          <div className="space-y-3">
            {editedPlan.treatments?.map((treatment) => (
              <Card key={treatment.id} className={`border ${focusedTreatmentId === treatment.id ? 'border-primary' : ''}`}>
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      {isEditing && focusedTreatmentId === treatment.id ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`treatment-name-${treatment.id}`}>Name</Label>
                            <Input
                              id={`treatment-name-${treatment.id}`}
                              value={treatment.name}
                              onChange={(e) => handleChangeTreatment(treatment.id, 'name', e.target.value)}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`treatment-price-${treatment.id}`}>Price</Label>
                              <Input
                                id={`treatment-price-${treatment.id}`}
                                type="number"
                                value={treatment.price}
                                onChange={(e) => handleChangeTreatment(treatment.id, 'price', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`treatment-quantity-${treatment.id}`}>Quantity</Label>
                              <Input
                                id={`treatment-quantity-${treatment.id}`}
                                type="number"
                                value={treatment.quantity}
                                onChange={(e) => handleChangeTreatment(treatment.id, 'quantity', parseInt(e.target.value) || 1)}
                                min="1"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`treatment-description-${treatment.id}`}>Description</Label>
                            <Textarea
                              id={`treatment-description-${treatment.id}`}
                              value={treatment.description || ''}
                              onChange={(e) => handleChangeTreatment(treatment.id, 'description', e.target.value)}
                              placeholder="No description"
                            />
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFocusedTreatmentId(undefined)}
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{treatment.name}</h4>
                            {isEditing && (
                              <div className="flex gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setFocusedTreatmentId(treatment.id)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleRemoveTreatment(treatment.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {treatment.description && (
                            <p className="text-sm text-muted-foreground mt-1">{treatment.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm">
                              Quantity: {treatment.quantity}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(treatment.price)} × {treatment.quantity} = {formatCurrency(treatment.price * treatment.quantity)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {(!editedPlan.treatments || editedPlan.treatments.length === 0) && (
              <div className="text-center py-4 border border-dashed rounded-md">
                <p className="text-muted-foreground">No treatments added yet.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Pricing summary */}
        <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
          <h3 className="font-semibold">Pricing Summary</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor="discount-percentage">Discount (%)</Label>
                <Input
                  id="discount-percentage"
                  type="number"
                  value={editedPlan.discountPercentage || ''}
                  onChange={(e) => setEditedPlan({ ...editedPlan, discountPercentage: parseFloat(e.target.value) || 0 })}
                  className="max-w-[100px] justify-self-end"
                  min="0"
                  max="100"
                />
              </div>
            ) : (
              editedPlan.discountPercentage && editedPlan.discountPercentage > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({editedPlan.discountPercentage}%)</span>
                  <span>-{formatCurrency(totalPrice * (editedPlan.discountPercentage / 100))}</span>
                </div>
              )
            )}
            
            <Separator />
            
            <div className="flex justify-between font-semibold">
              <span>Final Price</span>
              <span>{formatCurrency(finalPrice)}</span>
            </div>
          </div>
        </div>
        
        {/* Notes sections (only in full detail view) */}
        {showFullDetails && (
          <div className="space-y-4">
            {/* Client notes */}
            {(userRole === 'patient' || userRole === 'admin' || (planData?.clientNotes && userRole === 'clinic')) && (
              <div className="space-y-2">
                <Label htmlFor="client-notes">Patient Notes</Label>
                {isEditing && userRole !== 'clinic' ? (
                  <Textarea
                    id="client-notes"
                    value={editedPlan.clientNotes || ''}
                    onChange={(e) => setEditedPlan({ ...editedPlan, clientNotes: e.target.value })}
                    placeholder="Notes for the patient..."
                  />
                ) : (
                  <div className="text-sm p-3 border rounded-md bg-muted/10 min-h-[80px]">
                    {planData?.clientNotes || 'No patient notes.'}
                  </div>
                )}
              </div>
            )}
            
            {/* Clinic notes */}
            {(userRole === 'clinic' || userRole === 'admin' || (planData?.clinicNotes && userRole === 'patient')) && (
              <div className="space-y-2">
                <Label htmlFor="clinic-notes">Clinic Notes</Label>
                {isEditing && userRole !== 'patient' ? (
                  <Textarea
                    id="clinic-notes"
                    value={editedPlan.clinicNotes || ''}
                    onChange={(e) => setEditedPlan({ ...editedPlan, clinicNotes: e.target.value })}
                    placeholder="Notes for the clinic..."
                  />
                ) : (
                  <div className="text-sm p-3 border rounded-md bg-muted/10 min-h-[80px]">
                    {planData?.clinicNotes || 'No clinic notes.'}
                  </div>
                )}
              </div>
            )}
            
            {/* Admin notes (only visible to admins) */}
            {userRole === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="admin-notes">Admin Notes</Label>
                {isEditing ? (
                  <Textarea
                    id="admin-notes"
                    value={editedPlan.adminNotes || ''}
                    onChange={(e) => setEditedPlan({ ...editedPlan, adminNotes: e.target.value })}
                    placeholder="Notes for administrators only..."
                  />
                ) : (
                  <div className="text-sm p-3 border rounded-md bg-muted/10 min-h-[80px]">
                    {planData?.adminNotes || 'No admin notes.'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex-col sm:flex-row gap-2 justify-between items-center border-t p-4">
          {isEditing ? (
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateTreatmentPlan.isPending}>
                {updateTreatmentPlan.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                {canEdit(planData) && (
                  <Button variant="outline" onClick={handleEdit}>
                    <FileEdit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
                
                {canDelete(planData) && (
                  <Button variant="outline" onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
                
                {/* Action buttons that vary by role */}
                {onExportPdf && (
                  <Button variant="outline" onClick={() => planData && onExportPdf(planData.id)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                {/* Status change buttons */}
                {canChangeStatus(planData) && (
                  <>
                    {planData?.status === TreatmentPlanStatus.PROPOSED && userRole === 'patient' && (
                      <>
                        <Button
                          variant="outline"
                          className="text-destructive"
                          onClick={() => handleChangeStatus(TreatmentPlanStatus.REJECTED)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Decline
                        </Button>
                        <Button
                          onClick={() => handleChangeStatus(TreatmentPlanStatus.ACCEPTED)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                      </>
                    )}
                    
                    {planData?.status === TreatmentPlanStatus.DRAFT && userRole === 'clinic' && (
                      <Button
                        onClick={() => handleChangeStatus(TreatmentPlanStatus.PROPOSED)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Propose to Patient
                      </Button>
                    )}
                    
                    {userRole === 'admin' && (
                      <Select
                        value={planData?.status}
                        onValueChange={(value) => handleChangeStatus(value as TreatmentPlanStatus)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Change status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TreatmentPlanStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}