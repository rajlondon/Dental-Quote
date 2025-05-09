import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

// Define interface for QuoteParams
interface QuoteParams {
  treatment: string;
  travelMonth: string;
  budget: string;
}

interface Props {
  initialParams: QuoteParams;
  onSave: (params: QuoteParams) => void;
  className?: string;
}

const QuoteTreatmentSelectionPanel: React.FC<Props> = ({ 
  initialParams, 
  onSave,
  className = '' 
}) => {
  const [params, setParams] = useState<QuoteParams>(initialParams);

  // List of available treatments
  const treatments = [
    { id: 'dental-implants', name: 'Dental Implants' },
    { id: 'veneers', name: 'Porcelain Veneers' },
    { id: 'crowns', name: 'Dental Crowns' },
    { id: 'whitening', name: 'Teeth Whitening' },
    { id: 'all-on-4', name: 'All-on-4 Implants' },
    { id: 'all-on-6', name: 'All-on-6 Implants' },
    { id: 'root-canal', name: 'Root Canal Treatment' },
    { id: 'extraction', name: 'Tooth Extraction' },
    { id: 'dentures', name: 'Dentures' },
    { id: 'bridges', name: 'Dental Bridges' },
    { id: 'hollywood-smile', name: 'Hollywood Smile' },
  ];

  // List of available months
  const months = [
    { id: 'any', name: 'Any Time' },
    { id: 'may', name: 'May 2025' },
    { id: 'june', name: 'June 2025' },
    { id: 'july', name: 'July 2025' },
    { id: 'august', name: 'August 2025' },
    { id: 'september', name: 'September 2025' },
    { id: 'october', name: 'October 2025' },
    { id: 'november', name: 'November 2025' },
    { id: 'december', name: 'December 2025' },
    { id: 'january', name: 'January 2026' },
  ];

  // List of budget options
  const budgets = [
    { id: 'all', name: 'All Prices' },
    { id: 'economy', name: 'Budget-Friendly Options' },
    { id: 'standard', name: 'Standard Quality' },
    { id: 'premium', name: 'Premium Quality' },
  ];

  const handleSave = () => {
    onSave(params);
  };

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="treatment">Treatment Type</Label>
            <Select 
              value={params.treatment} 
              onValueChange={(value) => setParams(prev => ({ ...prev, treatment: value }))}
            >
              <SelectTrigger id="treatment">
                <SelectValue placeholder="Select treatment" />
              </SelectTrigger>
              <SelectContent>
                {treatments.map(treatment => (
                  <SelectItem key={treatment.id} value={treatment.name}>{treatment.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="travelMonth">Travel Month</Label>
            <Select 
              value={params.travelMonth} 
              onValueChange={(value) => setParams(prev => ({ ...prev, travelMonth: value }))}
            >
              <SelectTrigger id="travelMonth">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.id} value={month.id}>{month.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget">Budget</Label>
            <Select 
              value={params.budget} 
              onValueChange={(value) => setParams(prev => ({ ...prev, budget: value }))}
            >
              <SelectTrigger id="budget">
                <SelectValue placeholder="Select budget" />
              </SelectTrigger>
              <SelectContent>
                {budgets.map(budget => (
                  <SelectItem key={budget.id} value={budget.id}>{budget.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>
            Update Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteTreatmentSelectionPanel;