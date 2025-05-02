import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import ClinicBookingsSection from '@/components/clinic/ClinicBookingsSection';
import { useTranslation } from 'react-i18next';

export default function ClinicBookingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  useEffect(() => {
    // Set page title
    document.title = `${t('bookings.clinic_bookings')} | MyDentalFly`;
  }, [t]);

  return (
    <div className="container max-w-6xl py-8">
      <ClinicBookingsSection />
    </div>
  );
}