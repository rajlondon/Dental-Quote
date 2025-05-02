import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import AdminQuotesPage from '@/pages/admin/AdminQuotesPage';

const AdminQuotesSection: React.FC = () => {
  const [, setLocation] = useLocation();
  
  return <AdminQuotesPage />;
};

export default AdminQuotesSection;