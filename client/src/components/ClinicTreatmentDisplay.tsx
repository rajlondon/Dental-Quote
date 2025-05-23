import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    // Create different clinic-specific naming and pricing based on clinic ID and treatment name
    const clinicData: Record<string, Record<string, any>> = {
      'clinic_001': {
        'Dental Implant (Standard)': {
          label: 'Standard Titanium Dental Implant',
          price: '£695',
          includes: ['Titanium implant fixture', 'Abutment', 'Temporary crown', '1-year warranty'],
          note: 'Our most popular implant option. Excellent stability and integration.'
        },
        'Porcelain Crown': {
          label: 'E-max Porcelain Crown',
          price: '£275',
          includes: ['Premium E-max crown', 'Digital design', 'Custom shade matching', '2-year warranty'],
          note: 'Made from high-quality lithium disilicate for excellent aesthetics.'
        },
        'Zoom Whitening (In-office)': {
          label: 'Advanced Laser Whitening',
          price: '£240',
          includes: ['Professional cleaning', '3 whitening sessions', 'Desensitizing gel', 'Take-home kit'],
          note: 'Up to 8 shades whiter in just one visit!'
        }
      },
      'clinic_002': {
        'Dental Implant (Standard)': {
          label: 'Premium Straumann Implant',
          price: '£895',
          includes: ['Swiss Straumann implant', 'Healing abutment', 'Ceramic crown', '5-year warranty'],
          note: 'Using only authentic Straumann implants - the gold standard in implantology.'
        },
        'Porcelain Crown': {
          label: 'Zirconia Full-Ceramic Crown',
          price: '£320',
          includes: ['Multilayer zirconia crown', '3D digital scan', 'Custom characterization', '3-year warranty'],
          note: 'Superior strength and natural aesthetics with our latest CAD/CAM technology.'
        },
        'Zoom Whitening (In-office)': {
          label: 'Zoom! Chairside Whitening System',
          price: '£285',
          includes: ['Tooth preparation', 'Zoom! Advanced Power LED light', 'Fluoride treatment', 'Home maintenance kit'],
          note: 'The official Philips Zoom! system for dramatic same-day results.'
        }
      },
      'clinic_003': {
        'Dental Implant (Standard)': {
          label: 'Lifetime Guaranteed Implant',
          price: '£750',
          includes: ['Korean Osstem implant', 'Custom abutment', 'Premium porcelain crown', 'Lifetime guarantee'],
          note: 'Our signature implant package with lifetime replacement guarantee against implant failure.'
        },
        'Porcelain Crown': {
          label: 'BioHPP Non-Metal Crown',
          price: '£295',
          includes: ['Bio-compatible high-performance polymer', 'Natural flex properties', 'Digital design', '5-year warranty'],
          note: 'Perfect for patients with metal sensitivities or looking for the most biocompatible option.'
        },
        'Zoom Whitening (In-office)': {
          label: 'Signature Teeth Whitening',
          price: '£260',
          includes: ['Full hygiene session', 'Opalescence whitening system', 'Custom trays', 'Touch-up kit'],
          note: 'Our gentle approach minimizes sensitivity while providing excellent results.'
        }
      }
    };
    
    // Default fallback variant if specific data not found
    const defaultVariant = {
      clinic_id: clinicId,
      label: `${standardName} (Clinic Standard)`,
      price: '£300 - £800',
      includes: ['Standard procedure', 'Basic materials', 'Regular warranty'],
      note: 'Contact clinic for specific details about this treatment.'
    };
    
    // Return the clinic-specific variant if available, otherwise return default
    if (clinicData[clinicId] && clinicData[clinicId][standardName]) {
      const data = clinicData[clinicId][standardName];
      return {
        clinic_id: clinicId,
        label: data.label,
        price: data.price,
        includes: data.includes,
        note: data.note,
        optional_addons: data.optional_addons || []
      };
    }
    
    return defaultVariant;
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
  // For demonstration, we'll create a comparison of the three clinics
  // In a real implementation, this would use the actual variants passed in
  
  // Generate or use mock variants for demonstration
  const mockVariants = [
    {
      clinic_id: 'clinic_001',
      label: 'Standard Titanium Dental Implant',
      price: '£695',
      includes: ['Titanium implant fixture', 'Abutment', 'Temporary crown', '1-year warranty'],
      note: 'Our most popular implant option. Excellent stability and integration.',
      clinic_name: 'Istanbul Smile Center'
    },
    {
      clinic_id: 'clinic_002',
      label: 'Premium Straumann Implant',
      price: '£895',
      includes: ['Swiss Straumann implant', 'Healing abutment', 'Ceramic crown', '5-year warranty'],
      note: 'Using only authentic Straumann implants - the gold standard in implantology.',
      clinic_name: 'Premium Dental Istanbul'
    },
    {
      clinic_id: 'clinic_003',
      label: 'Lifetime Guaranteed Implant',
      price: '£750',
      includes: ['Korean Osstem implant', 'Custom abutment', 'Premium porcelain crown', 'Lifetime guarantee'],
      note: 'Our signature implant package with lifetime replacement guarantee against implant failure.',
      clinic_name: 'Dental Excellence Turkey'
    }
  ];
  
  // Use mockVariants for dental implants, otherwise use passed variants
  const displayVariants = standardName.includes('Implant') ? mockVariants : variants;
  
  // Create a comparison table of features across clinics
  const allFeatures = displayVariants.flatMap(v => v.includes).filter((f, i, a) => a.indexOf(f) === i);
  
  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-2">
        {standardName} - Clinic Comparison
      </h3>
      <p className="text-muted-foreground mb-6">
        Compare how different clinics offer this treatment, with their specific pricing and inclusions.
      </p>
      
      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {displayVariants.map((variant, index) => (
          <Card key={index} className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                {variant.clinic_name || `Clinic ${variant.clinic_id.split('_')[1]}`}
              </CardTitle>
              <CardDescription>{variant.label}</CardDescription>
              <Badge className="mt-2" variant={index === 1 ? "default" : (index === 2 ? "secondary" : "outline")}>
                {variant.price}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Includes:</span>
                  <ul className="mt-2 space-y-1.5">
                    {variant.includes.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {variant.note && (
                  <div className="flex items-start gap-2 text-sm mt-3 p-2 bg-blue-50 rounded">
                    <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-700">{variant.note}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full text-sm">Request details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Feature comparison table */}
      <div className="overflow-x-auto rounded-md border mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feature
              </th>
              {displayVariants.map((v, i) => (
                <th key={i} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {v.clinic_name || `Clinic ${v.clinic_id.split('_')[1]}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Treatment Name
              </td>
              {displayVariants.map((v, i) => (
                <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {v.label}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Price
              </td>
              {displayVariants.map((v, i) => (
                <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {v.price}
                </td>
              ))}
            </tr>
            {allFeatures.map((feature, fidx) => (
              <tr key={fidx} className={fidx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {feature}
                </td>
                {displayVariants.map((v, i) => (
                  <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {v.includes.includes(feature) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-between">
        <p className="text-sm text-muted-foreground">
          Note: Actual treatments, inclusions, and pricing may vary. Always consult with clinics for the most up-to-date information.
        </p>
        <Button 
          onClick={onClose}
          className="flex-shrink-0"
        >
          Close comparison
        </Button>
      </div>
    </div>
  );
};