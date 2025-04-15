import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CheckSquare, 
  AlertTriangle,
  CalendarClock,
  ArrowRight,
  Video
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  type: string;
  date: string;
  time: string;
  clinic: string;
  clinicAddress: string;
  doctorName: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  virtualOption?: boolean;
  meetLink?: string;
}

// Mock data for appointments
const mockAppointments: Appointment[] = [
  {
    id: "1",
    type: "Initial Consultation",
    date: "2025-05-10",
    time: "10:00 - 11:00",
    clinic: "Beyaz Ada Dental Clinic",
    clinicAddress: "Maltepe, Istanbul, Turkey",
    doctorName: "Dr. Mehmet Yilmaz",
    status: "confirmed",
    notes: "Please arrive 15 minutes early to complete paperwork. Bring any recent X-rays if available.",
    virtualOption: true,
    meetLink: "https://meet.google.com/abc-defg-hij"
  },
  {
    id: "2",
    type: "Dental Implant Procedure",
    date: "2025-05-12",
    time: "09:00 - 12:00",
    clinic: "Beyaz Ada Dental Clinic",
    clinicAddress: "Maltepe, Istanbul, Turkey",
    doctorName: "Dr. Mehmet Yilmaz",
    status: "pending",
    notes: "Please do not eat or drink for 2 hours before the procedure. Arrange for someone to accompany you."
  },
  {
    id: "3",
    type: "Crown Fitting",
    date: "2025-05-15",
    time: "14:00 - 15:30",
    clinic: "Beyaz Ada Dental Clinic",
    clinicAddress: "Maltepe, Istanbul, Turkey",
    doctorName: "Dr. Ayşe Kaya",
    status: "pending"
  },
  {
    id: "4",
    type: "Final Check-up",
    date: "2025-05-16",
    time: "11:00 - 12:00",
    clinic: "Beyaz Ada Dental Clinic",
    clinicAddress: "Maltepe, Istanbul, Turkey",
    doctorName: "Dr. Mehmet Yilmaz",
    status: "pending"
  }
];

