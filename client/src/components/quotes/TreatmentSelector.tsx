import React, { useState, useEffect } from 'react';
import { useQuoteStore } from '@/stores/quoteStore';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Trash2, Plus, RefreshCw, Pencil } from 'lucide-react';

// Treatment category interface
interface TreatmentCategory {
  id: string;
  name: string;
  description: string;
}

// Treatment option interface
interface TreatmentOption {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
}

// Demo treatment categories
const treatmentCategories: TreatmentCategory[] = [
  {
    id: 'implants',
    name: 'Dental Implants',
    description: 'Permanent replacement for missing teeth'
  },
  {
    id: 'cosmetic',
    name: 'Cosmetic Dentistry',
    description: 'Procedures that improve the appearance of your teeth'
  },
  {
    id: 'restorative',
    name: 'Restorative Treatments',
    description: 'Procedures that restore function and aesthetics'
  },
  {
    id: 'orthodontic',
    name: 'Orthodontic Treatments',
    description: 'Treatments for teeth alignment and bite correction'
  },
  {
    id: 'preventive',
    name: 'Preventive Care',
    description: 'Regular check-ups and professional cleanings'
  }
];

// Demo treatment options
const treatmentOptions: TreatmentOption[] = [
  // Implants
  {
    id: 'implant-single',
    categoryId: 'implants',
    name: 'Single Dental Implant',
    description: 'Complete titanium implant with abutment and crown',
    price: 899
  },
  {
    id: 'implant-multiple',
    categoryId: 'implants',
    name: 'Multiple Implants (per unit)',
    description: 'Price per implant when getting multiple units',
    price: 799
  },
  {
    id: 'all-on-4',
    categoryId: 'implants',
    name: 'All-on-4 Full Arch',
    description: 'Full arch replacement with just 4 implants',
    price: 5999
  },
  {
    id: 'bone-graft',
    categoryId: 'implants',
    name: 'Bone Grafting',
    description: 'Procedure to add bone material for implant support',
    price: 499
  },
  
  // Cosmetic
  {
    id: 'veneers-porcelain',
    categoryId: 'cosmetic',
    name: 'Porcelain Veneers',
    description: 'Thin shells that cover the front surface of teeth',
    price: 499
  },
  {
    id: 'veneers-composite',
    categoryId: 'cosmetic',
    name: 'Composite Veneers',
    description: 'Direct application of composite resin to teeth',
    price: 299
  },
  {
    id: 'teeth-whitening',
    categoryId: 'cosmetic',
    name: 'Professional Teeth Whitening',
    description: 'In-clinic laser whitening treatment',
    price: 299
  },
  {
    id: 'smile-design',
    categoryId: 'cosmetic',
    name: 'Digital Smile Design',
    description: 'Computer-aided design for your perfect smile',
    price: 199
  },
  
  // Restorative
  {
    id: 'crown-porcelain',
    categoryId: 'restorative',
    name: 'Porcelain Crown',
    description: 'Full coverage restoration for damaged teeth',
    price: 399
  },
  {
    id: 'bridge-3unit',
    categoryId: 'restorative',
    name: '3-Unit Bridge',
    description: 'Fixed prosthetic to replace missing teeth',
    price: 999
  },
  {
    id: 'inlay-onlay',
    categoryId: 'restorative',
    name: 'Inlay/Onlay',
    description: 'Custom filling made in a dental laboratory',
    price: 299
  },
  {
    id: 'root-canal',
    categoryId: 'restorative',
    name: 'Root Canal Treatment',
    description: 'Procedure to treat infected tooth pulp',
    price: 349
  },
  
  // Orthodontic
  {
    id: 'braces-metal',
    categoryId: 'orthodontic',
    name: 'Metal Braces',
    description: 'Traditional braces for teeth alignment',
    price: 1999
  },
  {
    id: 'braces-ceramic',
    categoryId: 'orthodontic',
    name: 'Ceramic Braces',
    description: 'Tooth-colored brackets for a more discreet look',
    price: 2499
  },
  {
    id: 'clear-aligners',
    categoryId: 'orthodontic',
    name: 'Clear Aligners',
    description: 'Transparent removable aligners for teeth straightening',
    price: 2999
  },
  {
    id: 'retainer',
    categoryId: 'orthodontic',
    name: 'Retainer',
    description: 'Device to maintain teeth position after orthodontic treatment',
    price: 199
  },
  
  // Preventive
  {
    id: 'checkup',
    categoryId: 'preventive',
    name: 'Dental Check-up',
    description: 'Comprehensive examination with x-rays',
    price: 79
  },
  {
    id: 'cleaning',
    categoryId: 'preventive',
    name: 'Professional Cleaning',
    description: 'Scaling and polishing to remove plaque and tartar',
    price: 99
  },
  {
    id: 'fluoride',
    categoryId: 'preventive',
    name: 'Fluoride Treatment',
    description: 'Application of fluoride to strengthen tooth enamel',
    price: 49
  },
  {
    id: 'sealants',
    categoryId: 'preventive',
    name: 'Dental Sealants',
    description: 'Protective coating applied to back teeth',
    price: 39
  }
];

