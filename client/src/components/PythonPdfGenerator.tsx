import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

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

interface PythonPdfGeneratorProps {
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

export default function PythonPdfGenerator({
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
}: PythonPdfGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePythonPdf = async () => {
    setIsGenerating(true);
    
    try {
      // Prepare quote data
      const quoteData = {
        items,
        totalGBP,
        totalUSD,
        patientName,
        patientEmail,
        patientPhone,
        travelMonth,
        departureCity,
        clinics,
        quoteDate: new Date().toISOString().split('T')[0],
        quoteNumber: `IDS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      };
      
      // Make request to Python Flask endpoint
      const response = await axios({
        method: 'post',
        url: '/api/python/generate-quote',
        data: quoteData,
        responseType: 'blob',
      });
      
      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `IstanbulDentalSmile_Quote_${quoteData.quoteNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: 'Success',
        description: 'Python PDF quote has been generated and downloaded.',
      });
      
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error generating Python PDF:', error);
      toast({
        title: 'Error',
        description: 'Could not generate PDF from Python service.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Button 
      onClick={generatePythonPdf} 
      disabled={isGenerating} 
      className="bg-[#3776AB] hover:bg-[#2D5F8B] text-white"
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
          Python PDF
        </>
      )}
    </Button>
  );
}