import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Edit, Plus, Save, Trash } from 'lucide-react';

import { ClinicTreatmentVariant, INITIAL_TREATMENT_MAP } from '@shared/treatmentMapper';
import { treatmentMapperService } from '@/services/treatmentMapperService';
import { useToast } from '@/hooks/use-toast';

interface TreatmentMappingManagerProps {
  clinicId: string;
}

export const TreatmentMappingManager: React.FC<TreatmentMappingManagerProps> = ({
  clinicId
}) => {
  const { toast } = useToast();
  const [standardTreatments, setStandardTreatments] = useState<string[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [mappedVariants, setMappedVariants] = useState<{
    standardName: string;
    clinicVariant: ClinicTreatmentVariant | undefined;
  }[]>([]);
  
  // Form state for editing a variant
  const [editForm, setEditForm] = useState<{
    label: string;
    price: string;
    includes: string;
    optional_addons: string;
    note: string;
  }>({
    label: '',
    price: '',
    includes: '',
    optional_addons: '',
    note: ''
  });
  
  useEffect(() => {
    // Load all standard treatments
    const treatments = treatmentMapperService.getStandardTreatmentNames();
    setStandardTreatments(treatments);
    
    // Load all mapped variants for this clinic
    const variants = treatments.map(name => ({
      standardName: name,
      clinicVariant: treatmentMapperService.getClinicVariant(name, clinicId)
    }));
    setMappedVariants(variants);
  }, [clinicId]);
  
  const handleEditVariant = (standardName: string) => {
    setSelectedTreatment(standardName);
    
    const variant = treatmentMapperService.getClinicVariant(standardName, clinicId);
    
    if (variant) {
      setEditForm({
        label: variant.label,
        price: variant.price,
        includes: variant.includes.join(', '),
        optional_addons: variant.optional_addons ? variant.optional_addons.join(', ') : '',
        note: variant.note || ''
      });
    } else {
      // Initialize with empty form for new mapping
      setEditForm({
        label: standardName, // Default to standard name
        price: '',
        includes: 'Basic procedure', // Default inclusion
        optional_addons: '',
        note: ''
      });
    }
    
    setEditDialogOpen(true);
  };
  
  const handleSaveVariant = () => {
    if (!selectedTreatment) return;
    
    const newVariant: ClinicTreatmentVariant = {
      clinic_id: clinicId,
      label: editForm.label,
      price: editForm.price,
      includes: editForm.includes.split(',').map(item => item.trim()),
      note: editForm.note || undefined
    };
    
    if (editForm.optional_addons) {
      newVariant.optional_addons = editForm.optional_addons
        .split(',')
        .map(item => item.trim());
    }
    
    const success = treatmentMapperService.addClinicVariant(
      selectedTreatment,
      newVariant
    );
    
    if (success) {
      toast({
        title: "Mapping updated",
        description: `Your mapping for ${selectedTreatment} has been updated`,
      });
      
      // Refresh mappings
      const variants = standardTreatments.map(name => ({
        standardName: name,
        clinicVariant: treatmentMapperService.getClinicVariant(name, clinicId)
      }));
      setMappedVariants(variants);
      
      setEditDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to update mapping",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Treatment Mapping Manager</h2>
        <Select onValueChange={(value) => handleEditVariant(value)}>
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Map a new treatment..." />
          </SelectTrigger>
          <SelectContent>
            {standardTreatments.map(treatment => (
              <SelectItem key={treatment} value={treatment}>
                {treatment}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Mapped Treatments</CardTitle>
          <CardDescription>
            Customize how your clinic's treatments appear to patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Standard Treatment</TableHead>
                <TableHead>Your Label</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappedVariants.map(({ standardName, clinicVariant }) => (
                <TableRow key={standardName}>
                  <TableCell className="font-medium">{standardName}</TableCell>
                  <TableCell>
                    {clinicVariant ? clinicVariant.label : <span className="text-gray-400 italic">Not mapped</span>}
                  </TableCell>
                  <TableCell>
                    {clinicVariant ? clinicVariant.price : '-'}
                  </TableCell>
                  <TableCell>
                    {clinicVariant ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Mapped
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Not Mapped
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditVariant(standardName)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      {clinicVariant ? 'Edit' : 'Add'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {mappedVariants.find(v => v.standardName === selectedTreatment)?.clinicVariant
                ? `Edit mapping for ${selectedTreatment}`
                : `Add mapping for ${selectedTreatment}`}
            </DialogTitle>
            <DialogDescription>
              Customize how this treatment appears to patients viewing your clinic
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label (shown to patients)</Label>
              <Input
                id="label"
                value={editForm.label}
                onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                placeholder="E.g., Premium Zirconia Crown"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={editForm.price}
                onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                placeholder="E.g., £190 or £190 - £250"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="includes">Includes (comma separated)</Label>
              <Textarea
                id="includes"
                value={editForm.includes}
                onChange={(e) => setEditForm({...editForm, includes: e.target.value})}
                placeholder="E.g., crown, temporary crown, fitting"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="addons">Optional add-ons (comma separated)</Label>
              <Textarea
                id="addons"
                value={editForm.optional_addons}
                onChange={(e) => setEditForm({...editForm, optional_addons: e.target.value})}
                placeholder="E.g., abutment, post buildup"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="note">Additional notes</Label>
              <Textarea
                id="note"
                value={editForm.note}
                onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                placeholder="E.g., Includes 5-year warranty"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVariant} className="flex items-center gap-1">
              <Save className="h-4 w-4" />
              Save mapping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};