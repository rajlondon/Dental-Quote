import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
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

  useEffect(() => {
    // Setup WebSocket connection for real-time notifications
    // This would be implemented when the backend is ready
    return () => {
      // Clean up WebSocket connection
    };
  }, []);

  return (
    <NotificationsContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead 
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