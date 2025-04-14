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
      
      // Create a new jsPDF instance (A4 format, portrait)
      const doc = new jsPDF();
      
      // Format the current date
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Add header
      doc.setFillColor(41, 98, 255); // Blue header
      doc.rect(0, 0, 210, 40, 'F');
      
      // Add logo text in white
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text("MyDentalFly", 20, 25);
      
      // Add tagline
      doc.setFontSize(12);
      doc.text("Compare Dental Clinics. Book With Confidence. Fly With a Smile.", 20, 35);
      
      // Add Quote Info
      doc.setTextColor(70, 70, 70);
      doc.setFontSize(20);
      doc.text("Dental Treatment Quote", 105, 60, { align: 'center' });
      
      doc.setFontSize(11);
      doc.text(`Reference: MDF-${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`, 20, 70);
      doc.text(`Date: ${formattedDate}`, 20, 76);
      doc.text(`Valid until: ${new Date(currentDate.setDate(currentDate.getDate() + 60)).toLocaleDateString('en-GB')}`, 20, 82);
      
      // Add patient details
      doc.setFontSize(14);
      doc.setTextColor(41, 98, 255);
      doc.text("Patient Details", 20, 95);
      
      doc.setFontSize(11);
      doc.setTextColor(70, 70, 70);
      doc.text(`Name: ${patientName}`, 20, 105);
      doc.text(`Email: ${patientEmail}`, 20, 111);
      doc.text(`Phone: ${patientPhone}`, 20, 117);
      
      // Add clinic details
      doc.setFontSize(14);
      doc.setTextColor(41, 98, 255);
      doc.text("Clinic Details", 20, 135);
      
      doc.setFontSize(11);
      doc.setTextColor(70, 70, 70);
      doc.text(`Clinic: ${clinic.name}`, 20, 145);
      doc.text(`Location: ${clinic.location.area}, ${clinic.location.city}`, 20, 151);
      doc.text(`Rating: ${clinic.ratings.overall}/5`, 20, 157);
      
      // Treatment Table Header
      doc.setFontSize(14);
      doc.setTextColor(41, 98, 255);
      doc.text("Treatment Plan", 20, 175);
      
      // Create table
      doc.setFontSize(10);
      doc.setTextColor(70, 70, 70);
      
      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, 180, 170, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text("Treatment", 25, 185);
      doc.text("Quantity", 110, 185);
      doc.text("UK Cost", 135, 185);
      doc.text("Your Price", 165, 185, { align: 'right' });
      
      // Table rows
      let y = 195;
      doc.setFont('helvetica', 'normal');
      
      items.forEach((item, index) => {
        const clinicPrice = Math.round(item.subtotalGBP * clinic.priceFactor);
        
        // Alternate row colors
        if (index % 2 === 1) {
          doc.setFillColor(248, 248, 248);
          doc.rect(20, y-5, 170, 10, 'F');
        }
        
        doc.text(item.name, 25, y);
        doc.text(item.quantity.toString(), 110, y);
        doc.text(`£${item.subtotalGBP}`, 135, y);
        doc.text(`£${clinicPrice}`, 165, y, { align: 'right' });
        
        y += 10;
      });
      
      // Total
      doc.setFillColor(41, 98, 255, 0.1);
      doc.rect(20, y-5, 170, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text("TOTAL", 25, y);
      doc.text(`£${totalGBP}`, 135, y);
      doc.text(`£${clinicTotal}`, 165, y, { align: 'right' });
      
      // Savings
      const savings = totalGBP - clinicTotal;
      const savingsPercentage = Math.round((savings / totalGBP) * 100);
      
      y += 15;
      doc.setTextColor(0, 150, 0);
      doc.text(`You save: £${savings} (${savingsPercentage}% off UK prices)`, 165, y, { align: 'right' });
      
      // Additional info
      y += 20;
      doc.setFontSize(14);
      doc.setTextColor(41, 98, 255);
      doc.text("Additional Information", 20, y);
      
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(70, 70, 70);
      doc.setFont('helvetica', 'normal');
      doc.text("• This quote is an estimate based on the information provided.", 25, y);
      
      y += 7;
      doc.text("• Actual treatment costs may vary after in-person examination.", 25, y);
      
      y += 7;
      doc.text("• Price includes all dental work, materials, and appointments.", 25, y);
      
      y += 7;
      doc.text("• Treatment guarantees: Implants (up to 10 years), Crowns/Veneers (up to 5 years).", 25, y);
      
      // Footer
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, 270, 190, 270);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("MyDentalFly.com", 105, 277, { align: 'center' });
      doc.text("Compare Dental Clinics. Book With Confidence. Fly With a Smile.", 105, 282, { align: 'center' });
      
      // Generate formatted filename with date
      const now = new Date();
      const formattedDate2 = now.toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `MyDentalFly_Quote_${formattedDate2}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
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