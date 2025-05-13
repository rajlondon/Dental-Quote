import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table } from '../../components/ui/table';
import { toast } from '../../hooks/use-toast';
import { CreatePromotionModal } from '../../components/admin/CreatePromotionModal';
import { EditPromotionModal } from '../../components/admin/EditPromotionModal';
import { formatDate, formatCurrency } from '../../utils/format';

export default function PromotionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  
  const { data: promotions, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'promotions', statusFilter],
    queryFn: async () => {
      const response = await fetch(`/api/admin/promotions?status=${statusFilter}`);
      if (!response.ok) throw new Error('Failed to fetch promotions');
      return response.json();
    }
  });
  
  const filteredPromotions = promotions?.filter(promo => 
    promo.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const handleCreateSuccess = () => {
    toast({
      title: 'Promotion created',
      description: 'The promotion has been created successfully',
      variant: 'success',
    });
    refetch();
    setIsCreateModalOpen(false);
  };
  
  const handleEditSuccess = () => {
    toast({
      title: 'Promotion updated',
      description: 'The promotion has been updated successfully',
      variant: 'success',
    });
    refetch();
    setEditingPromotion(null);
  };
  
  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/promotions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update promotion status');
      
      toast({
        title: 'Status updated',
        description: `Promotion is now ${currentStatus ? 'inactive' : 'active'}`,
        variant: 'success',
      });
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <AdminLayout title="Promotion Management">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
        </div>
        
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Promotion
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading promotions...</div>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Type</th>
                <th>Value</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Clinic</th>
                <th>Uses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromotions.map(promo => (
                <tr key={promo.id}>
                  <td className="font-mono">{promo.code}</td>
                  <td>{promo.title}</td>
                  <td>{promo.discount_type === 'PERCENT' ? 'Percentage' : 'Fixed'}</td>
                  <td>
                    {promo.discount_type === 'PERCENT' 
                      ? `${promo.discount_value}%` 
                      : formatCurrency(promo.discount_value)}
                  </td>
                  <td>{formatDate(promo.end_date)}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      promo.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{promo.clinic_id ? promo.clinic_name : 'All Clinics'}</td>
                  <td>{promo.current_uses || 0}/{promo.max_uses || '∞'}</td>
                  <td className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingPromotion(promo)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant={promo.is_active ? "destructive" : "success"}
                      size="sm"
                      onClick={() => handleStatusToggle(promo.id, promo.is_active)}
                    >
                      {promo.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
              
              {filteredPromotions.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    No promotions found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          
          <div className="mt-6 flex justify-between">
            <div>
              <strong>Total:</strong> {filteredPromotions.length} promotions
            </div>
            <Button variant="outline" onClick={() => {
              const csvContent = generateCsv(filteredPromotions);
              downloadCsv(csvContent, 'promotions-export.csv');
            }}>
              Export to CSV
            </Button>
          </div>
        </>
      )}
      
      {isCreateModalOpen && (
        <CreatePromotionModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
      
      {editingPromotion && (
        <EditPromotionModal
          promotion={editingPromotion}
          onClose={() => setEditingPromotion(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </AdminLayout>
  );
}

function generateCsv(promotions) {
  const headers = ['Code', 'Title', 'Type', 'Value', 'Start Date', 'End Date', 'Status', 'Clinic', 'Uses', 'Max Uses'];
  const rows = promotions.map(p => [
    p.code,
    p.title,
    p.discount_type === 'PERCENT' ? 'Percentage' : 'Fixed',
    p.discount_value,
    p.start_date,
    p.end_date,
    p.is_active ? 'Active' : 'Inactive',
    p.clinic_id ? p.clinic_name : 'All Clinics',
    p.current_uses || 0,
    p.max_uses || 'Unlimited'
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
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