import React, { useState, useEffect } from 'react';
// Removed react-i18next
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DentalChart } from '@/components/DentalChart';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { AlertCircle, Calendar, Clock, Download, Info, Save, Send, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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

  // Interactive chart state
  const [isInteractive, setIsInteractive] = useState(false);
  const [currentTeethData, setCurrentTeethData] = useState<any[]>([]);
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Get patient info from localStorage or session
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');

  // Load patient information from localStorage or session
  useEffect(() => {
    const quoteData = localStorage.getItem('lastQuoteData');
    if (quoteData) {
      try {
        const parsedData = JSON.parse(quoteData);
        if (parsedData.patientEmail) {
          setPatientEmail(parsedData.patientEmail);
          setPatientName(parsedData.patientName || 'Patient');
        }
      } catch (error) {
        console.error('Error parsing quote data:', error);
      }
    }
  }, []);

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

  // Handle teeth data updates from interactive chart
  const handleTeethUpdate = (teethData: any[]) => {
    setCurrentTeethData(teethData);
    setHasUnsavedChanges(true);
    console.log('Teeth data updated:', teethData);
  };

  // Save chart data locally and to server
  const saveChartData = async () => {
    if (!patientEmail || !currentTeethData.length) {
      toast({
        title: "Save Failed",
        description: "Missing patient information or chart data",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const chartData = {
        patientName: patientName,
        patientEmail: patientEmail,
        dentalChartData: currentTeethData,
        patientNotes: patientNotes,
        createdAt: new Date().toISOString(),
        quoteId: localStorage.getItem('lastQuoteId') || null
      };

      const response = await axios.post('/api/save-dental-chart', chartData);

      if (response.data.success) {
        setHasUnsavedChanges(false);
        toast({
          title: "Chart Saved",
          description: "Your dental chart has been saved successfully",
        });

        // Refresh the charts list
        if (patientEmail) {
          fetchCharts();
        }
      }
    } catch (error) {
      console.error('Error saving chart:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your dental chart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Send chart to clinic
  const sendToClinic = async () => {
    if (!patientEmail || !currentTeethData.length) {
      toast({
        title: "Send Failed",
        description: "Missing patient information or chart data",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);

      const chartData = {
        patientName: patientName,
        patientEmail: patientEmail,
        dentalChartData: currentTeethData,
        patientNotes: patientNotes,
        createdAt: new Date().toISOString(),
        quoteId: localStorage.getItem('lastQuoteId') || null,
        sendToClinic: true
      };

      const response = await axios.post('/api/send-dental-chart-to-clinic', chartData);

      if (response.data.success) {
        toast({
          title: "Sent to Clinic",
          description: "Your dental chart has been sent to the clinic successfully",
        });

        // Auto-save after sending
        await saveChartData();
      }
    } catch (error) {
      console.error('Error sending chart to clinic:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send your dental chart to the clinic. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

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
        title: 'Error',
        description: 'Failed to load your dental charts. Please try again later.',
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
              Dental Chart
            </h2>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Dental Charts Found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                You don't have any dental charts yet. Your dental chart will be created after your initial consultation with the dentist.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => fetchCharts()}
              >
                Refresh
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
          Dental Chart
        </h2>
        <div className="flex gap-2">
          <Button
            variant={isInteractive ? "default" : "outline"}
            onClick={() => setIsInteractive(!isInteractive)}
          >
            {isInteractive ? "View Mode" : "Edit Mode"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isInteractive ? "Interactive Dental Chart" : "Your Dental Chart"}
          </CardTitle>
          <CardDescription>
            {isInteractive 
              ? "Click on teeth to mark conditions and treatments, then save or send to clinic"
              : "View and track your dental conditions and treatments"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isInteractive ? (
            <div>
              <div className="mb-6">
                <Alert className="bg-green-50 text-green-700 border-green-100">
                  <Info className="h-4 w-4" />
                  <AlertTitle>
                    Interactive Mode
                  </AlertTitle>
                  <AlertDescription>
                    Click on any tooth to mark conditions (chipped, missing, painful) or desired treatments (implants, crowns, veneers). Your changes will be saved and can be sent to the clinic.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border mb-6">
                <DentalChart 
                  onTeethUpdate={handleTeethUpdate}
                  patientEmail={patientEmail}
                  patientName={patientName}
                  readOnly={false}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="patient-notes">Additional Notes for Clinic</Label>
                  <Textarea
                    id="patient-notes"
                    placeholder="Add any specific concerns, pain levels, or requests for the clinic..."
                    value={patientNotes}
                    onChange={(e) => {
                      setPatientNotes(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {hasUnsavedChanges && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
                        Unsaved Changes
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={saveChartData}
                      disabled={isSaving || !currentTeethData.length}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Chart"}
                    </Button>

                    <Button
                      onClick={sendToClinic}
                      disabled={isSending || !currentTeethData.length}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSending ? "Sending..." : "Send to Clinic"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <Alert className="bg-blue-50 text-blue-700 border-blue-100">
                  <Info className="h-4 w-4" />
                  <AlertTitle>
                    About Your Dental Chart
                  </AlertTitle>
                  <AlertDescription>
                    This chart shows your current dental status. Switch to Edit Mode to update your dental information and send it to the clinic.
                  </AlertDescription>
                </Alert>
              </div>

              {selectedChartIndex !== null && charts[selectedChartIndex] ? (
                <div>
                  {charts.length > 1 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium mb-2">
                        Chart History
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
                                (Latest)
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="font-medium">
                      Dental Chart from {formatDate(charts[selectedChartIndex].createdAt)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Last updated: {formatTime(charts[selectedChartIndex].createdAt)}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <DentalChart 
                      initialTeeth={charts[selectedChartIndex].dentalChartData}
                      readOnly={true}
                    />
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Chart
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Dental Charts Found</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    You don't have any dental charts yet. Switch to Edit Mode to create your first dental chart.
                  </p>
                  <Button 
                    onClick={() => setIsInteractive(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Create Your Dental Chart
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DentalChartSection;