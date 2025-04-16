import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle,
  Edit,
  Plus,
  Save,
  Server,
  Trash,
  FileText,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import treatmentMapperApi from '@/services/api/treatmentMapperApi';
import { TreatmentMap, StandardTreatment } from '@shared/treatmentMapper';
import { useToast } from '@/hooks/use-toast';

/**
 * Admin page to manage all standard treatments in the treatment mapper
 */
const AdminTreatmentMapperPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for adding/editing standard treatments
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTreatmentName, setNewTreatmentName] = useState('');
  const [newTreatmentCategory, setNewTreatmentCategory] = useState('');
  
  // Fetch the treatment map from the API
  const { 
    data: treatmentMap,
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['/api/treatment-mapper'],
    queryFn: async () => {
      try {
        return await treatmentMapperApi.getTreatmentMap();
      } catch (error) {
        console.error('Error fetching treatment map:', error);
        throw error;
      }
    }
  });
  
  // Get all categories
  const categories = React.useMemo(() => {
    if (!treatmentMap) return [];
    
    const categorySet = new Set<string>();
    
    // Handle the case where treatmentMap might be undefined
    if (treatmentMap) {
      Object.values(treatmentMap).forEach(treatment => {
        categorySet.add(treatment.category);
      });
    }
    
    return Array.from(categorySet);
  }, [treatmentMap]);
  
  // Mutation for adding a new treatment
  const addTreatmentMutation = useMutation({
    mutationFn: async () => {
      return await treatmentMapperApi.addStandardTreatment(
        newTreatmentName,
        newTreatmentCategory
      );
    },
    onSuccess: () => {
      toast({
        title: "Treatment added",
        description: `Added ${newTreatmentName} to the standard treatments`,
      });
      
      setAddDialogOpen(false);
      setNewTreatmentName('');
      setNewTreatmentCategory('');
      
      // Invalidate the treatment map query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/treatment-mapper'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to add treatment",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
    }
  });
  
  // Mutation for deleting a treatment
  const deleteTreatmentMutation = useMutation({
    mutationFn: async (treatmentName: string) => {
      return await treatmentMapperApi.deleteStandardTreatment(treatmentName);
    },
    onSuccess: (_, treatmentName) => {
      toast({
        title: "Treatment deleted",
        description: `Deleted ${treatmentName} from the standard treatments`,
      });
      
      // Invalidate the treatment map query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/treatment-mapper'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete treatment",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
    }
  });
  
  const handleAddTreatment = () => {
    if (!newTreatmentName || !newTreatmentCategory) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and category for the new treatment",
        variant: "destructive"
      });
      return;
    }
    
    addTreatmentMutation.mutate();
  };
  
  const handleDeleteTreatment = (treatmentName: string) => {
    if (confirm(`Are you sure you want to delete the "${treatmentName}" treatment? This will remove all clinic mappings for this treatment.`)) {
      deleteTreatmentMutation.mutate(treatmentName);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-10 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Treatment Mapper Admin</h1>
            <p className="text-muted-foreground">Manage standardized treatments and categories</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Loading treatments...</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load treatment map data'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Treatment Mapper Admin</h1>
          <p className="text-muted-foreground mt-2">
            Manage standardized treatments that clinics can map to their own variants
          </p>
        </div>
        
        <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Treatment
        </Button>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-md mb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium">Admin Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Standard treatments are visible to all users but can be mapped differently by each clinic.
              Adding or removing treatments here affects the entire platform.
            </p>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Standard Treatments</CardTitle>
          <CardDescription>
            {treatmentMap ? Object.keys(treatmentMap).length : 0} treatments in {categories.length} categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Treatment Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Clinic Mappings</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatmentMap && Object.entries(treatmentMap).map(([name, treatment]) => (
                <TableRow key={name}>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{treatment.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {treatment.clinic_variants.length} mappings
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => handleDeleteTreatment(name)}
                      >
                        <Trash className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Treatment Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Standard Treatment</DialogTitle>
            <DialogDescription>
              Add a new standardized treatment that clinics can map to their own variants
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Treatment Name</Label>
              <Input
                id="name"
                value={newTreatmentName}
                onChange={(e) => setNewTreatmentName(e.target.value)}
                placeholder="E.g., Premium Dental Implant"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              {categories.length > 0 ? (
                <Select
                  value={newTreatmentCategory}
                  onValueChange={setNewTreatmentCategory}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">+ Add New Category</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="category"
                  value={newTreatmentCategory}
                  onChange={(e) => setNewTreatmentCategory(e.target.value)}
                  placeholder="E.g., Implants, Crowns & Veneers"
                />
              )}
              
              {newTreatmentCategory === 'new' && (
                <Input
                  className="mt-2"
                  value=""
                  onChange={(e) => setNewTreatmentCategory(e.target.value)}
                  placeholder="Enter new category name"
                />
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddTreatment} 
              className="flex items-center gap-1"
              disabled={addTreatmentMutation.isPending}
            >
              {addTreatmentMutation.isPending ? (
                <span className="animate-spin">↻</span>
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Treatment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTreatmentMapperPage;