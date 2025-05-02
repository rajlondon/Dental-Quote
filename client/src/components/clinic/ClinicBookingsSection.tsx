import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Calendar, MoreHorizontal, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { useBookings, type BookingStatus, type BookingStage } from '@/hooks/use-bookings';
import { format } from 'date-fns';

// Status colors
const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  completed: 'bg-purple-100 text-purple-800 border-purple-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

// Stage colors
const stageColors: Record<BookingStage, string> = {
  deposit: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  pre_travel: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  treatment: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
  post_treatment: 'bg-amber-100 text-amber-800 border-amber-300',
  completed: 'bg-teal-100 text-teal-800 border-teal-300',
};

export default function ClinicBookingsSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { useClinicBookings } = useBookings();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>();
  const [stageFilter, setStageFilter] = useState<BookingStage | undefined>();
  
  // Get clinic's bookings data
  const {
    data: bookings = [],
    isLoading,
    error,
    refetch
  } = useClinicBookings(user?.id as number);
  
  // Filtered bookings
  const filteredBookings = bookings.filter(booking => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !(booking.bookingReference?.toLowerCase() || '').includes(query) &&
        !String(booking.id).includes(query) &&
        !String(booking.userId).includes(query)
      ) {
        return false;
      }
    }
    
    // Status filter
    if (statusFilter && booking.status !== statusFilter) {
      return false;
    }
    
    // Stage filter
    if (stageFilter && booking.stage !== stageFilter) {
      return false;
    }
    
    return true;
  });
  
  // Sort by creation date, newest first
  const sortedBookings = [...filteredBookings].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  useEffect(() => {
    // Refetch bookings when component mounts
    refetch();
  }, [refetch]);
  
  // Handle clearing all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter(undefined);
    setStageFilter(undefined);
  };
  
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

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('bookings.clinic_bookings')}</h1>
          <p className="text-muted-foreground">
            {t('bookings.total_bookings')}: {bookings.length}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/clinic/create-booking">
            <Button>{t('bookings.create_booking_button')}</Button>
          </Link>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>{t('bookings.filter_bookings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('bookings.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {/* Status Filter */}
            <Select 
              value={statusFilter} 
              onValueChange={(value) => setStatusFilter(value as BookingStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('bookings.filter_by_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined as any}>{t('bookings.all_statuses')}</SelectItem>
                <SelectItem value="pending">{t('bookings.status.pending')}</SelectItem>
                <SelectItem value="confirmed">{t('bookings.status.confirmed')}</SelectItem>
                <SelectItem value="in_progress">{t('bookings.status.in_progress')}</SelectItem>
                <SelectItem value="completed">{t('bookings.status.completed')}</SelectItem>
                <SelectItem value="cancelled">{t('bookings.status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Stage Filter */}
            <Select 
              value={stageFilter} 
              onValueChange={(value) => setStageFilter(value as BookingStage)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('bookings.filter_by_stage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined as any}>{t('bookings.all_stages')}</SelectItem>
                <SelectItem value="deposit">{t('bookings.stage.deposit')}</SelectItem>
                <SelectItem value="pre_travel">{t('bookings.stage.pre_travel')}</SelectItem>
                <SelectItem value="treatment">{t('bookings.stage.treatment')}</SelectItem>
                <SelectItem value="post_treatment">{t('bookings.stage.post_treatment')}</SelectItem>
                <SelectItem value="completed">{t('bookings.stage.completed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Clear Filters Button */}
          {(searchQuery || statusFilter || stageFilter) && (
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="mt-4"
            >
              {t('bookings.clear_filters')}
            </Button>
          )}
        </CardContent>
      </Card>
      
      {/* Bookings Table */}
      {sortedBookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {!searchQuery && !statusFilter && !stageFilter
                ? t('bookings.no_bookings')
                : t('bookings.no_bookings_filtered')}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {!searchQuery && !statusFilter && !stageFilter
                ? t('bookings.clinic_no_bookings_description')
                : t('bookings.no_bookings_filtered_description')}
            </p>
            {searchQuery || statusFilter || stageFilter ? (
              <Button variant="outline" onClick={handleClearFilters}>
                {t('bookings.clear_filters')}
              </Button>
            ) : (
              <Link href="/clinic/create-booking">
                <Button>{t('bookings.create_booking_button')}</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('bookings.reference')}</TableHead>
                    <TableHead>{t('bookings.patient')}</TableHead>
                    <TableHead>{t('bookings.date')}</TableHead>
                    <TableHead>{t('bookings.status')}</TableHead>
                    <TableHead>{t('bookings.stage')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.bookingReference || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-muted-foreground" />
                          {/* Would normally display user name, using ID for now */}
                          {t('bookings.patient_id')}: {booking.userId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{format(new Date(booking.createdAt), 'PP')}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(booking.createdAt), 'p')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[booking.status || ''] || statusColors['pending']}>
                          {t(`bookings.status.${booking.status || 'pending'}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={stageColors[booking.stage || ''] || stageColors['deposit']}>
                          {t(`bookings.stage.${booking.stage || 'deposit'}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/clinic/bookings/${booking.id}`}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">{t('common.view')}</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}