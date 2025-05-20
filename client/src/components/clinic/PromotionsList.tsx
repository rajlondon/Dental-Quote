import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MoreHorizontal, Plus, Star, Edit, Send, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'wouter';

// Type for promotion status
type PromoStatusType = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'EXPIRED';

// Type for promotion
interface Promotion {
  id: string;
  code: string;
  title: string;
  type: 'discount' | 'package';
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  start_date: string;
  end_date: string;
  status: PromoStatusType;
  display_on_homepage: boolean;
  homepage_priority: number;
  created_at: string;
  submitted_at?: string;
  rejected_reason?: string;
}

const PromotionsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PromoStatusType | 'ALL'>('ALL');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch promotions
  const { data, isLoading, error } = useQuery<{ success: boolean; promotions: Promotion[] }>({
    queryKey: ['/api/clinic/promotions'],
    queryFn: () => apiRequest('GET', '/clinic/promotions'),
  });

  // Delete promotion mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/clinic/promotions/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Promotion deleted',
        description: 'The promotion draft has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/promotions'] });
      setDeleteDialogOpen(false);
      setPromotionToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete promotion',
        description: error.message || 'An error occurred while deleting the promotion.',
        variant: 'destructive',
      });
    },
  });

  // Submit promotion mutation
  const submitMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('POST', `/clinic/promotions/${id}/submit`);
    },
    onSuccess: () => {
      toast({
        title: 'Promotion submitted',
        description: 'Your promotion has been submitted for approval.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/promotions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to submit promotion',
        description: error.message || 'An error occurred while submitting the promotion.',
        variant: 'destructive',
      });
    },
  });

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Handle delete confirmation
  const confirmDelete = (id: string) => {
    setPromotionToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Filter promotions
  const filteredPromotions = data?.promotions
    .filter((promo) => {
      // Apply status filter
      if (statusFilter !== 'ALL' && promo.status !== statusFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          promo.title.toLowerCase().includes(query) ||
          promo.code.toLowerCase().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Get status badge
  const getStatusBadge = (status: PromoStatusType) => {
    const variants: Record<PromoStatusType, 'default' | 'secondary' | 'destructive' | 'outline' | 'success'> = {
      DRAFT: 'outline',
      PENDING_APPROVAL: 'secondary',
      APPROVED: 'default',
      ACTIVE: 'success',
      REJECTED: 'destructive',
      EXPIRED: 'outline',
    };
    
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        <p>Error loading promotions. Please try again.</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Promotions</CardTitle>
            <CardDescription>Manage your special offers and discount packages</CardDescription>
          </div>
          <Link href="/clinic/promotions/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Promotion
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search promotions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('ALL')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('DRAFT')}
            >
              Drafts
            </Button>
            <Button
              variant={statusFilter === 'PENDING_APPROVAL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('PENDING_APPROVAL')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('ACTIVE')}
            >
              Active
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Homepage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromotions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No promotions found. Create your first promotion to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredPromotions?.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell className="font-medium">{promotion.title}</TableCell>
                  <TableCell><code>{promotion.code}</code></TableCell>
                  <TableCell>
                    {promotion.type === 'discount' ? (
                      <span>
                        {promotion.discountType === 'percentage' ? 
                          `${promotion.discountValue}% off` : 
                          `£${promotion.discountValue} off`}
                      </span>
                    ) : (
                      <span>Package</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>From: {formatDate(promotion.start_date)}</div>
                      <div>To: {formatDate(promotion.end_date)}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(promotion.status)}</TableCell>
                  <TableCell className="text-center">
                    {promotion.display_on_homepage && (
                      <div className="flex justify-center">
                        <Star className="h-4 w-4 text-amber-500" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/clinic/promotions/${promotion.id}`}>
                            <div className="w-full flex items-center">
                              <Edit className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        
                        {promotion.status === 'DRAFT' && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={`/clinic/promotions/${promotion.id}/edit`}>
                                <div className="w-full flex items-center">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => submitMutation.mutate(promotion.id)}
                              disabled={submitMutation.isPending}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              <span>Submit for Approval</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => confirmDelete(promotion.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {promotion.status === 'REJECTED' && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={`/clinic/promotions/${promotion.id}/edit`}>
                                <div className="w-full flex items-center">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit & Resubmit</span>
                                </div>
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this promotion draft? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => promotionToDelete && deleteMutation.mutate(promotionToDelete)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PromotionsList;