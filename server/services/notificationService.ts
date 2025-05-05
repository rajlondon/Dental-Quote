import { v4 as uuidv4 } from 'uuid';
import { 
  Notification as NotificationInterface, 
  CreateNotification, 
  UpdateNotification, 
  NotificationResponse 
} from '@shared/notifications';
import { WebSocketService } from './websocketService';
import { EmailNotificationService } from './emailNotificationService';
import { db } from '../db';
import { notifications } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

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
   * This now uses the database schema notification format
   */
  public async createNotification(data: any): Promise<any> {
    // Insert the notification into the database
    const [newNotification] = await db.insert(notifications).values({
      userId: data.userId,
      title: data.title,
      message: data.message,
      content: data.content,
      isRead: data.isRead || false,
      type: data.type || 'info',
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId
    }).returning();
    
    // Send real-time notification using WebSocket
    this.sendRealTimeNotification(this.mapToLegacyFormat(newNotification));
    
    // Send email notification if appropriate
    try {
      await this.emailService.processNotification(this.mapToLegacyFormat(newNotification));
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
    try {
      // Query database for notifications for this user
      const userIdNum = parseInt(userId, 10);
      
      // Build the query with filters
      let query = db.select().from(notifications).where(eq(notifications.userId, userIdNum));
      
      // If status is unread, add that filter
      if (status === 'unread') {
        query = query.where(eq(notifications.isRead, false));
      }
      
      // Execute the query and get results
      const dbNotifications = await query.orderBy(desc(notifications.createdAt));
      
      // Map to the interface expected by the client
      const mappedNotifications = dbNotifications.map(n => this.mapToLegacyFormat(n));
      
      // Count unread notifications
      const unreadCount = dbNotifications.filter(n => !n.isRead).length;
      
      return {
        notifications: mappedNotifications,
        unread_count: unreadCount
      };
    } catch (error) {
      console.error('Error fetching notifications from database:', error);
      // Return empty result on error
      return {
        notifications: [],
        unread_count: 0
      };
    }
  }
  
  /**
   * Update notification status (mark as read/archived)
   */
  public async updateNotification(data: UpdateNotification): Promise<any> {
    try {
      // Convert string ID to number if needed
      const notificationId = typeof data.id === 'string' ? parseInt(data.id, 10) : data.id;
      
      // First, fetch the notification to check its current state
      const [originalNotification] = await db.select().from(notifications)
        .where(eq(notifications.id, notificationId));
      
      if (!originalNotification) {
        return null;
      }
      
      // Determine if we're marking as read
      const isMarkingAsRead = data.status === 'read' && !originalNotification.isRead;
      const now = new Date();
      
      // Update the notification in the database
      const [updatedNotification] = await db.update(notifications)
        .set({
          isRead: data.status === 'read',
        })
        .where(eq(notifications.id, notificationId))
        .returning();
      
      // Log analytics data for admin reports
      if (isMarkingAsRead) {
        const timeToRead = Math.floor((now.getTime() - originalNotification.createdAt.getTime()) / 1000);
        console.log(`Notification engagement: ID ${updatedNotification.id}, Time to read: ${timeToRead}s, User: ${originalNotification.userId}`);
      }
      
      return this.mapToLegacyFormat(updatedNotification);
    } catch (error) {
      console.error('Error updating notification status:', error);
      return null;
    }
  }
  
  /**
   * Delete a notification
   */
  public async deleteNotification(id: string): Promise<boolean> {
    try {
      // Convert string ID to number if needed
      const notificationId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // Delete the notification from the database
      const result = await db.delete(notifications)
        .where(eq(notifications.id, notificationId))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }
  
  /**
   * Mark all notifications as read for a user
   */
  public async clearAllNotifications(
    userType: 'patient' | 'clinic' | 'admin',
    userId: string
  ): Promise<boolean> {
    try {
      // Convert string ID to number
      const userIdNumber = parseInt(userId, 10);
      
      // Bulk update all unread notifications for this user to read
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, userIdNumber))
        .where(eq(notifications.isRead, false));
      
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
   * Map database notification to the legacy format used by WebSocket and Email services
   */
  private mapToLegacyFormat(notification: any): NotificationInterface {
    // Map from the database schema notification to the interface expected by the existing services
    return {
      id: String(notification.id),
      title: notification.title,
      message: notification.message,
      status: notification.isRead ? 'read' : 'unread',
      category: notification.entityType as any || 'system',
      priority: 'medium',
      created_at: notification.createdAt?.toISOString() || new Date().toISOString(),
      target_type: 'patient',
      target_id: String(notification.userId),
      source_type: 'system',
      source_id: 'system',
      action_url: notification.action
    };
  }
  
  /**
   * Determine storage key for a notification
   */
  private getStorageKey(notification: NotificationInterface): string {
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
    try {
      // Get all notifications from database
      const allNotifications = await db.select().from(notifications);
      
      // Count notifications by status
      const readNotifications = allNotifications.filter(n => n.isRead);
      const unreadNotifications = allNotifications.filter(n => !n.isRead);
      
      // Calculate engagement rate
      const totalCount = allNotifications.length;
      const readCount = readNotifications.length;
      const unreadCount = unreadNotifications.length;
      const engagementRate = totalCount > 0 ? (readCount / totalCount) * 100 : 0;
      
      // Calculate average time to read (simplified without metadata)
      // This is just a placeholder since we don't have read time tracking yet
      const averageTimeToRead = null;
      
      // Count notifications by category (entityType)
      const notificationsByCategory: Record<string, number> = {};
      allNotifications.forEach(notification => {
        const category = notification.entityType || 'system';
        notificationsByCategory[category] = (notificationsByCategory[category] || 0) + 1;
      });
      
      // Count notifications by priority (using type as proxy since we don't have priority)
      const notificationsByPriority: Record<string, number> = {};
      allNotifications.forEach(notification => {
        const priority = notification.type || 'medium';
        notificationsByPriority[priority] = (notificationsByPriority[priority] || 0) + 1;
      });
      
      return {
        total_notifications: totalCount,
        read_count: readCount,
        unread_count: unreadCount,
        engagement_rate: Number(engagementRate.toFixed(2)),
        average_time_to_read: null, // No read time tracking in current schema
        notifications_by_category: notificationsByCategory,
        notifications_by_priority: notificationsByPriority
      };
    } catch (error) {
      console.error('Error fetching notification analytics:', error);
      // Return empty analytics on error
      return {
        total_notifications: 0,
        read_count: 0,
        unread_count: 0,
        engagement_rate: 0,
        average_time_to_read: null,
        notifications_by_category: {},
        notifications_by_priority: {}
      };
    }
  }
}

// Export factory function to create the service
export const createNotificationService = (
  wsService: WebSocketService, 
  emailService: EmailNotificationService
): NotificationService => {
  return new NotificationService(wsService, emailService);
};