import express from 'express';
import { db } from '../db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { notifications, users } from '@shared/schema';
import { isAuthenticated } from '../middleware/auth-middleware';

const router = express.Router();

// Get all notifications for the current user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: [desc(notifications.createdAt)],
      limit: 50  // Limit to most recent 50 notifications
    });
    
    res.json({
      success: true,
      notifications: userNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching notifications'
    });
  }
});

// Get unread notification count
router.get('/unread/count', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
    
    const unreadCount = result[0]?.count || 0;
    
    res.json({
      success: true,
      count: unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching unread notification count'
    });
  }
});

// Mark a notification as read
router.put('/:notificationId/read', isAuthenticated, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user!.id;
    
    // First check if the notification exists and belongs to this user
    const notification = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.id, parseInt(notificationId)),
        eq(notifications.userId, userId)
      )
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or you do not have permission to access it'
      });
    }
    
    // Update the notification as read
    await db.update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, parseInt(notificationId)),
          eq(notifications.userId, userId)
        )
      );
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the notification'
    });
  }
});

// Mark all notifications as read
router.put('/read/all', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Update all unread notifications for this user
    await db.update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating notifications'
    });
  }
});

// Create a notification
// This is primarily for internal use or admin use
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { userId, title, message, type = 'info', action, entityType, entityId } = req.body;
    
    // Check if the user making the request is an admin
    // Or is creating a notification for themselves
    const isAdmin = req.user!.role === 'admin';
    const isSelf = parseInt(userId) === req.user!.id;
    
    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create notifications for other users'
      });
    }
    
    // Verify user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, parseInt(userId))
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create the notification
    const [notification] = await db.insert(notifications)
      .values({
        userId: parseInt(userId),
        title,
        message,
        type,
        action,
        entityType,
        entityId: entityId ? parseInt(entityId) : undefined
      })
      .returning();
    
    // Send real-time notification if WebSocket service is available
    const wsService = req.app.locals.wsService;
    if (wsService) {
      wsService.broadcast({
        type: 'notification',
        payload: notification,
        sender: {
          id: req.user!.id.toString(),
          type: req.user!.role
        },
        target: userId.toString()
      });
    }
    
    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the notification'
    });
  }
});

// Delete a notification
router.delete('/:notificationId', isAuthenticated, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user!.id;
    
    // First check if the notification exists and belongs to this user
    const notification = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.id, parseInt(notificationId)),
        eq(notifications.userId, userId)
      )
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or you do not have permission to access it'
      });
    }
    
    // Delete the notification
    await db.delete(notifications)
      .where(
        and(
          eq(notifications.id, parseInt(notificationId)),
          eq(notifications.userId, userId)
        )
      );
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the notification'
    });
  }
});

export default router;