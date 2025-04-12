import { Request, Response, Router, NextFunction } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { ZodError } from "zod-validation-error";
import { and, eq, sql } from "drizzle-orm";
import {
  insertQuoteRequestSchema,
  insertBookingSchema,
  insertMessageSchema,
  insertNotificationSchema,
  insertFileSchema,
  insertAppointmentSchema
} from "@shared/schema";

const router = Router();

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Role-based middleware
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    next();
  };
};

// Common validation error handler
const handleZodError = (err: unknown, res: Response) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ errors: err.toString() });
  }
  console.error("Unexpected error:", err);
  return res.status(500).json({ error: "Internal server error" });
};

// =========================================
// USER ROUTES
// =========================================

// Get current user
router.get("/api/portal/user", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.user.id);
    return res.json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile
router.patch("/api/portal/user", requireAuth, async (req, res) => {
  try {
    const updateSchema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(), 
      phone: z.string().optional(),
      profileImage: z.string().optional(),
    });
    
    const data = updateSchema.parse(req.body);
    const updatedUser = await storage.updateUser(req.user.id, data);
    
    return res.json({ user: updatedUser });
  } catch (err) {
    return handleZodError(err, res);
  }
});

// =========================================
// DASHBOARD ROUTES
// =========================================

// Get dashboard stats
router.get("/api/portal/dashboard", requireAuth, async (req, res) => {
  try {
    const stats = await storage.getDashboardStats(req.user.role, req.user.id);
    return res.json({ stats });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// =========================================
// QUOTE ROUTES 
// =========================================

// Get quotes
router.get("/api/portal/quotes", requireAuth, async (req, res) => {
  try {
    let quotes;
    
    switch (req.user.role) {
      case "admin":
        // Admins can see all quotes
        quotes = await storage.getAllQuoteRequests();
        break;
      case "clinic_staff":
        // Clinic staff can only see quotes for their clinic
        if (!req.user.clinicId) {
          return res.status(400).json({ error: "Staff not associated with a clinic" });
        }
        quotes = await storage.getQuoteRequestsByClinicId(req.user.clinicId);
        break;
      case "patient":
        // Patients can only see their own quotes
        quotes = await storage.getQuoteRequestsByUserId(req.user.id);
        break;
      default:
        return res.status(403).json({ error: "Forbidden" });
    }
    
    return res.json({ quotes });
  } catch (err) {
    console.error("Error fetching quotes:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific quote
router.get("/api/portal/quotes/:id", requireAuth, async (req, res) => {
  try {
    const quoteId = parseInt(req.params.id);
    const quote = await storage.getQuoteRequest(quoteId);
    
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    
    // Check if user has access to this quote
    if (req.user.role === "patient" && quote.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    if (req.user.role === "clinic_staff" && quote.selectedClinicId !== req.user.clinicId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    // Mark quote as viewed for relevant user
    const updateData: any = {};
    if (req.user.role === "admin" && !quote.viewedByAdmin) {
      updateData.viewedByAdmin = true;
      await storage.updateQuoteRequest(quoteId, updateData);
    } else if (req.user.role === "clinic_staff" && !quote.viewedByClinic) {
      updateData.viewedByClinic = true;
      await storage.updateQuoteRequest(quoteId, updateData);
    }
    
    // Get quote versions
    const versions = await storage.getQuoteVersions(quoteId);
    
    return res.json({ quote, versions });
  } catch (err) {
    console.error("Error fetching quote:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update a quote
router.patch("/api/portal/quotes/:id", requireAuth, async (req, res) => {
  try {
    const quoteId = parseInt(req.params.id);
    const quote = await storage.getQuoteRequest(quoteId);
    
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    
    // Validate permissions
    if (req.user.role === "patient" && quote.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    if (req.user.role === "clinic_staff" && quote.selectedClinicId !== req.user.clinicId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    // Schema for different roles
    let updateSchema;
    
    if (req.user.role === "admin") {
      updateSchema = z.object({
        status: z.string().optional(),
        adminNotes: z.string().optional(),
        selectedClinicId: z.number().optional(),
        quoteData: z.any().optional(),
      });
    } else if (req.user.role === "clinic_staff") {
      updateSchema = z.object({
        clinicNotes: z.string().optional(),
        status: z.enum(["pending", "declined"]).optional(),
      });
    } else {
      // Patient can only approve/decline their quotes
      updateSchema = z.object({
        status: z.enum(["approved", "declined"]).optional(),
      });
    }
    
    const data = updateSchema.parse(req.body);
    const updatedQuote = await storage.updateQuoteRequest(quoteId, data);
    
    // If updating quoteData, create a new version
    if (req.body.quoteData && req.user.role === "admin") {
      // Get the latest version to determine the next version number
      const latestVersion = await storage.getLatestQuoteVersion(quoteId);
      const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
      
      await storage.createQuoteVersion({
        quoteRequestId: quoteId,
        versionNumber,
        createdById: req.user.id,
        status: "draft",
        quoteData: req.body.quoteData
      });
      
      // Create a notification for the patient
      if (quote.userId) {
        await storage.createNotification({
          userId: quote.userId,
          title: "Quote Updated",
          message: "Your quote has been updated. Please check the new version.",
          type: "info",
          entityType: "quote",
          entityId: quoteId
        });
      }
    }
    
    // If status changed to approved, create a notification for admin and clinic
    if (data.status === "approved" && quote.status !== "approved") {
      // Get the admins
      const admins = await storage.getAllUsers({
        role: "admin"
      });
      
      // Notify admin
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.id,
          title: "Quote Approved",
          message: `Quote #${quoteId} has been approved by the patient.`,
          type: "success",
          entityType: "quote",
          entityId: quoteId
        });
      }
      
      // Notify clinic if selected
      if (quote.selectedClinicId) {
        const clinicStaff = await storage.getAllUsers({
          role: "clinic_staff",
          clinicId: quote.selectedClinicId
        });
        
        for (const staff of clinicStaff) {
          await storage.createNotification({
            userId: staff.id,
            title: "Quote Approved",
            message: `Quote #${quoteId} has been approved by the patient.`,
            type: "success",
            entityType: "quote",
            entityId: quoteId
          });
        }
      }
    }
    
    return res.json({ quote: updatedQuote });
  } catch (err) {
    return handleZodError(err, res);
  }
});

// =========================================
// BOOKING ROUTES
// =========================================

// Get bookings
router.get("/api/portal/bookings", requireAuth, async (req, res) => {
  try {
    let bookings;
    
    switch (req.user.role) {
      case "admin":
        // Admins can see all bookings
        bookings = await storage.getAllBookings();
        break;
      case "clinic_staff":
        // Clinic staff can only see bookings for their clinic
        if (!req.user.clinicId) {
          return res.status(400).json({ error: "Staff not associated with a clinic" });
        }
        bookings = await storage.getBookingsByClinicId(req.user.clinicId);
        break;
      case "patient":
        // Patients can only see their own bookings
        bookings = await storage.getBookingsByUserId(req.user.id);
        break;
      default:
        return res.status(403).json({ error: "Forbidden" });
    }
    
    return res.json({ bookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Create booking from quote
router.post("/api/portal/bookings", requireRole(["admin"]), async (req, res) => {
  try {
    const bookingSchema = insertBookingSchema.extend({
      quoteRequestId: z.number()
    });
    
    const data = bookingSchema.parse(req.body);
    
    // Check if the quote exists and is in approved state
    const quote = await storage.getQuoteRequest(data.quoteRequestId);
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }
    
    if (quote.status !== "approved") {
      return res.status(400).json({ error: "Cannot create booking from unapproved quote" });
    }
    
    // Check if booking already exists for this quote
    const existingBooking = await storage.getBookingByQuoteRequestId(data.quoteRequestId);
    if (existingBooking) {
      return res.status(400).json({ error: "Booking already exists for this quote" });
    }
    
    // Generate booking reference
    const reference = `B-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Create booking
    const booking = await storage.createBooking({
      ...data,
      bookingReference: reference,
      assignedAdminId: req.user.id,
      userId: quote.userId || data.userId, // Use quote's userId if available
      clinicId: quote.selectedClinicId || data.clinicId, // Use quote's selected clinic if available
      status: "pending",
    });
    
    // Update quote status to "converted"
    await storage.updateQuoteRequest(data.quoteRequestId, { status: "converted" });
    
    // Create notifications
    if (quote.userId) {
      await storage.createNotification({
        userId: quote.userId,
        title: "Booking Created",
        message: `Your booking #${reference} has been created. Please check your bookings for details.`,
        type: "success",
        entityType: "booking",
        entityId: booking.id
      });
    }
    
    if (quote.selectedClinicId) {
      const clinicStaff = await storage.getAllUsers({
        role: "clinic_staff",
        clinicId: quote.selectedClinicId
      });
      
      for (const staff of clinicStaff) {
        await storage.createNotification({
          userId: staff.id,
          title: "New Booking",
          message: `A new booking #${reference} has been created for your clinic.`,
          type: "info",
          entityType: "booking",
          entityId: booking.id
        });
      }
    }
    
    return res.status(201).json({ booking });
  } catch (err) {
    return handleZodError(err, res);
  }
});

// =========================================
// MESSAGES ROUTES
// =========================================

// Get messages for a booking
router.get("/api/portal/bookings/:bookingId/messages", requireAuth, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Check permissions
    if (req.user.role === "patient" && booking.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    if (req.user.role === "clinic_staff" && booking.clinicId !== req.user.clinicId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const messages = await storage.getMessagesByBookingId(bookingId);
    return res.json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Send a message in a booking
router.post("/api/portal/bookings/:bookingId/messages", requireAuth, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Check permissions
    if (req.user.role === "patient" && booking.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    if (req.user.role === "clinic_staff" && booking.clinicId !== req.user.clinicId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const messageSchema = z.object({
      content: z.string().min(1),
      recipientId: z.number().optional(),
      attachmentId: z.number().optional(),
      messageType: z.string().optional()
    });
    
    const data = messageSchema.parse(req.body);
    
    // Determine the recipient based on sender role
    let recipientId = data.recipientId;
    
    if (!recipientId) {
      if (req.user.role === "patient") {
        // If patient is sending, determine if to admin or clinic
        recipientId = booking.assignedClinicStaffId || booking.assignedAdminId;
      } else if (req.user.role === "clinic_staff") {
        // If clinic is sending, message goes to patient
        recipientId = booking.userId;
      } else if (req.user.role === "admin") {
        // If admin is sending, message goes to patient by default
        recipientId = booking.userId;
      }
    }
    
    const message = await storage.createMessage({
      bookingId,
      senderId: req.user.id,
      recipientId,
      content: data.content,
      hasAttachment: !!data.attachmentId,
      attachmentId: data.attachmentId,
      messageType: data.messageType || "text"
    });
    
    // Create notification for recipient
    if (recipientId) {
      const sender = await storage.getUser(req.user.id);
      const senderName = sender ? (sender.firstName || sender.email) : req.user.role;
      
      await storage.createNotification({
        userId: recipientId,
        title: "New Message",
        message: `You have a new message from ${senderName}`,
        type: "info",
        entityType: "message",
        entityId: message.id
      });
    }
    
    return res.status(201).json({ message });
  } catch (err) {
    return handleZodError(err, res);
  }
});

// =========================================
// NOTIFICATION ROUTES
// =========================================

// Get user notifications
router.get("/api/portal/notifications", requireAuth, async (req, res) => {
  try {
    const unreadOnly = req.query.unreadOnly === "true";
    const notifications = await storage.getUserNotifications(req.user.id, unreadOnly);
    return res.json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Mark notification as read
router.post("/api/portal/notifications/:id/read", requireAuth, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    
    // Get the notification to check permissions
    const notifications = await storage.getUserNotifications(req.user.id);
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    await storage.markNotificationAsRead(notificationId);
    return res.sendStatus(204);
  } catch (err) {
    console.error("Error marking notification as read:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// =========================================
// APPOINTMENT ROUTES
// =========================================

// Get appointments for a booking
router.get("/api/portal/bookings/:bookingId/appointments", requireAuth, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Check permissions
    if (req.user.role === "patient" && booking.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    if (req.user.role === "clinic_staff" && booking.clinicId !== req.user.clinicId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const appointments = await storage.getAppointmentsByBookingId(bookingId);
    return res.json({ appointments });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Create appointment
router.post("/api/portal/bookings/:bookingId/appointments", requireRole(["admin", "clinic_staff"]), async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Validate clinic permissions for clinic staff
    if (req.user.role === "clinic_staff") {
      if (booking.clinicId !== req.user.clinicId) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    
    const appointmentSchema = z.object({
      title: z.string(),
      description: z.string().optional(),
      startTime: z.string().or(z.date()),
      endTime: z.string().or(z.date()),
      type: z.string().optional(),
      clinicNotes: z.string().optional(),
      adminNotes: z.string().optional(),
    });
    
    const data = appointmentSchema.parse(req.body);
    
    // Process date strings if needed
    const startTime = typeof data.startTime === 'string' ? new Date(data.startTime) : data.startTime;
    const endTime = typeof data.endTime === 'string' ? new Date(data.endTime) : data.endTime;
    
    // Create appointment
    const appointment = await storage.createAppointment({
      bookingId,
      title: data.title,
      description: data.description,
      startTime,
      endTime,
      type: data.type || "consultation",
      clinicNotes: data.clinicNotes,
      adminNotes: data.adminNotes,
      createdById: req.user.id,
      clinicId: booking.clinicId
    });
    
    // Create notification for patient
    await storage.createNotification({
      userId: booking.userId,
      title: "New Appointment",
      message: `A new appointment has been scheduled for ${startTime.toLocaleString()}`,
      type: "info",
      entityType: "appointment",
      entityId: appointment.id
    });
    
    return res.status(201).json({ appointment });
  } catch (err) {
    return handleZodError(err, res);
  }
});

// =========================================
// FILES ROUTES
// =========================================

// Get files for a booking
router.get("/api/portal/bookings/:bookingId/files", requireAuth, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Check permissions
    if (req.user.role === "patient" && booking.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    if (req.user.role === "clinic_staff" && booking.clinicId !== req.user.clinicId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const files = await storage.getFilesByBookingId(bookingId);
    
    // Filter files based on visibility and user role
    const visibleFiles = files.filter(file => {
      if (file.visibility === "public") return true;
      if (file.visibility === "private" && booking.userId === req.user.id) return true;
      if (file.visibility === "clinic_only" && req.user.role === "clinic_staff") return true;
      if (file.visibility === "admin_only" && req.user.role === "admin") return true;
      if (req.user.role === "admin") return true; // Admins can see all files
      return false;
    });
    
    return res.json({ files: visibleFiles });
  } catch (err) {
    console.error("Error fetching files:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;