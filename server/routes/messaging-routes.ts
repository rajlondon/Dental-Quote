import express from "express";
import { storage } from "../storage";
import { z } from "zod";
import { isAuthenticated, ensureRole } from "../middleware/auth";
import { insertMessageSchema } from "@shared/schema";
import { NotFoundError } from "../models/custom-errors";
import { db } from "../db";
import { bookings, messages, clinics, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";

const router = express.Router();

// Create a new message
router.post("/", isAuthenticated, async (req, res, next) => {
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
      // For now, the notification will be handled when the user fetches their messages
      // We'll implement WebSocket notifications in a separate PR
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
router.get("/booking/:bookingId", isAuthenticated, async (req, res, next) => {
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
router.get("/threads", isAuthenticated, async (req, res, next) => {
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
router.patch("/:id/read", isAuthenticated, async (req, res, next) => {
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

// Patient-specific messaging routes

// Get all conversations for the patient
router.get("/patient/conversations", isAuthenticated, async (req, res, next) => {
  try {
    // Ensure the user is a patient
    if (req.user?.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only patients can access this endpoint."
      });
    }

    const patientId = req.user.id;
    
    // Get all bookings for this patient
    const patientBookings = await db.select({
      bookingId: bookings.id,
      bookingReference: bookings.bookingReference,
      clinicId: bookings.clinicId,
      status: bookings.status,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(eq(bookings.userId, patientId));
    
    if (patientBookings.length === 0) {
      return res.json({
        success: true,
        conversations: []
      });
    }
    
    // Get clinic details and latest messages for each booking
    const conversations = await Promise.all(patientBookings.map(async (booking) => {
      // Get clinic details
      const [clinic] = await db.select({
        id: clinics.id,
        name: clinics.name,
        email: clinics.email,
        avatar: clinics.logoUrl,
      })
      .from(clinics)
      .where(eq(clinics.id, booking.clinicId));
      
      if (!clinic) {
        return null; // Skip if clinic not found
      }
      
      // Get latest message and unread count
      const allMessages = await db.select()
        .from(messages)
        .where(eq(messages.bookingId, booking.bookingId))
        .orderBy(messages.createdAt);
      
      const lastMessage = allMessages.length > 0 ? allMessages[allMessages.length - 1] : null;
      const unreadCount = allMessages.filter(msg => 
        msg.recipientId === patientId && !msg.readAt
      ).length;
      
      return {
        bookingId: booking.bookingId,
        bookingReference: booking.bookingReference,
        clinicId: clinic.id,
        clinicName: clinic.name,
        clinicEmail: clinic.email,
        clinicAvatar: clinic.avatar,
        status: booking.status,
        lastMessage: lastMessage?.content || "No messages yet",
        lastMessageTime: lastMessage?.createdAt || booking.createdAt,
        unreadCount,
        treatmentType: "Dental Consultation" // Default value, this would be fetched from treatments table in a full implementation
      };
    }));
    
    // Filter out null values (clinics not found)
    const validConversations = conversations.filter(conv => conv !== null);
    
    res.json({
      success: true,
      conversations: validConversations
    });
  } catch (error) {
    console.error("Error fetching patient conversations:", error);
    next(error);
  }
});

// Get messages for a specific booking
router.get("/patient/booking/:bookingId/messages", isAuthenticated, async (req, res, next) => {
  try {
    // Ensure the user is a patient
    if (req.user?.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only patients can access this endpoint."
      });
    }
    
    const patientId = req.user.id;
    const bookingId = parseInt(req.params.bookingId);
    
    if (isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      });
    }
    
    // Check if the booking belongs to this patient
    const [booking] = await db.select()
      .from(bookings)
      .where(and(
        eq(bookings.id, bookingId),
        eq(bookings.userId, patientId)
      ));
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or you don't have access to it"
      });
    }
    
    // Get clinic details
    const [clinic] = await db.select({
      id: clinics.id,
      name: clinics.name,
      email: clinics.email,
      avatar: clinics.logoUrl,
    })
    .from(clinics)
    .where(eq(clinics.id, booking.clinicId));
    
    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found"
      });
    }
    
    // Get all messages for this booking
    const rawMessages = await db.select()
      .from(messages)
      .where(eq(messages.bookingId, bookingId))
      .orderBy(messages.createdAt);
    
    // Format messages for client
    const formattedMessages = await Promise.all(rawMessages.map(async (msg) => {
      const isFromPatient = msg.senderId === patientId;
      let senderName = isFromPatient ? "You" : clinic.name;
      let senderAvatar = isFromPatient ? null : clinic.avatar;
      
      // If message is from clinic staff, get their name
      if (!isFromPatient && msg.senderId) {
        const [sender] = await db.select({
          firstName: users.firstName,
          lastName: users.lastName,
          avatar: users.profileImage,
        })
        .from(users)
        .where(eq(users.id, msg.senderId));
        
        if (sender) {
          senderName = `${sender.firstName} ${sender.lastName}`;
          senderAvatar = sender.avatar || clinic.avatar;
        }
      }
      
      return {
        id: msg.id,
        bookingId: msg.bookingId,
        content: msg.content,
        sender: isFromPatient ? "patient" : "clinic",
        senderName,
        senderAvatar,
        timestamp: msg.createdAt,
        isRead: !!msg.readAt,
        messageType: msg.messageType || "text",
      };
    }));
    
    // Mark messages as read if they were sent to the patient
    await Promise.all(rawMessages
      .filter(msg => msg.recipientId === patientId && !msg.readAt)
      .map(msg => 
        db.update(messages)
          .set({ readAt: new Date() })
          .where(eq(messages.id, msg.id))
      )
    );
    
    // Format booking details for response
    const bookingDetails = {
      id: booking.id,
      reference: booking.bookingReference,
      status: booking.status,
      treatmentType: "Dental Consultation", // Default value
      clinic: {
        id: clinic.id,
        name: clinic.name,
        email: clinic.email,
        avatar: clinic.avatar,
      }
    };
    
    res.json({
      success: true,
      booking: bookingDetails,
      messages: formattedMessages
    });
  } catch (error) {
    console.error("Error fetching booking messages:", error);
    next(error);
  }
});

