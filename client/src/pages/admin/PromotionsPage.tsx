import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DownloadIcon, PlusIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatCurrency } from '@/utils/format';
import { apiRequest } from '@/lib/queryClient';
import { Promotion } from '@/types/promotion';
import { CreatePromotionModal } from '@/components/admin/CreatePromotionModal';
import { EditPromotionModal } from '@/components/admin/EditPromotionModal';
import { apiToUiPromotion, uiToApiPromotion, getFormattedDiscount, getFormattedTreatments } from '@/utils/promotion-utils';

export default function PromotionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  
  // Fetch promotions
  const { data: promotions, isLoading, refetch } = useQuery<Promotion[]>({
    queryKey: ['/api/admin/promotions'],
    staleTime: 30000, // 30 seconds,
    queryFn: async () => {
      const response = await fetch('/api/admin/promotions');
      if (!response.ok) throw new Error('Failed to fetch promotions');
      const data = await response.json();
      // Convert API response to match our Promotion type
      return data.map((item: any): Promotion => apiToUiPromotion(item));
    },
  });
  
  // Toggle promotion status
  interface ToggleStatusParams {
    id: string;
    isActive: boolean;
  }
  
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: ToggleStatusParams) => {
      const response = await apiRequest('PATCH', `/api/admin/promotions/${id}`, { is_active: isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
      toast({
        title: 'Status updated',
        description: 'Promotion status has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete promotion
  const deletePromotionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/promotions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
      toast({
        title: 'Promotion deleted',
        description: 'Promotion has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete promotion',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id, isActive: !currentStatus });
  };
  
  const handleDeletePromotion = (id: string) => {
    if (window.confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
      deletePromotionMutation.mutate(id);
    }
  };
  
  const handleEditPromotion = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setEditModalOpen(true);
  };
  
  const handleExportCSV = () => {
    if (!promotions || promotions.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There are no promotions to export.',
        variant: 'destructive',
      });
      return;
    }
    
    const csvContent = generateCsv(promotions);
    downloadCsv(csvContent, 'promotions-export.csv');
    
    toast({
      title: 'Export successful',
      description: 'Promotions data has been exported to CSV.',
    });
  };
  
  return (
    <AdminLayout title="Promotions Management">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-500">
            Manage promotional codes and discounts for your dental services
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Promotion
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : !promotions || promotions.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-500">No promotions found. Create your first promotion to get started.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setCreateModalOpen(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Promotion
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead className="hidden md:table-cell">Start Date</TableHead>
                    <TableHead className="hidden md:table-cell">End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-mono uppercase">{promo.promo_code}</TableCell>
                      <TableCell className="font-medium">{promo.title}</TableCell>
                      <TableCell>
                        {promo.discount_type === 'percentage'
                          ? `${promo.discount_value}%`
                          : formatCurrency(promo.discount_value, 'GBP')}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(promo.start_date, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(promo.end_date, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={promo.is_active ? "success" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => handleToggleStatus(promo.id, promo.is_active)}
                        >
                          {promo.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {/* Usage statistics would be displayed here */}
                        -
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditPromotion(promo)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeletePromotion(promo.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create Promotion Modal */}
      <CreatePromotionModal 
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      
      {/* Edit Promotion Modal */}
      {selectedPromotion && (
        <EditPromotionModal 
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedPromotion(null);
          }}
          promotion={selectedPromotion}
        />
      )}
    </AdminLayout>
  );
}

function generateCsv(promotions: Promotion[] | undefined) {
  if (!promotions || promotions.length === 0) return '';
  
  const headers = [
    'ID', 'Code', 'Title', 'Discount Type', 'Discount Value', 
    'Start Date', 'End Date', 'Applicable Treatments', 'Status',
    'Created At', 'Updated At'
  ].join(',');
  
  const rows = promotions.map((p: Promotion) => [
    p.id,
    p.promo_code,
    `"${p.title.replace(/"/g, '""')}"`, // Escape quotes in CSV
    p.discount_type,
    p.discount_value,
    p.start_date,
    p.end_date,
    `"${getFormattedTreatments(p)}"`,
    p.is_active ? 'Active' : 'Inactive',
    p.created_at || '',
    p.updated_at || ''
  ].join(','));
  
  return [headers, ...rows].join('\n');
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}