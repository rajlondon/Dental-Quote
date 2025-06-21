import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import AdminBookingsSection from '@/components/admin/AdminBookingsSection';
// Removed react-i18next

export default function AdminBookingsPage() {
  // Translation removed
  const { user } = useAuth();
  
  useEffect(() => {
    // Set page title
    document.title = `${t('bookings.admin_bookings')} | MyDentalFly`;
  }, [t]);

  return (
    <div className="container max-w-6xl py-8">
      <AdminBookingsSection />
    </div>
  );
}