import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PackagesResponse {
  success: boolean;
  data: any[]; // Using any for now, can be typed properly later
}

interface PackageResponse {
  success: boolean;
  data: any; // Using any for now, can be typed properly later
}

interface BookPackageResponse {
  success: boolean;
  data: {
    treatmentLine: any;
    quoteId: string;
    package: any;
  };
  message: string;
}

export function usePackages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all available packages
  const {
    data: packages,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/public/packages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/public/packages");
      const data = await response.json() as PackagesResponse;
      
      if (!data.success) {
        throw new Error("Failed to fetch packages");
      }
      
      return data.data;
    },
  });

  // Fetch a specific package by ID
  const getPackage = (packageId: string) => {
    return useQuery({
      queryKey: ["/api/treatment-module/packages", packageId],
      queryFn: async () => {
        const response = await apiRequest("GET", `/api/treatment-module/packages/${packageId}`);
        const data = await response.json() as PackageResponse;
        
        if (!data.success) {
          throw new Error("Failed to fetch package details");
        }
        
        return data.data;
      },
      enabled: !!packageId,
    });
  };

  // Book a package
  const bookPackage = useMutation({
    mutationFn: async (packageId: string) => {
      const response = await apiRequest("POST", `/api/treatment-module/book-package/${packageId}`);
      return await response.json() as BookPackageResponse;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to update UI
      queryClient.invalidateQueries({ queryKey: ["/api/treatment-module/patient/treatment-summary"] });
      
      // Show success toast
      toast({
        title: "Package Booked",
        description: data.message || "Your treatment package has been successfully booked",
      });
      
      // Return the data for further processing if needed
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book the treatment package",
        variant: "destructive",
      });
    },
  });

  return {
    packages,
    isLoading,
    error,
    refetch,
    getPackage,
    bookPackage,
  };
}