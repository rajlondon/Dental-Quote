import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { PlusCircle, MinusCircle, Info, AlertCircle, Plane, Hotel, Sparkles, Check, ChevronDown, ChevronUp, ArrowRight, BadgePercent, Tag } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useSpecialOfferTracking } from '@/hooks/use-special-offer-tracking';

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
  ukPriceGBP?: number;
  ukPriceUSD?: number;
  isPackage?: boolean;
  isSpecialOffer?: boolean; // Flag to easily identify special offers
  packageId?: string;
  // For promo token integration
  promoToken?: string;
  promoType?: 'special_offer' | 'package';
  specialOffer?: {
    id: string;
    title: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    clinicId: string;
  };
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
        priceGBP: 875, 
        priceUSD: 1120,
        guarantee: '5-year',
        notes: 'Actual prices vary based on materials used and clinic quality. Final quotes will be confirmed after your dental records are reviewed.'
      },
      { 
        id: 'dental_implant_premium', 
        name: 'Dental Implant (Premium)', 
        priceGBP: 3000, 
        priceUSD: 3850,
        guarantee: '10-year',
        notes: 'for premium brands like Straumann or Nobel Biocare. Clinic prices vary based on materials used.'
      },
      { 
        id: 'all_on_4_implants', 
        name: 'All-on-4 Implants (Full Arch)', 
        priceGBP: 12000, 
        priceUSD: 15400,
        guarantee: '10-year',
        notes: ' Includes 4 implants and a full arch restoration. Clinic prices vary based on materials used.'
      },
      { 
        id: 'all_on_6_implants', 
        name: 'All-on-6 Implants (Full Arch)', 
        priceGBP: 14000, 
        priceUSD: 18000,
        guarantee: '10-year',
        notes: ' Includes 6 implants and a full arch restoration, providing additional support and stability, particularly in the upper jaw.'
      },
      { 
        id: 'bone_graft', 
        name: 'Bone Graft (Per Site)', 
        priceGBP: 650, 
        priceUSD: 835,
        guarantee: 'N/A',
        notes: ' May be required if your jaw bone lacks sufficient volume to support implants.'
      },
      { 
        id: 'sinus_lift', 
        name: 'Sinus Lift', 
        priceGBP: 900, 
        priceUSD: 1160,
        guarantee: 'N/A',
        notes: ' May be needed for upper jaw implants when there is insufficient bone height.'
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
        priceGBP: 650, 
        priceUSD: 835,
        guarantee: '3-year',
        notes: ' Clinic prices vary based on materials used and specifications.'
      },
      { 
        id: 'zirconia_crown', 
        name: 'Zirconia Crown', 
        priceGBP: 850, 
        priceUSD: 1100,
        guarantee: '5-year',
        notes: ' More durable than porcelain crowns and highly aesthetic.'
      },
      { 
        id: 'porcelain_veneer', 
        name: 'Porcelain Veneer', 
        priceGBP: 600, 
        priceUSD: 770,
        guarantee: '3-year',
        notes: ' Thin shells bonded to the front surface of teeth to improve appearance.'
      },
      { 
        id: 'composite_veneer', 
        name: 'Composite Veneer', 
        priceGBP: 350, 
        priceUSD: 450,
        guarantee: '2-year',
        notes: ' A more affordable alternative to porcelain veneers.'
      },
      { 
        id: 'inlay_onlay', 
        name: 'Inlay/Onlay', 
        priceGBP: 450, 
        priceUSD: 580,
        guarantee: '5-year',
        notes: ' Used when a tooth is too damaged for a filling but not enough for a crown.'
      },
    ],
  },
  {
    id: 'whitening',
    name: 'Teeth Whitening',
    treatments: [
      { 
        id: 'zoom_whitening', 
        name: 'Zoom Whitening (In-office)', 
        priceGBP: 450, 
        priceUSD: 580,
        guarantee: '1-year',
        notes: ' Professional whitening treatment that uses light-activated technology.'
      },
      { 
        id: 'laser_whitening', 
        name: 'Laser Whitening', 
        priceGBP: 550, 
        priceUSD: 710,
        guarantee: '1-year',
        notes: ' Uses laser light to activate the whitening solution for faster results.'
      },
      { 
        id: 'home_whitening_kit', 
        name: 'Professional Home Whitening Kit', 
        priceGBP: 250, 
        priceUSD: 320,
        guarantee: '1-year',
        notes: ' Custom-made trays with professional whitening gel for home use.'
      },
    ],
  },
  {
    id: 'full_mouth',
    name: 'Full Mouth Rehab',
    treatments: [
      { 
        id: 'full_smile_makeover', 
        name: 'Full Smile Makeover', 
        priceGBP: 8000, 
        priceUSD: 10300,
        guarantee: '5-year',
        notes: ' Comprehensive treatment plan combining multiple procedures for a complete smile transformation.'
      },
      { 
        id: 'hollywood_smile', 
        name: 'Hollywood Smile (8-10 Veneers)', 
        priceGBP: 5500, 
        priceUSD: 7100,
        guarantee: '5-year',
        notes: ' Premium full mouth transformation with high-quality veneers or crowns.'
      },
      { 
        id: 'full_mouth_restoration', 
        name: 'Full Mouth Restoration', 
        priceGBP: 12000, 
        priceUSD: 15400,
        guarantee: '5-year',
        notes: ' Complete restoration of all teeth to restore function and aesthetics.'
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
        priceGBP: 80, 
        priceUSD: 100,
        guarantee: 'N/A',
        notes: ' Comprehensive examination, professional cleaning, and preventative care advice.'
      },
      { 
        id: 'tooth_fillings', 
        name: 'Tooth Fillings (Composite)', 
        priceGBP: 120, 
        priceUSD: 155,
        guarantee: '2-year',
        notes: ' High-quality composite (tooth-colored) fillings to repair cavities and tooth damage.'
      },
      { 
        id: 'root_canal', 
        name: 'Root Canal Treatment', 
        priceGBP: 500, 
        priceUSD: 645,
        guarantee: '2-year',
        notes: ' Modern, minimally painful root canal therapy to save damaged teeth.'
      },
      { 
        id: 'tooth_extraction', 
        name: 'Tooth Extraction', 
        priceGBP: 150, 
        priceUSD: 195,
        guarantee: 'N/A',
        notes: ' Simple extraction of visible tooth. Surgical extractions may cost more.'
      },
      { 
        id: 'dental_bridge', 
        name: 'Dental Bridge (3-unit)', 
        priceGBP: 1500, 
        priceUSD: 1930,
        guarantee: '5-year',
        notes: ' Fixed prosthetic device to replace missing teeth by joining artificial teeth to adjacent natural teeth.'
      },
    ],
  },
  {
    id: 'other',
    name: 'Other Treatments',
    treatments: [
      { 
        id: 'orthodontics_invisalign', 
        name: 'Invisalign Treatment', 
        priceGBP: 4000, 
        priceUSD: 5150,
        guarantee: '1-year',
        notes: ' Clear aligner system to straighten teeth without traditional braces.'
      },
      { 
        id: 'orthodontics_braces', 
        name: 'Traditional Braces', 
        priceGBP: 3000, 
        priceUSD: 3850,
        guarantee: '1-year',
        notes: ' Metal or ceramic brackets bonded to teeth to correct alignment.'
      },
      { 
        id: 'gum_treatment', 
        name: 'Periodontal (Gum) Treatment', 
        priceGBP: 400, 
        priceUSD: 515,
        guarantee: 'N/A',
        notes: ' Specialized treatment for gum disease, including deep cleaning and medication.'
      },
      { 
        id: 'night_guard', 
        name: 'Night Guard/Splint', 
        priceGBP: 250, 
        priceUSD: 320,
        guarantee: '1-year',
        notes: ' Custom-made device to prevent teeth grinding during sleep.'
      },
    ],
  },
];

