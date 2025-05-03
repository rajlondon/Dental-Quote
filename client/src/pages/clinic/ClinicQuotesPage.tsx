import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuotes } from "@/hooks/use-quotes";
import QuoteListTable from "@/components/quotes/quote-list-table";
import QuoteDetail from "@/components/quotes/quote-detail";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function ClinicQuotesPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const quoteId = params?.id ? parseInt(params.id) : undefined;
  
  const {
    clinicQuotesQuery,
    getQuoteQuery
  } = useQuotes();
  
  const [activeTab, setActiveTab] = useState<"all" | "new" | "in_progress" | "completed">("all");

  // Load quotes when component mounts
  useEffect(() => {
    clinicQuotesQuery.refetch();
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
          onClick={() => setLocation("/clinic/quotes")}
        >
          Back to Quotes
        </Button>
      </div>
    );
  }

  // If showing a specific quote
  if (quoteId && quoteQuery?.data) {
    // Define status update handler for clinic actions
    const handleStatusUpdate = async (newStatus: string) => {
      try {
        await updateQuoteMutation.mutateAsync({
          id: quoteId,
          data: { status: newStatus }
        });
        
        // Force refresh the quote data
        quoteQuery.refetch();
      } catch (error) {
        console.error("Failed to update quote status:", error);
      }
    };
    
    // Determine available actions based on current status
    const getAvailableActions = () => {
      const quote = quoteQuery.data.quoteRequest;
      const actions = [];
      
      if (quote.status === "assigned") {
        actions.push({
          label: "Begin Processing",
          status: "in_progress",
          variant: "default" as const
        });
      } else if (quote.status === "in_progress") {
        actions.push({
          label: "Send Quote to Patient",
          status: "sent",
          variant: "primary" as const
        });
      }
      
      return actions;
    };
    
    // Get available actions for this quote
    const actions = getAvailableActions();
    
    return (
      <div className="container mx-auto py-6 px-4">
        <QuoteDetail
          quoteRequest={quoteQuery.data.quoteRequest}
          versions={quoteQuery.data.versions}
          portalType="clinic"
          onBack={() => setLocation("/clinic/quotes")}
          actions={actions.map(action => ({
            label: action.label,
            variant: action.variant,
            onClick: () => handleStatusUpdate(action.status)
          }))}
        />
      </div>
    );
  }

  // Filter quotes by status based on active tab
  const filteredQuotes = clinicQuotesQuery.data?.filter(quote => {
    if (activeTab === "new") {
      return ["assigned"].includes(quote.status);
    } else if (activeTab === "in_progress") {
      return ["in_progress", "sent"].includes(quote.status);
    } else if (activeTab === "completed") {
      return ["accepted", "rejected", "completed", "cancelled", "expired"].includes(quote.status);
    }
    return true;
  }) || [];

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="Quotes Management"
        description="Manage and respond to patient quote requests"
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | "new" | "in_progress" | "completed")}
        className="mt-6"
      >
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="all">All Quotes</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {clinicQuotesQuery.isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <QuoteListTable
              quotes={filteredQuotes}
              portalType="clinic"
              isLoading={clinicQuotesQuery.isLoading}
            />
          )}
        </TabsContent>
      </Tabs>

      {(!clinicQuotesQuery.data || clinicQuotesQuery.data.length === 0) && !clinicQuotesQuery.isLoading && (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center text-center p-12">
            <div className="rounded-full p-4 bg-primary/10 mb-4">
              <Loader2 className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Quote Requests Yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Your clinic has not received any quote requests yet. When patients submit requests and they're assigned to your clinic, they will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}