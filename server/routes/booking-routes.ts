import express from "express";
import { isAuthenticated, isAdmin, isClinic, isPatient, isAdminOrClinic } from "../middleware/auth-middleware";
import { storage } from "../storage";

// Error classes for better error handling
class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}
import { createInsertSchema } from "drizzle-zod";
import { appointments, bookings } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";

const router = express.Router();

// Generate a unique booking reference
function generateBookingReference() {
  // Format: DF + first 8 chars of a UUID
  return `DF${uuidv4().split("-")[0].toUpperCase()}`;
}

// Get all bookings (admin only)
router.get("/", isAdmin, async (req, res, next) => {
  try {
    const allBookings = await storage.getAllBookings();
    res.json({
      success: true,
      data: { bookings: allBookings }
    });
  } catch (error) {
    next(error);
  }
});

// Get bookings for a user
router.get("/user/:userId", isAuthenticated, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      throw new BadRequestError("Invalid user ID");
    }
    
    // Authorization check: Admin can see all, users can only see their own
    if (req.user!.role !== "admin" && req.user!.id !== userId) {
      throw new ForbiddenError("You don't have permission to access these bookings");
    }
    
    const userBookings = await storage.getBookingsByUserId(userId);
    
    res.json({
      success: true,
      data: { bookings: userBookings }
    });
  } catch (error) {
    next(error);
  }
});

// Get bookings for a clinic
router.get("/clinic/:clinicId", isAuthenticated, async (req, res, next) => {
  try {
    const clinicId = parseInt(req.params.clinicId);
    
    if (isNaN(clinicId)) {
      throw new BadRequestError("Invalid clinic ID");
    }
    
    // Authorization check: Admin can see all, clinic staff can only see their clinic
    if (req.user!.role === "clinic_staff") {
      const user = await storage.getUser(req.user!.id);
      if (!user || user.clinicId !== clinicId) {
        throw new ForbiddenError("You don't have permission to access these bookings");
      }
    } else if (req.user!.role !== "admin") {
      throw new ForbiddenError("You don't have permission to access these bookings");
    }
    
    const clinicBookings = await storage.getBookingsByClinicId(clinicId);
    
    res.json({
      success: true,
      data: { bookings: clinicBookings }
    });
  } catch (error) {
    next(error);
  }
});

// Get a single booking by ID
router.get("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    if (isNaN(bookingId)) {
      throw new BadRequestError("Invalid booking ID");
    }
    
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }
    
    // Authorization check
    if (req.user!.role === "patient" && booking.userId !== req.user!.id) {
      throw new ForbiddenError("You don't have permission to access this booking");
    } else if (req.user!.role === "clinic_staff") {
      const user = await storage.getUser(req.user!.id);
      if (!user || user.clinicId !== booking.clinicId) {
        throw new ForbiddenError("You don't have permission to access this booking");
      }
    }
    
    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
});

// Create a new booking
const insertBookingSchema = createInsertSchema(bookings)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    arrivalDate: z.string().optional(),
    departureDate: z.string().optional()
  });

router.post("/", isAuthenticated, async (req, res, next) => {
  try {
    // Validate request body
    const bookingData = insertBookingSchema.parse(req.body);

    // Authorization check
    if (req.user!.role === "patient" && bookingData.userId !== req.user!.id) {
      throw new ForbiddenError("You can only create bookings for yourself");
    } else if (req.user!.role === "clinic_staff") {
      const user = await storage.getUser(req.user!.id);
      if (!user || user.clinicId !== bookingData.clinicId) {
        throw new ForbiddenError("You can only create bookings for your clinic");
      }
    }
    
    // Generate booking reference if not provided
    if (!bookingData.bookingReference) {
      bookingData.bookingReference = generateBookingReference();
    }
    
    // Convert date strings to Date objects
    if (bookingData.arrivalDate) {
      bookingData.arrivalDate = new Date(bookingData.arrivalDate);
    }
    if (bookingData.departureDate) {
      bookingData.departureDate = new Date(bookingData.departureDate);
    }
    
    const newBooking = await storage.createBooking(bookingData);
    
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: { booking: newBooking }
    });
  } catch (error) {
    next(error);
  }
});

