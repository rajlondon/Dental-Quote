import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, Download, Calendar } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/hooks/use-auth";
import { useQuoteSystem } from "@/hooks/use-quote-system";
import { QuoteIntegrationWidget } from "@/components/quotes/QuoteIntegrationWidget";

export default function PatientQuotesPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const quoteId = params?.id;
  
  // Get the patient's ID from auth
  const { user } = useAuth();
  const patientId = user?.id.toString();
  
  // Use the quote system hook for the patient portal
  const quoteSystem = useQuoteSystem('patient', patientId);
  
  // Local state
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");

  // Load quotes when component mounts
  useEffect(() => {
    if (quoteId) {
      quoteSystem.setSelectedQuoteId(quoteId);
    }
  }, [quoteId]);

  // Handle quote actions
  const handleQuoteAction = (action: string, quoteId: string) => {
    switch (action) {
      case 'view':
        setLocation(`/patient/quotes/${quoteId}`);
        break;
      case 'request-appointment':
        quoteSystem.requestAppointmentMutation.mutate({ quoteId });
        break;
      default:
        break;
    }
  };

  // If showing a specific quote
  if (quoteId) {
    return (
      <div className="container mx-auto py-6 px-4">
        <QuoteIntegrationWidget
          portalType="patient"
          quoteId={quoteId}
          userId={patientId}
          onQuoteAction={handleQuoteAction}
        />
      </div>
    );
  }

  // Filter quotes by status based on active tab
  const filteredQuotes = quoteSystem.quotes?.filter(quote => {
    if (activeTab === "active") {
      return ["pending", "assigned", "in_progress"].includes(quote.status);
    } else if (activeTab === "completed") {
      return ["completed", "accepted"].includes(quote.status);
    }
    return true;
  }) || [];

  // Calculate statistics
  const stats = {
    total: quoteSystem.quotes?.length || 0,
    active: quoteSystem.quotes?.filter(q => ["pending", "assigned", "in_progress"].includes(q.status)).length || 0,
    completed: quoteSystem.quotes?.filter(q => ["completed", "accepted"].includes(q.status)).length || 0
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="My Quotes"
        description="Track and manage your treatment quotes"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => quoteSystem.refetchQuotes()}
            >
              <RefreshCw className={`h-4 w-4 ${quoteSystem.isRefetching ? 'animate-spin' : ''}`} /> 
              Refresh
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => setLocation('/patient/request-quote')}
            >
              <Calendar className="h-4 w-4" />
              New Quote Request
            </Button>
          </div>
        }
      />

      {/* Quote Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Total Quotes</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Active Quotes</p>
            <p className="text-2xl font-bold">{stats.active}</p>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Quotes</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <QuoteIntegrationWidget
            portalType="patient"
            userId={patientId}
            onQuoteAction={handleQuoteAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}