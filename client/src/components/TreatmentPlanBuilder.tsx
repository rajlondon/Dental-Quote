import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MinusCircle, Info, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    name: 'Implants',
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
    name: 'Crowns & Veneers',
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
    name: 'Whitening',
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
    name: 'Dentures',
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
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Build Your Treatment Plan</h2>
        
        {showAddForm ? (
          <Button variant="outline" onClick={resetForm} size="sm">
            Cancel
          </Button>
        ) : (
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Treatment
          </Button>
        )}
      </div>
      
      {/* Add Treatment Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Add a Treatment</h3>
          
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
      
      {/* Empty State */}
      {treatments.length === 0 && !showAddForm && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-md">
          <p className="text-gray-500 mb-2">No treatments added yet</p>
          <Button onClick={() => setShowAddForm(true)} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Your First Treatment
          </Button>
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
                  View Matching Clinics
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Select a clinic to review, speak with directly, and confirm your treatment plan.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TreatmentPlanBuilder;