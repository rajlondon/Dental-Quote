import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from 'react-i18next';

type TeethData = Record<string, {
  status: string;
  notes?: string;
}>;

type DentalChartProps = {
  initialData?: Record<string, any>;
  onChange?: (data: Record<string, any>) => void;
  editable?: boolean;
};

export const DentalChart: React.FC<DentalChartProps> = ({ 
  initialData = {}, 
  onChange = () => {}, 
  editable = false 
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('adult');
  const [teethData, setTeethData] = useState<TeethData>(initialData);
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);

  const toothStatuses = {
    healthy: { color: '#4ade80', label: t('dental_chart.status.healthy', 'Healthy') },
    decay: { color: '#f97316', label: t('dental_chart.status.decay', 'Decay') },
    filling: { color: '#3b82f6', label: t('dental_chart.status.filling', 'Filling') },
    crown: { color: '#ffd700', label: t('dental_chart.status.crown', 'Crown') },
    missing: { color: '#d1d5db', label: t('dental_chart.status.missing', 'Missing') },
    implant: { color: '#8b5cf6', label: t('dental_chart.status.implant', 'Implant') },
    bridge: { color: '#ec4899', label: t('dental_chart.status.bridge', 'Bridge') },
    root_canal: { color: '#ef4444', label: t('dental_chart.status.root_canal', 'Root Canal') },
  };

  const adultTeeth = {
    upper: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
    lower: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
  };

  const childTeeth = {
    upper: [55, 54, 53, 52, 51, 61, 62, 63, 64, 65],
    lower: [85, 84, 83, 82, 81, 71, 72, 73, 74, 75]
  };

  useEffect(() => {
    setTeethData(initialData);
  }, [initialData]);

  const handleToothClick = (toothId: string) => {
    if (!editable) return;
    setSelectedTooth(toothId);
  };

  const handleStatusChange = (status: string) => {
    if (!selectedTooth || !editable) return;
    
    const updatedData = {
      ...teethData,
      [selectedTooth]: {
        ...teethData[selectedTooth],
        status
      }
    };
    
    setTeethData(updatedData);
    onChange(updatedData);
  };

  const getToothStatus = (toothId: string) => {
    return teethData[toothId]?.status || 'healthy';
  };

  const renderTooth = (toothNumber: number, isUpper: boolean) => {
    const toothId = toothNumber.toString();
    const status = getToothStatus(toothId);
    const toothColor = toothStatuses[status as keyof typeof toothStatuses]?.color || toothStatuses.healthy.color;
    
    return (
      <div 
        key={toothId}
        className={`tooth ${selectedTooth === toothId ? 'ring-2 ring-primary' : ''} ${!editable ? 'cursor-default' : 'cursor-pointer'}`}
        onClick={() => handleToothClick(toothId)}
        style={{ 
          width: '40px', 
          height: '40px', 
          margin: '4px',
          backgroundColor: toothColor,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: status === 'healthy' ? '#000' : '#fff'
        }}
      >
        {toothNumber}
      </div>
    );
  };

  const renderTeethRow = (teethNumbers: number[], isUpper: boolean) => {
    return (
      <div className="flex justify-center flex-wrap">
        {teethNumbers.map(toothNumber => renderTooth(toothNumber, isUpper))}
      </div>
    );
  };

  return (
    <div className="dental-chart">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="adult">{t('dental_chart.adult_teeth', 'Adult Teeth')}</TabsTrigger>
          <TabsTrigger value="child">{t('dental_chart.child_teeth', 'Child Teeth')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="adult" className="mt-0">
          <div className="mb-6">
            <div className="text-center text-sm text-muted-foreground mb-2">
              {t('dental_chart.upper_jaw', 'Upper Jaw')}
            </div>
            {renderTeethRow(adultTeeth.upper, true)}
          </div>
          
          <div>
            <div className="text-center text-sm text-muted-foreground mb-2">
              {t('dental_chart.lower_jaw', 'Lower Jaw')}
            </div>
            {renderTeethRow(adultTeeth.lower, false)}
          </div>
        </TabsContent>
        
        <TabsContent value="child" className="mt-0">
          <div className="mb-6">
            <div className="text-center text-sm text-muted-foreground mb-2">
              {t('dental_chart.upper_jaw', 'Upper Jaw')}
            </div>
            {renderTeethRow(childTeeth.upper, true)}
          </div>
          
          <div>
            <div className="text-center text-sm text-muted-foreground mb-2">
              {t('dental_chart.lower_jaw', 'Lower Jaw')}
            </div>
            {renderTeethRow(childTeeth.lower, false)}
          </div>
        </TabsContent>
      </Tabs>
      
      {selectedTooth && editable && (
        <div className="mt-6 p-4 border rounded-lg">
          <h3 className="text-md font-medium mb-3">
            {t('dental_chart.tooth', 'Tooth')} #{selectedTooth}
          </h3>
          
          <RadioGroup 
            value={getToothStatus(selectedTooth)}
            onValueChange={handleStatusChange}
            className="grid grid-cols-2 gap-2 md:grid-cols-4"
          >
            {Object.entries(toothStatuses).map(([value, { color, label }]) => (
              <div key={value} className="flex items-center space-x-2">
                <RadioGroupItem value={value} id={`status-${value}`} />
                <Label htmlFor={`status-${value}`} className="flex items-center">
                  <div 
                    style={{ 
                      backgroundColor: color, 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '2px',
                      marginRight: '6px'
                    }} 
                  />
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
      
      <div className="mt-4">
        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries(toothStatuses).map(([key, { color, label }]) => (
            <div key={key} className="flex items-center">
              <div 
                style={{ 
                  backgroundColor: color, 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '2px',
                  marginRight: '6px'
                }} 
              />
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DentalChart;