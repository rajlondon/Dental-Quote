import express from "express";
import { storage } from "../storage";
import { z } from "zod";
import { ensureAuthenticated as authenticateUser, ensureRole } from "../middleware/security";
import { insertMessageSchema } from "@shared/schema";

const router = express.Router();

// Create a new message
router.post("/messages", authenticateUser, async (req, res, next) => {
  try {
    const messageData = insertMessageSchema.parse(req.body);
    
    // Set sender ID from authenticated user
    const senderId = req.user!.id;
    
    // Create the message
    const message = await storage.createMessage({
      ...messageData,
      senderId
    });

    // Notify the recipient via WebSocket if they're connected
    if (message.recipientId) {
      broadcastToUser(message.recipientId, {
        type: "NEW_MESSAGE",
        payload: message
      });
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message
    });
  } catch (error) {
    next(error);
  }
});

// Get messages for a specific booking
router.get("/messages/booking/:bookingId", authenticateUser, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    
    if (isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      });
    }
    
    // Check if the booking exists and the user has access to it
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }
    
    // Verify that the user is authorized to access these messages
    // Admin can access all, clinic staff only their clinic's bookings, patients only their own
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    if (userRole === "patient" && booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access these messages"
      });
    }
    
    if (userRole === "clinic_staff") {
      const user = await storage.getUser(userId);
      if (!user || user.clinicId !== booking.clinicId) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to access these messages"
        });
      }
    }
    
    const messages = await storage.getMessagesByBookingId(bookingId);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
});

// Get all message threads for the authenticated user
router.get("/messages/threads", authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const threads = await storage.getMessageThreads(userId);
    
    res.json({
      success: true,
      data: threads
    });
  } catch (error) {
    next(error);
  }
});

// Mark a message as read
router.patch("/messages/:id/read", authenticateUser, async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.id);
    
    if (isNaN(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID"
      });
    }
    
    await storage.markMessageAsRead(messageId);
    
    res.json({
      success: true,
      message: "Message marked as read"
    });
  } catch (error) {
    next(error);
  }
});

export default router;