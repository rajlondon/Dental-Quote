import React, { useState } from 'react';
import { ComprehensiveQuoteBuilder } from '../components/quotes/ComprehensiveQuoteBuilder';
import { SimpleDentalChart, DentalChartData } from '../components/dental/SimpleDentalChart';
import { Layout } from '../components/Layout';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ComprehensiveQuotePage() {
  const [step, setStep] = useState<'dental-chart' | 'quote-builder'>('dental-chart');
  const [isLoading, setIsLoading] = useState(false);
  const [dentalChartData, setDentalChartData] = useState<DentalChartData | null>(null);
  const { toast } = useToast();

  // Handle completion of dental chart
  const handleDentalChartComplete = (data: DentalChartData) => {
    setIsLoading(true);
    
    // Process dental chart data and prepare it for the quote builder
    // This simulates sending data to an API
    setTimeout(() => {
      setDentalChartData(data);
      setStep('quote-builder');
      setIsLoading(false);
      
      toast({
        title: "Dental Chart Saved",
        description: "Your dental chart information has been processed. Now let's build your quote.",
      });
    }, 1000);
  };
  
  // Map dental chart treatments to actual treatment IDs for the quote builder
  const mapDentalChartToTreatments = () => {
    // This would map the dental chart data to the treatments needed for the ComprehensiveQuoteBuilder
    // In a real implementation, this would be more sophisticated
    const treatmentMap: Record<string, string[]> = {
      'filling': ['filling-1', 'filling-2'],
      'crown': ['crown-1'],
      'extraction': ['extract-1', 'extract-2'],
      'root-canal': ['root-1'],
      'implant': ['implant-1', 'implant-2', 'implant-3'],
      'veneer': ['veneer-1'],
      'bridge': ['bridge-1'],
      'cleaning': ['clean-1'],
      'whitening': ['whitening-1'],
      'braces': ['ortho-1', 'ortho-2']
    };
    
    // Return an object with the selected treatments from the dental chart
    return {
      selectedTreatments: dentalChartData?.teeth
        .filter(tooth => tooth.treatment.length > 0)
        .flatMap(tooth => 
          tooth.treatment.map(treatmentId => {
            const mappedIds = treatmentMap[treatmentId] || [];
            return mappedIds.length > 0 ? mappedIds[0] : null;
          })
        )
        .filter(Boolean) as string[]
    };
  };

  return (
    <Layout>
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Build Your Dental Treatment Quote</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {step === 'dental-chart' 
                ? "Start by marking your teeth on our interactive dental chart. This helps us customize your quote."
                : "Create a customized dental treatment plan with our comprehensive quote builder."}
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Processing your dental chart...</p>
            </div>
          ) : step === 'dental-chart' ? (
            <SimpleDentalChart onComplete={handleDentalChartComplete} />
          ) : (
            <ComprehensiveQuoteBuilder 
              initialActiveTab="quiz"
              dentalChartData={dentalChartData}
              preSelectedTreatments={mapDentalChartToTreatments().selectedTreatments}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}