import React, { useState, useEffect } from 'react';
import { useQuoteStore } from '@/stores/quoteStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MinusCircle, Search } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Treatment category type
type TreatmentCategory = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
};

// Treatment type
type TreatmentOption = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
};

const TreatmentSelector: React.FC = () => {
  // Access quote store
  const { 
    treatments: selectedTreatments, 
    addTreatment, 
    removeTreatment, 
    updateQuantity,
    loading,
    subtotal,
    total,
    discountPercent,
    promoCode,
    applyPromoCode,
    removePromoCode
  } = useQuoteStore();
  
  // Local state
  const [categories, setCategories] = useState<TreatmentCategory[]>([]);
  const [treatmentOptions, setTreatmentOptions] = useState<TreatmentOption[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingTreatments, setIsLoadingTreatments] = useState(false);

  // Fetch treatment categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await apiRequest('GET', '/api/treatments/categories');
        let data = await response.json();
        
        // Fallback if API fails
        if (!data || !Array.isArray(data) || data.length === 0) {
          data = [
            { id: 'implants', name: 'Dental Implants', description: 'Replace missing teeth with permanent implants' },
            { id: 'cosmetic', name: 'Cosmetic Dentistry', description: 'Enhance your smile with veneers, whitening, and more' },
            { id: 'restorative', name: 'Restorative Treatments', description: 'Repair damaged teeth with crowns, bridges, and fillings' },
            { id: 'orthodontic', name: 'Orthodontics', description: 'Straighten teeth with braces or clear aligners' }
          ];
        }
        
        setCategories(data);
        setActiveCategory(data[0]?.id || null);
      } catch (error) {
        console.error('Error fetching treatment categories:', error);
        // Fallback data
        const fallbackCategories = [
          { id: 'implants', name: 'Dental Implants', description: 'Replace missing teeth with permanent implants' },
          { id: 'cosmetic', name: 'Cosmetic Dentistry', description: 'Enhance your smile with veneers, whitening, and more' },
          { id: 'restorative', name: 'Restorative Treatments', description: 'Repair damaged teeth with crowns, bridges, and fillings' },
          { id: 'orthodontic', name: 'Orthodontics', description: 'Straighten teeth with braces or clear aligners' }
        ];
        setCategories(fallbackCategories);
        setActiveCategory(fallbackCategories[0].id);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch treatments when category changes
  useEffect(() => {
    const fetchTreatmentsByCategory = async () => {
      if (!activeCategory) return;
      
      setIsLoadingTreatments(true);
      try {
        const response = await apiRequest('GET', `/api/treatments?category=${activeCategory}`);
        let data = await response.json();
        
        // Fallback if API fails
        if (!data || !Array.isArray(data) || data.length === 0) {
          // Dental Implants fallbacks
          if (activeCategory === 'implants') {
            data = [
              { id: 'implant-1', name: 'Single Tooth Implant', description: 'Complete implant including abutment and crown', price: 1200, category: 'implants' },
              { id: 'implant-2', name: 'Multiple Tooth Implants', description: '2-3 implants with bridge', price: 2800, category: 'implants' },
              { id: 'implant-3', name: 'All-on-4 Implants', description: 'Full arch supported by 4 implants', price: 7500, category: 'implants' },
              { id: 'implant-4', name: 'Implant Supported Denture', description: 'Removable overdenture with implant support', price: 3200, category: 'implants' }
            ];
          } 
          // Cosmetic Dentistry fallbacks
          else if (activeCategory === 'cosmetic') {
            data = [
              { id: 'cosmetic-1', name: 'Porcelain Veneers', description: 'Thin shells to cover front surface of teeth', price: 650, category: 'cosmetic' },
              { id: 'cosmetic-2', name: 'Teeth Whitening', description: 'Professional whitening treatment', price: 250, category: 'cosmetic' },
              { id: 'cosmetic-3', name: 'Dental Bonding', description: 'Repair of chipped or discolored teeth', price: 150, category: 'cosmetic' },
              { id: 'cosmetic-4', name: 'Gum Contouring', description: 'Reshape gum line for improved appearance', price: 350, category: 'cosmetic' }
            ];
          }
          // Restorative Treatments fallbacks
          else if (activeCategory === 'restorative') {
            data = [
              { id: 'restorative-1', name: 'Dental Crown', description: 'Full coverage restoration of damaged tooth', price: 500, category: 'restorative' },
              { id: 'restorative-2', name: 'Dental Bridge', description: 'Replace missing teeth with fixed bridge', price: 1200, category: 'restorative' },
              { id: 'restorative-3', name: 'Root Canal Therapy', description: 'Removal of infected pulp and restoration', price: 450, category: 'restorative' },
              { id: 'restorative-4', name: 'Inlay/Onlay', description: 'Custom restoration for damaged teeth', price: 400, category: 'restorative' }
            ];
          }
          // Orthodontic Treatments fallbacks
          else if (activeCategory === 'orthodontic') {
            data = [
              { id: 'ortho-1', name: 'Traditional Braces', description: 'Metal brackets and wires', price: 3500, category: 'orthodontic' },
              { id: 'ortho-2', name: 'Clear Aligners', description: 'Transparent removable aligners', price: 4500, category: 'orthodontic' },
              { id: 'ortho-3', name: 'Ceramic Braces', description: 'Tooth-colored brackets for discreet treatment', price: 4000, category: 'orthodontic' },
              { id: 'ortho-4', name: 'Rapid Palatal Expander', description: 'Widen upper jaw and dental arch', price: 1500, category: 'orthodontic' }
            ];
          } else {
            data = [
              { id: 'general-1', name: 'Consultation', description: 'Initial dental assessment', price: 75, category: 'general' },
              { id: 'general-2', name: 'Dental Cleaning', description: 'Professional teeth cleaning', price: 120, category: 'general' },
              { id: 'general-3', name: 'Dental X-Rays', description: 'Full mouth radiographs', price: 95, category: 'general' }
            ];
          }
        }
        
        setTreatmentOptions(data);
      } catch (error) {
        console.error(`Error fetching treatments for category ${activeCategory}:`, error);
        // Use appropriate fallback based on category
        const fallbackTreatments = getFallbackTreatmentsForCategory(activeCategory);
        setTreatmentOptions(fallbackTreatments);
      } finally {
        setIsLoadingTreatments(false);
      }
    };
    
    fetchTreatmentsByCategory();
  }, [activeCategory]);

  // Helper function to get fallback treatments by category
  const getFallbackTreatmentsForCategory = (categoryId: string): TreatmentOption[] => {
    switch (categoryId) {
      case 'implants':
        return [
          { id: 'implant-1', name: 'Single Tooth Implant', description: 'Complete implant including abutment and crown', price: 1200, category: 'implants' },
          { id: 'implant-2', name: 'Multiple Tooth Implants', description: '2-3 implants with bridge', price: 2800, category: 'implants' },
          { id: 'implant-3', name: 'All-on-4 Implants', description: 'Full arch supported by 4 implants', price: 7500, category: 'implants' },
          { id: 'implant-4', name: 'Implant Supported Denture', description: 'Removable overdenture with implant support', price: 3200, category: 'implants' }
        ];
      case 'cosmetic':
        return [
          { id: 'cosmetic-1', name: 'Porcelain Veneers', description: 'Thin shells to cover front surface of teeth', price: 650, category: 'cosmetic' },
          { id: 'cosmetic-2', name: 'Teeth Whitening', description: 'Professional whitening treatment', price: 250, category: 'cosmetic' },
          { id: 'cosmetic-3', name: 'Dental Bonding', description: 'Repair of chipped or discolored teeth', price: 150, category: 'cosmetic' },
          { id: 'cosmetic-4', name: 'Gum Contouring', description: 'Reshape gum line for improved appearance', price: 350, category: 'cosmetic' }
        ];
      case 'restorative':
        return [
          { id: 'restorative-1', name: 'Dental Crown', description: 'Full coverage restoration of damaged tooth', price: 500, category: 'restorative' },
          { id: 'restorative-2', name: 'Dental Bridge', description: 'Replace missing teeth with fixed bridge', price: 1200, category: 'restorative' },
          { id: 'restorative-3', name: 'Root Canal Therapy', description: 'Removal of infected pulp and restoration', price: 450, category: 'restorative' },
          { id: 'restorative-4', name: 'Inlay/Onlay', description: 'Custom restoration for damaged teeth', price: 400, category: 'restorative' }
        ];
      case 'orthodontic':
        return [
          { id: 'ortho-1', name: 'Traditional Braces', description: 'Metal brackets and wires', price: 3500, category: 'orthodontic' },
          { id: 'ortho-2', name: 'Clear Aligners', description: 'Transparent removable aligners', price: 4500, category: 'orthodontic' },
          { id: 'ortho-3', name: 'Ceramic Braces', description: 'Tooth-colored brackets for discreet treatment', price: 4000, category: 'orthodontic' },
          { id: 'ortho-4', name: 'Rapid Palatal Expander', description: 'Widen upper jaw and dental arch', price: 1500, category: 'orthodontic' }
        ];
      default:
        return [
          { id: 'general-1', name: 'Consultation', description: 'Initial dental assessment', price: 75, category: 'general' },
          { id: 'general-2', name: 'Dental Cleaning', description: 'Professional teeth cleaning', price: 120, category: 'general' },
          { id: 'general-3', name: 'Dental X-Rays', description: 'Full mouth radiographs', price: 95, category: 'general' }
        ];
    }
  };

  // Filter treatments based on search query
  const filteredTreatmentOptions = searchQuery
    ? treatmentOptions.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : treatmentOptions;

  // Find quantity for a treatment if it's already in the selection
  const getQuantity = (treatmentId: string): number => {
    const treatment = selectedTreatments.find(t => t.id === treatmentId);
    return treatment ? treatment.quantity : 0;
  };

  // Handle promo code application
  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    
    setPromoError('');
    const success = await applyPromoCode(promoCodeInput.trim());
    
    if (!success) {
      setPromoError('Invalid promo code');
    } else {
      setPromoCodeInput('');
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Select Dental Treatments</h2>
        <p className="text-gray-600 mb-6">
          Browse our range of dental treatments and select the ones you're interested in.
        </p>
      </div>
      
      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {isLoadingCategories ? (
          <div className="w-full text-center py-4">Loading categories...</div>
        ) : (
          categories.map(category => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className="mb-2"
            >
              {category.name}
            </Button>
          ))
        )}
      </div>
      
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Search treatments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Treatment options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {isLoadingTreatments ? (
          <div className="col-span-full text-center py-4">Loading treatments...</div>
        ) : filteredTreatmentOptions.length > 0 ? (
          filteredTreatmentOptions.map(treatment => {
            const quantity = getQuantity(treatment.id);
            return (
              <Card key={treatment.id} className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{treatment.name}</CardTitle>
                  <CardDescription>{treatment.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-xl font-bold">${treatment.price.toFixed(2)}</p>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center">
                  {quantity > 0 ? (
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => {
                          if (quantity === 1) {
                            removeTreatment(treatment.id);
                          } else {
                            updateQuantity(treatment.id, quantity - 1);
                          }
                        }}
                      >
                        <MinusCircle size={18} />
                      </Button>
                      <span className="text-lg font-medium">{quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => updateQuantity(treatment.id, quantity + 1)}
                      >
                        <PlusCircle size={18} />
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => addTreatment(treatment)}>
                      Add to Quote
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-4">
            No treatments found matching your search.
          </div>
        )}
      </div>
      
      {/* Selected treatments summary */}
      {selectedTreatments.length > 0 && (
        <div className="border rounded-lg p-4 mt-4">
          <h3 className="font-bold text-lg mb-3">Selected Treatments</h3>
          
          <div className="space-y-2 mb-4">
            {selectedTreatments.map(treatment => (
              <div key={treatment.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{treatment.name}</span>
                  <span className="text-gray-500 text-sm ml-2">x{treatment.quantity}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">${(treatment.price * treatment.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center mb-2">
              <span>Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            
            {discountPercent > 0 && (
              <div className="flex justify-between items-center mb-2 text-green-600">
                <span>Discount ({discountPercent}%):</span>
                <span className="font-medium">-${(subtotal - total).toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center font-bold text-lg mt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Promo code section */}
          <div className="mt-4 pt-4 border-t">
            {promoCode ? (
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Promo Code: </span>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-md">{promoCode}</span>
                  <span className="ml-2 text-green-600">({discountPercent}% off)</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={removePromoCode}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Label htmlFor="promoCode">Have a promo code?</Label>
                <div className="flex space-x-2">
                  <Input
                    id="promoCode"
                    type="text" 
                    placeholder="Enter promo code"
                    value={promoCodeInput}
                    onChange={(e) => {
                      setPromoCodeInput(e.target.value);
                      setPromoError('');
                    }}
                  />
                  <Button 
                    onClick={handleApplyPromoCode}
                    disabled={loading.promoCode}
                  >
                    {loading.promoCode ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
                {promoError && (
                  <p className="text-red-500 text-sm">{promoError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentSelector;