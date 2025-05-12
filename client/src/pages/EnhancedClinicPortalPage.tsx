import React from 'react';
import ClinicPortalPage from './ClinicPortalPage';
import ClinicWebSocketProvider from '@/components/ClinicWebSocketProvider';

interface EnhancedClinicPortalPageProps {
  disableAutoRefresh?: boolean;
  initialSection?: string;
}

/**
 * Enhanced Clinic Portal Page with resilient WebSocket connection handling
 * This wraps the standard ClinicPortalPage with our specialized WebSocket provider
 * for improved connection stability and error recovery.
 */
const EnhancedClinicPortalPage: React.FC<EnhancedClinicPortalPageProps> = ({
  disableAutoRefresh = true,
  initialSection = 'dashboard'
}) => {
  return (
    <ClinicWebSocketProvider disableNotifications={false}>
      <ClinicPortalPage 
        disableAutoRefresh={disableAutoRefresh} 
        initialSection={initialSection} 
      />
    </ClinicWebSocketProvider>
  );
};

export default EnhancedClinicPortalPage;