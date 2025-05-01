import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TreatmentMap, StandardTreatment, ClinicTreatmentVariant } from '@shared/treatmentMapper';
import treatmentMapperApi from '@/services/api/treatmentMapperApi';
import { treatmentMapperService } from '@/services/treatmentMapperService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Pencil, Save, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TreatmentMappingManagerProps {
  clinicId: string;
}

export const TreatmentMappingManager: React.FC<TreatmentMappingManagerProps> = ({ clinicId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editData, setEditData] = useState<ClinicTreatmentVariant | null>(null);
  const [showAddVariantDialog, setShowAddVariantDialog] = useState<boolean>(false);
  
  // Load treatments data
  const { 
    data: treatmentMap,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['/api/treatment-mapper'],
    queryFn: async () => {
      return await treatmentMapperApi.getTreatmentMap();
    }
  });
  
  // Load clinic variants
  const {
    data: clinicVariants,
    isLoading: isLoadingVariants,
    isError: isErrorVariants,
    error: errorVariants
  } = useQuery({
    queryKey: ['/api/treatment-mapper/clinic', clinicId],
    queryFn: async () => {
      return await treatmentMapperApi.getClinicTreatmentVariants(clinicId);
    }
  });
  
  // Update clinic variant mutation
  const updateVariantMutation = useMutation({
    mutationFn: async (params: {
      treatmentName: string;
      variantData: ClinicTreatmentVariant;
    }) => {
      return await treatmentMapperApi.updateClinicTreatmentVariant(
        clinicId,
        params.treatmentName,
        params.variantData
      );
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/treatment-mapper/clinic', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['/api/treatment-mapper'] });
      
      toast({
        title: "Mapping updated",
        description: "Your treatment mapping has been saved successfully.",
      });
      
      // Reset edit mode
      setEditMode(false);
      setEditData(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating mapping",
        description: error instanceof Error ? error.message : "Failed to update treatment mapping",
        variant: "destructive"
      });
    }
  });
  
  // Get all categories
  const categories = treatmentMap 
    ? Array.from(new Set(Object.values(treatmentMap).map(t => t.category)))
    : [];
  
  // Get treatments filtered by category
  const filteredTreatments = treatmentMap
    ? Object.entries(treatmentMap)
      .filter(([_, treatment]) => 
        activeCategory === 'all' || treatment.category === activeCategory
      )
    : [];
  
  // Handle selecting a treatment
  const handleSelectTreatment = (treatmentName: string) => {
    setSelectedTreatment(treatmentName);
    setEditMode(false);
    setEditData(null);
  };
  
  // Handle edit button
  const handleEdit = (treatmentName: string) => {
    if (!clinicVariants || !treatmentMap) return;
    
    const variant = clinicVariants[treatmentName] || null;
    
    // If variant exists, edit it. Otherwise create a new one
    if (variant) {
      setEditData({...variant});
    } else {
      setEditData({
        clinic_id: clinicId,
        label: treatmentName, // Default to standard name
        price: "",
        includes: [],
        optional_addons: []
      });
    }
    
    setEditMode(true);
  };
  
  // Handle save
  const handleSave = () => {
    if (!selectedTreatment || !editData) return;
    
    updateVariantMutation.mutate({
      treatmentName: selectedTreatment,
      variantData: editData
    });
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditData(null);
  };
  
  // Get the current clinic variant for a treatment
  const getClinicVariant = (treatmentName: string): ClinicTreatmentVariant | null => {
    if (!clinicVariants) return null;
    return clinicVariants[treatmentName] || null;
  };
  
  // Determine if a treatment has a mapping
  const hasMappingForTreatment = (treatmentName: string): boolean => {
    return !!getClinicVariant(treatmentName);
  };
  
  // Create a new mapping for a treatment
  const handleAddVariant = () => {
    if (!selectedTreatment) return;
    
    setEditData({
      clinic_id: clinicId,
      label: selectedTreatment, // Default to standard name
      price: "",
      includes: [],
      optional_addons: []
    });
    
    setEditMode(true);
    setShowAddVariantDialog(false);
  };
  
  return (
    <div className="space-y-6">
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading treatment data</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load treatment mapping data"}
          </AlertDescription>
        </Alert>
      )}
      
      {isErrorVariants && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading clinic variants</AlertTitle>
          <AlertDescription>
            {errorVariants instanceof Error 
              ? errorVariants.message 
              : "Failed to load clinic treatment variants"}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Standard Treatment Categories</CardTitle>
          <CardDescription>
            Select a category to view treatments, or view all treatments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="all" 
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full"
          >
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-12 gap-6">
        {/* Left column: Treatment List */}
        <div className="md:col-span-5">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Standard Treatments</CardTitle>
              <CardDescription>
                Select a treatment to view or edit its mapping
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[50vh]">
                <div className="p-4 space-y-2">
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading treatments...</div>
                  ) : filteredTreatments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No treatments found</div>
                  ) : (
                    filteredTreatments.map(([treatmentName, treatment]) => (
                      <div
                        key={treatmentName}
                        className={`
                          p-4 border rounded-md cursor-pointer transition-colors
                          ${selectedTreatment === treatmentName ? 'border-primary bg-primary/5' : 'hover:bg-muted'}
                        `}
                        onClick={() => handleSelectTreatment(treatmentName)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{treatmentName}</h3>
                            <p className="text-sm text-muted-foreground">
                              Category: {treatment.category}
                            </p>
                          </div>
                          {hasMappingForTreatment(treatmentName) ? (
                            <Badge className="bg-green-600">Mapped</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-400">
                              Not Mapped
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column: Treatment Details & Variant Editor */}
        <div className="md:col-span-7">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedTreatment || "Treatment Details"}</CardTitle>
                  <CardDescription>
                    {selectedTreatment 
                      ? "View and edit your clinic's variant for this treatment" 
                      : "Select a treatment from the list to view details"}
                  </CardDescription>
                </div>
                {selectedTreatment && !editMode && (
                  <div>
                    {hasMappingForTreatment(selectedTreatment) ? (
                      <Button onClick={() => handleEdit(selectedTreatment)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Mapping
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setShowAddVariantDialog(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Mapping
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {!selectedTreatment ? (
                <div className="text-center py-12 text-muted-foreground">
                  Select a treatment to view or edit its mapping
                </div>
              ) : isLoadingVariants ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading treatment details...
                </div>
              ) : editMode ? (
                // Edit mode
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Treatment Label (visible to patients)</Label>
                    <Input 
                      id="label" 
                      value={editData?.label || ""} 
                      onChange={(e) => setEditData({
                        ...editData!, 
                        label: e.target.value
                      })} 
                    />
                    <p className="text-sm text-muted-foreground">
                      This is how your treatment will appear in quotes and search results
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input 
                      id="price" 
                      value={editData?.price || ""} 
                      onChange={(e) => setEditData({
                        ...editData!, 
                        price: e.target.value
                      })} 
                      placeholder="e.g. £350 or £350-£500"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter a fixed price or a price range
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Includes</Label>
                    <div className="border rounded-md p-3 space-y-2">
                      {editData?.includes?.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input 
                            value={item} 
                            onChange={(e) => {
                              const newIncludes = [...(editData?.includes || [])];
                              newIncludes[index] = e.target.value;
                              setEditData({
                                ...editData!,
                                includes: newIncludes
                              });
                            }}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              const newIncludes = [...(editData?.includes || [])];
                              newIncludes.splice(index, 1);
                              setEditData({
                                ...editData!,
                                includes: newIncludes
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditData({
                            ...editData!,
                            includes: [...(editData?.includes || []), ""]
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Optional Add-ons</Label>
                    <div className="border rounded-md p-3 space-y-2">
                      {editData?.optional_addons?.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input 
                            value={item} 
                            onChange={(e) => {
                              const newAddons = [...(editData?.optional_addons || [])];
                              newAddons[index] = e.target.value;
                              setEditData({
                                ...editData!,
                                optional_addons: newAddons
                              });
                            }}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              const newAddons = [...(editData?.optional_addons || [])];
                              newAddons.splice(index, 1);
                              setEditData({
                                ...editData!,
                                optional_addons: newAddons
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditData({
                            ...editData!,
                            optional_addons: [...(editData?.optional_addons || []), ""]
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Add-on
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="note">Additional Note</Label>
                    <Textarea 
                      id="note" 
                      value={editData?.note || ""} 
                      onChange={(e) => setEditData({
                        ...editData!, 
                        note: e.target.value
                      })} 
                      placeholder="E.g. Includes a free consultation, warranty information, etc."
                    />
                  </div>
                </div>
              ) : (
                // View mode
                <div className="space-y-6">
                  {hasMappingForTreatment(selectedTreatment) ? (
                    <>
                      <div className="p-4 bg-muted rounded-md">
                        <h3 className="font-medium text-lg">
                          {getClinicVariant(selectedTreatment)?.label}
                        </h3>
                        <div className="mt-2">
                          <span className="font-medium">Price:</span> {getClinicVariant(selectedTreatment)?.price}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Includes:</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {getClinicVariant(selectedTreatment)?.includes.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {(getClinicVariant(selectedTreatment)?.optional_addons?.length || 0) > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Optional Add-ons:</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {getClinicVariant(selectedTreatment)?.optional_addons?.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {getClinicVariant(selectedTreatment)?.note && (
                        <div>
                          <h3 className="font-medium mb-2">Note:</h3>
                          <p className="text-muted-foreground">
                            {getClinicVariant(selectedTreatment)?.note}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="h-10 w-10 mx-auto text-amber-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No mapping defined</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        You haven't mapped this standard treatment to your clinic's offering yet. 
                        Create a mapping to make this treatment available to patients in their 
                        quote results.
                      </p>
                      <Button 
                        onClick={() => setShowAddVariantDialog(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Mapping
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            
            {selectedTreatment && editMode && (
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={updateVariantMutation.isPending}
                >
                  {updateVariantMutation.isPending && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
      
      {/* Dialog for confirmation */}
      <Dialog open={showAddVariantDialog} onOpenChange={setShowAddVariantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Treatment Mapping</DialogTitle>
            <DialogDescription>
              Create a mapping between this standard treatment and your clinic's offering.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              You're about to create a mapping for:
            </p>
            <div className="font-medium">{selectedTreatment}</div>
            
            <div className="mt-6">
              <p>
                This will allow patients to see your clinic's specific treatment 
                offering when they search for this treatment type.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddVariantDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVariant}>
              Create Mapping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};