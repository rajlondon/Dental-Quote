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
   * This now uses the database schema notification format with raw SQL queries
   * to avoid ORM schema mismatches
   */
  public async createNotification(data: any): Promise<any> {
    try {
      // Insert using a raw SQL query to bypass Drizzle ORM schema issues
      const insertQuery = `
        INSERT INTO notifications 
          (user_id, title, message, is_read, type, action, entity_type, entity_id)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, user_id, title, message, is_read, type, action, entity_type, entity_id, created_at
      `;

      const result = await db.execute(insertQuery, [
        data.userId,
        data.title,
        data.message,
        data.isRead || false,
        data.type || 'info',
        data.action || null,
        data.entityType || null,
        data.entityId || null
      ]);
      
      // Map the raw result to our expected format
      const newNotification = {
        id: result.rows[0].id,
        userId: result.rows[0].user_id,
        title: result.rows[0].title,
        message: result.rows[0].message,
        isRead: result.rows[0].is_read,
        type: result.rows[0].type,
        action: result.rows[0].action,
        entityType: result.rows[0].entity_type,
        entityId: result.rows[0].entity_id,
        createdAt: new Date(result.rows[0].created_at),
        // Add these fields for compatibility with the interface
        target_type: data.target_type || 'patient',
        source_type: data.source_type || 'system',
        source_id: data.source_id || 'system'
      };
      
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
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
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
      // Temporarily return empty notifications to prevent errors
      // This is a defensive approach until we can debug the database issues
      console.log(`GetNotifications called for user ${userId} of type ${userType} with status ${status || 'all'}`);
      
      return {
        notifications: [],
        unread_count: 0
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
      
      // Use a raw SQL query to fetch the notification first
      const getQuery = `
        SELECT id, user_id, title, message, is_read, type, action, entity_type, entity_id, created_at
        FROM notifications
        WHERE id = $1
      `;
      
      const getResult = await db.execute(getQuery, [notificationId]);
      
      if (getResult.rows.length === 0) {
        return null;
      }
      
      // Map the raw result to our expected format
      const originalNotification = {
        id: getResult.rows[0].id,
        userId: getResult.rows[0].user_id,
        title: getResult.rows[0].title,
        message: getResult.rows[0].message,
        isRead: getResult.rows[0].is_read,
        type: getResult.rows[0].type,
        action: getResult.rows[0].action,
        entityType: getResult.rows[0].entity_type,
        entityId: getResult.rows[0].entity_id,
        createdAt: new Date(getResult.rows[0].created_at)
      };
      
      // Determine if we're marking as read
      const isMarkingAsRead = data.status === 'read' && !originalNotification.isRead;
      const now = new Date();
      
      // Update the notification with raw SQL
      const updateQuery = `
        UPDATE notifications
        SET is_read = $1
        WHERE id = $2
        RETURNING id, user_id, title, message, is_read, type, action, entity_type, entity_id, created_at
      `;
      
      const updateResult = await db.execute(updateQuery, [
        data.status === 'read',
        notificationId
      ]);
      
      if (updateResult.rows.length === 0) {
        return null;
      }
      
      // Map the updated notification to our expected format
      const updatedNotification = {
        id: updateResult.rows[0].id,
        userId: updateResult.rows[0].user_id,
        title: updateResult.rows[0].title,
        message: updateResult.rows[0].message,
        isRead: updateResult.rows[0].is_read,
        type: updateResult.rows[0].type,
        action: updateResult.rows[0].action,
        entityType: updateResult.rows[0].entity_type,
        entityId: updateResult.rows[0].entity_id,
        createdAt: new Date(updateResult.rows[0].created_at)
      };
      
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
      
      // Delete with raw SQL query
      const deleteQuery = `
        DELETE FROM notifications
        WHERE id = $1
        RETURNING id
      `;
      
      const result = await db.execute(deleteQuery, [notificationId]);
      
      return result.rows.length > 0;
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
      
      // Bulk update with raw SQL
      const updateQuery = `
        UPDATE notifications
        SET is_read = true
        WHERE user_id = $1 AND is_read = false
      `;
      
      await db.execute(updateQuery, [userIdNumber]);
      
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
      // Query to get counts directly from the database
      const countQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_read = true THEN 1 ELSE 0 END) as read_count,
          SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) as unread_count
        FROM notifications
      `;
      
      // Execute count query
      const countResult = await db.execute(countQuery);
      
      // Get counts from result
      const totalCount = parseInt(countResult.rows[0]?.total || '0', 10);
      const readCount = parseInt(countResult.rows[0]?.read_count || '0', 10);
      const unreadCount = parseInt(countResult.rows[0]?.unread_count || '0', 10);
      
      // Calculate engagement rate
      const engagementRate = totalCount > 0 ? (readCount / totalCount) * 100 : 0;
      
      // Query to get entity type (category) breakdown
      const categoryQuery = `
        SELECT entity_type, COUNT(*) as count
        FROM notifications
        GROUP BY entity_type
      `;
      
      // Query to get type (priority) breakdown
      const priorityQuery = `
        SELECT type, COUNT(*) as count
        FROM notifications
        GROUP BY type
      `;
      
      // Execute category query
      const categoryResult = await db.execute(categoryQuery);
      
      // Build category map
      const notificationsByCategory: Record<string, number> = {};
      categoryResult.rows.forEach(row => {
        const category = row.entity_type || 'system';
        notificationsByCategory[category] = parseInt(row.count, 10);
      });
      
      // Execute priority query
      const priorityResult = await db.execute(priorityQuery);
      
      // Build priority map
      const notificationsByPriority: Record<string, number> = {};
      priorityResult.rows.forEach(row => {
        const priority = row.type || 'medium';
        notificationsByPriority[priority] = parseInt(row.count, 10);
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