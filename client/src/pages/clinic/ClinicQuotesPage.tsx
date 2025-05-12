import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useClinicTreatmentBridge, ClinicQuoteItem } from "@/hooks/use-clinic-treatment-bridge";
import QuoteListTable from "@/components/quotes/quote-list-table";
import { BridgeQuoteAdapter } from '@/components/quotes/bridge-quote-adapter';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, InfoIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { QuoteStatus } from "@/types/quote";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ClinicQuotesPage() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const quoteId = params?.id ? parseInt(params.id) : undefined;
  const { toast } = useToast();
  
  // Use our bridge hook to abstract away the underlying system
  const {
    allItems,
    isLoading,
    error,
    refetch,
    getItemDetails,
    updateItemStatus,
    usingUnifiedSystem
  } = useClinicTreatmentBridge();
  
  // Alert dialog state for system switching
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pendingSystemChange, setPendingSystemChange] = useState<boolean | null>(null);
  
  const [activeTab, setActiveTab] = useState<"all" | "new" | "in_progress" | "completed">("all");

  // Load quotes when component mounts
  useEffect(() => {
    refetch();
  }, []);

  // Get item details if ID is provided
  const itemDetails = quoteId ? getItemDetails(quoteId) : null;

  // Handle loading states
  if (quoteId && itemDetails?.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle error states
  if (quoteId && itemDetails?.error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">Error loading quote: {itemDetails?.error.message}</p>
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

  // Handle system toggle
  const handleSystemToggle = (checked: boolean) => {
    setPendingSystemChange(checked);
    setIsAlertOpen(true);
  };

  // Confirm system change
  const confirmSystemChange = () => {
    if (pendingSystemChange !== null) {
      localStorage.setItem('use_unified_treatment_system', pendingSystemChange ? 'true' : 'false');
      toast({
        title: `System Changed: ${pendingSystemChange ? 'Unified' : 'Legacy'}`,
        description: `The quotes management system has been changed. The page will refresh.`,
        variant: "default",
      });
      
      // Refresh the page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
    setIsAlertOpen(false);
  };

  // If showing a specific quote
  if (quoteId && itemDetails?.data) {
    // Define status update handler for clinic actions
    const handleStatusUpdate = async (newStatus: string) => {
      try {
        await updateItemStatus(quoteId, newStatus);
        
        // Force refresh the quote data
        itemDetails.refetch();
        
        toast({
          title: "Status Updated",
          description: `Quote status has been updated to ${newStatus}`,
          variant: "default",
        });
      } catch (error) {
        console.error("Failed to update quote status:", error);
        toast({
          title: "Failed to Update",
          description: "There was an error updating the quote status",
          variant: "destructive",
        });
      }
    };
    
    // Determine available actions based on current status
    const getAvailableActions = () => {
      const quote = itemDetails.data;
      const actions: {
        label: string; 
        status: string; 
        variant: "default" | "destructive" | "outline" | "secondary" | "primary" | "accent" | "success" | "warning";
      }[] = [];
      
      if (!quote) return actions;
      
      if (quote.status === "assigned" || quote.status === "draft") {
        actions.push({
          label: "Begin Processing",
          status: "in_progress",
          variant: "default"
        });
      } else if (quote.status === "in_progress") {
        actions.push({
          label: "Send Quote to Patient",
          status: "sent",
          variant: "primary"
        });
      }
      
      return actions;
    };
    
    // Get available actions for this quote
    const actions = getAvailableActions();
    
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="mb-4 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setLocation("/clinic/quotes")}
          >
            Back to Quotes
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="text-xs text-muted-foreground">
              Using {usingUnifiedSystem ? 'Unified' : 'Legacy'} System
            </div>
          </div>
        </div>
        
        {/* Use our adapter component which handles the conversion */}
        <BridgeQuoteAdapter
          item={itemDetails.data}
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
  const filteredItems = allItems.filter(item => {
    if (activeTab === "new") {
      return ["assigned", "draft"].includes(item.status);
    } else if (activeTab === "in_progress") {
      return ["in_progress", "sent", "proposed"].includes(item.status);
    } else if (activeTab === "completed") {
      return ["accepted", "rejected", "completed", "cancelled", "expired"].includes(item.status);
    }
    return true;
  }) || [];

  // Map the items to the format expected by QuoteListTable (QuoteRequest type)
  const formattedQuotes = filteredItems.map(item => ({
    // Required QuoteRequest fields
    id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
    name: item.patientName,
    email: item.patientEmail || '',
    treatment: item.treatments && item.treatments.length > 0 ? item.treatments[0].name : 'General Treatment',
    consent: true, // Assume consent for existing items
    status: item.status as QuoteStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    hasXrays: false,
    viewedByAdmin: true,
    viewedByClinic: true,
    
    // Fields added for bridge adapter
    patientName: item.patientName,
    patientEmail: item.patientEmail || '',
    totalGBP: item.totalPrice,
    totalPrice: item.totalPrice,
    currency: item.currency,
    treatments: item.treatments,
    source: item.source || 'standard',
    sourceType: item.sourceType || 'standard'
  }));

  return (
    <div className="container mx-auto py-6 px-4">
      <PageHeader
        title="Quotes Management"
        description="Manage and respond to patient quote requests"
      />
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          {allItems.length} quote(s) found
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="system-toggle"
              checked={usingUnifiedSystem}
              onCheckedChange={handleSystemToggle}
            />
            <Label htmlFor="system-toggle" className="cursor-pointer">
              Use Unified System
            </Label>
            <div className="relative group">
              <InfoIcon 
                className="h-4 w-4 text-muted-foreground cursor-help" 
              />
              <div className="absolute hidden group-hover:block bg-black text-white text-xs p-2 rounded-md w-48 z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-1">
                Toggle between the legacy quote system and the new unified treatment plans system
              </div>
            </div>
          </div>
        </div>
      </div>

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
          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <QuoteListTable
              quotes={formattedQuotes as any}
              portalType="clinic"
              isLoading={isLoading}
            />
          )}
        </TabsContent>
      </Tabs>

      {(filteredItems.length === 0) && !isLoading && (
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
      
      {/* System change confirmation dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Quote Management System?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to switch to the {pendingSystemChange ? 'unified' : 'legacy'} quote management system. 
              This will refresh the page and may affect how quotes are displayed and managed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSystemChange}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}