import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import AdminQuotesPage from '@/pages/admin/AdminQuotesPage';

export const AdminQuotesSection = () => {
  // Translation placeholder function
  const t = (key: string) => {
    const translations: { [key: string]: string } = {
      'quotes.title': 'Quote Management',
      'quotes.description': 'Manage and review patient quotes',
      'quotes.search': 'Search quotes...',
      'quotes.filter': 'Filter by status',
      'quotes.export': 'Export Data',
      'quotes.view': 'View',
      'quotes.edit': 'Edit',
      'quotes.approve': 'Approve',
      'quotes.reject': 'Reject',
      'common.loading': 'Loading...',
      'common.error': 'Error loading data'
    };
    return translations[key] || key;
  };
  const [, setLocation] = useLocation();

  return <AdminQuotesPage />;
};

export default AdminQuotesSection;