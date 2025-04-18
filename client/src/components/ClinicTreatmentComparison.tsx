import React, { useState, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Info 
} from "lucide-react";
import { 
  TreatmentMap, 
  Clinic, 
  ClinicFeature 
} from "../types/treatmentMapper";
import { 
  getUniqueCategories, 
  getTreatmentsByCategory, 
  compareTreatmentsBetweenClinics
} from "../utils/treatmentMapperUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ClinicTreatmentComparisonProps {
  treatmentMap: TreatmentMap;
  clinics: Clinic[];
  clinicFeatures?: ClinicFeature[];
  selectedTreatments?: string[];
  initialCategory?: string;
  onSelectTreatment?: (treatmentName: string) => void;
}

const ClinicTreatmentComparison: React.FC<ClinicTreatmentComparisonProps> = ({
  treatmentMap,
  clinics,
  clinicFeatures = [],
  selectedTreatments = [],
  initialCategory,
  onSelectTreatment,
}) => {
  // Get unique categories
  const categories = useMemo(() => getUniqueCategories(treatmentMap), [treatmentMap]);
  
  // Set the initial active category
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory && categories.includes(initialCategory) 
      ? initialCategory 
      : categories[0] || ""
  );
  
  // Get selected clinics for comparison (we'll use all available clinics for now)
  const selectedClinicIds = useMemo(() => clinics.map(clinic => clinic.id), [clinics]);
  
  // Get treatments in the active category
  const categoryTreatments = useMemo(
    () => getTreatmentsByCategory(treatmentMap, activeCategory),
    [treatmentMap, activeCategory]
  );
  
  // For expanded treatment details
  const [expandedTreatments, setExpandedTreatments] = useState<Record<string, boolean>>({});
  
  // Toggle expanded state for a treatment
  const toggleExpanded = (treatmentName: string) => {
    setExpandedTreatments(prev => ({
      ...prev,
      [treatmentName]: !prev[treatmentName]
    }));
  };
  
  // Comparison data for selected treatments
  const comparisonData = useMemo(() => {
    if (selectedTreatments.length === 0) return [];
    
    return compareTreatmentsBetweenClinics(
      treatmentMap,
      selectedTreatments,
      selectedClinicIds
    );
  }, [treatmentMap, selectedTreatments, selectedClinicIds]);
  
  // Feature comparison data
  const featureComparisonData = useMemo(() => {
    return clinicFeatures.map(feature => ({
      feature,
      clinicSupport: selectedClinicIds.map(clinicId => {
        const clinic = clinics.find(c => c.id === clinicId);
        return clinic?.features?.[feature.id] || false;
      })
    }));
  }, [clinics, selectedClinicIds, clinicFeatures]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Treatment Comparison</CardTitle>
        <CardDescription>
          Compare dental treatments across our partner clinics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="treatments" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="treatments">Treatment Options</TabsTrigger>
            <TabsTrigger value="comparison">Comparison {selectedTreatments.length > 0 && `(${selectedTreatments.length})`}</TabsTrigger>
          </TabsList>
          
          {/* Treatment Selection Tab */}
          <TabsContent value="treatments" className="space-y-4">
            {/* Category Selection */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {/* Treatment List */}
            <div className="space-y-2">
              {categoryTreatments.map(([treatmentName]) => {
                const isSelected = selectedTreatments.includes(treatmentName);
                
                return (
                  <div key={treatmentName} className="border rounded-md">
                    <div className="flex items-center justify-between p-3">
                      <div>
                        <h3 className="font-medium">{treatmentName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Available at {clinics.filter(clinic => 
                            treatmentMap[treatmentName]?.clinic_variants.some(v => v.clinic_id === clinic.id)
                          ).length} clinics
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => onSelectTreatment?.(treatmentName)}
                        >
                          {isSelected ? 'Selected' : 'Compare'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(treatmentName)}
                        >
                          {expandedTreatments[treatmentName] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Expanded Treatment Details */}
                    {expandedTreatments[treatmentName] && (
                      <div className="px-3 pb-3 pt-0">
                        <Separator className="my-2" />
                        <div className="space-y-3">
                          {treatmentMap[treatmentName]?.clinic_variants.map((variant, idx) => {
                            // Find the clinic for this variant
                            const clinic = clinics.find(c => c.id === variant.clinic_id);
                            
                            return (
                              <div key={`${variant.clinic_id}-${idx}`} className="bg-muted/50 p-3 rounded-md">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{clinic?.name || variant.clinic_id}</span>
                                  <Badge variant="outline">{variant.price}</Badge>
                                </div>
                                <p className="text-sm mb-2">{variant.label}</p>
                                
                                {/* Included Items */}
                                {variant.includes && variant.includes.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs text-muted-foreground mb-1 block">Includes:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {variant.includes.map(item => (
                                        <Badge key={item} variant="secondary" className="text-xs">
                                          <Check className="h-3 w-3 mr-1" />
                                          {item}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Optional Add-ons */}
                                {variant.optional_addons && variant.optional_addons.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs text-muted-foreground mb-1 block">Optional add-ons:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {variant.optional_addons.map(item => (
                                        <Badge key={item} variant="outline" className="text-xs">
                                          <Plus className="h-3 w-3 mr-1" />
                                          {item}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Notes */}
                                {variant.note && (
                                  <div className="mt-2 text-xs italic text-muted-foreground">
                                    Note: {variant.note}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {categoryTreatments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No treatments found in this category
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Comparison Tab */}
          <TabsContent value="comparison">
            {selectedTreatments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Select treatments to compare across clinics
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const element = document.querySelector('[data-value="treatments"]') as HTMLElement;
                    if (element) element.click();
                  }}
                >
                  Choose Treatments
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Treatments Comparison Table */}
                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="p-3 text-left font-medium">Treatment</th>
                          {clinics.map(clinic => (
                            <th key={clinic.id} className="p-3 text-left font-medium">
                              {clinic.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.map(({ treatmentName, clinicVariants }) => (
                          <tr key={treatmentName} className="border-t">
                            <td className="p-3 font-medium">{treatmentName}</td>
                            {clinicVariants.map((variant, idx) => (
                              <td key={idx} className="p-3">
                                {variant ? (
                                  <Collapsible>
                                    <div className="flex flex-col">
                                      <div className="flex justify-between items-center">
                                        <Badge variant="outline">{variant.price}</Badge>
                                        <CollapsibleTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <Info className="h-4 w-4" />
                                          </Button>
                                        </CollapsibleTrigger>
                                      </div>
                                      <CollapsibleContent>
                                        <div className="mt-2 space-y-2">
                                          <p className="text-sm">{variant.label}</p>
                                          
                                          {/* Included Items */}
                                          <div className="text-xs">
                                            <span className="text-muted-foreground">Includes:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {variant.includes.map(item => (
                                                <Badge key={item} variant="secondary" className="text-xs">
                                                  {item}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                          
                                          {/* Optional Add-ons */}
                                          {variant.optional_addons && variant.optional_addons.length > 0 && (
                                            <div className="text-xs">
                                              <span className="text-muted-foreground">Add-ons:</span>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {variant.optional_addons.map(item => (
                                                  <Badge key={item} variant="outline" className="text-xs">
                                                    {item}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* Notes */}
                                          {variant.note && (
                                            <p className="text-xs italic text-muted-foreground">
                                              {variant.note}
                                            </p>
                                          )}
                                        </div>
                                      </CollapsibleContent>
                                    </div>
                                  </Collapsible>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Not available</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Features Comparison Table */}
                <div className="border rounded-md overflow-hidden">
                  <div className="p-3 border-b bg-muted/50">
                    <h3 className="font-medium">Clinic Features</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="p-3 text-left font-medium">Feature</th>
                          {clinics.map(clinic => (
                            <th key={clinic.id} className="p-3 text-left font-medium">
                              {clinic.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {featureComparisonData.map(({ feature, clinicSupport }) => (
                          <tr key={feature.id} className="border-t">
                            <td className="p-3">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="flex items-center gap-1 text-left">
                                    <span>{feature.name}</span>
                                    <Info className="h-3 w-3 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{feature.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                            {clinicSupport.map((supported, idx) => (
                              <td key={idx} className="p-3">
                                {supported ? (
                                  <Check className="h-5 w-5 text-primary" />
                                ) : (
                                  <X className="h-5 w-5 text-muted-foreground/50" />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const element = document.querySelector('[data-value="treatments"]') as HTMLElement;
                      if (element) element.click();
                    }}
                  >
                    Edit Selection
                  </Button>
                  <Button>
                    Request Treatment Quote
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ClinicTreatmentComparison;