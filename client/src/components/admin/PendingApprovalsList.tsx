import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Tag,
  Package,
  Hourglass
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import PromotionReview from './PromotionReview';

// Define the Promotion interface to match our backend
interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'discount' | 'package';
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  clinicId: string;
  clinic_name?: string;
  applicable_treatments: string[];
  start_date: string;
  end_date: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'expired';
  created_at: string;
  submitted_at?: string;
  packageData?: {
    name: string;
    description: string;
    treatments: Array<{
      id: string;
      name: string;
      quantity: number;
    }>;
    originalPrice: number;
    packagePrice: number;
  };
}

const PendingApprovalsList: React.FC = () => {
  const { toast } = useToast();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);

  // Fetch all pending promotions
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/promotions/pending'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/promotions/pending');
      const data = await response.json();
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Approve promotion mutation
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('POST', `/api/admin/promotions/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions/pending'] });
      toast({
        title: 'Promotion approved',
        description: 'The promotion has been approved and is now active.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to approve promotion: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Reject promotion mutation
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('POST', `/api/admin/promotions/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions/pending'] });
      toast({
        title: 'Promotion rejected',
        description: 'The promotion has been rejected and sent back to the clinic.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to reject promotion: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Open review dialog
  const openReviewDialog = (id: string) => {
    setSelectedPromotionId(id);
    setReviewDialogOpen(true);
  };

  // Handle approve/reject from the review dialog
  const handleApproveReject = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions/pending'] });
    setReviewDialogOpen(false);
    setSelectedPromotionId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24 mr-2" />
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Error Loading Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>There was an error loading pending approvals. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions/pending'] })}
          >
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const pendingPromotions = data?.promotions || [];

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Calculate wait time in days
  const getWaitTime = (submittedAt: string) => {
    const submittedDate = new Date(submittedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - submittedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // If less than a day, show hours
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      return diffHours === 0 ? 'Just now' : `${diffHours}h ago`;
    }
    
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  };

  if (pendingPromotions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="mb-4 p-4 bg-green-50 rounded-full">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-medium mb-1">All caught up!</h3>
          <p className="text-muted-foreground">There are no pending promotions to review at this time.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {pendingPromotions.map((promotion: Promotion) => (
          <Card key={promotion.id} className="overflow-hidden border">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center">
                  {promotion.type === 'discount' ? (
                    <Tag className="h-5 w-5 mr-2 text-primary" />
                  ) : (
                    <Package className="h-5 w-5 mr-2 text-primary" />
                  )}
                  {promotion.title}
                </CardTitle>
                <span className="text-amber-500 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                  <Hourglass className="h-3 w-3 mr-1" /> Pending Review
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">{promotion.clinic_name}</span> • Code: <span className="font-mono bg-muted p-1 rounded">{promotion.code}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted: {promotion.submitted_at ? getWaitTime(promotion.submitted_at) : 'Unknown'}
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm mb-2">{promotion.description}</p>
              
              {promotion.type === 'discount' && (
                <div className="bg-muted/50 p-2 rounded-md text-sm">
                  <p className="font-medium">
                    {promotion.discountType === 'percentage' 
                      ? `${promotion.discountValue}% off` 
                      : `£${promotion.discountValue} off`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Applicable to {promotion.applicable_treatments.length} treatment{promotion.applicable_treatments.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {promotion.type === 'package' && promotion.packageData && (
                <div className="bg-muted/50 p-2 rounded-md text-sm">
                  <p className="font-medium">Package: {promotion.packageData.name}</p>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      {promotion.packageData.treatments.length} treatment{promotion.packageData.treatments.length !== 1 ? 's' : ''}
                    </p>
                    {promotion.packageData.originalPrice && promotion.packageData.packagePrice && (
                      <p className="text-xs font-medium">
                        Save £{(promotion.packageData.originalPrice - promotion.packageData.packagePrice).toFixed(2)} 
                        ({Math.round(((promotion.packageData.originalPrice - promotion.packageData.packagePrice) / promotion.packageData.originalPrice) * 100)}%)
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground mt-2">
                <p>Valid: {formatDate(promotion.start_date)} to {formatDate(promotion.end_date)}</p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-3 bg-muted/20">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => openReviewDialog(promotion.id)}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Review Details
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={() => rejectMutation.mutate(promotion.id)}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="h-3.5 w-3.5 mr-1 text-red-500" />
                  Reject
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-green-200 hover:bg-green-50 hover:text-green-600"
                  onClick={() => approveMutation.mutate(promotion.id)}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" />
                  Approve
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Promotion Review Dialog */}
      {selectedPromotionId && (
        <PromotionReview
          promotionId={selectedPromotionId}
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          onApproveReject={handleApproveReject}
        />
      )}
    </>
  );
};

export default PendingApprovalsList;