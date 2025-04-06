import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getQueryFn } from '@/lib/queryClient';
import { format } from 'date-fns';
import { getFlightEstimateForCity } from '../services/flightEstimatesService';

interface QuoteItem {
  treatment: string;
  priceGBP: number;
  priceUSD: number;
  quantity: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
}

interface ClinicComparison {
  name: string;
  priceGBP: number;
  extras: string;
}

interface ServerPdfGeneratorProps {
  items: QuoteItem[];
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  travelMonth?: string;
  departureCity?: string;
  clinics?: ClinicComparison[];
  onComplete?: () => void;
}

export default function ServerPdfGenerator({
  items,
  totalGBP,
  totalUSD,
  patientName = '',
  patientEmail = '',
  patientPhone = '',
  travelMonth = '',
  departureCity = '',
  clinics = [],
  onComplete
}: ServerPdfGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuoteNumber = () => {
    const now = new Date();
    const datePart = format(now, 'yyyyMMdd');
    const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `IDS-${datePart}-${randomPart}`;
  };

  const generatePdf = async () => {
    setIsGenerating(true);
    
    try {
      // Get flight cost estimate if available
      let flightCost = '---';
      if (travelMonth && departureCity) {
        const estimate = getFlightEstimateForCity(departureCity, travelMonth);
        if (estimate) {
          flightCost = estimate.toString();
        }
      }
      
      // Prepare template data
      const templateData = {
        quoteNumber: generateQuoteNumber(),
        date: format(new Date(), 'dd MMMM yyyy'),
        name: patientName || 'Not provided',
        email: patientEmail || 'Not provided',
        phone: patientPhone || 'Not provided',
        items: items.map(item => ({
          treatment: item.treatment,
          priceGBP: item.priceGBP.toLocaleString(),
          priceUSD: item.priceUSD.toLocaleString(),
          quantity: item.quantity,
          guarantee: item.guarantee
        })),
        totalGBP: totalGBP.toLocaleString(),
        totalUSD: totalUSD.toLocaleString(),
        travelMonth: travelMonth || 'Not specified',
        departureCity: departureCity || 'Not specified',
        flightCost: flightCost,
        clinics: clinics.map(clinic => ({
          name: clinic.name,
          priceGBP: clinic.priceGBP.toLocaleString(),
          extras: clinic.extras
        }))
      };
      
      // Send request to generate PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Get the PDF as a blob
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and click it to download the PDF
      const a = document.createElement('a');
      a.href = url;
      a.download = `IstanbulDentalSmile_Quote_${format(new Date(), 'MM-dd-yyyy')}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'PDF Generated',
        description: 'Your quote has been generated and downloaded.',
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'There was an error generating your PDF. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePdf}
      disabled={isGenerating}
      className="w-full flex items-center justify-center mt-4"
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF Quote
        </>
      )}
    </Button>
  );
}