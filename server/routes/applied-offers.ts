import { Router } from "express";
import { db } from "../db";
import { appliedSpecialOffers, specialOffers, treatmentPlans, users, clinics } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";
import { v4 as uuidv4 } from "uuid";

export const appliedOffersRouter = Router();

// Create a new applied offer
appliedOffersRouter.post("/", isAuthenticated, async (req, res) => {
  try {
    const {
      specialOfferId,
      treatmentPlanId,
      patientId,
      clinicId,
      discountType,
      discountValue,
      originalPrice,
      discountedPrice,
      currency = "GBP",
      appliedToTreatments,
      originatingPage,
    } = req.body;

    // Validate inputs
    if (!specialOfferId || !treatmentPlanId || !patientId || !clinicId || !discountType || discountValue === undefined || !originalPrice || !discountedPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if offer exists
    const [offer] = await db
      .select()
      .from(specialOffers)
      .where(eq(specialOffers.id, specialOfferId));

    if (!offer) {
      return res.status(404).json({ message: "Special offer not found" });
    }

    // Check if treatment plan exists
    const [plan] = await db
      .select()
      .from(treatmentPlans)
      .where(eq(treatmentPlans.id, treatmentPlanId));

    if (!plan) {
      return res.status(404).json({ message: "Treatment plan not found" });
    }

    // Create the applied offer record
    const [appliedOffer] = await db
      .insert(appliedSpecialOffers)
      .values({
        id: uuidv4(),
        specialOfferId,
        treatmentPlanId,
        patientId,
        clinicId,
        discountType,
        discountValue,
        originalPrice,
        discountedPrice,
        currency,
        appliedToTreatments,
        originatingPage,
        appliedAt: new Date(),
        usageStatus: "active",
      })
      .returning();

    res.status(201).json(appliedOffer);
  } catch (error) {
    console.error("Error creating applied offer:", error);
    res.status(500).json({ message: "Failed to create applied offer" });
  }
});

// Get all applied offers for a treatment plan
appliedOffersRouter.get("/treatment/:treatmentPlanId", isAuthenticated, async (req, res) => {
  try {
    const { treatmentPlanId } = req.params;
    
    const appliedOffersList = await db
      .select({
        appliedOffer: appliedSpecialOffers,
        offer: specialOffers,
        patient: users,
        clinic: clinics,
      })
      .from(appliedSpecialOffers)
      .leftJoin(specialOffers, eq(appliedSpecialOffers.specialOfferId, specialOffers.id))
      .leftJoin(users, eq(appliedSpecialOffers.patientId, users.id))
      .leftJoin(clinics, eq(appliedSpecialOffers.clinicId, clinics.id))
      .where(eq(appliedSpecialOffers.treatmentPlanId, parseInt(treatmentPlanId)));

    // Transform the result to a more usable format
    const result = appliedOffersList.map(item => ({
      ...item.appliedOffer,
      offer: item.offer,
      patient: item.patient ? {
        id: item.patient.id,
        firstName: item.patient.firstName,
        lastName: item.patient.lastName,
        email: item.patient.email,
      } : null,
      clinic: item.clinic ? {
        id: item.clinic.id,
        name: item.clinic.name,
        city: item.clinic.city,
      } : null,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching applied offers:", error);
    res.status(500).json({ message: "Failed to fetch applied offers" });
  }
});

// Get a specific applied offer
appliedOffersRouter.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [appliedOffer] = await db
      .select()
      .from(appliedSpecialOffers)
      .where(eq(appliedSpecialOffers.id, id));

    if (!appliedOffer) {
      return res.status(404).json({ message: "Applied offer not found" });
    }

    res.status(200).json(appliedOffer);
  } catch (error) {
    console.error("Error fetching applied offer:", error);
    res.status(500).json({ message: "Failed to fetch applied offer" });
  }
});

// Update status of an applied offer
appliedOffersRouter.patch("/:id/status", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { usageStatus } = req.body;

    if (!usageStatus) {
      return res.status(400).json({ message: "Missing status" });
    }

    const [updatedOffer] = await db
      .update(appliedSpecialOffers)
      .set({ usageStatus })
      .where(eq(appliedSpecialOffers.id, id))
      .returning();

    if (!updatedOffer) {
      return res.status(404).json({ message: "Applied offer not found" });
    }

    res.status(200).json(updatedOffer);
  } catch (error) {
    console.error("Error updating applied offer status:", error);
    res.status(500).json({ message: "Failed to update applied offer status" });
  }
});

// Mark an applied offer as converted to booking
appliedOffersRouter.patch("/:id/convert", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingId, convertedToBooking = true } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Missing booking ID" });
    }

    const [updatedOffer] = await db
      .update(appliedSpecialOffers)
      .set({ 
        convertedToBooking,
        bookingId,
      })
      .where(eq(appliedSpecialOffers.id, id))
      .returning();

    if (!updatedOffer) {
      return res.status(404).json({ message: "Applied offer not found" });
    }

    res.status(200).json(updatedOffer);
  } catch (error) {
    console.error("Error converting applied offer:", error);
    res.status(500).json({ message: "Failed to convert applied offer" });
  }
});

// Get applied offers by clinic
appliedOffersRouter.get("/clinic/:clinicId", isAuthenticated, async (req, res) => {
  try {
    const { clinicId } = req.params;
    
    const appliedOffers = await db
      .select()
      .from(appliedSpecialOffers)
      .where(eq(appliedSpecialOffers.clinicId, parseInt(clinicId)));

    res.status(200).json(appliedOffers);
  } catch (error) {
    console.error("Error fetching applied offers by clinic:", error);
    res.status(500).json({ message: "Failed to fetch applied offers" });
  }
});

// Get all active applied offers for a patient
appliedOffersRouter.get("/patient/:patientId/active", isAuthenticated, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const appliedOffers = await db
      .select()
      .from(appliedSpecialOffers)
      .where(
        and(
          eq(appliedSpecialOffers.patientId, parseInt(patientId)),
          eq(appliedSpecialOffers.usageStatus, "active")
        )
      );

    res.status(200).json(appliedOffers);
  } catch (error) {
    console.error("Error fetching active applied offers:", error);
    res.status(500).json({ message: "Failed to fetch active applied offers" });
  }
});