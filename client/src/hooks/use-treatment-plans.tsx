import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TreatmentPlan, TreatmentPlanStatus, PaymentStatus, CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from "../../shared/models/treatment-plan";

interface TreatmentPlansResponse {
  success: boolean;
  message: string;
  data: {
    treatmentPlans: TreatmentPlan[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

interface TreatmentPlanResponse {
  success: boolean;
  message: string;
  data: {
    treatmentPlan: TreatmentPlan;
  };
}

export function useTreatmentPlans(page: number = 1, limit: number = 10, status?: string, search?: string) {
  return useQuery<TreatmentPlansResponse>({
    queryKey: ['/api/clinic/treatment-plans', page, limit, status, search],
    queryFn: async () => {
      let url = `/api/clinic/treatment-plans?page=${page}&limit=${limit}`;
      
      if (status) {
        url += `&status=${status}`;
      }
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const res = await apiRequest("GET", url);
      return res.json();
    },
  });
}

export function useTreatmentPlan(id?: number) {
  return useQuery<TreatmentPlanResponse>({
    queryKey: ['/api/clinic/treatment-plans', id],
    queryFn: async () => {
      if (!id) throw new Error("Treatment plan ID is required");
      const res = await apiRequest("GET", `/api/clinic/treatment-plans/${id}`);
      return res.json();
    },
    enabled: !!id, // Only run query if id is provided
  });
}

export function useCreateTreatmentPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTreatmentPlanDto) => {
      const res = await apiRequest("POST", "/api/clinic/treatment-plans", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/treatment-plans'] });
      toast({
        title: "Treatment plan created",
        description: "The treatment plan has been created successfully.",
      });
      return data.data.treatmentPlan;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create treatment plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTreatmentPlan(id?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateTreatmentPlanDto) => {
      if (!id && !data.id) throw new Error("Treatment plan ID is required");
      const planId = id || data.id;
      const res = await apiRequest("PATCH", `/api/clinic/treatment-plans/${planId}`, data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/treatment-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/treatment-plans', id] });
      toast({
        title: "Treatment plan updated",
        description: "The treatment plan has been updated successfully.",
      });
      return data.data.treatmentPlan;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update treatment plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTreatmentPlan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/clinic/treatment-plans/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clinic/treatment-plans'] });
      toast({
        title: "Treatment plan deleted",
        description: "The treatment plan has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete treatment plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}