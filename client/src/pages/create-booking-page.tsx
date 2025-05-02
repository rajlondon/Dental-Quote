import { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import CreateBookingForm from '@/components/forms/CreateBookingForm';

export default function CreateBookingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { clinicId } = useParams();
  const [location, navigate] = useLocation();
  
  useEffect(() => {
    // Set page title
    document.title = `${t('bookings.create_booking')} | MyDentalFly`;
  }, [t]);

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-1 p-0 mr-4"
          onClick={() => navigate('/bookings')}
        >
          <ArrowLeft className="h-4 w-4" />
          {t('bookings.back_to_bookings')}
        </Button>
        <h1 className="text-3xl font-bold">{t('bookings.create_booking')}</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('bookings.booking_details')}</CardTitle>
          <CardDescription>
            {t('bookings.create_booking_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateBookingForm 
            predefinedClinicId={clinicId ? parseInt(clinicId) : undefined} 
          />
        </CardContent>
      </Card>
    </div>
  );
}