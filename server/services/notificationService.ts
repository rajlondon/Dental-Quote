import { v4 as uuidv4 } from 'uuid';
import { 
  Notification, 
  CreateNotification, 
  UpdateNotification, 
  NotificationResponse 
} from '@shared/notifications';
import { WebSocketService } from './websocketService';
import { EmailNotificationService } from './emailNotificationService';

// In-memory storage for notifications (replace with database in production)
const notifications = new Map<string, Notification[]>();

/**
 * Notification Service - Manages cross-portal notifications
 * Allows real-time notifications between admin, clinic, and patient portals
 */
export class NotificationService {
  private wsService: WebSocketService;
  private emailService: EmailNotificationService;
  
  constructor(wsService: WebSocketService, emailService: EmailNotificationService) {
    this.wsService = wsService;
    this.emailService = emailService;
  }
  
  /**
   * Create a new notification
   */
  public async createNotification(data: CreateNotification): Promise<Notification> {
    const now = new Date().toISOString();
    
    const newNotification: Notification = {
      id: uuidv4(),
      ...data,
      status: 'unread',
      created_at: now,
    };
    
    // Determine which map key to use based on target
    const targetKey = this.getStorageKey(newNotification);
    
    // Get existing notifications or initialize
    const existingNotifications = notifications.get(targetKey) || [];
    existingNotifications.push(newNotification);
    notifications.set(targetKey, existingNotifications);
    
    // Send real-time notification using WebSocket
    this.sendRealTimeNotification(newNotification);
    
    // Send email notification if appropriate
    try {
      await this.emailService.processNotification(newNotification);
    } catch (error) {
      console.error('Failed to send email notification:', error);
      // Don't fail the entire notification process if email fails
    }
    
    return newNotification;
  }
  
  /**
   * Get notifications for a specific user/portal
   */
  public async getNotifications(
    userType: 'patient' | 'clinic' | 'admin',
    userId: string,
    status?: 'unread' | 'all'
  ): Promise<NotificationResponse> {
    const targetKey = `${userType}-${userId}`;
    const allNotifications = notifications.get(targetKey) || [];
    
    // Also check the "all" target for each user type
    const typeWideNotifications = notifications.get(`${userType}-all`) || [];
    
    // Also check system-wide notifications
    const systemWideNotifications = notifications.get('all-all') || [];
    
    // Combine all relevant notifications
    let allRelevantNotifications = [
      ...allNotifications,
      ...typeWideNotifications,
      ...systemWideNotifications
    ];
    
    // Filter by status if requested
    if (status === 'unread') {
      allRelevantNotifications = allRelevantNotifications.filter(
        notification => notification.status === 'unread'
      );
    }
    
    // Sort by creation date (newest first)
    allRelevantNotifications.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Count unread notifications
    const unreadCount = allRelevantNotifications.filter(
      n => n.status === 'unread'
    ).length;
    
    return {
      notifications: allRelevantNotifications,
      unread_count: unreadCount
    };
  }
  
  /**
   * Update notification status (mark as read/archived)
   */
  public async updateNotification(data: UpdateNotification): Promise<Notification | null> {
    // Loop through all notification collections
    const entries = Array.from(notifications.entries());
    for (const [key, notificationsList] of entries) {
      const notificationIndex = notificationsList.findIndex((n: Notification) => n.id === data.id);
      
      if (notificationIndex !== -1) {
        const originalNotification = notificationsList[notificationIndex];
        
        // Track engagement metrics if status is changing from unread to read
        const isMarkingAsRead = data.status === 'read' && originalNotification.status === 'unread';
        
        // Calculate time to read if marking as read
        let timeToRead: number | undefined;
        if (isMarkingAsRead) {
          const createdTime = new Date(originalNotification.created_at).getTime();
          const readTime = new Date().getTime();
          timeToRead = Math.floor((readTime - createdTime) / 1000); // in seconds
        }
        
        // Update the notification
        const updatedNotification = {
          ...originalNotification,
          ...data,
          // If we're updating the status, add read_at timestamp and engagement metrics
          ...(isMarkingAsRead ? { 
            read_at: new Date().toISOString(),
            metadata: {
              ...originalNotification.metadata,
              engagement: {
                time_to_read: timeToRead,
                read_date: new Date().toISOString(),
                // Track the number of times the notification has been viewed/marked as read
                view_count: ((originalNotification.metadata?.engagement?.view_count || 0) + 1)
              }
            } 
          } : {})
        };
        
        // Replace the notification in the collection
        notificationsList[notificationIndex] = updatedNotification;
        notifications.set(key, notificationsList);
        
        // Log analytics data for admin reports
        if (isMarkingAsRead) {
          console.log(`Notification engagement: ID ${updatedNotification.id}, Time to read: ${timeToRead}s, Target: ${updatedNotification.target_type}-${updatedNotification.target_id || 'all'}`);
        }
        
        return updatedNotification;
      }
    }
    
    return null;
  }
  
