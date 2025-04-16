import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, CheckCircle, ChevronDown, ChevronUp, Download, Info, MessageSquare, Star } from 'lucide-react';
import { ClinicTreatmentDisplay, ClinicTreatmentsList, TreatmentVariantsComparison } from './ClinicTreatmentDisplay';
import { TreatmentItem } from './TreatmentPlanBuilder';
import { ClinicTreatmentVariant } from '@shared/treatmentMapper';
import { treatmentMapperService } from '@/services/treatmentMapperService';
import { getMappedTreatmentsForClinic, calculateTotalPriceForMappedTreatments } from '@/utils/treatmentMapperUtils';
import { useToast } from '@/hooks/use-toast';
import { clinicService } from '@/services/clinicService';

// Sample clinic data
const SAMPLE_CLINICS = [
  { id: 'clinic_001', name: 'Istanbul Smile Center', location: 'Istanbul, Turkey', rating: 4.8 },
  { id: 'clinic_002', name: 'Premium Dental Istanbul', location: 'Istanbul, Turkey', rating: 4.7 },
  { id: 'clinic_003', name: 'Dental Excellence Turkey', location: 'Istanbul, Turkey', rating: 4.9 },
];

interface ClinicTreatmentComparisonProps {
  treatments: TreatmentItem[];
}

