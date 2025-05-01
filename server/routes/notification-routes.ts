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
    
    switch(req.user.role) {
      case 'patient':
        userType = 'patient';
        break;
      case 'clinic_staff':
      case 'clinic_admin':
        userType = 'clinic';
        break;
      case 'admin':
        userType = 'admin';
        break;
      default:
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
      switch(req.user.role) {
        case 'patient':
          sourceType = 'patient';
          break;
        case 'clinic_staff':
        case 'clinic_admin':
          sourceType = 'clinic';
          break;
        case 'admin':
          sourceType = 'admin';
          break;
        default:
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
    
    switch(req.user.role) {
      case 'patient':
        userType = 'patient';
        break;
      case 'clinic_staff':
      case 'clinic_admin':
        userType = 'clinic';
        break;
      case 'admin':
        userType = 'admin';
        break;
      default:
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

  return router;
};