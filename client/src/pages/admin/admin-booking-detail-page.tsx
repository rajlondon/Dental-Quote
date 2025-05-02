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
  ArrowLeft, Plane, CreditCard, User, PencilIcon, TrashIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function AdminBookingDetailPage() {
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
        <Link href="/admin/bookings">
          <Button>{t('bookings.back_to_bookings')}</Button>
        </Link>
      </div>
    );
  }

  const handleUpdateStatus = (status: string) => {
    updateBooking({ 
      bookingId, 
      data: { status } 
    }, {
      onSuccess: () => {
        toast({
          title: t('bookings.update_success_title'),
          description: t('bookings.update_success_message'),
        });
        refetch();
      }
    });
  };

  const handleUpdateStage = (stage: string) => {
    updateBooking({ 
      bookingId, 
      data: { stage } 
    }, {
      onSuccess: () => {
        toast({
          title: t('bookings.update_success_title'),
          description: t('bookings.update_success_message'),
        });
        refetch();
      }
    });
  };

  const handleAssignToAdmin = (adminId: number | null) => {
    updateBooking({
      bookingId,
      data: { assignedAdminId: adminId }
    }, {
      onSuccess: () => {
        toast({
          title: t('bookings.assigned_success_title'),
          description: t('bookings.assigned_success_message'),
        });
        refetch();
      }
    });
  };

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
        <Link href="/admin/bookings">
          <Button variant="ghost" className="flex items-center gap-1 p-0 mr-4">
            <ArrowLeft className="h-4 w-4" />
            {t('bookings.back_to_bookings')}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold flex items-center">
          {t('bookings.booking_details')}
          <Badge className="ml-3">Admin View</Badge>
        </h1>
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
                • Clinic ID: {booking.clinicId} • User ID: {booking.userId}
              </CardDescription>
            </div>
            <Badge className={stageColors[booking.stage] || 'bg-gray-100'}>
              {t(`bookings.stage.${booking.stage}`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="text-sm font-medium mb-2">{t('bookings.update_status')}:</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant={booking.status === 'pending' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('pending')}
                  disabled={isUpdating || booking.status === 'pending'}
                >
                  {t('bookings.status.pending')}
                </Button>
                <Button 
                  size="sm" 
                  variant={booking.status === 'confirmed' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('confirmed')}
                  disabled={isUpdating || booking.status === 'confirmed'}
                >
                  {t('bookings.status.confirmed')}
                </Button>
                <Button 
                  size="sm" 
                  variant={booking.status === 'in_progress' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('in_progress')}
                  disabled={isUpdating || booking.status === 'in_progress'}
                >
                  {t('bookings.status.in_progress')}
                </Button>
                <Button 
                  size="sm" 
                  variant={booking.status === 'completed' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStatus('completed')}
                  disabled={isUpdating || booking.status === 'completed'}
                >
                  {t('bookings.status.completed')}
                </Button>
                <Button 
                  size="sm" 
                  variant={booking.status === 'cancelled' ? 'destructive' : 'outline'}
                  onClick={() => handleUpdateStatus('cancelled')}
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
                  onClick={() => handleUpdateStage('deposit')}
                  disabled={isUpdating || booking.stage === 'deposit'}
                >
                  {t('bookings.stage.deposit')}
                </Button>
                <Button 
                  size="sm" 
                  variant={booking.stage === 'pre_travel' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStage('pre_travel')}
                  disabled={isUpdating || booking.stage === 'pre_travel'}
                >
                  {t('bookings.stage.pre_travel')}
                </Button>
                <Button 
                  size="sm" 
                  variant={booking.stage === 'treatment' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStage('treatment')}
                  disabled={isUpdating || booking.stage === 'treatment'}
                >
                  {t('bookings.stage.treatment')}
                </Button>
                <Button 
                  size="sm" 
                  variant={booking.stage === 'post_treatment' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStage('post_treatment')}
                  disabled={isUpdating || booking.stage === 'post_treatment'}
                >
                  {t('bookings.stage.post_treatment')}
                </Button>
                <Button 
                  size="sm" 
                  variant={booking.stage === 'completed' ? 'default' : 'outline'}
                  onClick={() => handleUpdateStage('completed')}
                  disabled={isUpdating || booking.stage === 'completed'}
                >
                  {t('bookings.stage.completed')}
                </Button>
              </div>
            </div>
          </div>

          {/* Admin Assignment */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">{t('bookings.assign_admin')}:</h4>
            <div className="flex items-center gap-2">
              <Select 
                value={booking.assignedAdminId?.toString() || ''}
                onValueChange={(value) => {
                  if (value === '') {
                    handleAssignToAdmin(null);
                  } else {
                    handleAssignToAdmin(parseInt(value, 10));
                  }
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('bookings.select_admin')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('common.none')}</SelectItem>
                  {/* This would be populated with actual admin data */}
                  <SelectItem value="1">Admin User 1</SelectItem>
                  <SelectItem value="2">Admin User 2</SelectItem>
                  {user?.id && <SelectItem value={user.id.toString()}>Me</SelectItem>}
                </SelectContent>
              </Select>
              {booking.assignedAdminId && (
                <Badge variant="outline">
                  {t('bookings.currently_assigned')}: {booking.assignedAdminId}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">{t('bookings.details')}</TabsTrigger>
          <TabsTrigger value="user">{t('bookings.user')}</TabsTrigger>
          <TabsTrigger value="clinic">{t('bookings.clinic')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('bookings.appointments')}</TabsTrigger>
          <TabsTrigger value="documents">{t('bookings.documents')}</TabsTrigger>
          <TabsTrigger value="payments">{t('bookings.payments')}</TabsTrigger>
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

        <TabsContent value="user" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('bookings.user_info')}</CardTitle>
              <CardDescription>
                {t('bookings.user_id')}: {booking.userId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground my-12">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t('bookings.user_details_loading')}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/admin/users/${booking.userId}`}>
                <Button variant="outline">{t('bookings.view_user_profile')}</Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="clinic" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t('bookings.clinic_info')}</CardTitle>
              <CardDescription>
                {t('bookings.clinic_id')}: {booking.clinicId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground my-12">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t('bookings.clinic_details_loading')}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/admin/clinics/${booking.clinicId}`}>
                <Button variant="outline">{t('bookings.view_clinic_details')}</Button>
              </Link>
            </CardFooter>
          </Card>
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
              <Link href={`/admin/bookings/${booking.id}/appointments/create`}>
                <Button variant="outline">{t('bookings.create_appointment')}</Button>
              </Link>
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
              <div className="flex gap-2">
                <Link href={`/admin/bookings/${booking.id}/documents`}>
                  <Button variant="outline">{t('bookings.view_all_documents')}</Button>
                </Link>
                <Link href={`/admin/bookings/${booking.id}/upload-document`}>
                  <Button>{t('bookings.upload_document')}</Button>
                </Link>
              </div>
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
              <div className="flex gap-2">
                <Button variant="outline"
                  onClick={() => {
                    updateBooking({
                      bookingId,
                      data: { depositPaid: true }
                    }, {
                      onSuccess: () => {
                        toast({
                          title: t('bookings.deposit_marked_as_paid'),
                          description: t('bookings.deposit_marked_as_paid_description')
                        });
                        refetch();
                      }
                    });
                  }}
                  disabled={booking.depositPaid}
                >
                  {t('bookings.mark_deposit_as_paid')}
                </Button>
                <Link href={`/admin/bookings/${booking.id}/payment/create`}>
                  <Button>{t('bookings.record_payment')}</Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Bottom actions */}
      <div className="mt-8 flex justify-between">
        <Link href={`/admin/bookings/${booking.id}/edit`}>
          <Button variant="outline" className="flex items-center gap-2">
            <PencilIcon className="h-4 w-4" />
            {t('bookings.edit_booking')}
          </Button>
        </Link>
        
        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
          <Button 
            variant="destructive" 
            disabled={isCancelling}
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            {isCancelling && <Loader2 className="h-4 w-4 animate-spin" />}
            <TrashIcon className="h-4 w-4" />
            {t('bookings.cancel_booking')}
          </Button>
        )}
      </div>
    </div>
  );
}