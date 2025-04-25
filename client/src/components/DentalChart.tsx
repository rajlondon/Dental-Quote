import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

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
  patientEmail?: string;
  patientName?: string;
  chartId?: string;
  readOnly?: boolean;
}

export function DentalChart({ 
  onTeethUpdate, 
  initialTeeth, 
  patientEmail, 
  patientName,
  chartId,
  readOnly = false 
}: DentalChartProps) {
  const { toast } = useToast();
  const [selectedTooth, setSelectedTooth] = useState<Tooth | null>(null);
  const [selectedMode, setSelectedMode] = useState<'condition' | 'treatment'>('condition');
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverChartId, setServerChartId] = useState<string | null>(chartId || null);
  
  // Load dental chart data from server if chartId or patientEmail is provided
  useEffect(() => {
    const fetchDentalChartData = async () => {
      try {
        setIsLoading(true);
        
        // If we have a specific chart ID, fetch that chart
        if (chartId) {
          const response = await axios.get(`/api/get-dental-chart?chartId=${chartId}`);
          if (response.data.success && response.data.chartData) {
            setTeeth(response.data.chartData.dentalChartData);
            setServerChartId(chartId);
            toast({
              title: "Dental Chart Loaded",
              description: "Your saved dental chart has been loaded.",
            });
          }
        } 
        // If we have a patient email, fetch their most recent chart
        else if (patientEmail) {
          const response = await axios.get(`/api/get-dental-chart?patientEmail=${patientEmail}`);
          if (response.data.success && response.data.charts && response.data.charts.length > 0) {
            // Sort charts by createdAt date and get the most recent one
            const sortedCharts = response.data.charts.sort((a: any, b: any) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            const mostRecentChart = sortedCharts[0];
            setTeeth(mostRecentChart.dentalChartData);
            setServerChartId(mostRecentChart.chartId);
            toast({
              title: "Dental Chart Loaded",
              description: "Your most recent dental chart has been loaded.",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load dental chart data:", error);
        // If we can't load from server, try to load from localStorage as fallback
        const localData = localStorage.getItem('dentalChartData');
        if (localData) {
          setTeeth(JSON.parse(localData));
          toast({
            title: "Local Dental Chart Loaded",
            description: "Using your locally saved dental chart.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only try to fetch if we have a chartId or patientEmail
    if (chartId || patientEmail) {
      fetchDentalChartData();
    }
  }, [chartId, patientEmail, toast]);
  
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
      <div>
        {/* Simple Header with Reset Button */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Dental Chart</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const resetTeeth = teeth.map(tooth => ({
                ...tooth,
                condition: null,
                treatment: null,
                notes: ''
              }));
              setTeeth(resetTeeth);
              if (onTeethUpdate) {
                onTeethUpdate(resetTeeth);
              }
              localStorage.removeItem('dentalChartData');
              toast({
                title: "Dental Chart Reset",
                description: "All teeth have been reset to normal",
              });
            }}
          >
            Reset
          </Button>
        </div>
        
        {/* Simple Instructions */}
        <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-800">
          <p className="mb-1"><strong>How to use:</strong></p>
          <ul className="list-disc pl-5">
            <li>Tap on any tooth to mark conditions or treatments</li>
            <li>Mobile view shows a simplified list format</li>
            <li>All your changes are saved automatically</li>
          </ul>
        </div>
        
        {/* Desktop View - Full Dental Chart */}
        <div className="hidden md:block">
          {/* Mouth container with pink gum background */}
          <div className="w-full max-w-3xl mx-auto bg-red-100 rounded-3xl p-6 border-2 border-pink-200 relative">
            {/* Upper gum area */}
            <div className="bg-pink-300 rounded-t-2xl h-6 mb-1"></div>
            
            {/* Upper Teeth Row - arc shape */}
            <div className="flex justify-center gap-1 mb-4" style={{ 
              display: "flex", 
              flexWrap: "nowrap", 
              justifyContent: "center",
              alignItems: "flex-end",
              width: "100%",
              marginBottom: "8px"
            }}>
              {teeth.slice(0, 16).map((tooth, index) => {
                const bgColor = getToothColor(tooth);
                const textColor = getTextColor(bgColor);
                
                // Create arc effect by adjusting button height based on position
                const isCenter = index >= 4 && index <= 11;
                const height = isCenter ? 12 : (index >= 2 && index <= 13 ? 11 : 10);
                const width = isCenter ? 9 : (index >= 2 && index <= 13 ? 9 : 8);
                
                return (
                  <button
                    key={tooth.id}
                    onClick={() => handleToothClick(tooth)}
                    className="flex items-center justify-center border-2 border-gray-400 rounded-t-full shadow-sm hover:shadow-md transition-all font-medium text-xs"
                    style={{ 
                      backgroundColor: bgColor,
                      color: textColor,
                      width: `${width}px`,
                      height: `${height}px`,
                      transform: index < 8 ? `rotate(-${(7-index) * 5}deg)` : `rotate(${(index-8) * 5}deg)`
                    }}
                    title={getToothTooltip(tooth)}
                  >
                    {tooth.id}
                  </button>
                );
              })}
            </div>
            
            {/* Tongue area */}
            <div className="bg-pink-400 w-3/5 h-14 mx-auto rounded-full"></div>
            
            {/* Lower Teeth Row - arc shape */}
            <div className="flex justify-center gap-1" style={{ 
              display: "flex", 
              flexWrap: "nowrap", 
              justifyContent: "center",
              alignItems: "flex-start",
              width: "100%",
              marginTop: "8px"
            }}>
              {teeth.slice(16).map((tooth, index) => {
                const bgColor = getToothColor(tooth);
                const textColor = getTextColor(bgColor);
                
                // Create arc effect by adjusting button height based on position
                const isCenter = index >= 4 && index <= 11;
                const height = isCenter ? 12 : (index >= 2 && index <= 13 ? 11 : 10);
                const width = isCenter ? 9 : (index >= 2 && index <= 13 ? 9 : 8);
                
                return (
                  <button
                    key={tooth.id}
                    onClick={() => handleToothClick(tooth)}
                    className="flex items-center justify-center border-2 border-gray-400 rounded-b-full shadow-sm hover:shadow-md transition-all font-medium text-xs"
                    style={{ 
                      backgroundColor: bgColor,
                      color: textColor,
                      width: `${width}px`,
                      height: `${height}px`,
                      transform: index < 8 ? `rotate(${(7-index) * 5}deg)` : `rotate(-${(index-8) * 5}deg)`
                    }}
                    title={getToothTooltip(tooth)}
                  >
                    {tooth.id}
                  </button>
                );
              })}
            </div>
            
            {/* Lower gum area */}
            <div className="bg-pink-300 rounded-b-2xl h-6 mt-1"></div>
          </div>
        </div>
        
        {/* Mobile View - Simplified List */}
        <div className="block md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {/* Left Side - Upper Teeth */}
            <div>
              <h4 className="text-sm font-medium text-center text-gray-700 mb-1">Upper Teeth</h4>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
                {teeth.slice(0, 16).map(tooth => {
                  const bgColor = getToothColor(tooth);
                  const textColor = getTextColor(bgColor);
                  
                  return (
                    <button
                      key={tooth.id}
                      onClick={() => handleToothClick(tooth)}
                      className="flex items-center w-full p-2 border-b border-gray-100"
                      style={{ backgroundColor: bgColor || "transparent" }}
                    >
                      <div className="flex justify-center items-center h-8 w-8 rounded-full border-2 border-gray-400 mr-2 font-bold" style={{ color: textColor }}>
                        {tooth.id}
                      </div>
                      <div className="text-left text-xs">
                        <div className="font-medium">{tooth.name}</div>
                        {(tooth.condition || tooth.treatment) && (
                          <div className="text-xs text-gray-600">
                            {tooth.condition && tooth.condition !== 'normal' ? conditionOptions.find(o => o.value === tooth.condition)?.label : ''}
                            {tooth.condition && tooth.treatment && ' • '}
                            {tooth.treatment && tooth.treatment !== 'none' ? treatmentOptions.find(o => o.value === tooth.treatment)?.label : ''}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Right Side - Lower Teeth */}
            <div>
              <h4 className="text-sm font-medium text-center text-gray-700 mb-1">Lower Teeth</h4>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {teeth.slice(16).map(tooth => {
                  const bgColor = getToothColor(tooth);
                  const textColor = getTextColor(bgColor);
                  
                  return (
                    <button
                      key={tooth.id}
                      onClick={() => handleToothClick(tooth)}
                      className="flex items-center w-full p-2 border-b border-gray-100"
                      style={{ backgroundColor: bgColor || "transparent" }}
                    >
                      <div className="flex justify-center items-center h-8 w-8 rounded-full border-2 border-gray-400 mr-2 font-bold" style={{ color: textColor }}>
                        {tooth.id}
                      </div>
                      <div className="text-left text-xs">
                        <div className="font-medium">{tooth.name}</div>
                        {(tooth.condition || tooth.treatment) && (
                          <div className="text-xs text-gray-600">
                            {tooth.condition && tooth.condition !== 'normal' ? conditionOptions.find(o => o.value === tooth.condition)?.label : ''}
                            {tooth.condition && tooth.treatment && ' • '}
                            {tooth.treatment && tooth.treatment !== 'none' ? treatmentOptions.find(o => o.value === tooth.treatment)?.label : ''}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Color Legend - Mobile */}
          <div className="mt-4 bg-gray-50 p-2 rounded-md border border-gray-100">
            <div className="grid grid-cols-4 gap-1">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-yellow-300 mr-1"></div>
                <span className="text-xs">Chipped</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                <span className="text-xs">Painful</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
                <span className="text-xs">Crown</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                <span className="text-xs">Implant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Selection Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTooth ? `Tooth ${selectedTooth.id} - ${selectedTooth.name}` : 'Select Tooth'}
            </DialogTitle>
            <p className="text-gray-500 text-sm pt-1">
              Select options for this tooth
            </p>
          </DialogHeader>
          
          {/* Visual Indicator of Selected Tooth */}
          {selectedTooth && (
            <div className="flex justify-center items-center p-2">
              <div 
                className="h-20 w-20 flex items-center justify-center rounded-full border-4 border-gray-400 font-bold text-xl"
                style={{ 
                  backgroundColor: getToothColor(selectedTooth), 
                  color: getTextColor(getToothColor(selectedTooth)) 
                }}
              >
                {selectedTooth.id}
              </div>
            </div>
          )}
          
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