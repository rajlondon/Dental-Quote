import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { PlusCircle, MinusCircle, Info, AlertCircle, Plane, Hotel, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

// Define TreatmentData structure
export interface TreatmentItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  priceGBP: number;
  priceUSD: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee?: string;
}

export interface TreatmentCategory {
  id: string;
  name: string;
  treatments: {
    id: string;
    name: string;
    priceGBP: number;
    priceUSD: number;
    guarantee?: string;
    notes?: string;
  }[];
}

// Treatment categories data
const TREATMENT_CATEGORIES: TreatmentCategory[] = [
  {
    id: 'implants',
    name: 'Dental Implants',
    treatments: [
      { 
        id: 'dental_implant_standard', 
        name: 'Dental Implant (Standard)', 
        priceGBP: 450, 
        priceUSD: 580,
        guarantee: '5-year',
        notes: 'Implant brand will be selected by the clinic based on quality, preference, and availability.'
      },
      { 
        id: 'dental_implant_premium', 
        name: 'Dental Implant (Premium)', 
        priceGBP: 650, 
        priceUSD: 840,
        guarantee: '10-year',
        notes: 'Premium brands like Straumann or Nobel Biocare.'
      },
      { 
        id: 'all_on_4_implants', 
        name: 'All-on-4 Implants', 
        priceGBP: 3800, 
        priceUSD: 4900,
        guarantee: '10-year' 
      },
      { 
        id: 'all_on_6_implants', 
        name: 'All-on-6 Implants', 
        priceGBP: 4500, 
        priceUSD: 5800,
        guarantee: '10-year' 
      },
    ],
  },
  {
    id: 'crowns_veneers',
    name: 'Veneers & Crowns',
    treatments: [
      { 
        id: 'porcelain_crown', 
        name: 'Porcelain Crown', 
        priceGBP: 180, 
        priceUSD: 230,
        guarantee: '3-year' 
      },
      { 
        id: 'zirconia_crown', 
        name: 'Zirconia Crown', 
        priceGBP: 240, 
        priceUSD: 310,
        guarantee: '5-year' 
      },
      { 
        id: 'emax_crown', 
        name: 'E-max Crown', 
        priceGBP: 260, 
        priceUSD: 340,
        guarantee: '5-year' 
      },
      { 
        id: 'porcelain_veneer', 
        name: 'Porcelain Veneer', 
        priceGBP: 190, 
        priceUSD: 245,
        guarantee: '3-year' 
      },
      { 
        id: 'emax_veneer', 
        name: 'E-max Veneer', 
        priceGBP: 250, 
        priceUSD: 320,
        guarantee: '5-year' 
      },
    ],
  },
  {
    id: 'whitening',
    name: 'Teeth Whitening',
    treatments: [
      { 
        id: 'zoom_whitening', 
        name: 'Zoom Whitening', 
        priceGBP: 220, 
        priceUSD: 280,
        guarantee: '1-year' 
      },
      { 
        id: 'laser_whitening', 
        name: 'Laser Whitening', 
        priceGBP: 260, 
        priceUSD: 335,
        guarantee: '1-year' 
      },
    ],
  },
  {
    id: 'dentures',
    name: 'Dentures & All-on-4',
    treatments: [
      { 
        id: 'partial_denture', 
        name: 'Partial Denture', 
        priceGBP: 280, 
        priceUSD: 360,
        guarantee: '2-year' 
      },
      { 
        id: 'full_denture', 
        name: 'Full Denture', 
        priceGBP: 380, 
        priceUSD: 490,
        guarantee: '3-year' 
      },
      { 
        id: 'flexible_denture', 
        name: 'Flexible Denture', 
        priceGBP: 450, 
        priceUSD: 580,
        guarantee: '3-year' 
      },
    ],
  },
  {
    id: 'full_mouth',
    name: 'Full Mouth Reconstruction',
    treatments: [
      { 
        id: 'full_smile_makeover', 
        name: 'Full Smile Makeover', 
        priceGBP: 2800, 
        priceUSD: 3600,
        guarantee: '5-year',
        notes: 'Includes comprehensive treatment plan with multiple procedures.'
      },
      { 
        id: 'hollywood_smile', 
        name: 'Hollywood Smile', 
        priceGBP: 3200, 
        priceUSD: 4100,
        guarantee: '5-year',
        notes: 'Premium full mouth transformation with the highest quality materials.'
      },
    ],
  },
  {
    id: 'general',
    name: 'General Dentistry',
    treatments: [
      { 
        id: 'dental_checkup_cleaning', 
        name: 'Dental Check-up & Cleaning', 
        priceGBP: 30, 
        priceUSD: 40,
        guarantee: 'N/A',
        notes: 'Comprehensive examination, professional cleaning, and preventative care advice.'
      },
      { 
        id: 'dental_xrays', 
        name: 'Dental X-rays (Panoramic)', 
        priceGBP: 0, 
        priceUSD: 0,
        guarantee: 'N/A',
        notes: 'Included FREE with consultation. Full-mouth panoramic X-ray for comprehensive diagnosis.'
      },
      { 
        id: 'tooth_fillings', 
        name: 'Tooth Fillings (Composite)', 
        priceGBP: 35, 
        priceUSD: 45,
        guarantee: '2-year',
        notes: 'High-quality composite (tooth-colored) fillings to repair cavities and tooth damage.'
      },
      { 
        id: 'teeth_whitening', 
        name: 'Professional Teeth Whitening', 
        priceGBP: 90, 
        priceUSD: 120,
        guarantee: '1-year',
        notes: 'In-office professional whitening treatment for a brighter, more confident smile.'
      },
      { 
        id: 'root_canal', 
        name: 'Root Canal Treatment', 
        priceGBP: 100, 
        priceUSD: 130,
        guarantee: '2-year',
        notes: 'Modern, minimally painful root canal therapy to save damaged teeth.'
      },
      { 
        id: 'tooth_extraction', 
        name: 'Tooth Extraction', 
        priceGBP: 40, 
        priceUSD: 55,
        guarantee: 'N/A',
        notes: 'Simple extraction of visible tooth. Surgical extractions may cost more.'
      },
    ],
  },
];

