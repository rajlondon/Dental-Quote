import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

// Types for the bookings feature
export interface BookingData {
  id: number;
  bookingReference: string;
  userId: number;
  quoteRequestId?: number;
  clinicId: number;
  treatmentPlanId?: number;
  assignedAdminId?: number;
  assignedClinicStaffId?: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  stage: 'deposit' | 'pre_travel' | 'treatment' | 'post_treatment' | 'completed';
  depositPaid: boolean;
  depositAmount: number;
  totalPaid: number;
  balanceDue?: number;
  arrivalDate?: string;
  departureDate?: string;
  flightNumber?: string;
  accommodationType?: string;
  accommodationDetails?: string;
  accommodationBooked: boolean;
  transfersBooked: boolean;
  specialRequests?: string;
  lastPatientMessageAt?: string;
  lastClinicMessageAt?: string;
  lastAdminMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  userId: number;
  quoteRequestId?: number;
  clinicId: number;
  treatmentPlanId?: number;
  status?: string;
  stage?: string;
  depositAmount?: number;
  specialRequests?: string;
}

export function useBookings(userId?: number, clinicId?: number) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // ID for queries based on user role and provided parameters
  const effectiveUserId = userId || (user?.role === 'patient' ? user.id : undefined);
  const effectiveClinicId = clinicId || (user?.role === 'clinic_staff' ? user?.clinicId : undefined);

  // Query for fetching all bookings based on user role
  const { 
    data: bookings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [
      effectiveUserId ? `/api/booking/user/${effectiveUserId}` : 
      effectiveClinicId ? `/api/booking/clinic/${effectiveClinicId}` : 
      '/api/booking'
    ],
    queryFn: async () => {
      let url = '/api/booking';
      
      if (effectiveUserId) {
        url = `/api/booking/user/${effectiveUserId}`;
      } else if (effectiveClinicId) {
        url = `/api/booking/clinic/${effectiveClinicId}`;
      }
      
      const res = await apiRequest('GET', url);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch bookings');
      }
      
      return data.data?.bookings || [];
    },
    enabled: !!user && (user.role === 'admin' || !!effectiveUserId || !!effectiveClinicId)
  });

  // Query for fetching a single booking
  const useBookingDetails = (bookingId?: number) => {
    return useQuery({
      queryKey: [`/api/booking/${bookingId}`],
      queryFn: async () => {
        const res = await apiRequest('GET', `/api/booking/${bookingId}`);
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch booking details');
        }
        
        return data.data?.booking;
      },
      enabled: !!bookingId
    });
  };

  // Mutation for creating a new booking
  const createBookingMutation = useMutation({
    mutationFn: async (data: CreateBookingData) => {
      const res = await apiRequest('POST', '/api/booking', data);
      const responseData = await res.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to create booking');
      }
      
      return responseData.data.booking;
    },
    onSuccess: () => {
      toast({
        title: 'Booking created',
        description: 'The booking has been successfully created.',
        variant: 'default',
      });
      
      // Invalidate relevant queries based on user role
      if (effectiveUserId) {
        queryClient.invalidateQueries({ queryKey: [`/api/booking/user/${effectiveUserId}`] });
      } else if (effectiveClinicId) {
        queryClient.invalidateQueries({ queryKey: [`/api/booking/clinic/${effectiveClinicId}`] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/booking'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating booking',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation for updating a booking
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, data }: { bookingId: number, data: Partial<BookingData> }) => {
      const res = await apiRequest('PATCH', `/api/booking/${bookingId}`, data);
      const responseData = await res.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to update booking');
      }
      
      return responseData.data.booking;
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Booking updated',
        description: 'The booking has been successfully updated.',
        variant: 'default',
      });
      
      // Invalidate the specific booking query
      queryClient.invalidateQueries({ queryKey: [`/api/booking/${variables.bookingId}`] });
      
      // Invalidate broader queries
      if (effectiveUserId) {
        queryClient.invalidateQueries({ queryKey: [`/api/booking/user/${effectiveUserId}`] });
      } else if (effectiveClinicId) {
        queryClient.invalidateQueries({ queryKey: [`/api/booking/clinic/${effectiveClinicId}`] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/booking'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating booking',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation for cancelling a booking
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest('PATCH', `/api/booking/${bookingId}`, { status: 'cancelled' });
      const responseData = await res.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to cancel booking');
      }
      
      return responseData.data.booking;
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Booking cancelled',
        description: 'The booking has been successfully cancelled.',
        variant: 'default',
      });
      
      // Invalidate the specific booking query
      queryClient.invalidateQueries({ queryKey: [`/api/booking/${variables}`] });
      
      // Invalidate broader queries
      if (effectiveUserId) {
        queryClient.invalidateQueries({ queryKey: [`/api/booking/user/${effectiveUserId}`] });
      } else if (effectiveClinicId) {
        queryClient.invalidateQueries({ queryKey: [`/api/booking/clinic/${effectiveClinicId}`] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/booking'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error cancelling booking',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    bookings,
    isLoading,
    error,
    refetch,
    useBookingDetails,
    createBooking: createBookingMutation.mutate,
    updateBooking: updateBookingMutation.mutate,
    cancelBooking: cancelBookingMutation.mutate,
    isCreating: createBookingMutation.isPending,
    isUpdating: updateBookingMutation.isPending,
    isCancelling: cancelBookingMutation.isPending
  };
}