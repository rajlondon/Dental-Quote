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
      console.log("Starting PDF generation");
      
      // Create a new jsPDF instance - specify 'p', 'mm', 'a4' to be explicit
      const doc = new jsPDF('p', 'mm', 'a4');
      console.log("jsPDF instance created");
      
      // Add very simple content - minimum test
      doc.text("Hello World PDF Test", 20, 20);
      doc.text("Generated on: " + new Date().toISOString(), 20, 30);
      
      console.log("PDF content added, saving...");
      
      // Save with a simple name
      doc.save("test.pdf");
      
      console.log("PDF saved");
      
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