import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export type TreatmentMapping = {
  id: string | number;
  sourceTreatmentId?: string | number;
  targetTreatmentId?: string | number;
  sourceClinicId?: number;
  targetClinicId?: number;
  sourceCategory?: string;
  targetCategory?: string;
  sourceName: string;
  targetName: string;
  sourcePrice?: number;
  targetPrice?: number;
  priority?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  name?: string;
  description?: string;
  price?: number;
  clinicId?: number;
};

export interface TreatmentCategory {
  id: string | number;
  name: string;
  treatments: TreatmentMapping[];
}

/**
 * A hook to fetch available treatment mappings and categories
 */
export function useTreatmentMappings() {
  return useQuery({
    queryKey: ['/api/treatments/mappings'],
    queryFn: async () => {
      try {
        // First try to fetch structured mappings with categories
        const response = await apiRequest('GET', '/api/treatments/categories');
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          console.log('[DEBUG] Loaded treatment categories:', data.data.length);
          return data.data as TreatmentCategory[];
        }
        
        // Fallback to flat treatment list
        const flatResponse = await apiRequest('GET', '/api/treatments');
        const flatData = await flatResponse.json();
        
        if (flatData.success && Array.isArray(flatData.data)) {
          console.log('[DEBUG] Loaded treatments (flat list):', flatData.data.length);
          
          // Group treatments by category
          const categories: Record<string, TreatmentMapping[]> = {};
          flatData.data.forEach((treatment: TreatmentMapping) => {
            const category = treatment.category || 'Uncategorized';
            if (!categories[category]) {
              categories[category] = [];
            }
            categories[category].push(treatment);
          });
          
          // Convert to category array
          return Object.entries(categories).map(([name, treatments]) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            treatments
          }));
        }
        
        // Default empty state
        return [
          { 
            id: 'default', 
            name: 'Dental Treatments', 
            treatments: [
              { id: 1, sourceName: 'Dental Cleaning', targetName: 'Dental Cleaning', price: 100 },
              { id: 2, sourceName: 'Whitening', targetName: 'Teeth Whitening', price: 300 },
              { id: 3, sourceName: 'Complete Checkup', targetName: 'Complete Dental Checkup', price: 200 },
              { id: 4, sourceName: 'X-Ray', targetName: 'Dental X-Ray', price: 150 },
              { id: 5, sourceName: 'Filling', targetName: 'Dental Filling', price: 125 }
            ]
          }
        ] as TreatmentCategory[];
      } catch (error) {
        console.error('[ERROR] Failed to load treatment mappings:', error);
        return [] as TreatmentCategory[];
      }
    }
  });
}