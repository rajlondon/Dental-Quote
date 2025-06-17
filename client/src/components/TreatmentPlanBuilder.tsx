import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, 
  Minus, 
  X, 
  ShoppingCart, 
  Calculator,
  Sparkles,
  Info
} from 'lucide-react';

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

interface TreatmentPlanBuilderProps {
  initialTreatments?: TreatmentItem[];
  onTreatmentsChange?: (treatments: TreatmentItem[]) => void;
  hideHeader?: boolean; // Add option to hide the "Build Your Treatment Plan" header
}

interface PlanTreatmentItem {
  treatment: string;
  priceGBP: number;
  priceUSD: number;
  quantity: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
}

const TreatmentPlanBuilder: React.FC<TreatmentPlanBuilderProps> = ({ 
  initialTreatments = [], 
  onTreatmentsChange,
  hideHeader = false
}) => {
  const [selectedTreatments, setSelectedTreatments] = useState<PlanTreatmentItem[]>([]);

  const AVAILABLE_TREATMENTS = [
    {
      name: 'Dental Implant',
      priceGBP: 550,
      priceUSD: 707,
      guarantee: '10-year',
      description: 'Titanium implant with abutment'
    },
    {
      name: 'Dental Crown',
      priceGBP: 175,
      priceUSD: 225,
      guarantee: '5-year',
      description: 'Porcelain crown'
    },
    {
      name: 'Porcelain Veneer',
      priceGBP: 250,
      priceUSD: 321,
      guarantee: '10-year',
      description: 'Ultra-thin porcelain veneer'
    },
    {
      name: 'Teeth Whitening',
      priceGBP: 150,
      priceUSD: 193,
      guarantee: '2-year',
      description: 'Professional laser whitening'
    },
    {
      name: 'Root Canal Treatment',
      priceGBP: 200,
      priceUSD: 257,
      guarantee: '5-year',
      description: 'Complete root canal therapy'
    },
    {
      name: 'Dental Bridge (3 units)',
      priceGBP: 450,
      priceUSD: 578,
      guarantee: '7-year',
      description: '3-unit porcelain bridge'
    }
  ];

  useEffect(() => {
    if (onTreatmentsChange) {
      onTreatmentsChange(selectedTreatments);
    }
  }, [selectedTreatments, onTreatmentsChange]);

  const addTreatment = (treatment: typeof AVAILABLE_TREATMENTS[0]) => {
    const existing = selectedTreatments.find(t => t.treatment === treatment.name);

    if (existing) {
      updateQuantity(treatment.name, existing.quantity + 1);
    } else {
      const newTreatment: PlanTreatmentItem = {
        treatment: treatment.name,
        priceGBP: treatment.priceGBP,
        priceUSD: treatment.priceUSD,
        quantity: 1,
        subtotalGBP: treatment.priceGBP,
        subtotalUSD: treatment.priceUSD,
        guarantee: treatment.guarantee
      };
      setSelectedTreatments([...selectedTreatments, newTreatment]);
    }
  };

  const updateQuantity = (treatmentName: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSelectedTreatments(selectedTreatments.filter(t => t.treatment !== treatmentName));
    } else {
      setSelectedTreatments(selectedTreatments.map(t => 
        t.treatment === treatmentName 
          ? {
              ...t,
              quantity: newQuantity,
              subtotalGBP: t.priceGBP * newQuantity,
              subtotalUSD: t.priceUSD * newQuantity
            }
          : t
      ));
    }
  };

  const removeTreatment = (treatmentName: string) => {
    setSelectedTreatments(selectedTreatments.filter(t => t.treatment !== treatmentName));
  };

  const totalGBP = selectedTreatments.reduce((sum, t) => sum + t.subtotalGBP, 0);
  const totalUSD = selectedTreatments.reduce((sum, t) => sum + t.subtotalUSD, 0);

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <ShoppingCart className="mr-2 h-6 w-6 text-blue-500" />
            Build Your Treatment Plan
          </h2>
          <p className="text-gray-600 text-sm mt-2">Select treatments from the options below</p>
        </div>
      )}

      {/* Available Treatments */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calculator className="mr-2 h-5 w-5 text-green-500" />
          Available Treatments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_TREATMENTS.map((treatment) => (
            <Card key={treatment.name} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{treatment.name}</CardTitle>
                <CardDescription className="text-sm">{treatment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-lg font-bold text-primary">£{treatment.priceGBP}</div>
                    <div className="text-sm text-gray-500">${treatment.priceUSD}</div>
                  </div>
                  <Badge variant="outline">{treatment.guarantee}</Badge>
                </div>
                <Button 
                  onClick={() => addTreatment(treatment)}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Treatments */}
      {selectedTreatments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
            Your Treatment Plan
          </h3>
          <div className="space-y-3">
            {selectedTreatments.map((treatment) => (
              <Card key={treatment.treatment}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{treatment.treatment}</h4>
                      <div className="text-sm text-gray-500">
                        £{treatment.priceGBP} each • {treatment.guarantee} guarantee
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(treatment.treatment, treatment.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{treatment.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(treatment.treatment, treatment.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <div className="font-bold">£{treatment.subtotalGBP}</div>
                        <div className="text-sm text-gray-500">${treatment.subtotalUSD}</div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTreatment(treatment.treatment)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Total */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="font-semibold flex items-center">
                    <Calculator className="mr-2 h-5 w-5 text-blue-600" />
                    Total Treatment Cost:
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">£{totalGBP}</div>
                    <div className="text-sm text-gray-600">${totalUSD}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {selectedTreatments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Select treatments above to build your plan</p>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlanBuilder;