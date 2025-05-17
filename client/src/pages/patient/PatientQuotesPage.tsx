import React from 'react';
import { PageHeader } from '@/components/page-header';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { QuoteIntegrationWidget } from '@/components/quotes/QuoteIntegrationWidget';
import { FileText, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function PatientQuotesPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const patientId = user?.id?.toString();

  const handleQuoteAction = (action: string, quoteId: string) => {
    if (action === 'view') {
      setLocation(`/patient/quotes/${quoteId}`);
    } else if (action === 'create') {
      setLocation('/treatment-selector');
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="My Quotes"
        description="View and manage your dental treatment quotes"
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => setLocation('/treatment-selector')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" /> New Quote
            </Button>
          </div>
        }
      />

      <div className="mt-6">
        {patientId ? (
          <QuoteIntegrationWidget
            portalType="patient"
            patientId={patientId}
            onQuoteAction={handleQuoteAction}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Please log in to view your quotes</p>
            <Button 
              onClick={() => setLocation('/auth')} 
              className="mt-4"
            >
              Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}