// Update a booking
router.patch("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    if (isNaN(bookingId)) {
      throw new BadRequestError("Invalid booking ID");
    }
    
    const existingBooking = await storage.getBooking(bookingId);
    
    if (!existingBooking) {
      throw new NotFoundError("Booking not found");
    }
    
    // Authorization check
    if (req.user!.role === "patient" && existingBooking.userId !== req.user!.id) {
      throw new ForbiddenError("You don't have permission to update this booking");
    } else if (req.user!.role === "clinic_staff") {
      const user = await storage.getUser(req.user!.id);
      if (!user || user.clinicId !== existingBooking.clinicId) {
        throw new ForbiddenError("You don't have permission to update this booking");
      }
    }
    
    // Convert date strings to Date objects if provided
    if (req.body.arrivalDate) {
      req.body.arrivalDate = new Date(req.body.arrivalDate);
    }
    if (req.body.departureDate) {
      req.body.departureDate = new Date(req.body.departureDate);
    }
    
    const updatedBooking = await storage.updateBooking(bookingId, req.body);
    
    res.json({
      success: true,
      message: "Booking updated successfully",
      data: { booking: updatedBooking }
    });
  } catch (error) {
    next(error);
  }
});

// Cancel a booking
router.post("/:id/cancel", isAuthenticated, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    if (isNaN(bookingId)) {
      throw new BadRequestError("Invalid booking ID");
    }
    
    const existingBooking = await storage.getBooking(bookingId);
    
    if (!existingBooking) {
      throw new NotFoundError("Booking not found");
    }
    
    // Authorization check
    if (req.user!.role === "patient" && existingBooking.userId !== req.user!.id) {
      throw new ForbiddenError("You don't have permission to cancel this booking");
    } else if (req.user!.role === "clinic_staff") {
      const user = await storage.getUser(req.user!.id);
      if (!user || user.clinicId !== existingBooking.clinicId) {
        throw new ForbiddenError("You don't have permission to cancel this booking");
      }
    }
    
    // Update booking status to cancelled
    const updatedBooking = await storage.updateBooking(bookingId, {
      status: "cancelled",
    });
    
    // Cancel all associated appointments
    const appointments = await storage.getAppointmentsByBookingId(bookingId);
    for (const appointment of appointments) {
      await storage.updateAppointment(appointment.id, { status: "cancelled" });
    }
    
    // Create notification for patient and clinic
    await storage.createNotification({
      userId: existingBooking.userId,
      title: "Booking Cancelled",
      content: `Your booking ${existingBooking.bookingReference} has been cancelled.`,
      type: "booking_update",
      action: `/bookings/${bookingId}`,
      entityType: "booking",
      entityId: bookingId,
      isRead: false
    });
    
    // Notify clinic if there's an assigned clinic staff
    if (existingBooking.assignedClinicStaffId) {
      await storage.createNotification({
        userId: existingBooking.assignedClinicStaffId,
        title: "Booking Cancelled",
        content: `Booking ${existingBooking.bookingReference} has been cancelled.`,
        type: "booking_update",
        action: `/bookings/${bookingId}`,
        entityType: "booking",
        entityId: bookingId,
        isRead: false
      });
    }
    
    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: { booking: updatedBooking }
    });
  } catch (error) {
    next(error);
  }
});

// === APPOINTMENTS ROUTES ===

// Create an appointment for a booking
const insertAppointmentSchema = createInsertSchema(appointments)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    startTime: z.string(),
    endTime: z.string()
  });

