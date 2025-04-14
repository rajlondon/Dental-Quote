import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import html2pdf from 'html2pdf.js';
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
      
      console.log("Starting PDF generation with html2pdf.js");
      
      // Format date for display
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Calculate quote values
      const savings = totalGBP - clinicTotal;
      const savingsPercentage = Math.round((savings / totalGBP) * 100);
      
      // Generate a reference number
      const referenceNumber = `MDF-${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Create an HTML template for the PDF
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif; color: #333;">
          <div style="background-color: #2962ff; padding: 20px; margin-bottom: 30px; color: white;">
            <h1 style="margin: 0; font-size: 28px;">MyDentalFly</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Compare Dental Clinics. Book With Confidence. Fly With a Smile.</p>
          </div>
          
          <h2 style="text-align: center; color: #444; margin-bottom: 30px;">Dental Treatment Quote</h2>
          
          <div style="margin-bottom: 30px;">
            <p><strong>Reference:</strong> ${referenceNumber}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Valid until:</strong> ${new Date(currentDate.setDate(currentDate.getDate() + 60)).toLocaleDateString('en-GB')}</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #2962ff; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Patient Details</h3>
            <p><strong>Name:</strong> ${patientName}</p>
            <p><strong>Email:</strong> ${patientEmail}</p>
            <p><strong>Phone:</strong> ${patientPhone}</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #2962ff; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Clinic Details</h3>
            <p><strong>Clinic:</strong> ${clinic.name}</p>
            <p><strong>Location:</strong> ${clinic.location.area}, ${clinic.location.city}</p>
            <p><strong>Rating:</strong> ${clinic.ratings.overall}/5</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #2962ff; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Treatment Plan</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Treatment</th>
                <th style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">Quantity</th>
                <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">UK Cost</th>
                <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Your Price</th>
              </tr>
              
              ${items.map((item, index) => {
                const clinicPrice = Math.round(item.subtotalGBP * clinic.priceFactor);
                const bgColor = index % 2 === 1 ? '#f9f9f9' : 'white';
                return `
                  <tr style="background-color: ${bgColor};">
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
                    <td style="padding: 8px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">£${item.subtotalGBP}</td>
                    <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">£${clinicPrice}</td>
                  </tr>
                `;
              }).join('')}
              
              <tr style="background-color: #e6f0ff; font-weight: bold;">
                <td style="padding: 8px;">TOTAL</td>
                <td style="padding: 8px;"></td>
                <td style="padding: 8px; text-align: right;">£${totalGBP}</td>
                <td style="padding: 8px; text-align: right;">£${clinicTotal}</td>
              </tr>
            </table>
            
            <p style="margin-top: 15px; text-align: right; color: #008800; font-weight: bold;">
              You save: £${savings} (${savingsPercentage}% off UK prices)
            </p>
          </div>
          
          <div style="margin-top: 30px; margin-bottom: 40px;">
            <h3 style="color: #2962ff; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Additional Information</h3>
            <ul style="padding-left: 20px; color: #555;">
              <li style="margin-bottom: 5px;">This quote is an estimate based on the information provided.</li>
              <li style="margin-bottom: 5px;">Actual treatment costs may vary after in-person examination.</li>
              <li style="margin-bottom: 5px;">Price includes all dental work, materials, and appointments.</li>
              <li style="margin-bottom: 5px;">Treatment guarantees: Implants (up to 10 years), Crowns/Veneers (up to 5 years).</li>
            </ul>
          </div>
          
          <div style="margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #777; font-size: 12px;">
            <p>MyDentalFly.com</p>
            <p>Compare Dental Clinics. Book With Confidence. Fly With a Smile.</p>
          </div>
        </div>
      `;
      
      // Set up options for html2pdf
      const options = {
        margin: 10,
        filename: `MyDentalFly_Quote_${clinic.name.replace(/\s+/g, '-')}-${patientName.split(' ')[0]}-${formattedDate.replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      console.log("Starting conversion with html2pdf");
      
      // Generate PDF
      html2pdf().from(element).set(options).save().then(() => {
        console.log("PDF saved successfully");
        
        toast({
          title: "Quote PDF Generated",
          description: "Your quote has been successfully generated and downloaded.",
        });
        
        // Call the onComplete callback if provided
        if (onComplete) {
          onComplete();
        }
        
        setIsLoading(false);
      }).catch((error) => {
        console.error('Error in html2pdf:', error);
        toast({
          title: "PDF Generation Failed",
          description: "There was an error creating your PDF.",
          variant: "destructive"
        });
        setIsLoading(false);
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
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