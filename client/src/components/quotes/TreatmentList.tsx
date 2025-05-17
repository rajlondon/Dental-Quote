import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Plus, Minus, Check } from 'lucide-react';
import { 
  formatPriceInCurrency,
  type CurrencyCode 
} from '@/utils/format-utils';

interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface TreatmentListProps {
  treatments: Treatment[];
  selectedTreatments?: Treatment[];
  onTreatmentSelect?: (treatment: Treatment) => void;
  onTreatmentRemove?: (treatmentId: string) => void;
  currency?: CurrencyCode;
  showActions?: boolean;
  showSelectedOnly?: boolean;
}

const TreatmentList: React.FC<TreatmentListProps> = ({
  treatments,
  selectedTreatments = [],
  onTreatmentSelect,
  onTreatmentRemove,
  currency = 'USD',
  showActions = true,
  showSelectedOnly = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Get all unique categories from treatments
  const categories = ['all', ...new Set(treatments.map(t => t.category))];
  
  // Filter treatments based on search term and active category
  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || treatment.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Check if a treatment is already selected
  const isTreatmentSelected = (treatmentId: string) => {
    return selectedTreatments.some(t => t.id === treatmentId);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search treatments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={activeCategory} className="w-full md:w-auto">
          <TabsList className="h-auto p-1 grid grid-cols-3 md:flex md:space-x-2">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                onClick={() => setActiveCategory(category)}
                className="text-xs md:text-sm capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {showSelectedOnly && selectedTreatments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {selectedTreatments.map((treatment) => (
            <TreatmentCard
              key={treatment.id}
              treatment={treatment}
              isSelected={true}
              currency={currency}
              onAdd={() => {}}
              onRemove={onTreatmentRemove ? () => onTreatmentRemove(treatment.id) : undefined}
              showActions={showActions}
            />
          ))}
        </div>
      ) : filteredTreatments.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTreatments.map((treatment) => (
            <TreatmentCard
              key={treatment.id}
              treatment={treatment}
              isSelected={isTreatmentSelected(treatment.id)}
              currency={currency}
              onAdd={onTreatmentSelect ? () => onTreatmentSelect(treatment) : undefined}
              onRemove={onTreatmentRemove ? () => onTreatmentRemove(treatment.id) : undefined}
              showActions={showActions}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No treatments found matching your search.</p>
        </div>
      )}
    </div>
  );
};

interface TreatmentCardProps {
  treatment: Treatment;
  isSelected: boolean;
  currency: CurrencyCode;
  onAdd?: () => void;
  onRemove?: () => void;
  showActions: boolean;
}

const TreatmentCard: React.FC<TreatmentCardProps> = ({
  treatment,
  isSelected,
  currency,
  onAdd,
  onRemove,
  showActions
}) => {
  return (
    <Card className={`overflow-hidden transition-all ${isSelected ? 'border-primary bg-primary/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">{treatment.name}</h3>
              <Badge variant="outline" className="capitalize">{treatment.category}</Badge>
              {isSelected && (
                <Badge variant="success" className="bg-green-100 text-green-800">
                  <Check className="mr-1 h-3 w-3" /> Selected
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{treatment.description}</p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-xl font-semibold">
              {formatPriceInCurrency(treatment.price, currency)}
            </div>
            
            {showActions && (
              <div className="mt-2 flex gap-2">
                {!isSelected && onAdd && (
                  <Button size="sm" onClick={onAdd} className="flex items-center">
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button>
                )}
                
                {isSelected && onRemove && (
                  <Button variant="outline" size="sm" onClick={onRemove} className="flex items-center">
                    <Minus className="mr-1 h-4 w-4" /> Remove
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreatmentList;