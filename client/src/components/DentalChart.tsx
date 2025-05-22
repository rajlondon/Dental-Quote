import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Crown, Zap, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const [activeTab, setActiveTab] = useState('adult');
  const [teethData, setTeethData] = useState<TeethData>(initialData);
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);

  const toothStatuses = {
    healthy: { 
      color: '#10b981', 
      bgColor: '#ecfdf5',
      borderColor: '#059669',
      icon: CheckCircle,
      label: 'Healthy',
      description: 'Good condition'
    },
    decay: { 
      color: '#fbbf24', 
      bgColor: '#fef3c7',
      borderColor: '#d97706',
      icon: AlertTriangle,
      label: 'Decay/Cavity',
      description: 'Needs filling'
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
      color: '#9ca3af', 
      bgColor: '#f9fafb',
      borderColor: '#6b7280',
      icon: XCircle,
      label: 'Missing',
      description: 'Tooth missing'
    },
    implant: { 
      color: '#8b5cf6', 
      bgColor: '#ede9fe',
      borderColor: '#7c3aed',
      icon: Zap,
      label: 'Implant',
      description: 'Needs implant'
    },
    root_canal: { 
      color: '#ef4444', 
      bgColor: '#fef2f2',
      borderColor: '#dc2626',
      icon: AlertTriangle,
      label: 'Root Canal',
      description: 'Needs root canal'
    },
    extraction: { 
      color: '#dc2626', 
      bgColor: '#fef2f2',
      borderColor: '#b91c1c',
      icon: XCircle,
      label: 'Extraction',
      description: 'Needs extraction'
    },
    bridge: { 
      color: '#06b6d4', 
      bgColor: '#ecfeff',
      borderColor: '#0891b2',
      icon: Square,
      label: 'Bridge',
      description: 'Bridge treatment'
    },
    veneer: { 
      color: '#10b981', 
      bgColor: '#ecfdf5',
      borderColor: '#059669',
      icon: Square,
      label: 'Veneer',
      description: 'Veneer treatment'
    },
    whitening: { 
      color: '#f3f4f6', 
      bgColor: '#f9fafb',
      borderColor: '#e5e7eb',
      icon: CheckCircle,
      label: 'Whitening',
      description: 'Whitening treatment'
    },
    chipped: { 
      color: '#fcd34d', 
      bgColor: '#fefce8',
      borderColor: '#f59e0b',
      icon: AlertTriangle,
      label: 'Chipped',
      description: 'Chipped tooth'
    }
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
    const statusInfo = toothStatuses[status as keyof typeof toothStatuses] || toothStatuses.healthy;
    const StatusIcon = statusInfo.icon;
    
    return (
      <div 
        key={toothId}
        className={`
          relative transition-all duration-200 hover:scale-105 
          ${selectedTooth === toothId ? 'ring-2 ring-blue-500 scale-105' : ''} 
          ${editable ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}
        `}
        onClick={() => handleToothClick(toothId)}
        style={{ 
          width: '50px', 
          height: '50px', 
          margin: '4px',
          backgroundColor: statusInfo.bgColor,
          border: `2px solid ${statusInfo.borderColor}`,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
        title={`Tooth #${toothNumber}: ${statusInfo.label} - ${statusInfo.description}`}
      >
        {/* Tooth Number */}
        <span 
          className="text-sm font-bold"
          style={{ color: statusInfo.color }}
        >
          {toothNumber}
        </span>
        
        {/* Status Icon */}
        {status !== 'healthy' && (
          <StatusIcon 
            size={14} 
            style={{ color: statusInfo.color }}
            className="absolute top-1 right-1"
          />
        )}
        
        {/* Status Indicator */}
        <div 
          className="absolute bottom-1 left-1 w-2 h-2 rounded-full"
          style={{ backgroundColor: statusInfo.color }}
        />
      </div>
    );
  };

  const renderTeethRow = (teethNumbers: number[], isUpper: boolean) => {
    return (
      <div className="flex justify-center flex-wrap gap-1">
        {teethNumbers.map(toothNumber => renderTooth(toothNumber, isUpper))}
      </div>
    );
  };

  // Calculate treatment summary
  const getStatusSummary = () => {
    const summary: Record<string, number> = {};
    Object.values(teethData).forEach(tooth => {
      const status = tooth.status || 'healthy';
      summary[status] = (summary[status] || 0) + 1;
    });
    return summary;
  };

  const statusSummary = getStatusSummary();

  return (
    <div className="dental-chart w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="adult">Adult Teeth (32)</TabsTrigger>
          <TabsTrigger value="child">Child Teeth (20)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="adult" className="mt-0">
          <div className="space-y-8">
            {/* Upper Jaw */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-3 font-medium">Upper Jaw</div>
              {renderTeethRow(adultTeeth.upper, true)}
            </div>
            
            {/* Lower Jaw */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-3 font-medium">Lower Jaw</div>
              {renderTeethRow(adultTeeth.lower, false)}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="child" className="mt-0">
          <div className="space-y-8">
            {/* Upper Jaw */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-3 font-medium">Upper Jaw</div>
              {renderTeethRow(childTeeth.upper, true)}
            </div>
            
            {/* Lower Jaw */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-3 font-medium">Lower Jaw</div>
              {renderTeethRow(childTeeth.lower, false)}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Selected Tooth Editor */}
      {selectedTooth && editable && (
        <div className="mt-8 p-6 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            Edit Tooth #{selectedTooth}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(toothStatuses).map(([value, statusInfo]) => (
              <button
                key={value}
                onClick={() => handleStatusChange(value)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105
                  ${getToothStatus(selectedTooth) === value 
                    ? 'ring-2 ring-blue-500' 
                    : 'hover:shadow-md'
                  }
                `}
                style={{ 
                  backgroundColor: statusInfo.bgColor,
                  borderColor: statusInfo.borderColor
                }}
              >
                <div className="flex items-center justify-center mb-2">
                  <statusInfo.icon size={20} style={{ color: statusInfo.color }} />
                </div>
                <div className="text-sm font-medium" style={{ color: statusInfo.color }}>
                  {statusInfo.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Treatment Summary */}
      {Object.keys(statusSummary).length > 1 && (
        <div className="mt-8">
          <h4 className="text-md font-semibold mb-4">Treatment Summary</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusSummary).map(([status, count]) => {
              const statusInfo = toothStatuses[status as keyof typeof toothStatuses];
              if (!statusInfo || status === 'healthy') return null;
              
              return (
                <Badge 
                  key={status}
                  variant="outline"
                  className="px-3 py-1"
                  style={{ 
                    borderColor: statusInfo.borderColor,
                    color: statusInfo.color,
                    backgroundColor: statusInfo.bgColor
                  }}
                >
                  {count} {statusInfo.label}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-8">
        <h4 className="text-md font-semibold mb-4">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(toothStatuses).map(([key, statusInfo]) => (
            <div key={key} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border"
                style={{ 
                  backgroundColor: statusInfo.color,
                  borderColor: statusInfo.borderColor
                }}
              />
              <span className="text-sm">{statusInfo.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DentalChart;