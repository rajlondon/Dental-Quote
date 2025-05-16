import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Minus, ArrowRight } from 'lucide-react';
import { useQuoteStore, Treatment } from '@/stores/quoteStore';

// Sample treatments for demonstration
const SAMPLE_TREATMENTS = [
  {
    id: 'implant',
    name: 'Dental Implant',
    description: 'Titanium post surgically placed into the jawbone to support a replacement tooth',
    price: 1200,
    category: 'implants'
  },
  {
    id: 'crown',
    name: 'Porcelain Crown',
    description: 'Custom-made tooth-shaped cap that covers a damaged or decayed tooth',
    price: 800,
    category: 'crowns'
  },
  {
    id: 'veneers',
    name: 'Porcelain Veneers',
    description: 'Thin shells of porcelain that are bonded to the front of teeth to improve appearance',
    price: 900,
    category: 'cosmetic'
  },
  {
    id: 'whitening',
    name: 'Teeth Whitening',
    description: 'Professional procedure to remove stains and discoloration from teeth',
    price: 350,
    category: 'cosmetic'
  },
  {
    id: 'rootcanal',
    name: 'Root Canal',
    description: 'Procedure to treat infection at the center of a tooth',
    price: 750,
    category: 'endodontics'
  },
  {
    id: 'extraction',
    name: 'Tooth Extraction',
    description: 'Removal of a tooth from its socket in the bone',
    price: 200,
    category: 'oral-surgery'
  },
  {
    id: 'bridge',
    name: 'Dental Bridge',
    description: 'Fixed replacement for missing teeth',
    price: 1500,
    category: 'prosthodontics'
  },
  {
    id: 'cleaning',
    name: 'Professional Cleaning',
    description: 'Removal of plaque and tartar to prevent cavities and gum disease',
    price: 120,
    category: 'preventive'
  }
];

// Categories for filtering
const CATEGORIES = [
  { value: 'all', label: 'All Treatments' },
  { value: 'implants', label: 'Implants' },
  { value: 'crowns', label: 'Crowns' },
  { value: 'cosmetic', label: 'Cosmetic' },
  { value: 'endodontics', label: 'Endodontics' },
  { value: 'oral-surgery', label: 'Oral Surgery' },
  { value: 'prosthodontics', label: 'Prosthodontics' },
  { value: 'preventive', label: 'Preventive' }
];

const TreatmentSelector: React.FC = () => {
  const [_, navigate] = useLocation();
  const { treatments, addTreatment, updateTreatmentQuantity } = useQuoteStore();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter treatments based on category and search query
  const filteredTreatments = SAMPLE_TREATMENTS.filter(treatment => {
    const matchesCategory = selectedCategory === 'all' || treatment.category === selectedCategory;
    const matchesSearch = treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         treatment.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Check if a treatment is already in the cart
  const isTreatmentInCart = (id: string) => {
    return treatments.some(t => t.id === id);
  };
  
  // Get quantity of a treatment in the cart
  const getTreatmentQuantity = (id: string) => {
    const treatment = treatments.find(t => t.id === id);
    return treatment ? treatment.quantity : 0;
  };
  
  // Handle adding a treatment to the cart
  const handleAddTreatment = (treatment: typeof SAMPLE_TREATMENTS[0]) => {
    if (isTreatmentInCart(treatment.id)) {
      updateTreatmentQuantity(treatment.id, getTreatmentQuantity(treatment.id) + 1);
    } else {
      addTreatment({
        id: treatment.id,
        name: treatment.name,
        description: treatment.description,
        price: treatment.price,
        quantity: 1
      });
    }
  };
  
  // Handle removing a treatment from the cart
  const handleDecrementTreatment = (id: string) => {
    const currentQuantity = getTreatmentQuantity(id);
    if (currentQuantity > 1) {
      updateTreatmentQuantity(id, currentQuantity - 1);
    }
  };
  
  // Continue to next step
  const handleContinue = () => {
    if (treatments.length > 0) {
      navigate('/quote/patient-info');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search Treatments</Label>
          <Input
            id="search"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-64">
          <Label htmlFor="category">Filter by Category</Label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTreatments.map((treatment) => (
          <Card key={treatment.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{treatment.name}</CardTitle>
              <CardDescription>
                ${treatment.price.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                {treatment.description}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              {isTreatmentInCart(treatment.id) ? (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDecrementTreatment(treatment.id)}
                    disabled={getTreatmentQuantity(treatment.id) <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">
                    {getTreatmentQuantity(treatment.id)}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAddTreatment(treatment)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => handleAddTreatment(treatment)}>
                  Add
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {treatments.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <div>
            <p className="font-semibold">
              {treatments.length} {treatments.length === 1 ? 'treatment' : 'treatments'} selected
            </p>
            <p className="text-sm text-muted-foreground">
              Total items: {treatments.reduce((sum, t) => sum + t.quantity, 0)}
            </p>
          </div>
          <Button onClick={handleContinue}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TreatmentSelector;