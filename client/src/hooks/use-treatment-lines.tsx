import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TreatmentLine } from "@shared/schema";
import { ensureUuidFormat } from "@/lib/id-converter";

interface TreatmentLineResponse {
  success: boolean;
  data: TreatmentLine[];
}

interface TreatmentSummaryResponse {
  success: boolean;
  data: {
    totalTreatmentLines: number;
    totalSpent: number;
    treatmentsByClinic: {
      clinic: any;
      treatmentLines: TreatmentLine[];
    }[];
  };
}

/**
 * Hook for managing treatment lines using the canonical API route
 */
export function useTreatmentLines(quoteId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // IMPORTANT: Canonical API path for all treatment line operations
  const API_TREATMENT = "/api/v1/treatment-lines";
  
  // Transform quoteId to UUID format if needed
  const quoteUuid = quoteId ? ensureUuidFormat(quoteId) : undefined;

  // Fetch treatment lines for a specific quote
  const {
    data: treatmentLines,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [API_TREATMENT, quoteUuid],
    queryFn: async () => {
      if (!quoteUuid) return [];
      
      console.log(`[API] Fetching treatment lines for quote ID: ${quoteUuid}`);
      
      try {
        const response = await apiRequest("GET", `${API_TREATMENT}?quoteId=${quoteUuid}`);
        const data = await response.json() as TreatmentLineResponse;
        
        if (!data.success) {
          throw new Error("Failed to fetch treatment lines");
        }
        
        console.log(`[API] Found ${data.data?.length || 0} treatment lines`);
        return data.data;
      } catch (error) {
        console.error(`[API] Failed to fetch treatment lines:`, error);
        throw error;
      }
    },
    enabled: !!quoteUuid,
  });

  // Fetch treatment summary for the logged-in patient
  const {
    data: treatmentSummary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: [`${API_TREATMENT}/patient/treatment-summary`],
    queryFn: async () => {
      console.log(`[API] Fetching treatment summary`);
      
      try {
        const response = await apiRequest("GET", `${API_TREATMENT}/patient/treatment-summary`);
        const data = await response.json() as TreatmentSummaryResponse;
        
        if (!data.success) {
          throw new Error("Failed to fetch treatment summary");
        }
        
        console.log(`[API] Successfully fetched treatment summary`);
        return data.data;
      } catch (error) {
        console.error(`[API] Failed to fetch treatment summary:`, error);
        throw error;
      }
    },
  });

  // Add a new treatment line
  const addTreatmentLine = useMutation({
    mutationFn: async (treatmentLine: any) => {
      // Convert numeric IDs to string for UUID conversion
      if (treatmentLine.quoteId && typeof treatmentLine.quoteId === 'number') {
        treatmentLine.quoteId = treatmentLine.quoteId.toString();
      }
      
      // Ensure quoteId is in UUID format
      if (treatmentLine.quoteId) {
        treatmentLine.quoteId = ensureUuidFormat(treatmentLine.quoteId);
      }
      
      console.log(`[API] Adding new treatment line with quoteId: ${treatmentLine.quoteId}`);
      
      const response = await apiRequest("POST", API_TREATMENT, treatmentLine);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to add treatment");
      }
      
      return result;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      console.log(`[API] Successfully added treatment, invalidating queries`);
      queryClient.invalidateQueries({ queryKey: [API_TREATMENT, quoteUuid] });
      queryClient.invalidateQueries({ queryKey: [`${API_TREATMENT}/patient/treatment-summary`] });
      
      // Also invalidate the legacy paths for backward compatibility
      queryClient.invalidateQueries({ queryKey: [`/api/treatment-plans/treatment-lines`, quoteId] });
      queryClient.invalidateQueries({ queryKey: [`/api/treatment-module/treatment-lines`, quoteId] });
      
      toast({
        title: "Treatment added",
        description: "Treatment has been added to your plan",
      });
    },
    onError: (error: Error) => {
      console.error(`[API] Error adding treatment:`, error);
      toast({
        title: "Failed to add treatment",
        description: error.message || "There was a problem adding the treatment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update an existing treatment line
  const updateTreatmentLine = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Convert numeric IDs to string for UUID conversion
      if (data.quoteId && typeof data.quoteId === 'number') {
        data.quoteId = data.quoteId.toString();
      }
      
      // Ensure both the line ID and quote ID are in UUID format
      const lineUuid = ensureUuidFormat(id);
      if (data.quoteId) {
        data.quoteId = ensureUuidFormat(data.quoteId);
      }
      
      console.log(`[API] Updating treatment line: ${lineUuid}`);
      
      const response = await apiRequest("PUT", `${API_TREATMENT}/${lineUuid}`, data);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to update treatment");
      }
      
      return result;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      console.log(`[API] Successfully updated treatment, invalidating queries`);
      queryClient.invalidateQueries({ queryKey: [API_TREATMENT, quoteUuid] });
      queryClient.invalidateQueries({ queryKey: [`${API_TREATMENT}/patient/treatment-summary`] });
      
      // Also invalidate the legacy paths for backward compatibility
      queryClient.invalidateQueries({ queryKey: [`/api/treatment-plans/treatment-lines`, quoteId] });
      queryClient.invalidateQueries({ queryKey: [`/api/treatment-module/treatment-lines`, quoteId] });
      
      toast({
        title: "Treatment updated",
        description: "Your treatment has been updated",
      });
    },
    onError: (error: Error) => {
      console.error(`[API] Error updating treatment:`, error);
      toast({
        title: "Failed to update treatment",
        description: error.message || "There was a problem updating the treatment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete a treatment line (soft delete)
  const deleteTreatmentLine = useMutation({
    mutationFn: async (id: string) => {
      // Ensure the ID is in UUID format
      const lineUuid = ensureUuidFormat(id);
      
      console.log(`[API] Deleting treatment line: ${lineUuid}`);
      
      const response = await apiRequest("DELETE", `${API_TREATMENT}/${lineUuid}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to delete treatment");
      }
      
      return result;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      console.log(`[API] Successfully deleted treatment, invalidating queries`);
      queryClient.invalidateQueries({ queryKey: [API_TREATMENT, quoteUuid] });
      queryClient.invalidateQueries({ queryKey: [`${API_TREATMENT}/patient/treatment-summary`] });
      
      // Also invalidate the legacy paths for backward compatibility
      queryClient.invalidateQueries({ queryKey: [`/api/treatment-plans/treatment-lines`, quoteId] });
      queryClient.invalidateQueries({ queryKey: [`/api/treatment-module/treatment-lines`, quoteId] });
      
      toast({
        title: "Treatment deleted",
        description: "Treatment has been removed from your plan",
      });
    },
    onError: (error: Error) => {
      console.error(`[API] Error deleting treatment:`, error);
      toast({
        title: "Failed to delete treatment",
        description: error.message || "There was a problem deleting the treatment. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    treatmentLines,
    isLoading,
    error,
    refetch,
    treatmentSummary,
    isSummaryLoading,
    summaryError,
    addTreatmentLine,
    updateTreatmentLine,
    deleteTreatmentLine,
  };
}