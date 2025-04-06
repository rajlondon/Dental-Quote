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

interface ClinicComparison {
  name: string;
  priceGBP: number;
  extras: string;
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
  onComplete
}: JSPDFGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generatePdf = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the server-side jsPDF endpoint
      const response = await axios({
        method: 'post',
        url: '/api/jspdf-quote',
        data: {
          items,
          totalGBP,
          totalUSD,
          patientName,
          patientEmail,
          patientPhone,
          travelMonth,
          departureCity,
          clinics
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
  
  return (
    <div className="mt-4">
      <Button
        onClick={generatePdf}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isLoading ? 'Generating...' : 'Generate PDF with jsPDF'}
      </Button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}