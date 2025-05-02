import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import ClinicQuotesPage from '@/pages/clinic/ClinicQuotesPage';

const ClinicQuotesSection: React.FC = () => {
  const [, setLocation] = useLocation();
  
  return <ClinicQuotesPage />;
};

export default ClinicQuotesSection;