import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, FileText, Mail } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useClinicAuth } from "@/hooks/use-clinic-auth";
import { useQuoteSystem } from "@/hooks/use-quote-system";
import { QuoteIntegrationWidget } from "@/components/quotes/QuoteIntegrationWidget";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ClinicQuotesPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const quoteId = params?.id;
  const { toast } = useToast();
  
  // Get the clinic's ID from auth
  const { user: clinicUser } = useClinicAuth();
  const clinicId = clinicUser?.id.toString();
  
  // Use the quote system hook for the clinic portal
  const quoteSystem = useQuoteSystem('clinic', clinicId);
  
  // Local state
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "in_progress" | "completed">("all");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");

  // Load quotes when component mounts and set specific quote if ID provided
  useEffect(() => {
    if (quoteId) {
      quoteSystem.setSelectedQuoteId(quoteId);
    }
  }, [quoteId]);

  // Handle quote actions
  const handleQuoteAction = (action: string, quoteId: string) => {
    switch (action) {
      case 'view':
        setLocation(`/clinic/quotes/${quoteId}`);
        break;
      case 'email':
        quoteSystem.setSelectedQuoteId(quoteId);
        setEmailDialogOpen(true);
        break;
      default:
        break;
    }
  };

  // Handle sending email
  const handleSendEmail = () => {
    if (quoteSystem.selectedQuoteId && emailAddress) {
      quoteSystem.sendEmailMutation.mutate({
        quoteId: quoteSystem.selectedQuoteId,
        email: emailAddress
      }, {
        onSuccess: () => {
          setEmailDialogOpen(false);
          setEmailAddress("");
        }
      });
    }
  };

  // If showing a specific quote
  if (quoteId) {
    return (
      <div className="container mx-auto py-6 px-4">
        <QuoteIntegrationWidget
          portalType="clinic"
          quoteId={quoteId}
          userId={clinicId}
          onQuoteAction={handleQuoteAction}
        />
      </div>
    );
  }

  // Filter quotes by status based on active tab
  const filteredQuotes = quoteSystem.quotes?.filter(quote => {
    if (activeTab === "pending") {
      return ["pending"].includes(quote.status);
    } else if (activeTab === "in_progress") {
      return ["in_progress", "sent"].includes(quote.status);
    } else if (activeTab === "completed") {
      return ["accepted", "completed"].includes(quote.status);
    }
    return true;
  }) || [];

  // Calculate statistics
  const stats = {
    total: quoteSystem.quotes?.length || 0,
    pending: quoteSystem.quotes?.filter(q => q.status === "pending").length || 0,
    inProgress: quoteSystem.quotes?.filter(q => ["in_progress", "sent"].includes(q.status)).length || 0,
    completed: quoteSystem.quotes?.filter(q => ["accepted", "completed"].includes(q.status)).length || 0
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="Quote Management"
        description="View and manage quotes assigned to your clinic"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="default" 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700"
              onClick={() => window.location.href = '/enhanced-quote?clinicId=' + clinicId}
            >
              <FileText className="h-4 w-4" /> 
              Create New Quote
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => quoteSystem.clinicQuotesQuery.refetch()}
            >
              <RefreshCw className={`h-4 w-4 ${quoteSystem.clinicQuotesQuery.isRefetching ? 'animate-spin' : ''}`} /> 
              Refresh
            </Button>
          </div>
        }
      />

      {/* Quote Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
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
        <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <QuoteIntegrationWidget
            portalType="clinic"
            userId={clinicId}
            onQuoteAction={handleQuoteAction}
          />
        </TabsContent>
      </Tabs>

      {/* Email Quote Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Quote via Email</DialogTitle>
            <DialogDescription>
              Enter the recipient's email address to send the quote.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Email address"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              type="email"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail}
              disabled={!emailAddress || quoteSystem.sendEmailMutation.isPending}
            >
              {quoteSystem.sendEmailMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}