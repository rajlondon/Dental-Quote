import { useState, useEffect } from 'react';
import { useBookings } from '@/hooks/use-bookings';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Calendar, Clock, Info, MapPin, FileText, 
  PlusCircle, User, Phone, Mail, Plane
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  completed: 'bg-purple-100 text-purple-800 border-purple-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const stageColors = {
  deposit: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  pre_travel: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  treatment: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
  post_treatment: 'bg-amber-100 text-amber-800 border-amber-300',
  completed: 'bg-teal-100 text-teal-800 border-teal-300',
};

export default function ClinicBookingsSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  
  // We don't pass any parameters here because the hook will use the clinic ID from the user
  const {
    bookings,
    isLoading,
    error,
    refetch,
    updateBooking,
    isUpdating
  } = useBookings();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t('common.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{t('common.error')}: {error.message}</p>
        <Button onClick={() => refetch()}>{t('common.retry')}</Button>
      </div>
    );
  }

  const filteredBookings = activeTab === 'all' 
    ? bookings 
    : bookings?.filter(booking => booking.status === activeTab);

  const handleUpdateStatus = (bookingId: number, status: string) => {
    updateBooking({ 
      bookingId, 
      data: { status } 
    }, {
      onSuccess: () => {
        toast({
          title: t('bookings.update_success_title'),
          description: t('bookings.update_success_message'),
        });
      }
    });
  };

  const handleUpdateStage = (bookingId: number, stage: string) => {
    updateBooking({ 
      bookingId, 
      data: { stage } 
    }, {
      onSuccess: () => {
        toast({
          title: t('bookings.update_success_title'),
          description: t('bookings.update_success_message'),
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('bookings.clinic_bookings')}</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="flex items-center gap-1"
          >
            <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full max-w-md mb-4">
          <TabsTrigger value="all">{t('bookings.all')}</TabsTrigger>
          <TabsTrigger value="pending">{t('bookings.pending')}</TabsTrigger>
          <TabsTrigger value="confirmed">{t('bookings.confirmed')}</TabsTrigger>
          <TabsTrigger value="in_progress">{t('bookings.in_progress')}</TabsTrigger>
          <TabsTrigger value="completed">{t('bookings.completed')}</TabsTrigger>
          <TabsTrigger value="cancelled">{t('bookings.cancelled')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {filteredBookings?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg p-6 bg-muted/20">
              <p className="text-lg mb-2 text-center">{t('bookings.no_bookings_found')}</p>
              <p className="text-sm text-gray-500 text-center mb-4">{t('bookings.no_clinic_bookings')}</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {filteredBookings?.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {booking.bookingReference}
                            <Badge className={statusColors[booking.status] || 'bg-gray-100'}>
                              {t(`bookings.status.${booking.status}`)}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {t('bookings.created')}: {format(new Date(booking.createdAt), 'PPP')}
                          </CardDescription>
                        </div>
                        <Badge className={stageColors[booking.stage] || 'bg-gray-100'}>
                          {t(`bookings.stage.${booking.stage}`)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {booking.arrivalDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{t('bookings.arrival')}: {format(new Date(booking.arrivalDate), 'PP')}</span>
                            </div>
                          )}
                          {booking.departureDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{t('bookings.departure')}: {format(new Date(booking.departureDate), 'PP')}</span>
                            </div>
                          )}
                          {booking.flightNumber && (
                            <div className="flex items-center gap-2">
                              <Plane className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{t('bookings.flight')}: {booking.flightNumber}</span>
                            </div>
                          )}
                          {booking.accommodationType && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{booking.accommodationType}
                                {booking.accommodationDetails && `: ${booking.accommodationDetails}`}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{t('bookings.deposit')}: {booking.depositPaid ? t('common.paid') : t('common.unpaid')}</span>
                          </div>
                          {booking.depositAmount > 0 && (
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{t('bookings.deposit_amount')}: £{booking.depositAmount}</span>
                            </div>
                          )}
                          {booking.balanceDue && booking.balanceDue > 0 && (
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{t('bookings.balance_due')}: £{booking.balanceDue}</span>
                            </div>
                          )}
                          {booking.totalPaid > 0 && (
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{t('bookings.total_paid')}: £{booking.totalPaid}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {booking.specialRequests && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-1">{t('bookings.special_requests')}:</h4>
                          <p className="text-sm text-muted-foreground">{booking.specialRequests}</p>
                        </div>
                      )}

                      {/* Status and Stage Update Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">{t('bookings.update_status')}:</h4>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              size="sm" 
                              variant={booking.status === 'pending' ? 'default' : 'outline'}
                              onClick={() => handleUpdateStatus(booking.id, 'pending')}
                              disabled={isUpdating || booking.status === 'pending'}
                            >
                              {t('bookings.status.pending')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant={booking.status === 'confirmed' ? 'default' : 'outline'}
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              disabled={isUpdating || booking.status === 'confirmed'}
                            >
                              {t('bookings.status.confirmed')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant={booking.status === 'in_progress' ? 'default' : 'outline'}
                              onClick={() => handleUpdateStatus(booking.id, 'in_progress')}
                              disabled={isUpdating || booking.status === 'in_progress'}
                            >
                              {t('bookings.status.in_progress')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant={booking.status === 'completed' ? 'default' : 'outline'}
                              onClick={() => handleUpdateStatus(booking.id, 'completed')}
                              disabled={isUpdating || booking.status === 'completed'}
                            >
                              {t('bookings.status.completed')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant={booking.status === 'cancelled' ? 'destructive' : 'outline'}
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              disabled={isUpdating || booking.status === 'cancelled'}
                            >
                              {t('bookings.status.cancelled')}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">{t('bookings.update_stage')}:</h4>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              size="sm" 
                              variant={booking.stage === 'deposit' ? 'default' : 'outline'}
                              onClick={() => handleUpdateStage(booking.id, 'deposit')}
                              disabled={isUpdating || booking.stage === 'deposit'}
                            >
                              {t('bookings.stage.deposit')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant={booking.stage === 'pre_travel' ? 'default' : 'outline'}
                              onClick={() => handleUpdateStage(booking.id, 'pre_travel')}
                              disabled={isUpdating || booking.stage === 'pre_travel'}
                            >
                              {t('bookings.stage.pre_travel')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant={booking.stage === 'treatment' ? 'default' : 'outline'}
                              onClick={() => handleUpdateStage(booking.id, 'treatment')}
                              disabled={isUpdating || booking.stage === 'treatment'}
                            >
                              {t('bookings.stage.treatment')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant={booking.stage === 'post_treatment' ? 'default' : 'outline'}
                              onClick={() => handleUpdateStage(booking.id, 'post_treatment')}
                              disabled={isUpdating || booking.stage === 'post_treatment'}
                            >
                              {t('bookings.stage.post_treatment')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant={booking.stage === 'completed' ? 'default' : 'outline'}
                              onClick={() => handleUpdateStage(booking.id, 'completed')}
                              disabled={isUpdating || booking.stage === 'completed'}
                            >
                              {t('bookings.stage.completed')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Link href={`/clinic/bookings/${booking.id}`}>
                        <Button variant="outline">{t('bookings.view_details')}</Button>
                      </Link>
                      <Link href={`/clinic/bookings/${booking.id}/appointments`}>
                        <Button>{t('bookings.manage_appointments')}</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}