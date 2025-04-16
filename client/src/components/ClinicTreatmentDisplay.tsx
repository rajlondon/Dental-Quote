import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, CheckCircle, PlusCircle } from 'lucide-react';
import { ClinicTreatmentVariant } from '@shared/treatmentMapper';
import { TreatmentItem } from './TreatmentPlanBuilder';

interface ClinicTreatmentDisplayProps {
  standardName: string;
  clinicVariant: ClinicTreatmentVariant;
  quantity: number;
}

/**
 * Component to display clinic-specific treatment variant
 * This is used in the quote results page to show how each clinic
 * names and packages the treatments selected by the user
 */
export const ClinicTreatmentDisplay: React.FC<ClinicTreatmentDisplayProps> = ({
  standardName,
  clinicVariant,
  quantity
}) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-medium">{clinicVariant.label}</CardTitle>
            <CardDescription className="text-sm mt-1">
              Standard treatment: {standardName}
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-medium">
            {clinicVariant.price}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Includes:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {clinicVariant.includes.map((item, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {item}
                </Badge>
              ))}
            </div>
          </div>
          
          {clinicVariant.optional_addons && clinicVariant.optional_addons.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">Optional add-ons:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {clinicVariant.optional_addons.map((addon, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <PlusCircle className="h-3 w-3" />
                    {addon}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {clinicVariant.note && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{clinicVariant.note}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Quantity: {quantity}
        </div>
      </CardFooter>
    </Card>
  );
};

/**
 * Component to display all clinic treatments for a list of standard treatments
 */
interface ClinicTreatmentsListProps {
  treatments: TreatmentItem[];
  clinicId: string;
  onShowAllVariants?: (standardName: string) => void;
}

export const ClinicTreatmentsList: React.FC<ClinicTreatmentsListProps> = ({
  treatments,
  clinicId,
  onShowAllVariants
}) => {
  // This would use the treatmentMapperService in a real implementation
  // For now, we'll use a placeholder implementation
  
  const getMockClinicVariant = (standardName: string): ClinicTreatmentVariant => {
    return {
      clinic_id: clinicId,
      label: `${clinicId.toUpperCase()} ${standardName}`,
      price: '£xxx - £xxx',
      includes: ['Basic procedure'],
      note: 'This is a placeholder variant for demonstration'
    };
  };
  
  return (
    <div className="space-y-4">
      {treatments.map((treatment, index) => (
        <div key={index}>
          <ClinicTreatmentDisplay 
            standardName={treatment.name}
            clinicVariant={getMockClinicVariant(treatment.name)}
            quantity={treatment.quantity}
          />
          
          {onShowAllVariants && (
            <button 
              onClick={() => onShowAllVariants(treatment.name)}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              Compare all clinic options
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Component to display a comparison of all clinic variants for a standard treatment
 */
interface TreatmentVariantsComparisonProps {
  standardName: string;
  variants: ClinicTreatmentVariant[];
  onClose: () => void;
}

export const TreatmentVariantsComparison: React.FC<TreatmentVariantsComparisonProps> = ({
  standardName,
  variants,
  onClose
}) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">
        Comparison: {standardName}
      </h3>
      
      <div className="space-y-4">
        {variants.map((variant, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-medium">
                    {variant.clinic_id.toUpperCase()}: {variant.label}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="font-medium">
                  {variant.price}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Includes:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {variant.includes.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {variant.note && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>{variant.note}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Close comparison
        </button>
      </div>
    </div>
  );
};