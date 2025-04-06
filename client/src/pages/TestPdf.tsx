import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import PdfGenerator from '@/components/PdfGenerator';
import ServerPdfGenerator from '@/components/ServerPdfGenerator';
import PythonPdfGenerator from '@/components/PythonPdfGenerator';
import JourneyPdf from '@/components/JourneyPdf';
import TemplatePdfGenerator from '@/components/TemplatePdfGenerator';
import axios from 'axios';

export default function TestPdf() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample dental treatment data for testing PDF generation
  const sampleData = {
    items: [
      {
        treatment: "Dental Veneers",
        priceGBP: 250,
        priceUSD: 310,
        quantity: 8,
        subtotalGBP: 2000,
        subtotalUSD: 2480,
        guarantee: "5 Years"
      },
      {
        treatment: "Teeth Whitening",
        priceGBP: 180,
        priceUSD: 225,
        quantity: 1,
        subtotalGBP: 180,
        subtotalUSD: 225,
        guarantee: "1 Year"
      }
    ],
    totalGBP: 2180,
    totalUSD: 2705,
    patientName: "Test Patient",
    patientEmail: "test@example.com",
    patientPhone: "+44 7123 456789",
    travelMonth: "July",
    departureCity: "London",
    clinics: [
      {
        name: "DentGroup Istanbul",
        priceGBP: 2071,
        extras: "5-Star Reviews, Premium Service"
      },
      {
        name: "Vera Smile",
        priceGBP: 2006,
        extras: "Central Location, Experienced Surgeons"
      },
      {
        name: "LuxClinic Turkey",
        priceGBP: 2180,
        extras: "Luxury Experience, 10 Year Guarantee"
      }
    ]
  };

  const testDirectPdfGeneration = async () => {
    setIsGenerating(true);
    
    try {
      // Make request directly to the server
      const response = await axios({
        method: 'post',
        url: '/api/python/generate-quote',
        data: sampleData,
        responseType: 'blob',
      });
      
      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `IstanbulDentalSmile_Direct_Test.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: 'Success',
        description: 'Direct PDF test was successful!',
      });
    } catch (error) {
      console.error('Error in direct PDF test:', error);
      toast({
        title: 'Error',
        description: 'Direct PDF test failed. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onPdfComplete = () => {
    toast({
      title: 'PDF Generated',
      description: 'Your PDF was successfully generated and downloaded.',
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center mb-2">PDF Generation Test Page</CardTitle>
        <CardDescription className="text-center mb-6">
          Test all PDF generation methods to ensure they're working correctly
        </CardDescription>
      </CardHeader>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sample Patient Data</CardTitle>
          <CardDescription>This data will be used for all PDF tests</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-[200px]">
            {JSON.stringify(sampleData, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>PDF Generation Options</CardTitle>
          <CardDescription>Click a button to test each PDF generation method</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <PdfGenerator 
            items={sampleData.items}
            totalGBP={sampleData.totalGBP}
            totalUSD={sampleData.totalUSD}
            patientName={sampleData.patientName}
            patientEmail={sampleData.patientEmail}
            patientPhone={sampleData.patientPhone}
            travelMonth={sampleData.travelMonth}
            departureCity={sampleData.departureCity}
            clinics={sampleData.clinics}
            onComplete={onPdfComplete}
          />
          
          <ServerPdfGenerator 
            items={sampleData.items}
            totalGBP={sampleData.totalGBP}
            totalUSD={sampleData.totalUSD}
            patientName={sampleData.patientName}
            patientEmail={sampleData.patientEmail}
            patientPhone={sampleData.patientPhone}
            travelMonth={sampleData.travelMonth}
            departureCity={sampleData.departureCity}
            clinics={sampleData.clinics}
            onComplete={onPdfComplete}
          />
          
          <PythonPdfGenerator 
            items={sampleData.items}
            totalGBP={sampleData.totalGBP}
            totalUSD={sampleData.totalUSD}
            patientName={sampleData.patientName}
            patientEmail={sampleData.patientEmail}
            patientPhone={sampleData.patientPhone}
            travelMonth={sampleData.travelMonth}
            departureCity={sampleData.departureCity}
            clinics={sampleData.clinics}
            onComplete={onPdfComplete}
          />
          
          <JourneyPdf 
            items={sampleData.items}
            totalGBP={sampleData.totalGBP}
            totalUSD={sampleData.totalUSD}
            patientName={sampleData.patientName}
            patientEmail={sampleData.patientEmail}
            onComplete={onPdfComplete}
          />
          
          <TemplatePdfGenerator 
            items={sampleData.items}
            totalGBP={sampleData.totalGBP}
            totalUSD={sampleData.totalUSD}
            patientName={sampleData.patientName}
            patientEmail={sampleData.patientEmail}
            patientPhone={sampleData.patientPhone}
            travelMonth={sampleData.travelMonth}
            departureCity={sampleData.departureCity}
            clinics={sampleData.clinics}
            onComplete={onPdfComplete}
          />

          <Button 
            onClick={testDirectPdfGeneration} 
            disabled={isGenerating} 
            className="bg-purple-700 hover:bg-purple-800 text-white"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                Direct API Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}