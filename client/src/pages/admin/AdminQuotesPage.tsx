import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download, FileText, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useQuoteSystem } from "@/hooks/use-quote-system";
import { QuoteIntegrationWidget } from "@/components/quotes/QuoteIntegrationWidget";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClinicList } from "@/hooks/use-clinics";

export default function AdminQuotesPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const quoteId = params?.id;
  
  // Use the new quote system hook for the admin portal
  const quoteSystem = useQuoteSystem('admin');
  const clinicsQuery = useClinicList();
  
  // Local state for dialogs
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "assigned" | "in_progress" | "completed">("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");

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
        setLocation(`/admin/quotes/${quoteId}`);
        break;
      case 'assign':
        quoteSystem.setSelectedQuoteId(quoteId);
        setAssignDialogOpen(true);
        break;
      case 'create':
        setLocation('/admin/new-quote');
        break;
      default:
        break;
    }
  };

  // Handle assigning quote to clinic
  const handleAssignQuote = () => {
    if (quoteSystem.selectedQuoteId && selectedClinicId) {
      quoteSystem.assignQuoteMutation.mutate({
        quoteId: quoteSystem.selectedQuoteId,
        clinicId: selectedClinicId
      }, {
        onSuccess: () => {
          setAssignDialogOpen(false);
          setSelectedClinicId("");
        }
      });
    }
  };

  // If showing a specific quote
  if (quoteId) {
    return (
      <div className="container mx-auto py-6 px-4">
        <QuoteIntegrationWidget
          portalType="admin"
          quoteId={quoteId}
          onQuoteAction={handleQuoteAction}
        />
      </div>
    );
  }

  // Filter quotes by status based on active tab
  const filteredQuotes = quoteSystem.quotes?.filter(quote => {
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
    total: quoteSystem.quotes?.length || 0,
    pending: quoteSystem.quotes?.filter(q => q.status === "pending").length || 0,
    assigned: quoteSystem.quotes?.filter(q => q.status === "assigned").length || 0,
    inProgress: quoteSystem.quotes?.filter(q => ["in_progress", "sent"].includes(q.status)).length || 0,
    completed: quoteSystem.quotes?.filter(q => ["accepted", "completed"].includes(q.status)).length || 0
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
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => quoteSystem.allQuotesQuery.refetch()}
            >
              <RefreshCw className={`h-4 w-4 ${quoteSystem.allQuotesQuery.isRefetching ? 'animate-spin' : ''}`} /> 
              Refresh
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
          <QuoteIntegrationWidget
            portalType="admin"
            onQuoteAction={handleQuoteAction}
          />
        </TabsContent>
      </Tabs>

      {/* Assign Quote Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Quote to Clinic</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">Select a clinic to assign this quote:</p>
            
            <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a clinic" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {clinicsQuery.isLoading ? (
                    <SelectItem value="loading" disabled>Loading clinics...</SelectItem>
                  ) : clinicsQuery.data?.length ? (
                    clinicsQuery.data.map(clinic => (
                      <SelectItem key={clinic.id} value={clinic.id.toString()}>
                        {clinic.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>No clinics available</SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignQuote}
              disabled={!selectedClinicId || quoteSystem.assignQuoteMutation.isPending}
            >
              {quoteSystem.assignQuoteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Quote'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}