import express, { Request, Response } from "express";
import { csrfProtection } from "../middleware/security";
import { ensureAuthenticated } from "../middleware/auth";

const router = express.Router();

// Placeholder route for treatment plans
router.get("/list", csrfProtection, ensureAuthenticated, (req, res) => {
  res.json({
    success: true,
    message: "Treatment plans list",
    plans: []
  });
});

export default router;