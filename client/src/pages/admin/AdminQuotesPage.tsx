import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuotes } from "@/hooks/use-quotes";
import QuoteListTable from "@/components/quotes/quote-list-table";
import QuoteDetail from "@/components/quotes/quote-detail";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function AdminQuotesPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const quoteId = params?.id ? parseInt(params.id) : undefined;
  
  const {
    allQuotesQuery,
    getQuoteQuery
  } = useQuotes();
  
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "assigned" | "in_progress" | "completed">("all");

  // Load quotes when component mounts
  useEffect(() => {
    allQuotesQuery.refetch();
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
          onClick={() => setLocation("/admin/quotes")}
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
          portalType="admin"
          onBack={() => setLocation("/admin/quotes")}
        />
      </div>
    );
  }

  // Filter quotes by status based on active tab
  const filteredQuotes = allQuotesQuery.data?.filter(quote => {
    if (activeTab === "pending") {
      return ["pending"].includes(quote.status);
    } else if (activeTab === "assigned") {
      return ["assigned"].includes(quote.status);
    } else if (activeTab === "in_progress") {
      return ["in_progress", "sent"].includes(quote.status);
    } else if (activeTab === "completed") {
      return ["accepted", "rejected", "completed", "cancelled", "expired"].includes(quote.status);
    }
    return true;
  }) || [];

  // Calculate statistics
  const stats = {
    total: allQuotesQuery.data?.length || 0,
    pending: allQuotesQuery.data?.filter(q => q.status === "pending").length || 0,
    assigned: allQuotesQuery.data?.filter(q => q.status === "assigned").length || 0,
    inProgress: allQuotesQuery.data?.filter(q => ["in_progress", "sent"].includes(q.status)).length || 0,
    completed: allQuotesQuery.data?.filter(q => ["accepted", "completed"].includes(q.status)).length || 0
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="Quotes Administration"
        description="Manage patient quote requests and clinic assignments"
        actions={
          <div className="flex gap-2">
            <Button 
              onClick={() => setLocation("/admin/new-quote")}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" /> Create New Quote
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Export Quotes
            </Button>
          </div>
        }
      />

      {/* Quote Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Total Quotes</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Assigned</p>
            <p className="text-2xl font-bold">{stats.assigned}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
        className="mt-6"
      >
        <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {allQuotesQuery.isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <QuoteListTable
              quotes={filteredQuotes}
              portalType="admin"
              isLoading={allQuotesQuery.isLoading}
            />
          )}
        </TabsContent>
      </Tabs>

      {(!allQuotesQuery.data || allQuotesQuery.data.length === 0) && !allQuotesQuery.isLoading && (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center text-center p-12">
            <FileText className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Quote Requests Yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              There are no quote requests in the system yet. Quote requests will appear here when patients submit them through the platform.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}