import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Trash2 } from 'lucide-react';

// Define common treatment types
const TREATMENT_TYPES = {
  'implants': ['Single Implant', 'Full Arch Implants', 'Implant + Crown'],
  'crowns-bridges': ['Porcelain Crown', 'Zirconia Crown', 'Porcelain Bridge', 'Zirconia Bridge'],
  'veneers': ['Porcelain Veneer', 'Composite Veneer', 'Lumineers'],
  'whitening': ['Laser Whitening', 'Home Whitening Kit'],
  'oral-surgery': ['Tooth Extraction', 'Wisdom Tooth Extraction', 'Bone Grafting'],
  'other': ['Dental Cleaning', 'Root Canal Treatment', 'Periodontal Treatment']
};

interface TreatmentItem {
  treatmentType: string;
  name: string;
  quantity: number;
  priceGBP: number;
  priceUSD: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
  isBonus?: boolean;
  isLocked?: boolean;
  isSpecialOffer?: boolean;
  packageId?: string;
  specialOffer?: {
    id: string;
    title: string;
    discountType: string;
    discountValue: number;
    clinicId: string;
  };
}

interface QuoteTreatmentSelectionPanelProps {
  selectedTreatments: TreatmentItem[];
  onTreatmentsChange: (treatments: TreatmentItem[]) => void;
  specialOfferId?: string;
  isReadOnly?: boolean;
}

