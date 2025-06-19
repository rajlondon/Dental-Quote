import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { PlusCircle, MinusCircle, Info, AlertCircle, Plane, Hotel, Sparkles, Check, ChevronDown, ChevronUp, ArrowRight, CheckCircle, Package } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PromoCodeInput } from './PromoCodeInput';

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
  fromPackage?: boolean; // Flag to indicate if the treatment is from a package promo code
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

  // Calculate totals
  const totalGBP = treatments.reduce((sum, item) => sum + item.subtotalGBP, 0);
  const totalUSD = treatments.reduce((sum, item) => sum + item.subtotalUSD, 0);

  // Update parent component when treatments change - with debouncing to prevent spam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onTreatmentsChange) {
        onTreatmentsChange(treatments);
      }
    }, 100); // Small debounce to prevent excessive calls

    return () => clearTimeout(timeoutId);
  }, [treatments, onTreatmentsChange]);

  // Listen for promo code package events - simplified to reduce state updates
  useEffect(() => {
    const handlePackagePromo = (e: CustomEvent) => {
      const { packageData } = e.detail;

      if (!packageData || !packageData.treatments) return;

      // Only process if we don't already have treatments from this package
      const hasPackageTreatments = treatments.some(t => t.fromPackage);
      if (hasPackageTreatments) return;

      // Map package treatments to our treatment format
      const packageTreatments = packageData.treatments.map((treatment: any) => {
        // Find matching treatment in our catalog
        let treatmentDetails = null;

        // Search in all categories
        for (const category of TREATMENT_CATEGORIES) {
          const found = category.treatments.find(t => 
            t.id.includes(treatment.id) || 
            t.name.toLowerCase().includes(treatment.id.toLowerCase())
          );

          if (found) {
            treatmentDetails = { ...found, category: category.id };
            break;
          }
        }

        // If no match found, create a generic treatment
        if (!treatmentDetails) {
          treatmentDetails = {
            id: `generic-${treatment.id}`,
            name: treatment.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            priceGBP: 400, // Default price
            priceUSD: 520,
            category: 'other'
          };
        }

        // Calculate Istanbul prices (35% of UK costs)
        const istanbulPriceGBP = Math.round(treatmentDetails.priceGBP * 0.35);
        const istanbulPriceUSD = Math.round(treatmentDetails.priceUSD * 0.35);
        const quantity = treatment.quantity || 1;

        return {
          id: `${treatmentDetails.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          category: treatmentDetails.category,
          name: treatmentDetails.name,
          quantity: quantity,
          priceGBP: istanbulPriceGBP,
          priceUSD: istanbulPriceUSD,
          subtotalGBP: istanbulPriceGBP * quantity,
          subtotalUSD: istanbulPriceUSD * quantity,
          guarantee: treatmentDetails.guarantee,
          ukPriceGBP: treatmentDetails.priceGBP,
          ukPriceUSD: treatmentDetails.priceUSD,
          fromPackage: true
        };
      });

      // Clear existing treatments and set new ones
      setTreatments(packageTreatments);
    };

    // Add event listener
    window.addEventListener('packagePromoApplied', handlePackagePromo as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('packagePromoApplied', handlePackagePromo as EventListener);
    };
  }, [treatments]);

  // Get available treatments for the selected category
  const availableTreatments = TREATMENT_CATEGORIES.find(cat => cat.id === selectedCategory)?.treatments || [];

  // Get promo code from session storage
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount' | null>(null);
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Load promo code from session storage on mount - run only once
  useEffect(() => {
    const storedPromoCode = sessionStorage.getItem('pendingPromoCode');
    if (storedPromoCode && !promoCode) {
      setPromoCode(storedPromoCode);

      // Try to get discount info from session storage
      const packageData = sessionStorage.getItem('pendingPackageData');
      if (packageData) {
        try {
          const parsedPackage = JSON.parse(packageData);
          if (parsedPackage.originalPrice && parsedPackage.packagePrice) {
            setDiscountAmount(parsedPackage.originalPrice - parsedPackage.packagePrice);
          }

          // If there's discount type and value information, save it
          if (parsedPackage.discountType && parsedPackage.discountValue) {
            setDiscountType(parsedPackage.discountType);
            setDiscountValue(parsedPackage.discountValue);
          }

        } catch (e) {
          console.error('Failed to parse package data from session storage', e);
        }
      }
    }
  }, []); // Empty dependency array - run only once on mount

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

    // Add new treatment with Istanbul prices
    const newTreatment: TreatmentItem = {
      id: `${treatment.id}_${Date.now()}`, // Unique ID
      category: categoryId,
      name: treatment.name,
      quantity: 1,
      priceGBP: istanbulPriceGBP, // Use Istanbul price
      priceUSD: istanbulPriceUSD, // Use Istanbul price
      subtotalGBP: istanbulPriceGBP, // Use Istanbul price
      subtotalUSD: istanbulPriceUSD, // Use Istanbul price
      guarantee: treatment.guarantee,
      ukPriceGBP: treatment.priceGBP, // Store original UK price for comparison
      ukPriceUSD: treatment.priceUSD,
    };

    setTreatments([...treatments, newTreatment]);
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

      {/* Promo Code Summary - shows when a promo code is active */}
      {promoCode && (
        <div className="mb-6 p-4 border rounded-md bg-green-50 border-green-200">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium text-green-800">Promo Code Applied: {promoCode}</h3>
              {discountAmount > 0 && (
                <p className="text-sm text-green-700 mt-1">
                  Discount: £{discountAmount} {discountType === 'percentage' && `(${discountValue}% off)`}
                </p>
              )}

              {/* If it's a package code from storage, show that info */}
              {sessionStorage.getItem('pendingPackageData') && (
                <div className="mt-2">
                  <div className="text-sm text-green-700">
                    This is a special treatment package that includes multiple treatments.
                  </div>
                  {treatments.length > 0 && treatments.some(t => t.fromPackage) && (
                    <div className="mt-1 text-xs text-green-800">
                      Package treatments have been auto-populated above.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Treatment List and Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Treatment List</h3>

        {treatments.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No treatments added yet. Select treatments from the categories above to build your treatment plan.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Treatment</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price (GBP)</TableHead>
                  <TableHead className="text-right">Subtotal (GBP)</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatments.map((treatment) => (
                  <TableRow key={treatment.id}>
                    <TableCell className="font-medium">{treatment.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(treatment.id, treatment.quantity - 1)}
                          disabled={treatment.quantity <= 1}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={treatment.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value);
                            if (!isNaN(newQuantity)) {
                              handleQuantityChange(treatment.id, newQuantity);
                            }
                          }}
                          className="w-20 text-center"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(treatment.id, treatment.quantity + 1)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>£{treatment.priceGBP.toLocaleString()}</TableCell>
                    <TableCell className="text-right">£{treatment.subtotalGBP.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveTreatment(treatment.id)}>
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total:</TableCell>
                  <TableCell className="text-right font-medium">£{totalGBP.toLocaleString()}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </div>

      {/* Quote Summary section */}
          {treatments.length > 0 && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Quote Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Treatment list */}
                  <div className="space-y-2 mb-6">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Selected Treatments</h4>
                    
                    {treatments.map((treatment) => (
                      <div key={treatment.id} className="flex justify-between" data-treatment-id={treatment.id}>
                        <span>
                          {treatment.name}
                          {treatment.quantity && treatment.quantity > 1 && ` (x${treatment.quantity})`}
                        </span>
                        <span className="font-medium">
                          £{(treatment.priceGBP * (treatment.quantity || 1)).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Subtotal */}
                  <div className="flex justify-between py-2 border-t">
                    <span>Subtotal</span>
                    <span className="font-medium">£{totalGBP.toLocaleString()}</span>
                  </div>
                  
                  {/* Discount (if applied) */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between py-2 text-green-600">
                      <span>
                        {promoCode ? `Discount (${promoCode})` : 'Package Discount'}
                      </span>
                      <span className="font-medium">-£{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {/* Total */}
                  <div className="flex justify-between py-2 border-t border-b mb-6">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">
                      £{(totalGBP - discountAmount).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Promo code input */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2">Promo Code</h4>
                    <PromoCodeInput />
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex flex-col space-y-2">
                    <Button 
                      disabled={treatments.length === 0}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Continue to Booking
                    </Button>
                    <Button variant="outline">Save Quote for Later</Button>
                  </div>
                </CardContent>
              </Card>
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
                <h3 className="font-semibold">Full Mouth Rehab</h3>
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
          </Tabs>
        </div>

        {/* Treatment List and Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Treatment List</h3>

          {treatments.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No treatments added yet. Select treatments from the categories above to build your treatment plan.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Treatment</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price (GBP)</TableHead>
                    <TableHead className="text-right">Subtotal (GBP)</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treatments.map((treatment) => (
                    <TableRow key={treatment.id}>
                      <TableCell className="font-medium">{treatment.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(treatment.id, treatment.quantity - 1)}
                            disabled={treatment.quantity <= 1}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={treatment.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value);
                              if (!isNaN(newQuantity)) {
                                handleQuantityChange(treatment.id, newQuantity);
                              }
                            }}
                            className="w-20 text-center"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(treatment.id, treatment.quantity + 1)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>£{treatment.priceGBP.toLocaleString()}</TableCell>
                      <TableCell className="text-right">£{treatment.subtotalGBP.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveTreatment(treatment.id)}>
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total:</TableCell>
                    <TableCell className="text-right font-medium">£{totalGBP.toLocaleString()}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* "Add Special Treatment" Form (Modal-like) */}
      {showAddForm && (
        <div className="mt-6 p-4 border rounded-md bg-gray-50">
          <h4 className="text-lg font-semibold mb-4">Add Special Treatment</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
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
              <label htmlFor="treatment" className="block text-sm font-medium text-gray-700">
                Treatment
              </label>
              <Select value={selectedTreatment} onValueChange={(value) => setSelectedTreatment(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a treatment" />
                </SelectTrigger>
                <SelectContent>
                  {availableTreatments.map((treatment) => (
                    <SelectItem key={treatment.id} value={treatment.id}>
                      {treatment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTreatment && treatmentDetails && (
                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Price:</span> £{Math.round(treatmentDetails.priceGBP * 0.35).toLocaleString()}
                  <br />
                  {getTreatmentNote(selectedCategory, selectedTreatment) && (
                    <>
                      <span className="font-medium">Note:</span> {getTreatmentNote(selectedCategory, selectedTreatment)}
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                  disabled={quantity <= 1}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value);
                    if (!isNaN(newQuantity)) {
                      setQuantity(newQuantity);
                    }
                  }}
                  className="w-20 text-center"
                />
                <Button variant="ghost" size="sm" onClick={() => setQuantity(quantity + 1)}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleAddTreatment} disabled={!selectedTreatment}>
              Add Treatment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlanBuilder;