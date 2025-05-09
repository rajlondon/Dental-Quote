import React, { useState, useEffect } from 'react';
import { TreatmentItem, TreatmentCategory } from '@/components/TreatmentPlanBuilder';
import { treatmentCategoriesData } from '@/data/treatment-categories-data';
import { useSpecialOffers } from '@/hooks/use-special-offers';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, X, Tag, Gift, Package, Star } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface EnhancedTreatmentPlanBuilderProps {
  initialTreatments?: TreatmentItem[];
  onTreatmentsChange?: (treatments: TreatmentItem[]) => void;
  hideHeader?: boolean;
  treatmentCategoriesData?: typeof treatmentCategoriesData;
}

const EnhancedTreatmentPlanBuilder: React.FC<EnhancedTreatmentPlanBuilderProps> = ({
  initialTreatments = [],
  onTreatmentsChange,
  hideHeader = false
}) => {
  const [treatments, setTreatments] = useState<TreatmentItem[]>(initialTreatments);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // Use the new consolidated special offers hook
  const {
    isSpecialOfferFlow,
    isPackageFlow,
    isPromoTokenFlow,
    specialOffer,
    packageData,
    promoToken,
    promoType,
    processSpecialOffers,
    hasSpecialOffer,
    isPackageTreatment
  } = useSpecialOffers();
  
  // Calculate totals
  const totalGBP = treatments.reduce((sum, item) => sum + item.subtotalGBP, 0);
  const totalUSD = treatments.reduce((sum, item) => sum + item.subtotalUSD, 0);
  
  // Get available treatments for the selected category
  const availableTreatments = treatmentCategoriesData.find((cat: TreatmentCategory) => cat.id === selectedCategory)?.treatments || [];
  
  // Get the selected treatment details
  const treatmentDetails = availableTreatments.find((t: {id: string}) => t.id === selectedTreatment);
  
  // Process special offers whenever treatments change
  useEffect(() => {
    // Only process if there's a special offer flow
    if (isSpecialOfferFlow || isPackageFlow || isPromoTokenFlow) {
      const updatedTreatments = processSpecialOffers(treatments);
      
      // If treatments have been updated with offers, update state
      if (updatedTreatments.length !== treatments.length) {
        setTreatments(updatedTreatments);
      }
    }
  }, [treatments, isSpecialOfferFlow, isPackageFlow, isPromoTokenFlow, processSpecialOffers]);
  
  // Update parent component when treatments change
  useEffect(() => {
    if (onTreatmentsChange) {
      onTreatmentsChange(treatments);
    }
  }, [treatments, onTreatmentsChange]);
  
  // Handle adding a treatment
  const handleAddTreatment = () => {
    if (!selectedTreatment || !treatmentDetails) return;
    
    // Calculate standard prices (clinic is 35% of UK costs)
    const ukPriceGBP = treatmentDetails.priceGBP;
    const ukPriceUSD = treatmentDetails.priceUSD;
    const priceGBP = Math.round(ukPriceGBP * 0.35);
    const priceUSD = Math.round(ukPriceUSD * 0.35);
    
    const newTreatment: TreatmentItem = {
      id: treatmentDetails.id + '_' + Date.now(),
      category: selectedCategory,
      name: treatmentDetails.name,
      quantity: quantity,
      priceGBP: priceGBP,
      priceUSD: priceUSD,
      subtotalGBP: priceGBP * quantity,
      subtotalUSD: priceUSD * quantity,
      guarantee: treatmentDetails.guarantee,
      ukPriceGBP: ukPriceGBP,
      ukPriceUSD: ukPriceUSD
    };
    
    setTreatments([...treatments, newTreatment]);
    setShowAddForm(false);
    setSelectedCategory('');
    setSelectedTreatment('');
    setQuantity(1);
  };
  
  // Handle removing a treatment
  const handleRemoveTreatment = (index: number) => {
    // Prevent removing locked items (special offers, packages)
    if (treatments[index].isLocked) return;
    
    const updatedTreatments = [...treatments];
    updatedTreatments.splice(index, 1);
    setTreatments(updatedTreatments);
  };
  
  // Handle quantity change
  const handleQuantityChange = (index: number, newQuantity: number) => {
    // Prevent modifying locked items (special offers, packages)
    if (treatments[index].isLocked) return;
    
    if (newQuantity < 1) return;
    
    const updatedTreatments = [...treatments];
    updatedTreatments[index].quantity = newQuantity;
    updatedTreatments[index].subtotalGBP = updatedTreatments[index].priceGBP * newQuantity;
    updatedTreatments[index].subtotalUSD = updatedTreatments[index].priceUSD * newQuantity;
    setTreatments(updatedTreatments);
  };
  
  return (
    <div className="my-6">
      {!hideHeader && (
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Build Your Treatment Plan</h2>
          <p className="text-gray-600 mt-1">
            Select treatments to include in your personalized quote
          </p>
        </div>
      )}
      
      {/* Special Offer Banner */}
      {isSpecialOfferFlow && specialOffer && (
        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Gift className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-primary">
              Special Offer: {specialOffer.title}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1 ml-7">
            {specialOffer.discountType === 'percentage'
              ? `${specialOffer.discountValue}% discount`
              : `£${specialOffer.discountValue} discount`}
            {" "}will be applied to your treatment
          </p>
        </div>
      )}
      
      {/* Package Banner */}
      {isPackageFlow && packageData && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-primary">
              Treatment Package: {packageData.title}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1 ml-7">
            This package includes multiple treatments at a special price
          </p>
        </div>
      )}
      
      {/* Promo Token Banner */}
      {isPromoTokenFlow && promoToken && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Tag className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-medium text-primary">
              Promotional Offer
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1 ml-7">
            A special promotional discount will be applied to your treatment
          </p>
        </div>
      )}
      
      {/* Add Treatment Form */}
      {showAddForm ? (
        <Card className="p-4 mb-4">
          <h3 className="font-medium mb-3">Add Treatment</h3>
          
          <div className="grid gap-4">
            <div>
              <Label htmlFor="category">Treatment Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {treatmentCategoriesData.map((category: TreatmentCategory) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedCategory && (
              <div>
                <Label htmlFor="treatment">Treatment</Label>
                <Select
                  value={selectedTreatment}
                  onValueChange={setSelectedTreatment}
                >
                  <SelectTrigger id="treatment">
                    <SelectValue placeholder="Select a treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTreatments.map(treatment => (
                      <SelectItem key={treatment.id} value={treatment.id}>
                        {treatment.name} - £{Math.round(treatment.priceGBP * 0.35)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedTreatment && (
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    className="w-16 mx-2 text-center"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedCategory('');
                  setSelectedTreatment('');
                  setQuantity(1);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddTreatment}
                disabled={!selectedTreatment}
              >
                Add Treatment
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="mb-4"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Treatment
        </Button>
      )}
      
      {/* Treatment List */}
      <div>
        <h3 className="font-medium mb-2">Treatment Plan</h3>
        
        <div className="border rounded-lg overflow-hidden">
          {treatments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No treatments added yet
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="p-1">
                {/* Bonus Items Section (Special Offers) */}
                {treatments.some(t => t.isBonus) && (
                  <div className="mb-3">
                    <div className="flex items-center px-2 py-1 bg-gradient-to-r from-green-50 to-blue-50">
                      <Gift className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-700">Special Offers & Bonuses</span>
                    </div>
                    
                    {treatments.filter(t => t.isBonus).map((treatment, index) => (
                      <div 
                        key={`bonus-${index}`} 
                        className="flex items-center justify-between p-2 border-b border-green-100 bg-green-50/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-2">
                              <Gift className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <span className="font-medium text-green-700">{treatment.name}</span>
                              {treatment.quantity > 1 && (
                                <span className="text-sm text-gray-500 ml-1">x{treatment.quantity}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <span className="font-medium text-green-700">£{treatment.priceGBP}</span>
                          </div>
                          {/* Special offers are locked so no delete button */}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Package Items Section */}
                {treatments.some(t => t.isPackage) && (
                  <div className="mb-3">
                    <div className="flex items-center px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <Package className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-700">Treatment Packages</span>
                    </div>
                    
                    {treatments.filter(t => t.isPackage).map((treatment, index) => (
                      <div 
                        key={`package-${index}`} 
                        className="flex items-center justify-between p-2 border-b border-blue-100 bg-blue-50/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-2">
                              <Package className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <span className="font-medium text-blue-700">{treatment.name}</span>
                              {treatment.quantity > 1 && (
                                <span className="text-sm text-gray-500 ml-1">x{treatment.quantity}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <span className="font-medium text-blue-700">£{treatment.priceGBP}</span>
                          </div>
                          {/* Packages are locked so no delete button */}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Standard Treatments Section */}
                {treatments.some(t => !t.isBonus && !t.isPackage) && (
                  <div>
                    <div className="flex items-center px-2 py-1 bg-gray-50">
                      <Star className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Standard Treatments</span>
                    </div>
                    
                    {treatments.filter(t => !t.isBonus && !t.isPackage).map((treatment, index) => (
                      <div 
                        key={`treatment-${index}`} 
                        className="flex items-center justify-between p-2 border-b last:border-b-0"
                      >
                        <div className="flex-1">
                          <span className="font-medium">{treatment.name}</span>
                          {treatment.quantity > 1 && (
                            <span className="text-sm text-gray-500 ml-1">x{treatment.quantity}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleQuantityChange(
                                treatments.findIndex(t => t.id === treatment.id), 
                                treatment.quantity - 1
                              )}
                              disabled={treatment.isLocked}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center">{treatment.quantity}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleQuantityChange(
                                treatments.findIndex(t => t.id === treatment.id), 
                                treatment.quantity + 1
                              )}
                              disabled={treatment.isLocked}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right w-20">
                            <span className="font-medium">£{treatment.priceGBP}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveTreatment(
                              treatments.findIndex(t => t.id === treatment.id)
                            )}
                            disabled={treatment.isLocked}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
        
        {/* Total */}
        <div className="mt-4 flex justify-between font-semibold text-lg">
          <span>Total:</span>
          <span>£{totalGBP} (${totalUSD})</span>
        </div>
        
        {/* UK Comparison */}
        {treatments.length > 0 && (
          <div className="mt-2 text-sm text-right text-gray-600">
            UK cost would be approximately £
            {treatments.reduce((sum, item) => {
              const ukPrice = item.ukPriceGBP || item.priceGBP * 2.857;
              return sum + (ukPrice * item.quantity);
            }, 0)}
          </div>
        )}
        
        {/* Savings */}
        {treatments.length > 0 && (
          <div className="mt-1 text-sm text-right text-green-600 font-medium">
            You save up to 65% compared to UK prices
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTreatmentPlanBuilder;