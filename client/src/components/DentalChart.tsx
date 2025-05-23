import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type TeethData = Record<string, {
  status: string;
  notes?: string;
}>;

interface DentalChartProps {
  initialData?: TeethData;
  onChange?: (data: Record<string, any>) => void;
  editable?: boolean;
  onTeethUpdate?: (updatedTeeth: any[]) => void;
  initialTeeth?: any[];
}

export const DentalChart: React.FC<DentalChartProps> = ({ 
  initialData = {}, 
  onChange = () => {}, 
  editable = true,
  onTeethUpdate,
  initialTeeth = []
}) => {
  const { toast } = useToast();
  const [teethData, setTeethData] = useState<TeethData>(initialData);
  const [selectedCondition, setSelectedCondition] = useState<string>('healthy');

  const getToothColor = (status: string) => {
    const colors = {
      healthy: '#ffffff',
      decay: '#fbbf24',
      filling: '#3b82f6',
      crown: '#f59e0b',
      missing: '#9ca3af',
      root_canal: '#ef4444',
      implant: '#06b6d4',
      bridge: '#8b5cf6',
      veneer: '#ec4899',
      extraction: '#dc2626',
      cleaning: '#10b981',
      whitening: '#6366f1'
    };
    return colors[status as keyof typeof colors] || colors.healthy;
  };

  const handleToothClick = (toothNum: number) => {
    if (!editable) return;

    const newTeethData = {
      ...teethData,
      [toothNum]: {
        status: selectedCondition,
        notes: teethData[toothNum]?.notes || ''
      }
    };

    setTeethData(newTeethData);
    onChange(newTeethData);

    toast({
      title: "Tooth Updated",
      description: `Tooth ${toothNum} marked as ${selectedCondition}`,
    });
  };

  return (
    <div className="w-full">
      {/* Interactive Color Legend - Select condition first, then click teeth */}
      {editable && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium mb-3 text-gray-700">Select condition, then click on teeth:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[
              { key: 'healthy', label: 'Healthy', color: '#ffffff' },
              { key: 'decay', label: 'Decay/Cavity', color: '#fbbf24' },
              { key: 'filling', label: 'Filling', color: '#3b82f6' },
              { key: 'crown', label: 'Crown', color: '#f59e0b' },
              { key: 'missing', label: 'Missing', color: '#9ca3af' },
              { key: 'implant', label: 'Implant', color: '#8b5cf6' },
              { key: 'root_canal', label: 'Root Canal', color: '#ef4444' },
              { key: 'extraction', label: 'Extraction', color: '#dc2626' },
              { key: 'bridge', label: 'Bridge', color: '#06b6d4' },
              { key: 'veneer', label: 'Veneer', color: '#10b981' },
              { key: 'whitening', label: 'Whitening', color: '#f3f4f6' },
              { key: 'chipped', label: 'Chipped', color: '#fcd34d' }
            ].map((condition) => (
              <div 
                key={condition.key}
                className={`flex items-center space-x-2 p-3 rounded cursor-pointer transition-all ${
                  selectedCondition === condition.key 
                    ? 'bg-blue-100 border-2 border-blue-500' 
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCondition(condition.key)}
              >
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: condition.color, borderColor: '#9ca3af' }}
                ></div>
                <span className="text-sm font-medium">{condition.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Beautiful 3D Mouth Representation - Same as Patient Portal */}
      <div className="relative w-full h-[400px] rounded-lg bg-pink-100 overflow-hidden border-2 border-red-300 flex flex-col justify-center items-center mb-6">
        {/* Outer mouth oval - anatomical shape */}
        <div className="absolute w-[80%] h-[90%] bg-[#ec8c74] rounded-[100%/50%] border-4 border-[#ec8c74]"></div>
        
        {/* Middle section - pink oral cavity area */}
        <div className="absolute w-[70%] h-[65%] bg-[#f8a9a3] rounded-[100%/50%]"></div>
        
        {/* Upper gums - red bar */}
        <div className="absolute top-[25%] w-[60%] h-[8%] bg-[#f05450] z-10"></div>
        
        {/* Lower gums - red bar */}
        <div className="absolute bottom-[25%] w-[60%] h-[8%] bg-[#f05450] z-10"></div>
        
        {/* Center tongue area */}
        <div className="absolute w-[40%] h-[25%] bg-[#e57373] rounded-[100%/50%] z-5"></div>
        
        {/* Upper Teeth Row - Interactive with Numbers */}
        <div className="absolute z-20" style={{ top: '25%', transform: 'translateY(-50%)' }}>
          <div className="flex justify-center space-x-1">
            {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map((toothNum) => {
              const toothData = teethData[toothNum.toString()];
              const hasIssue = toothData?.status && toothData.status !== 'healthy';
              return (
                <div key={toothNum} className="relative">
                  <div
                    className={`w-4 h-5 border rounded-sm cursor-pointer transition-all duration-200 flex items-center justify-center ${editable ? 'hover:scale-110' : ''}`}
                    style={{
                      backgroundColor: getToothColor(toothData?.status || 'healthy'),
                      borderColor: hasIssue ? '#374151' : '#9ca3af',
                      borderWidth: '2px'
                    }}
                    title={`Tooth #${toothNum}${hasIssue ? ` - ${toothData.status}` : ' - healthy'}`}
                    onClick={() => handleToothClick(toothNum)}
                  >
                    {hasIssue && toothData?.status !== 'missing' && (
                      <div 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: '#1f2937' }}
                      ></div>
                    )}
                  </div>
                  {/* Tooth Number Label */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                    {toothNum}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Lower Teeth Row - Interactive with Numbers */}
        <div className="absolute z-20" style={{ bottom: '25%', transform: 'translateY(50%)' }}>
          <div className="flex justify-center space-x-1">
            {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map((toothNum) => {
              const toothData = teethData[toothNum.toString()];
              const hasIssue = toothData?.status && toothData.status !== 'healthy';
              return (
                <div key={toothNum} className="relative">
                  <div
                    className={`w-4 h-5 border rounded-sm cursor-pointer transition-all duration-200 flex items-center justify-center ${editable ? 'hover:scale-110' : ''}`}
                    style={{
                      backgroundColor: getToothColor(toothData?.status || 'healthy'),
                      borderColor: hasIssue ? '#374151' : '#9ca3af',
                      borderWidth: '2px'
                    }}
                    title={`Tooth #${toothNum}${hasIssue ? ` - ${toothData.status}` : ' - healthy'}`}
                    onClick={() => handleToothClick(toothNum)}
                  >
                    {hasIssue && toothData?.status !== 'missing' && (
                      <div 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: '#1f2937' }}
                      ></div>
                    )}
                  </div>
                  {/* Tooth Number Label */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                    {toothNum}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Mouth Label */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 font-medium">
          {editable ? 'Click teeth to edit conditions' : 'Professional Dental Chart'}
        </div>
      </div>

      {/* Interactive Condition Selector for editable mode */}
      {editable && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-800 mb-3">Select Dental Condition</h5>
          <p className="text-sm text-blue-600 mb-4">Choose a condition below, then click any tooth to mark it:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[
              { key: 'healthy', label: 'Healthy', color: '#ffffff' },
              { key: 'decay', label: 'Decay/Cavity', color: '#fbbf24' },
              { key: 'filling', label: 'Filling', color: '#3b82f6' },
              { key: 'crown', label: 'Crown', color: '#f59e0b' },
              { key: 'root_canal', label: 'Root Canal', color: '#ef4444' },
              { key: 'implant', label: 'Implant', color: '#06b6d4' },
              { key: 'bridge', label: 'Bridge', color: '#8b5cf6' },
              { key: 'veneer', label: 'Veneer', color: '#ec4899' },
              { key: 'extraction', label: 'Extraction Needed', color: '#dc2626' },
              { key: 'cleaning', label: 'Cleaning Needed', color: '#10b981' },
              { key: 'whitening', label: 'Whitening', color: '#6366f1' },
              { key: 'missing', label: 'Missing', color: '#9ca3af' }
            ].map((condition) => {
              const isSelected = selectedCondition === condition.key;
              return (
                <div 
                  key={condition.key} 
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-blue-200 border-2 border-blue-500' 
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCondition(condition.key)}
                >
                  <div
                    className="w-4 h-4 rounded border-2"
                    style={{ 
                      backgroundColor: condition.color, 
                      borderColor: isSelected ? '#2563eb' : '#9ca3af' 
                    }}
                  ></div>
                  <span className={`text-sm ${isSelected ? 'font-semibold text-blue-800' : 'text-gray-700'}`}>
                    {condition.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-blue-600">
            Currently selected: <span className="font-semibold">{selectedCondition}</span>
          </div>
        </div>
      )}

      {/* Static Legend for viewing mode */}
      {!editable && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-800 mb-3">Condition Legend</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[
              { key: 'healthy', label: 'Healthy', color: '#ffffff' },
              { key: 'decay', label: 'Needs Treatment', color: '#fbbf24' },
              { key: 'filling', label: 'Treated', color: '#3b82f6' },
              { key: 'missing', label: 'Missing', color: '#9ca3af' }
            ].map((condition) => {
              return (
                <div key={condition.key} className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: condition.color, borderColor: '#9ca3af' }}
                  ></div>
                  <span className="text-sm text-gray-700">{condition.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DentalChart;