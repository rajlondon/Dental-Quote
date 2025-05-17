import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuoteIntegrationWidget } from '@/components/quotes/QuoteIntegrationWidget';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function PatientQuotesPage() {
  const [, setLocation] = useLocation();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Effect to show the info dialog on first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('patientQuotesVisited');
    if (!hasVisitedBefore) {
      setInfoDialogOpen(true);
      localStorage.setItem('patientQuotesVisited', 'true');
    }
  }, []);

  // Handle quote actions
  const handleQuoteAction = (action: string, quoteId: string) => {
    switch (action) {
      case 'view':
        setSelectedQuoteId(quoteId);
        break;
      case 'back':
        setSelectedQuoteId(null);
        break;
      case 'create':
        setLocation('/treatment-selection');
        break;
      default:
        break;
    }
  };

  return (
    <Container className="py-8">
      <PageHeader
        title="My Dental Quotes"
        description="View and manage your dental treatment quotes"
      />

      <Tabs defaultValue="quotes" className="mt-8">
        <TabsList>
          <TabsTrigger value="quotes">My Quotes</TabsTrigger>
          <TabsTrigger value="saved">Saved Quotes</TabsTrigger>
        </TabsList>
        <TabsContent value="quotes" className="mt-4">
          {selectedQuoteId ? (
            <QuoteIntegrationWidget
              portalType="patient"
              quoteId={selectedQuoteId}
              onQuoteAction={handleQuoteAction}
            />
          ) : (
            <QuoteIntegrationWidget
              portalType="patient"
              onQuoteAction={handleQuoteAction}
            />
          )}
        </TabsContent>
        <TabsContent value="saved" className="mt-4">
          <div className="p-6 bg-muted/20 rounded-md text-center">
            <p className="text-muted-foreground">
              You have no saved quotes yet. When you save quotes, they will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Info Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to Your Quotes</DialogTitle>
            <DialogDescription>
              Here you can view all your dental treatment quotes, track their status, apply promo codes, and request appointments. 
              
              <ul className="mt-2 space-y-1">
                <li>• View detailed breakdowns of treatments and costs</li>
                <li>• Apply promotional codes for discounts</li>
                <li>• Download quotes as PDFs or send them via email</li>
                <li>• Request appointments directly from your quotes</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Container>
  );
}