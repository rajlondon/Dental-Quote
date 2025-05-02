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
      
      // Override source info with authenticated user
      const notification = await notificationService.createNotification({
        ...notificationData,
        source_type: sourceType,
        source_id: String(req.user.id)
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

  // Test endpoint for email notifications (only available in development mode)
  if (process.env.NODE_ENV !== 'production') {
    router.post('/api/test/email-notification', async (req, res) => {
      try {
        if (!req.isAuthenticated()) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        // Create a test notification for the authenticated user
        const testNotification = {
          id: uuidv4(),
          title: 'Test Email Notification',
          message: 'This is a test email notification to verify the integration.',
          target_type: 'patient',
          target_id: String(req.user.id),
          source_type: 'system',
          source_id: 'system',
          category: 'appointment', // Using appointment category to trigger email
          subcategory: 'test',
          priority: 'high', // High priority to trigger email
          status: 'unread',
          action_url: '/patient/profile',
          created_at: new Date(),
          updated_at: new Date()
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