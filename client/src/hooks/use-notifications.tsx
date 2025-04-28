import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useWebSocket, WebSocketMessage } from './use-websocket';
import { useAuth } from './use-auth';
import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'message' | 'appointment' | 'system' | 'update';
  actionUrl?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  createNotification: (notification: {
    title: string;
    message: string;
    type: 'message' | 'appointment' | 'system' | 'update';
    recipientId?: string;
    recipientType?: 'patient' | 'clinic' | 'admin';
    actionUrl?: string;
  }) => Notification;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { 
    connected, 
    registerMessageHandler, 
    unregisterMessageHandler,
    sendMessage
  } = useWebSocket();
  
  // In a real implementation, we would fetch this from the server
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Message',
      message: 'You have a new message from DentSpa Clinic',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      read: false,
      type: 'message',
      actionUrl: '/patient-portal?section=messages'
    },
    {
      id: '2',
      title: 'Appointment Reminder',
      message: 'Your consultation is scheduled for tomorrow at 2:00 PM',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: false,
      type: 'appointment',
      actionUrl: '/patient-portal?section=appointments'
    },
    {
      id: '3',
      title: 'Document Uploaded',
      message: 'Your treatment plan has been updated with new documents',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      read: true,
      type: 'system',
      actionUrl: '/patient-portal?section=documents'
    },
    {
      id: '4',
      title: 'Flight Details Added',
      message: 'Your travel itinerary has been updated with your flight information',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      read: true,
      type: 'update'
    }
  ]);

  // For a real-world implementation, we'd use a query like this:
  /*
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/notifications');
      const data = await response.json();
      return data.notifications || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  */

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // In a real implementation, we would make an API call here
    /*
    apiRequest('POST', `/api/notifications/${id}/read`)
      .catch(error => console.error('Failed to mark notification as read:', error));
    */
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    // In a real implementation, we would make an API call here
    /*
    apiRequest('POST', '/api/notifications/mark-all-read')
      .catch(error => console.error('Failed to mark all notifications as read:', error));
    */
  };

  // Function to add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(), // Generate a unique ID
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  };

  // Register WebSocket handler for notifications
  useEffect(() => {
    if (!connected || !user) return;
    
    // Handler for incoming notification messages
    const handleNotification = (message: WebSocketMessage) => {
      if (message.type === 'notification' && message.payload) {
        const notificationData = message.payload;
        
        // Add the notification to our local state
        addNotification({
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || 'system',
          actionUrl: notificationData.actionUrl
        });
      }
    };
    
    // Register our handler
    registerMessageHandler('notification', handleNotification);
    
    // Cleanup when component unmounts
    return () => {
      unregisterMessageHandler('notification');
    };
  }, [connected, user, registerMessageHandler, unregisterMessageHandler]);
  
  // This is a utility function that can be used to create and broadcast a notification
  // This would normally happen server-side
  const createAndBroadcastNotification = (data: {
    title: string;
    message: string;
    type: 'message' | 'appointment' | 'system' | 'update';
    recipientId?: string;
    recipientType?: 'patient' | 'clinic' | 'admin';
    actionUrl?: string;
  }) => {
    // 1. Create local notification for the sender if needed
    
    // 2. Send WebSocket message to broadcast to others
    if (connected) {
      sendMessage({
        type: 'notification',
        payload: {
          ...data,
          timestamp: new Date().toISOString()
        },
        target: data.recipientId || 'all',
        sender: user ? {
          id: user.id.toString(),
          type: user.role as 'patient' | 'clinic' | 'admin'
        } : undefined
      });
    }
  };

  // Combine the addNotification and broadcast functions
  const createNotification = (data: {
    title: string;
    message: string;
    type: 'message' | 'appointment' | 'system' | 'update';
    recipientId?: string;
    recipientType?: 'patient' | 'clinic' | 'admin';
    actionUrl?: string;
  }) => {
    // Create a local notification
    const notification = addNotification({
      title: data.title,
      message: data.message,
      type: data.type,
      actionUrl: data.actionUrl
    });
    
    // Broadcast to others if needed
    if (connected && (data.recipientId || data.recipientType)) {
      sendMessage({
        type: 'notification',
        payload: {
          ...data,
          timestamp: notification.timestamp
        },
        target: data.recipientId || (data.recipientType ? data.recipientType : 'all'),
        sender: user ? {
          id: user.id.toString(),
          type: user.role as 'patient' | 'clinic' | 'admin'
        } : undefined
      });
    }
    
    return notification;
  };

  return (
    <NotificationsContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      createNotification
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