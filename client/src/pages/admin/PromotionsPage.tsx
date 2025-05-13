import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { CreatePromotionModal } from '../../components/admin/CreatePromotionModal';
import { EditPromotionModal } from '../../components/admin/EditPromotionModal';
import { formatDate, formatCurrency, formatNumber, formatPercentage } from '../../utils/format';
import { toast } from '../../hooks/use-toast';
import {
  ChevronDown,
  Edit,
  FileDown,
  Plus,
  RefreshCw,
  Search,
  Trash,
  XCircle,
  CheckCircle
} from 'lucide-react';

export default function PromotionsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  
  const { data: promotions, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['/api/admin/promotions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/promotions');
      if (!response.ok) {
        throw new Error('Failed to fetch promotions');
      }
      return response.json();
    }
  });
  
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const response = await fetch(`/api/admin/promotions/${id}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update promotion status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
      toast({
        title: 'Status Updated',
        description: 'Promotion status has been updated successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id, isActive: !currentStatus });
  };
  
  const deletePromotionMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/admin/promotions/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete promotion');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
      toast({
        title: 'Promotion Deleted',
        description: 'The promotion has been deleted successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const handleDeletePromotion = (id) => {
    if (window.confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
      deletePromotionMutation.mutate(id);
    }
  };
  
  const handleEditPromotion = (promo) => {
    setCurrentPromotion(promo);
    setShowEditModal(true);
  };
  
  const filteredPromotions = promotions
    ? promotions.filter(promo => 
        promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (promo.description && promo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];
  
  return (
    <AdminLayout title="Promotions Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search promotions..."
                className="pl-8 pr-4 py-2 rounded-md border border-gray-300 w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5"
                >
                  <XCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => generateCsv(promotions)}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Promotion
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>All Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-red-500">
                Error loading promotions: {error.message}
              </div>
            ) : filteredPromotions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm 
                  ? "No promotions match your search criteria"
                  : "No promotions found. Create your first promotion using the button above."
                }
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Uses</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromotions.map(promo => (
                      <TableRow key={promo.id}>
                        <TableCell className="font-mono font-semibold text-primary">
                          {promo.code}
                        </TableCell>
                        <TableCell>
                          <div>{promo.title}</div>
                          {promo.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {promo.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {promo.discount_type === 'PERCENT' 
                            ? formatPercentage(promo.discount_value) 
                            : formatCurrency(promo.discount_value)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>From: {formatDate(promo.start_date)}</div>
                            <div>To: {formatDate(promo.end_date)}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={promo.is_active ? "success" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => handleToggleStatus(promo.id, promo.is_active)}
                          >
                            {promo.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {promo.use_count ? formatNumber(promo.use_count) : '0'} 
                          {promo.max_uses ? ` / ${formatNumber(promo.max_uses)}` : ''}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditPromotion(promo)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeletePromotion(promo.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {showCreateModal && (
        <CreatePromotionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
          }}
        />
      )}
      
      {showEditModal && currentPromotion && (
        <EditPromotionModal
          promotion={currentPromotion}
          onClose={() => {
            setShowEditModal(false);
            setCurrentPromotion(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setCurrentPromotion(null);
            queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions'] });
          }}
        />
      )}
    </AdminLayout>
  );
}

function generateCsv(promotions) {
  if (!promotions || promotions.length === 0) {
    toast({
      title: 'No data',
      description: 'There are no promotions to export.',
      variant: 'destructive',
    });
    return;
  }
  
  const headers = [
    'Code', 'Title', 'Description', 'Discount Type', 'Discount Value',
    'Start Date', 'End Date', 'Max Uses', 'Active', 'Clinic ID'
  ];
  
  const csvRows = [
    headers.join(','),
    ...promotions.map(p => [
      `"${p.code}"`, 
      `"${p.title.replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      `"${p.discount_type}"`,
      p.discount_value,
      `"${formatDate(p.start_date)}"`,
      `"${formatDate(p.end_date)}"`,
      p.max_uses || '',
      p.is_active ? 'Yes' : 'No',
      p.clinic_id || 'All'
    ].join(','))
  ];
  
  const csvContent = csvRows.join('\n');
  downloadCsv(csvContent, 'promotions.csv');
}

function downloadCsv(content, filename) {
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