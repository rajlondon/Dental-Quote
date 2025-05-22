import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Loader2, 
  RefreshCcw, 
  Save, 
  Edit, 
  Pencil, 
  Info,
  Heart,
  FileText
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type DentalChartData = {
  chartId: string;
  patientName: string;
  patientEmail: string;
  createdAt: string;
  lastUpdated?: string;
  quoteId?: string;
  teethData: Record<string, any>;
  quoteRequestId?: number;
  source?: 'quote' | 'patient_portal';
};

interface DentalChartSectionProps {
  initialData?: DentalChartData;
  onChartUpdate?: (data: DentalChartData) => void;
}

const DentalChartSection: React.FC<DentalChartSectionProps> = ({ 
  initialData, 
  onChartUpdate 
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editMode, setEditMode] = useState(false);
  const [currentChartData, setCurrentChartData] = useState<Record<string, any>>({});
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isToothModalOpen, setIsToothModalOpen] = useState(false);

  // Fetch dental chart data
  const { 
    data: chartData, 
    isLoading, 
    error 
  } = useQuery<DentalChartData>({
    queryKey: ['/api/patient/dental-chart'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/patient/dental-chart');
      return response.json();
    },
    initialData,
  });

  // Save dental chart mutation
  const saveDentalChartMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await apiRequest('POST', '/api/patient/dental-chart', {
        teethData: data,
        source: 'patient_portal'
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/patient/dental-chart'] });
      setEditMode(false);
      onChartUpdate?.(data);
      toast({
        title: t('patient.dental_chart.save_success', 'Chart Saved'),
        description: t('patient.dental_chart.save_success_desc', 'Your dental chart has been updated successfully.'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('patient.dental_chart.save_error', 'Save Failed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Refresh from quote mutation
  const refreshChartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/patient/dental-chart/refresh-from-quote');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/patient/dental-chart'] });
      onChartUpdate?.(data);
      toast({
        title: t('patient.dental_chart.refresh_success', 'Chart Refreshed'),
        description: t('patient.dental_chart.refresh_success_desc', 'Your dental chart has been updated with the latest quote data.'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('patient.dental_chart.refresh_error', 'Refresh Failed'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Initialize chart data
  useEffect(() => {
    if (chartData?.teethData) {
      setCurrentChartData(chartData.teethData);
    }
  }, [chartData]);

  // Handle tooth click
  const handleToothClick = (toothNumber: number) => {
    if (editMode) {
      setSelectedTooth(toothNumber);
      // Directly update the tooth condition for now (simpler interaction)
      const currentCondition = currentChartData[toothNumber.toString()]?.status || 'healthy';
      const nextCondition = currentCondition === 'healthy' ? 'decay' : 
                           currentCondition === 'decay' ? 'crown' : 'healthy';
      
      setCurrentChartData(prev => ({
        ...prev,
        [toothNumber.toString()]: {
          ...prev[toothNumber.toString()],
          status: nextCondition,
          lastUpdated: new Date().toISOString()
        }
      }));
      
      toast({
        title: `Tooth #${toothNumber} Updated`,
        description: `Condition changed to: ${nextCondition}`,
      });
    }
  };

  // Handle tooth condition update
  const handleToothConditionUpdate = (condition: string) => {
    if (selectedTooth) {
      setCurrentChartData(prev => ({
        ...prev,
        [selectedTooth.toString()]: {
          ...prev[selectedTooth.toString()],
          status: condition,
          lastUpdated: new Date().toISOString()
        }
      }));
      setIsToothModalOpen(false);
      setSelectedTooth(null);
    }
  };

  // Handle save chart
  const handleSaveChart = () => {
    saveDentalChartMutation.mutate(currentChartData);
  };

  const chartSource = chartData?.source;
  const quoteRequestId = chartData?.quoteRequestId;
  const lastSyncDate = chartData?.lastUpdated;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">{t('patient.dental_chart.loading', 'Loading dental chart...')}</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertTitle>{t('patient.dental_chart.error', 'Error Loading Chart')}</AlertTitle>
            <AlertDescription>
              {t('patient.dental_chart.error_desc', 'Unable to load your dental chart. Please try again later.')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              {t('patient.dental_chart.title', 'My Dental Chart')}
            </CardTitle>
            <CardDescription className="mt-1">
              {t('patient.dental_chart.description', 'Track your dental health and treatment progress')}
            </CardDescription>
          </div>
          
          {chartData && (
            <div className="flex gap-2 mt-4 md:mt-0">
              {editMode ? (
                <Button 
                  onClick={handleSaveChart}
                  disabled={saveDentalChartMutation.isPending}
                >
                  {saveDentalChartMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  {t('patient.dental_chart.save', 'Save Changes')}
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => refreshChartMutation.mutate()}
                    disabled={refreshChartMutation.isPending}
                    title={t('patient.dental_chart.refresh_tooltip', 'Update your dental chart with the latest data from your quote')}
                  >
                    {refreshChartMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    {t('patient.dental_chart.refresh', 'Refresh')}
                  </Button>
                  <Button onClick={() => setEditMode(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t('patient.dental_chart.edit', 'Edit Chart')}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartData ? (
          <div className="p-4 border rounded-lg bg-white">
            {chartSource && (
              <div className="mb-4 flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center px-3 py-1 rounded text-sm ${
                        chartSource === 'quote' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        <Info className="h-4 w-4 mr-2" />
                        {chartSource === 'quote' 
                          ? t('patient.dental_chart.source_quote', 'Data from your dental quote') 
                          : t('patient.dental_chart.source_portal', 'Data updated in patient portal')}
                        {quoteRequestId && (
                          <span className="ml-2 font-medium">
                            (Quote #{quoteRequestId})
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('patient.dental_chart.source_tooltip', 'This shows where your dental chart data originated from. Any changes made here will be synced with your quote data for continuity of care.')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {quoteRequestId && chartSource === 'quote' && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {t('patient.dental_chart.synced_with_quote_note', 'Your dental chart is synchronized with your treatment quote')}
                  </span>
                )}
              </div>
            )}
            
            {/* Instructions for editing mode */}
            {editMode && (
              <Alert className="mb-4">
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2 text-blue-500" />
                  <AlertTitle>{t('patient.dental_chart.edit_instructions_title', 'Editing Mode Active')}</AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  {t('patient.dental_chart.edit_instructions', 'Click on teeth to mark issues or treatments. Your changes will be saved to both your patient record and associated quote.')}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Beautiful Anatomical Dental Chart */}
            <div className="w-full">
              {/* 3D Mouth Representation */}
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
                
                {/* Upper Teeth Row - Interactive with edit mode */}
                <div className="absolute z-20" style={{ top: '25%', transform: 'translateY(-50%)' }}>
                  <div className="flex justify-center space-x-1">
                    {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map((toothNum, index) => {
                      const toothData = currentChartData?.[toothNum.toString()];
                      const hasIssue = toothData?.status && toothData.status !== 'healthy';
                      return (
                        <div
                          key={toothNum}
                          className={`w-4 h-5 border border-gray-400 rounded-sm cursor-pointer transition-colors flex items-center justify-center ${
                            hasIssue 
                              ? 'bg-red-200 hover:bg-red-300' 
                              : 'bg-white hover:bg-blue-100'
                          } ${editMode ? 'hover:scale-110' : ''}`}
                          title={`Tooth #${toothNum}${hasIssue ? ` - ${toothData.status}` : ''}`}
                          onClick={() => handleToothClick(toothNum)}
                        >
                          {hasIssue && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Lower Teeth Row - Interactive with edit mode */}
                <div className="absolute z-20" style={{ bottom: '25%', transform: 'translateY(50%)' }}>
                  <div className="flex justify-center space-x-1">
                    {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map((toothNum, index) => {
                      const toothData = currentChartData?.[toothNum.toString()];
                      const hasIssue = toothData?.status && toothData.status !== 'healthy';
                      return (
                        <div
                          key={toothNum}
                          className={`w-4 h-5 border border-gray-400 rounded-sm cursor-pointer transition-colors flex items-center justify-center ${
                            hasIssue 
                              ? 'bg-red-200 hover:bg-red-300' 
                              : 'bg-white hover:bg-blue-100'
                          } ${editMode ? 'hover:scale-110' : ''}`}
                          title={`Tooth #${toothNum}${hasIssue ? ` - ${toothData.status}` : ''}`}
                          onClick={() => handleToothClick(toothNum)}
                        >
                          {hasIssue && (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Mouth Label */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 font-medium">
                  {editMode ? 'Click teeth to edit conditions' : 'Professional Dental Chart'}
                </div>
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white border border-gray-400 rounded-sm"></div>
                  <span className="text-sm">Healthy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-200 border border-red-400 rounded-sm"></div>
                  <span className="text-sm">Needs Treatment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded-sm"></div>
                  <span className="text-sm">Treated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded-sm"></div>
                  <span className="text-sm">Missing</span>
                </div>
              </div>
            </div>
            
            {lastSyncDate && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 border-t pt-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <RefreshCcw className="h-3 w-3 mr-1" />
                  {t('patient.dental_chart.last_updated', 'Last updated')}: {new Date(lastSyncDate).toLocaleString()}
                </div>
                
                {quoteRequestId && (
                  <div className="flex items-center mt-1 md:mt-0">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium rounded px-2 py-0.5">
                      {t('patient.dental_chart.synced_with_quote', 'Synced with Quote')} #{quoteRequestId}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground mb-6">
              {t('patient.dental_chart.no_chart', 'You don\'t have a dental chart yet. You can create one or load data from your existing quote.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => refreshChartMutation.mutate()}
                disabled={refreshChartMutation.isPending}
                className="sm:mr-2"
              >
                {refreshChartMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <RefreshCcw className="h-4 w-4 mr-2" />
                {t('patient.dental_chart.load_from_quote', 'Load from Dental Quote')}
              </Button>
              <Button
                onClick={() => setEditMode(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {t('patient.dental_chart.create', 'Create New Dental Chart')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DentalChartSection;