import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { QuoteRequest, QuoteVersion, QuoteStatus } from "@/types/quote";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket, WebSocketMessage } from "./use-websocket";
import { useEffect } from "react";
import { useNotifications } from "./use-notifications";

export function useQuotes() {
  const { toast } = useToast();
  const { sendMessage, registerMessageHandler, unregisterMessageHandler } = useWebSocket();
  const { createNotification } = useNotifications();

  // Query for user's quotes (for patient portal)
  const userQuotesQuery = useQuery<QuoteRequest[]>({
    queryKey: ["/api/quotes/user"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/quotes/user");
      const data = await response.json();
      return data.data;
    },
    enabled: false // Manually enable when needed
  });

  // Query for all quotes (for admin portal)
  const allQuotesQuery = useQuery<QuoteRequest[]>({
    queryKey: ["/api/quotes/admin/all"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/quotes/admin/all");
      const data = await response.json();
      return data.data;
    },
    enabled: false // Manually enable when needed
  });

  // Query for clinic quotes (for clinic portal)
  const clinicQuotesQuery = useQuery<QuoteRequest[]>({
    queryKey: ["/api/quotes/clinic"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/quotes/clinic");
      const data = await response.json();
      return data.data;
    },
    enabled: false // Manually enable when needed
  });

  // Get a specific quote by ID
  const getQuoteQuery = (id: number) => useQuery<{ quoteRequest: QuoteRequest, versions: QuoteVersion[] }>({
    queryKey: ["/api/quotes", id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/quotes/${id}`);
      const data = await response.json();
      return data.data;
    },
    enabled: !!id // Only fetch when ID is provided
  });

  // Update a quote
  const updateQuoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<QuoteRequest> }) => {
      const response = await apiRequest("PATCH", `/api/quotes/${id}`, data);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/quotes", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/admin/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/clinic"] });
      
      toast({
        title: "Quote updated",
        description: "The quote has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating quote",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create a new quote version
  const createQuoteVersionMutation = useMutation({
    mutationFn: async ({
      quoteId,
      quoteData,
      updateQuoteStatus = false
    }: {
      quoteId: number;
      quoteData: any;
      updateQuoteStatus?: boolean;
    }) => {
      const response = await apiRequest("POST", `/api/quotes/${quoteId}/versions`, {
        quoteData,
        updateQuoteStatus
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/quotes", variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/admin/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/clinic"] });
      
      toast({
        title: "Quote version created",
        description: "A new quote version has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating quote version",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Assign a quote to a clinic
  const assignClinicMutation = useMutation({
    mutationFn: async ({ quoteId, clinicId }: { quoteId: number, clinicId: number }) => {
      const response = await apiRequest("POST", `/api/quotes/${quoteId}/assign-clinic`, { clinicId });
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/quotes", variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/admin/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/clinic"] });
      
      toast({
        title: "Quote assigned",
        description: "The quote has been assigned to the clinic successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error assigning quote",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Upload X-rays for a quote
  const uploadXraysMutation = useMutation({
    mutationFn: async ({ quoteId, files }: { quoteId: number, files: File[] }) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("xrays", file);
      });

      const response = await fetch(`/api/quotes/${quoteId}/xrays`, {
        method: "POST",
        credentials: "include",
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload X-rays");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/quotes", variables.quoteId] });
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${variables.quoteId}/xrays`] });
      
      toast({
        title: "X-rays uploaded",
        description: `Successfully uploaded ${data.data.length} X-ray files.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error uploading X-rays",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Setup WebSocket listeners for real-time quote updates
  useEffect(() => {
    // Handler for quote status changes
    const handleQuoteUpdate = (message: WebSocketMessage) => {
      if (message.type === 'quote_update' && message.payload) {
        const { quoteId, status, action } = message.payload;
        
        // Refresh quote data across all portals
        queryClient.invalidateQueries({ queryKey: ["/api/quotes", quoteId] });
        queryClient.invalidateQueries({ queryKey: ["/api/quotes/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quotes/admin/all"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quotes/clinic"] });
        
        // Create a local notification for the update
        createNotification({
          title: "Quote Update",
          message: getStatusUpdateMessage(status, action),
          type: "quote",
          actionUrl: `/quotes/${quoteId}`,
          priority: "medium"
        });
        
        // Show toast notification for important updates
        if (["accepted", "rejected", "completed"].includes(status)) {
          toast({
            title: "Quote Status Updated",
            description: getStatusUpdateMessage(status, action),
            variant: status === "rejected" ? "destructive" : "default"
          });
        }
      }
    };
    
    // Handler for new quote assignments
    const handleQuoteAssignment = (message: WebSocketMessage) => {
      if (message.type === 'quote_assignment' && message.payload) {
        const { quoteId, clinicId, clinicName } = message.payload;
        
        // Refresh relevant data
        queryClient.invalidateQueries({ queryKey: ["/api/quotes/clinic"] });
        
        // Create notification for clinic assignment
        createNotification({
          title: "New Quote Assignment",
          message: `Quote #${quoteId} has been assigned to ${clinicName || 'your clinic'}`,
          type: "quote",
          actionUrl: `/clinic/quotes/${quoteId}`,
          priority: "high"
        });
        
        // Show toast for immediate attention
        toast({
          title: "New Quote Assignment",
          description: `You have a new quote request to review`,
          variant: "default"
        });
      }
    };
    
    // Register WebSocket handlers
    registerMessageHandler('quote_update', handleQuoteUpdate);
    registerMessageHandler('quote_assignment', handleQuoteAssignment);
    
    // Cleanup on unmount
    return () => {
      unregisterMessageHandler('quote_update');
      unregisterMessageHandler('quote_assignment');
    };
  }, [registerMessageHandler, unregisterMessageHandler, toast, createNotification]);
  
  // Helper function to generate human-readable status messages
  const getStatusUpdateMessage = (status: QuoteStatus, action?: string): string => {
    switch (status) {
      case "pending":
        return "Your quote request has been received and is pending review";
      case "assigned":
        return "Your quote request has been assigned to a clinic";
      case "in_progress":
        return "A clinic is currently preparing your quote";
      case "sent":
        return action === "new_version" 
          ? "A new version of your quote is available for review" 
          : "Your quote is ready for review";
      case "accepted":
        return "Your quote has been accepted! Next steps will be provided soon";
      case "rejected":
        return "Your quote was declined. Please contact support for more information";
      case "completed":
        return "Your quote process has been completed successfully";
      case "cancelled":
        return "Your quote request has been cancelled";
      case "expired":
        return "Your quote has expired. Contact us if you're still interested";
      default:
        return "Your quote status has been updated";
    }
  };

  // Function to manually broadcast quote updates (for admin and clinic use)
  const broadcastQuoteUpdate = (quoteId: number, status: QuoteStatus, action?: string) => {
    sendMessage({
      type: 'quote_update',
      payload: {
        quoteId,
        status,
        action
      },
      sender: {
        id: 'system',
        type: 'admin'
      }
    });
  };
  
  return {
    // Queries
    userQuotesQuery,
    allQuotesQuery,
    clinicQuotesQuery,
    getQuoteQuery,
    
    // Mutations
    updateQuoteMutation,
    createQuoteVersionMutation,
    assignClinicMutation,
    uploadXraysMutation,
    
    // WebSocket helpers
    broadcastQuoteUpdate
  };
}