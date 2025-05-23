import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import html2pdf from 'html2pdf.js';
import { FileCheck } from 'lucide-react';

const PDFTestButton: React.FC = () => {
  const { toast } = useToast();
  
  // Client-side PDF generation test
  const generateClientPdf = () => {
    toast({
      title: "Generating Test PDF",
      description: "Creating a PDF directly in your browser...",
    });
    
    try {
      console.log("Starting PDF generation with html2pdf.js");
      
      // Create a simple HTML element to convert to PDF
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #2962ff; text-align: center; margin-bottom: 20px;">MyDentalFly</h1>
          <h2 style="text-align: center; margin-bottom: 30px;">Test PDF Quote</h2>
          
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Quote Reference:</strong> MDF-${Date.now().toString().slice(-8)}</p>
          
          <div style="margin: 30px 0; padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5;">
            <h3 style="margin-bottom: 10px;">Treatment Summary</h3>
            <ul>
              <li>Dental Implant x2 - £1,800</li>
              <li>Porcelain Crown x4 - £1,200</li>
              <li>Professional Cleaning - £120</li>
            </ul>
            <p style="font-weight: bold; margin-top: 15px;">Total UK Cost: £3,120</p>
            <p style="font-weight: bold; color: #0066cc;">Istanbul Price: £1,092</p>
            <p style="font-weight: bold; color: #009900;">You save: £2,028 (65% off UK prices)</p>
          </div>
          
          <p style="font-style: italic; font-size: 14px; color: #666;">
            This is a test PDF generated by html2pdf.js directly in your browser.
          </p>
          
          <div style="margin-top: 50px; font-size: 12px; color: #999; text-align: center;">
            <p>MyDentalFly.com - Compare Dental Clinics. Book With Confidence. Fly With a Smile.</p>
          </div>
        </div>
      `;
      
      // Set up options for html2pdf
      const options = {
        margin: 10,
        filename: 'MyDentalFly_Test_Quote.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' }
      };
      
      console.log("Starting conversion with html2pdf");
      
      // Generate PDF
      html2pdf().from(element).set(options).save().then(() => {
        console.log("PDF saved successfully");
        
        toast({
          title: "PDF Generated",
          description: "Your PDF has been successfully generated and downloaded.",
        });
      });
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating your PDF: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive"
      });
    }
  };
  
  return (
    <Button 
      onClick={generateClientPdf} 
      variant="outline"
      className="flex items-center ml-4"
    >
      <FileCheck className="mr-2 h-4 w-4" />
      Test PDF Generator
    </Button>
  );
};

export default PDFTestButton;