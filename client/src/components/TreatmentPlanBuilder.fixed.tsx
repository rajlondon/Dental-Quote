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
  basePriceUSD?: number; // Original base price in USD before discount
  isPackage?: boolean;
  isSpecialOffer?: boolean; // Flag to easily identify special offers
  isLocked?: boolean; // Flag for locked items (packages, bonus items)
  isBonus?: boolean; // Flag for bonus items (special offers)
  packageId?: string;
  // For discount display
  basePriceGBP?: number; // Original base price before discount
  hasDiscount?: boolean; // Flag for UI rendering
  discountPercent?: number; // Calculated discount percentage
  originalPrice?: number; // For display purposes
  discountedPrice?: number; // For display purposes
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
  treatmentCategoriesData?: TreatmentCategory[]; // Custom categories data for testing
}

const TreatmentPlanBuilder: React.FC<TreatmentPlanBuilderProps> = ({ 
  initialTreatments = [], 
  onTreatmentsChange,
  hideHeader = false,
  treatmentCategoriesData
}) => {
  // Use custom treatment categories if provided, otherwise use the default
  const categories = treatmentCategoriesData || TREATMENT_CATEGORIES;
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
    applySpecialOfferToTreatments,
    getDiscountedLines
  } = useSpecialOfferTracking();
  
  // Calculate totals based on unit price (already discounted), not base price
  const totalGBP = treatments.reduce((sum, item) => sum + item.subtotalGBP, 0);
  const totalUSD = treatments.reduce((sum, item) => sum + item.subtotalUSD, 0);
  
  // Process treatments with discount formatting for display
  const processedTreatments = hasActiveOffer ? getDiscountedLines(treatments) : treatments;
  
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
  const availableTreatments = categories.find(cat => cat.id === selectedCategory)?.treatments || [];
  
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
    const category = categories.find(cat => cat.id === categoryId);
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
    for (const category of categories) {
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
      priceUSD = Math.max(0, priceUSD - Math.round(specialOffer.discountValue * 1.28)); // Convert GBP to USD
    }
    
    const subtotalGBP = priceGBP * quantity;
    const subtotalUSD = priceUSD * quantity;
    
    const treatmentItem: TreatmentItem = {
      id: `special_offer_${Date.now()}`,
      category: baseCategory,
      name: treatmentName || baseTreatment.name,
      quantity: 1,
      priceGBP,
      priceUSD,
      subtotalGBP,
      subtotalUSD,
      guarantee: baseTreatment.guarantee,
      ukPriceGBP: baseTreatment.priceGBP,
      ukPriceUSD: baseTreatment.priceUSD,
      isSpecialOffer: true,
      // For display formatting
      basePriceGBP: Math.round(baseTreatment.priceGBP * 0.35),
      hasDiscount: true,
      discountPercent: specialOffer.discountType === 'percentage' ? specialOffer.discountValue : Math.round(specialOffer.discountValue / (baseTreatment.priceGBP * 0.35) * 100),
      specialOffer: {
        id: specialOffer.id,
        title: specialOffer.title,
        discountType: specialOffer.discountType,
        discountValue: specialOffer.discountValue,
        clinicId: specialOffer.clinicId,
      }
    };
    
    setTreatments(prev => [...prev, treatmentItem]);
  };
  
  const handleDirectAddTreatment = (treatment: any, categoryId: string) => {
    // Calculate Istanbul prices (35% of UK costs)
    const istanbulPriceGBP = Math.round(treatment.priceGBP * 0.35);
    const istanbulPriceUSD = Math.round(treatment.priceUSD * 0.35);
    const subtotalGBP = istanbulPriceGBP;
    const subtotalUSD = istanbulPriceUSD;
    
    const newTreatment: TreatmentItem = {
      id: `${treatment.id}_${Date.now()}`, // Unique ID
      category: categoryId,
      name: treatment.name,
      quantity: 1,
      priceGBP: istanbulPriceGBP,
      priceUSD: istanbulPriceUSD,
      subtotalGBP,
      subtotalUSD,
      guarantee: treatment.guarantee,
      ukPriceGBP: treatment.priceGBP, // Store original UK price for comparison
      ukPriceUSD: treatment.priceUSD,
    };
    
    setTreatments(prev => [...prev, newTreatment]);
  };
  
  // Check if a treatment is already in the list (by name since IDs might differ)
  const isTreatmentSelected = (treatmentName: string) => {
    return treatments.some(t => t.name === treatmentName);
  };
  
  // Mobile optimization: Conditionally show UKP price comparative
  const showUKComparison = true;

  return (
    <div className="bg-white rounded-md p-6 space-y-6 relative">
      {/* Special Offer Banner - only show if there's an active special offer */}
      {hasActiveOffer && specialOffer && (
        <div className="bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center shadow-sm">
          <div className="mr-3 bg-amber-100 p-2 rounded-full">
            <BadgePercent className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-800">{specialOffer.title}</h3>
            <p className="text-sm text-amber-700">
              {specialOffer.discountType === 'percentage' 
                ? `${specialOffer.discountValue}% off selected treatments` 
                : `£${specialOffer.discountValue} off selected treatments`}
            </p>
          </div>
        </div>
      )}
      
      {!hideHeader && (
        <h2 className="text-xl font-semibold flex items-center mb-4">
          <span className="mr-2">Build Your Treatment Plan</span>
          {hasActiveOffer && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
              <Tag className="h-3.5 w-3.5 mr-1" />
              Special Offer
            </Badge>
          )}
        </h2>
      )}
      
      {/* Desktop View */}
      <div className="hidden md:block">
        <Tabs defaultValue="implants" className="w-full">
          <TabsList className="mb-3 w-full justify-start grid grid-cols-6 h-auto">
            <TabsTrigger value="implants" className="py-2.5 data-[state=active]:bg-blue-50">Implants</TabsTrigger>
            <TabsTrigger value="crowns_veneers" className="py-2.5 data-[state=active]:bg-blue-50">Veneers & Crowns</TabsTrigger>
            <TabsTrigger value="whitening" className="py-2.5 data-[state=active]:bg-blue-50">Teeth Whitening</TabsTrigger>
            <TabsTrigger value="full_mouth" className="py-2.5 data-[state=active]:bg-blue-50">Full Mouth Rehab</TabsTrigger>
            <TabsTrigger value="general" className="py-2.5 data-[state=active]:bg-blue-50">General Dentistry</TabsTrigger>
            <TabsTrigger value="other" className="py-2.5 data-[state=active]:bg-blue-50">Other Treatments</TabsTrigger>
          </TabsList>
          
          {/* Implants Tab */}
          <TabsContent value="implants" className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Dental Implant Treatments</h3>
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
              {categories.find(cat => cat.id === 'implants')?.treatments.map((treatment) => (
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
              {categories.find(cat => cat.id === 'crowns_veneers')?.treatments.map((treatment) => (
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
              {categories.find(cat => cat.id === 'whitening')?.treatments.map((treatment) => (
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
              {categories.find(cat => cat.id === 'full_mouth')?.treatments.map((treatment) => (
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
              {categories.find(cat => cat.id === 'general')?.treatments.map((treatment) => (
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
              <h3 className="font-semibold">Other Dental Treatments</h3>
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
              {categories.find(cat => cat.id === 'other')?.treatments.map((treatment) => (
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
        </Tabs>
      </div>
      
      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Select Treatment Category</h3>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedCategory && (
          <div className="mb-4 space-y-3">
            <h3 className="text-sm font-medium">Select Treatment</h3>
            {availableTreatments.map((treatment) => (
              <div key={treatment.id} className="flex items-start p-3 border rounded-md">
                <div className="pt-0.5">
                  <Checkbox 
                    id={`mobile_${treatment.id}`}
                    checked={isTreatmentSelected(treatment.name)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleDirectAddTreatment(treatment, selectedCategory);
                      } else {
                        const matchingTreatment = treatments.find(t => t.name === treatment.name);
                        if (matchingTreatment) {
                          handleRemoveTreatment(matchingTreatment.id);
                        }
                      }
                    }}
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor={`mobile_${treatment.id}`} className="block font-medium text-gray-800">
                    {treatment.name}
                  </label>
                  <div className="flex flex-wrap items-center mt-1">
                    <Badge variant="outline" className="text-xs">
                      £{Math.round(treatment.priceGBP * 0.35).toLocaleString()}
                    </Badge>
                    {treatment.guarantee && treatment.guarantee !== 'N/A' && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded ml-2">
                        {treatment.guarantee} guarantee
                      </span>
                    )}
                  </div>
                  {treatment.notes && (
                    <p className="text-xs text-gray-500 mt-1">{treatment.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Manual Add Form Toggle (both mobile and desktop) */}
      <div className="mt-4 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center mb-4"
        >
          {showAddForm ? <MinusCircle className="h-4 w-4 mr-1" /> : <PlusCircle className="h-4 w-4 mr-1" />}
          {showAddForm ? "Hide Manual Add" : "Add Treatment Manually"}
        </Button>
        
        {showAddForm && (
          <div className="grid gap-4 bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Treatment</label>
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
                        {treatment.name} - £{Math.round(treatment.priceGBP * 0.35)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="h-8 w-8"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 mx-2 text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAddTreatment}
                  disabled={!selectedTreatment}
                  className="w-full"
                >
                  Add to Treatment Plan
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Summary section */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">Your Treatment Plan</h3>
        
        {processedTreatments.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <p className="text-gray-500">No treatments selected. Select treatments from the categories above.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Treatment</TableHead>
                    <TableHead className="w-24 text-right">Qty</TableHead>
                    <TableHead className="w-28 text-right">Price</TableHead>
                    <TableHead className="w-28 text-right">Subtotal</TableHead>
                    <TableHead className="w-16 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedTreatments.map((treatment) => (
                    <TableRow key={treatment.id} className={treatment.isBonus ? "bg-amber-50" : ""}>
                      <TableCell className="font-medium">
                        <div>
                          {treatment.name}
                          {treatment.isBonus && (
                            <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                              Bonus Item
                            </Badge>
                          )}
                          {(treatment.isSpecialOffer || treatment.hasDiscount) && !treatment.isBonus && (
                            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-200">
                              {Math.round(treatment.discountPercent || 0)}% Off
                            </Badge>
                          )}
                        </div>
                        {treatment.guarantee && treatment.guarantee !== 'N/A' && (
                          <div className="text-xs text-gray-500 mt-1">
                            {treatment.guarantee} guarantee
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {treatment.isLocked || treatment.isBonus ? (
                          treatment.quantity
                        ) : (
                          <div className="flex items-center justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(treatment.id, treatment.quantity - 1)}
                              className="h-6 w-6"
                              disabled={treatment.quantity <= 1}
                            >
                              <MinusCircle className="h-3 w-3" />
                            </Button>
                            <span className="mx-1 min-w-[1.5rem] text-center">{treatment.quantity}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(treatment.id, treatment.quantity + 1)}
                              className="h-6 w-6"
                            >
                              <PlusCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {treatment.hasDiscount ? (
                          <div>
                            <div className="text-xs line-through text-gray-500">£{treatment.basePriceGBP}</div>
                            <div>£{treatment.priceGBP}</div>
                          </div>
                        ) : (
                          `£${treatment.priceGBP}`
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {treatment.isBonus ? "£0.00" : `£${treatment.subtotalGBP.toLocaleString()}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {!treatment.isLocked && !treatment.isBonus && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveTreatment(treatment.id)}
                            className="h-6 w-6 text-gray-500 hover:text-red-500"
                          >
                            <span className="sr-only">Remove</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      £{totalGBP.toLocaleString()}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  {showUKComparison && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-right text-sm text-gray-500">
                        UK Price Comparison 
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 inline-flex ml-1 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">This is an estimated comparison of what similar dental work would cost in the UK, based on average private dental fees.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-500">
                        £{treatments.reduce((sum, item) => sum + (item.ukPriceGBP || 0) * item.quantity, 0).toLocaleString()}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Estimated Savings
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      £{(treatments.reduce((sum, item) => sum + (item.ukPriceGBP || 0) * item.quantity, 0) - totalGBP).toLocaleString()}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
            
            {processedTreatments.length > 0 && (
              <Alert className="bg-blue-50 border-blue-100 text-blue-800">
                <Info className="h-4 w-4 mr-2" />
                <AlertDescription className="text-sm">
                  Price estimates are for Istanbul clinics only. Actual prices may vary based on individual clinic rates and your specific dental needs. Final quotes will be provided after reviewing your dental information.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TreatmentPlanBuilder;