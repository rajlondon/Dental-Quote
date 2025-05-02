import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';

// Types for the appointments feature
export interface AppointmentData {
  id: number;
  bookingId: number;
  clinicId: number;
  title: string;
  description?: string;
  startTime: string | Date;
  endTime: string | Date;
  type: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'missed';
  clinicNotes?: string;
  adminNotes?: string;
  reminderSent: boolean;
  followUpRequired: boolean;
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  bookingId?: number;
  clinicId: number;
  title: string;
  description?: string;
  startTime: string | Date;
  endTime: string | Date;
  type: string;
  status: string;
  clinicNotes?: string;
  reminderSent?: boolean;
  followUpRequired?: boolean;
}

export function useAppointments(bookingId?: number) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Query for fetching appointments
  const {
    data: appointments,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: bookingId 
      ? [`/api/booking/${bookingId}/appointments`] 
      : [`/api/appointments/clinic/${user?.clinicId}`, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const url = bookingId
        ? `/api/booking/${bookingId}/appointments`
        : `/api/appointments/clinic/${user?.clinicId}?date=${format(selectedDate, 'yyyy-MM-dd')}`;
        
      const res = await apiRequest('GET', url);
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch appointments');
      }
      
      return data.data?.appointments || [];
    },
    enabled: !!user && (!!bookingId || !!user.clinicId)
  });

  // Mutation for creating a new appointment
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      let url = '';
      
      // Use different endpoint based on if it's a standalone clinic appointment or booking-related
      if (data.bookingId && data.bookingId > 0) {
        // Booking-related appointment
        url = `/api/booking/${data.bookingId}/appointments`;
      } else {
        // Standalone clinic appointment
        url = `/api/appointments/clinic/${data.clinicId}`;
        
        // Make sure bookingId is undefined for standalone appointments
        // to avoid SQL constraint errors (as we modified the schema to make it optional)
        if ('bookingId' in data) {
          const { bookingId, ...dataWithoutBookingId } = data;
          data = dataWithoutBookingId;
        }
      }
      
      const res = await apiRequest('POST', url, data);
      const responseData = await res.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to create appointment');
      }
      
      return responseData.data.appointment;
    },
    onSuccess: () => {
      toast({
        title: 'Appointment created',
        description: 'The appointment has been successfully created.',
        variant: 'default',
      });
      // Invalidate the appointments query to refetch the data
      if (bookingId) {
        queryClient.invalidateQueries({ queryKey: [`/api/booking/${bookingId}/appointments`] });
      } else if (user?.clinicId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/appointments/clinic/${user.clinicId}`, format(selectedDate, 'yyyy-MM-dd')]
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating appointment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation for updating an appointment
  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, data }: { appointmentId: number, data: Partial<AppointmentData> }) => {
      const url = `/api/booking/${data.bookingId}/appointments/${appointmentId}`;
      const res = await apiRequest('PATCH', url, data);
      const responseData = await res.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to update appointment');
      }
      
      return responseData.data.appointment;
    },
    onSuccess: () => {
      toast({
        title: 'Appointment updated',
        description: 'The appointment has been successfully updated.',
        variant: 'default',
      });
      // Invalidate the appointments query to refetch the data
      if (bookingId) {
        queryClient.invalidateQueries({ queryKey: [`/api/booking/${bookingId}/appointments`] });
      } else if (user?.clinicId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/appointments/clinic/${user.clinicId}`, format(selectedDate, 'yyyy-MM-dd')]
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating appointment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation for cancelling an appointment
  const cancelAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, bookingId }: { appointmentId: number, bookingId: number }) => {
      const url = `/api/booking/${bookingId}/appointments/${appointmentId}`;
      const res = await apiRequest('PATCH', url, { status: 'cancelled' });
      const responseData = await res.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to cancel appointment');
      }
      
      return responseData.data.appointment;
    },
    onSuccess: () => {
      toast({
        title: 'Appointment cancelled',
        description: 'The appointment has been successfully cancelled.',
        variant: 'default',
      });
      // Invalidate the appointments query to refetch the data
      if (bookingId) {
        queryClient.invalidateQueries({ queryKey: [`/api/booking/${bookingId}/appointments`] });
      } else if (user?.clinicId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/appointments/clinic/${user.clinicId}`, format(selectedDate, 'yyyy-MM-dd')]
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error cancelling appointment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return {
    appointments,
    isLoading,
    error,
    refetch,
    selectedDate,
    setSelectedDate,
    createAppointment: createAppointmentMutation.mutate,
    updateAppointment: updateAppointmentMutation.mutate,
    cancelAppointment: cancelAppointmentMutation.mutate,
    isCreating: createAppointmentMutation.isPending,
    isUpdating: updateAppointmentMutation.isPending,
    isCancelling: cancelAppointmentMutation.isPending
  };
}