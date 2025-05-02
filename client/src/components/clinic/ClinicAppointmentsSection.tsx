import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format, addDays, startOfWeek, addWeeks, subWeeks, parseISO } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Plus, 
  Filter,
  Clock, 
  User, 
  Phone, 
  Mail, 
  Video, 
  MapPin,
  CheckCircle,
  AlertTriangle,
  X,
  MoreVertical,
  Clock3,
  Loader2
} from 'lucide-react';
import { useAppointments, AppointmentData, CreateAppointmentData } from '@/hooks/use-appointments';
import { useAuth } from '@/hooks/use-auth';
import { useBookings } from '@/hooks/use-bookings';
import { useToast } from '@/hooks/use-toast';

// Types for appointments
interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAvatar?: string;
  patientInitials: string;
  date: Date;
  time: string;
  endTime: string;
  duration: string;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  virtualOption: boolean;
  meetLink?: string;
  doctorName: string;
  doctorId: string;
}

const ClinicAppointmentsSection: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(new Date());
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [appointmentTitle, setAppointmentTitle] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('09:00');
  const [appointmentDuration, setAppointmentDuration] = useState<string>('60');
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [appointmentDoctor, setAppointmentDoctor] = useState<string>('');
  const [appointmentNotes, setAppointmentNotes] = useState<string>('');
  const [isVirtualAppointment, setIsVirtualAppointment] = useState<boolean>(false);
  
  // Use the real API data
  const { 
    appointments: realAppointments, 
    isLoading: isLoadingAppointments,
    selectedDate: apiSelectedDate,
    setSelectedDate: setApiSelectedDate,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    isCreating
  } = useAppointments();
  
  // Use bookings data to get patient information
  const bookingsHook = useBookings();
  const bookings = bookingsHook.data;
  const isLoadingBookings = bookingsHook.isLoading;
  
  // Sync the selectedDate in the UI with the API hook
  useEffect(() => {
    setApiSelectedDate(currentDate);
  }, [currentDate, setApiSelectedDate]);
  
  // Convert real appointments to the format expected by the UI
  const convertedAppointments: Appointment[] = (realAppointments || []).map((app: AppointmentData) => {
    // Find the booking for this appointment to get patient info
    const booking = bookings?.find((b: any) => b.id === app.bookingId);
    const patientName = booking?.patientName || 'Unknown Patient';
    const patientEmail = booking?.patientEmail || '';
    const patientPhone = booking?.patientPhone || '';
    
    // Get initials from patient name
    const patientInitials = patientName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
    
    // Parse dates
    const startDate = app.startTime instanceof Date ? app.startTime : new Date(app.startTime);
    const endDate = app.endTime instanceof Date ? app.endTime : new Date(app.endTime);
    
    return {
      id: app.id.toString(),
      patientName,
      patientEmail,
      patientPhone,
      patientInitials,
      date: startDate,
      time: format(startDate, 'HH:mm'),
      endTime: format(endDate, 'HH:mm'),
      duration: `${Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))} min`,
      type: app.type,
      status: app.status as any,
      notes: app.clinicNotes || '',
      virtualOption: false, // API doesn't have virtual option yet
      doctorName: 'Dr. Example', // API doesn't have doctor info yet
      doctorId: 'n/a'
    };
  });
  
  // Use converted appointments if available, otherwise show empty state
  const appointments: Appointment[] = isLoadingAppointments || !realAppointments || realAppointments.length === 0 
    ? [] 
    : convertedAppointments;

  // Sample doctors data
  const doctors = [
    { id: "d1", name: "Dr. Mehmet Yilmaz", specialty: "Implantology" },
    { id: "d2", name: "Dr. Ayşe Demir", specialty: "Cosmetic Dentistry" },
    { id: "d3", name: "Dr. Ali Yildirim", specialty: "Endodontics" }
  ];

  // Sample appointment types
  const appointmentTypes = [
    "Consultation",
    "Dental Implant",
    "Veneer Preparation",
    "Crown Fitting",
    "Root Canal Treatment",
    "Teeth Whitening",
    "Dental Cleaning",
    "Orthodontic Adjustment",
    "Oral Surgery",
    "Follow-up"
  ];

  // Function to move to next/previous day or week
  const navigateDate = (direction: 'prev' | 'next') => {
    if (activeView === 'day') {
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 1) : addDays(prev, -1));
    } else if (activeView === 'week') {
      setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    }
  };

  // Generate day headers for week view
  const getDayHeaders = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => {
      const day = addDays(weekStart, i);
      return { 
        date: day,
        dayName: format(day, 'EEE'),
        dayNumber: format(day, 'd'),
        isToday: format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
      };
    });
  };

  // Filter appointments for the current view
  const getFilteredAppointments = () => {
    if (activeView === 'day') {
      return appointments.filter(app => 
        format(app.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
      );
    } else if (activeView === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      return appointments.filter(app => 
        app.date >= weekStart && app.date <= weekEnd
      );
    }
    return appointments;
  };

  // Get status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handlers for appointment actions
  const handleConfirmAppointment = (id: string) => {
    // In a real app, this would call an API to update the appointment status
    console.log(`Confirming appointment: ${id}`);
    setShowAppointmentDetails(false);
  };

  const handleCancelAppointment = (id: string) => {
    // In a real app, this would call an API to update the appointment status
    console.log(`Cancelling appointment: ${id}`);
    setShowAppointmentDetails(false);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    // In a real app, this would open an edit form with the appointment details
    console.log(`Editing appointment: ${appointment.id}`);
    setShowAppointmentDetails(false);
  };

  const handleAddAppointment = () => {
    if (!user?.clinicId) {
      toast({
        title: "Error creating appointment",
        description: "Clinic information not available. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    if (!appointmentTitle || !appointmentType || !appointmentTime || !appointmentDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate end time based on duration
    const startTime = new Date(appointmentDate);
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + parseInt(appointmentDuration, 10));
    
    // Format dates as ISO strings for API
    const startTimeISO = startTime.toISOString();
    const endTimeISO = endTime.toISOString();
    
    // Create the appointment data
    const appointmentData: CreateAppointmentData = {
      bookingId: selectedBookingId || 0, // If 0, it's a standalone clinic appointment
      clinicId: user.clinicId,
      title: appointmentTitle,
      description: appointmentNotes,
      type: appointmentType,
      startTime: startTimeISO,
      endTime: endTimeISO,
      status: 'scheduled',
      reminderSent: false,
      followUpRequired: false
    };
    
    try {
      // Call the API to create the appointment
      if (selectedBookingId) {
        // If booking ID exists, use the booking appointment endpoint
        createAppointment({
          ...appointmentData,
          bookingId: selectedBookingId
        });
      } else {
        // Otherwise use the clinic appointment endpoint (this will be handled in the hook)
        // Don't include bookingId for standalone appointments
        const { bookingId, ...standaloneAppointmentData } = appointmentData;
        createAppointment(standaloneAppointmentData);
      }
      
      // Reset form fields
      setAppointmentTitle('');
      setAppointmentType('');
      setAppointmentTime('09:00');
      setAppointmentDuration('60');
      setAppointmentNotes('');
      setIsVirtualAppointment(false);
      setSelectedBookingId(null);
      setSelectedPatient('');
      
      // Close the dialog
      setShowAddAppointment(false);
      
      // No need for success toast here as it's already shown in the mutation's onSuccess handler
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error creating appointment",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>{t("clinic.appointments.title", "Appointment Management")}</CardTitle>
              <CardDescription>
                {t("clinic.appointments.description", "Manage patient appointments, schedules, and bookings")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowAddAppointment(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Appointment
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Calendar Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateDate('prev')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {activeView === 'day' 
                      ? format(currentDate, 'MMMM d, yyyy') 
                      : `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), 'MMM d, yyyy')}`
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={currentDate}
                    onSelect={(date) => date && setCurrentDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateDate('next')}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex">
                <Tabs defaultValue="day">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger 
                      value="day" 
                      onClick={() => setActiveView('day')}
                    >
                      Day
                    </TabsTrigger>
                    <TabsTrigger 
                      value="week" 
                      onClick={() => setActiveView('week')}
                    >
                      Week
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-9 w-[180px] sm:w-[220px]" 
                  placeholder="Search patients..." 
                />
              </div>

              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Filter appointments">
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-3">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Filter Options</h4>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Status</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 cursor-pointer">Confirmed</Badge>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 cursor-pointer">Pending</Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 cursor-pointer">Cancelled</Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 cursor-pointer">Completed</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Doctor</p>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All doctors</SelectItem>
                          {doctors.map(doctor => (
                            <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setFilterOpen(false)}
                      >
                        Clear
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => setFilterOpen(false)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Day View */}
          {activeView === 'day' && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-medium">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
              </div>
              <div className="divide-y">
                {getFilteredAppointments().length > 0 ? (
                  getFilteredAppointments()
                    .sort((a, b) => {
                      return a.time.localeCompare(b.time);
                    })
                    .map(appointment => (
                      <div 
                        key={appointment.id}
                        className="p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowAppointmentDetails(true);
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="min-w-[110px] flex flex-col items-center">
                            <div className="text-lg font-medium">{appointment.time}</div>
                            <div className="text-xs text-gray-500">{appointment.duration}</div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Avatar className="h-8 w-8">
                                {appointment.patientAvatar ? (
                                  <img src={appointment.patientAvatar} alt={appointment.patientName} />
                                ) : (
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {appointment.patientInitials}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <h4 className="font-medium">{appointment.patientName}</h4>
                                <div className="text-xs text-gray-500">{appointment.patientPhone}</div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                {appointment.doctorName}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                {appointment.time} - {appointment.endTime}
                              </div>
                              {appointment.virtualOption && (
                                <div className="flex items-center text-sm text-blue-600">
                                  <Video className="h-3.5 w-3.5 mr-1 text-blue-500" />
                                  Virtual
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{appointment.type}</Badge>
                                {getStatusBadge(appointment.status)}
                              </div>
                              <Button variant="ghost" size="icon" onClick={(e) => {
                                e.stopPropagation();
                                // Add options menu logic here
                              }}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-10 text-center">
                    <Clock3 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Appointments</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      There are no appointments scheduled for this day.
                    </p>
                    <Button onClick={() => setShowAddAppointment(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Week View */}
          {activeView === 'week' && (
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-7 divide-x bg-gray-50">
                {getDayHeaders().map((day, i) => (
                  <div 
                    key={i} 
                    className={`px-2 py-3 text-center ${day.isToday ? 'bg-primary/10' : ''}`}
                  >
                    <div className="text-sm font-medium">{day.dayName}</div>
                    <div className={`text-lg ${day.isToday ? 'bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                      {day.dayNumber}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 divide-x min-h-[400px]">
                {getDayHeaders().map((day, i) => {
                  const dayAppointments = appointments.filter(app => 
                    format(app.date, 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd')
                  );
                  
                  return (
                    <div key={i} className={`p-2 ${day.isToday ? 'bg-primary/5' : ''}`}>
                      {dayAppointments.length > 0 ? (
                        <div className="space-y-2">
                          {dayAppointments
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .map(appointment => (
                              <div 
                                key={appointment.id}
                                className={`p-2 rounded-md text-xs cursor-pointer
                                  ${appointment.status === 'confirmed' ? 'bg-green-50 border border-green-100' : ''}
                                  ${appointment.status === 'pending' ? 'bg-yellow-50 border border-yellow-100' : ''}
                                  ${appointment.status === 'cancelled' ? 'bg-red-50 border border-red-100' : ''}
                                  ${appointment.status === 'completed' ? 'bg-blue-50 border border-blue-100' : ''}
                                `}
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowAppointmentDetails(true);
                                }}
                              >
                                <div className="font-medium">{appointment.time}</div>
                                <div className="truncate">{appointment.patientName}</div>
                                <div className="flex items-center mt-1">
                                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                                    {appointment.type.split(' ')[0]}
                                  </Badge>
                                  {appointment.virtualOption && (
                                    <Video className="h-3 w-3 ml-1 text-blue-500" />
                                  )}
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <div 
                          className="h-full min-h-[100px] flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-md"
                          onClick={() => {
                            setAppointmentDate(day.date);
                            setShowAddAppointment(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t bg-gray-50 px-6 py-3">
          <div className="w-full flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              All times are in local Istanbul time (UTC+3)
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mr-2">
                  <span className="sr-only">Confirmed</span>
                </Badge>
                <span className="text-xs text-gray-600">Confirmed</span>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 mr-2">
                  <span className="sr-only">Pending</span>
                </Badge>
                <span className="text-xs text-gray-600">Pending</span>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mr-2">
                  <span className="sr-only">Completed</span>
                </Badge>
                <span className="text-xs text-gray-600">Completed</span>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={showAppointmentDetails} onOpenChange={setShowAppointmentDetails}>
        <DialogContent className="max-w-md">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Appointment Details
                </DialogTitle>
                <DialogDescription>
                  View and manage appointment information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                  <Avatar className="h-10 w-10">
                    {selectedAppointment.patientAvatar ? (
                      <img src={selectedAppointment.patientAvatar} alt={selectedAppointment.patientName} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedAppointment.patientInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{selectedAppointment.patientName}</h4>
                    <div className="text-sm text-gray-500 flex flex-col">
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {selectedAppointment.patientEmail}
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {selectedAppointment.patientPhone}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="font-medium">{format(selectedAppointment.date, 'MMM d, yyyy')}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-medium">{selectedAppointment.time} - {selectedAppointment.endTime}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Appointment Type</div>
                  <div className="font-medium">{selectedAppointment.type}</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Doctor</div>
                  <div className="font-medium">{selectedAppointment.doctorName}</div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedAppointment.status)}
                    {selectedAppointment.virtualOption && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Virtual</Badge>
                    )}
                  </div>
                </div>
                
                {selectedAppointment.notes && (
                  <div className="bg-amber-50 p-3 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-amber-800">Notes</div>
                        <div className="text-sm text-amber-700">{selectedAppointment.notes}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedAppointment.status === 'pending' && (
                  <div className="bg-yellow-50 p-3 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <div className="text-sm font-medium text-yellow-800">Confirmation Required</div>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      This appointment is pending confirmation. You can confirm or reschedule as needed.
                    </p>
                    <Button 
                      className="w-full"
                      onClick={() => handleConfirmAppointment(selectedAppointment.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Appointment
                    </Button>
                  </div>
                )}
              </div>
              
              <DialogFooter className="flex justify-between items-center gap-2">
                {selectedAppointment.status !== 'completed' && selectedAppointment.status !== 'cancelled' && (
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleEditAppointment(selectedAppointment)}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => setShowAppointmentDetails(false)}
                  >
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Appointment Dialog */}
      <Dialog open={showAddAppointment} onOpenChange={setShowAddAppointment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2 text-primary" />
              Schedule New Appointment
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new appointment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="patient" className="text-sm font-medium">Booking/Patient</label>
              <Select value={selectedBookingId?.toString() || '0'} onValueChange={(value) => {
                // Use 0 to indicate "no specific booking"
                if (value === '0') {
                  setSelectedBookingId(0);
                  setSelectedPatient('');
                } else {
                  setSelectedBookingId(Number(value));
                  // Find the booking to get patient name
                  const booking = bookings?.find((b: any) => b.id === Number(value));
                  if (booking) {
                    setSelectedPatient(booking.patientName || '');
                  }
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional - Select a booking" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No specific booking (general appointment)</SelectItem>
                  {bookings && bookings.length > 0 ? (
                    bookings.map((booking: any) => (
                      <SelectItem key={booking.id} value={booking.id.toString()}>
                        {booking.patientName || 'Unnamed'} - ID: {booking.id}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-bookings" disabled>No bookings available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Appointment Title*</label>
              <Input 
                id="title" 
                value={appointmentTitle}
                onChange={(e) => setAppointmentTitle(e.target.value)}
                placeholder="E.g., Initial Consultation, Follow-up"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">Date*</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {appointmentDate ? format(appointmentDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={appointmentDate}
                      onSelect={setAppointmentDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="time" className="text-sm font-medium">Time*</label>
                <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">09:00 AM</SelectItem>
                    <SelectItem value="09:30">09:30 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="10:30">10:30 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="11:30">11:30 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="14:00">02:00 PM</SelectItem>
                    <SelectItem value="14:30">02:30 PM</SelectItem>
                    <SelectItem value="15:00">03:00 PM</SelectItem>
                    <SelectItem value="15:30">03:30 PM</SelectItem>
                    <SelectItem value="16:00">04:00 PM</SelectItem>
                    <SelectItem value="16:30">04:30 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">Duration*</label>
              <Select value={appointmentDuration} onValueChange={setAppointmentDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Appointment Type*</label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type, index) => (
                    <SelectItem key={index} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="doctor" className="text-sm font-medium">Doctor</label>
              <Select value={appointmentDoctor} onValueChange={setAppointmentDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.specialty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
              <Input 
                id="notes" 
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                placeholder="Additional information about the appointment"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="virtual" 
                checked={isVirtualAppointment}
                onCheckedChange={(checked) => {
                  if (typeof checked === 'boolean') {
                    setIsVirtualAppointment(checked);
                  }
                }}
              />
              <label
                htmlFor="virtual"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Virtual appointment
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAppointment(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddAppointment} 
              disabled={isCreating}
              className="relative"
            >
              {isCreating && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isCreating ? 'Creating...' : 'Schedule Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicAppointmentsSection;