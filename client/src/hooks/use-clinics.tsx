import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clinic } from "@/types/clinic";
import { useToast } from "@/hooks/use-toast";

export function useClinics() {
  const { toast } = useToast();

  // Query for all clinics (for admin portal)
  const allClinicsQuery = useQuery<Clinic[]>({
    queryKey: ["/api/clinics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/clinics");
      const data = await response.json();
      return data.data;
    },
    enabled: false // Manually enable when needed
  });

  // Get a specific clinic by ID
  const getClinicQuery = (id: number) => useQuery<Clinic>({
    queryKey: ["/api/clinics", id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/clinics/${id}`);
      const data = await response.json();
      return data.data;
    },
    enabled: !!id // Only fetch when ID is provided
  });

  // Update a clinic
  const updateClinicMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Clinic> }) => {
      const response = await apiRequest("PATCH", `/api/clinics/${id}`, data);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/clinics", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/clinics"] });
      
      toast({
        title: "Clinic updated",
        description: "The clinic has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating clinic",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    allClinicsQuery,
    getClinicQuery,
    updateClinicMutation
  };
}