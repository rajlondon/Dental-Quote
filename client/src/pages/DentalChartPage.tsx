import { useEffect, useState } from 'react';
import { DentalChart } from '@/components/DentalChart';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function DentalChartPage() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [teethData, setTeethData] = useState<any>(null);
  
  // Set page title when component mounts
  useEffect(() => {
    document.title = 'Interactive Dental Chart | MyDentalFly.com';
  }, []);
  
  // Handle saving teeth data from chart component
  const handleTeethUpdate = (data: any) => {
    setTeethData(data);
    console.log('Teeth data updated:', data);
    localStorage.setItem('dentalChartData', JSON.stringify(data));
    toast({
      title: "Dental Chart Updated",
      description: "Your dental information has been saved",
    });
  };
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">Interactive Dental Chart</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Use this interactive tool to indicate dental conditions and desired treatments.
              This helps our partner clinics understand your needs before you receive a personalized quote.
            </p>
          </div>
          
          <div className="bg-white border border-blue-200 rounded-lg shadow-lg p-8 mb-10">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-blue-800 mb-4">How to Use This Tool:</h2>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Click on any tooth in the diagram</li>
                <li>Mark its current condition (chipped, missing, painful, etc.)</li>
                <li>Indicate your desired treatment (implant, crown, veneer, etc.)</li>
                <li>Add any notes specific to that tooth</li>
                <li>Continue marking all teeth that need attention</li>
              </ol>
            </div>
            
            <div className="mb-6">
              <DentalChart onTeethUpdate={handleTeethUpdate} />
            </div>
            
            <div className="mt-8 flex justify-center space-x-4">
              <Button 
                variant="default" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  toast({
                    title: "Dental Chart Saved",
                    description: "Your dental chart information has been saved. Proceeding to quote builder."
                  });
                  
                  // Redirect to the new quote builder page after a short delay
                  setTimeout(() => {
                    setLocation('/your-quote');
                  }, 1500);
                }}
              >
                Save & Continue to Quote Builder
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setLocation('/your-quote');
                }}
              >
                Skip & Continue to Quote Builder
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">Why This Matters</h3>
            <p className="text-gray-700 mb-4">
              By providing a visual representation of your dental needs, our partner clinics can:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Better understand your specific dental situation</li>
              <li>Prepare more accurate treatment plans</li>
              <li>Provide more precise cost estimates</li>
              <li>Save time during your initial consultation</li>
              <li>Identify potential issues that may require special attention</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}