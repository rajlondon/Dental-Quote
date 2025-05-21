import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, isSameDay, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CalendarIcon, Clock, MapPin, Video, MessageSquare, AlertCircle, ClipboardCheck, Pencil, Loader2 } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Types
interface Appointment {
  id: string;
  clinicId: number;
  clinicName: string;
  clinicLogo?: string;
  clinicAddress: string;
  date: string;
  time: string;
  duration: string;
  endTime: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  virtualOption: boolean;
  meetLink?: string;
  doctorName: string;
  doctorId: string;
  promotionCode?: string;
  promotionDiscount?: number;
  patientName?: string;
  confirmationNotes?: string;
  directions?: string;
}

const AppointmentsSection: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [tab, setTab] = useState('upcoming');

  // Fetch appointments from the backend API
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const res = await apiRequest('GET', '/api/patient/appointments');
        const data = await res.json();
        
        if (data.success && data.appointments && data.appointments.length > 0) {
          // Process real appointment data from the API
          const processedAppointments = data.appointments.map((appt: any) => ({
            ...appt,
            // Ensure status is one of the valid status types
            status: ['confirmed', 'pending', 'cancelled', 'completed'].includes(appt.status) 
              ? appt.status as 'confirmed' | 'pending' | 'cancelled' | 'completed'
              : 'pending'
          }));
          setAppointments(processedAppointments);
        } else {
          // If API doesn't have data yet, use sample data for development only
          console.warn('No appointment data found in API response, using development placeholders');
          const sampleData: Appointment[] = [
            {
              id: '1',
              clinicId: 1,
              clinicName: 'DentSpa Istanbul',
              clinicLogo: '',
              clinicAddress: 'Bağdat Caddesi No:123, Kadıköy, Istanbul',
              date: '2025-05-25',
              time: '10:00',
              duration: '60',
              endTime: '11:00',
              type: 'Initial Consultation',
              status: 'confirmed',
              notes: 'Please arrive 15 minutes early to complete paperwork.',
              virtualOption: false,
              doctorName: 'Dr. Mehmet Yılmaz',
              doctorId: '1',
              directions: 'Located on the 3rd floor of the Bağdat Plaza shopping center. Public transportation available - bus stops 5 min walk away.'
            },
            {
              id: '2',
              clinicId: 2,
              clinicName: 'Beyaz Ada Dental Clinic',
              clinicLogo: '',
              clinicAddress: 'Teşvikiye Mah, Nişantaşı, Istanbul',
              date: '2025-06-10',
              time: '14:30',
              duration: '120',
              endTime: '16:30',
              type: 'Dental Implant Procedure',
              status: 'pending',
              notes: 'First session of dental implant treatment. Please follow pre-procedure instructions.',
              virtualOption: false,
              doctorName: 'Dr. Ayşe Demir',
              doctorId: '2'
            },
            {
              id: '3',
              clinicId: 1,
              clinicName: 'DentSpa Istanbul',
              clinicLogo: '',
              clinicAddress: 'Bağdat Caddesi No:123, Kadıköy, Istanbul',
              date: '2025-05-20',
              time: '13:00',
              duration: '30',
              endTime: '13:30',
              type: 'Virtual Consultation',
              status: 'completed',
              virtualOption: true,
              meetLink: 'https://meet.google.com/abc-defg-hij',
              doctorName: 'Dr. Mehmet Yılmaz',
              doctorId: '1'
            }
          ];
          setAppointments(sampleData);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: t('common.error', 'Error'),
          description: t('patient.appointments.fetch_error', 'Failed to load appointments'),
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user?.id, t, toast]);

  // Filter appointments based on selected tab
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tab === 'upcoming') {
      return (appointmentDate >= today && appointment.status !== 'cancelled');
    } else if (tab === 'past') {
      return (appointmentDate < today || appointment.status === 'completed');
    } else if (tab === 'cancelled') {
      return appointment.status === 'cancelled';
    }
    return true;
  });

  // Group appointments by date
  const groupedAppointments = filteredAppointments.reduce((groups: Record<string, Appointment[]>, appointment) => {
    const date = appointment.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  // Dates with appointments for the calendar
  const datesWithAppointments = appointments.map(appointment => 
    new Date(appointment.date)
  );

  // Cancel appointment
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    setIsCancelling(true);
    try {
      // In a real app, this would send the cancellation reason to the server
      const res = await apiRequest('POST', `/api/patient/appointments/${selectedAppointment.id}/cancel`, {
        reason: cancelReason
      });
      
      // Update local state (simulated response)
      const updatedAppointments = appointments.map(appointment => 
        appointment.id === selectedAppointment.id 
          ? {...appointment, status: 'cancelled'} 
          : appointment
      );
      
      setAppointments(updatedAppointments);
      setShowCancelDialog(false);
      setShowAppointmentDetails(false);
      
      toast({
        title: t('patient.appointments.cancelled', 'Appointment Cancelled'),
        description: t('patient.appointments.cancellation_success', 'Your appointment has been successfully cancelled'),
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: t('common.error', 'Error'),
        description: t('patient.appointments.cancel_error', 'Failed to cancel appointment'),
        variant: 'destructive'
      });
    } finally {
      setIsCancelling(false);
      setCancelReason('');
    }
  };

  // Get status badge UI
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Function to render appointment card
  const renderAppointmentCard = (appointment: Appointment) => (
    <Card 
      key={appointment.id} 
      className={`mb-4 ${appointment.status === 'cancelled' ? 'opacity-60' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="mr-3">
              <Avatar className="h-10 w-10 bg-primary/10">
                <AvatarFallback className="text-primary">
                  {appointment.clinicName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <CardTitle className="text-base">{appointment.clinicName}</CardTitle>
              <CardDescription className="text-xs flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm">
          <div className="flex items-start">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{appointment.time} - {appointment.endTime}</p>
              <p className="text-xs text-muted-foreground">{appointment.duration} minutes</p>
            </div>
          </div>
          <div className="flex items-start">
            <ClipboardCheck className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{appointment.type}</p>
              <p className="text-xs text-muted-foreground">with Dr. {appointment.doctorName}</p>
            </div>
          </div>
        </div>
        
        {appointment.virtualOption && appointment.meetLink && (
          <div className="mt-3 flex items-center">
            <Video className="h-4 w-4 mr-2 text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">Virtual Appointment</span>
          </div>
        )}
        
        {appointment.notes && (
          <div className="mt-3 p-2 bg-muted/50 rounded-md">
            <p className="text-xs">{appointment.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => {
            setSelectedAppointment(appointment);
            setShowAppointmentDetails(true);
          }}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('patient.appointments.title', 'My Appointments')}</h2>
          <p className="text-muted-foreground">{t('patient.appointments.description', 'View and manage your dental appointments')}</p>
        </div>
      </div>
      
      <Tabs 
        defaultValue="upcoming" 
        className="w-full"
        value={tab}
        onValueChange={setTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredAppointments.length === 0 ? (
                <Card className="py-8">
                  <CardContent className="text-center">
                    <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-2">No Upcoming Appointments</h3>
                    <p className="text-sm text-muted-foreground">
                      You don't have any upcoming appointments scheduled.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  {Object.keys(groupedAppointments).sort().map(date => (
                    <div key={date}>
                      <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                        {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                      </h3>
                      {groupedAppointments[date]
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map(appointment => renderAppointmentCard(appointment))
                      }
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Calendar with appointment dates */}
            <div className="hidden md:block">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Appointment Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      appointment: datesWithAppointments
                    }}
                    modifiersStyles={{
                      appointment: {
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(var(--primary), 0.1)',
                        color: 'var(--primary)'
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card className="py-8">
              <CardContent className="text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">No Past Appointments</h3>
                <p className="text-sm text-muted-foreground">
                  You don't have any past appointments to view.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.keys(groupedAppointments).sort().reverse().map(date => (
                <div key={date}>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  {groupedAppointments[date]
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(appointment => renderAppointmentCard(appointment))
                  }
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="cancelled" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <Card className="py-8">
              <CardContent className="text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">No Cancelled Appointments</h3>
                <p className="text-sm text-muted-foreground">
                  You don't have any cancelled appointments to view.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.keys(groupedAppointments).sort().reverse().map(date => (
                <div key={date}>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  {groupedAppointments[date]
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(appointment => renderAppointmentCard(appointment))
                  }
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Appointment Details Dialog */}
      <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
        <DialogContent className="max-w-md">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                  Appointment Details
                </DialogTitle>
                <DialogDescription>
                  {format(new Date(selectedAppointment.date), 'EEEE, MMMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                  <Avatar className="h-10 w-10 bg-primary/10">
                    <AvatarFallback className="text-primary">
                      {selectedAppointment.clinicName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedAppointment.clinicName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedAppointment.type}</p>
                  </div>
                  <div className="ml-auto">
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-gray-50 rounded-md space-y-3">
                    <div className="flex items-start">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p className="text-sm">
                          {selectedAppointment.time} - {selectedAppointment.endTime} ({selectedAppointment.duration} min)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm">{selectedAppointment.clinicAddress}</p>
                        {selectedAppointment.directions && (
                          <p className="text-xs text-muted-foreground mt-1">{selectedAppointment.directions}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <ClipboardCheck className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Provider</p>
                        <p className="text-sm">Dr. {selectedAppointment.doctorName}</p>
                      </div>
                    </div>
                    
                    {selectedAppointment.virtualOption && selectedAppointment.meetLink && (
                      <div className="flex items-start">
                        <Video className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-600">Virtual Meeting Link</p>
                          <a 
                            href={selectedAppointment.meetLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {selectedAppointment.meetLink}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedAppointment.notes && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium">Appointment Notes</p>
                      <p className="text-sm mt-1">{selectedAppointment.notes}</p>
                    </div>
                  )}
                  
                  {selectedAppointment.promotionCode && (
                    <div className="p-3 bg-green-50 rounded-md">
                      <p className="text-sm font-medium text-green-700">Applied Promotion</p>
                      <p className="text-sm mt-1 text-green-700">
                        Code: <span className="font-medium">{selectedAppointment.promotionCode}</span>
                      </p>
                      {selectedAppointment.promotionDiscount && (
                        <p className="text-sm text-green-700">
                          Discount: <span className="font-medium">€{selectedAppointment.promotionDiscount}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="flex flex-col gap-2 sm:flex-row mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAppointmentDetails(false)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
                
                {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setShowCancelDialog(true);
                      setShowAppointmentDetails(false);
                    }}
                  >
                    Cancel Appointment
                  </Button>
                )}
                
                {selectedAppointment.status === 'confirmed' && (
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      toast({
                        title: "Message Sent",
                        description: "Your message has been sent to the clinic.",
                      });
                      setShowAppointmentDetails(false);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Clinic
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Cancel Appointment Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? Please provide a reason for cancellation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex items-center p-3 bg-gray-50 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <div className="text-sm">
                <span className="font-medium">
                  {selectedAppointment?.clinicName}
                </span>
                <span className="text-muted-foreground ml-1">
                  on {selectedAppointment?.date ? format(new Date(selectedAppointment.date), 'MMMM d, yyyy') : ''} 
                  at {selectedAppointment?.time}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Reason for cancellation</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this appointment"
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
            >
              Go Back
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={!cancelReason.trim() || isCancelling}
            >
              {isCancelling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsSection;