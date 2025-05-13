import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Switch } from '../ui/switch';
import { toast } from '../../hooks/use-toast';
import { Promotion, PromotionFormData } from '../../types/promotion';

interface Clinic {
  id: string;
  name: string;
}

interface EditPromotionModalProps {
  promotion: Promotion;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPromotionModal({ promotion, onClose, onSuccess }: EditPromotionModalProps) {
  const [formData, setFormData] = useState<PromotionFormData>({
    code: promotion.code || '',
    title: promotion.title || '',
    description: promotion.description || '',
    discount_type: promotion.discount_type || 'PERCENT',
    discount_value: promotion.discount_value || '',
    start_date: promotion.start_date ? new Date(promotion.start_date).toISOString().split('T')[0] : '',
    end_date: promotion.end_date ? new Date(promotion.end_date).toISOString().split('T')[0] : '',
    max_uses: promotion.max_uses || '',
    clinic_id: promotion.clinic_id || '',
    is_active: promotion.is_active
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  
  // Fetch clinics on component mount
  useEffect(() => {
    async function fetchClinics() {
      try {
        const response = await fetch('/api/admin/clinics');
        if (response.ok) {
          const data = await response.json();
          setClinics(data);
        }
      } catch (error) {
        console.error('Failed to fetch clinics:', error);
      }
    }
    
    fetchClinics();
  }, []);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/admin/promotions/${promotion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update promotion');
      }
      
      onSuccess();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Promotion</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Promotion Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., SUMMER25"
                  required
                  className="uppercase"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Code should be all uppercase, no spaces
                </p>
              </div>
              
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Summer Sale 25% Off"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the promotion details..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <RadioGroup
                  value={formData.discount_type}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, discount_type: value as 'PERCENT' | 'FIXED' }))
                  }
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PERCENT" id="percent" />
                    <Label htmlFor="percent">Percentage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FIXED" id="fixed" />
                    <Label htmlFor="fixed">Fixed Amount</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label htmlFor="discount_value">Discount Value</Label>
                <Input
                  id="discount_value"
                  name="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={handleChange}
                  placeholder={formData.discount_type === 'PERCENT' ? '25' : '100'}
                  required
                  min={formData.discount_type === 'PERCENT' ? 1 : 0}
                  max={formData.discount_type === 'PERCENT' ? 100 : undefined}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.discount_type === 'PERCENT' 
                    ? 'Enter percentage value (1-100)' 
                    : 'Enter amount in currency units'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  min={formData.start_date}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_uses">Maximum Uses</Label>
                <Input
                  id="max_uses"
                  name="max_uses"
                  type="number"
                  value={formData.max_uses}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for unlimited uses
                </p>
              </div>
              
              <div>
                <Label htmlFor="clinic_id">Clinic</Label>
                <select
                  id="clinic_id"
                  name="clinic_id"
                  value={formData.clinic_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">All Clinics</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_active: checked }))
                }
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}