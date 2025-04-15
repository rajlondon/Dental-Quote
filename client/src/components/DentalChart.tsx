import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Tooth {
  id: number;
  name: string;
  condition: string | null;
  treatment: string | null;
  notes: string;
}

interface DentalChartProps {
  onTeethUpdate?: (teeth: Tooth[]) => void;
  initialTeeth?: Tooth[];
}

export function DentalChart({ onTeethUpdate, initialTeeth }: DentalChartProps) {
  const { toast } = useToast();
  const [selectedTooth, setSelectedTooth] = useState<Tooth | null>(null);
  const [selectedMode, setSelectedMode] = useState<'condition' | 'treatment'>('condition');
  const [openDialog, setOpenDialog] = useState(false);
  
  // Default teeth array with all 32 adult teeth
  const [teeth, setTeeth] = useState<Tooth[]>(initialTeeth || [
    { id: 1, name: 'Upper Right Third Molar (1)', condition: null, treatment: null, notes: '' },
    { id: 2, name: 'Upper Right Second Molar (2)', condition: null, treatment: null, notes: '' },
    { id: 3, name: 'Upper Right First Molar (3)', condition: null, treatment: null, notes: '' },
    { id: 4, name: 'Upper Right Second Premolar (4)', condition: null, treatment: null, notes: '' },
    { id: 5, name: 'Upper Right First Premolar (5)', condition: null, treatment: null, notes: '' },
    { id: 6, name: 'Upper Right Canine (6)', condition: null, treatment: null, notes: '' },
    { id: 7, name: 'Upper Right Lateral Incisor (7)', condition: null, treatment: null, notes: '' },
    { id: 8, name: 'Upper Right Central Incisor (8)', condition: null, treatment: null, notes: '' },
    { id: 9, name: 'Upper Left Central Incisor (9)', condition: null, treatment: null, notes: '' },
    { id: 10, name: 'Upper Left Lateral Incisor (10)', condition: null, treatment: null, notes: '' },
    { id: 11, name: 'Upper Left Canine (11)', condition: null, treatment: null, notes: '' },
    { id: 12, name: 'Upper Left First Premolar (12)', condition: null, treatment: null, notes: '' },
    { id: 13, name: 'Upper Left Second Premolar (13)', condition: null, treatment: null, notes: '' },
    { id: 14, name: 'Upper Left First Molar (14)', condition: null, treatment: null, notes: '' },
    { id: 15, name: 'Upper Left Second Molar (15)', condition: null, treatment: null, notes: '' },
    { id: 16, name: 'Upper Left Third Molar (16)', condition: null, treatment: null, notes: '' },
    { id: 17, name: 'Lower Left Third Molar (17)', condition: null, treatment: null, notes: '' },
    { id: 18, name: 'Lower Left Second Molar (18)', condition: null, treatment: null, notes: '' },
    { id: 19, name: 'Lower Left First Molar (19)', condition: null, treatment: null, notes: '' },
    { id: 20, name: 'Lower Left Second Premolar (20)', condition: null, treatment: null, notes: '' },
    { id: 21, name: 'Lower Left First Premolar (21)', condition: null, treatment: null, notes: '' },
    { id: 22, name: 'Lower Left Canine (22)', condition: null, treatment: null, notes: '' },
    { id: 23, name: 'Lower Left Lateral Incisor (23)', condition: null, treatment: null, notes: '' },
    { id: 24, name: 'Lower Left Central Incisor (24)', condition: null, treatment: null, notes: '' },
    { id: 25, name: 'Lower Right Central Incisor (25)', condition: null, treatment: null, notes: '' },
    { id: 26, name: 'Lower Right Lateral Incisor (26)', condition: null, treatment: null, notes: '' },
    { id: 27, name: 'Lower Right Canine (27)', condition: null, treatment: null, notes: '' },
    { id: 28, name: 'Lower Right First Premolar (28)', condition: null, treatment: null, notes: '' },
    { id: 29, name: 'Lower Right Second Premolar (29)', condition: null, treatment: null, notes: '' },
    { id: 30, name: 'Lower Right First Molar (30)', condition: null, treatment: null, notes: '' },
    { id: 31, name: 'Lower Right Second Molar (31)', condition: null, treatment: null, notes: '' },
    { id: 32, name: 'Lower Right Third Molar (32)', condition: null, treatment: null, notes: '' },
  ]);

  // Condition options
  const conditionOptions = [
    { value: 'normal', label: 'Normal/Healthy' },
    { value: 'chipped', label: 'Chipped/Cracked' },
    { value: 'missing', label: 'Missing' },
    { value: 'painful', label: 'Painful/Sensitive' },
    { value: 'discolored', label: 'Discolored' },
    { value: 'loose', label: 'Loose' },
    { value: 'gumIssue', label: 'Gum Issue' },
    { value: 'decay', label: 'Decay/Cavity' },
  ];

  // Treatment options
  const treatmentOptions = [
    { value: 'none', label: 'No Treatment Needed' },
    { value: 'implant', label: 'Dental Implant' },
    { value: 'crown', label: 'Dental Crown' },
    { value: 'veneer', label: 'Veneer' },
    { value: 'bridge', label: 'Bridge' },
    { value: 'rootCanal', label: 'Root Canal' },
    { value: 'extraction', label: 'Extraction' },
    { value: 'whitening', label: 'Whitening' },
    { value: 'filling', label: 'Filling' },
  ];
  
  // Handle tooth click
  const handleToothClick = (tooth: Tooth) => {
    setSelectedTooth(tooth);
    setOpenDialog(true);
  };
  
  // Update tooth condition or treatment
  const updateTooth = (option: string) => {
    if (!selectedTooth) return;
    
    const updatedTeeth = teeth.map(tooth => {
      if (tooth.id === selectedTooth.id) {
        return {
          ...tooth,
          [selectedMode]: option === 'normal' || option === 'none' ? null : option
        };
      }
      return tooth;
    });
    
    setTeeth(updatedTeeth);
    
    if (onTeethUpdate) {
      onTeethUpdate(updatedTeeth);
    }
    
    setOpenDialog(false);
    
    toast({
      title: "Updated Successfully",
      description: `Tooth ${selectedTooth.id} has been updated`,
    });
  };
  
  // Update tooth notes
  const updateToothNotes = (notes: string) => {
    if (!selectedTooth) return;
    
    const updatedTeeth = teeth.map(tooth => {
      if (tooth.id === selectedTooth.id) {
        return {
          ...tooth,
          notes
        };
      }
      return tooth;
    });
    
    setTeeth(updatedTeeth);
    
    if (onTeethUpdate) {
      onTeethUpdate(updatedTeeth);
    }
  };
  
  // Get color for tooth based on condition and treatment
  const getToothColor = (tooth: Tooth) => {
    if (tooth.condition === 'missing') return '#d1d5db'; // Gray for missing
    if (tooth.condition === 'chipped') return '#fcd34d'; // Yellow for chipped
    if (tooth.condition === 'painful') return '#ef4444'; // Red for painful
    if (tooth.condition === 'discolored') return '#a78bfa'; // Purple for discolored
    if (tooth.condition === 'loose') return '#fb923c'; // Orange for loose
    if (tooth.condition === 'gumIssue') return '#f87171'; // Light red for gum issue
    if (tooth.condition === 'decay') return '#92400e'; // Brown for decay
    
    if (tooth.treatment === 'implant') return '#22c55e'; // Green for implant
    if (tooth.treatment === 'crown') return '#3b82f6'; // Blue for crown
    if (tooth.treatment === 'veneer') return '#06b6d4'; // Cyan for veneer
    if (tooth.treatment === 'bridge') return '#8b5cf6'; // Purple for bridge
    if (tooth.treatment === 'rootCanal') return '#f43f5e'; // Pink for root canal
    if (tooth.treatment === 'extraction') return '#94a3b8'; // Gray for extraction
    if (tooth.treatment === 'whitening') return '#fafafa'; // White for whitening
    if (tooth.treatment === 'filling') return '#84cc16'; // Lime for filling
    
    return '#ffffff'; // Default white
  };
  
  // Get text color for contrast with tooth color
  const getTextColor = (bgColor: string) => {
    // Lighter colors need dark text, darker colors need light text
    const darkColors = ['#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#f43f5e', '#92400e', '#94a3b8'];
    return darkColors.includes(bgColor) ? '#ffffff' : '#000000';
  };
  
  // Get tooltip text for tooth
  const getToothTooltip = (tooth: Tooth) => {
    const conditionText = tooth.condition 
      ? conditionOptions.find(o => o.value === tooth.condition)?.label 
      : '';
    
    const treatmentText = tooth.treatment 
      ? treatmentOptions.find(o => o.value === tooth.treatment)?.label 
      : '';
    
    let tooltip = tooth.name;
    
    if (conditionText) {
      tooltip += `\nCondition: ${conditionText}`;
    }
    
    if (treatmentText) {
      tooltip += `\nTreatment: ${treatmentText}`;
    }
    
    if (tooth.notes) {
      tooltip += `\nNotes: ${tooth.notes}`;
    }
    
    return tooltip;
  };
  
  return (
    <div className="dental-chart-container">
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Interactive Dental Chart</h3>
        <p className="text-sm text-blue-700 mb-4">
          Click on any tooth to indicate its condition or needed treatment. This helps us understand your dental needs better.
        </p>
        
        {/* Legend */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Legend:</p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-yellow-300 text-yellow-800">Chipped</span>
            <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-300 text-gray-800">Missing</span>
            <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-red-500 text-white">Painful</span>
            <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-purple-300 text-purple-800">Discolored</span>
            <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-green-500 text-white">Implant</span>
            <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-blue-500 text-white">Crown</span>
            <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-cyan-500 text-white">Veneer</span>
          </div>
        </div>
        
        {/* Dental Chart - Upper Row */}
        <div className="flex flex-wrap justify-center gap-1 mb-3">
          {teeth.slice(0, 16).map(tooth => {
            const bgColor = getToothColor(tooth);
            const textColor = getTextColor(bgColor);
            
            return (
              <button
                key={tooth.id}
                onClick={() => handleToothClick(tooth)}
                className="flex items-center justify-center w-10 h-12 border border-gray-300 rounded-t-full"
                style={{ 
                  backgroundColor: bgColor,
                  color: textColor
                }}
                title={getToothTooltip(tooth)}
              >
                {tooth.id}
              </button>
            );
          })}
        </div>
        
        {/* Dental Chart - Lower Row */}
        <div className="flex flex-wrap justify-center gap-1">
          {teeth.slice(16).map(tooth => {
            const bgColor = getToothColor(tooth);
            const textColor = getTextColor(bgColor);
            
            return (
              <button
                key={tooth.id}
                onClick={() => handleToothClick(tooth)}
                className="flex items-center justify-center w-10 h-12 border border-gray-300 rounded-b-full"
                style={{ 
                  backgroundColor: bgColor,
                  color: textColor
                }}
                title={getToothTooltip(tooth)}
              >
                {tooth.id}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Selection Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTooth ? `Tooth ${selectedTooth.id} - ${selectedTooth.name}` : 'Select Tooth'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="condition" onValueChange={(value) => setSelectedMode(value as 'condition' | 'treatment')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="condition">Condition</TabsTrigger>
              <TabsTrigger value="treatment">Treatment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="condition">
              <div className="p-4">
                <RadioGroup value={selectedTooth?.condition || 'normal'} onValueChange={updateTooth}>
                  {conditionOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={option.value} id={`condition-${option.value}`} />
                      <Label htmlFor={`condition-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </TabsContent>
            
            <TabsContent value="treatment">
              <div className="p-4">
                <RadioGroup value={selectedTooth?.treatment || 'none'} onValueChange={updateTooth}>
                  {treatmentOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={option.value} id={`treatment-${option.value}`} />
                      <Label htmlFor={`treatment-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="p-4">
            <Label htmlFor="tooth-notes">Additional Notes</Label>
            <textarea
              id="tooth-notes"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              value={selectedTooth?.notes || ''}
              onChange={(e) => selectedTooth && updateToothNotes(e.target.value)}
              placeholder="Add any specific details about this tooth"
              rows={3}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}