import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tag,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Clipboard,
  FileText,
  Calendar,
  Info,
  ShieldAlert,
  ShieldCheck,
  Star,
  ExternalLink
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface PromotionReviewProps {
  promotionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproveReject?: () => void;
}

export default function PromotionReview({
  promotionId,
  open,
  onOpenChange,
  onApproveReject
}: PromotionReviewProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Fetch promotion details
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/promotions', promotionId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/promotions/${promotionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch promotion details');
      }
      return response.json();
    },
    enabled: open,
  });
  
  const promotion = data?.promotion;
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };
  
  // Approve promotion
  const handleApprove = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', `/api/admin/promotions/${promotionId}/approve`, {
        notes: approvalNotes,
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve promotion');
      }
      
      toast({
        title: 'Promotion Approved',
        description: 'The promotion has been approved successfully and is now active.',
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
      
      // Call the callback function if provided
      if (onApproveReject) {
        onApproveReject();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve promotion. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reject promotion
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', `/api/admin/promotions/${promotionId}/reject`, {
        reason: rejectionReason,
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject promotion');
      }
      
      toast({
        title: 'Promotion Rejected',
        description: 'The promotion has been rejected.',
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
      
      // Call the callback function if provided
      if (onApproveReject) {
        onApproveReject();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject promotion. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render promotion type badge
  const renderPromotionTypeBadge = (type: string) => {
    return (
      <Badge variant="outline" className="font-medium">
        {type === 'discount' ? (
          <>
            <Tag className="h-3.5 w-3.5 mr-1" />
            Discount Promotion
          </>
        ) : (
          <>
            <Package className="h-3.5 w-3.5 mr-1" />
            Package Promotion
          </>
        )}
      </Badge>
    );
  };
  
  // Render promotion status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            Pending Review
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Approved
          </Badge>
        );
      case 'ACTIVE':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Active
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <Skeleton className="h-6 w-48" />
            </DialogTitle>
            <DialogDescription>
              <Skeleton className="h-4 w-64 mt-1" />
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
          
          <DialogFooter className="gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center">
              <ShieldAlert className="h-5 w-5 mr-2" />
              Error Loading Promotion
            </DialogTitle>
            <DialogDescription>
              There was a problem loading the promotion details. Please try again later.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  if (!promotion) {
    return null;
  }
  
  // Conditionally render approval/rejection buttons based on promotion status
  const renderActionButtons = () => {
    if (promotion.status === 'PENDING_APPROVAL') {
      return (
        <>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReject}
            disabled={isSubmitting}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </>
      );
    } else {
      return (
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Promotion Review</DialogTitle>
            <div className="flex items-center gap-2">
              {renderPromotionTypeBadge(promotion.type)}
              {renderStatusBadge(promotion.status)}
            </div>
          </div>
          <DialogDescription>
            Review the promotion details and take appropriate action
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="approval">
              {promotion.status === 'PENDING_APPROVAL' ? 'Approval' : 'Decision'}
            </TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">{promotion.title}</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Promotion Code</Label>
                    <div className="font-mono font-medium border px-2 py-1 rounded bg-slate-50 mt-1">
                      {promotion.code}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Clinic</Label>
                    <div className="font-medium mt-1 flex items-center">
                      <img 
                        src={`/api/clinics/${promotion.clinic_id}/logo`} 
                        alt="Clinic logo"
                        className="w-5 h-5 rounded-full mr-2"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-clinic-logo.png';
                        }}
                      />
                      {promotion.clinic_name || 'Unknown Clinic'}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Promotion Period</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <div className="text-xs text-muted-foreground">Start Date</div>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {formatDate(promotion.start_date)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">End Date</div>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {formatDate(promotion.end_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {promotion.type === 'discount' && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Discount Information</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {promotion.discountType === 'percentage' 
                            ? `${promotion.discountValue}% OFF` 
                            : `£${promotion.discountValue} OFF`}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  {promotion.type === 'package' && promotion.packageData && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Package Information</Label>
                      <div className="mt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Original Price:</span>
                          <span className="font-medium line-through text-muted-foreground">£{promotion.packageData.originalPrice}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Package Price:</span>
                          <span className="font-medium text-green-600">£{promotion.packageData.packagePrice}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Submission Information</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Submitted By</div>
                        <div>{promotion.submitted_by || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Submitted On</div>
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {formatDate(promotion.submitted_at || promotion.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <div className="border rounded-md p-3 mt-1 bg-slate-50 min-h-[100px]">
                    {promotion.description || 'No description provided.'}
                  </div>
                </div>
                
                {promotion.type === 'package' && promotion.packageData && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Included Treatments</Label>
                    <div className="border rounded-md p-3 mt-1 bg-slate-50">
                      {promotion.packageData.treatments && promotion.packageData.treatments.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {promotion.packageData.treatments.map((treatment: any, index: number) => (
                            <li key={index}>{treatment.name} {treatment.count && `x${treatment.count}`}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-sm">No treatments specified</p>
                      )}
                    </div>
                  </div>
                )}
                
                {promotion.type === 'package' && promotion.packageData && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Additional Benefits</Label>
                    <div className="border rounded-md p-3 mt-1 bg-slate-50">
                      {promotion.packageData.benefits && promotion.packageData.benefits.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {promotion.packageData.benefits.map((benefit: any, index: number) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground text-sm">No additional benefits specified</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Terms & Conditions</Label>
                  <div className="border rounded-md p-3 mt-1 bg-slate-50 min-h-[80px] text-sm">
                    {promotion.terms_conditions || 'No terms and conditions provided.'}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Approval Tab */}
          <TabsContent value="approval" className="space-y-4">
            {promotion.status === 'PENDING_APPROVAL' ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                    <div>
                      <h4 className="font-medium text-blue-800">Review Guidelines</h4>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-blue-700">
                        <li>Ensure the promotion adheres to platform guidelines</li>
                        <li>Verify that discount values and package prices are reasonable</li>
                        <li>Check for accurate and clear description of services</li>
                        <li>Confirm terms and conditions are properly specified</li>
                        <li>Make sure the promotion period is appropriate</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Approve This Promotion</h3>
                    <Textarea 
                      placeholder="Add any approval notes or special instructions (optional)"
                      className="min-h-[120px]"
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                    />
                    <Button 
                      className="mt-2 w-full" 
                      onClick={handleApprove}
                      disabled={isSubmitting}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve Promotion
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Reject This Promotion</h3>
                    <Textarea 
                      placeholder="Provide a reason for rejection (required)"
                      className="min-h-[120px]"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <Button 
                      variant="destructive" 
                      className="mt-2 w-full"
                      onClick={handleReject}
                      disabled={isSubmitting}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Promotion
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className={`border rounded-md p-4 ${
                  promotion.status === 'APPROVED' || promotion.status === 'ACTIVE' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start">
                    {promotion.status === 'APPROVED' || promotion.status === 'ACTIVE' ? (
                      <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    )}
                    
                    <div>
                      <h4 className={`font-medium ${
                        promotion.status === 'APPROVED' || promotion.status === 'ACTIVE'
                          ? 'text-green-800'
                          : 'text-red-800'
                      }`}>
                        {promotion.status === 'APPROVED' || promotion.status === 'ACTIVE'
                          ? 'Promotion Approved'
                          : 'Promotion Rejected'
                        }
                      </h4>
                      <p className={`text-sm mt-1 ${
                        promotion.status === 'APPROVED' || promotion.status === 'ACTIVE'
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}>
                        {promotion.status === 'APPROVED' || promotion.status === 'ACTIVE'
                          ? `This promotion was approved ${promotion.approved_at ? `on ${formatDate(promotion.approved_at)}` : ''}`
                          : `This promotion was rejected ${promotion.rejected_at ? `on ${formatDate(promotion.rejected_at)}` : ''}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                {(promotion.status === 'APPROVED' || promotion.status === 'ACTIVE') && promotion.approval_notes && (
                  <div>
                    <h3 className="font-medium mb-2">Approval Notes</h3>
                    <div className="border rounded-md p-3 bg-slate-50 min-h-[80px]">
                      {promotion.approval_notes}
                    </div>
                  </div>
                )}
                
                {promotion.status === 'REJECTED' && promotion.rejection_reason && (
                  <div>
                    <h3 className="font-medium mb-2">Rejection Reason</h3>
                    <div className="border rounded-md p-3 bg-slate-50 min-h-[80px]">
                      {promotion.rejection_reason}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium mb-2">Decision Made By</h3>
                  <div className="flex items-center">
                    <div className="bg-slate-100 rounded-full p-1.5 mr-2">
                      <FileText className="h-4 w-4 text-slate-600" />
                    </div>
                    <span>
                      {promotion.status === 'APPROVED' || promotion.status === 'ACTIVE'
                        ? promotion.approved_by || 'Admin'
                        : promotion.rejected_by || 'Admin'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <div className="border rounded-md p-4 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{promotion.title}</h3>
                  {promotion.type === 'discount' ? (
                    <Badge className="bg-primary/10 text-primary border-none font-medium">
                      {promotion.discountType === 'percentage' 
                        ? `${promotion.discountValue}% OFF` 
                        : `£${promotion.discountValue} OFF`}
                    </Badge>
                  ) : promotion.packageData && (
                    <div className="text-right">
                      <div className="text-sm line-through text-muted-foreground">
                        £{promotion.packageData.originalPrice}
                      </div>
                      <div className="text-lg font-bold text-primary">
                        £{promotion.packageData.packagePrice}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <img 
                    src={`/api/clinics/${promotion.clinic_id}/logo`} 
                    alt="Clinic logo"
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-clinic-logo.png';
                    }}
                  />
                  <span>{promotion.clinic_name || 'Partner Clinic'}</span>
                  <span className="mx-1">•</span>
                  <div className="flex items-center">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 mr-1" />
                    <span>4.8</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-gray-700 mb-4">
                    {promotion.description}
                  </p>
                  
                  {promotion.type === 'package' && promotion.packageData && (
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium mb-2">Included Treatments</h4>
                        {promotion.packageData.treatments && promotion.packageData.treatments.length > 0 ? (
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                            {promotion.packageData.treatments.map((treatment: any, index: number) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                <span>{treatment.name} {treatment.count && `x${treatment.count}`}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground text-sm">No treatments specified</p>
                        )}
                      </div>
                      
                      {promotion.packageData.benefits && promotion.packageData.benefits.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Additional Benefits</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                            {promotion.packageData.benefits.map((benefit: any, index: number) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}
                    </span>
                  </div>
                  
                  <Button size="sm" className="gap-1">
                    <span>View Promotion</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="gap-2">
          {renderActionButtons()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}