const QuoteTreatmentSelectionPanel: React.FC<QuoteTreatmentSelectionPanelProps> = ({
  selectedTreatments,
  onTreatmentsChange,
  specialOfferId,
  isReadOnly = false
}) => {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState('implants');
  const [selectedTreatmentType, setSelectedTreatmentType] = useState('');
  const [selectedTreatmentName, setSelectedTreatmentName] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Calculate prices based on treatment type and name (mocked for now)
  const calculatePrice = (treatmentName: string) => {
    const priceMap: Record<string, { gbp: number; usd: number }> = {
      'Single Implant': { gbp: 450, usd: 590 },
      'Full Arch Implants': { gbp: 4500, usd: 5900 },
      'Implant + Crown': { gbp: 650, usd: 850 },
      'Porcelain Crown': { gbp: 180, usd: 240 },
      'Zirconia Crown': { gbp: 230, usd: 300 },
      'Porcelain Bridge': { gbp: 350, usd: 460 },
      'Zirconia Bridge': { gbp: 400, usd: 520 },
      'Porcelain Veneer': { gbp: 200, usd: 260 },
      'Composite Veneer': { gbp: 150, usd: 200 },
      'Lumineers': { gbp: 300, usd: 390 },
      'Laser Whitening': { gbp: 150, usd: 200 },
      'Home Whitening Kit': { gbp: 100, usd: 130 },
      'Tooth Extraction': { gbp: 60, usd: 80 },
      'Wisdom Tooth Extraction': { gbp: 120, usd: 160 },
      'Bone Grafting': { gbp: 300, usd: 390 },
      'Dental Cleaning': { gbp: 50, usd: 65 },
      'Root Canal Treatment': { gbp: 150, usd: 200 },
      'Periodontal Treatment': { gbp: 200, usd: 260 }
    };

    return priceMap[treatmentName] || { gbp: 100, usd: 130 };
  };

  // Handle adding a treatment to the list
  const handleAddTreatment = () => {
    if (!selectedTreatmentName || quantity <= 0) return;

    const price = calculatePrice(selectedTreatmentName);
    const newTreatment: TreatmentItem = {
      treatmentType: selectedTreatmentType,
      name: selectedTreatmentName,
      quantity,
      priceGBP: price.gbp,
      priceUSD: price.usd,
      subtotalGBP: price.gbp * quantity,
      subtotalUSD: price.usd * quantity,
      guarantee: '5 years',
      isBonus: false,
      isLocked: false,
      isSpecialOffer: !!specialOfferId
    };

    if (specialOfferId) {
      newTreatment.specialOffer = {
        id: specialOfferId,
        title: 'Special Promotion',
        discountType: 'percentage',
        discountValue: 10,
        clinicId: 'default-clinic'
      };
    }

    // Add the new treatment to the list
    onTreatmentsChange([...selectedTreatments, newTreatment]);

    // Reset the form
    setSelectedTreatmentName('');
    setQuantity(1);
  };

  // Handle removing a treatment from the list
  const handleRemoveTreatment = (index: number) => {
    if (isReadOnly) return;
    
    const updatedTreatments = [...selectedTreatments];
    updatedTreatments.splice(index, 1);
    onTreatmentsChange(updatedTreatments);
  };

  // Handle updating the quantity of a treatment
  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (isReadOnly || newQuantity <= 0) return;
    
    const updatedTreatments = [...selectedTreatments];
    const treatment = updatedTreatments[index];
    treatment.quantity = newQuantity;
    treatment.subtotalGBP = treatment.priceGBP * newQuantity;
    treatment.subtotalUSD = treatment.priceUSD * newQuantity;
    onTreatmentsChange(updatedTreatments);
  };

  // Grouped treatments by type for display
  const groupedTreatments = selectedTreatments.reduce((acc, treatment) => {
    const type = treatment.treatmentType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(treatment);
    return acc;
  }, {} as Record<string, TreatmentItem[]>);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {t('quote.treatments.title', 'Select Your Treatments')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isReadOnly && (
          <>
            <Tabs defaultValue="implants" value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="implants">Implants</TabsTrigger>
                <TabsTrigger value="crowns-bridges">Crowns & Bridges</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
              
              {Object.entries(TREATMENT_TYPES).map(([type, treatments]) => (
                <TabsContent key={type} value={type}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="treatmentName">Treatment</Label>
                        <Select 
                          value={selectedTreatmentName} 
                          onValueChange={(value) => {
                            setSelectedTreatmentName(value);
                            setSelectedTreatmentType(type);
                          }}
                        >
                          <SelectTrigger id="treatmentName">
                            <SelectValue placeholder="Select a treatment" />
                          </SelectTrigger>
                          <SelectContent>
                            {treatments.map((treatment) => (
                              <SelectItem key={treatment} value={treatment}>
                                {treatment}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <div className="flex items-center">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon"
                            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            id="quantity"
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="mx-2 text-center"
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
                    </div>
                    
                    <Button type="button" onClick={handleAddTreatment} className="w-full">
                      Add Treatment
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            
            <div className="my-4 border-t pt-4">
              <h3 className="font-medium mb-2">Selected Treatments</h3>
            </div>
          </>
        )}
        
        {Object.entries(groupedTreatments).map(([type, treatments]) => (
          <div key={type} className="mb-4">
            <h4 className="text-sm font-medium mb-2 capitalize">{type.replace('-', ' ')}</h4>
            <ul className="space-y-2">
              {treatments.map((treatment, index) => (
                <li 
                  key={`${treatment.name}-${index}`} 
                  className="flex items-center justify-between p-2 rounded-md border"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium">{treatment.name}</span>
                      {treatment.isSpecialOffer && (
                        <Badge className="ml-2 bg-green-500">Special Offer</Badge>
                      )}
                      {treatment.isBonus && (
                        <Badge className="ml-2 bg-blue-500">Bonus</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      £{treatment.priceGBP} per unit • {treatment.guarantee} guarantee
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!isReadOnly && (
                      <div className="flex items-center">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleUpdateQuantity(
                            selectedTreatments.indexOf(treatment), 
                            treatment.quantity - 1
                          )}
                          disabled={treatment.quantity <= 1 || treatment.isLocked}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 min-w-[30px] text-center">
                          {treatment.quantity}
                        </span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleUpdateQuantity(
                            selectedTreatments.indexOf(treatment), 
                            treatment.quantity + 1
                          )}
                          disabled={treatment.isLocked}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="font-medium min-w-[80px] text-right">
                      £{treatment.subtotalGBP.toFixed(2)}
                    </div>
                    
                    {!isReadOnly && !treatment.isLocked && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveTreatment(selectedTreatments.indexOf(treatment))}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        
        {selectedTreatments.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            {isReadOnly
              ? 'No treatments have been selected yet.'
              : 'Add treatments to your quote using the form above.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuoteTreatmentSelectionPanel;