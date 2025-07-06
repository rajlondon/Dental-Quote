import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { DentalChart } from '@/components/DentalChart';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Search, Calendar, User } from 'lucide-react';

interface ChartData {
  chartId: string;
  patientName: string;
  patientEmail: string;
  createdAt: string;
  quoteId?: string;
}

export default function ClinicDentalCharts() {
  const { toast } = useToast();
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [filteredCharts, setFilteredCharts] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [showDentalChart, setShowDentalChart] = useState(false);

  // Fetch all dental charts from the server
  useEffect(() => {
    const fetchCharts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/all-dental-charts');
        
        if (response.data.success && response.data.charts) {
          setCharts(response.data.charts);
          setFilteredCharts(response.data.charts);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load dental charts',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching dental charts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dental charts',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCharts();
  }, [toast]);

  // Filter charts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCharts(charts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = charts.filter(
      chart => 
        chart.patientName?.toLowerCase().includes(query) || 
        chart.patientEmail?.toLowerCase().includes(query) ||
        chart.chartId?.toLowerCase().includes(query)
    );
    
    setFilteredCharts(filtered);
  }, [searchQuery, charts]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Handle viewing a dental chart
  const handleViewChart = (chartId: string) => {
    setSelectedChartId(chartId);
    setShowDentalChart(true);
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Patient Dental Charts
              </CardTitle>
              <CardDescription className="text-gray-600">
                View and manage all patient dental chart data including charts sent from patient portal
              </CardDescription>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search patients..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {showDentalChart && selectedChartId ? (
            <div className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Patient Dental Chart
                </h3>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDentalChart(false)}
                >
                  Back to List
                </Button>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border">
                <DentalChart 
                  chartId={selectedChartId}
                  readOnly={true}
                />
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredCharts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No dental charts found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCharts.map((chart) => (
                        <TableRow key={chart.chartId}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <User className="h-4 w-4" />
                              </div>
                              <span>{chart.patientName || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{chart.patientEmail}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>{formatDate(chart.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewChart(chart.chartId)}
                            >
                              View Dental Chart
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}