export const ClinicTreatmentComparison: React.FC<ClinicTreatmentComparisonProps> = ({ 
  treatments 
}) => {
  const { toast } = useToast();
  const [expandedClinics, setExpandedClinics] = useState<Record<string, boolean>>({});
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareTreatment, setCompareTreatment] = useState<string | null>(null);
  const [compareTreatmentVariants, setCompareTreatmentVariants] = useState<ClinicTreatmentVariant[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, { download: boolean; booking: boolean }>>({});
  
  // Initialize all clinics as collapsed and loading states
  useEffect(() => {
    const initialExpandState: Record<string, boolean> = {};
    const initialLoadingStates: Record<string, { download: boolean; booking: boolean }> = {};
    
    SAMPLE_CLINICS.forEach(clinic => {
      initialExpandState[clinic.id] = false;
      initialLoadingStates[clinic.id] = { download: false, booking: false };
    });
    
    setExpandedClinics(initialExpandState);
    setLoadingStates(initialLoadingStates);
  }, []);
  
  const toggleClinicExpand = (clinicId: string) => {
    setExpandedClinics(prev => ({
      ...prev,
      [clinicId]: !prev[clinicId]
    }));
  };
  
  const handleCompareVariants = (standardName: string) => {
    const variants = treatmentMapperService.getAllClinicVariants(standardName);
    setCompareTreatment(standardName);
    setCompareTreatmentVariants(variants);
    setCompareModalOpen(true);
  };
  
  // Handle quote download
  const handleDownloadQuote = async (clinicId: string, clinicName: string) => {
    try {
      // Set loading state
      setLoadingStates(prev => ({
        ...prev,
        [clinicId]: { ...prev[clinicId], download: true }
      }));
      
      toast({
        title: "Generating Quote",
        description: `Preparing your quote for ${clinicName}. This may take a moment...`,
      });
      
      // Calculate total price for this clinic's treatments
      const mappedTreatments = getMappedTreatmentsForClinic(treatments, clinicId);
      const { totalPrice } = calculateTotalPriceForMappedTreatments(mappedTreatments);
      
      // Mock patient details (in a real implementation this would come from the user's account)
      const patientDetails = {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+44 7123 456789"
      };
      
      // Call service to generate and download quote
      const quoteData = await clinicService.generateQuote(
        clinicId, 
        clinicName, 
        mappedTreatments, 
        totalPrice,
        patientDetails
      );
      
      // Open the PDF in a new tab
      if (quoteData?.url) {
        window.open(quoteData.url, '_blank');
      }
      
      toast({
        title: "Quote Generated",
        description: "Your quote has been generated and is downloading now.",
      });
    } catch (error) {
      console.error('Error downloading quote:', error);
      toast({
        title: "Error",
        description: "Failed to generate quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset loading state
      setLoadingStates(prev => ({
        ...prev,
        [clinicId]: { ...prev[clinicId], download: false }
      }));
    }
  };
  
  // Handle choosing a clinic
  const handleChooseClinic = async (clinicId: string, clinicName: string) => {
    try {
      // Set loading state
      setLoadingStates(prev => ({
        ...prev,
        [clinicId]: { ...prev[clinicId], booking: true }
      }));
      
      toast({
        title: "Processing Selection",
        description: `Setting up your connection with ${clinicName}...`,
      });
      
      // Mock patient details (in a real app, this would be from the user's account)
      const patientDetails = {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+44 7123 456789"
      };
      
      // Call the API to establish a connection with the clinic
      await clinicService.selectClinic(clinicId, patientDetails, {
        treatments: treatments
      });
      
      // Redirect to messages section with this clinic preselected
      window.location.href = `#/patient-portal/messages?clinic=${clinicId}`;
      
      toast({
        title: "Clinic Selected",
        description: `You are now connected with ${clinicName}. You can now discuss your treatment options.`,
      });
    } catch (error) {
      console.error('Error selecting clinic:', error);
      toast({
        title: "Selection Error",
        description: "Failed to connect with clinic. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset loading state
      setLoadingStates(prev => ({
        ...prev,
        [clinicId]: { ...prev[clinicId], booking: false }
      }));
    }
  };
  
  return (
    <div className="space-y-8 my-8">
      <h2 className="text-2xl font-bold">Compare Clinic Treatments</h2>
      <p className="text-muted-foreground mb-6">
        Each clinic may offer different treatment packages, pricing, and inclusions. 
        Compare how your selected treatments are offered at each clinic.
      </p>
      
      <div className="space-y-6">
        {SAMPLE_CLINICS.map(clinic => {
          const isExpanded = expandedClinics[clinic.id];
          const mappedTreatments = getMappedTreatmentsForClinic(treatments, clinic.id);
          const { formattedPrice } = calculateTotalPriceForMappedTreatments(mappedTreatments);
          
          return (
            <Card key={clinic.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {clinic.name}
                      <Badge variant="outline" className="ml-2 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {clinic.rating}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{clinic.location}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{formattedPrice}</div>
                    <div className="text-sm text-muted-foreground">Total Quote</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-0">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {mappedTreatments.filter(t => t.clinicVariant).length} of {treatments.length} treatments available
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleClinicExpand(clinic.id)}
                    className="flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        View Details
                      </>
                    )}
                  </Button>
                </div>
                
                {isExpanded && (
                  <div className="mt-4 mb-2">
                    <ClinicTreatmentsList 
                      treatments={treatments}
                      clinicId={clinic.id}
                      onShowAllVariants={handleCompareVariants}
                    />
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between pt-4 pb-4">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={() => window.location.href = "#/patient-portal/messages?clinic=" + clinic.id}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Message Clinic
                </Button>
                <div>
                  <Button 
                    variant="outline" 
                    className="mr-2 flex items-center"
                    onClick={() => handleDownloadQuote(clinic.id, clinic.name)}
                    disabled={loadingStates[clinic.id]?.download}
                  >
                    {loadingStates[clinic.id]?.download ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-1" />
                        Download Quote
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleChooseClinic(clinic.id, clinic.name)}
                    disabled={loadingStates[clinic.id]?.booking}
                  >
                    {loadingStates[clinic.id]?.booking ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Choose This Clinic"
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {/* Treatment Variants Comparison Modal */}
      {compareModalOpen && compareTreatment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-4xl max-h-[90vh] overflow-auto">
            <TreatmentVariantsComparison
              standardName={compareTreatment}
              variants={compareTreatmentVariants}
              onClose={() => setCompareModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};