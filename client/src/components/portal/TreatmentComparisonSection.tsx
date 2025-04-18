import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ClinicTreatmentComparison from '../../components/ClinicTreatmentComparison';
import { TreatmentItem } from '@/components/TreatmentPlanBuilder';
import { useToast } from '@/hooks/use-toast';
import { Download, FileDown, Share2 } from 'lucide-react';

/**
 * Treatment Comparison section for the Client Portal
 * Shows comparison of treatments across different clinics
 */
const TreatmentComparisonSection: React.FC = () => {
  const { toast } = useToast();
  const [selectedTreatments, setSelectedTreatments] = useState<TreatmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock fetch treatments from treatment plan
  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchTreatments = async () => {
      setLoading(true);
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data (in real app, this would come from API)
        const treatments: TreatmentItem[] = [
          { 
            id: 'dental_implant_standard', 
            name: 'Dental Implant (Standard)', 
            quantity: 2,
            category: 'Implants',
            priceGBP: 1200,
            priceUSD: 1500,
            subtotalGBP: 2400,
            subtotalUSD: 3000
          },
          { 
            id: 'porcelain_crown', 
            name: 'Porcelain Crown', 
            quantity: 3,
            category: 'Veneers & Crowns',
            priceGBP: 500,
            priceUSD: 650,
            subtotalGBP: 1500,
            subtotalUSD: 1950
          },
          { 
            id: 'zoom_whitening', 
            name: 'Zoom Whitening (In-office)', 
            quantity: 1,
            category: 'Whitening',
            priceGBP: 300,
            priceUSD: 400,
            subtotalGBP: 300,
            subtotalUSD: 400
          },
        ];
        
        setSelectedTreatments(treatments);
      } catch (error) {
        console.error('Error fetching treatments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your treatment plan. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTreatments();
  }, [toast]);

  const handleDownloadComparison = () => {
    toast({
      title: 'Comparison PDF',
      description: 'Your treatment comparison PDF is being generated. It will download shortly.',
    });
    // In a real app, this would trigger a PDF download
  };
  
  const handleShareComparison = () => {
    toast({
      title: 'Share Comparison',
      description: 'A link to your comparison has been copied to clipboard.',
    });
    // In a real app, this would generate a shareable link
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (selectedTreatments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Treatment Comparison</CardTitle>
          <CardDescription>
            No treatments available for comparison. Please create a treatment plan first.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button variant="outline">Create Treatment Plan</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Treatment Comparison</h1>
          <p className="text-muted-foreground">
            Compare your selected treatments across our partner clinics
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleDownloadComparison}
          >
            <FileDown className="h-4 w-4" />
            PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleShareComparison}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Selected Treatments</CardTitle>
          <CardDescription>
            These are the treatments you've selected for comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 divide-y">
            {selectedTreatments.map((treatment) => (
              <li key={treatment.id} className="flex justify-between items-center py-2">
                <div>
                  <span className="font-medium">{treatment.name}</span>
                  <Badge variant="outline" className="ml-2">{treatment.category}</Badge>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-muted-foreground">Quantity: {treatment.quantity}</span>
                  <span className="text-sm font-semibold">£{treatment.subtotalGBP.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Separator />
      
      <Tabs defaultValue="comparison">
        <TabsList className="mb-4">
          <TabsTrigger value="comparison">Clinic Comparison</TabsTrigger>
          <TabsTrigger value="details">Treatment Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comparison">
          {/* Temporarily comment out until we properly adapt the interface 
          <ClinicTreatmentComparison 
            treatmentMap={{}}
            clinics={[]}
            selectedTreatments={['Dental Implant']}
          /> */}
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                Treatment comparison view is being configured
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Details</CardTitle>
              <CardDescription>
                Detailed information about each treatment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedTreatments.map((treatment) => (
                  <div key={treatment.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{treatment.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Category: {treatment.category}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Quantity: {treatment.quantity}</div>
                      <div>Unit Price: £{treatment.priceGBP.toFixed(2)}</div>
                      <div>Subtotal: £{treatment.subtotalGBP.toFixed(2)}</div>
                      <div>USD: ${treatment.subtotalUSD.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center mt-6">
        <Button>Contact a Treatment Coordinator</Button>
      </div>
    </div>
  );
};

export default TreatmentComparisonSection;