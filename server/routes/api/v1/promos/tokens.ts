import { Router } from "express";
import { promoService } from "../../../../services/promo-service";
import { ensureAuthenticated, ensureRole } from "../../../../middleware/auth";
import { z } from "zod";

const router = Router();

/**
 * Generate a promo token for a specific promo
 * POST /api/v1/promos/tokens
 * Admin access only
 */
router.post("/", ensureRole("admin"), async (req, res) => {
  try {
    const { promoId, source, email, userId, expireAt } = req.body;

    if (!promoId || !source) {
      return res.status(400).json({
        success: false,
        message: "PromoId and source are required fields"
      });
    }

    // Ensure either email or userId is provided
    if (!email && !userId) {
      return res.status(400).json({
        success: false,
        message: "Either email or userId must be provided"
      });
    }

    const token = await promoService.generatePromoToken(promoId, source, {
      email,
      userId,
      expireAt: expireAt ? new Date(expireAt) : undefined
    });

    res.status(201).json({
      success: true,
      data: token
    });
  } catch (error) {
    console.error("Failed to generate promo token:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to generate token"
    });
  }
});

/**
 * Validate a promo token
 * GET /api/v1/promos/tokens/validate/:token
 * Public access
 */
router.get("/validate/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const validToken = await promoService.validateToken(token);

    if (!validToken) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    // Get the associated promo details
    const promo = await promoService.getPromoById(validToken.promoId);

    res.json({
      success: true,
      data: {
        token: validToken,
        promo
      }
    });
  } catch (error) {
    console.error("Failed to validate token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate token"
    });
  }
});

/**
 * Mark a token as used
 * POST /api/v1/promos/tokens/:token/use
 * Authentication required
 */
router.post("/:token/use", ensureAuthenticated, async (req, res) => {
  try {
    const { token } = req.params;
    
    // First validate the token
    const validToken = await promoService.validateToken(token);

    if (!validToken) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    // Mark the token as used
    const marked = await promoService.markTokenAsUsed(token);

    if (!marked) {
      return res.status(500).json({
        success: false,
        message: "Failed to mark token as used"
      });
    }

    res.json({
      success: true,
      message: "Token successfully used"
    });
  } catch (error) {
    console.error("Failed to use token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to use token"
    });
  }
});

export default router;