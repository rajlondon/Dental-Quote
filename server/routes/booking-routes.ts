import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth-middleware";
import { ensureRole } from "../middleware/auth";
import { insertBookingSchema } from "@shared/schema";
import { randomUUID } from "crypto";

// Define status and stage types
type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
type BookingStage = "deposit" | "pre_travel" | "treatment" | "post_treatment" | "completed";

const router = Router();

// Schema for updating booking status
const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]),
});

// Schema for updating booking stage
const updateBookingStageSchema = z.object({
  stage: z.enum(["deposit", "pre_travel", "treatment", "post_treatment", "completed"]),
});

// Get all bookings (admin only)
router.get(
  "/",
  isAuthenticated,
  ensureRole(["admin"]),
  async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  }
);

// Get bookings for a specific user
router.get(
  "/user/:userId",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      
      // Only allow admins, clinic staff, or the user themselves to access their bookings
      if (
        req.user?.role !== "admin" &&
        req.user?.role !== "clinic_staff" &&
        req.user?.id !== userId
      ) {
        return res.status(403).json({
          message: "You don't have permission to access these bookings",
        });
      }
      
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  }
);

// Get bookings for a specific clinic (admin or clinic staff only)
router.get(
  "/clinic/:clinicId",
  isAuthenticated,
  ensureRole(["admin", "clinic_staff"]),
  async (req: Request, res: Response) => {
    try {
      const clinicId = Number(req.params.clinicId);
      
      // If clinic staff, ensure they can only see their own clinic's bookings
      if (req.user?.role === "clinic_staff" && req.user?.clinicId !== clinicId) {
        return res.status(403).json({
          message: "You don't have permission to access these bookings",
        });
      }
      
      const bookings = await storage.getClinicBookings(clinicId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching clinic bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  }
);

// Get a specific booking by ID
router.get(
  "/:id",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const bookingId = Number(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check access permissions
      if (
        req.user?.role !== "admin" &&
        (req.user?.role === "clinic_staff" && req.user?.clinicId !== booking.clinicId) &&
        req.user?.id !== booking.userId
      ) {
        return res.status(403).json({
          message: "You don't have permission to access this booking",
        });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  }
);

// Create a new booking
router.post(
  "/",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Generate a unique booking reference
      const bookingReference = `BK-${randomUUID().substring(0, 8)}`.toUpperCase();
      
      // Set the userId to the current user if not specified (and not admin)
      if (!bookingData.userId && req.user.role !== "admin") {
        bookingData.userId = req.user.id;
      }
      
      // If clinic staff, set clinicId to their clinic if not specified
      if (!bookingData.clinicId && req.user.role === "clinic_staff" && req.user.clinicId) {
        bookingData.clinicId = req.user.clinicId;
      }
      
      // Check permissions for creating bookings for other users
      if (
        bookingData.userId &&
        bookingData.userId !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message: "You don't have permission to create bookings for other users",
        });
      }
      
      // Check permissions for creating bookings for other clinics
      if (
        req.user.role === "clinic_staff" &&
        bookingData.clinicId && 
        bookingData.clinicId !== req.user.clinicId
      ) {
        return res.status(403).json({
          message: "You can only create bookings for your own clinic",
        });
      }
      
      const booking = await storage.createBooking({
        ...bookingData,
        bookingReference,
      });
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid booking data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  }
);

// Update a booking
router.patch(
  "/:id",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const bookingId = Number(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check permissions
      if (
        req.user.role !== "admin" &&
        (req.user.role === "clinic_staff" && req.user.clinicId !== booking.clinicId) &&
        req.user.id !== booking.userId
      ) {
        return res.status(403).json({
          message: "You don't have permission to update this booking",
        });
      }
      
      // Don't allow changing certain fields unless admin
      if (req.user.role !== "admin") {
        // Remove protected fields
        delete req.body.userId;
        delete req.body.clinicId;
        
        // Only admins and clinic staff can change status/stage
        if (req.user.role !== "clinic_staff") {
          delete req.body.status;
          delete req.body.stage;
        }
      }
      
      // Update the booking
      const updatedBooking = await storage.updateBooking(bookingId, req.body);
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid booking data",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to update booking" });
    }
  }
);

// Update booking status
router.patch(
  "/:id/status",
  isAuthenticated,
  ensureRole(["admin", "clinic_staff"]),
  async (req: Request, res: Response) => {
    try {
      const bookingId = Number(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check clinic staff permissions
      if (
        req.user.role === "clinic_staff" && 
        req.user.clinicId !== booking.clinicId
      ) {
        return res.status(403).json({
          message: "You don't have permission to update this booking",
        });
      }
      
      // Validate status
      const { status } = updateBookingStatusSchema.parse(req.body);
      
      // Update the booking status
      const updatedBooking = await storage.updateBookingStatus(bookingId, status as BookingStatus);
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid status",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to update booking status" });
    }
  }
);

// Update booking stage
router.patch(
  "/:id/stage",
  isAuthenticated,
  ensureRole(["admin", "clinic_staff"]),
  async (req: Request, res: Response) => {
    try {
      const bookingId = Number(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check clinic staff permissions
      if (
        req.user.role === "clinic_staff" && 
        req.user.clinicId !== booking.clinicId
      ) {
        return res.status(403).json({
          message: "You don't have permission to update this booking",
        });
      }
      
      // Validate stage
      const { stage } = updateBookingStageSchema.parse(req.body);
      
      // Update the booking stage
      const updatedBooking = await storage.updateBookingStage(bookingId, stage as BookingStage);
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking stage:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid stage",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Failed to update booking stage" });
    }
  }
);

// Delete a booking (admin only)
router.delete(
  "/:id",
  isAuthenticated,
  ensureRole(["admin"]),
  async (req: Request, res: Response) => {
    try {
      const bookingId = Number(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      await storage.deleteBooking(bookingId);
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  }
);

export default router;