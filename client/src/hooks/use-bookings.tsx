import { useState, createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

// Define booking types
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type BookingStage = 'deposit' | 'pre_travel' | 'treatment' | 'post_treatment' | 'completed';

export interface Booking {
  id: number;
  userId: number;
  clinicId: number;
  bookingReference: string;
  status: BookingStatus;
  stage: BookingStage;
  createdAt: string;
  updatedAt: string;
  arrivalDate?: string;
  departureDate?: string;
  flightNumber?: string;
  accommodationType?: string;
  accommodationDetails?: string;
  specialRequests?: string;
  depositAmount: number;
  depositPaid: boolean;
  totalPaid: number;
  balanceDue: number;
  assignedAdminId?: number;
  assignedClinicStaffId?: number;
  lastNotificationSentAt?: string;
}

interface CreateBookingData {
  userId: number;
  clinicId: number;
  arrivalDate?: string;
  departureDate?: string;
  flightNumber?: string;
  accommodationType?: string;
  accommodationDetails?: string;
  specialRequests?: string;
  depositAmount?: number;
}

interface UpdateBookingData {
  status?: BookingStatus;
  stage?: BookingStage;
  arrivalDate?: string;
  departureDate?: string;
  flightNumber?: string;
  accommodationType?: string;
  accommodationDetails?: string;
  specialRequests?: string;
  depositPaid?: boolean;
  depositAmount?: number;
  totalPaid?: number;
  balanceDue?: number;
  assignedAdminId?: number | null;
  assignedClinicStaffId?: number | null;
}

interface BookingsContextType {
  useBookings: () => {
    data: Booking[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  useClinicBookings: (clinicId: number) => {
    data: Booking[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  useUserBookings: (userId: number) => {
    data: Booking[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  useBookingDetails: (bookingId: number) => {
    data: Booking | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  createBooking: (
    data: CreateBookingData,
    options?: {
      onSuccess?: (data: Booking) => void;
      onError?: (error: Error) => void;
    }
  ) => void;
  updateBooking: (
    {
      bookingId,
      data,
    }: {
      bookingId: number;
      data: UpdateBookingData;
    },
    options?: {
      onSuccess?: (data: Booking) => void;
      onError?: (error: Error) => void;
    }
  ) => void;
  cancelBooking: (
    bookingId: number,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isCancelling: boolean;
}

export const BookingsContext = createContext<BookingsContextType | null>(null);

export const BookingsProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // State for mutations
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Get all bookings
  const useBookings = () => {
    const {
      data,
      isLoading,
      error,
      refetch,
    } = useQuery<Booking[], Error>({
      queryKey: ['/api/bookings'],
      retry: 1,
    });

    return {
      data,
      isLoading,
      error,
      refetch,
    };
  };

  // Get bookings for a specific clinic
  const useClinicBookings = (clinicId: number) => {
    const {
      data,
      isLoading,
      error,
      refetch,
    } = useQuery<Booking[], Error>({
      queryKey: ['/api/bookings/clinic', clinicId],
      retry: 1,
    });

    return {
      data,
      isLoading,
      error,
      refetch,
    };
  };

  // Get bookings for a specific user
  const useUserBookings = (userId: number) => {
    const {
      data,
      isLoading,
      error,
      refetch,
    } = useQuery<Booking[], Error>({
      queryKey: ['/api/bookings/user', userId],
      retry: 1,
    });

    return {
      data,
      isLoading,
      error,
      refetch,
    };
  };

  // Get details for a specific booking
  const useBookingDetails = (bookingId: number) => {
    const {
      data,
      isLoading,
      error,
      refetch,
    } = useQuery<Booking, Error>({
      queryKey: ['/api/bookings', bookingId],
      retry: 1,
    });

    return {
      data,
      isLoading,
      error,
      refetch,
    };
  };

  // Create a new booking
  const createBooking = async (
    data: CreateBookingData,
    options?: {
      onSuccess?: (data: Booking) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    setIsCreating(true);
    try {
      const response = await apiRequest('POST', '/api/bookings', data);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create booking');
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/clinic', data.clinicId] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/user', data.userId] });
      
      if (options?.onSuccess) {
        options.onSuccess(responseData);
      } else {
        toast({
          title: t('bookings.create_success_title'),
          description: t('bookings.create_success_message'),
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      if (options?.onError) {
        options.onError(error as Error);
      } else {
        toast({
          title: t('bookings.create_error_title'),
          description: (error as Error).message || t('bookings.create_error_message'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Update a booking
  const updateBooking = async (
    {
      bookingId,
      data,
    }: {
      bookingId: number;
      data: UpdateBookingData;
    },
    options?: {
      onSuccess?: (data: Booking) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    setIsUpdating(true);
    try {
      const response = await apiRequest('PATCH', `/api/bookings/${bookingId}`, data);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update booking');
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/clinic'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings', bookingId] });
      
      if (options?.onSuccess) {
        options.onSuccess(responseData);
      } else {
        toast({
          title: t('bookings.update_success_title'),
          description: t('bookings.update_success_message'),
        });
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      if (options?.onError) {
        options.onError(error as Error);
      } else {
        toast({
          title: t('bookings.update_error_title'),
          description: (error as Error).message || t('bookings.update_error_message'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel a booking
  const cancelBooking = async (
    bookingId: number,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ) => {
    setIsCancelling(true);
    try {
      const response = await apiRequest('POST', `/api/bookings/${bookingId}/cancel`, {});
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to cancel booking');
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/clinic'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings', bookingId] });
      
      if (options?.onSuccess) {
        options.onSuccess();
      } else {
        toast({
          title: t('bookings.cancel_success_title'),
          description: t('bookings.cancel_success_message'),
        });
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      if (options?.onError) {
        options.onError(error as Error);
      } else {
        toast({
          title: t('bookings.cancel_error_title'),
          description: (error as Error).message || t('bookings.cancel_error_message'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsCancelling(false);
    }
  };

  // Create mutations
  const createBookingMutation = useMutation({
    mutationFn: async (data: CreateBookingData) => {
      const res = await apiRequest('POST', '/api/bookings', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    }
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, data }: { bookingId: number; data: UpdateBookingData }) => {
      const res = await apiRequest('PATCH', `/api/bookings/${bookingId}`, data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings', variables.bookingId] });
    }
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest('POST', `/api/bookings/${bookingId}/cancel`, {});
      return await res.json();
    },
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings', bookingId] });
    }
  });

  return (
    <BookingsContext.Provider
      value={{
        useBookings,
        useClinicBookings,
        useUserBookings,
        useBookingDetails,
        createBooking,
        updateBooking,
        cancelBooking,
        isCreating,
        isUpdating,
        isCancelling,
      }}
    >
      {children}
    </BookingsContext.Provider>
  );
};

export function useBookings() {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
}