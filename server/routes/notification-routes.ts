import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createNotificationSchema } from '@shared/notifications';
import { NotificationService } from '../services/notificationService';

// Define User interface for consistent typing
interface User {
  id: number;
  clinicId?: number;
  role: string;
}

// Extend Express namespace for TypeScript support
declare global {
  namespace Express {
    interface User {
      id: number;
      clinicId?: number;
      role: string;
    }
  }
}

// Create and export the router
export const createNotificationRoutes = (notificationService: NotificationService) => {
  const router = express.Router();
  
  // Generate test notifications - development only endpoint
  router.post('/api/notifications/generate-test', async (req, res) => {
    try {
      // Only allow if user is admin or if we're in development
      if (process.env.NODE_ENV !== 'production' || (req.isAuthenticated() && req.user.role === 'admin')) {
        // Import the function using ES module dynamic import
        const { generateTestNotifications } = await import('../utils/generate-test-notifications');
        const count = await generateTestNotifications();
        return res.status(200).json({ 
          success: true, 
          message: `Successfully generated ${count} test notifications`,
          count 
        });
      } else {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. This endpoint is only available in development mode or for admin users.'
        });
      }
    } catch (error) {
      console.error('Failed to generate test notifications:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to generate test notifications', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });
  
  // Interface for engagement analytics data
  interface NotificationAnalytics {
    total_notifications: number;
    read_count: number;
    unread_count: number;
    engagement_rate: number;
    average_time_to_read: number | null;
    notifications_by_category: Record<string, number>;
    notifications_by_priority: Record<string, number>;
  }

  // GET endpoint to fetch notifications (for any portal type)
  router.get('/api/notifications', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Map user role to notification target type
    let userType: 'patient' | 'clinic' | 'admin';
    
    // Use string comparison for type safety
    const userRole = req.user.role as string;
    
    if (userRole === 'patient') {
      userType = 'patient';
    } else if (userRole === 'clinic_staff' || userRole === 'clinic_admin') {
      userType = 'clinic';
    } else if (userRole === 'admin') {
      userType = 'admin';
    } else {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    // Get status filter from query params if provided
    const status = req.query.status === 'unread' ? 'unread' : 'all';
    
    try {
      const userId = String(req.user.id);
      const result = await notificationService.getNotifications(userType, userId, status);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // POST endpoint to create a new notification
  router.post('/api/notifications', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only admin and clinic staff can create notifications
    if (req.user.role !== 'admin' && req.user.role !== 'clinic_staff' && req.user.role !== 'clinic_admin') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    try {
      // Validate input data
      const notificationData = createNotificationSchema.parse(req.body);
      
      // Set source type based on authenticated user
      let sourceType: 'patient' | 'clinic' | 'admin' | 'system';
      
      // Use a safer approach with string comparison instead of switch/case for better type safety
      const userRole = req.user.role as string;
      
      if (userRole === 'patient') {
        sourceType = 'patient';
      } else if (userRole === 'clinic_staff' || userRole === 'clinic_admin') {
        sourceType = 'clinic';
      } else if (userRole === 'admin') {
        sourceType = 'admin';
      } else {
        sourceType = 'system';
      }
      
      // Map from the API schema to the database schema
      // The database has: id, user_id, title, message, is_read, type, action, entity_type, entity_id, created_at
      const notification = await notificationService.createNotification({
        userId: parseInt(notificationData.target_id || String(req.user.id), 10),
        title: notificationData.title,
        message: notificationData.message,
        isRead: false,
        type: notificationData.priority, // map priority to type
        action: notificationData.action_url, // map action_url to action
        entityType: notificationData.category, // map category to entityType
        entityId: notificationData.metadata?.entityId ? parseInt(notificationData.metadata.entityId, 10) : null,
        // Include source info in the metadata
        source_type: sourceType,
        source_id: String(req.user.id),
        target_type: notificationData.target_type
      });
      
      res.status(201).json(notification);
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ error: error.errors });
      }
      
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  });

  // PUT endpoint to update notification status
  router.put('/api/notifications/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (status && !['read', 'unread', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    try {
      const updated = await notificationService.updateNotification({
        id,
        status: status,
      });

      if (!updated) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json(updated);
    } catch (error) {
      console.error('Error updating notification:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  // DELETE endpoint to delete a notification
  router.delete('/api/notifications/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    try {
      const deleted = await notificationService.deleteNotification(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  // GET endpoint for notification analytics (admin only)
  router.get('/api/notifications/analytics', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Only admins can access analytics
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    try {
      const analytics = await notificationService.getNotificationAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching notification analytics:', error);
      res.status(500).json({ error: 'Failed to fetch notification analytics' });
    }
  });
  
  // POST endpoint to mark all notifications as read
  router.post('/api/notifications/mark-all-read', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Map user role to notification target type
    let userType: 'patient' | 'clinic' | 'admin';
    
    // Use string comparison for type safety
    const userRole = req.user.role as string;
    
    if (userRole === 'patient') {
      userType = 'patient';
    } else if (userRole === 'clinic_staff' || userRole === 'clinic_admin') {
      userType = 'clinic';
    } else if (userRole === 'admin') {
      userType = 'admin';
    } else {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    try {
      // This would be better implemented with a batch update
      // For now, we'll use the clear method as a placeholder
      const success = await notificationService.clearAllNotifications(
        userType, 
        String(req.user.id)
      );

      res.json({ success });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
  });

  // Test endpoint to generate sample notifications (only available in development mode)
  if (process.env.NODE_ENV !== 'production') {
    router.post('/api/notifications/generate-test', async (req, res) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // Create a variety of test notifications for the authenticated user
        const testTypes = ['info', 'warning', 'success', 'error'];
        const testEntityTypes = ['appointment', 'treatment', 'message', 'payment', 'document', 'system', 'offer'];
        
        const results = [];
        
        // Generate 5 test notifications with different types
        for (let i = 0; i < 5; i++) {
          const type = testTypes[i % testTypes.length];
          const entityType = testEntityTypes[i % testEntityTypes.length];
          
          const testNotification = {
            userId: req.user.id,
            title: `Test ${type.charAt(0).toUpperCase() + type.slice(1)} Notification ${i+1}`,
            message: `This is a test ${type} notification #${i+1} for testing the notification system.`,
            isRead: i % 2 === 0, // alternate between read and unread
            type: type,
            action: '/patient/profile',
            entityType: entityType,
            entityId: i + 1,
            // Include additional metadata
            source_type: 'system',
            source_id: 'test-generator',
            target_type: 'patient'
          };
          
          // Process the notification
          const notification = await notificationService.createNotification(testNotification);
          results.push(notification);
        }
        
        res.status(201).json({
          success: true,
          message: `Generated ${results.length} test notifications`,
          notifications: results
        });
      } catch (error) {
        console.error('Error generating test notifications:', error);
        res.status(500).json({ 
          error: 'Failed to generate test notifications',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    });
    
    // Email test endpoint
    router.post('/api/test/email-notification', async (req, res) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        // Create a test notification for the authenticated user
        // Making sure to only use fields that exist in the database schema
        const testNotification = {
          userId: req.user.id,
          title: 'Test Email Notification',
          message: 'This is a test email notification to verify the integration.',
          isRead: false,
          type: 'info',
          action: '/patient/profile',
          entityType: 'appointment',
          entityId: null
        };

        // Process the notification which should trigger an email
        const notification = await notificationService.createNotification(testNotification);
        
        res.status(201).json({
          success: true,
          message: 'Test notification created and email should be sent if configured properly',
          notification
        });
      } catch (error) {
        console.error('Error creating test email notification:', error);
        res.status(500).json({ 
          error: 'Failed to create test email notification',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }

  return router;
};