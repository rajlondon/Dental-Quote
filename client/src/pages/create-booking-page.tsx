import { useParams, Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CreateBookingForm from '@/components/forms/CreateBookingForm';

export default function CreateBookingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { quoteId, treatmentPlanId, clinicId } = useParams();
  
  // Convert from string params to numbers
  const parsedQuoteId = quoteId ? parseInt(quoteId) : undefined;
  const parsedTreatmentPlanId = treatmentPlanId ? parseInt(treatmentPlanId) : undefined;
  const parsedClinicId = clinicId ? parseInt(clinicId) : undefined;
  
  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center mb-6">
        <Link href="/bookings">
          <Button variant="ghost" className="flex items-center gap-1 p-0 mr-4">
            <ArrowLeft className="h-4 w-4" />
            {t('bookings.back_to_bookings')}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{t('bookings.create_new')}</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('bookings.new_booking')}</CardTitle>
          <CardDescription>
            {t('bookings.create_booking_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateBookingForm 
            userId={user?.id}
            clinicId={parsedClinicId}
            quoteRequestId={parsedQuoteId}
            treatmentPlanId={parsedTreatmentPlanId}
            isAdmin={user?.role === 'admin'}
          />
        </CardContent>
      </Card>
    </div>
  );
}