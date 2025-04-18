import { PatientInfo } from '@/components/PatientInfoForm';

/**
 * Checks if patient information is complete and valid
 * @param patientInfo The patient information object to validate
 * @returns An object with validation status and missing fields
 */
export function validatePatientInfo(patientInfo: Partial<PatientInfo> | null | undefined): { 
  isValid: boolean;
  missingFields: string[];
  hasCriticalFields: boolean;
} {
  if (!patientInfo) {
    return { 
      isValid: false, 
      missingFields: ['All patient information'], 
      hasCriticalFields: false 
    };
  }

  const missingFields: string[] = [];
  
  // Check required fields
  if (!patientInfo.fullName) missingFields.push('Full Name');
  if (!patientInfo.email) missingFields.push('Email Address');
  if (!patientInfo.phone) missingFields.push('Phone Number');
  
  // Check optional fields that improve the quality of the quote
  if (!patientInfo.travelMonth) missingFields.push('Travel Month');
  if (!patientInfo.departureCity) missingFields.push('Departure City');
  if (!patientInfo.preferredContactMethod) missingFields.push('Preferred Contact Method');
  
  // Check if critical fields exist (name, email, phone)
  const hasCriticalFields = !!(
    patientInfo.fullName && 
    patientInfo.email && 
    patientInfo.phone
  );

  // Validation is successful if there are no missing critical fields
  const isValid = hasCriticalFields;

  return { isValid, missingFields, hasCriticalFields };
}

/**
 * Creates a standardized patient information object with fallback values for missing fields
 * @param patientInfo The patient information object to standardize
 * @returns A complete patient information object with fallbacks for missing fields
 */
export function standardizePatientInfo(patientInfo: Partial<PatientInfo> | null | undefined): Partial<PatientInfo> {
  if (!patientInfo) {
    return {
      fullName: 'Guest User',
      email: 'guest@mydentalfly.com',
      phone: 'Not provided',
      preferredContactMethod: 'email'
    };
  }
  
  return {
    fullName: patientInfo.fullName || 'Guest User',
    email: patientInfo.email || 'guest@mydentalfly.com',
    phone: patientInfo.phone || 'Not provided',
    travelMonth: patientInfo.travelMonth || 'Flexible',
    departureCity: patientInfo.departureCity || 'Not specified',
    preferredContactMethod: patientInfo.preferredContactMethod || 'email',
    hasXrays: patientInfo.hasXrays || false,
    hasCtScan: patientInfo.hasCtScan || false,
    hasDentalPhotos: patientInfo.hasDentalPhotos || false,
    additionalNotesForClinic: patientInfo.additionalNotesForClinic || ''
  };
}