import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { I18nProvider, T, TH, TP, TButton, TLabel } from "@/components/ui/i18n-components";
import { withI18n } from "@/components/ui/i18n-wrapper";

/**
 * Example 1: Using the I18nProvider with component context
 */
export function QuotesPageExample() {
  return (
    <I18nProvider namespace="clinic.quotes">
      <div className="space-y-6">
        <div>
          <TH level={1}>Quote Requests</TH>
          <TP>Manage quote requests sent to your clinic.</TP>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Input placeholder={<T>Search quotes...</T>} className="w-64" />
            <Button variant="outline">
              <T>Filter</T>
            </Button>
          </div>
          
          <Button>
            <T>Create Quote</T>
          </Button>
        </div>
        
        {/* Using specific key names when needed */}
        <TP keyName="no_quotes_found">No quotes found. New quote requests will appear here when received.</TP>
      </div>
    </I18nProvider>
  );
}

/**
 * Example 2: Using withI18n HOC for automatic translations
 */
function QuoteDetailsCard({ quote }: { quote: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Details</CardTitle>
        <CardDescription>View and manage this quote request</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <TH level={3}>Patient Information</TH>
            <div className="grid grid-cols-2 gap-2">
              <TLabel>Name:</TLabel>
              <span>{quote.patientName}</span>
              
              <TLabel>Email:</TLabel>
              <span>{quote.patientEmail}</span>
              
              <TLabel>Phone:</TLabel>
              <span>{quote.patientPhone}</span>
            </div>
          </div>
          
          <div>
            <TH level={3}>Requested Treatments</TH>
            {quote.treatments?.length > 0 ? (
              <ul>
                {quote.treatments.map((treatment: string, index: number) => (
                  <li key={index}>{treatment}</li>
                ))}
              </ul>
            ) : (
              <TP>No specific treatments requested</TP>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <T>Cancel</T>
            </Button>
            <TButton variant="primary">Accept Quote</TButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Wrap with automatic translation
export const I18nQuoteDetailsCard = withI18n(QuoteDetailsCard, 'clinic.quotes');

/**
 * Example 3: Simplified usage with the wrapped components
 */
export function SimplifiedExample() {
  const sampleQuote = {
    id: 1,
    patientName: "John Doe",
    patientEmail: "john@example.com",
    patientPhone: "+1234567890",
    treatments: ["Dental Implant", "Teeth Whitening"]
  };

  return (
    <div className="p-6">
      <QuotesPageExample />
      
      <div className="mt-8">
        <I18nQuoteDetailsCard quote={sampleQuote} />
      </div>
    </div>
  );
}