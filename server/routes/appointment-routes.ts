import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth-middleware";
import { ensureRole } from "../middleware/auth";

const router = Router();

// Schema for appointment creation
const createAppointmentSchema = z.object({
  bookingId: z.number().optional(),
  clinicId: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().transform(val => new Date(val)), // Convert ISO string to Date
  endTime: z.string().transform(val => new Date(val)), // Convert ISO string to Date
  type: z.string(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "missed"]),
  clinicNotes: z.string().optional(),
  adminNotes: z.string().optional(),
  reminderSent: z.boolean().optional().default(false),
  followUpRequired: z.boolean().optional().default(false),
});

// Schema for appointment updates
const updateAppointmentSchema = createAppointmentSchema.partial();

// Get all appointments for a booking
router.get(
  "/booking/:bookingId/appointments",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const bookingId = Number(req.params.bookingId);
      
      // Check if booking exists
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ 
          success: false,
          message: "Booking not found" 
        });
      }
      
      // Check access permissions
      if (
        req.user?.role !== "admin" &&
        (req.user?.role === "clinic_staff" && req.user?.clinicId !== booking.clinicId) &&
        req.user?.id !== booking.userId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to access this booking's appointments"
        });
      }
      
      const appointments = await storage.getBookingAppointments(bookingId);
      
      return res.json({
        success: true,
        data: {
          appointments
        }
      });
    } catch (error) {
      console.error("Error fetching booking appointments:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to fetch appointments" 
      });
    }
  }
);

// Get appointments for a clinic with date filter
router.get(
  "/appointments/clinic/:clinicId",
  isAuthenticated,
  ensureRole(["admin", "clinic_staff"]),
  async (req: Request, res: Response) => {
    try {
      const clinicId = Number(req.params.clinicId);
      const dateFilter = req.query.date as string; // Format: YYYY-MM-DD
      
      // If clinic staff, ensure they can only see their own clinic's appointments
      if (req.user?.role === "clinic_staff" && req.user?.clinicId !== clinicId) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to access these appointments"
        });
      }
      
      const appointments = await storage.getClinicAppointments(clinicId, dateFilter);
      
      return res.json({
        success: true,
        data: {
          appointments
        }
      });
    } catch (error) {
      console.error("Error fetching clinic appointments:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to fetch appointments" 
      });
    }
  }
);

// Create a new appointment for a booking
router.post(
  "/booking/:bookingId/appointments",
  isAuthenticated,
  ensureRole(["admin", "clinic_staff"]),
  async (req: Request, res: Response) => {
    try {
      const bookingId = Number(req.params.bookingId);
      
      // Check if booking exists
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ 
          success: false,
          message: "Booking not found" 
        });
      }
      
      // If clinic staff, ensure they can only create appointments for their own clinic
      if (
        req.user?.role === "clinic_staff" && 
        req.user?.clinicId !== booking.clinicId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to create appointments for this booking"
        });
      }
      
      const appointmentData = createAppointmentSchema.parse({
        ...req.body,
        bookingId
      });
      
      // Ensure dates are properly formatted
      const formattedAppointmentData = {
        ...appointmentData,
        startTime: new Date(appointmentData.startTime),
        endTime: new Date(appointmentData.endTime),
        createdById: req.user?.id || 0
      };
      
      const appointment = await storage.createAppointment(formattedAppointmentData);
      
      return res.status(201).json({
        success: true,
        data: {
          appointment
        }
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment data",
          errors: error.errors
        });
      }
      return res.status(500).json({ 
        success: false,
        message: "Failed to create appointment" 
      });
    }
  }
);

// Create a clinic appointment (not tied to a booking)
router.post(
  "/appointments/clinic/:clinicId",
  isAuthenticated,
  ensureRole(["admin", "clinic_staff"]),
  async (req: Request, res: Response) => {
    try {
      const clinicId = Number(req.params.clinicId);
      
      // If clinic staff, ensure they can only create appointments for their own clinic
      if (
        req.user?.role === "clinic_staff" && 
        req.user?.clinicId !== clinicId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to create appointments for this clinic"
        });
      }
      
      const appointmentData = createAppointmentSchema.parse({
        ...req.body,
        clinicId
      });
      
      // Ensure dates are properly formatted
      const formattedAppointmentData = {
        ...appointmentData,
        startTime: new Date(appointmentData.startTime),
        endTime: new Date(appointmentData.endTime),
        createdById: req.user?.id || 0
      };
      
      const appointment = await storage.createAppointment(formattedAppointmentData);
      
      return res.status(201).json({
        success: true,
        data: {
          appointment
        }
      });
    } catch (error) {
      console.error("Error creating clinic appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment data",
          errors: error.errors
        });
      }
      return res.status(500).json({ 
        success: false,
        message: "Failed to create appointment" 
      });
    }
  }
);

// Update an appointment
router.patch(
  "/booking/:bookingId/appointments/:appointmentId",
  isAuthenticated,
  ensureRole(["admin", "clinic_staff"]),
  async (req: Request, res: Response) => {
    try {
      const bookingId = Number(req.params.bookingId);
      const appointmentId = Number(req.params.appointmentId);
      
      // Check if booking exists
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ 
          success: false,
          message: "Booking not found" 
        });
      }
      
      // Check if appointment exists
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ 
          success: false,
          message: "Appointment not found" 
        });
      }
      
      // Check if appointment belongs to this booking
      if (appointment.bookingId !== bookingId) {
        return res.status(400).json({ 
          success: false,
          message: "Appointment does not belong to this booking" 
        });
      }
      
      // If clinic staff, ensure they can only update appointments for their own clinic
      if (
        req.user?.role === "clinic_staff" && 
        req.user?.clinicId !== booking.clinicId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to update appointments for this booking"
        });
      }
      
      const updateData = updateAppointmentSchema.parse(req.body);
      
      // Handle date formatting for updates if date fields are present
      const formattedUpdateData = { ...updateData };
      if (formattedUpdateData.startTime) {
        formattedUpdateData.startTime = new Date(formattedUpdateData.startTime);
      }
      if (formattedUpdateData.endTime) {
        formattedUpdateData.endTime = new Date(formattedUpdateData.endTime);
      }
      
      const updatedAppointment = await storage.updateAppointment(appointmentId, formattedUpdateData);
      
      return res.json({
        success: true,
        data: {
          appointment: updatedAppointment
        }
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment data",
          errors: error.errors
        });
      }
      return res.status(500).json({ 
        success: false,
        message: "Failed to update appointment" 
      });
    }
  }
);

// Delete an appointment (admin only)
router.delete(
  "/booking/:bookingId/appointments/:appointmentId",
  isAuthenticated,
  ensureRole(["admin"]),
  async (req: Request, res: Response) => {
    try {
      const appointmentId = Number(req.params.appointmentId);
      
      // Check if appointment exists
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ 
          success: false,
          message: "Appointment not found" 
        });
      }
      
      await storage.deleteAppointment(appointmentId);
      
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to delete appointment" 
      });
    }
  }
);

export default router;