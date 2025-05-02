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
        // Update the notification
        const updatedNotification = {
          ...notificationsList[notificationIndex],
          ...data,
          // If we're updating the status, add a read_at timestamp
          ...(data.status === 'read' && !data.read_at 
            ? { read_at: new Date().toISOString() } 
            : {})
        };
        
        // Replace the notification in the collection
        notificationsList[notificationIndex] = updatedNotification;
        notifications.set(key, notificationsList);
        
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
   * Clear all notifications for a user
   */
  public async clearAllNotifications(
    userType: 'patient' | 'clinic' | 'admin',
    userId: string
  ): Promise<boolean> {
    const targetKey = `${userType}-${userId}`;
    
    // Remove targeted notifications
    notifications.delete(targetKey);
    
    return true;
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
    // If target is specific, use target type + id
    if (notification.target_id) {
      return `${notification.target_type}-${notification.target_id}`;
    }
    
    // For "all" targets within a type
    return `${notification.target_type}-all`;
  }
}

// Export factory function to create the service
export const createNotificationService = (
  wsService: WebSocketService, 
  emailService: EmailNotificationService
): NotificationService => {
  return new NotificationService(wsService, emailService);
};