import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const TestPdfPage: React.FC = () => {
  const { toast } = useToast();
  
  // Simple direct PDF download test
  const downloadTestPdf = () => {
    toast({
      title: "Generating Test PDF",
      description: "Creating a simple test PDF...",
    });
    
    // Open in a new tab to see if it works
    window.open('/api/jspdf-quote-v2', '_blank');
  };
  
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">PDF Generation Test Page</h1>
      
      <div className="space-y-6">
        <div className="p-6 bg-white border rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Simple PDF Download</h2>
          <p className="mb-4">This will generate a simple PDF using the server-side rendering.</p>
          <Button onClick={downloadTestPdf}>Generate Test PDF</Button>
        </div>
      </div>
    </div>
  );
};

export default TestPdfPage;