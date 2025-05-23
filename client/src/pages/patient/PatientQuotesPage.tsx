import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuotes } from "@/hooks/use-quotes";
import QuoteListTable from "@/components/quotes/quote-list-table";
import QuoteDetail from "@/components/quotes/quote-detail";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function PatientQuotesPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const quoteId = params?.id ? parseInt(params.id) : undefined;
  
  const {
    userQuotesQuery,
    getQuoteQuery
  } = useQuotes();
  
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">("all");

  // Load quotes when component mounts
  useEffect(() => {
    userQuotesQuery.refetch();
  }, []);

  // Load specific quote if ID is provided
  const quoteQuery = quoteId ? getQuoteQuery(quoteId) : null;

  // Handle loading states
  if (quoteId && quoteQuery?.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle error states
  if (quoteId && quoteQuery?.error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">Error loading quote: {quoteQuery?.error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => setLocation("/patient/quotes")}
        >
          Back to Quotes
        </Button>
      </div>
    );
  }

  // If showing a specific quote
  if (quoteId && quoteQuery?.data) {
    return (
      <div className="container mx-auto py-6 px-4">
        <QuoteDetail
          quoteRequest={quoteQuery.data.quoteRequest}
          versions={quoteQuery.data.versions}
          portalType="patient"
          onBack={() => setLocation("/patient/quotes")}
        />
      </div>
    );
  }

  // Filter quotes by status based on active tab
  const filteredQuotes = userQuotesQuery.data?.filter(quote => {
    if (activeTab === "pending") {
      return ["pending", "assigned", "in_progress", "sent"].includes(quote.status);
    } else if (activeTab === "completed") {
      return ["accepted", "rejected", "completed", "cancelled", "expired"].includes(quote.status);
    }
    return true;
  }) || [];

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="My Quotes"
        description="View and manage your quote requests"
        actions={
          <Button asChild>
            <a href="/quote-request" className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Quote Request
            </a>
          </Button>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | "pending" | "completed")}
        className="mt-6"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All Quotes</TabsTrigger>
          <TabsTrigger value="pending">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {userQuotesQuery.isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <QuoteListTable
              quotes={filteredQuotes}
              portalType="patient"
              isLoading={userQuotesQuery.isLoading}
            />
          )}
        </TabsContent>
      </Tabs>

      {(!userQuotesQuery.data || userQuotesQuery.data.length === 0) && !userQuotesQuery.isLoading && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Get Your Dental Treatment Quote</CardTitle>
            <CardDescription>
              Request a personalized quote from our partner clinics for your dental treatment
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center space-y-4 py-6">
            <FileText className="h-16 w-16 text-primary" />
            <div className="max-w-md">
              <h3 className="text-xl font-semibold mb-2">Start Your Dental Journey Today</h3>
              <p className="text-muted-foreground mb-6">
                Get detailed quotes from top dental clinics in Turkey. Compare prices, read reviews, and make informed decisions about your dental treatment.
              </p>
              <Button size="lg" asChild>
                <a href="/quote-request" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Request a Quote
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}