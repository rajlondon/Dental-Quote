import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

const TestPdfPage: React.FC = () => {
  const { toast } = useToast();
  
  // Simple direct PDF download test with server
  const downloadServerPdf = () => {
    toast({
      title: "Generating Test PDF (Server)",
      description: "Creating a simple test PDF on the server...",
    });
    
    // Open in a new tab to see if it works
    window.open('/api/jspdf-quote-v2', '_blank');
  };
  
  // Client-side PDF generation test
  const generateClientPdf = () => {
    toast({
      title: "Generating Test PDF (Client)",
      description: "Creating a simple test PDF on the client...",
    });
    
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Add content
      doc.setFontSize(22);
      doc.setTextColor(0, 100, 200);
      doc.text("MyDentalFly Quote", 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("This is a test PDF generated directly on the client side using jsPDF.", 20, 40);
      doc.text("Date: " + new Date().toLocaleDateString(), 20, 50);
      
      // Add a border
      doc.setDrawColor(0, 100, 200);
      doc.setLineWidth(1);
      doc.rect(10, 10, 190, 277);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("MyDentalFly.com - Compare Dental Clinics. Book With Confidence. Fly With a Smile.", 105, 280, { align: 'center' });
      
      // Save the PDF
      doc.save("MyDentalFly_ClientTest.pdf");
      
      toast({
        title: "PDF Generated",
        description: "Your PDF has been successfully generated and downloaded.",
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
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">PDF Generation Test Page</h1>
      
      <div className="space-y-6">
        <div className="p-6 bg-white border rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Server-Side PDF Generation</h2>
          <p className="mb-4">This will generate a simple PDF using the server-side rendering with html-pdf-node.</p>
          <Button onClick={downloadServerPdf} className="mb-4">Generate Server PDF</Button>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">Test Client-Side PDF Generation</h2>
          <p className="mb-4">This will generate a simple PDF directly in the browser using jsPDF.</p>
          <Button onClick={generateClientPdf}>Generate Client PDF</Button>
        </div>
      </div>
    </div>
  );
};

export default TestPdfPage;