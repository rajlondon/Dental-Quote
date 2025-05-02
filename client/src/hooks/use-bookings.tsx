import { createContext, ReactNode, useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Booking, InsertBooking } from "@shared/schema";

// Types
export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
export type BookingStage = "deposit" | "pre_travel" | "treatment" | "post_treatment" | "completed";

export type BookingQuery = {
  userId?: number;
  clinicId?: number;
  status?: BookingStatus;
  stage?: BookingStage;
};

export type BookingContextType = {
  // Query hooks
  useAllBookings: () => {
    data: Booking[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  useUserBookings: (userId: number) => {
    data: Booking[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  useClinicBookings: (clinicId: number) => {
    data: Booking[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  useBooking: (id: string) => {
    data: Booking | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  
  // Mutation hooks
  useCreateBooking: () => {
    createBooking: (data: InsertBooking) => Promise<Booking>;
    isLoading: boolean;
    error: Error | null;
  };
  useUpdateBooking: () => {
    updateBooking: (id: number, data: Partial<InsertBooking>) => Promise<Booking>;
    isLoading: boolean;
    error: Error | null;
  };
  useUpdateBookingStatus: () => {
    updateStatus: (id: number, status: BookingStatus) => Promise<Booking>;
    isLoading: boolean;
    error: Error | null;
  };
  useUpdateBookingStage: () => {
    updateStage: (id: number, stage: BookingStage) => Promise<Booking>;
    isLoading: boolean;
    error: Error | null;
  };
  useDeleteBooking: () => {
    deleteBooking: (id: number) => Promise<void>;
    isLoading: boolean;
    error: Error | null;
  };
};

// Create context
export const BookingsContext = createContext<BookingContextType | null>(null);

// Provider component
export function BookingsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Query hooks
  const useAllBookings = () => {
    const { data = [], isLoading, error, refetch } = useQuery<Booking[], Error>({
      queryKey: ['/api/bookings'],
      retry: 1,
    });
    return { data, isLoading, error, refetch };
  };
  
  const useUserBookings = (userId: number) => {
    const { data = [], isLoading, error, refetch } = useQuery<Booking[], Error>({
      queryKey: ['/api/bookings/user', userId],
      retry: 1,
      enabled: !!userId,
    });
    return { data, isLoading, error, refetch };
  };
  
  const useClinicBookings = (clinicId: number) => {
    const { data = [], isLoading, error, refetch } = useQuery<Booking[], Error>({
      queryKey: ['/api/bookings/clinic', clinicId],
      retry: 1,
      enabled: !!clinicId,
    });
    return { data, isLoading, error, refetch };
  };
  
  const useBooking = (id: string) => {
    const { data, isLoading, error, refetch } = useQuery<Booking, Error>({
      queryKey: ['/api/bookings', id],
      retry: 1,
      enabled: !!id,
    });
    return { data, isLoading, error, refetch };
  };
  
  // Mutation hooks
  const useCreateBooking = () => {
    const mutation = useMutation({
      mutationFn: async (data: InsertBooking) => {
        const response = await apiRequest("POST", "/api/bookings", data);
        return await response.json();
      },
      onSuccess: () => {
        toast({
          title: "Booking Created",
          description: "Your booking has been created successfully.",
          variant: "success",
        });
        // Invalidate bookings queries
        queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      },
      onError: (error: Error) => {
        toast({
          title: "Error Creating Booking",
          description: error.message || "There was an error creating your booking.",
          variant: "destructive",
        });
      },
    });
    
    return {
      createBooking: mutation.mutateAsync,
      isLoading: mutation.isPending,
      error: mutation.error,
    };
  };
  
  const useUpdateBooking = () => {
    const mutation = useMutation({
      mutationFn: async ({ id, data }: { id: number; data: Partial<InsertBooking> }) => {
        const response = await apiRequest("PATCH", `/api/bookings/${id}`, data);
        return await response.json();
      },
      onSuccess: (_, variables) => {
        toast({
          title: "Booking Updated",
          description: "Booking details have been updated successfully.",
          variant: "success",
        });
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bookings', String(variables.id)] });
      },
      onError: (error: Error) => {
        toast({
          title: "Error Updating Booking",
          description: error.message || "There was an error updating the booking.",
          variant: "destructive",
        });
      },
    });
    
    return {
      updateBooking: (id: number, data: Partial<InsertBooking>) => 
        mutation.mutateAsync({ id, data }),
      isLoading: mutation.isPending,
      error: mutation.error,
    };
  };
  
  const useUpdateBookingStatus = () => {
    const mutation = useMutation({
      mutationFn: async ({ id, status }: { id: number; status: BookingStatus }) => {
        const response = await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
        return await response.json();
      },
      onSuccess: (_, variables) => {
        toast({
          title: "Status Updated",
          description: `Booking status has been updated to ${variables.status}.`,
          variant: "success",
        });
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bookings', String(variables.id)] });
      },
      onError: (error: Error) => {
        toast({
          title: "Error Updating Status",
          description: error.message || "There was an error updating the booking status.",
          variant: "destructive",
        });
      },
    });
    
    return {
      updateStatus: (id: number, status: BookingStatus) => 
        mutation.mutateAsync({ id, status }),
      isLoading: mutation.isPending,
      error: mutation.error,
    };
  };
  
  const useUpdateBookingStage = () => {
    const mutation = useMutation({
      mutationFn: async ({ id, stage }: { id: number; stage: BookingStage }) => {
        const response = await apiRequest("PATCH", `/api/bookings/${id}/stage`, { stage });
        return await response.json();
      },
      onSuccess: (_, variables) => {
        toast({
          title: "Stage Updated",
          description: `Booking stage has been updated to ${variables.stage}.`,
          variant: "success",
        });
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bookings', String(variables.id)] });
      },
      onError: (error: Error) => {
        toast({
          title: "Error Updating Stage",
          description: error.message || "There was an error updating the booking stage.",
          variant: "destructive",
        });
      },
    });
    
    return {
      updateStage: (id: number, stage: BookingStage) => 
        mutation.mutateAsync({ id, stage }),
      isLoading: mutation.isPending,
      error: mutation.error,
    };
  };
  
  const useDeleteBooking = () => {
    const mutation = useMutation({
      mutationFn: async (id: number) => {
        await apiRequest("DELETE", `/api/bookings/${id}`);
      },
      onSuccess: () => {
        toast({
          title: "Booking Deleted",
          description: "The booking has been deleted successfully.",
          variant: "success",
        });
        // Invalidate bookings queries
        queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      },
      onError: (error: Error) => {
        toast({
          title: "Error Deleting Booking",
          description: error.message || "There was an error deleting the booking.",
          variant: "destructive",
        });
      },
    });
    
    return {
      deleteBooking: mutation.mutateAsync,
      isLoading: mutation.isPending,
      error: mutation.error,
    };
  };
  
  // Construct value object
  const value: BookingContextType = {
    useAllBookings,
    useUserBookings,
    useClinicBookings,
    useBooking,
    useCreateBooking,
    useUpdateBooking,
    useUpdateBookingStatus,
    useUpdateBookingStage,
    useDeleteBooking,
  };
  
  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  );
}

// Hook for accessing context
export function useBookings() {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error("useBookings must be used within a BookingsProvider");
  }
  return context;
}