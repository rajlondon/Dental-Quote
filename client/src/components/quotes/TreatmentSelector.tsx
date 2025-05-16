import React, { useState, useEffect } from 'react';
import { useQuoteStore } from '@/stores/quoteStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Minus, Tag } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';

// Define treatment categories
const categories = [
  { id: 'implants', name: 'Dental Implants' },
  { id: 'veneers', name: 'Veneers' },
  { id: 'crowns', name: 'Crowns' },
  { id: 'bridges', name: 'Bridges' },
  { id: 'whitening', name: 'Whitening' },
  { id: 'orthodontics', name: 'Orthodontics' },
  { id: 'general', name: 'General Dentistry' },
];

// Sample treatments data - in a real app, this would come from an API
const treatmentsData = [
  { 
    id: 'implant-standard', 
    name: 'Standard Dental Implant', 
    description: 'Complete dental implant procedure including abutment and crown',
    price: 1200,
    category: 'implants'
  },
  { 
    id: 'implant-premium', 
    name: 'Premium Dental Implant', 
    description: 'Premium dental implant with lifetime warranty',
    price: 1800,
    category: 'implants'
  },
  { 
    id: 'veneer-porcelain', 
    name: 'Porcelain Veneer', 
    description: 'High-quality porcelain veneer, per tooth',
    price: 600,
    category: 'veneers'
  },
  { 
    id: 'veneer-composite', 
    name: 'Composite Veneer', 
    description: 'Durable composite veneer, per tooth',
    price: 400,
    category: 'veneers'
  },
  { 
    id: 'crown-porcelain', 
    name: 'Porcelain Crown', 
    description: 'Natural-looking porcelain crown, per tooth',
    price: 750,
    category: 'crowns'
  },
  { 
    id: 'crown-zirconia', 
    name: 'Zirconia Crown', 
    description: 'Extremely durable zirconia crown, per tooth',
    price: 850,
    category: 'crowns'
  },
  { 
    id: 'bridge-3unit', 
    name: '3-Unit Bridge', 
    description: 'Bridge to replace one missing tooth',
    price: 1500,
    category: 'bridges'
  },
  { 
    id: 'whitening-laser', 
    name: 'Laser Teeth Whitening', 
    description: 'Professional in-office laser whitening procedure',
    price: 350,
    category: 'whitening'
  },
  { 
    id: 'braces-metal', 
    name: 'Metal Braces', 
    description: 'Traditional metal braces treatment',
    price: 2500,
    category: 'orthodontics'
  },
  { 
    id: 'braces-ceramic', 
    name: 'Ceramic Braces', 
    description: 'Less visible ceramic braces treatment',
    price: 3200,
    category: 'orthodontics'
  },
  { 
    id: 'cleaning', 
    name: 'Professional Cleaning', 
    description: 'Dental cleaning and check-up',
    price: 120,
    category: 'general'
  },
  { 
    id: 'filling', 
    name: 'Dental Filling', 
    description: 'Composite filling for cavity, per tooth',
    price: 150,
    category: 'general'
  },
];