interface TreatmentPlanBuilderProps {
  initialTreatments?: TreatmentItem[];
  onTreatmentsChange?: (treatments: TreatmentItem[]) => void;
  hideHeader?: boolean; // Add option to hide the "Build Your Treatment Plan" header
}

const TreatmentPlanBuilder: React.FC<TreatmentPlanBuilderProps> = ({ 
  initialTreatments = [], 
  onTreatmentsChange,
  hideHeader = false
}) => {
  const [treatments, setTreatments] = useState<TreatmentItem[]>(initialTreatments);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // Get the active special offer if there is one
  const { 
    specialOffer, 
    hasActiveOffer, 
    isSpecialOfferFlow,
    applySpecialOfferToTreatments
  } = useSpecialOfferTracking();
  
  // Calculate totals
  const totalGBP = treatments.reduce((sum, item) => sum + item.subtotalGBP, 0);
  const totalUSD = treatments.reduce((sum, item) => sum + item.subtotalUSD, 0);
  
  // Apply special offers to treatments whenever the treatment list or special offer changes
  useEffect(() => {
    if (hasActiveOffer && treatments.length > 0) {
      // Apply special offer discounts to eligible treatments
      const updatedTreatments = applySpecialOfferToTreatments(treatments);
      if (JSON.stringify(updatedTreatments) !== JSON.stringify(treatments)) {
        setTreatments(updatedTreatments);
      }
    }
  }, [hasActiveOffer, specialOffer, treatments, applySpecialOfferToTreatments]);

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
    
    // Calculate Istanbul prices (35% of UK costs)
    const istanbulPriceGBP = Math.round(treatmentDetails.priceGBP * 0.35);
    const istanbulPriceUSD = Math.round(treatmentDetails.priceUSD * 0.35);
    const subtotalGBP = istanbulPriceGBP * quantity;
    const subtotalUSD = istanbulPriceUSD * quantity;
    
    const newTreatment: TreatmentItem = {
      id: `${selectedTreatment}_${Date.now()}`, // Unique ID
      category: selectedCategory,
      name: treatmentDetails.name,
      quantity,
      priceGBP: istanbulPriceGBP,
      priceUSD: istanbulPriceUSD,
      subtotalGBP,
      subtotalUSD,
      guarantee: treatmentDetails.guarantee,
      ukPriceGBP: treatmentDetails.priceGBP, // Store original UK price for comparison
      ukPriceUSD: treatmentDetails.priceUSD,
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
  
  // Add a special offer treatment
  const addSpecialOfferTreatment = (treatmentName: string, specialOffer: any) => {
    // Find the base treatment in our categories
    let baseTreatment: any = null;
    let baseCategory: string = '';
    
    // Search through all categories to find the treatment
    for (const category of TREATMENT_CATEGORIES) {
      const found = category.treatments.find(t => 
        t.name.toLowerCase().includes(treatmentName.toLowerCase()) ||
        treatmentName.toLowerCase().includes(t.name.toLowerCase())
      );
      
      if (found) {
        baseTreatment = found;
        baseCategory = category.id;
        break;
      }
    }
    
    // If no matching treatment found, use a default
    if (!baseTreatment) {
      baseTreatment = {
        id: 'special_offer_default',
        name: treatmentName || 'Special Offer Treatment',
        priceGBP: 1000,
        priceUSD: 1280,
        guarantee: '2-year',
      };
      baseCategory = 'other';
    }
    
    // Calculate price with discount
    let priceGBP = Math.round(baseTreatment.priceGBP * 0.35); // Standard Istanbul pricing
    let priceUSD = Math.round(baseTreatment.priceUSD * 0.35);
    
    // Apply discount
    if (specialOffer.discountType === 'percentage') {
      const discountMultiplier = (100 - specialOffer.discountValue) / 100;
      priceGBP = Math.round(priceGBP * discountMultiplier);
      priceUSD = Math.round(priceUSD * discountMultiplier);
    } else if (specialOffer.discountType === 'fixed_amount') {
      priceGBP = Math.max(0, priceGBP - specialOffer.discountValue);
      priceUSD = Math.max(0, priceUSD - Math.round(specialOffer.discountValue * 1.28)); // Convert to USD
    }
    
    // Create treatment item
    const newTreatment: TreatmentItem = {
      id: `special_offer_${Date.now()}`,
      category: baseCategory,
      name: `${baseTreatment.name} (Special Offer)`,
      quantity: 1,
      priceGBP,
      priceUSD,
      subtotalGBP: priceGBP,
      subtotalUSD: priceUSD,
      guarantee: baseTreatment.guarantee,
      ukPriceGBP: baseTreatment.priceGBP,
      ukPriceUSD: baseTreatment.priceUSD,
      isSpecialOffer: true,
      specialOffer: {
        id: specialOffer.id,
        title: specialOffer.title,
        discountType: specialOffer.discountType,
        discountValue: specialOffer.discountValue,
        clinicId: specialOffer.clinicId
      }
    };
    
    // Add to treatments list
    setTreatments([...treatments, newTreatment]);
    
    return newTreatment;
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
    
    // Calculate Istanbul prices (35% of UK costs)
    const istanbulPriceGBP = Math.round(treatment.priceGBP * 0.35);
    const istanbulPriceUSD = Math.round(treatment.priceUSD * 0.35);
    
    // Create basic treatment object
    const treatmentItem: TreatmentItem = {
      id: `${treatment.id}_${Date.now()}`, // Unique ID
      category: categoryId,
      name: treatment.name,
      quantity: 1,
      priceGBP: istanbulPriceGBP,
      priceUSD: istanbulPriceUSD,
      subtotalGBP: istanbulPriceGBP,
      subtotalUSD: istanbulPriceUSD,
      guarantee: treatment.guarantee,
      ukPriceGBP: treatment.priceGBP, // Store original UK price for comparison
      ukPriceUSD: treatment.priceUSD,
    };
    
    // Process special offers if available
    if (hasActiveOffer && specialOffer) {
      // Apply any special offers to the treatment
      const treatedItems = applySpecialOfferToTreatments([treatmentItem]);
      
      // Add the (potentially modified) treatment to the list
      setTreatments([...treatments, treatedItems[0]]);
      return;
    }
    
    // If no special offer, just add the treatment as is
    setTreatments([...treatments, treatmentItem]);
  };
  
  // Check if a treatment is already in the list
  const isTreatmentSelected = (treatmentName: string): boolean => {
    return treatments.some(t => t.name === treatmentName);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      {!hideHeader && (
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
                Add Special Treatment
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Treatment Categories Tabs */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <Tabs defaultValue="implants" className="w-full">
            {/* Improved mobile-friendly with scrollable design */}
            <div className="overflow-x-auto pb-2 mb-3 -mx-1 px-1">
              <TabsList className="flex flex-nowrap md:grid md:grid-cols-6 w-max min-w-full h-auto p-1 mb-2">
                <TabsTrigger value="implants" className="py-2 px-4 text-sm whitespace-nowrap flex-shrink-0">Implants</TabsTrigger>
                <TabsTrigger value="crowns_veneers" className="py-2 px-4 text-sm whitespace-nowrap flex-shrink-0">Veneers & Crowns</TabsTrigger>
                <TabsTrigger value="full_mouth" className="py-2 px-4 text-sm whitespace-nowrap flex-shrink-0">Full Mouth</TabsTrigger>
                <TabsTrigger value="general" className="py-2 px-4 text-sm whitespace-nowrap flex-shrink-0">General</TabsTrigger>
                <TabsTrigger value="whitening" className="py-2 px-4 text-sm whitespace-nowrap flex-shrink-0">Whitening</TabsTrigger>
                <TabsTrigger value="other" className="py-2 px-4 text-sm whitespace-nowrap flex-shrink-0">Other</TabsTrigger>
              </TabsList>
            </div>
            
            {/* Implants Tab */}
            <TabsContent value="implants" className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Implants</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-blue-600 text-sm cursor-help">
                        <Info className="h-4 w-4 mr-1" />
                        <span>Estimated Istanbul Prices</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>These are average prices in Istanbul. Your final treatment quote will be confirmed by your chosen clinic after reviewing your dental information. Payment is only made in-person after consultation.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-3">
                {TREATMENT_CATEGORIES.find(cat => cat.id === 'implants')?.treatments.map((treatment) => (
                  <div key={treatment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
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
                      </div>
                      <div>
                        <label htmlFor={treatment.id} className="font-medium cursor-pointer text-gray-800">
                          {treatment.name}
                        </label>
                        <div className="flex flex-wrap items-center mt-1">
                          {treatment.guarantee && treatment.guarantee !== 'N/A' && (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded mr-2 mb-1">
                              {treatment.guarantee} guarantee
                            </span>
                          )}
                          {treatment.notes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="inline-flex items-center text-xs text-blue-600 mb-1">
                                  <Info className="h-3 w-3" />
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
                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                      <Badge variant="outline" className="font-medium text-sm">
                        Istanbul: £{Math.round(treatment.priceGBP * 0.35).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Veneers & Crowns Tab */}
            <TabsContent value="crowns_veneers" className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Veneers & Crowns</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-blue-600 text-sm cursor-help">
                        <Info className="h-4 w-4 mr-1" />
                        <span>Estimated Istanbul Prices</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>These are average prices in Istanbul. Your final treatment quote will be confirmed by your chosen clinic after reviewing your dental information. Payment is only made in-person after consultation.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-3">
                {TREATMENT_CATEGORIES.find(cat => cat.id === 'crowns_veneers')?.treatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
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
                      </div>
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
                                  <Info className="h-3 w-3" />
                                  
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
                      <Badge variant="outline" className="font-medium text-sm">
                        Estimated Istanbul Price: £{Math.round(treatment.priceGBP * 0.35).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Teeth Whitening Tab */}
            <TabsContent value="whitening" className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Teeth Whitening</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-blue-600 text-sm cursor-help">
                        <Info className="h-4 w-4 mr-1" />
                        <span>Estimated Istanbul Prices</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>These are average prices in Istanbul. Your final treatment quote will be confirmed by your chosen clinic after reviewing your dental information. Payment is only made in-person after consultation.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-3">
                {TREATMENT_CATEGORIES.find(cat => cat.id === 'whitening')?.treatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
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
                      </div>
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
                                  <Info className="h-3 w-3" />
                                  
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
                      <Badge variant="outline" className="font-medium text-sm">
                        Estimated Istanbul Price: £{Math.round(treatment.priceGBP * 0.35).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Full Mouth Rehab Tab */}
            <TabsContent value="full_mouth" className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Full Mouth Rehabilitation</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-blue-600 text-sm cursor-help">
                        <Info className="h-4 w-4 mr-1" />
                        <span>Estimated Istanbul Prices</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>These are average prices in Istanbul. Your final treatment quote will be confirmed by your chosen clinic after reviewing your dental information. Payment is only made in-person after consultation.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-3">
                {TREATMENT_CATEGORIES.find(cat => cat.id === 'full_mouth')?.treatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
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
                      </div>
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
                                  <Info className="h-3 w-3" />
                                  
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
                      <Badge variant="outline" className="font-medium text-sm">
                        Estimated Istanbul Price: £{Math.round(treatment.priceGBP * 0.35).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* General Dentistry Tab */}
            <TabsContent value="general" className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">General Dentistry</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-blue-600 text-sm cursor-help">
                        <Info className="h-4 w-4 mr-1" />
                        <span>Estimated Istanbul Prices</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>These are average prices in Istanbul. Your final treatment quote will be confirmed by your chosen clinic after reviewing your dental information. Payment is only made in-person after consultation.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-3">
                {TREATMENT_CATEGORIES.find(cat => cat.id === 'general')?.treatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
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
                      </div>
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
                                  <Info className="h-3 w-3" />
                                  
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
                      <Badge variant="outline" className="font-medium text-sm">
                        Estimated Istanbul Price: £{Math.round(treatment.priceGBP * 0.35).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Other Treatments Tab */}
            <TabsContent value="other" className="border rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Other Treatments</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-blue-600 text-sm cursor-help">
                        <Info className="h-4 w-4 mr-1" />
                        <span>Estimated Istanbul Prices</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>These are average prices in Istanbul. Your final treatment quote will be confirmed by your chosen clinic after reviewing your dental information. Payment is only made in-person after consultation.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="space-y-3">
                {TREATMENT_CATEGORIES.find(cat => cat.id === 'other')?.treatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        <Checkbox 
                          id={treatment.id}
                          checked={isTreatmentSelected(treatment.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleDirectAddTreatment(treatment, 'other');
                            } else {
                              const matchingTreatment = treatments.find(t => t.name === treatment.name);
                              if (matchingTreatment) {
                                handleRemoveTreatment(matchingTreatment.id);
                              }
                            }
                          }}
                        />
                      </div>
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
                                  <Info className="h-3 w-3" />
                                  
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
                      <Badge variant="outline" className="font-medium text-sm">
                        Estimated Istanbul Price: £{Math.round(treatment.priceGBP * 0.35).toLocaleString()}
                      </Badge>
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
                                  <Info className="h-3 w-3" />
                                  
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
                      <Badge variant="outline" className="font-normal">
                        Price varies by clinic
                      </Badge>
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
                                  <Info className="h-3 w-3" />
                                  
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
                      <Badge variant="outline" className="font-normal">
                        Price varies by clinic
                      </Badge>
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
                                  <Info className="h-3 w-3" />
                                  
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
                      <Badge variant="outline" className="font-normal">
                        Price varies by clinic
                      </Badge>
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
                                  <Info className="h-3 w-3" />
                                  
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
                      {treatment.priceGBP === 0 ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">FREE</Badge>
                      ) : (
                        <Badge variant="outline" className="font-normal">
                          Price varies by clinic
                        </Badge>
                      )}
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
                              <Info className="h-3 w-3" />
                              
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
                    <Badge variant="outline" className="font-normal">
                      Price varies by clinic
                    </Badge>
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
                              <Info className="h-3 w-3" />
                              
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
                    <Badge variant="outline" className="font-normal">
                      Price varies by clinic
                    </Badge>
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
                              <Info className="h-3 w-3" />
                              
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
                    <Badge variant="outline" className="font-normal">
                      Price varies by clinic
                    </Badge>
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
                              <Info className="h-3 w-3" />
                              
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
                    <Badge variant="outline" className="font-normal">
                      Price varies by clinic
                    </Badge>
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
                              <Info className="h-3 w-3" />
                              
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
                    <Badge variant="outline" className="font-normal">
                      Price varies by clinic
                    </Badge>
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
                  Add Special Treatment
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
      
      {/* Add Special Treatment Form (Modal style) */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-md mt-6 border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Add a Special Treatment</h3>
          
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
                  <TableRow key={treatment.id} className={(treatment.isSpecialOffer || treatment.specialOffer) ? 'bg-primary/5 border-primary/20' : treatment.isPackage ? 'bg-blue-50 border-blue-200' : ''}>
                    <TableCell>
                      <div>
                        {(treatment.isSpecialOffer || treatment.specialOffer) && (
                          <div className="relative mb-2">
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/15 flex items-center w-fit px-2 py-0.5 border border-primary/20">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Special Offer
                            </Badge>
                            <div className="absolute h-6 w-6 -right-1 -top-1 animate-pulse">
                              <div className="absolute inset-0 rounded-full bg-primary/20 transform scale-75 animate-ping"></div>
                              <div className="absolute inset-0 rounded-full bg-primary/10"></div>
                            </div>
                          </div>
                        )}
                        {treatment.isPackage && (
                          <div className="relative mb-2">
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center w-fit px-2 py-0.5 border border-blue-200">
                              <Check className="h-3 w-3 mr-1" />
                              Treatment Package
                            </Badge>
                          </div>
                        )}
                        <span className={`font-medium ${(treatment.isSpecialOffer || treatment.specialOffer) ? 'text-primary' : treatment.isPackage ? 'text-blue-700' : ''}`}>
                          {treatment.name}
                        </span>
                        {treatment.specialOffer && (
                          <div className="flex items-center mt-1 gap-2">
                            <span className="text-xs text-primary font-medium">
                              {treatment.specialOffer.title}
                            </span>
                            <Badge variant="outline" className="h-4 text-[10px] px-1.5 bg-primary/5 border-primary/20 text-primary">
                              {treatment.specialOffer.discountType === 'percentage' ? 
                                `${treatment.specialOffer.discountValue}% OFF` : 
                                `£${treatment.specialOffer.discountValue} OFF`}
                            </Badge>
                          </div>
                        )}
                        {treatment.guarantee && (
                          <span className="block text-xs text-gray-500">
                            {treatment.guarantee} guarantee
                          </span>
                        )}
                        {note && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="inline-flex items-center text-xs text-blue-600 mt-1">
                                <Info className="h-3 w-3" />
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
                        {treatment.specialOffer ? (
                          <>
                            <div className="flex items-center justify-end gap-2">
                              <span className="line-through text-sm text-gray-500">
                                £{Math.round(treatment.priceGBP * (100 / (100 - (treatment.specialOffer.discountType === 'percentage' ? treatment.specialOffer.discountValue : 0))))}
                              </span>
                              <span className="font-bold text-primary">£{treatment.priceGBP}</span>
                            </div>
                            <span className="block text-xs text-gray-500">
                              ${treatment.priceUSD}
                            </span>
                            <div className="flex justify-end items-center mt-1">
                              <Badge className="text-xs h-5 bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20">
                                {treatment.specialOffer.discountType === 'percentage' 
                                  ? `Save ${treatment.specialOffer.discountValue}%` 
                                  : `Save £${treatment.specialOffer.discountValue}`}
                              </Badge>
                            </div>
                          </>
                        ) : treatment.isSpecialOffer ? (
                          <>
                            <span className="font-bold text-primary">£{treatment.priceGBP}</span>
                            <span className="block text-xs text-gray-500">
                              ${treatment.priceUSD}
                            </span>
                            <div className="flex justify-end items-center mt-1">
                              <Badge className="text-xs h-5 bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20">
                                Special Offer
                              </Badge>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="font-medium">£{treatment.priceGBP}</span>
                            <span className="block text-xs text-gray-500">
                              ${treatment.priceUSD}
                            </span>
                            {treatment.ukPriceGBP && (
                              <span className="block text-xs text-green-600">
                                (UK: £{treatment.ukPriceGBP})
                              </span>
                            )}
                          </>
                        )}
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
                <span className="text-gray-700">Your Istanbul Price:</span>
                <span className="font-bold text-blue-700">£{Math.round(totalGBP)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>USD Equivalent:</span>
                <span>${Math.round(totalUSD)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Equivalent UK Cost:</span>
                <span>£{Math.round(totalGBP / 0.35)}</span>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-2 rounded mt-2 text-sm flex items-center">
                <span className="font-bold">You Save: £{Math.round((totalGBP / 0.35) - totalGBP)}</span>
                <span className="text-xs ml-2">({Math.round(65)}% vs UK costs)</span>
              </div>
              <div className="mt-4 text-xs text-gray-600">
                <p className="mb-2"><strong>IMPORTANT:</strong> These prices are estimates based on average Istanbul clinic rates. You will receive clinic-specific quotes in the next step.</p>
                <p className="mb-2">Your final treatment quote will be confirmed by your chosen clinic after they've reviewed your dental information — including any X-rays, CT scans, or images you provide. Payment for treatment is only made in-person at the clinic, ensuring the treatment plan is accurate and agreed by you.</p>
              </div>
              <div className="mt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white" 
                  size="lg" 
                  onClick={() => {
                    // Save treatments first
                    if (onTreatmentsChange) {
                      onTreatmentsChange(treatments);
                    }
                    
                    // Find the patientInfo section and click it to advance to the next step
                    const patientInfoStep = document.querySelector('[data-step="patient-info"]');
                    if (patientInfoStep) {
                      (patientInfoStep as HTMLElement).click();
                      // Scroll to the top of the page
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  Get My Personalised Quote <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Compare prices from verified Istanbul dental clinics
                </p>
              </div>
                
              {/* Treatment Package Info */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Travel Information</h4>
                </div>
                <div className="bg-blue-50 rounded-md p-4">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <Info className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">All-inclusive packages available!</span> Clinics offer packages 
                        that include hotel accommodation and airport transfers.
                      </p>
                      <div className="flex flex-col md:flex-row gap-4 mt-3">
                        <div className="flex items-center">
                          <Plane className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-xs text-gray-600">Typical flights: £150-£300 return from the UK</span>
                        </div>
                        <div className="flex items-center">
                          <Hotel className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-xs text-gray-600">Hotel stays often included in treatment packages</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TreatmentPlanBuilder;