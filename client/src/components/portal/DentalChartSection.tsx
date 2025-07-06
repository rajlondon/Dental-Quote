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
    const loadPatientInfo = async () => {
      // First try to get from localStorage
      const quoteData = localStorage.getItem('lastQuoteData');
      if (quoteData) {
        try {
          const parsedData = JSON.parse(quoteData);
          if (parsedData.patientEmail) {
            setPatientEmail(parsedData.patientEmail);
            setPatientName(parsedData.patientName || 'Patient');
            return;
          }
        } catch (error) {
          console.error('Error parsing quote data:', error);
        }
      }

      // If not found in localStorage, try to get current user from session
      try {
        const response = await axios.get('/api/auth/user');
        if (response.data && response.data.email) {
          setPatientEmail(response.data.email);
          setPatientName(`${response.data.firstName || ''} ${response.data.lastName || ''}`.trim() || 'Patient');
        } else {
          // Set a default email for testing if no user found
          setPatientEmail('patient@mydentalfly.co.uk');
          setPatientName('Test Patient');
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        // Set a default email for testing
        setPatientEmail('patient@mydentalfly.co.uk');
        setPatientName('Test Patient');
      }
    };

    loadPatientInfo();
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

  // Initialize teeth data when switching to interactive mode
  useEffect(() => {
    if (isInteractive && currentTeethData.length === 0) {
      // Initialize with default teeth structure
      const defaultTeeth = [
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
      ];
      setCurrentTeethData(defaultTeeth);
    }
  }, [isInteractive]);

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

      if (response.data && response.data.success) {
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
    if (patientEmail) {
      fetchCharts();
    }
  }, [patientEmail]);

  const fetchCharts = async () => {
    if (!patientEmail) {
      console.log('No patient email available yet');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching charts for patient email:', patientEmail);
      
      // Always create a demo chart for testing purposes since the API may not be fully set up
      console.log('Creating demo chart for testing');
      const mockCharts: ChartData[] = [
        {
          chartId: 'demo-1',
          patientName: patientName || 'Demo Patient',
          patientEmail: patientEmail,
          createdAt: new Date().toISOString(),
          quoteId: 'DEMO-123',
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
      console.log('Demo chart created successfully');
      
    } catch (error) {
      console.error('Error in fetchCharts:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Interactive Dental Chart
        </h2>
        <div className="flex gap-2">
          <Button
            variant={isInteractive ? "default" : "outline"}
            onClick={() => setIsInteractive(!isInteractive)}
          >
            {isInteractive ? "View Mode" : "Interactive Mode"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Mark Your Dental Conditions & Treatments
          </CardTitle>
          <CardDescription>
            Use our interactive dental chart to mark existing conditions and desired treatments. Your clinic will receive this information to create a personalized treatment plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Alert className="bg-blue-50 text-blue-700 border-blue-100">
              <Info className="h-4 w-4" />
              <AlertTitle>
                How to Use
              </AlertTitle>
              <AlertDescription>
                Click on any tooth to mark conditions (chipped, missing, painful) or desired treatments (implants, crowns, veneers). Your changes are automatically saved and can be sent to your chosen clinic.
              </AlertDescription>
            </Alert>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
            <DentalChart 
              onTeethUpdate={handleTeethUpdate}
              patientEmail={patientEmail}
              patientName={patientName}
              readOnly={!isInteractive}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="patient-notes">Additional Notes for Clinic</Label>
              <Textarea
                id="patient-notes"
                placeholder="Describe any pain, sensitivity, concerns, or specific requests for your treatment..."
                value={patientNotes}
                onChange={(e) => {
                  setPatientNotes(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Unsaved Changes
                  </Badge>
                )}
                {currentTeethData.length > 0 && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {currentTeethData.filter(tooth => tooth.condition || tooth.treatment).length} teeth marked
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

          {/* Chart History Section */}
          {charts.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Previous Charts</h3>
              <div className="grid gap-4">
                {charts.map((chart, index) => (
                  <div key={chart.chartId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Chart from {formatDate(chart.createdAt)}</h4>
                        <p className="text-sm text-gray-500">{formatTime(chart.createdAt)}</p>
                      </div>
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        {index === 0 ? "Latest" : "Previous"}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedChartIndex(index)}
                    >
                      View Chart
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DentalChartSection;