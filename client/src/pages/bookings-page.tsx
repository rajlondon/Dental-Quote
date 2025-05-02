import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import BookingsSection from '@/components/portal/BookingsSection';
import { useTranslation } from 'react-i18next';

export default function BookingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  useEffect(() => {
    // Set page title
    document.title = `${t('bookings.my_bookings')} | MyDentalFly`;
  }, [t]);

  return (
    <div className="container max-w-6xl py-8">
      <BookingsSection />
    </div>
  );
}