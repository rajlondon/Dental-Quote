import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, CheckCircle, ChevronDown, ChevronUp, Info, Star } from 'lucide-react';
import { ClinicTreatmentDisplay, ClinicTreatmentsList, TreatmentVariantsComparison } from './ClinicTreatmentDisplay';
import { TreatmentItem } from './TreatmentPlanBuilder';
import { ClinicTreatmentVariant } from '@shared/treatmentMapper';
import { treatmentMapperService } from '@/services/treatmentMapperService';
import { getMappedTreatmentsForClinic, calculateTotalPriceForMappedTreatments } from '@/utils/treatmentMapperUtils';

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
  const [expandedClinics, setExpandedClinics] = useState<Record<string, boolean>>({});
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareTreatment, setCompareTreatment] = useState<string | null>(null);
  const [compareTreatmentVariants, setCompareTreatmentVariants] = useState<ClinicTreatmentVariant[]>([]);
  
  // Initialize all clinics as collapsed
  useEffect(() => {
    const initialExpandState: Record<string, boolean> = {};
    SAMPLE_CLINICS.forEach(clinic => {
      initialExpandState[clinic.id] = false;
    });
    setExpandedClinics(initialExpandState);
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  Message Clinic
                </Button>
                <div>
                  <Button variant="outline" className="mr-2">
                    Download Quote
                  </Button>
                  <Button>
                    Book Consultation
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