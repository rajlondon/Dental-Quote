import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { FileCheck } from 'lucide-react';

interface QuoteItem {
  name: string;
  quantity: number;
  subtotalGBP: number;
  category: string;
}

interface ClinicData {
  id: string;
  name: string;
  tier: string;
  description: string;
  priceFactor: number;
  features: string[];
  location: {
    area: string;
    city: string;
  };
  ratings: {
    overall: number;
  };
  guarantees: {
    implants: string;
    veneers: string;
    crowns: string;
    fillings: string;
  };
}

interface ClientPdfGeneratorProps {
  items: QuoteItem[];
  totalGBP: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  clinic: ClinicData;
  clinicTotal: number;
  className?: string;
  buttonText?: string;
  onComplete?: () => void;
}

const ClientPdfGenerator: React.FC<ClientPdfGeneratorProps> = ({
  items,
  totalGBP,
  patientName,
  patientEmail,
  patientPhone,
  clinic,
  clinicTotal,
  className = '',
  buttonText = 'Download Quote PDF',
  onComplete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const generatePdf = async () => {
    setIsLoading(true);
    
    try {
      toast({
        title: "Generating PDF",
        description: "Preparing your quote PDF...",
      });
      
      console.log("Starting PDF generation");
      
      // Create a new jsPDF instance with explicit parameters
      const doc = new jsPDF('p', 'mm', 'a4');
      console.log("jsPDF instance created");
      
      // Simple content for testing
      doc.setFontSize(22);
      doc.text("MyDentalFly Quote", 20, 20);
      
      doc.setFontSize(14);
      doc.text("Patient: " + patientName, 20, 40);
      doc.text("Clinic: " + clinic.name, 20, 50);
      
      doc.setFontSize(12);
      doc.text("Treatment Summary:", 20, 70);
      
      let y = 80;
      items.forEach((item, index) => {
        doc.text(`${item.name} (x${item.quantity}) - £${item.subtotalGBP}`, 25, y);
        y += 10;
      });
      
      doc.setFontSize(14);
      doc.text(`Total UK Cost: £${totalGBP}`, 20, y + 10);
      doc.text(`Your Price: £${clinicTotal}`, 20, y + 20);
      doc.text(`You Save: £${totalGBP - clinicTotal}`, 20, y + 30);
      
      // Footer
      doc.setFontSize(10);
      doc.text("MyDentalFly.com - Compare Dental Clinics. Book With Confidence.", 20, 270);
      
      console.log("PDF content added, saving...");
      
      // Generate a simple filename
      const filename = `MyDentalFly_Quote.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      console.log("PDF saved");
      
      toast({
        title: "Quote PDF Generated",
        description: "Your quote has been downloaded.",
      });
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={generatePdf} 
      disabled={isLoading}
      className={className}
      variant="outline"
    >
      <FileCheck className="mr-2 h-4 w-4" />
      {isLoading ? 'Generating...' : buttonText}
    </Button>
  );
};

export default ClientPdfGenerator;