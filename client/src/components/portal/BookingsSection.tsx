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
import { Loader2, Calendar, Clock, Info, MapPin, FileText, PlusCircle } from 'lucide-react';
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

export default function BookingsSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  
  const {
    bookings,
    isLoading,
    error,
    refetch,
    createBooking,
    cancelBooking,
    isCreating,
    isCancelling
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

  const handleCancel = async (bookingId: number) => {
    if (window.confirm(t('bookings.confirm_cancel'))) {
      cancelBooking(bookingId, {
        onSuccess: () => {
          toast({
            title: t('bookings.cancel_success_title'),
            description: t('bookings.cancel_success_message'),
          });
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('bookings.my_bookings')}</h2>
        <Link href="/create-booking">
          <Button className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            {t('bookings.new_booking')}
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full max-w-md mb-4">
          <TabsTrigger value="all">{t('bookings.all')}</TabsTrigger>
          <TabsTrigger value="pending">{t('bookings.pending')}</TabsTrigger>
          <TabsTrigger value="confirmed">{t('bookings.confirmed')}</TabsTrigger>
          <TabsTrigger value="in_progress">{t('bookings.in_progress')}</TabsTrigger>
          <TabsTrigger value="completed">{t('bookings.completed')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {filteredBookings?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg p-6 bg-muted/20">
              <p className="text-lg mb-2 text-center">{t('bookings.no_bookings_found')}</p>
              <p className="text-sm text-gray-500 text-center mb-4">{t('bookings.create_booking_prompt')}</p>
              <Link href="/create-booking">
                <Button className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" />
                  {t('bookings.create_new')}
                </Button>
              </Link>
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
                          {booking.accommodationType && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{booking.accommodationType}</span>
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
                        </div>
                      </div>
                      
                      {booking.specialRequests && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-1">{t('bookings.special_requests')}:</h4>
                          <p className="text-sm text-muted-foreground">{booking.specialRequests}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Link href={`/bookings/${booking.id}`}>
                        <Button variant="outline">{t('bookings.view_details')}</Button>
                      </Link>
                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <Button 
                          variant="destructive" 
                          disabled={isCancelling}
                          onClick={() => handleCancel(booking.id)}
                        >
                          {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t('bookings.cancel')}
                        </Button>
                      )}
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