import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Pencil, Save, RefreshCcw, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import { DentalChart3D } from '@/components/DentalChart3D';
import { toast } from '@/hooks/use-toast';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const DentalChartSection = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [currentChartData, setCurrentChartData] = useState<Record<string, any>>({});
  const [chartSource, setChartSource] = useState<'quote' | 'patient_portal' | undefined>(undefined);
  const [quoteRequestId, setQuoteRequestId] = useState<number | undefined>(undefined);
  const [lastSyncDate, setLastSyncDate] = useState<string | undefined>(undefined);

  // Fetch dental chart data
  const { data: chartData, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/dental-chart'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/dental-chart');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch dental chart');
      }
      if (data.chartData) {
        setCurrentChartData(data.chartData.teethData || {});
        setChartSource(data.chartData.source);
        setQuoteRequestId(data.chartData.quoteRequestId);
        setLastSyncDate(data.chartData.lastUpdated);
      }
      return data.chartData;
    }
  });

  // Save dental chart mutation
  const saveDentalChartMutation = useMutation({
    mutationFn: async (teethData: Record<string, any>) => {
      const res = await apiRequest('POST', '/api/dental-chart', { 
        teethData,
        quoteRequestId,
        source: 'patient_portal'
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save dental chart');
      }
      return data.chartData;
    },
    onSuccess: (updatedChartData) => {
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ['/api/dental-chart'] });
      setLastSyncDate(new Date().toISOString());
      
      toast({
        title: 'Dental chart saved',
        description: 'Your dental chart has been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to save dental chart',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Force refresh chart data from quotes if available
  const refreshChartMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/dental-chart/refresh', {});
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to refresh dental chart');
      }
      return data.chartData;
    },
    onSuccess: (updatedChartData) => {
      if (updatedChartData) {
        setCurrentChartData(updatedChartData.teethData || {});
        setChartSource(updatedChartData.source);
        setQuoteRequestId(updatedChartData.quoteRequestId);
        setLastSyncDate(updatedChartData.lastUpdated);
      }
      refetch();
      
      toast({
        title: 'Dental chart refreshed',
        description: 'Your dental chart has been refreshed with the latest data.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to refresh dental chart',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleTeethDataChange = (newTeethData: Record<string, any>) => {
    setCurrentChartData(newTeethData);
  };

  const handleSaveChart = () => {
    saveDentalChartMutation.mutate(currentChartData);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('patient.dental_chart.title', 'Dental Chart')}</CardTitle>
          <CardDescription>{t('patient.dental_chart.description', 'View and manage your dental chart')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('patient.dental_chart.title', 'Dental Chart')}</CardTitle>
          <CardDescription>{t('patient.dental_chart.description', 'View and manage your dental chart')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('patient.dental_chart.error_title', 'Error')}</AlertTitle>
            <AlertDescription>
              {t('patient.dental_chart.fetch_error', 'Failed to load dental chart. Please try again later.')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('patient.dental_chart.title', 'Dental Chart')}</CardTitle>
            <CardDescription>{t('patient.dental_chart.description', 'View and manage your dental health record')}</CardDescription>
          </div>
          {chartData && (
            <div className="flex gap-2">
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
                    {t('patient.dental_chart.refresh', 'Refresh from Quote')}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setEditMode(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
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
              <Alert className="mb-4" variant="outline">
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
                
                {/* Upper Teeth Row */}
                <div className="absolute z-20" style={{ top: '25%', transform: 'translateY(-50%)' }}>
                  <div className="flex justify-center space-x-1">
                    {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map((toothNum, index) => (
                      <div
                        key={toothNum}
                        className="w-4 h-5 bg-white border border-gray-400 rounded-sm cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-center"
                        title={`Tooth #${toothNum}`}
                        style={{ fontSize: '8px', fontWeight: 'bold' }}
                      >
                        {toothNum}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Lower Teeth Row */}
                <div className="absolute z-20" style={{ top: '75%', transform: 'translateY(-50%)' }}>
                  <div className="flex justify-center space-x-1">
                    {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map((toothNum, index) => (
                      <div
                        key={toothNum}
                        className="w-4 h-5 bg-white border border-gray-400 rounded-sm cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-center"
                        title={`Tooth #${toothNum}`}
                        style={{ fontSize: '8px', fontWeight: 'bold' }}
                      >
                        {toothNum}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Mouth Label */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 font-medium">
                  Interactive Dental Chart - Click teeth to edit
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