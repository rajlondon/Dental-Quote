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
  // Additional properties for positioning in the 3D mouth
  position: {
    arch: 'upper' | 'lower';
    side: 'left' | 'right';
    index: number;
    x: number; // X position for arc placement
    y: number; // Y position for arch placement
    rotation: number; // Rotation angle for proper orientation
  };
}

interface DentalChart3DProps {
  onTeethUpdate?: (teeth: Tooth[]) => void;
  initialTeeth?: Tooth[];
  patientEmail?: string;
  patientName?: string;
  chartId?: string;
  readOnly?: boolean;
}

export function DentalChart3D({ 
  onTeethUpdate, 
  initialTeeth, 
  patientEmail, 
  patientName,
  chartId,
  readOnly = false 
}: DentalChart3DProps) {
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
  
  // Helper function to create a positioned tooth
  const createPositionedTooth = (
    id: number, 
    name: string, 
    arch: 'upper' | 'lower', 
    side: 'left' | 'right', 
    index: number, 
    x: number, 
    y: number, 
    rotation: number
  ): Tooth => {
    return {
      id,
      name,
      condition: null,
      treatment: null,
      notes: '',
      position: {
        arch,
        side,
        index,
        x,
        y,
        rotation
      }
    };
  };

  // Generate teeth with 3D positioning
  const generateTeethWithPositions = (): Tooth[] => {
    const upperArcRadius = 180; // Radius for upper arch path
    const lowerArcRadius = 160; // Radius for lower arch path
    const upperTeeth: Tooth[] = [];
    const lowerTeeth: Tooth[] = [];
    
    // Upper arch teeth - 16 teeth (8 per side)
    for (let i = 0; i < 8; i++) {
      // Right side
      const rightAngle = -Math.PI/2 + i * (Math.PI / 9);
      const rightX = Math.cos(rightAngle) * upperArcRadius;
      const rightY = Math.sin(rightAngle) * upperArcRadius;
      upperTeeth.push(createPositionedTooth(
        i + 1, 
        `Upper Right ${getToothType(i)}`, 
        'upper', 
        'right', 
        i, 
        rightX, 
        rightY, 
        rightAngle * (180/Math.PI) + 90
      ));
      
      // Left side
      const leftAngle = -Math.PI/2 - i * (Math.PI / 9);
      const leftX = Math.cos(leftAngle) * upperArcRadius;
      const leftY = Math.sin(leftAngle) * upperArcRadius;
      upperTeeth.push(createPositionedTooth(
        16 - i, 
        `Upper Left ${getToothType(i)}`, 
        'upper', 
        'left', 
        i, 
        leftX, 
        leftY, 
        leftAngle * (180/Math.PI) + 90
      ));
    }
    
    // Lower arch teeth - 16 teeth (8 per side)
    for (let i = 0; i < 8; i++) {
      // Left side
      const leftAngle = Math.PI/2 - i * (Math.PI / 9);
      const leftX = Math.cos(leftAngle) * lowerArcRadius;
      const leftY = Math.sin(leftAngle) * lowerArcRadius;
      lowerTeeth.push(createPositionedTooth(
        17 + i, 
        `Lower Left ${getToothType(i)}`, 
        'lower', 
        'left', 
        i, 
        leftX, 
        leftY, 
        leftAngle * (180/Math.PI) - 90
      ));
      
      // Right side
      const rightAngle = Math.PI/2 + i * (Math.PI / 9);
      const rightX = Math.cos(rightAngle) * lowerArcRadius;
      const rightY = Math.sin(rightAngle) * lowerArcRadius;
      lowerTeeth.push(createPositionedTooth(
        32 - i, 
        `Lower Right ${getToothType(i)}`, 
        'lower', 
        'right', 
        i, 
        rightX, 
        rightY, 
        rightAngle * (180/Math.PI) - 90
      ));
    }
    
    // Combine and sort by ID
    return [...upperTeeth, ...lowerTeeth].sort((a, b) => a.id - b.id);
  };
  
  // Helper to get the tooth type based on index
  const getToothType = (index: number): string => {
    switch(index) {
      case 0: return "Third Molar";
      case 1: return "Second Molar";
      case 2: return "First Molar";
      case 3: return "Second Premolar";
      case 4: return "First Premolar";
      case 5: return "Canine";
      case 6: return "Lateral Incisor";
      case 7: return "Central Incisor";
      default: return "Unknown";
    }
  };
  
  // Default teeth array with all 32 adult teeth with 3D positions
  const [teeth, setTeeth] = useState<Tooth[]>(initialTeeth || generateTeethWithPositions());

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

  // Get tooth shape based on position
  const getToothShape = (tooth: Tooth) => {
    // Molars are more square
    if (tooth.position.index <= 2) {
      return "rounded-lg";
    }
    // Premolars slightly rounded corners
    else if (tooth.position.index <= 4) {
      return "rounded-md";
    }
    // Canines more pointy
    else if (tooth.position.index === 5) {
      return "rounded-t-full";
    }
    // Incisors more rectangular
    else {
      return "rounded-sm";
    }
  };
  
  // Get tooth size based on position
  const getToothSize = (tooth: Tooth) => {
    // Molars are larger
    if (tooth.position.index <= 2) {
      return "w-9 h-10";
    }
    // Premolars medium size
    else if (tooth.position.index <= 4) {
      return "w-8 h-9";
    }
    // Canines
    else if (tooth.position.index === 5) {
      return "w-7 h-10";
    }
    // Incisors are smaller and flatter
    else {
      return "w-7 h-9";
    }
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
          <p className="mb-1"><strong>How to Use This Tool:</strong></p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click on any tooth in the diagram</li>
            <li>Mark its current condition (chipped, missing, painful, etc.)</li>
            <li>Indicate your desired treatment (implant, crown, veneer, etc.)</li>
            <li>Add any notes specific to that tooth</li>
            <li>Continue marking all teeth that need attention</li>
          </ol>
        </div>
        
        {/* 3D Mouth Representation */}
        <div className="hidden md:block relative">
          <div className="relative w-full h-[400px] rounded-lg bg-pink-100 overflow-hidden border-2 border-red-300 flex flex-col justify-center items-center">
            {/* Background mouth shape - pink gums */}
            <div className="absolute w-[90%] h-[80%] bg-pink-200 rounded-[100%/50%]"></div>
            
            {/* Upper Palate */}
            <div className="absolute top-[15%] w-[60%] h-[25%] bg-pink-300 rounded-[100%/50%]"></div>
            
            {/* Center gap between upper and lower */}
            <div className="absolute w-[80%] h-[30%] bg-gray-800 opacity-30 rounded-[100%/50%] z-0"></div>
            
            {/* Upper Teeth Row */}
            <div className="absolute" style={{ top: '30%', transform: 'translateY(-50%)' }}>
              <svg width="360" height="360" viewBox="-180 -180 360 360">
                {/* Render upper arch teeth */}
                {teeth.slice(0, 16).map(tooth => {
                  const bgColor = getToothColor(tooth);
                  const textColor = getTextColor(bgColor);
                  const { x, y, rotation } = tooth.position;
                  
                  // Tooth shape and size based on position in the arch
                  return (
                    <g 
                      key={tooth.id} 
                      transform={`translate(${x}, ${y}) rotate(${rotation})`}
                      onClick={() => handleToothClick(tooth)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Tooth root */}
                      <rect 
                        x={-8} 
                        y={-5} 
                        width={16} 
                        height={10}
                        fill="#f5f5f4" 
                        stroke="#d6d3d1"
                        strokeWidth={1}
                        rx={1}
                      />
                      
                      {/* Tooth crown */}
                      <rect 
                        x={-10} 
                        y={-20} 
                        width={20} 
                        height={15}
                        fill={bgColor} 
                        stroke="#d6d3d1"
                        strokeWidth={1}
                        rx={2}
                      />
                      
                      {/* Tooth number */}
                      <text 
                        x={0} 
                        y={-10}
                        textAnchor="middle" 
                        dominantBaseline="middle"
                        fill={textColor}
                        fontSize={10}
                        fontWeight="bold"
                      >
                        {tooth.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            {/* Lower Teeth Row */}
            <div className="absolute" style={{ top: '70%', transform: 'translateY(-50%)' }}>
              <svg width="360" height="360" viewBox="-180 -180 360 360">
                {/* Render lower arch teeth */}
                {teeth.slice(16).map(tooth => {
                  const bgColor = getToothColor(tooth);
                  const textColor = getTextColor(bgColor);
                  const { x, y, rotation } = tooth.position;
                  
                  return (
                    <g 
                      key={tooth.id} 
                      transform={`translate(${x}, ${y}) rotate(${rotation})`}
                      onClick={() => handleToothClick(tooth)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Tooth root */}
                      <rect 
                        x={-8} 
                        y={-5} 
                        width={16} 
                        height={10}
                        fill="#f5f5f4" 
                        stroke="#d6d3d1"
                        strokeWidth={1}
                        rx={1}
                      />
                      
                      {/* Tooth crown */}
                      <rect 
                        x={-10} 
                        y={-20} 
                        width={20} 
                        height={15}
                        fill={bgColor} 
                        stroke="#d6d3d1"
                        strokeWidth={1}
                        rx={2}
                      />
                      
                      {/* Tooth number */}
                      <text 
                        x={0} 
                        y={-10}
                        textAnchor="middle" 
                        dominantBaseline="middle"
                        fill={textColor}
                        fontSize={10}
                        fontWeight="bold"
                      >
                        {tooth.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            
            {/* Tongue */}
            <div className="absolute top-[75%] w-[40%] h-[20%] bg-red-300 rounded-[100%/60%]"></div>
          </div>
          
          {/* Legend for desktop */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
            {[...conditionOptions, ...treatmentOptions].map(option => (
              option.value !== 'normal' && option.value !== 'none' && (
                <div key={option.value} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-1" 
                    style={{ 
                      backgroundColor: option.value === 'normal' || option.value === 'none' 
                        ? '#ffffff' 
                        : getToothColor({ ...teeth[0], condition: option.value === 'normal' ? null : (conditionOptions.find(o => o.value === option.value) ? option.value : null), treatment: option.value === 'none' ? null : (treatmentOptions.find(o => o.value === option.value) ? option.value : null) })
                    }}
                  ></div>
                  <span>{option.label}</span>
                </div>
              )
            ))}
          </div>
        </div>
        
        {/* Mobile View - Simplified Dental Chart */}
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
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
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
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Legend</h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
              {[...conditionOptions, ...treatmentOptions].map(option => (
                option.value !== 'normal' && option.value !== 'none' && (
                  <div key={option.value} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-1" 
                      style={{ 
                        backgroundColor: option.value === 'normal' || option.value === 'none' 
                          ? '#ffffff' 
                          : getToothColor({ ...teeth[0], condition: option.value === 'normal' ? null : (conditionOptions.find(o => o.value === option.value) ? option.value : null), treatment: option.value === 'none' ? null : (treatmentOptions.find(o => o.value === option.value) ? option.value : null) })
                      }}
                    ></div>
                    <span>{option.label}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tooth Selection Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTooth ? selectedTooth.name : 'Select a Tooth'}
            </DialogTitle>
          </DialogHeader>
          
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
                <RadioGroup 
                  defaultValue={selectedTooth?.condition || 'normal'}
                  onValueChange={updateTooth}
                >
                  {conditionOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2 py-2 border-b last:border-0">
                      <RadioGroupItem value={option.value} id={`condition-${option.value}`} />
                      <Label htmlFor={`condition-${option.value}`} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ 
                          backgroundColor: option.value === 'normal' 
                            ? '#ffffff' 
                            : getToothColor({ ...teeth[0], condition: option.value, treatment: null }) 
                        }}
                      ></div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </TabsContent>
            
            <TabsContent value="treatment">
              <div className="p-4">
                <RadioGroup 
                  defaultValue={selectedTooth?.treatment || 'none'}
                  onValueChange={updateTooth}
                >
                  {treatmentOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2 py-2 border-b last:border-0">
                      <RadioGroupItem value={option.value} id={`treatment-${option.value}`} />
                      <Label htmlFor={`treatment-${option.value}`} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ 
                          backgroundColor: option.value === 'none' 
                            ? '#ffffff' 
                            : getToothColor({ ...teeth[0], condition: null, treatment: option.value }) 
                        }}
                      ></div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="p-4 pt-0">
            <Label htmlFor="notes" className="text-sm font-medium block mb-1">Notes</Label>
            <textarea 
              id="notes"
              className="w-full h-20 border border-gray-300 rounded-md p-2 text-sm"
              placeholder="Add any specific notes about this tooth..."
              value={selectedTooth?.notes || ''}
              onChange={e => updateToothNotes(e.target.value)}
            ></textarea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DentalChart3D;