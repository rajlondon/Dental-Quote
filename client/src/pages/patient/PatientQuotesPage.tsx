import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { QuoteIntegrationWidget } from '@/components/quotes/QuoteIntegrationWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function PatientQuotesPage() {
  const [, navigate] = useLocation();
  const { patientId = '123456' } = useParams(); // Fallback for demo purposes
  
  const handleQuoteAction = (action: string, quoteId: string) => {
    // Handle custom actions here
    toast({
      title: 'Quote Action',
      description: `Action ${action} requested for quote ${quoteId}`,
    });
    
    // Handle navigation or other actions based on the action type
    if (action === 'view-details') {
      navigate(`/patient/${patientId}/quote/${quoteId}`);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Dental Quotes</h1>
      
      <QuoteIntegrationWidget
        portalType="patient"
        patientId={patientId}
        onQuoteAction={handleQuoteAction}
      />
    </div>
  );
}

// Detail page for a specific quote
export function PatientQuoteDetailPage() {
  const { patientId = '123456', quoteId } = useParams();
  const [, navigate] = useLocation();
  
  const handleBackToList = () => {
    navigate(`/patient/${patientId}/quotes`);
  };
  
  const handleQuoteAction = (action: string, quoteId: string) => {
    toast({
      title: 'Quote Action',
      description: `Action ${action} performed on quote ${quoteId}`,
    });
  };
  
  if (!quoteId) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Quote ID is required.</p>
            <div className="flex justify-center mt-4">
              <Button onClick={handleBackToList}>Back to Quotes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quote Details</h1>
        <Button variant="outline" onClick={handleBackToList}>
          Back to Quotes
        </Button>
      </div>
      
      <QuoteIntegrationWidget
        portalType="patient"
        patientId={patientId}
        onQuoteAction={handleQuoteAction}
      />
    </div>
  );
}