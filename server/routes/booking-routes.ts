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
    
    // Format dates as ISO strings for database storage
    if (bookingData.arrivalDate) {
      // Convert to ISO string if date is provided
      const arrivalDate = new Date(bookingData.arrivalDate);
      bookingData.arrivalDate = arrivalDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    if (bookingData.departureDate) {
      // Convert to ISO string if date is provided
      const departureDate = new Date(bookingData.departureDate);
      bookingData.departureDate = departureDate.toISOString().split('T')[0]; // YYYY-MM-DD format
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
    
    // Format dates as ISO strings for database storage
    let modifiedData = { ...req.body };
    
    if (modifiedData.arrivalDate) {
      // Convert to ISO string if date is provided
      const arrivalDate = new Date(modifiedData.arrivalDate);
      modifiedData.arrivalDate = arrivalDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    if (modifiedData.departureDate) {
      // Convert to ISO string if date is provided
      const departureDate = new Date(modifiedData.departureDate);
      modifiedData.departureDate = departureDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    const updatedBooking = await storage.updateBooking(bookingId, modifiedData);
    
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
    const patientNotificationText = `Your booking ${existingBooking.bookingReference} has been cancelled.`;
    await storage.createNotification({
      userId: existingBooking.userId,
      title: "Booking Cancelled",
      message: patientNotificationText,
      content: patientNotificationText, // For backward compatibility
      type: "booking_update",
      action: `/bookings/${bookingId}`,
      entityType: "booking",
      entityId: bookingId,
      isRead: false
    });
    
    // Notify clinic if there's an assigned clinic staff
    if (existingBooking.assignedClinicStaffId) {
      const clinicNotificationText = `Booking ${existingBooking.bookingReference} has been cancelled.`;
      await storage.createNotification({
        userId: existingBooking.assignedClinicStaffId,
        title: "Booking Cancelled",
        message: clinicNotificationText,
        content: clinicNotificationText, // For backward compatibility
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

// Get appointments for a clinic by date
router.get("/appointments/clinic/:clinicId", isAuthenticated, async (req, res, next) => {
  try {
    const clinicId = parseInt(req.params.clinicId);
    const dateParam = req.query.date as string | undefined;
    
    if (isNaN(clinicId)) {
      throw new BadRequestError("Invalid clinic ID");
    }
    
    // Authorization check - clinic staff can only view their own clinic's appointments
    if (req.user!.role === "clinic_staff" && req.user!.clinicId !== clinicId) {
      throw new ForbiddenError("You can only view appointments for your clinic");
    }
    
    // Parse the date if provided
    let date: Date | undefined;
    if (dateParam) {
      date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        throw new BadRequestError("Invalid date format");
      }
    }
    
    const appointments = await storage.getAppointmentsByClinicId(clinicId, date);
    
    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error) {
    next(error);
  }
});

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
    
    // Store start and end times as Date objects
    const startTimeDate = new Date(appointmentData.startTime as string);
    const endTimeDate = new Date(appointmentData.endTime as string);
    
    // Create the appointment with proper date handling
    const appointmentToCreate = {
      ...appointmentData,
      startTime: startTimeDate,
      endTime: endTimeDate
    };
    
    const newAppointment = await storage.createAppointment(appointmentToCreate);
    
    // Create notification for the patient
    const notificationText = `An appointment has been scheduled for your dental treatment on ${new Date(appointmentData.startTime as string).toLocaleDateString()}.`;
    await storage.createNotification({
      userId: booking.userId,
      title: "New Appointment Scheduled",
      message: notificationText,
      content: notificationText, // For backward compatibility 
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
router.patch("/:bookingId/appointments/:appointmentId", isAuthenticated, async (req, res, next) => {
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
    
    // Handle date conversions for appointment updates
    let appointmentData = { ...req.body };
    
    if (appointmentData.startTime) {
      appointmentData.startTime = new Date(appointmentData.startTime);
    }
    if (appointmentData.endTime) {
      appointmentData.endTime = new Date(appointmentData.endTime);
    }
    
    const updatedAppointment = await storage.updateAppointment(appointmentId, appointmentData);
    
    // Create notification if appointment is rescheduled
    if (appointmentData.startTime || appointmentData.status) {
      const notificationContent = appointmentData.startTime
        ? `Your appointment on ${new Date(appointmentData.startTime).toLocaleDateString()} has been updated.`
        : `Your appointment status has been updated to ${appointmentData.status}.`;
      
      await storage.createNotification({
        userId: booking.userId,
        title: "Appointment Updated",
        message: notificationContent,
        content: notificationContent, // For backward compatibility
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