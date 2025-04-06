import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import logoPath from '@assets/logo.jpeg';
import tickIconPath from '@assets/tick.png';
import hotelIconPath from '@assets/hotel.png';
import carIconPath from '@assets/car.png';
import chatIconPath from '@assets/chat.png';

// Import the template using the vite raw loader
// This will load the template as a string
const templateUrl = '/api/quote-template';

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

interface TemplatePdfGeneratorProps {
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

export default function TemplatePdfGenerator({
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
}: TemplatePdfGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate a unique quote number in the format IDS-YYYYMMDD-XX## (where XX are random letters)
  const generateQuoteNumber = () => {
    const date = format(new Date(), 'yyyyMMdd');
    const randomLetters = Array(2)
      .fill(0)
      .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
      .join('');
    const randomNumbers = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0');
    return `IDS-${date}-${randomLetters}${randomNumbers}`;
  };

  // Calculate UK vs Istanbul comparison
  const calculateUKPrice = () => {
    // Estimate UK prices at ~3x Istanbul prices
    return Math.round(totalGBP * 3);
  };
  
  const calculateSavings = () => {
    const ukPrice = calculateUKPrice();
    return ukPrice - totalGBP;
  };
  
  const calculateSavingsPercentage = () => {
    const ukPrice = calculateUKPrice();
    const savings = calculateSavings();
    return Math.round((savings / ukPrice) * 100);
  };

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      
      // Calculate derived values
      const quoteNumber = generateQuoteNumber();
      const currentDate = format(new Date(), 'MMMM dd, yyyy');
      const ukPrice = calculateUKPrice();
      const savings = calculateSavings();
      const savingsPercentage = calculateSavingsPercentage();
      
      // Convert image paths to base64 or use absolute URLs
      // For this example, we'll use absolute URLs for simplicity
      const baseUrl = window.location.origin;
      
      // Prepare the template data
      const templateData = {
        quoteNumber,
        currentDate,
        patientName,
        patientEmail,
        patientPhone,
        treatments: items,
        totalGBP,
        totalUSD,
        clinics: clinics.map((clinic, index) => ({
          ...clinic,
          index: index + 1
        })),
        travelMonth,
        departureCity,
        flightEstimate: 250, // Replace with actual flight estimate
        ukPrice,
        savings,
        savingsPercentage,
        logoUrl: `${baseUrl}/api/asset?path=${encodeURIComponent(logoPath)}`,
        tickIcon: `${baseUrl}/api/asset?path=${encodeURIComponent(tickIconPath)}`,
        hotelIcon: `${baseUrl}/api/asset?path=${encodeURIComponent(hotelIconPath)}`,
        carIcon: `${baseUrl}/api/asset?path=${encodeURIComponent(carIconPath)}`,
        chatIcon: `${baseUrl}/api/asset?path=${encodeURIComponent(chatIconPath)}`
      };

      // Send template data to server for PDF generation
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

      // Get the PDF as blob
      const pdfBlob = await response.blob();
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      const filename = `IstanbulDentalSmile_Quote_${format(new Date(), 'dd-MM-yyyy')}.pdf`;
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      if (onComplete) {
        onComplete();
      }

      toast({
        title: 'PDF Generated',
        description: 'Your PDF quote has been generated successfully.',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={generatePDF}
        disabled={isGenerating}
        className={cn(
          "w-full mt-4 bg-primary text-white hover:bg-primary/90",
          isGenerating && "opacity-70 cursor-not-allowed"
        )}
      >
        {isGenerating ? 'Generating PDF...' : 'Generate PDF Quote'}
      </Button>
    </div>
  );
}