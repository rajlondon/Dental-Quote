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

interface SimplePdfGeneratorProps {
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

export default function SimplePdfGenerator({
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
}: SimplePdfGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generatePdf = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the server to generate a simple HTML view
      const response = await axios.post('/api/simple-pdf', {
        items,
        totalGBP,
        totalUSD,
        patientName,
        patientEmail,
        patientPhone,
        travelMonth,
        departureCity,
        clinics
      }, {
        responseType: 'text'
      });
      
      // Open the generated HTML in a new window
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(response.data);
        newWindow.document.close();
        
        // Option to print
        newWindow.print();
      } else {
        setError('Pop-up blocked. Please allow pop-ups to view the quote.');
      }
      
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('PDF generation error:', err);
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
        className="w-full bg-primary hover:bg-primary/80"
      >
        {isLoading ? 'Generating...' : 'Generate Simple HTML View'}
      </Button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}