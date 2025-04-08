import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';

interface QuoteItem {
  treatment: string;
  priceGBP: number;
  priceUSD: number;
  quantity: number;
  subtotalGBP: number;
  subtotalUSD: number;
  guarantee: string;
}

export interface ClinicComparison {
  name: string;
  priceGBP: number;
  extras: string;
  guarantee?: string;
  location?: string;
  rating?: string;
}

interface JSPDFGeneratorProps {
  items: QuoteItem[];
  totalGBP: number;
  totalUSD: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  travelMonth?: string;
  departureCity?: string;
  clinics?: ClinicComparison[];
  hasXrays?: boolean;
  xrayCount?: number;
  onComplete?: () => void;
}

export default function JSPDFGenerator({
  items,
  totalGBP,
  totalUSD,
  patientName,
  patientEmail,
  patientPhone,
  travelMonth,
  departureCity,
  clinics,
  hasXrays,
  xrayCount,
  onComplete
}: JSPDFGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generatePdf = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Log the travel info for debugging
      console.log('JSPDFGenerator travel info:', { 
        travelMonth, 
        departureCity
      });
      
      // Call the server-side jsPDF endpoint with version 2
      const response = await axios({
        method: 'post',
        url: '/api/jspdf-quote-v2',
        data: {
          items,
          totalGBP,
          totalUSD,
          patientName,
          patientEmail,
          patientPhone,
          travelMonth: travelMonth || 'year-round', // Ensure a fallback value
          departureCity: departureCity || 'UK', // Ensure a fallback value
          clinics,
          hasXrays,
          xrayCount
        },
        responseType: 'blob'
      });
      
      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate formatted filename with date
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `IstanbulDentalSmile_Quote_${formattedDate}.pdf`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      // Customer emails are now handled server-side through Mailjet
      // No need to send a duplicate email via EmailJS
      console.log('Customer email will be sent via Mailjet from the server');
      
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('jsPDF generation error:', err);
      setError('Failed to generate PDF. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Expose the PDF generation function to a global property
  // This allows us to call it directly from other components
  React.useEffect(() => {
    // Attach the generatePdf function to the window object
    // @ts-ignore - Adding custom property
    window.generateJsPdf = generatePdf;

    return () => {
      // Clean up when component unmounts
      // @ts-ignore - Removing custom property
      delete window.generateJsPdf;
    };
  }, []);

  return (
    <div id="jspdf-generator-ref" className="mt-4 jspdf-generator-container">
      <Button
        onClick={generatePdf}
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 font-medium text-lg transition-all duration-300 transform hover:-translate-y-1 group"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Your Quote...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 group-hover:animate-bounce" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            <div className="flex flex-col items-center">
              <span>Download Your Custom Quote PDF</span>
              {patientEmail && (
                <span className="text-xs opacity-90 mt-0.5">We'll also email you a copy</span>
              )}
            </div>
          </>
        )}
      </Button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}