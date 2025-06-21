import React, { useState, useEffect } from 'react';
// Removed react-i18next
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DentalChart } from '@/components/DentalChart';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { AlertCircle, Calendar, Clock, Download, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChartData {
  chartId: string;
  patientName: string;
  patientEmail: string;
  createdAt: string;
  quoteId?: string;
  dentalChartData: any;
}

const DentalChartSection: React.FC = () => {
  // Translation removed
  const { toast } = useToast();
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChartIndex, setSelectedChartIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // On component mount, check device size and set appropriate view mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('mobile');
      } else {
        setViewMode('desktop');
      }
    };

    // Initialize
    handleResize();

    // Add listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch dental charts for the patient
  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would use the authenticated user's info
      // For now, we'll simulate fetching charts from the API
      const response = await axios.get('/api/get-patient-dental-charts');
      
      if (response.data.success && response.data.charts) {
        // Sort charts by date, newest first
        const sortedCharts = response.data.charts.sort((a: ChartData, b: ChartData) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setCharts(sortedCharts);
        
        // Select the most recent chart by default
        if (sortedCharts.length > 0) {
          setSelectedChartIndex(0);
        }
      } else {
        // For demo purposes, create some mock data
        const mockCharts: ChartData[] = [
          {
            chartId: '1',
            patientName: 'John Doe',
            patientEmail: 'john.doe@example.com',
            createdAt: new Date().toISOString(),
            quoteId: 'Q123456',
            dentalChartData: [
              { id: 1, name: 'Upper Right Third Molar (1)', condition: null, treatment: null, notes: '' },
              { id: 2, name: 'Upper Right Second Molar (2)', condition: null, treatment: null, notes: '' },
              { id: 3, name: 'Upper Right First Molar (3)', condition: null, treatment: null, notes: '' },
              { id: 4, name: 'Upper Right Second Premolar (4)', condition: null, treatment: null, notes: '' },
              { id: 5, name: 'Upper Right First Premolar (5)', condition: null, treatment: null, notes: '' },
              { id: 6, name: 'Upper Right Canine (6)', condition: null, treatment: null, notes: '' },
              { id: 7, name: 'Upper Right Lateral Incisor (7)', condition: null, treatment: null, notes: '' },
              { id: 8, name: 'Upper Right Central Incisor (8)', condition: null, treatment: null, notes: '' },
              { id: 9, name: 'Upper Left Central Incisor (9)', condition: null, treatment: null, notes: '' },
              { id: 10, name: 'Upper Left Lateral Incisor (10)', condition: null, treatment: null, notes: '' },
              { id: 11, name: 'Upper Left Canine (11)', condition: null, treatment: null, notes: '' },
              { id: 12, name: 'Upper Left First Premolar (12)', condition: null, treatment: null, notes: '' },
              { id: 13, name: 'Upper Left Second Premolar (13)', condition: null, treatment: null, notes: '' },
              { id: 14, name: 'Upper Left First Molar (14)', condition: null, treatment: null, notes: '' },
              { id: 15, name: 'Upper Left Second Molar (15)', condition: null, treatment: null, notes: '' },
              { id: 16, name: 'Upper Left Third Molar (16)', condition: null, treatment: null, notes: '' },
              { id: 17, name: 'Lower Left Third Molar (17)', condition: null, treatment: null, notes: '' },
              { id: 18, name: 'Lower Left Second Molar (18)', condition: null, treatment: null, notes: '' },
              { id: 19, name: 'Lower Left First Molar (19)', condition: null, treatment: null, notes: '' },
              { id: 20, name: 'Lower Left Second Premolar (20)', condition: null, treatment: null, notes: '' },
              { id: 21, name: 'Lower Left First Premolar (21)', condition: null, treatment: null, notes: '' },
              { id: 22, name: 'Lower Left Canine (22)', condition: null, treatment: null, notes: '' },
              { id: 23, name: 'Lower Left Lateral Incisor (23)', condition: null, treatment: null, notes: '' },
              { id: 24, name: 'Lower Left Central Incisor (24)', condition: null, treatment: null, notes: '' },
              { id: 25, name: 'Lower Right Central Incisor (25)', condition: null, treatment: null, notes: '' },
              { id: 26, name: 'Lower Right Lateral Incisor (26)', condition: null, treatment: null, notes: '' },
              { id: 27, name: 'Lower Right Canine (27)', condition: null, treatment: null, notes: '' },
              { id: 28, name: 'Lower Right First Premolar (28)', condition: null, treatment: null, notes: '' },
              { id: 29, name: 'Lower Right Second Premolar (29)', condition: null, treatment: null, notes: '' },
              { id: 30, name: 'Lower Right First Molar (30)', condition: null, treatment: null, notes: '' },
              { id: 31, name: 'Lower Right Second Molar (31)', condition: null, treatment: null, notes: '' },
              { id: 32, name: 'Lower Right Third Molar (32)', condition: null, treatment: null, notes: '' }
            ]
          }
        ];
        setCharts(mockCharts);
        setSelectedChartIndex(0);
      }
    } catch (error) {
      console.error('Error fetching dental charts:', error);
      toast({
        title: t('portal.dental_chart.error', 'Error'),
        description: t('portal.dental_chart.fetch_error', 'Failed to load your dental charts. Please try again later.'),
        variant: 'destructive',
      });
      
      // For demo purposes, create a mock chart
      const mockCharts: ChartData[] = [
        {
          chartId: '1',
          patientName: 'John Doe',
          patientEmail: 'john.doe@example.com',
          createdAt: new Date().toISOString(),
          quoteId: 'Q123456',
          dentalChartData: [
            { id: 1, name: 'Upper Right Third Molar (1)', condition: null, treatment: null, notes: '' },
            { id: 2, name: 'Upper Right Second Molar (2)', condition: null, treatment: null, notes: '' },
            { id: 3, name: 'Upper Right First Molar (3)', condition: null, treatment: null, notes: '' },
            { id: 4, name: 'Upper Right Second Premolar (4)', condition: null, treatment: null, notes: '' },
            { id: 5, name: 'Upper Right First Premolar (5)', condition: null, treatment: null, notes: '' },
            { id: 6, name: 'Upper Right Canine (6)', condition: null, treatment: null, notes: '' },
            { id: 7, name: 'Upper Right Lateral Incisor (7)', condition: null, treatment: null, notes: '' },
            { id: 8, name: 'Upper Right Central Incisor (8)', condition: null, treatment: null, notes: '' },
            { id: 9, name: 'Upper Left Central Incisor (9)', condition: null, treatment: null, notes: '' },
            { id: 10, name: 'Upper Left Lateral Incisor (10)', condition: null, treatment: null, notes: '' },
            { id: 11, name: 'Upper Left Canine (11)', condition: null, treatment: null, notes: '' },
            { id: 12, name: 'Upper Left First Premolar (12)', condition: null, treatment: null, notes: '' },
            { id: 13, name: 'Upper Left Second Premolar (13)', condition: null, treatment: null, notes: '' },
            { id: 14, name: 'Upper Left First Molar (14)', condition: null, treatment: null, notes: '' },
            { id: 15, name: 'Upper Left Second Molar (15)', condition: null, treatment: null, notes: '' },
            { id: 16, name: 'Upper Left Third Molar (16)', condition: null, treatment: null, notes: '' },
            { id: 17, name: 'Lower Left Third Molar (17)', condition: null, treatment: null, notes: '' },
            { id: 18, name: 'Lower Left Second Molar (18)', condition: null, treatment: null, notes: '' },
            { id: 19, name: 'Lower Left First Molar (19)', condition: null, treatment: null, notes: '' },
            { id: 20, name: 'Lower Left Second Premolar (20)', condition: null, treatment: null, notes: '' },
            { id: 21, name: 'Lower Left First Premolar (21)', condition: null, treatment: null, notes: '' },
            { id: 22, name: 'Lower Left Canine (22)', condition: null, treatment: null, notes: '' },
            { id: 23, name: 'Lower Left Lateral Incisor (23)', condition: null, treatment: null, notes: '' },
            { id: 24, name: 'Lower Left Central Incisor (24)', condition: null, treatment: null, notes: '' },
            { id: 25, name: 'Lower Right Central Incisor (25)', condition: null, treatment: null, notes: '' },
            { id: 26, name: 'Lower Right Lateral Incisor (26)', condition: null, treatment: null, notes: '' },
            { id: 27, name: 'Lower Right Canine (27)', condition: null, treatment: null, notes: '' },
            { id: 28, name: 'Lower Right First Premolar (28)', condition: null, treatment: null, notes: '' },
            { id: 29, name: 'Lower Right Second Premolar (29)', condition: null, treatment: null, notes: '' },
            { id: 30, name: 'Lower Right First Molar (30)', condition: null, treatment: null, notes: '' },
            { id: 31, name: 'Lower Right Second Molar (31)', condition: null, treatment: null, notes: '' },
            { id: 32, name: 'Lower Right Third Molar (32)', condition: null, treatment: null, notes: '' }
          ]
        }
      ];
      setCharts(mockCharts);
      setSelectedChartIndex(0);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (charts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {t('portal.dental_chart.title', 'Dental Chart')}
          </h2>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('portal.dental_chart.no_charts', 'No Dental Charts Found')}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {t('portal.dental_chart.no_charts_desc', 'You don\'t have any dental charts yet. Your dental chart will be created after your initial consultation with the dentist.')}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => fetchCharts()}
              >
                {t('portal.dental_chart.refresh', 'Refresh')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {t('portal.dental_chart.title', 'Dental Chart')}
        </h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {t('portal.dental_chart.your_chart', 'Your Dental Chart')}
          </CardTitle>
          <CardDescription>
            {t('portal.dental_chart.desc', 'View and track your dental conditions and treatments')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Alert className="bg-blue-50 text-blue-700 border-blue-100">
              <Info className="h-4 w-4" />
              <AlertTitle>
                {t('portal.dental_chart.info_title', 'About Your Dental Chart')}
              </AlertTitle>
              <AlertDescription>
                {t('portal.dental_chart.info_desc', 'This chart shows your current dental status. It will be updated by your dentist during your treatment.')}
              </AlertDescription>
            </Alert>
          </div>

          {selectedChartIndex !== null && charts[selectedChartIndex] && (
            <div>
              {charts.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">
                    {t('portal.dental_chart.chart_history', 'Chart History')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {charts.map((chart, index) => (
                      <Badge
                        key={chart.chartId}
                        variant={selectedChartIndex === index ? "default" : "outline"}
                        className={`cursor-pointer ${selectedChartIndex === index ? "" : "hover:bg-gray-100"}`}
                        onClick={() => setSelectedChartIndex(index)}
                      >
                        {formatDate(chart.createdAt)}
                        {index === 0 && (
                          <span className="ml-1 text-xs">
                            ({t('portal.dental_chart.latest', 'Latest')})
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="font-medium">
                  {t('portal.dental_chart.chart_from', 'Dental Chart from')}{' '}
                  {formatDate(charts[selectedChartIndex].createdAt)}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('portal.dental_chart.last_updated', 'Last updated')}: {formatTime(charts[selectedChartIndex].createdAt)}
                </p>
              </div>
              
              <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as 'desktop' | 'mobile')}>
                <div className="flex justify-end mb-4">
                  <TabsList>
                    <TabsTrigger value="desktop">
                      {t('portal.dental_chart.detailed_view', 'Detailed View')}
                    </TabsTrigger>
                    <TabsTrigger value="mobile">
                      {t('portal.dental_chart.simple_view', 'Simple View')}
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="desktop" className="mt-0">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <DentalChart 
                      initialTeeth={charts[selectedChartIndex].dentalChartData}
                      readOnly={true}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="mobile" className="mt-0">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="font-medium mb-4">
                      {t('portal.dental_chart.simplified_chart', 'Simplified Dental Chart')}
                    </h4>
                    
                    <div className="space-y-6">
                      <div>
                        <h5 className="text-sm font-medium mb-2">
                          {t('portal.dental_chart.upper_teeth', 'Upper Teeth')}
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border rounded-lg p-3">
                            <h6 className="text-xs font-medium text-gray-500 mb-2">
                              {t('portal.dental_chart.upper_right', 'Upper Right')}
                            </h6>
                            <ul className="text-sm space-y-2">
                              {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                                <li key={`ur-${num}`} className="flex justify-between">
                                  <span>UR{num}</span>
                                  <span className="text-green-600">Healthy</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="border rounded-lg p-3">
                            <h6 className="text-xs font-medium text-gray-500 mb-2">
                              {t('portal.dental_chart.upper_left', 'Upper Left')}
                            </h6>
                            <ul className="text-sm space-y-2">
                              {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                                <li key={`ul-${num}`} className="flex justify-between">
                                  <span>UL{num}</span>
                                  <span className="text-green-600">Healthy</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2">
                          {t('portal.dental_chart.lower_teeth', 'Lower Teeth')}
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border rounded-lg p-3">
                            <h6 className="text-xs font-medium text-gray-500 mb-2">
                              {t('portal.dental_chart.lower_right', 'Lower Right')}
                            </h6>
                            <ul className="text-sm space-y-2">
                              {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                                <li key={`lr-${num}`} className="flex justify-between">
                                  <span>LR{num}</span>
                                  <span className="text-green-600">Healthy</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="border rounded-lg p-3">
                            <h6 className="text-xs font-medium text-gray-500 mb-2">
                              {t('portal.dental_chart.lower_left', 'Lower Left')}
                            </h6>
                            <ul className="text-sm space-y-2">
                              {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                                <li key={`ll-${num}`} className="flex justify-between">
                                  <span>LL{num}</span>
                                  <span className="text-green-600">Healthy</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t('portal.dental_chart.export', 'Export Chart')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DentalChartSection;