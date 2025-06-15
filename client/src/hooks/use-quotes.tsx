import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { QuoteRequest, QuoteVersion, QuoteStatus, CreateQuoteRequest } from "@/types/quote";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket, WebSocketMessage } from "./use-websocket";
import { useEffect } from "react";
import { useNotifications, NotificationCategory } from "./use-notifications";

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
      console.log("[DEBUG] Fetching clinic quotes from API");
      try {
        const response = await apiRequest("GET", "/api/quotes/clinic");
        const data = await response.json();
        console.log("[DEBUG] Clinic quotes API response:", data);
        
        if (data.success === false) {
          console.error("[ERROR] Failed to fetch clinic quotes:", data.message);
          throw new Error(data.message || "Failed to fetch clinic quotes");
        }
        
        // Print detailed information about each quote
        if (data.data && Array.isArray(data.data)) {
          console.log(`[DEBUG] Received ${data.data.length} quotes from API`);
          data.data.forEach((quote: any, index: number) => {
            console.log(`[DEBUG] Quote #${index + 1}:`, {
              id: quote.id,
              status: quote.status,
              name: quote.name,
              selectedClinicId: quote.selectedClinicId,
              createdAt: quote.createdAt
            });
          });
        } else {
          console.log("[DEBUG] No quotes data or not in expected format:", data);
        }
        
        return data.data;
      } catch (error) {
        console.error("[ERROR] Error fetching clinic quotes:", error);
        throw error;
      }
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
      console.log(`[DEBUG] Assigning quote #${quoteId} to clinic #${clinicId}`);
      const response = await apiRequest("POST", `/api/quotes/${quoteId}/assign-clinic`, { clinicId });
      const responseData = await response.json();
      console.log(`[DEBUG] Assign clinic response:`, responseData);
      return responseData;
    },
    onSuccess: (data, variables) => {
      console.log(`[DEBUG] Successfully assigned quote #${variables.quoteId} to clinic #${variables.clinicId}`);
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
      console.error(`[ERROR] Failed to assign quote:`, error);
      toast({
        title: "Error assigning quote",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create a new quote (for admin portal)
  const createQuoteMutation = useMutation({
    mutationFn: async (quoteData: CreateQuoteRequest) => {
      const response = await apiRequest("POST", "/api/quotes", quoteData);
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/quotes/admin/all"] });
      
      toast({
        title: "Quote created",
        description: "The quote has been created successfully.",
      });
      
      return data.data; // Return the created quote
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating quote",
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
    const handleQuoteStatusUpdate = (message: WebSocketMessage) => {
      if (message.type === 'quote_status_update' && message.payload) {
        const { quoteId, newStatus, previousStatus, updatedBy, updaterRole } = message.payload;
        
        // Refresh quote data across all portals
        queryClient.invalidateQueries({ queryKey: ["/api/quotes", quoteId] });
        queryClient.invalidateQueries({ queryKey: ["/api/quotes/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quotes/admin/all"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quotes/clinic"] });
        
        // Create a local notification for the update
        createNotification({
          title: "Quote Status Changed",
          message: getStatusUpdateMessage(newStatus),
          type: "quote",
          actionUrl: `/${updaterRole === 'admin' ? 'admin' : (updaterRole === 'clinic' ? 'clinic' : 'patient')}/quotes/${quoteId}`,
          priority: "medium"
        });
        
        // Show toast notification for important updates
        if (["accepted", "rejected", "completed"].includes(newStatus)) {
          toast({
            title: "Quote Status Updated",
            description: getStatusUpdateMessage(newStatus),
            variant: newStatus === "rejected" ? "destructive" : 
                    newStatus === "accepted" ? "success" : "default"
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
        queryClient.invalidateQueries({ queryKey: ["/api/quotes/admin/all"] });
        
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
    
    // Handler for new quote versions
    const handleQuoteVersionCreated = (message: WebSocketMessage) => {
      if (message.type === 'quote_version_created' && message.payload) {
        const { quoteId, versionId, versionNumber, status } = message.payload;
        
        // Refresh quote data
        queryClient.invalidateQueries({ queryKey: ["/api/quotes", quoteId] });
        queryClient.invalidateQueries({ queryKey: ["/api/quotes/user"] });
        
        // Create notification
        createNotification({
          title: "New Quote Version Available",
          message: `A new quote version (#${versionNumber}) is available for your review`,
          type: "quote",
          actionUrl: `/patient/quotes/${quoteId}`,
          priority: "high"
        });
        
        // Show toast
        toast({
          title: "New Quote Available",
          description: `A new quote version has been created for your request`,
          variant: "success"
        });
      }
    };
    
    // Handler for file uploads
    const handleQuoteFilesUploaded = (message: WebSocketMessage) => {
      if (message.type === 'quote_files_uploaded' && message.payload) {
        const { quoteId, fileCount, fileType, uploadedBy } = message.payload;
        
        // Refresh files data
        queryClient.invalidateQueries({ queryKey: ["/api/quotes", quoteId] });
        queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quoteId}/xrays`] });
        
        // Create subtle notification (no toast for this one)
        createNotification({
          title: "Files Uploaded",
          message: `${fileCount} ${fileType} file${fileCount > 1 ? 's' : ''} uploaded for quote #${quoteId}`,
          type: "quote",
          actionUrl: `/admin/quotes/${quoteId}`,
          priority: "low"
        });
      }
    };
    
    // Register WebSocket handlers
    registerMessageHandler('quote_status_update', handleQuoteStatusUpdate);
    registerMessageHandler('quote_assignment', handleQuoteAssignment);
    registerMessageHandler('quote_version_created', handleQuoteVersionCreated);
    registerMessageHandler('quote_files_uploaded', handleQuoteFilesUploaded);
    
    // Cleanup on unmount
    return () => {
      unregisterMessageHandler('quote_status_update');
      unregisterMessageHandler('quote_assignment');
      unregisterMessageHandler('quote_version_created');
      unregisterMessageHandler('quote_files_uploaded');
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
    createQuoteMutation,
    updateQuoteMutation,
    createQuoteVersionMutation,
    assignClinicMutation,
    uploadXraysMutation,
    
    // WebSocket helpers
    broadcastQuoteUpdate
  };
}