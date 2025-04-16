import { TreatmentMap, ClinicTreatmentVariant, INITIAL_TREATMENT_MAP } from '@shared/treatmentMapper';
import { TreatmentItem } from '@/components/TreatmentPlanBuilder';

/**
 * Service to handle treatment mapping between standardized treatment names
 * and clinic-specific variants
 */
class TreatmentMapperService {
  private treatmentMap: TreatmentMap = INITIAL_TREATMENT_MAP;

  /**
   * Get all standardized treatment names
   */
  getStandardTreatmentNames(): string[] {
    return Object.keys(this.treatmentMap);
  }

  /**
   * Get clinic-specific variant for a standardized treatment
   */
  getClinicVariant(standardName: string, clinicId: string): ClinicTreatmentVariant | undefined {
    const standardTreatment = this.treatmentMap[standardName];
    
    if (!standardTreatment) {
      return undefined;
    }
    
    return standardTreatment.clinic_variants.find(
      variant => variant.clinic_id === clinicId
    );
  }

  /**
   * Get all clinic variants for a standardized treatment
   */
  getAllClinicVariants(standardName: string): ClinicTreatmentVariant[] {
    const standardTreatment = this.treatmentMap[standardName];
    
    if (!standardTreatment) {
      return [];
    }
    
    return standardTreatment.clinic_variants;
  }

  /**
   * Convert user-selected treatments to clinic-specific variants
   */
  mapUserTreatmentsToClinicVariants(
    treatments: TreatmentItem[],
    clinicId: string
  ): {
    standardName: string;
    clinicVariant: ClinicTreatmentVariant | undefined;
    quantity: number;
  }[] {
    return treatments.map(treatment => {
      const standardName = treatment.name;
      const clinicVariant = this.getClinicVariant(standardName, clinicId);
      
      return {
        standardName,
        clinicVariant,
        quantity: treatment.quantity
      };
    });
  }

  /**
   * Add a new clinic variant for a standardized treatment
   */
  addClinicVariant(
    standardName: string,
    clinicVariant: ClinicTreatmentVariant
  ): boolean {
    const standardTreatment = this.treatmentMap[standardName];
    
    if (!standardTreatment) {
      return false;
    }
    
    // Check if a variant from this clinic already exists
    const existingIndex = standardTreatment.clinic_variants.findIndex(
      variant => variant.clinic_id === clinicVariant.clinic_id
    );
    
    if (existingIndex >= 0) {
      // Replace existing variant
      standardTreatment.clinic_variants[existingIndex] = clinicVariant;
    } else {
      // Add new variant
      standardTreatment.clinic_variants.push(clinicVariant);
    }
    
    return true;
  }

  /**
   * Set the entire treatment map (used for backend syncing)
   */
  setTreatmentMap(newMap: TreatmentMap): void {
    this.treatmentMap = newMap;
  }

  /**
   * Get treatments by category
   */
  getTreatmentsByCategory(category: string): string[] {
    return Object.entries(this.treatmentMap)
      .filter(([_, treatment]) => treatment.category === category)
      .map(([name, _]) => name);
  }

  /**
   * Get all categories
   */
  getAllCategories(): string[] {
    const categories = new Set<string>();
    
    Object.values(this.treatmentMap).forEach(treatment => {
      categories.add(treatment.category);
    });
    
    return Array.from(categories);
  }
}

// Export singleton instance
export const treatmentMapperService = new TreatmentMapperService();