// Send a message
router.post("/send", isAuthenticated, async (req, res, next) => {
  try {
    const { bookingId, content, messageType = "text" } = req.body;
    
    if (!bookingId || !content) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: bookingId, content"
      });
    }
    
    const userId = req.user!.id;
    const userRole = req.user!.role;
    
    // Get the booking
    const [booking] = await db.select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    
    // Verify that the user has permission to send messages for this booking
    if (userRole === "patient" && booking.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to send messages for this booking"
      });
    } else if (userRole === "clinic_staff") {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user || user.clinicId !== booking.clinicId) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to send messages for this booking"
        });
      }
    }
    
    // Determine recipient based on sender role
    let recipientId;
    if (userRole === "patient") {
      // Message is from patient to clinic staff
      // Get clinic staff associated with this booking
      recipientId = booking.assignedClinicStaffId || booking.clinicId;
    } else {
      // Message is from clinic staff or admin to patient
      recipientId = booking.userId;
    }
    
    // Create the message
    const [newMessage] = await db.insert(messages)
      .values({
        bookingId,
        senderId: userId,
        recipientId,
        content,
        messageType,
        createdAt: new Date(),
      })
      .returning();
    
    if (!newMessage) {
      throw new Error("Failed to create message");
    }
    
    // Get sender details for response
    const [sender] = await db.select({
      firstName: users.firstName,
      lastName: users.lastName,
      avatar: users.profileImage,
    })
    .from(users)
    .where(eq(users.id, userId));
    
    const formattedMessage = {
      id: newMessage.id,
      bookingId: newMessage.bookingId,
      content: newMessage.content,
      sender: userRole === "patient" ? "patient" : "clinic",
      senderName: userRole === "patient" ? "You" : `${sender?.firstName || ""} ${sender?.lastName || ""}`.trim(),
      senderAvatar: sender?.avatar,
      timestamp: newMessage.createdAt,
      isRead: false,
      messageType: newMessage.messageType || "text",
    };
    
    // Create a notification for the recipient
    try {
      const notificationService = req.app.locals.notificationService;
      if (notificationService) {
        await notificationService.createNotification({
          userId: recipientId,
          type: "message",
          title: "New Message",
          message: `You have a new message regarding booking ${booking.bookingReference}`,
          relatedId: bookingId.toString(),
          priority: "medium",
        });
      }
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Continue anyway, as the message was sent successfully
    }
    
    res.status(201).json({
      success: true,
      message: formattedMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    next(error);
  }
});

export default router;