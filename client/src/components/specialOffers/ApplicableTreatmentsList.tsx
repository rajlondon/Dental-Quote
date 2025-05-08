import { Check } from 'lucide-react';
import { SpecialOfferDetails } from '@/hooks/use-special-offer-tracking';

interface ApplicableTreatmentsListProps {
  specialOffer: SpecialOfferDetails;
  className?: string;
}

/**
 * Component to display a list of treatments applicable to a special offer
 * Shows a clear, visual indicator of what's included in the offer
 */
export function ApplicableTreatmentsList({ specialOffer, className = '' }: ApplicableTreatmentsListProps) {
  // Normalize the applicable treatments to an array
  const applicableTreatments: string[] = [];
  
  // Add from the applicableTreatments array if it exists
  if (specialOffer.applicableTreatments && specialOffer.applicableTreatments.length > 0) {
    applicableTreatments.push(...specialOffer.applicableTreatments);
  }
  
  // Add the legacy applicableTreatment if it exists and isn't already included
  if (specialOffer.applicableTreatment && 
      !applicableTreatments.includes(specialOffer.applicableTreatment)) {
    applicableTreatments.push(specialOffer.applicableTreatment);
  }
  
  // If we have no applicable treatments, show a message
  if (applicableTreatments.length === 0) {
    return <p className={`text-xs text-gray-500 ${className}`}>This offer applies to all eligible treatments</p>;
  }
  
  // Format the treatment names to be more readable
  const formatTreatmentName = (name: string): string => {
    // Replace underscores with spaces
    let formatted = name.replace(/_/g, ' ');
    
    // Capitalize each word
    formatted = formatted
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    return formatted;
  };
  
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="text-xs font-medium mb-1">Applicable Treatments:</div>
      {applicableTreatments.map((treatment, index) => (
        <div key={index} className="flex items-center gap-1 text-xs">
          <Check className="h-3 w-3 text-green-500" />
          <span>{formatTreatmentName(treatment)}</span>
        </div>
      ))}
    </div>
  );
}

export default ApplicableTreatmentsList;