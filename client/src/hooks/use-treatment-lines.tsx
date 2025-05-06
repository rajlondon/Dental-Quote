import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TreatmentLine } from "@shared/schema";

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

export function useTreatmentLines(quoteId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // IMPORTANT: Base URL for all treatment module API calls
  // This API path is mounted at /api/treatment-module in server/routes.ts
  const API_BASE_URL = "/api/treatment-module";

  // Fetch treatment lines for a specific quote - try multiple API paths
  const {
    data: treatmentLines,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [`${API_BASE_URL}/treatment-lines`, quoteId],
    queryFn: async () => {
      if (!quoteId) return [];
      
      // Log the API call for debugging with extra details
      console.log(`[API ATTEMPT] Trying to fetch treatment lines for quote ID: ${quoteId}`);
      console.log(`[API ATTEMPT] First path: ${API_BASE_URL}/treatment-lines/${quoteId}`);
      
      try {
        // First try the module path
        console.log(`[API] Sending GET request via apiRequest utility to module path...`);
        const response = await apiRequest("GET", `${API_BASE_URL}/treatment-lines/${quoteId}`);
        console.log(`[API] GET response status:`, response.status);
        const data = await response.json() as TreatmentLineResponse;
        
        if (!data.success) {
          throw new Error("Failed to fetch treatment lines from primary path");
        }
        
        console.log(`[API] Success - Found ${data.data?.length || 0} treatment lines from primary path`);
        return data.data;
      } catch (firstError) {
        console.warn(`[API] First fetch attempt failed:`, firstError);
        
        // If first attempt fails, try alternate API path
        try {
          const alternatePath = `/api/treatment-plans/treatment-lines/${quoteId}`;
          console.log(`[API ATTEMPT] Trying alternate path: ${alternatePath}`);
          
          const response = await apiRequest("GET", alternatePath);
          console.log(`[API] GET (alternate) response status:`, response.status);
          const data = await response.json() as TreatmentLineResponse;
          
          if (!data.success) {
            throw new Error("Failed to fetch treatment lines from alternate path");
          }
          
          console.log(`[API] Success - Found ${data.data?.length || 0} treatment lines from alternate path`);
          return data.data;
        } catch (secondError) {
          console.error(`[API] Both fetch attempts failed`);
          console.error(`[API] First error:`, firstError);
          console.error(`[API] Second error:`, secondError);
          
          throw new Error("Failed to fetch treatment lines using either API path");
        }
      }
    },
    enabled: !!quoteId,
  });

  // Fetch treatment summary for the logged-in patient - try multiple API paths
  const {
    data: treatmentSummary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: [`${API_BASE_URL}/patient/treatment-summary`],
    queryFn: async () => {
      // Log the API call for debugging with extra details
      console.log(`[API ATTEMPT] Trying to fetch treatment summary`);
      console.log(`[API ATTEMPT] First path: ${API_BASE_URL}/patient/treatment-summary`);
      
      try {
        // First try the module path
        console.log(`[API] Sending GET request via apiRequest utility to module path...`);
        const response = await apiRequest("GET", `${API_BASE_URL}/patient/treatment-summary`);
        console.log(`[API] GET response status:`, response.status);
        const data = await response.json() as TreatmentSummaryResponse;
        
        if (!data.success) {
          throw new Error("Failed to fetch treatment summary from primary path");
        }
        
        console.log(`[API] Success - Fetched treatment summary from primary path`);
        return data.data;
      } catch (firstError) {
        console.warn(`[API] First summary fetch attempt failed:`, firstError);
        
        // If first attempt fails, try alternate API path
        try {
          const alternatePath = `/api/treatment-plans/patient/treatment-summary`;
          console.log(`[API ATTEMPT] Trying alternate path: ${alternatePath}`);
          
          const response = await apiRequest("GET", alternatePath);
          console.log(`[API] GET (alternate) response status:`, response.status);
          const data = await response.json() as TreatmentSummaryResponse;
          
          if (!data.success) {
            throw new Error("Failed to fetch treatment summary from alternate path");
          }
          
          console.log(`[API] Success - Fetched treatment summary from alternate path`);
          return data.data;
        } catch (secondError) {
          console.error(`[API] Both summary fetch attempts failed`);
          console.error(`[API] First error:`, firstError);
          console.error(`[API] Second error:`, secondError);
          
          throw new Error("Failed to fetch treatment summary using either API path");
        }
      }
    },
  });

  // Add a new treatment line - try multiple API paths
  const addTreatmentLine = useMutation({
    mutationFn: async (treatmentLine: any) => {
      // Log the API call for debugging with extra details
      console.log(`[API ATTEMPT] Trying to add new treatment line`);
      console.log(`[API ATTEMPT] First path: ${API_BASE_URL}/treatment-lines`);
      console.log(`[API ATTEMPT] Treatment line data:`, treatmentLine);
      
      try {
        // First try the module path
        console.log(`[API] Sending POST request via apiRequest utility to module path...`);
        const response = await apiRequest("POST", `${API_BASE_URL}/treatment-lines`, treatmentLine);
        console.log(`[API] POST response status:`, response.status);
        const result = await response.json();
        console.log(`[API] Add treatment line result:`, result);
        return result;
      } catch (firstError) {
        console.warn(`[API] First add attempt failed:`, firstError);
        
        // If first attempt fails, try alternate API path
        try {
          const alternatePath = `/api/treatment-plans/treatment-lines`;
          console.log(`[API ATTEMPT] Trying alternate path: ${alternatePath}`);
          
          const response = await apiRequest("POST", alternatePath, treatmentLine);
          console.log(`[API] POST (alternate) response status:`, response.status);
          const result = await response.json();
          console.log(`[API] Add treatment line result (alternate):`, result);
          return result;
        } catch (secondError) {
          console.error(`[API] Both add attempts failed`);
          console.error(`[API] First error:`, firstError);
          console.error(`[API] Second error:`, secondError);
          
          throw new Error("Failed to add treatment using either API path");
        }
      }
    },
    onSuccess: (data) => {
      // Invalidate multiple query keys to ensure refetch works
      console.log(`[API] Successfully added treatment, invalidating queries`);
      queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/treatment-lines`, quoteId] });
      queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/patient/treatment-summary`] });
      // Also invalidate alternative path queries
      queryClient.invalidateQueries({ queryKey: [`/api/treatment-plans/treatment-lines`, quoteId] });
      queryClient.invalidateQueries({ queryKey: [`/api/treatment-plans/patient/treatment-summary`] });
      
      toast({
        title: "Treatment added",
        description: "Treatment has been added to your plan",
      });
    },
    onError: (error: Error) => {
      console.error(`[API] Final error in add mutation:`, error);
      toast({
        title: "Failed to add treatment",
        description: error.message || "There was a problem adding the treatment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update an existing treatment line - try multiple API paths
  const updateTreatmentLine = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Log the API call for debugging with extra details
      console.log(`[API ATTEMPT] Trying to update treatment line with ID: ${id}`);
      console.log(`[API ATTEMPT] First path: ${API_BASE_URL}/treatment-lines/${id}`);
      console.log(`[API ATTEMPT] Update data:`, data);
      
      try {
        // First try the module path
        console.log(`[API] Sending PUT request via apiRequest utility to module path...`);
        const response = await apiRequest("PUT", `${API_BASE_URL}/treatment-lines/${id}`, data);
        console.log(`[API] PUT response status:`, response.status);
        const result = await response.json();
        console.log(`[API] Update treatment line result:`, result);
        return result;
      } catch (firstError) {
        console.warn(`[API] First update attempt failed:`, firstError);
        
        // If first attempt fails, try alternate API path
        try {
          const alternatePath = `/api/treatment-plans/treatment-lines/${id}`;
          console.log(`[API ATTEMPT] Trying alternate path: ${alternatePath}`);
          
          const response = await apiRequest("PUT", alternatePath, data);
          console.log(`[API] PUT (alternate) response status:`, response.status);
          const result = await response.json();
          console.log(`[API] Update treatment line result (alternate):`, result);
          return result;
        } catch (secondError) {
          console.error(`[API] Both update attempts failed`);
          console.error(`[API] First error:`, firstError);
          console.error(`[API] Second error:`, secondError);
          
          throw new Error("Failed to update treatment using either API path");
        }
      }
    },
    onSuccess: (data) => {
      // Invalidate multiple query keys to ensure refetch works
      console.log(`[API] Successfully updated treatment, invalidating queries`);
      queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/treatment-lines`, quoteId] });
      queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/patient/treatment-summary`] });
      // Also invalidate alternative path queries
      queryClient.invalidateQueries({ queryKey: [`/api/treatment-plans/treatment-lines`, quoteId] });
      queryClient.invalidateQueries({ queryKey: [`/api/treatment-plans/patient/treatment-summary`] });
      
      toast({
        title: "Treatment updated",
        description: "Your treatment has been updated",
      });
    },
    onError: (error: Error) => {
      console.error(`[API] Final error in update mutation:`, error);
      toast({
        title: "Failed to update treatment",
        description: error.message || "There was a problem updating the treatment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete a treatment line (soft delete) - try multiple API paths
  const deleteTreatmentLine = useMutation({
    mutationFn: async (id: string) => {
      // Log the API call for debugging with extra details
      console.log(`[API ATTEMPT] Trying to delete treatment line with ID: ${id}`);
      console.log(`[API ATTEMPT] First path: ${API_BASE_URL}/treatment-lines/${id}`);
      
      try {
        // First try the module path
        console.log(`[API] Sending DELETE request via apiRequest utility to module path...`);
        const response = await apiRequest("DELETE", `${API_BASE_URL}/treatment-lines/${id}`);
        console.log(`[API] DELETE response status:`, response.status);
        const result = await response.json();
        console.log(`[API] Delete treatment line result:`, result);
        return result;
      } catch (firstError) {
        console.warn(`[API] First delete attempt failed:`, firstError);
        
        // If first attempt fails, try alternate API path
        try {
          const alternatePath = `/api/treatment-plans/treatment-lines/${id}`;
          console.log(`[API ATTEMPT] Trying alternate path: ${alternatePath}`);
          
          const response = await apiRequest("DELETE", alternatePath);
          console.log(`[API] DELETE (alternate) response status:`, response.status);
          const result = await response.json();
          console.log(`[API] Delete treatment line result (alternate):`, result);
          return result;
        } catch (secondError) {
          console.error(`[API] Both delete attempts failed`);
          console.error(`[API] First error:`, firstError);
          console.error(`[API] Second error:`, secondError);
          
          throw new Error("Failed to delete treatment using either API path");
        }
      }
    },
    onSuccess: (data) => {
      // Invalidate multiple query keys to ensure refetch works
      console.log(`[API] Successfully deleted treatment, invalidating queries`);
      queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/treatment-lines`, quoteId] });
      queryClient.invalidateQueries({ queryKey: [`${API_BASE_URL}/patient/treatment-summary`] });
      // Also invalidate alternative path queries
      queryClient.invalidateQueries({ queryKey: [`/api/treatment-plans/treatment-lines`, quoteId] });
      queryClient.invalidateQueries({ queryKey: [`/api/treatment-plans/patient/treatment-summary`] });
      
      toast({
        title: "Treatment removed",
        description: "Treatment has been removed from your plan",
      });
    },
    onError: (error: Error) => {
      console.error(`[API] Final error in delete mutation:`, error);
      toast({
        title: "Failed to remove treatment",
        description: error.message || "There was a problem removing the treatment. Please try again.",
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