interface TreatmentPlanBuilderProps {
  initialTreatments?: TreatmentItem[];
  onTreatmentsChange?: (treatments: TreatmentItem[]) => void;
}

const TreatmentPlanBuilder: React.FC<TreatmentPlanBuilderProps> = ({ 
  initialTreatments = [], 
  onTreatmentsChange 
}) => {
  const [treatments, setTreatments] = useState<TreatmentItem[]>(initialTreatments);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // Calculate totals
  const totalGBP = treatments.reduce((sum, item) => sum + item.subtotalGBP, 0);
  const totalUSD = treatments.reduce((sum, item) => sum + item.subtotalUSD, 0);
  
  // Update parent component when treatments change
  useEffect(() => {
    if (onTreatmentsChange) {
      onTreatmentsChange(treatments);
    }
  }, [treatments, onTreatmentsChange]);
  
  // Get available treatments for the selected category
  const availableTreatments = TREATMENT_CATEGORIES.find(cat => cat.id === selectedCategory)?.treatments || [];
  
  // Get the selected treatment details
  const treatmentDetails = availableTreatments.find(t => t.id === selectedTreatment);
  
  const handleAddTreatment = () => {
    if (!selectedTreatment || !treatmentDetails) return;
    
    const subtotalGBP = treatmentDetails.priceGBP * quantity;
    const subtotalUSD = treatmentDetails.priceUSD * quantity;
    
    const newTreatment: TreatmentItem = {
      id: `${selectedTreatment}_${Date.now()}`, // Unique ID
      category: selectedCategory,
      name: treatmentDetails.name,
      quantity,
      priceGBP: treatmentDetails.priceGBP,
      priceUSD: treatmentDetails.priceUSD,
      subtotalGBP,
      subtotalUSD,
      guarantee: treatmentDetails.guarantee,
    };
    
    setTreatments([...treatments, newTreatment]);
    resetForm();
  };
  
  const handleRemoveTreatment = (id: string) => {
    setTreatments(treatments.filter(t => t.id !== id));
  };
  
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setTreatments(treatments.map(t => {
      if (t.id === id) {
        const subtotalGBP = t.priceGBP * newQuantity;
        const subtotalUSD = t.priceUSD * newQuantity;
        return { ...t, quantity: newQuantity, subtotalGBP, subtotalUSD };
      }
      return t;
    }));
  };
  
  const resetForm = () => {
    setSelectedCategory('');
    setSelectedTreatment('');
    setQuantity(1);
    setShowAddForm(false);
  };

  // Find treatment notes for display
  const getTreatmentNote = (categoryId: string, treatmentId: string) => {
    const category = TREATMENT_CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) return null;
    
    const treatment = category.treatments.find(t => t.id === treatmentId);
    return treatment?.notes;
  };
  
  // New direct add treatment without modal
  const handleDirectAddTreatment = (treatment: any, categoryId: string) => {
    // Check if treatment is already in the list
    const existingTreatment = treatments.find(
      t => t.name === treatment.name
    );
    
    if (existingTreatment) {
      // Increment quantity if already in list
      handleQuantityChange(existingTreatment.id, existingTreatment.quantity + 1);
      return;
    }
    
    // Add new treatment
    const newTreatment: TreatmentItem = {
      id: `${treatment.id}_${Date.now()}`, // Unique ID
      category: categoryId,
      name: treatment.name,
      quantity: 1,
      priceGBP: treatment.priceGBP,
      priceUSD: treatment.priceUSD,
      subtotalGBP: treatment.priceGBP,
      subtotalUSD: treatment.priceUSD,
      guarantee: treatment.guarantee,
    };
    
    setTreatments([...treatments, newTreatment]);
  };
  
  // Check if a treatment is already in the list
  const isTreatmentSelected = (treatmentName: string): boolean => {
    return treatments.some(t => t.name === treatmentName);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Build Your Treatment Plan</h2>
          <p className="text-gray-600 text-sm">Select treatments from the categories below</p>
        </div>
        
        <div className="flex items-center gap-3">
          {treatments.length > 0 && (
            <div className="bg-blue-50 px-3 py-2 rounded text-sm font-medium text-blue-700">
              {treatments.length} treatment{treatments.length !== 1 ? 's' : ''} added
            </div>
          )}
          
          {showAddForm ? (
            <Button variant="outline" onClick={resetForm} size="sm">
              Cancel
            </Button>
          ) : (
            <Button onClick={() => setShowAddForm(true)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Custom Treatment
            </Button>
          )}
        </div>
      </div>
      
      {/* Treatment Categories Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="implants" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-1 mb-6">
              <TabsTrigger value="implants" className="py-2">Dental Implants</TabsTrigger>
              <TabsTrigger value="crowns_veneers" className="py-2">Veneers & Crowns</TabsTrigger>
              <TabsTrigger value="root_canal" className="py-2">Root Canal</TabsTrigger>
              <TabsTrigger value="bone_graft" className="py-2">Bone Grafts</TabsTrigger>
              <TabsTrigger value="whitening" className="py-2">Teeth Whitening</TabsTrigger>
              <TabsTrigger value="full_mouth" className="py-2">Full Mouth Rehab</TabsTrigger>
              <TabsTrigger value="general" className="py-2">General Dentistry</TabsTrigger>
              <TabsTrigger value="other" className="py-2">Other Treatments</TabsTrigger>
            </TabsList>
            
            {/* Dental Implants Tab */}
            <TabsContent value="implants" className="border rounded-md p-4">
              <h3 className="font-semibold mb-3">Dental Implants</h3>
              <div className="space-y-3">
                {TREATMENT_CATEGORIES.find(cat => cat.id === 'implants')?.treatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id={treatment.id}
                        checked={isTreatmentSelected(treatment.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleDirectAddTreatment(treatment, 'implants');
                          } else {
                            const matchingTreatment = treatments.find(t => t.name === treatment.name);
                            if (matchingTreatment) {
                              handleRemoveTreatment(matchingTreatment.id);
                            }
                          }
                        }}
                      />
                      <div>
                        <label htmlFor={treatment.id} className="font-medium cursor-pointer text-gray-800">
                          {treatment.name}
                        </label>
                        <div className="flex items-center mt-1">
                          {treatment.guarantee && (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                              {treatment.guarantee} guarantee
                            </span>
                          )}
                          {treatment.notes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                                  <Info className="h-3 w-3 mr-1" />
                                  <span>Info</span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{treatment.notes}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">£{treatment.priceGBP}</div>
                      <div className="text-xs text-gray-500">${treatment.priceUSD}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Veneers & Crowns Tab */}
            <TabsContent value="crowns_veneers" className="border rounded-md p-4">
              <h3 className="font-semibold mb-3">Veneers & Crowns</h3>
              <div className="space-y-3">
                {TREATMENT_CATEGORIES.find(cat => cat.id === 'crowns_veneers')?.treatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id={treatment.id}
                        checked={isTreatmentSelected(treatment.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleDirectAddTreatment(treatment, 'crowns_veneers');
                          } else {
                            const matchingTreatment = treatments.find(t => t.name === treatment.name);
                            if (matchingTreatment) {
                              handleRemoveTreatment(matchingTreatment.id);
                            }
                          }
                        }}
                      />
                      <div>
                        <label htmlFor={treatment.id} className="font-medium cursor-pointer text-gray-800">
                          {treatment.name}
                        </label>
                        <div className="flex items-center mt-1">
                          {treatment.guarantee && (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                              {treatment.guarantee} guarantee
                            </span>
                          )}
                          {treatment.notes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                                  <Info className="h-3 w-3 mr-1" />
                                  <span>Info</span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{treatment.notes}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">£{treatment.priceGBP}</div>
                      <div className="text-xs text-gray-500">${treatment.priceUSD}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Teeth Whitening Tab */}
            <TabsContent value="whitening" className="border rounded-md p-4">
              <h3 className="font-semibold mb-3">Teeth Whitening</h3>
              <div className="space-y-3">
                {TREATMENT_CATEGORIES.find(cat => cat.id === 'whitening')?.treatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id={treatment.id}
                        checked={isTreatmentSelected(treatment.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleDirectAddTreatment(treatment, 'whitening');
                          } else {
                            const matchingTreatment = treatments.find(t => t.name === treatment.name);
                            if (matchingTreatment) {
                              handleRemoveTreatment(matchingTreatment.id);
                            }
                          }
                        }}
                      />
                      <div>
                        <label htmlFor={treatment.id} className="font-medium cursor-pointer text-gray-800">
                          {treatment.name}
                        </label>
                        <div className="flex items-center mt-1">
                          {treatment.guarantee && (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                              {treatment.guarantee} guarantee
                            </span>
                          )}
                          {treatment.notes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                                  <Info className="h-3 w-3 mr-1" />
                                  <span>Info</span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{treatment.notes}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">£{treatment.priceGBP}</div>
                      <div className="text-xs text-gray-500">${treatment.priceUSD}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Full Mouth Reconstruction Tab */}
            <TabsContent value="full_mouth" className="border rounded-md p-4">
              <h3 className="font-semibold mb-3">Full Mouth Reconstruction</h3>
              <div className="space-y-3">
                {TREATMENT_CATEGORIES.find(cat => cat.id === 'full_mouth')?.treatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id={treatment.id}
                        checked={isTreatmentSelected(treatment.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleDirectAddTreatment(treatment, 'full_mouth');
                          } else {
                            const matchingTreatment = treatments.find(t => t.name === treatment.name);
                            if (matchingTreatment) {
                              handleRemoveTreatment(matchingTreatment.id);
                            }
                          }
                        }}
                      />
                      <div>
                        <label htmlFor={treatment.id} className="font-medium cursor-pointer text-gray-800">
                          {treatment.name}
                        </label>
                        <div className="flex items-center mt-1">
                          {treatment.guarantee && (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                              {treatment.guarantee} guarantee
                            </span>
                          )}
                          {treatment.notes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                                  <Info className="h-3 w-3 mr-1" />
                                  <span>Info</span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{treatment.notes}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">£{treatment.priceGBP}</div>
                      <div className="text-xs text-gray-500">${treatment.priceUSD}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* General Dentistry Tab */}
            <TabsContent value="general" className="border rounded-md p-4">
              <h3 className="font-semibold mb-3">General Dentistry</h3>
              <div className="space-y-3">
                {TREATMENT_CATEGORIES.find(cat => cat.id === 'general')?.treatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id={treatment.id}
                        checked={isTreatmentSelected(treatment.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleDirectAddTreatment(treatment, 'general');
                          } else {
                            const matchingTreatment = treatments.find(t => t.name === treatment.name);
                            if (matchingTreatment) {
                              handleRemoveTreatment(matchingTreatment.id);
                            }
                          }
                        }}
                      />
                      <div>
                        <label htmlFor={treatment.id} className="font-medium cursor-pointer text-gray-800">
                          {treatment.name}
                        </label>
                        <div className="flex items-center mt-1">
                          {treatment.guarantee && treatment.guarantee !== 'N/A' && (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                              {treatment.guarantee} guarantee
                            </span>
                          )}
                          {treatment.notes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                                  <Info className="h-3 w-3 mr-1" />
                                  <span>Info</span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{treatment.notes}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {treatment.priceGBP === 0 ? 'FREE' : `£${treatment.priceGBP}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {treatment.priceUSD === 0 ? '' : `$${treatment.priceUSD}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Root Canal Tab */}
            <TabsContent value="root_canal" className="border rounded-md p-4">
              <h3 className="font-semibold mb-3">Root Canal Treatments</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="standard_root_canal"
                      checked={isTreatmentSelected("Standard Root Canal")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleDirectAddTreatment({
                            id: 'standard_root_canal',
                            name: 'Standard Root Canal',
                            priceGBP: 100,
                            priceUSD: 130,
                            guarantee: '2-year',
                            notes: 'Standard root canal treatment for single-rooted teeth'
                          }, 'root_canal');
                        } else {
                          const matchingTreatment = treatments.find(t => t.name === "Standard Root Canal");
                          if (matchingTreatment) {
                            handleRemoveTreatment(matchingTreatment.id);
                          }
                        }
                      }}
                    />
                    <div>
                      <label htmlFor="standard_root_canal" className="font-medium cursor-pointer text-gray-800">
                        Standard Root Canal
                      </label>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                          2-year guarantee
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                              <Info className="h-3 w-3 mr-1" />
                              <span>Info</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Standard root canal treatment for single-rooted teeth</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">£100</div>
                    <div className="text-xs text-gray-500">$130</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="complex_root_canal"
                      checked={isTreatmentSelected("Complex Root Canal")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleDirectAddTreatment({
                            id: 'complex_root_canal',
                            name: 'Complex Root Canal',
                            priceGBP: 180,
                            priceUSD: 230,
                            guarantee: '2-year',
                            notes: 'Complex root canal treatment for multi-rooted teeth'
                          }, 'root_canal');
                        } else {
                          const matchingTreatment = treatments.find(t => t.name === "Complex Root Canal");
                          if (matchingTreatment) {
                            handleRemoveTreatment(matchingTreatment.id);
                          }
                        }
                      }}
                    />
                    <div>
                      <label htmlFor="complex_root_canal" className="font-medium cursor-pointer text-gray-800">
                        Complex Root Canal
                      </label>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                          2-year guarantee
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                              <Info className="h-3 w-3 mr-1" />
                              <span>Info</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Complex root canal treatment for multi-rooted teeth</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">£180</div>
                    <div className="text-xs text-gray-500">$230</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Bone Graft Tab */}
            <TabsContent value="bone_graft" className="border rounded-md p-4">
              <h3 className="font-semibold mb-3">Bone Grafts</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="simple_bone_graft"
                      checked={isTreatmentSelected("Simple Bone Graft")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleDirectAddTreatment({
                            id: 'simple_bone_graft',
                            name: 'Simple Bone Graft',
                            priceGBP: 280,
                            priceUSD: 360,
                            guarantee: '5-year',
                            notes: 'Small-volume bone graft procedure for single tooth area'
                          }, 'bone_graft');
                        } else {
                          const matchingTreatment = treatments.find(t => t.name === "Simple Bone Graft");
                          if (matchingTreatment) {
                            handleRemoveTreatment(matchingTreatment.id);
                          }
                        }
                      }}
                    />
                    <div>
                      <label htmlFor="simple_bone_graft" className="font-medium cursor-pointer text-gray-800">
                        Simple Bone Graft
                      </label>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                          5-year guarantee
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                              <Info className="h-3 w-3 mr-1" />
                              <span>Info</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Small-volume bone graft procedure for single tooth area</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">£280</div>
                    <div className="text-xs text-gray-500">$360</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="complex_bone_graft"
                      checked={isTreatmentSelected("Complex Bone Graft")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleDirectAddTreatment({
                            id: 'complex_bone_graft',
                            name: 'Complex Bone Graft',
                            priceGBP: 450,
                            priceUSD: 580,
                            guarantee: '5-year',
                            notes: 'Large-volume or multiple area bone graft procedure'
                          }, 'bone_graft');
                        } else {
                          const matchingTreatment = treatments.find(t => t.name === "Complex Bone Graft");
                          if (matchingTreatment) {
                            handleRemoveTreatment(matchingTreatment.id);
                          }
                        }
                      }}
                    />
                    <div>
                      <label htmlFor="complex_bone_graft" className="font-medium cursor-pointer text-gray-800">
                        Complex Bone Graft
                      </label>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                          5-year guarantee
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                              <Info className="h-3 w-3 mr-1" />
                              <span>Info</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Large-volume or multiple area bone graft procedure</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">£450</div>
                    <div className="text-xs text-gray-500">$580</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="sinus_lift"
                      checked={isTreatmentSelected("Sinus Lift")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleDirectAddTreatment({
                            id: 'sinus_lift',
                            name: 'Sinus Lift',
                            priceGBP: 550,
                            priceUSD: 700,
                            guarantee: '5-year',
                            notes: 'Sinus lift procedure to increase bone volume in upper jaw'
                          }, 'bone_graft');
                        } else {
                          const matchingTreatment = treatments.find(t => t.name === "Sinus Lift");
                          if (matchingTreatment) {
                            handleRemoveTreatment(matchingTreatment.id);
                          }
                        }
                      }}
                    />
                    <div>
                      <label htmlFor="sinus_lift" className="font-medium cursor-pointer text-gray-800">
                        Sinus Lift
                      </label>
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2">
                          5-year guarantee
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="inline-flex items-center text-xs text-blue-600">
                              <Info className="h-3 w-3 mr-1" />
                              <span>Info</span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Sinus lift procedure to increase bone volume in upper jaw</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">£550</div>
                    <div className="text-xs text-gray-500">$700</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Other Treatments Tab */}
            <TabsContent value="other" className="border rounded-md p-4">
              <h3 className="font-semibold mb-3">Other Treatments</h3>
              <div className="py-4">
                <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full py-6 border-dashed">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Custom Treatment
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Estimated Cost Range (Right Side) */}
        <div className="md:col-span-1">
          <Card className="bg-gray-50 border">
            <div className="p-5">
              <h3 className="font-bold text-lg mb-4">Your Treatment Plan</h3>
              
              {/* Empty State */}
              {treatments.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-md">
                  <p className="text-gray-500 mb-2">No treatments added yet</p>
                  <p className="text-xs text-gray-500">Select treatments from the categories</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {treatments.map((treatment) => (
                      <div key={treatment.id} className="flex justify-between items-center p-2 bg-white rounded border">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-sm">{treatment.name}</span>
                            {treatment.quantity > 1 && (
                              <span className="ml-1 text-xs text-gray-500">x{treatment.quantity}</span>
                            )}
                          </div>
                          {treatment.guarantee && treatment.guarantee !== 'N/A' && (
                            <span className="text-xs text-gray-500">{treatment.guarantee} guarantee</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-3 text-sm font-medium">£{treatment.subtotalGBP}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-800"
                            onClick={() => handleRemoveTreatment(treatment.id)}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                
                  {/* Cost Summary */}
                  <div className="rounded-md bg-blue-50 p-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">Estimated Cost Range:</span>
                      <span className="font-bold">£{Math.round(totalGBP * 0.8)} - £{Math.round(totalGBP * 1.2)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-blue-100 pt-2 mt-2">
                      <span className="text-gray-700">Typical UK Equivalent:</span>
                      <span className="text-gray-500 line-through">£{Math.round(totalGBP * 2.5)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-blue-100 pt-2 mt-2">
                      <span className="text-green-600 font-medium">Potential Savings:</span>
                      <span className="text-green-600 font-semibold">Up to 60%</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-blue-100">
                      <p className="text-xs text-gray-500">
                        Based on Istanbul average treatment prices. We'll show you precise costs with your matched clinics in the following page.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Add Custom Treatment Form (Modal style) */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-md mt-6 border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Add a Custom Treatment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Category
              </label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedTreatment('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TREATMENT_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment
              </label>
              <Select
                value={selectedTreatment}
                onValueChange={setSelectedTreatment}
                disabled={!selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment" />
                </SelectTrigger>
                <SelectContent>
                  {availableTreatments.map((treatment) => (
                    <SelectItem key={treatment.id} value={treatment.id}>
                      {treatment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleAddTreatment}
                disabled={!selectedTreatment}
                className="w-full"
              >
                Add to Plan
              </Button>
            </div>
          </div>
          
          {treatmentDetails?.notes && (
            <Alert className="mt-2 bg-blue-50 text-blue-800 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {treatmentDetails.notes}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      {/* Treatment List */}
      {treatments.length > 0 && (
        <>
          <Table className="mb-4">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Treatment</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-center w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatments.map((treatment) => {
                const note = getTreatmentNote(treatment.category, treatment.id.split('_')[0] + '_' + treatment.id.split('_')[1]);
                
                return (
                  <TableRow key={treatment.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{treatment.name}</span>
                        {treatment.guarantee && (
                          <span className="block text-xs text-gray-500">
                            {treatment.guarantee} guarantee
                          </span>
                        )}
                        {note && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="inline-flex items-center text-xs text-blue-600 mt-1">
                                <Info className="h-3 w-3 mr-1" />
                                <span>See note</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{note}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleQuantityChange(treatment.id, treatment.quantity - 1)}
                          disabled={treatment.quantity <= 1}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span className="mx-2">{treatment.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleQuantityChange(treatment.id, treatment.quantity + 1)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <span className="font-medium">£{treatment.priceGBP}</span>
                        <span className="block text-xs text-gray-500">
                          ${treatment.priceUSD}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <span className="font-medium">£{treatment.subtotalGBP}</span>
                        <span className="block text-xs text-gray-500">
                          ${treatment.subtotalUSD}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => handleRemoveTreatment(treatment.id)}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full md:w-96 bg-blue-50 rounded-md p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Total Estimated Cost:</span>
                <span className="font-bold text-blue-700">£{totalGBP}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>USD Equivalent:</span>
                <span>${totalUSD}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Average UK Cost:</span>
                <span>£{Math.round(totalGBP * 2.5)}</span>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded mt-2 text-sm flex items-center">
                <span className="font-bold">You Save: £{Math.round(totalGBP * 2.5 - totalGBP)}</span>
                <span className="text-xs ml-2">({Math.round((1 - totalGBP/(totalGBP * 2.5)) * 100)}% vs UK prices)</span>
              </div>
              <div className="mt-4 text-xs text-gray-600">
                <p>This is your estimated treatment price based on your selections. Final pricing will be confirmed after consultation and review of your dental records.</p>
              </div>
              <div className="mt-4 flex flex-col">
                <Button className="w-full">
                  View Matching Clinics & Request Final Quote
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  We'll help you compare verified clinics and send your treatment plan to them for review.
                </p>
              </div>
                
              {/* Future Enhancements */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Add to your package</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center border border-gray-200 rounded-md p-3 cursor-pointer hover:bg-gray-50">
                    <div className="mr-2">
                      <Plane className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Add Flights</p>
                      <p className="text-xs text-gray-500">From £150 - £300 return</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-md p-3 cursor-pointer hover:bg-gray-50">
                    <div className="mr-2">
                      <Hotel className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Add Hotel Stay</p>
                      <p className="text-xs text-gray-500">From £40/night (4-star)</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                {/* AI Recommendation section removed as requested to avoid user confusion */}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TreatmentPlanBuilder;