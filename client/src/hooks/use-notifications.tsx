import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket, WebSocketMessage } from './use-websocket';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { apiRequest } from '@/lib/queryClient';

// Define notification type
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  action?: string;
  entityType?: string;
  entityId?: number;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: number) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { connected, registerMessageHandler, unregisterMessageHandler } = useWebSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Query for fetching notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      if (!user) return [];
      
      const response = await apiRequest('GET', '/api/notifications');
      const data = await response.json();
      
      if (data.success) {
        return data.notifications;
      }
      
      throw new Error(data.message || 'Failed to fetch notifications');
    },
    enabled: !!user, // Only fetch if user is logged in
  });
  
  // Query for fetching unread count
  const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread/count'],
    queryFn: async () => {
      if (!user) return { count: 0 };
      
      const response = await apiRequest('GET', '/api/notifications/unread/count');
      const data = await response.json();
      
      if (data.success) {
        return { count: data.count };
      }
      
      throw new Error(data.message || 'Failed to fetch unread count');
    },
    enabled: !!user, // Only fetch if user is logged in
  });
  
  // Update unread count when data changes
  useEffect(() => {
    if (unreadCountData) {
      setUnreadCount(unreadCountData.count);
    }
  }, [unreadCountData]);
  
  // Handle real-time notifications via WebSocket
  useEffect(() => {
    if (!connected || !user) return;
    
    const handleNewNotification = (message: WebSocketMessage) => {
      // Add the new notification to the cache
      if (message.payload) {
        const newNotification = message.payload as Notification;
        
        // Update the notifications list
        queryClient.setQueryData<Notification[]>(
          ['/api/notifications'],
          (old = []) => [newNotification, ...old]
        );
        
        // Update the unread count
        setUnreadCount((prev) => prev + 1);
        
        // Show a toast notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
          variant: newNotification.type === 'error' ? 'destructive' : 'default'
        });
      }
    };
    
    // Register WebSocket handler for notifications
    registerMessageHandler('notification', handleNewNotification);
    
    // Cleanup
    return () => {
      unregisterMessageHandler('notification');
    };
  }, [connected, user, queryClient, registerMessageHandler, unregisterMessageHandler, toast]);
  
  // Mutation for marking a notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest('PUT', `/api/notifications/${notificationId}/read`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to mark notification as read');
      }
      
      return notificationId;
    },
    onSuccess: (notificationId) => {
      // Update the notifications cache
      queryClient.setQueryData<Notification[]>(
        ['/api/notifications'],
        (old = []) => old.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Decrement the unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to mark notification as read: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Mutation for marking all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('PUT', '/api/notifications/read/all');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to mark all notifications as read');
      }
    },
    onSuccess: () => {
      // Update all notifications in the cache to be read
      queryClient.setQueryData<Notification[]>(
        ['/api/notifications'],
        (old = []) => old.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Reset the unread count
      setUnreadCount(0);
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to mark all notifications as read: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Mutation for deleting a notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await apiRequest('DELETE', `/api/notifications/${notificationId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete notification');
      }
      
      return notificationId;
    },
    onSuccess: (notificationId) => {
      // Remove the notification from the cache
      queryClient.setQueryData<Notification[]>(
        ['/api/notifications'],
        (old = []) => old.filter(notification => notification.id !== notificationId)
      );
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      
      toast({
        title: 'Success',
        description: 'Notification deleted'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete notification: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
  
  // Refetch data when WebSocket connection changes
  useEffect(() => {
    if (connected && user) {
      refetch();
      refetchUnreadCount();
    }
  }, [connected, user, refetch, refetchUnreadCount]);
  
  // Helper functions
  const markAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };
  
  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };
  
  const deleteNotification = (notificationId: number) => {
    deleteNotificationMutation.mutate(notificationId);
  };
  
  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
  
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  
  return context;
}