const AppointmentsSection: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [showVirtualDialog, setShowVirtualDialog] = useState(false);
  
  // Function to format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  // Function to get status badge
  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-600">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-600 border-amber-400 bg-amber-50">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-600">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };
  
  // Function to handle appointment confirmation
  const handleConfirmAppointment = (appointmentId: string) => {
    setAppointments(appointments.map(app => 
      app.id === appointmentId 
        ? { ...app, status: 'confirmed' } 
        : app
    ));
    
    setSelectedAppointment(null);
    setShowAppointmentDetails(false);
    
    toast({
      title: "Appointment Confirmed",
      description: "Your appointment has been confirmed successfully.",
    });
  };
  
  // Function to handle appointment cancellation
  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments(appointments.map(app => 
      app.id === appointmentId 
        ? { ...app, status: 'cancelled' } 
        : app
    ));
    
    setSelectedAppointment(null);
    setShowAppointmentDetails(false);
    
    toast({
      title: "Appointment Cancelled",
      description: "Your appointment has been cancelled.",
      variant: "destructive"
    });
  };
  
  // Function to join virtual appointment
  const handleJoinVirtual = (appointment: Appointment) => {
    if (appointment.meetLink) {
      // Open Google Meet in a new tab
      window.open(appointment.meetLink, '_blank');
      
      toast({
        title: "Google Meet",
        description: "Opening your virtual appointment in Google Meet...",
      });
    } else {
      // If no meet link exists, show the virtual dialog
      setShowVirtualDialog(true);
      setSelectedAppointment(appointment);
      
      toast({
        title: "Video Call",
        description: "Setting up your virtual appointment...",
      });
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Appointments</CardTitle>
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New
            </Button>
          </div>
          <CardDescription>
            View and manage your upcoming dental appointments
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow p-0">
          <Tabs defaultValue="upcoming" className="h-full">
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="upcoming" className="flex-grow mt-0">
              <ScrollArea className="h-[calc(65vh-8rem)]">
                <div className="px-6 py-4 space-y-4">
                  {appointments
                    .filter(app => app.status !== 'completed' && app.status !== 'cancelled')
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(appointment => (
                      <Card key={appointment.id} className={`
                        ${appointment.status === 'confirmed' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-amber-400'}
                      `}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="font-semibold text-lg mr-3">{appointment.type}</h3>
                                {getStatusBadge(appointment.status)}
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                  {formatDate(appointment.date)}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                  {appointment.time}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                                  {appointment.clinic}, {appointment.clinicAddress}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <User className="h-4 w-4 mr-2 text-blue-500" />
                                  {appointment.doctorName}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2 ml-4">
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowAppointmentDetails(true);
                                }}
                              >
                                View Details
                              </Button>
                              
                              {appointment.virtualOption && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleJoinVirtual(appointment)}
                                >
                                  <Video className="h-4 w-4 mr-2" />
                                  {appointment.meetLink ? "Join Google Meet" : "Virtual Option"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {appointments.filter(app => app.status !== 'completed' && app.status !== 'cancelled').length === 0 && (
                      <div className="text-center py-16">
                        <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Upcoming Appointments</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                          You don't have any upcoming appointments scheduled. Would you like to schedule one?
                        </p>
                        <Button>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule New Appointment
                        </Button>
                      </div>
                    )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="confirmed" className="flex-grow mt-0">
              <ScrollArea className="h-[calc(65vh-8rem)]">
                <div className="px-6 py-4 space-y-4">
                  {appointments
                    .filter(app => app.status === 'confirmed')
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(appointment => (
                      <Card key={appointment.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="font-semibold text-lg mr-3">{appointment.type}</h3>
                                {getStatusBadge(appointment.status)}
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                  {formatDate(appointment.date)}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                  {appointment.time}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                                  {appointment.clinic}, {appointment.clinicAddress}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowAppointmentDetails(true);
                                }}
                              >
                                View Details
                              </Button>
                              
                              {appointment.virtualOption && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="mt-2"
                                  onClick={() => handleJoinVirtual(appointment)}
                                >
                                  <Video className="h-4 w-4 mr-2" />
                                  {appointment.meetLink ? "Join Google Meet" : "Virtual Option"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {appointments.filter(app => app.status === 'confirmed').length === 0 && (
                      <div className="text-center py-16">
                        <CheckSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Confirmed Appointments</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          You don't have any confirmed appointments. Appointments will appear here once confirmed.
                        </p>
                      </div>
                    )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="past" className="flex-grow mt-0">
              <ScrollArea className="h-[calc(65vh-8rem)]">
                <div className="px-6 py-4 space-y-4">
                  {appointments
                    .filter(app => app.status === 'completed')
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(appointment => (
                      <Card key={appointment.id} className="border-l-4 border-l-blue-500 opacity-80">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="font-semibold text-lg mr-3">{appointment.type}</h3>
                                {getStatusBadge(appointment.status)}
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                  {formatDate(appointment.date)}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                  {appointment.time}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <User className="h-4 w-4 mr-2 text-blue-500" />
                                  {appointment.doctorName}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowAppointmentDetails(true);
                                }}
                              >
                                View Summary
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {appointments.filter(app => app.status === 'completed').length === 0 && (
                      <div className="text-center py-16">
                        <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Past Appointments</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          You don't have any past appointments. Completed appointments will appear here.
                        </p>
                      </div>
                    )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="all" className="flex-grow mt-0">
              <ScrollArea className="h-[calc(65vh-8rem)]">
                <div className="px-6 py-4 space-y-4">
                  {appointments
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(appointment => (
                      <Card 
                        key={appointment.id} 
                        className={`
                          ${appointment.status === 'confirmed' ? 'border-l-4 border-l-green-500' : ''}
                          ${appointment.status === 'pending' ? 'border-l-4 border-l-amber-400' : ''}
                          ${appointment.status === 'completed' ? 'border-l-4 border-l-blue-500 opacity-80' : ''}
                          ${appointment.status === 'cancelled' ? 'border-l-4 border-l-red-500 opacity-70' : ''}
                        `}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="font-semibold text-lg mr-3">{appointment.type}</h3>
                                {getStatusBadge(appointment.status)}
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                  {formatDate(appointment.date)}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                  {appointment.time}
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                                  {appointment.clinic}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <Button 
                                size="sm" 
                                variant={appointment.status === 'completed' ? 'outline' : 'default'}
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowAppointmentDetails(true);
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t bg-gray-50 p-4">
          <div className="w-full flex items-center justify-between">
            <div className="text-sm text-gray-500 flex items-center">
              <CalendarClock className="h-4 w-4 mr-2 text-gray-400" />
              All times are in local Istanbul time (UTC+3)
            </div>
            
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Contact Clinic
            </Button>
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
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  {selectedAppointment.type}
                </DialogTitle>
                <DialogDescription>
                  Appointment details and information
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Status</div>
                    <div>{getStatusBadge(selectedAppointment.status)}</div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Date</div>
                    <div className="text-sm">{formatDate(selectedAppointment.date)}</div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Time</div>
                    <div className="text-sm">{selectedAppointment.time}</div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Clinic</div>
                    <div className="text-sm">{selectedAppointment.clinic}</div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Address</div>
                    <div className="text-sm">{selectedAppointment.clinicAddress}</div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Doctor</div>
                    <div className="text-sm">{selectedAppointment.doctorName}</div>
                  </div>
                </div>
                
                {selectedAppointment.notes && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-blue-600" />
                      Important Notes
                    </h4>
                    <p className="text-sm text-blue-800">{selectedAppointment.notes}</p>
                  </div>
                )}
                
                {selectedAppointment.status === 'pending' && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Appointment Confirmation</h4>
                    <p className="text-sm text-amber-800 mb-3">
                      Please confirm this appointment to secure your time slot. You can reschedule up to 48 hours before the appointment.
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfirmAppointment(selectedAppointment.id)}
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Confirm Appointment
                    </Button>
                  </div>
                )}
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                  <Button
                    variant="outline"
                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Cancel Appointment
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setShowAppointmentDetails(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Virtual Appointment Dialog */}
      <Dialog open={showVirtualDialog} onOpenChange={setShowVirtualDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2 text-blue-500" />
              Google Meet Consultation
            </DialogTitle>
            <DialogDescription>
              Connect with your dental professional online
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="text-sm font-medium mb-2">About to join virtual consultation</h3>
              <p className="text-sm text-blue-800 mb-4">
                {selectedAppointment && (
                  <>Your virtual consultation with {selectedAppointment.doctorName} is about to begin. You'll be redirected to Google Meet.</>
                )}
                Please ensure your camera and microphone are working properly.
              </p>
              
              <div className="bg-white rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Camera</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Ready</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Microphone</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Ready</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Internet Connection</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Good</Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Tips for a Successful Consultation</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start">
                  <ArrowRight className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span>Find a quiet, well-lit space where you won't be disturbed</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span>Have your dental records or concerns ready to discuss</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span>Test your equipment before the call starts</span>
                </li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowVirtualDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowVirtualDialog(false);
                
                // If the selected appointment has a Google Meet link, open it
                if (selectedAppointment?.meetLink) {
                  window.open(selectedAppointment.meetLink, '_blank');
                }
                
                toast({
                  title: "Joining Google Meet",
                  description: "Connecting to your virtual consultation...",
                });
              }}
            >
              <Video className="h-4 w-4 mr-2" />
              Join Google Meet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsSection;