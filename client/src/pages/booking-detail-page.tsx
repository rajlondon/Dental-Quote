import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useBookings } from '@/hooks/use-bookings';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Calendar, Info, MapPin, FileText, 
  ArrowLeft, Plane, CreditCard
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

export default function BookingDetailPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { id } = useParams();
  const bookingId = parseInt(id);
  const [activeTab, setActiveTab] = useState('details');
  
  const {
    useBookingDetails,
    updateBooking,
    cancelBooking,
    isUpdating,
    isCancelling
  } = useBookings();
  
  const {
    data: booking,
    isLoading,
    error,
    refetch
  } = useBookingDetails(bookingId);

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

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg mb-4">{t('bookings.not_found')}</p>
        <Link href="/bookings">
          <Button>{t('bookings.back_to_bookings')}</Button>
        </Link>
      </div>
    );
  }

  const handleCancel = async () => {
    if (window.confirm(t('bookings.confirm_cancel'))) {
      cancelBooking(bookingId, {
        onSuccess: () => {
          toast({
            title: t('bookings.cancel_success_title'),
            description: t('bookings.cancel_success_message'),
          });
          refetch();
        }
      });
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center mb-6">
        <Link href="/bookings">
          <Button variant="ghost" className="flex items-center gap-1 p-0 mr-4">
            <ArrowLeft className="h-4 w-4" />
            {t('bookings.back_to_bookings')}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{t('bookings.booking_details')}</h1>
      </div>
      
      <Card className="mb-6">
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
      </Card>
      
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">{t('bookings.details')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('bookings.appointments')}</TabsTrigger>
          <TabsTrigger value="documents">{t('bookings.documents')}</TabsTrigger>
          <TabsTrigger value="payments">{t('bookings.payments')}</TabsTrigger>
          <TabsTrigger value="messages">{t('bookings.messages')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('bookings.travel_details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.arrivalDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t('bookings.arrival_date')}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(booking.arrivalDate), 'PPP')}</p>
                    </div>
                  </div>
                )}
                {booking.departureDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t('bookings.departure_date')}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(booking.departureDate), 'PPP')}</p>
                    </div>
                  </div>
                )}
                {booking.flightNumber && (
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t('bookings.flight_number')}</p>
                      <p className="text-sm text-muted-foreground">{booking.flightNumber}</p>
                    </div>
                  </div>
                )}
                {booking.accommodationType && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t('bookings.accommodation')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`bookings.accommodation.${booking.accommodationType}`)}
                        {booking.accommodationDetails && `: ${booking.accommodationDetails}`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('bookings.payment_details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t('bookings.deposit_status')}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.depositPaid ? t('bookings.deposit_paid') : t('bookings.deposit_not_paid')}
                    </p>
                  </div>
                </div>
                {booking.depositAmount > 0 && (
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t('bookings.deposit_amount')}</p>
                      <p className="text-sm text-muted-foreground">£{booking.depositAmount}</p>
                    </div>
                  </div>
                )}
                {booking.totalPaid > 0 && (
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t('bookings.total_paid')}</p>
                      <p className="text-sm text-muted-foreground">£{booking.totalPaid}</p>
                    </div>
                  </div>
                )}
                {booking.balanceDue && booking.balanceDue > 0 && (
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t('bookings.balance_due')}</p>
                      <p className="text-sm text-muted-foreground">£{booking.balanceDue}</p>
                    </div>
                  </div>
                )}
                
                {/* Conditionally show payment button if deposit is required but not paid */}
                {booking.depositAmount > 0 && !booking.depositPaid && (
                  <div className="mt-4">
                    <Link href={`/bookings/${booking.id}/pay-deposit`}>
                      <Button className="w-full">
                        {t('bookings.pay_deposit')}
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {booking.specialRequests && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t('bookings.special_requests')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{booking.specialRequests}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="appointments" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('bookings.appointments')}</CardTitle>
              <CardDescription>
                {t('bookings.appointments_description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground my-12">
                {t('bookings.no_appointments')}
              </p>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                {t('bookings.appointments_scheduled_by_clinic')}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('bookings.documents')}</CardTitle>
              <CardDescription>
                {t('bookings.documents_description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground my-12">
                {t('bookings.no_documents')}
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/bookings/${booking.id}/upload-document`}>
                <Button>{t('bookings.upload_document')}</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('bookings.payments')}</CardTitle>
              <CardDescription>
                {t('bookings.payments_description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground my-12">
                {t('bookings.no_payments')}
              </p>
            </CardContent>
            <CardFooter>
              {booking.depositAmount > 0 && !booking.depositPaid && (
                <Link href={`/bookings/${booking.id}/pay-deposit`}>
                  <Button>{t('bookings.pay_deposit')}</Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('bookings.messages')}</CardTitle>
              <CardDescription>
                {t('bookings.messages_description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground my-12">
                {t('bookings.no_messages')}
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/bookings/${booking.id}/messages`}>
                <Button>{t('bookings.send_message')}</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Bottom actions */}
      <div className="mt-8 flex justify-end">
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <Button 
            variant="destructive" 
            disabled={isCancelling}
            onClick={handleCancel}
          >
            {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('bookings.cancel_booking')}
          </Button>
        )}
      </div>
    </div>
  );
}