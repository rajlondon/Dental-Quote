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

  // Fetch treatment lines for a specific quote
  const {
    data: treatmentLines,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/treatment-plans/treatment-lines", quoteId],
    queryFn: async () => {
      if (!quoteId) return [];
      
      // Use the correct API endpoint that's actually mounted in the server
      console.log(`Sending GET request to /api/treatment-plans/treatment-lines/${quoteId}`);
      const response = await apiRequest("GET", `/api/treatment-plans/treatment-lines/${quoteId}`);
      const data = await response.json() as TreatmentLineResponse;
      
      if (!data.success) {
        throw new Error("Failed to fetch treatment lines");
      }
      
      return data.data;
    },
    enabled: !!quoteId,
  });

  // Fetch treatment summary for the logged-in patient
  const {
    data: treatmentSummary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ["/api/treatment-plans/patient/treatment-summary"],
    queryFn: async () => {
      // Use the correct API endpoint that's actually mounted in the server
      console.log("Sending GET request to /api/treatment-plans/patient/treatment-summary");
      const response = await apiRequest("GET", "/api/treatment-plans/patient/treatment-summary");
      const data = await response.json() as TreatmentSummaryResponse;
      
      if (!data.success) {
        throw new Error("Failed to fetch treatment summary");
      }
      
      return data.data;
    },
  });

  // Add a new treatment line
  const addTreatmentLine = useMutation({
    mutationFn: async (treatmentLine: any) => {
      // Use the correct API endpoint that's actually mounted in the server
      console.log("Sending POST request to /api/treatment-module/treatment-lines with data:", treatmentLine);
      const response = await apiRequest("POST", "/api/treatment-module/treatment-lines", treatmentLine);
      return await response.json();
    },
    onSuccess: (data) => {
      // Use the correct query keys to match new endpoint paths
      queryClient.invalidateQueries({ queryKey: ["/api/treatment-module/treatment-lines", quoteId] });
      queryClient.invalidateQueries({ queryKey: ["/api/treatment-module/patient/treatment-summary"] });
      
      toast({
        title: "Treatment added",
        description: "Treatment has been added to your plan",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add treatment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an existing treatment line
  const updateTreatmentLine = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Use the correct API endpoint that's actually mounted in the server
      console.log(`Sending PUT request to /api/treatment-module/treatment-lines/${id} with data:`, data);
      const response = await apiRequest("PUT", `/api/treatment-module/treatment-lines/${id}`, data);
      return await response.json();
    },
    onSuccess: (data) => {
      // Use the correct query keys to match new endpoint paths
      queryClient.invalidateQueries({ queryKey: ["/api/treatment-module/treatment-lines", quoteId] });
      queryClient.invalidateQueries({ queryKey: ["/api/treatment-module/patient/treatment-summary"] });
      
      toast({
        title: "Treatment updated",
        description: "Your treatment has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update treatment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a treatment line (soft delete)
  const deleteTreatmentLine = useMutation({
    mutationFn: async (id: string) => {
      // Use the correct API endpoint that's actually mounted in the server
      console.log(`Sending DELETE request to /api/treatment-module/treatment-lines/${id}`);
      const response = await apiRequest("DELETE", `/api/treatment-module/treatment-lines/${id}`);
      return await response.json();
    },
    onSuccess: (data) => {
      // Use the correct query keys to match new endpoint paths
      queryClient.invalidateQueries({ queryKey: ["/api/treatment-module/treatment-lines", quoteId] });
      queryClient.invalidateQueries({ queryKey: ["/api/treatment-module/patient/treatment-summary"] });
      
      toast({
        title: "Treatment removed",
        description: "Treatment has been removed from your plan",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove treatment",
        description: error.message,
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