  /**
   * Delete a notification
   */
  public async deleteNotification(id: string): Promise<boolean> {
    let deleted = false;
    
    // Loop through all notification collections
    const entries = Array.from(notifications.entries());
    for (const [key, notificationsList] of entries) {
      const filteredList = notificationsList.filter((n: Notification) => n.id !== id);
      
      // If the list size changed, we found and removed the notification
      if (filteredList.length !== notificationsList.length) {
        notifications.set(key, filteredList);
        deleted = true;
      }
    }
    
    return deleted;
  }
  
  /**
   * Mark all notifications as read for a user
   */
  public async clearAllNotifications(
    userType: 'patient' | 'clinic' | 'admin',
    userId: string
  ): Promise<boolean> {
    try {
      // Get all relevant notifications for this user
      const { notifications: userNotifications } = await this.getNotifications(userType, userId, 'unread');
      
      // Mark each notification as read
      for (const notification of userNotifications) {
        await this.updateNotification({
          id: notification.id,
          status: 'read'
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
  
  /**
   * Send notification via WebSocket
   */
  private sendRealTimeNotification(notification: Notification): void {
    // Determine target type for WebSocket message
    let targetType: 'patient' | 'clinic' | 'admin' | undefined;
    let targetId: string | undefined;
    
    if (notification.target_type === 'all') {
      // Broadcast to all client types
      this.wsService.broadcast({
        type: 'notification',
        payload: notification,
        sender: {
          id: notification.source_id || 'system',
          type: notification.source_type
        }
      });
      return;
    }
    
    // Set target type based on notification target
    targetType = notification.target_type;
    targetId = notification.target_id;
    
    if (targetType === 'patient' || targetType === 'clinic' || targetType === 'admin') {
      if (targetId) {
        // Send to specific user
        this.wsService.broadcast({
          type: 'notification',
          payload: notification,
          sender: {
            id: notification.source_id || 'system',
            type: notification.source_type
          },
          target: targetId
        });
      } else {
        // Send to all users of this type
        this.wsService.broadcast({
          type: 'notification',
          payload: notification,
          sender: {
            id: notification.source_id || 'system',
            type: notification.source_type
          }
        }, targetType);
      }
    }
  }
  
  /**
   * Determine storage key for a notification
   */
  private getStorageKey(notification: Notification): string {
    // Handle system-wide notifications that target all users across all portals
    if (notification.target_type === 'all') {
      return 'all-all';
    }
    
    // If target is specific, use target type + id
    if (notification.target_id) {
      return `${notification.target_type}-${notification.target_id}`;
    }
    
    // For "all" targets within a type (e.g., all patients, all clinics)
    return `${notification.target_type}-all`;
  }
  
  /**
   * Get analytics data for notification engagement
   * This provides metrics on notification read rates, timing, and categories
   */
  public async getNotificationAnalytics(): Promise<{
    total_notifications: number;
    read_count: number;
    unread_count: number;
    engagement_rate: number;
    average_time_to_read: number | null;
    notifications_by_category: Record<string, number>;
    notifications_by_priority: Record<string, number>;
  }> {
    // Get all notifications from all collections
    const allNotifications: Notification[] = [];
    const entries = Array.from(notifications.entries());
    for (const [_, notificationsList] of entries) {
      allNotifications.push(...notificationsList);
    }
    
    // Count notifications by status
    const readNotifications = allNotifications.filter(n => n.status === 'read');
    const unreadNotifications = allNotifications.filter(n => n.status === 'unread');
    
    // Calculate engagement rate
    const totalCount = allNotifications.length;
    const readCount = readNotifications.length;
    const unreadCount = unreadNotifications.length;
    const engagementRate = totalCount > 0 ? (readCount / totalCount) * 100 : 0;
    
    // Calculate average time to read (for notifications that have been read)
    let averageTimeToRead: number | null = null;
    
    const notificationsWithReadTime = readNotifications.filter(
      n => n.metadata?.engagement?.time_to_read !== undefined
    );
    
    if (notificationsWithReadTime.length > 0) {
      const totalTimeToRead = notificationsWithReadTime.reduce(
        (sum, n) => sum + (n.metadata?.engagement?.time_to_read || 0), 
        0
      );
      averageTimeToRead = totalTimeToRead / notificationsWithReadTime.length;
    }
    
    // Count notifications by category
    const notificationsByCategory: Record<string, number> = {};
    allNotifications.forEach(notification => {
      const category = notification.category;
      notificationsByCategory[category] = (notificationsByCategory[category] || 0) + 1;
    });
    
    // Count notifications by priority
    const notificationsByPriority: Record<string, number> = {};
    allNotifications.forEach(notification => {
      const priority = notification.priority;
      notificationsByPriority[priority] = (notificationsByPriority[priority] || 0) + 1;
    });
    
    return {
      total_notifications: totalCount,
      read_count: readCount,
      unread_count: unreadCount,
      engagement_rate: Number(engagementRate.toFixed(2)),
      average_time_to_read: averageTimeToRead ? Number(averageTimeToRead.toFixed(2)) : null,
      notifications_by_category: notificationsByCategory,
      notifications_by_priority: notificationsByPriority
    };
  }
}

// Export factory function to create the service
export const createNotificationService = (
  wsService: WebSocketService, 
  emailService: EmailNotificationService
): NotificationService => {
  return new NotificationService(wsService, emailService);
};