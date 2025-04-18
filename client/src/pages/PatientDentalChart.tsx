import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DentalChart } from '@/components/DentalChart';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { AlertCircle, Calendar, Clock, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ChartData {
  chartId: string;
  patientName: string;
  patientEmail: string;
  createdAt: string;
  quoteId?: string;
  dentalChartData: any;
}

export default function PatientDentalChart() {
  const { toast } = useToast();
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChartIndex, setSelectedChartIndex] = useState<number | null>(null);
  const [email, setEmail] = useState<string>('');
  const [emailSubmitted, setEmailSubmitted] = useState<boolean>(false);
  
  // Attempt to get email from localStorage
  useEffect(() => {
    const quoteData = localStorage.getItem('lastQuoteData');
    if (quoteData) {
      try {
        const parsedData = JSON.parse(quoteData);
        if (parsedData.patientEmail) {
          setEmail(parsedData.patientEmail);
        }
      } catch (error) {
        console.error('Error parsing quote data from localStorage:', error);
      }
    }
  }, []);

  // Fetch dental charts for the patient
  const fetchCharts = async (userEmail: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/get-dental-chart?patientEmail=${encodeURIComponent(userEmail)}`);
      
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
        
        setEmailSubmitted(true);
      } else {
        toast({
          title: 'No Records Found',
          description: 'We couldn\'t find any dental charts for this email address.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching dental charts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your dental charts. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      fetchCharts(email);
    } else {
      toast({
        title: 'Email Required',
        description: 'Please enter the email address you used for your quote.',
        variant: 'destructive',
      });
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

  return (
    <div className="container mx-auto py-6">
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Your Dental Chart
          </CardTitle>
          <CardDescription className="text-gray-600">
            View and manage your dental information
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          {!emailSubmitted ? (
            <div className="max-w-md mx-auto">
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Your Dental Records</AlertTitle>
                <AlertDescription>
                  Please enter the email address you used when creating your quote to view your dental charts.
                </AlertDescription>
              </Alert>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Access My Dental Charts
                </Button>
              </form>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : charts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Dental Charts Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We couldn't find any dental charts associated with this email. Please make sure you're using the same email address you provided when creating your quote.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setEmailSubmitted(false)}
              >
                Try Another Email
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Chart selector */}
                <div className="md:w-1/3">
                  <h3 className="text-lg font-semibold mb-3">Your Dental Chart History</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {charts.map((chart, index) => (
                      <div 
                        key={chart.chartId}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedChartIndex === index 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedChartIndex(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            Dental Chart {charts.length - index}
                          </div>
                          <div className="text-xs text-gray-500">
                            {index === 0 && <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Latest</span>}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {formatDate(chart.createdAt)}
                          <Clock className="h-3.5 w-3.5 ml-3 mr-1" />
                          {formatTime(chart.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Chart display */}
                <div className="md:w-2/3">
                  {selectedChartIndex !== null && charts[selectedChartIndex] && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          Dental Chart from {formatDate(charts[selectedChartIndex].createdAt)}
                        </h3>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Print Chart
                        </Button>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <DentalChart 
                          initialTeeth={charts[selectedChartIndex].dentalChartData}
                          readOnly={true}
                        />
                      </div>
                      
                      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
                        <p className="font-medium mb-1">About This Dental Chart</p>
                        <p>
                          This dental chart was created on {formatDate(charts[selectedChartIndex].createdAt)} at {formatTime(charts[selectedChartIndex].createdAt)} and is associated with your treatment quote.
                          The clinic will use this information to better understand your dental needs.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}