const TreatmentSelector: React.FC = () => {
  const { treatments, addTreatment, removeTreatment, updateTreatmentQuantity, promoCode, applyPromoCode, subtotal } = useQuoteStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [promoInput, setPromoInput] = useState(promoCode || '');
  const [, navigate] = useLocation();

  // Filter treatments based on search query and active category
  const filteredTreatments = treatmentsData.filter(treatment => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          treatment.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || treatment.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get quantity of a specific treatment
  const getTreatmentQuantity = (treatmentId: string) => {
    const treatment = treatments.find(t => t.id === treatmentId);
    return treatment ? treatment.quantity : 0;
  };

  // Handle increment treatment quantity
  const handleIncrement = (treatment: any) => {
    const currentQuantity = getTreatmentQuantity(treatment.id);
    
    if (currentQuantity === 0) {
      // Add treatment if not already in the cart
      addTreatment({
        id: treatment.id,
        name: treatment.name,
        description: treatment.description,
        price: treatment.price,
        quantity: 1
      });
    } else {
      // Update quantity if already in the cart
      updateTreatmentQuantity(treatment.id, currentQuantity + 1);
    }
  };

  // Handle decrement treatment quantity
  const handleDecrement = (treatmentId: string) => {
    const currentQuantity = getTreatmentQuantity(treatmentId);
    
    if (currentQuantity === 1) {
      // Remove treatment if quantity will be zero
      removeTreatment(treatmentId);
    } else if (currentQuantity > 1) {
      // Decrease quantity if more than one
      updateTreatmentQuantity(treatmentId, currentQuantity - 1);
    }
  };

  // Apply promo code
  const handleApplyPromoCode = () => {
    if (!promoInput.trim()) {
      toast({
        title: 'Please enter a promo code',
        variant: 'destructive'
      });
      return;
    }

    // Known promo codes
    const validPromoCodes: Record<string, {discountPercentage: number, description: string}> = {
      'SUMMER15': { discountPercentage: 15, description: 'Summer Special Discount' },
      'DENTAL25': { discountPercentage: 25, description: 'Dental Care Package Discount' },
      'NEWPATIENT': { discountPercentage: 20, description: 'New Patient Discount' },
      'TEST10': { discountPercentage: 10, description: 'Test Discount Code' },
      'LUXHOTEL20': { discountPercentage: 20, description: 'Luxury Hotel Package Discount' },
      'IMPLANTCROWN30': { discountPercentage: 30, description: 'Implant & Crown Bundle Discount' },
    };

    const promoCode = promoInput.toUpperCase();
    
    if (validPromoCodes[promoCode]) {
      applyPromoCode(promoCode, validPromoCodes[promoCode].discountPercentage);
      toast({
        title: 'Promo code applied',
        description: `${validPromoCodes[promoCode].description}: ${validPromoCodes[promoCode].discountPercentage}% off`,
        variant: 'default'
      });
    } else {
      toast({
        title: 'Invalid promo code',
        description: 'The promo code you entered is not valid',
        variant: 'destructive'
      });
    }
  };

  // Continue to patient info
  const handleContinue = () => {
    if (treatments.length === 0) {
      toast({
        title: 'No treatments selected',
        description: 'Please select at least one treatment before proceeding',
        variant: 'destructive'
      });
      return;
    }
    
    navigate('/quote/patient-info');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Dental Treatments</CardTitle>
        <CardDescription>Choose the treatments you're interested in for your dental trip</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search treatments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <Label htmlFor="promo-code" className="whitespace-nowrap">Promo Code:</Label>
            <div className="flex">
              <Input
                id="promo-code"
                placeholder="Enter code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="rounded-r-none"
              />
              <Button 
                variant="secondary" 
                className="rounded-l-none"
                onClick={handleApplyPromoCode}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
        
        {/* Treatment Categories */}
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">All Treatments</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeCategory} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTreatments.map((treatment) => {
                const quantity = getTreatmentQuantity(treatment.id);
                return (
                  <Card key={treatment.id} className={quantity > 0 ? 'border-primary' : ''}>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-semibold">{treatment.name}</CardTitle>
                        <div className="font-bold text-lg">${treatment.price}</div>
                      </div>
                      <CardDescription className="text-sm">{treatment.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="py-3 flex justify-between">
                      <div className="flex items-center gap-2">
                        {quantity > 0 ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleDecrement(treatment.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleIncrement(treatment)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleIncrement(treatment)}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        )}
                      </div>
                      {quantity > 0 && (
                        <div className="text-sm font-medium">
                          Total: ${treatment.price * quantity}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            
            {filteredTreatments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No treatments found. Try adjusting your search or filter.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Selected treatments summary */}
        {treatments.length > 0 && (
          <div className="border rounded-md p-4 mt-6">
            <h3 className="font-semibold text-lg mb-2">Selected Treatments</h3>
            <div className="space-y-2">
              {treatments.map((treatment) => (
                <div key={treatment.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{treatment.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">x{treatment.quantity}</span>
                  </div>
                  <div>${treatment.price * treatment.quantity}</div>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
              {promoCode && (
                <div className="flex justify-between items-center text-green-600">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>Promo: {promoCode}</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Applied
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleContinue}
          disabled={treatments.length === 0}
        >
          Continue to Your Information
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TreatmentSelector;