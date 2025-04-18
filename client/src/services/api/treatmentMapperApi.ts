import { TreatmentMap, ClinicTreatmentVariant } from '@shared/treatmentMapper';
import { treatmentMapperService } from '../treatmentMapperService';

/**
 * Client for interacting with the treatment mapper API
 */
const treatmentMapperApi = {
  /**
   * Get the full treatment map
   * Admin only endpoint
   */
  async getTreatmentMap(): Promise<TreatmentMap> {
    const response = await fetch('/api/treatment-mapper');
    
    if (!response.ok) {
      throw new Error(`Failed to get treatment map: ${response.statusText}`);
    }
    
    const treatmentMap = await response.json();
    
    // Update the local service with the latest map
    treatmentMapperService.setTreatmentMap(treatmentMap);
    
    return treatmentMap;
  },
  
  /**
   * Get all treatment variants for a specific clinic
   */
  async getClinicTreatmentVariants(clinicId: string): Promise<Record<string, ClinicTreatmentVariant | null>> {
    const response = await fetch(`/api/treatment-mapper/clinic/${clinicId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get clinic treatment variants: ${response.statusText}`);
    }
    
    return await response.json();
  },
  
  /**
   * Update a clinic's variant for a standard treatment
   */
  async updateClinicTreatmentVariant(
    clinicId: string,
    treatmentName: string,
    variantData: ClinicTreatmentVariant
  ): Promise<boolean> {
    const response = await fetch(
      `/api/treatment-mapper/clinic/${clinicId}/treatment/${encodeURIComponent(treatmentName)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(variantData)
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to update clinic treatment variant: ${response.statusText}`);
    }
    
    // Refresh the treatment map after update
    await this.getTreatmentMap();
    
    return true;
  },
  
  /**
   * Delete a clinic's variant for a standard treatment
   */
  async deleteClinicTreatmentVariant(
    clinicId: string,
    treatmentName: string
  ): Promise<boolean> {
    const response = await fetch(
      `/api/treatment-mapper/clinic/${clinicId}/treatment/${encodeURIComponent(treatmentName)}`,
      {
        method: 'DELETE'
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to delete clinic treatment variant: ${response.statusText}`);
    }
    
    // Refresh the treatment map after delete
    await this.getTreatmentMap();
    
    return true;
  },
  
  /**
   * Add a new standard treatment (admin only)
   */
  async addStandardTreatment(
    name: string,
    category: string
  ): Promise<boolean> {
    const response = await fetch('/api/treatment-mapper/treatment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, category })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add standard treatment: ${response.statusText}`);
    }
    
    // Refresh the treatment map after add
    await this.getTreatmentMap();
    
    return true;
  },
  
  /**
   * Delete a standard treatment (admin only)
   */
  async deleteStandardTreatment(name: string): Promise<boolean> {
    const response = await fetch(`/api/treatment-mapper/treatment/${encodeURIComponent(name)}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete standard treatment: ${response.statusText}`);
    }
    
    // Refresh the treatment map after delete
    await this.getTreatmentMap();
    
    return true;
  }
};

export default treatmentMapperApi;