import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Tag,
  Package
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

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

interface PromotionsListProps {
  status: string;
  refreshTrigger: number;
  onEdit: (id: string) => void;
}

const PromotionsList: React.FC<PromotionsListProps> = ({ status, refreshTrigger, onEdit }) => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Fetch all promotions for this clinic
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/clinic/promotions'],
    queryFn: () => apiRequest('GET', '/api/clinic/promotions'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Delete promotion mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/clinic/promotions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/promotions'] });
      toast({
        title: 'Promotion deleted',
        description: 'The promotion has been successfully deleted.',
      });
      setDeleteDialogOpen(false);
      setPromotionToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete promotion: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Submit promotion for approval mutation
  const submitMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('POST', `/api/clinic/promotions/${id}/submit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/promotions'] });
      toast({
        title: 'Promotion submitted',
        description: 'Your promotion has been submitted for approval.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to submit promotion: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle promotion deletion
  const confirmDelete = () => {
    if (promotionToDelete) {
      deleteMutation.mutate(promotionToDelete);
    }
  };

  // Handle promotion submission
  const submitPromotion = (id: string) => {
    submitMutation.mutate(id);
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
            Error Loading Promotions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>There was an error loading your promotions. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/clinic/promotions'] })}
          >
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Categorize promotions by status
  const promotions = data?.promotions || [];
  const draftPromotions = promotions.filter(promo => promo.status === 'draft');
  const pendingPromotions = promotions.filter(promo => promo.status === 'pending_approval');
  const approvedPromotions = promotions.filter(promo => promo.status === 'approved');
  const rejectedPromotions = promotions.filter(promo => promo.status === 'rejected');

  // Sort promotions by creation date (newest first)
  const sortedPromotions = [...promotions].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Get the active promotions based on the selected tab
  const getActivePromotions = () => {
    switch (activeTab) {
      case 'drafts':
        return draftPromotions;
      case 'pending':
        return pendingPromotions;
      case 'approved':
        return approvedPromotions;
      case 'rejected':
        return rejectedPromotions;
      default:
        return sortedPromotions;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="text-blue-500 bg-blue-50 px-2 py-1 rounded-full text-xs font-medium flex items-center"><Clock className="h-3 w-3 mr-1" /> Draft</span>;
      case 'pending_approval':
        return <span className="text-amber-500 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium flex items-center"><Clock className="h-3 w-3 mr-1" /> Pending Approval</span>;
      case 'approved':
        return <span className="text-green-500 bg-green-50 px-2 py-1 rounded-full text-xs font-medium flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Approved</span>;
      case 'rejected':
        return <span className="text-red-500 bg-red-50 px-2 py-1 rounded-full text-xs font-medium flex items-center"><XCircle className="h-3 w-3 mr-1" /> Rejected</span>;
      case 'expired':
        return <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded-full text-xs font-medium flex items-center"><XCircle className="h-3 w-3 mr-1" /> Expired</span>;
      default:
        return <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  // Calculate savings for package promotions
  const calculateSavings = (originalPrice: number, packagePrice: number) => {
    const savingsAmount = originalPrice - packagePrice;
    const savingsPercentage = Math.round((savingsAmount / originalPrice) * 100);
    return { amount: savingsAmount, percentage: savingsPercentage };
  };

  // Render promotion card based on promotion type and status
  const renderPromotionCard = (promotion: any) => {
    return (
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
            {getStatusBadge(promotion.status)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Code: <span className="font-mono bg-muted p-1 rounded">{promotion.code}</span>
          </p>
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
                <p className="text-xs font-medium">
                  Save £{(promotion.packageData.originalPrice - promotion.packageData.packagePrice).toFixed(2)} 
                  ({Math.round(((promotion.packageData.originalPrice - promotion.packageData.packagePrice) / promotion.packageData.originalPrice) * 100)}%)
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-2">
            <p>Valid: {formatDate(promotion.start_date)} to {formatDate(promotion.end_date)}</p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-3 bg-muted/20">
          <div className="text-xs text-muted-foreground">
            Created: {formatDate(promotion.created_at)}
          </div>
          
          <div className="flex space-x-2">
            {promotion.status === 'draft' && (
              <>
                <Link href={`/clinic/promotions/edit/${promotion.id}`}>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  onClick={() => submitPromotion(promotion.id)}
                  disabled={submitMutation.isPending}
                >
                  Submit
                </Button>
              </>
            )}

            {promotion.status === 'rejected' && (
              <Link href={`/clinic/promotions/edit/${promotion.id}`}>
                <Button size="sm" variant="outline">
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Revise
                </Button>
              </Link>
            )}

            {(promotion.status === 'draft' || promotion.status === 'rejected') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <span className="sr-only">Actions</span>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={() => {
                      setPromotionToDelete(promotion.id);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-destructive"
                  >
                    Delete Promotion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {promotion.status === 'pending_approval' && (
              <span className="text-sm text-muted-foreground">
                Under review...
              </span>
            )}

            {promotion.status === 'approved' && (
              <span className="text-sm text-green-600 font-medium">
                Active
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">
            All ({promotions.length})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({draftPromotions.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingPromotions.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedPromotions.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedPromotions.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-0">
          {getActivePromotions().length > 0 ? (
            getActivePromotions().map(renderPromotionCard)
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center pt-6 pb-6">
                <p className="text-muted-foreground mb-2">No promotions found</p>
                <Link href="/clinic/promotions/create">
                  <Button>Create a Promotion</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Deletion */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this promotion? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PromotionsList;