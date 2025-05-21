import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Pencil, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';
import { useTranslation } from 'react-i18next';
import { DentalChart } from '@/components/DentalChart';
import { toast } from '@/hooks/use-toast';

type DentalChartData = {
  chartId: string;
  patientName: string;
  patientEmail: string;
  createdAt: string;
  lastUpdated?: string;
  quoteId?: string;
  teethData: Record<string, any>;
};

const DentalChartSection = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [currentChartData, setCurrentChartData] = useState<Record<string, any>>({});

  // Fetch dental chart data
  const { data: chartData, isLoading, isError } = useQuery({
    queryKey: ['/api/get-dental-chart'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/get-dental-chart');
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch dental chart');
      }
      if (data.chartData) {
        setCurrentChartData(data.chartData.teethData || {});
      }
      return data.chartData;
    }
  });

  // Save dental chart mutation
  const saveDentalChartMutation = useMutation({
    mutationFn: async (teethData: Record<string, any>) => {
      const res = await apiRequest('POST', '/api/save-dental-chart', { teethData });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save dental chart');
      }
      return data.chartData;
    },
    onSuccess: (updatedChartData) => {
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ['/api/get-dental-chart'] });
      
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
                <Button 
                  variant="outline"
                  onClick={() => setEditMode(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {t('patient.dental_chart.edit', 'Edit Chart')}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartData ? (
          <div className="p-4 border rounded-lg bg-white">
            <DentalChart 
              initialData={currentChartData}
              onChange={handleTeethDataChange}
              editable={editMode}
            />
            {chartData.lastUpdated && (
              <p className="text-sm text-muted-foreground mt-4">
                {t('patient.dental_chart.last_updated', 'Last updated')}: {new Date(chartData.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">
              {t('patient.dental_chart.no_chart', 'You don\'t have a dental chart yet.')}
            </p>
            <Button
              onClick={() => setEditMode(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              {t('patient.dental_chart.create', 'Create Dental Chart')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DentalChartSection;