// Promo code data
const promoCodes = {
  'SUMMER15': {
    discountPercentage: 15,
    description: 'Summer special - 15% off all treatments'
  },
  'DENTAL25': {
    discountPercentage: 25,
    description: '25% discount on selected dental procedures'
  },
  'NEWPATIENT': {
    discountPercentage: 20,
    description: 'New patient welcome discount - 20% off'
  },
  'TEST10': {
    discountPercentage: 10,
    description: 'Test promo code - 10% off'
  },
  'LUXHOTEL20': {
    discountPercentage: 20,
    description: 'Premium hotel package - 20% off'
  },
  'IMPLANTCROWN30': {
    discountPercentage: 30,
    description: 'Special bundle discount for implants and crowns - 30% off'
  },
  'FREECONSULT': {
    discountPercentage: 100,
    description: 'Free consultation worth $75'
  },
  'FREEWHITE': {
    discountPercentage: 100,
    description: 'Free teeth whitening with veneer or crown procedures'
  }
};

const TreatmentSelector: React.FC = () => {
  const { 
    treatments, 
    addTreatment, 
    removeTreatment, 
    updateTreatment,
    subtotal,
    discountPercent,
    total,
    promoCode,
    applyPromoCode
  } = useQuoteStore();
  
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [promoCodeInput, setPromoCodeInput] = useState<string>(promoCode || '');
  const [editingTreatment, setEditingTreatment] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(1);
  
  // Filter treatment options based on selected category
  const filteredTreatments = selectedCategory 
    ? treatmentOptions.filter(option => option.categoryId === selectedCategory) 
    : [];
  
  // Get selected treatment details
  const treatmentDetails = treatmentOptions.find(option => option.id === selectedTreatment);

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedTreatment('');
  };
  
  // Handle treatment selection
  const handleTreatmentChange = (value: string) => {
    setSelectedTreatment(value);
  };
  
  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuantity(isNaN(value) || value < 1 ? 1 : value);
  };
  
  // Handle adding treatment to quote
  const handleAddTreatment = () => {
    if (!selectedTreatment || !treatmentDetails) {
      toast({
        title: 'Please select a treatment',
        description: 'You need to select a treatment to add to your quote.',
        variant: 'destructive',
      });
      return;
    }
    
    addTreatment({
      id: treatmentDetails.id,
      name: treatmentDetails.name,
      description: treatmentDetails.description,
      price: treatmentDetails.price,
      quantity: quantity
    });
    
    toast({
      title: 'Treatment added',
      description: `${treatmentDetails.name} has been added to your quote.`,
    });
    
    // Reset form
    setSelectedTreatment('');
    setQuantity(1);
  };
  
  // Handle removing treatment
  const handleRemoveTreatment = (id: string) => {
    removeTreatment(id);
    
    toast({
      title: 'Treatment removed',
      description: 'The selected treatment has been removed from your quote.',
    });
  };
  
  // Handle applying promo code
  const handleApplyPromoCode = () => {
    if (!promoCodeInput.trim()) {
      toast({
        title: 'Empty promo code',
        description: 'Please enter a promo code to apply.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check if promo code is valid
    const formattedCode = promoCodeInput.trim().toUpperCase();
    
    if (formattedCode in promoCodes) {
      const result = applyPromoCode(formattedCode);
      
      if (result) {
        toast({
          title: 'Promo code applied',
          description: `${formattedCode} has been applied to your quote. You saved $${(subtotal * discountPercent / 100).toFixed(2)}`,
        });
      } else {
        toast({
          title: 'Failed to apply promo code',
          description: 'There was an error applying your promo code. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Invalid promo code',
        description: 'The promo code you entered is not valid. Please check and try again.',
        variant: 'destructive',
      });
    }
  };

  // Start editing a treatment quantity
  const startEditing = (treatmentId: string, currentQuantity: number) => {
    setEditingTreatment(treatmentId);
    setEditingQuantity(currentQuantity);
  };

  // Save edited treatment quantity
  const saveEditedQuantity = (treatmentId: string) => {
    const treatment = treatments.find(t => t.id === treatmentId);
    if (treatment) {
      updateTreatment(treatmentId, { ...treatment, quantity: editingQuantity });
      setEditingTreatment(null);
      
      toast({
        title: 'Quantity updated',
        description: 'The treatment quantity has been updated.',
      });
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTreatment(null);
  };

  // Handle proceed to next step
  const handleProceed = () => {
    if (treatments.length === 0) {
      toast({
        title: 'No treatments selected',
        description: 'Please select at least one treatment to continue.',
        variant: 'destructive',
      });
      return;
    }
    
    navigate('/standalone-quote/patient-info');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dental Treatment Quote Builder</h2>
        <p className="text-gray-600">
          Select treatments to include in your customized dental quote.
        </p>
      </div>
      
      {/* Treatment Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Add Treatments</CardTitle>
          <CardDescription>
            Choose from our range of dental treatments to build your quote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="category">Treatment Category</Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger id="category" className="mt-1">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {treatmentCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedCategory && (
            <div>
              <Label htmlFor="treatment">Select Treatment</Label>
              <Select 
                value={selectedTreatment} 
                onValueChange={handleTreatmentChange}
                disabled={!selectedCategory}
              >
                <SelectTrigger id="treatment" className="mt-1">
                  <SelectValue placeholder="Select a treatment" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTreatments.map(treatment => (
                    <SelectItem key={treatment.id} value={treatment.id}>
                      {treatment.name} - ${treatment.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {selectedTreatment && (
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-24"
                />
                <Button
                  onClick={handleAddTreatment}
                  className="flex items-center gap-1"
                >
                  <Plus size={16} />
                  <span>Add to Quote</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Selected Treatments */}
      <Card>
        <CardHeader>
          <CardTitle>Your Selected Treatments</CardTitle>
          <CardDescription>
            Review and modify the treatments in your quote
          </CardDescription>
        </CardHeader>
        <CardContent>
          {treatments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Treatment</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatments.map(treatment => (
                  <TableRow key={treatment.id}>
                    <TableCell className="font-medium">
                      <div>
                        {treatment.name}
                        {treatment.description && (
                          <p className="text-sm text-gray-500">{treatment.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${treatment.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {editingTreatment === treatment.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={editingQuantity}
                            onChange={(e) => setEditingQuantity(parseInt(e.target.value) || 1)}
                            className="w-16 text-right"
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveEditedQuantity(treatment.id)}
                              className="h-7 w-7 p-0"
                            >
                              ✓
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={cancelEditing}
                              className="h-7 w-7 p-0"
                            >
                              ✗
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {treatment.quantity}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(treatment.id, treatment.quantity)}
                            className="h-7 w-7 p-0"
                          >
                            <Pencil size={14} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      ${(treatment.price * treatment.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Treatment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {treatment.name} from your quote?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveTreatment(treatment.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No treatments selected yet</p>
              <p className="text-sm">Select treatments from above to build your quote</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full">
            <div className="border-t pt-4 pb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              
              {/* Promo Code */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyPromoCode}
                    disabled={treatments.length === 0}
                  >
                    Apply
                  </Button>
                </div>
                
                {promoCode && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {promoCode}: {discountPercent}% off
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={() => {
                        applyPromoCode('');
                        setPromoCodeInput('');
                        toast({
                          title: 'Promo code removed',
                          description: 'The promo code has been removed from your quote.',
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
              
              {promoCode && discountPercent > 0 && (
                <div className="flex justify-between items-center mb-2 text-green-600">
                  <span>Discount ({discountPercent}%):</span>
                  <span>-${(subtotal - total).toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t mt-2">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg">${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                disabled={treatments.length === 0}
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear all treatments from your quote?")) {
                    // Clear treatments
                    treatments.forEach(t => removeTreatment(t.id));
                    // Remove promo code
                    applyPromoCode('');
                    setPromoCodeInput('');
                    
                    toast({
                      title: 'Quote cleared',
                      description: 'All treatments have been removed from your quote.',
                    });
                  }
                }}
              >
                <RefreshCw size={16} className="mr-2" />
                Clear All
              </Button>
              
              <Button onClick={handleProceed}>
                Continue to Patient Information
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* Help Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="help">
          <AccordionTrigger>Need Help or Treatment Information?</AccordionTrigger>
          <AccordionContent className="text-gray-600">
            <p className="mb-4">
              Not sure which treatments to select? Here are some common dental procedures and what they entail:
            </p>
            
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">Dental Implants</span> - Titanium posts surgically placed into the jawbone to serve as artificial tooth roots for replacement teeth.
              </li>
              <li>
                <span className="font-medium">Veneers</span> - Thin shells of porcelain or composite resin that are bonded to the front of teeth to improve their appearance.
              </li>
              <li>
                <span className="font-medium">Crowns</span> - Custom-fitted caps that cover damaged or decayed teeth to restore their shape, size, strength, and appearance.
              </li>
              <li>
                <span className="font-medium">Root Canal Treatment</span> - A procedure to treat infection at the center of a tooth by removing the pulp and cleaning the root canal.
              </li>
              <li>
                <span className="font-medium">Clear Aligners</span> - Transparent, removable devices that straighten teeth without the need for traditional braces.
              </li>
            </ul>
            
            <p className="mt-4">
              For more detailed information or personalized recommendations, contact our dental experts at <a href="mailto:info@mydentalfly.com" className="text-primary underline">info@mydentalfly.com</a>.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default TreatmentSelector;