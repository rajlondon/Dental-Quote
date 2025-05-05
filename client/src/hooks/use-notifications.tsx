import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useWebSocket, WebSocketMessage } from './use-websocket';
import { useAuth } from './use-auth';
import { formatISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './use-toast';
import { 
  Notification as ServerNotification, 
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
  NotificationTarget,
  CreateNotification,
  NotificationResponse
} from '@shared/notifications';

// Client-side notification model 
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationCategory | 'message' | 'appointment' | 'system' | 'update';
  actionUrl?: string;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  metadata?: Record<string, any>;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  generateTestNotifications: () => Promise<void>;
  createNotification: (notification: {
    title: string;
    message: string;
    type: 'message' | 'appointment' | 'system' | 'update' | NotificationCategory;
    recipientId?: string;
    recipientType?: 'patient' | 'clinic' | 'admin' | NotificationTarget;
    actionUrl?: string;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
  }) => Promise<Notification>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    connected, 
    registerMessageHandler, 
    unregisterMessageHandler,
    sendMessage
  } = useWebSocket();
  
  // Fetch notifications from server
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useQuery<NotificationResponse>({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/notifications');
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return { notifications: [], unread_count: 0 };
      }
    },
    // Only fetch notifications if user is authenticated
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Convert server notifications to client format
  const notifications: Notification[] = (data?.notifications || []).map((notification: ServerNotification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    timestamp: notification.created_at,
    read: notification.status !== 'unread',
    type: notification.category,
    actionUrl: notification.action_url,
    priority: notification.priority,
    category: notification.category,
    metadata: notification.metadata
  }));

  const unreadCount = data?.unread_count || 0;

  // Mutation to mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('PUT', `/api/notifications/${id}`, {
        status: 'read'
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error: any) => {
      console.error('Failed to mark notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  });

  // Mutation to mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/notifications/mark-all-read', {});
      return response.json();
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error: any) => {
      console.error('Failed to mark all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive'
      });
    }
  });

  // Mutation to delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/notifications/${id}`);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error: any) => {
      console.error('Failed to delete notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive'
      });
    }
  });

  // Mutation to create notification
  const createNotificationMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      message: string;
      type: 'message' | 'appointment' | 'system' | 'update' | NotificationCategory;
      recipientId?: string;
      recipientType?: 'patient' | 'clinic' | 'admin' | NotificationTarget;
      actionUrl?: string;
      priority?: NotificationPriority;
      metadata?: Record<string, any>;
    }) => {
      // Map client notification type to server notification category
      let category: NotificationCategory;
      if (data.type === 'message' || 
          data.type === 'appointment' || 
          data.type === 'system' || 
          data.type === 'document' || 
          data.type === 'payment' || 
          data.type === 'treatment' || 
          data.type === 'offer') {
        category = data.type as NotificationCategory;
      } else {
        // Default to system for unknown types
        category = 'system';
      }

      // Create notification payload
      const notificationData: CreateNotification = {
        title: data.title,
        message: data.message,
        category: category,
        priority: data.priority || 'medium',
        target_type: data.recipientType || 'all',
        target_id: data.recipientId,
        source_type: user?.role === 'admin' ? 'admin' : 
                      (user?.role === 'patient' ? 'patient' : 
                      (user?.role?.includes('clinic') ? 'clinic' : 'system')),
        source_id: user ? String(user.id) : undefined,
        action_url: data.actionUrl,
        metadata: data.metadata
      };

      const response = await apiRequest('POST', '/api/notifications', notificationData);
      return await response.json();
    },
    onSuccess: (data) => {
      // Refresh notifications after creating a new one
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });

      // Also notify websocket if we have a connection and recipient info
      if (connected && data) {
        sendMessage({
          type: 'notification',
          payload: data,
          sender: user ? {
            id: user.id.toString(),
            type: user.role as 'patient' | 'clinic' | 'admin'
          } : undefined
        });
      }
    },
    onError: (error: any) => {
      console.error('Failed to create notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to create notification',
        variant: 'destructive'
      });
    }
  });

  // Register WebSocket handler for real-time notifications
  useEffect(() => {
    if (!connected || !user) return;
    
    // Handler for incoming notification messages
    const handleNotification = (message: WebSocketMessage) => {
      if (message.type === 'notification' && message.payload) {
        // Refresh notifications after receiving a new one
        refetch();
        
        // Show a toast for the new notification
        toast({
          title: message.payload.title || 'New Notification',
          description: message.payload.message || '',
          variant: 'default'
        });
      }
    };
    
    // Register our handler
    registerMessageHandler('notification', handleNotification);
    
    // Cleanup when component unmounts
    return () => {
      unregisterMessageHandler('notification');
    };
  }, [connected, user, registerMessageHandler, unregisterMessageHandler, refetch, toast]);

  // Wrapper functions for the mutations
  const markAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const deleteNotification = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };

  const createNotification = async (data: {
    title: string;
    message: string;
    type: 'message' | 'appointment' | 'system' | 'update' | NotificationCategory;
    recipientId?: string;
    recipientType?: 'patient' | 'clinic' | 'admin' | NotificationTarget;
    actionUrl?: string;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
  }): Promise<Notification> => {
    const result = await createNotificationMutation.mutateAsync(data);
    
    // Convert server notification to client format
    return {
      id: result.id,
      title: result.title,
      message: result.message,
      timestamp: result.created_at,
      read: false,
      type: result.category,
      actionUrl: result.action_url,
      priority: result.priority,
      category: result.category,
      metadata: result.metadata
    };
  };

  // Mutation to generate test notifications
  const generateTestNotificationsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/notifications/generate-test');
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      // Show success toast
      toast({
        title: 'Test Notifications Generated',
        description: data.message || `Successfully generated ${data.count || 'several'} test notifications`,
        variant: 'default'
      });
    },
    onError: (error: any) => {
      console.error('Failed to generate test notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate test notifications',
        variant: 'destructive'
      });
    }
  });

  // Wrapper function for the test notification mutation
  const generateTestNotifications = async () => {
    await generateTestNotificationsMutation.mutateAsync();
  };

  return (
    <NotificationsContext.Provider value={{ 
      notifications, 
      unreadCount, 
      isLoading,
      error: error as Error | null,
      markAsRead, 
      markAllAsRead,
      deleteNotification,
      createNotification,
      generateTestNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  
  return context;
};