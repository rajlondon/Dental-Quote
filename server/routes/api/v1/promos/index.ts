import { Router } from "express";
import { promoService } from "../../../../services/promo-service";
import { ensureAuthenticated, ensureRole } from "../../../../middleware/auth";
import { insertPromoSchema, insertPromoItemSchema, insertPromoClinicSchema } from "@shared/schema";
import { z } from "zod";
import tokenRoutes from "./tokens";
import validateRoutes from "./validate";

const router = Router();

// Mount token routes
router.use("/tokens", tokenRoutes);

// Mount validate route
router.use("/validate", validateRoutes);

/**
 * Create a new promo with items and clinic associations
 * POST /api/v1/promos
 * Admin access only
 */
router.post("/", ensureRole("admin"), async (req, res) => {
  try {
    // Validate the request body
    const promoData = insertPromoSchema.parse(req.body.promo);
    const promoItems = z.array(insertPromoItemSchema).parse(req.body.items || []);
    const promoClinics = z.array(insertPromoClinicSchema).parse(req.body.clinics || []);

    // Create the promo
    const newPromo = await promoService.createPromo(
      promoData,
      promoItems,
      promoClinics
    );

    res.status(201).json({
      success: true,
      data: newPromo
    });
  } catch (error) {
    console.error("Failed to create promo:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create promotion"
    });
  }
});

/**
 * Update an existing promo
 * PUT /api/v1/promos/:id
 * Admin access only
 */
router.put("/:id", ensureRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const promoData = req.body;

    const updatedPromo = await promoService.updatePromo(id, promoData);

    if (!updatedPromo) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found"
      });
    }

    res.json({
      success: true,
      data: updatedPromo
    });
  } catch (error) {
    console.error("Failed to update promo:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update promotion"
    });
  }
});

/**
 * Delete a promo
 * DELETE /api/v1/promos/:id
 * Admin access only
 */
router.delete("/:id", ensureRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await promoService.deletePromo(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found"
      });
    }

    res.json({
      success: true,
      message: "Promotion successfully deleted"
    });
  } catch (error) {
    console.error("Failed to delete promo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete promotion"
    });
  }
});

/**
 * Get a promo by ID
 * GET /api/v1/promos/:id
 * Public access
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await promoService.getPromoById(id);

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found"
      });
    }

    res.json({
      success: true,
      data: promo
    });
  } catch (error) {
    console.error("Failed to get promo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve promotion"
    });
  }
});

/**
 * Get a promo by slug
 * GET /api/v1/promos/by-slug/:slug
 * Public access
 */
router.get("/by-slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const promo = await promoService.getPromoBySlug(slug);

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found"
      });
    }

    res.json({
      success: true,
      data: promo
    });
  } catch (error) {
    console.error("Failed to get promo by slug:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve promotion"
    });
  }
});

/**
 * Get all active promos
 * GET /api/v1/promos?page=1&limit=10
 * Public access
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const promos = await promoService.getActivePromos(page, limit);

    res.json({
      success: true,
      data: promos
    });
  } catch (error) {
    console.error("Failed to get active promos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve promotions"
    });
  }
});

/**
 * Get promos by clinic ID
 * GET /api/v1/promos/by-clinic/:clinicId
 * Public access
 */
router.get("/by-clinic/:clinicId", async (req, res) => {
  try {
    const { clinicId } = req.params;
    const promos = await promoService.getPromosByClinic(clinicId);

    res.json({
      success: true,
      data: promos
    });
  } catch (error) {
    console.error("Failed to get promos by clinic:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve promotions for clinic"
    });
  }
});

/**
 * Add items to a promo
 * POST /api/v1/promos/:id/items
 * Admin access only
 */
router.post("/:id/items", ensureRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const items = z.array(insertPromoItemSchema).parse(req.body);

    const newItems = await promoService.addPromoItems(id, items);

    res.status(201).json({
      success: true,
      data: newItems
    });
  } catch (error) {
    console.error("Failed to add promo items:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to add items to promotion"
    });
  }
});

/**
 * Remove items from a promo
 * DELETE /api/v1/promos/:id/items
 * Admin access only
 */
router.delete("/:id/items", ensureRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { itemIds } = req.body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Item IDs must be provided as an array"
      });
    }

    const deleted = await promoService.removePromoItems(id, itemIds);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Items not found or already removed"
      });
    }

    res.json({
      success: true,
      message: "Items successfully removed from promotion"
    });
  } catch (error) {
    console.error("Failed to remove promo items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove items from promotion"
    });
  }
});

/**
 * Add clinics to a promo
 * POST /api/v1/promos/:id/clinics
 * Admin access only
 */
router.post("/:id/clinics", ensureRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { clinicIds } = req.body;

    if (!Array.isArray(clinicIds) || clinicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Clinic IDs must be provided as an array"
      });
    }

    const newClinics = await promoService.addPromoClinics(id, clinicIds);

    res.status(201).json({
      success: true,
      data: newClinics
    });
  } catch (error) {
    console.error("Failed to add promo clinics:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to add clinics to promotion"
    });
  }
});

/**
 * Remove clinics from a promo
 * DELETE /api/v1/promos/:id/clinics
 * Admin access only
 */
router.delete("/:id/clinics", ensureRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { clinicIds } = req.body;

    if (!Array.isArray(clinicIds) || clinicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Clinic IDs must be provided as an array"
      });
    }

    const deleted = await promoService.removePromoClinics(id, clinicIds);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Clinics not found or already removed"
      });
    }

    res.json({
      success: true,
      message: "Clinics successfully removed from promotion"
    });
  } catch (error) {
    console.error("Failed to remove promo clinics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove clinics from promotion"
    });
  }
});

export default router;