import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Info, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface Tooth {
  id: string;
  position: string;
  condition: string[];
  treatment: string[];
  notes: string;
}

export interface DentalChartData {
  teeth: Tooth[];
  generalNotes: string;
}

interface SimpleDentalChartProps {
  onComplete: (data: DentalChartData) => void;
}

export const SimpleDentalChart: React.FC<SimpleDentalChartProps> = ({ onComplete }) => {
  // Sample initial dental chart data
  const initialTeeth: Tooth[] = [
    // Upper Right
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `ur-${i + 1}`,
      position: `UR${i + 1}`,
      condition: [],
      treatment: [],
      notes: ''
    })),
    // Upper Left
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `ul-${i + 1}`,
      position: `UL${i + 1}`,
      condition: [],
      treatment: [],
      notes: ''
    })),
    // Lower Right
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `lr-${i + 1}`,
      position: `LR${i + 1}`,
      condition: [],
      treatment: [],
      notes: ''
    })),
    // Lower Left
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `ll-${i + 1}`,
      position: `LL${i + 1}`,
      condition: [],
      treatment: [],
      notes: ''
    }))
  ];

  const [dentalData, setDentalData] = useState<DentalChartData>({
    teeth: initialTeeth,
    generalNotes: ''
  });

  const [activeTooth, setActiveTooth] = useState<Tooth | null>(null);
  const [activeQuadrant, setActiveQuadrant] = useState<string>('upper-right');

  // Condition options for teeth
  const conditionOptions = [
    { id: 'healthy', label: 'Healthy' },
    { id: 'cavity', label: 'Cavity' },
    { id: 'missing', label: 'Missing' },
    { id: 'broken', label: 'Broken/Chipped' },
    { id: 'sensitive', label: 'Sensitive' },
    { id: 'stained', label: 'Stained' },
    { id: 'filled', label: 'Previously Filled' },
    { id: 'painful', label: 'Painful' }
  ];

  // Treatment options for teeth
  const treatmentOptions = [
    { id: 'filling', label: 'Filling' },
    { id: 'crown', label: 'Crown' },
    { id: 'extraction', label: 'Extraction' },
    { id: 'root-canal', label: 'Root Canal' },
    { id: 'implant', label: 'Implant' },
    { id: 'veneer', label: 'Veneer' },
    { id: 'bridge', label: 'Bridge' },
    { id: 'cleaning', label: 'Professional Cleaning' },
    { id: 'whitening', label: 'Whitening' },
    { id: 'braces', label: 'Braces/Orthodontics' }
  ];

  // Function to handle selecting a tooth
  const handleToothClick = (tooth: Tooth) => {
    setActiveTooth(tooth);
  };

  // Function to handle changing condition of active tooth
  const handleConditionChange = (conditionId: string, checked: boolean) => {
    if (!activeTooth) return;

    setDentalData(prev => {
      const newTeeth = prev.teeth.map(tooth => {
        if (tooth.id === activeTooth.id) {
          const newConditions = checked
            ? [...tooth.condition, conditionId]
            : tooth.condition.filter(id => id !== conditionId);
          
          return {
            ...tooth,
            condition: newConditions
          };
        }
        return tooth;
      });

      return {
        ...prev,
        teeth: newTeeth
      };
    });
  };

  // Function to handle changing treatment of active tooth
  const handleTreatmentChange = (treatmentId: string, checked: boolean) => {
    if (!activeTooth) return;

    setDentalData(prev => {
      const newTeeth = prev.teeth.map(tooth => {
        if (tooth.id === activeTooth.id) {
          const newTreatments = checked
            ? [...tooth.treatment, treatmentId]
            : tooth.treatment.filter(id => id !== treatmentId);
          
          return {
            ...tooth,
            treatment: newTreatments
          };
        }
        return tooth;
      });

      return {
        ...prev,
        teeth: newTeeth
      };
    });
  };

  // Function to handle changing notes of active tooth
  const handleNotesChange = (notes: string) => {
    if (!activeTooth) return;

    setDentalData(prev => {
      const newTeeth = prev.teeth.map(tooth => {
        if (tooth.id === activeTooth.id) {
          return {
            ...tooth,
            notes
          };
        }
        return tooth;
      });

      return {
        ...prev,
        teeth: newTeeth
      };
    });
  };

  // Function to handle changing general notes
  const handleGeneralNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDentalData(prev => ({
      ...prev,
      generalNotes: e.target.value
    }));
  };

  // Get teeth for current quadrant
  const getQuadrantTeeth = () => {
    const quadrantMap: Record<string, string> = {
      'upper-right': 'ur-',
      'upper-left': 'ul-',
      'lower-right': 'lr-',
      'lower-left': 'll-'
    };

    const prefix = quadrantMap[activeQuadrant];
    return dentalData.teeth.filter(tooth => tooth.id.startsWith(prefix));
  };

  // Get quadrant display name
  const getQuadrantDisplayName = () => {
    const displayNames: Record<string, string> = {
      'upper-right': 'Upper Right',
      'upper-left': 'Upper Left',
      'lower-right': 'Lower Right',
      'lower-left': 'Lower Left'
    };
    return displayNames[activeQuadrant];
  };

  // Check if any teeth have treatments selected
  const hasTreatments = dentalData.teeth.some(tooth => tooth.treatment.length > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Dental Chart</CardTitle>
          <CardDescription>
            Click on any tooth to mark its condition and select treatments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Alert className="bg-blue-50 text-blue-700 border-blue-100">
              <Info className="h-4 w-4" />
              <AlertTitle>How to Use</AlertTitle>
              <AlertDescription>
                Select a quadrant, click on any tooth, mark its condition and required treatments.
                Complete as many teeth as needed for your quote.
              </AlertDescription>
            </Alert>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Quadrant selection */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium mb-4">Select Quadrant</h3>
              <Tabs
                value={activeQuadrant}
                onValueChange={setActiveQuadrant}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="upper-right">Upper Right</TabsTrigger>
                  <TabsTrigger value="upper-left">Upper Left</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="lower-right">Lower Right</TabsTrigger>
                  <TabsTrigger value="lower-left">Lower Left</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">{getQuadrantDisplayName()} Teeth</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {getQuadrantTeeth().map(tooth => (
                      <div
                        key={tooth.id}
                        className={`
                          border rounded-md p-2 text-center cursor-pointer transition
                          ${activeTooth?.id === tooth.id ? 'border-primary bg-primary/5' : ''}
                          ${tooth.treatment.length > 0 ? 'bg-green-50 border-green-200' : ''}
                          ${tooth.condition.includes('missing') ? 'bg-gray-100 text-gray-400' : ''}
                          hover:border-primary
                        `}
                        onClick={() => handleToothClick(tooth)}
                      >
                        <div className="text-sm font-medium">{tooth.position}</div>
                        {tooth.treatment.length > 0 && (
                          <div className="mt-1">
                            <CheckCircle className="h-3 w-3 text-green-500 mx-auto" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Tabs>
            </div>

            {/* Tooth details */}
            <div className="lg:col-span-3 border-l pl-6">
              {activeTooth ? (
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Tooth {activeTooth.position} Details
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Current Condition</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {conditionOptions.map(option => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`condition-${option.id}`}
                              checked={activeTooth.condition.includes(option.id)}
                              onCheckedChange={(checked) => 
                                handleConditionChange(option.id, checked as boolean)
                              }
                            />
                            <Label htmlFor={`condition-${option.id}`}>{option.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-3">Desired Treatment</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {treatmentOptions.map(option => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`treatment-${option.id}`}
                              checked={activeTooth.treatment.includes(option.id)}
                              onCheckedChange={(checked) => 
                                handleTreatmentChange(option.id, checked as boolean)
                              }
                            />
                            <Label htmlFor={`treatment-${option.id}`}>{option.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Notes for This Tooth</h4>
                      <Textarea
                        placeholder="Add any specific concerns or questions about this tooth..."
                        value={activeTooth.notes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        className="h-20"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Tooth Selected</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Click on any tooth in the quadrant to mark its condition and select treatments
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Additional Notes</h3>
            <Textarea
              placeholder="Add any general dental concerns or questions here..."
              value={dentalData.generalNotes}
              onChange={handleGeneralNotesChange}
              className="h-24"
            />
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={() => onComplete(dentalData)}
              disabled={!hasTreatments}
            >
              {hasTreatments 
                ? "Continue to Quote Builder" 
                : "Please Select at Least One Treatment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};