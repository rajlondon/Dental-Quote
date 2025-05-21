import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Pencil, Save, RefreshCcw, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import { DentalChart } from '@/components/DentalChart';
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
            <CardDescription>{t('patient.dental_chart.description', 'View and manage your dental chart')}</CardDescription>
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
                      <div className="flex items-center bg-muted px-3 py-1 rounded text-sm">
                        <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                        {chartSource === 'quote' 
                          ? t('patient.dental_chart.source_quote', 'From quote system') 
                          : t('patient.dental_chart.source_portal', 'From patient portal')}
                        {quoteRequestId && (
                          <span className="ml-2 text-muted-foreground">
                            (Quote #{quoteRequestId})
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('patient.dental_chart.source_tooltip', 'This shows where your dental chart data originated from. Any changes made here will be synced with your quote data.')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            
            <DentalChart 
              initialData={currentChartData}
              onChange={handleTeethDataChange}
              editable={editMode}
            />
            
            {lastSyncDate && (
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  {t('patient.dental_chart.last_updated', 'Last updated')}: {new Date(lastSyncDate).toLocaleString()}
                </p>
                
                {quoteRequestId && (
                  <p className="text-sm text-muted-foreground">
                    {t('patient.dental_chart.synced_with_quote', 'Synced with Quote')} #{quoteRequestId}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">
              {t('patient.dental_chart.no_chart', 'You don\'t have a dental chart yet.')}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => refreshChartMutation.mutate()}
                disabled={refreshChartMutation.isPending}
              >
                {refreshChartMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <RefreshCcw className="h-4 w-4 mr-2" />
                {t('patient.dental_chart.load_from_quote', 'Load from Quote')}
              </Button>
              <Button
                onClick={() => setEditMode(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {t('patient.dental_chart.create', 'Create Dental Chart')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DentalChartSection;