import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Crown, Zap, Square, Minus, Activity, Link2, Palette, Sparkles, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

type TeethData = Record<string, {
  status: string;
  notes?: string;
}>;

interface DentalChartProps {
  initialData?: TeethData;
  onChange?: (data: Record<string, any>) => void;
  editable?: boolean;
}

export const DentalChart: React.FC<DentalChartProps> = ({ 
  initialData = {}, 
  onChange = () => {}, 
  editable = false 
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('adult');
  const [teethData, setTeethData] = useState<TeethData>(initialData);
  const [selectedCondition, setSelectedCondition] = useState<string>('healthy');

  // Enhanced tooth conditions with 12 comprehensive types
  const toothConditions = {
    healthy: { 
      color: '#10b981', 
      bgColor: '#ecfdf5',
      borderColor: '#059669',
      icon: CheckCircle,
      label: 'Healthy',
      description: 'Good condition'
    },
    decay: { 
      color: '#dc2626', 
      bgColor: '#fef2f2',
      borderColor: '#b91c1c',
      icon: AlertTriangle,
      label: 'Decay/Cavity',
      description: 'Needs treatment'
    },
    filling: { 
      color: '#3b82f6', 
      bgColor: '#dbeafe',
      borderColor: '#2563eb',
      icon: Square,
      label: 'Filling',
      description: 'Has filling'
    },
    crown: { 
      color: '#f59e0b', 
      bgColor: '#fef3c7',
      borderColor: '#d97706',
      icon: Crown,
      label: 'Crown',
      description: 'Needs/has crown'
    },
    missing: { 
      color: '#6b7280', 
      bgColor: '#f3f4f6',
      borderColor: '#4b5563',
      icon: Minus,
      label: 'Missing',
      description: 'Tooth missing'
    },
    implant: { 
      color: '#8b5cf6', 
      bgColor: '#ede9fe',
      borderColor: '#7c3aed',
      icon: Zap,
      label: 'Implant',
      description: 'Needs/has implant'
    },
    root_canal: { 
      color: '#ef4444', 
      bgColor: '#fef2f2',
      borderColor: '#dc2626',
      icon: Activity,
      label: 'Root Canal',
      description: 'Needs/has root canal'
    },
    extraction: { 
      color: '#991b1b', 
      bgColor: '#fef2f2',
      borderColor: '#7f1d1d',
      icon: XCircle,
      label: 'Extraction',
      description: 'Needs extraction'
    },
    bridge: { 
      color: '#0d9488', 
      bgColor: '#f0fdfa',
      borderColor: '#0f766e',
      icon: Link2,
      label: 'Bridge',
      description: 'Part of bridge'
    },
    veneer: { 
      color: '#db2777', 
      bgColor: '#fdf2f8',
      borderColor: '#be185d',
      icon: Palette,
      label: 'Veneer',
      description: 'Needs/has veneer'
    },
    whitening: { 
      color: '#facc15', 
      bgColor: '#fefce8',
      borderColor: '#eab308',
      icon: Sparkles,
      label: 'Whitening',
      description: 'Needs whitening'
    },
    chipped: { 
      color: '#f97316', 
      bgColor: '#fff7ed',
      borderColor: '#ea580c',
      icon: ChevronUp,
      label: 'Chipped',
      description: 'Chipped/damaged'
    }
  };

  const handleToothClick = (toothId: string) => {
    if (!editable) return;

    const newTeethData = {
      ...teethData,
      [toothId]: {
        status: selectedCondition,
        notes: teethData[toothId]?.notes || ''
      }
    };

    setTeethData(newTeethData);
    onChange(newTeethData);

    const condition = toothConditions[selectedCondition as keyof typeof toothConditions];
    toast({
      title: "Tooth Updated",
      description: `Tooth ${toothId} marked as ${condition.label}`,
    });
  };

  const renderTooth = (toothId: string, position: { top: string; left: string }) => {
    const toothStatus = teethData[toothId]?.status || 'healthy';
    const condition = toothConditions[toothStatus as keyof typeof toothConditions] || toothConditions.healthy;
    
    return (
      <div
        key={toothId}
        className={`absolute w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-200 hover:scale-110 ${
          editable ? 'hover:shadow-lg' : ''
        }`}
        style={{
          top: position.top,
          left: position.left,
          backgroundColor: condition.bgColor,
          borderColor: condition.borderColor,
          color: condition.color
        }}
        onClick={() => handleToothClick(toothId)}
        title={`Tooth ${toothId}: ${condition.label}`}
      >
        <div className="w-full h-full flex items-center justify-center">
          <condition.icon size={16} />
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
          {toothId}
        </div>
      </div>
    );
  };

  // Tooth positions for adult teeth (anatomical layout with visible bottom teeth)
  const adultTeethPositions = {
    // Upper teeth (maxilla) - positioned at top
    '18': { top: '10%', left: '8%' }, '17': { top: '12%', left: '13%' }, '16': { top: '15%', left: '18%' }, '15': { top: '18%', left: '23%' },
    '14': { top: '22%', left: '28%' }, '13': { top: '25%', left: '33%' }, '12': { top: '28%', left: '38%' }, '11': { top: '30%', left: '43%' },
    '21': { top: '30%', left: '53%' }, '22': { top: '28%', left: '58%' }, '23': { top: '25%', left: '63%' }, '24': { top: '22%', left: '68%' },
    '25': { top: '18%', left: '73%' }, '26': { top: '15%', left: '78%' }, '27': { top: '12%', left: '83%' }, '28': { top: '10%', left: '88%' },
    
    // Lower teeth (mandible) - positioned at bottom
    '48': { top: '85%', left: '8%' }, '47': { top: '83%', left: '13%' }, '46': { top: '80%', left: '18%' }, '45': { top: '77%', left: '23%' },
    '44': { top: '73%', left: '28%' }, '43': { top: '70%', left: '33%' }, '42': { top: '67%', left: '38%' }, '41': { top: '65%', left: '43%' },
    '31': { top: '65%', left: '53%' }, '32': { top: '67%', left: '58%' }, '33': { top: '70%', left: '63%' }, '34': { top: '73%', left: '68%' },
    '35': { top: '77%', left: '73%' }, '36': { top: '80%', left: '78%' }, '37': { top: '83%', left: '83%' }, '38': { top: '85%', left: '88%' }
  };

  // Child teeth positions (simplified)
  const childTeethPositions = {
    // Upper teeth
    'A': { top: '30%', left: '25%' }, 'B': { top: '35%', left: '30%' }, 'C': { top: '45%', left: '40%' }, 'D': { top: '50%', left: '45%' }, 'E': { top: '52%', left: '48%' },
    'F': { top: '52%', left: '52%' }, 'G': { top: '50%', left: '55%' }, 'H': { top: '45%', left: '60%' }, 'I': { top: '35%', left: '70%' }, 'J': { top: '30%', left: '75%' },
    
    // Lower teeth
    'K': { top: '65%', left: '25%' }, 'L': { top: '60%', left: '30%' }, 'M': { top: '52%', left: '40%' }, 'N': { top: '50%', left: '45%' }, 'O': { top: '48%', left: '48%' },
    'P': { top: '48%', left: '52%' }, 'Q': { top: '50%', left: '55%' }, 'R': { top: '52%', left: '60%' }, 'S': { top: '60%', left: '70%' }, 'T': { top: '65%', left: '75%' }
  };

  return (
    <div className="w-full">
      {editable && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-3 text-gray-800">Select Condition First, Then Click Teeth</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(toothConditions).map(([key, condition]) => {
              const IconComponent = condition.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCondition(key)}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                    selectedCondition === key 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  style={{
                    borderColor: selectedCondition === key ? '#3b82f6' : undefined,
                    backgroundColor: selectedCondition === key ? condition.bgColor : undefined
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: condition.color }}
                  >
                    <IconComponent size={12} color="white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-800">{condition.label}</div>
                    <div className="text-xs text-gray-500">{condition.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="adult">Adult Teeth</TabsTrigger>
          <TabsTrigger value="child">Child Teeth</TabsTrigger>
        </TabsList>

        <TabsContent value="adult" className="space-y-4">
          <div className="relative w-full h-96 mx-auto bg-gradient-to-b from-pink-50 to-red-50 rounded-lg border-2 border-pink-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-pink-100/50 to-red-100/50"></div>
            <div className="relative z-10">
              {Object.entries(adultTeethPositions).map(([toothId, position]) =>
                renderTooth(toothId, position)
              )}
            </div>
            
            {/* Upper jaw outline */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-20 border-2 border-pink-300 rounded-full opacity-20"></div>
            {/* Lower jaw outline */}
            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-80 h-20 border-2 border-pink-300 rounded-full opacity-20"></div>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            Adult teeth (32 total) - {editable ? 'Select a condition above, then click on teeth to mark them' : 'View tooth conditions'}
          </div>
        </TabsContent>

        <TabsContent value="child" className="space-y-4">
          <div className="relative w-full h-96 mx-auto bg-gradient-to-b from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 to-cyan-100/50"></div>
            <div className="relative z-10">
              {Object.entries(childTeethPositions).map(([toothId, position]) =>
                renderTooth(toothId, position)
              )}
            </div>
            
            {/* Mouth outline */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-32 border-4 border-blue-300 rounded-full opacity-30"></div>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            Primary teeth (20 total) - Click on teeth to mark conditions
          </div>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium text-gray-800 mb-3">Condition Legend</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {Object.entries(toothConditions).map(([key, condition]) => {
            const IconComponent = condition.icon;
            return (
              <div key={key} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: condition.color }}
                >
                  <IconComponent size={10} color="white" />
                </div>
                <span className="text-sm text-gray-700">{condition.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DentalChart;