router.post("/:id/appointments", isAuthenticated, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    if (isNaN(bookingId)) {
      throw new BadRequestError("Invalid booking ID");
    }
    
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }
    
    // Authorization check - only clinic staff and admin can create appointments
    if (req.user!.role === "clinic_staff") {
      const user = await storage.getUser(req.user!.id);
      if (!user || user.clinicId !== booking.clinicId) {
        throw new ForbiddenError("You can only create appointments for your clinic");
      }
    } else if (req.user!.role !== "admin") {
      throw new ForbiddenError("You don't have permission to create appointments");
    }
    
    // Validate request body
    const appointmentData = insertAppointmentSchema.parse(req.body);
    
    // Ensure the appointment is for the correct booking and clinic
    appointmentData.bookingId = bookingId;
    appointmentData.clinicId = booking.clinicId;
    
    // Set the creator of the appointment
    appointmentData.createdById = req.user!.id;
    
    // Convert date strings to Date objects
    appointmentData.startTime = new Date(appointmentData.startTime);
    appointmentData.endTime = new Date(appointmentData.endTime);
    
    const newAppointment = await storage.createAppointment(appointmentData);
    
    // Create notification for the patient
    await storage.createNotification({
      userId: booking.userId,
      title: "New Appointment Scheduled",
      content: `An appointment has been scheduled for your dental treatment on ${new Date(appointmentData.startTime).toLocaleDateString()}.`,
      type: "appointment",
      action: `/bookings/${bookingId}/appointments/${newAppointment.id}`,
      entityType: "appointment",
      entityId: newAppointment.id,
      isRead: false
    });
    
    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: { appointment: newAppointment }
    });
  } catch (error) {
    next(error);
  }
});

// Get all appointments for a booking
router.get("/:id/appointments", isAuthenticated, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    if (isNaN(bookingId)) {
      throw new BadRequestError("Invalid booking ID");
    }
    
    const booking = await storage.getBooking(bookingId);
    
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }
    
    // Authorization check
    if (req.user!.role === "patient" && booking.userId !== req.user!.id) {
      throw new ForbiddenError("You don't have permission to access these appointments");
    } else if (req.user!.role === "clinic_staff") {
      const user = await storage.getUser(req.user!.id);
      if (!user || user.clinicId !== booking.clinicId) {
        throw new ForbiddenError("You don't have permission to access these appointments");
      }
    }
    
    const appointments = await storage.getAppointmentsByBookingId(bookingId);
    
    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error) {
    next(error);
  }
});

// Update an appointment
router.patch("/:bookingId/appointments/:appointmentId", ensureAuthenticated, async (req, res, next) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const appointmentId = parseInt(req.params.appointmentId);
    
    if (isNaN(bookingId) || isNaN(appointmentId)) {
      throw new BadRequestError("Invalid booking or appointment ID");
    }
    
    const booking = await storage.getBooking(bookingId);
    const appointment = await storage.getAppointment(appointmentId);
    
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }
    
    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }
    
    if (appointment.bookingId !== bookingId) {
      throw new BadRequestError("Appointment doesn't belong to this booking");
    }
    
    // Authorization check - only clinic staff and admin can update appointments
    if (req.user!.role === "clinic_staff") {
      const user = await storage.getUser(req.user!.id);
      if (!user || user.clinicId !== booking.clinicId) {
        throw new ForbiddenError("You can only update appointments for your clinic");
      }
    } else if (req.user!.role !== "admin") {
      throw new ForbiddenError("You don't have permission to update appointments");
    }
    
    // Convert date strings to Date objects if provided
    if (req.body.startTime) {
      req.body.startTime = new Date(req.body.startTime);
    }
    if (req.body.endTime) {
      req.body.endTime = new Date(req.body.endTime);
    }
    
    const updatedAppointment = await storage.updateAppointment(appointmentId, req.body);
    
    // Create notification if appointment is rescheduled
    if (req.body.startTime || req.body.status) {
      const notificationContent = req.body.startTime
        ? `Your appointment on ${new Date(req.body.startTime).toLocaleDateString()} has been updated.`
        : `Your appointment status has been updated to ${req.body.status}.`;
      
      await storage.createNotification({
        userId: booking.userId,
        title: "Appointment Updated",
        content: notificationContent,
        type: "appointment_update",
        action: `/bookings/${bookingId}/appointments/${appointmentId}`,
        entityType: "appointment",
        entityId: appointmentId,
        isRead: false
      });
    }
    
    res.json({
      success: true,
      message: "Appointment updated successfully",
      data: { appointment: updatedAppointment }
    });
  } catch (error) {
    next(error);
  }
});

export default router;