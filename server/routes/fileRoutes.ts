import express, { Request, Response } from "express";
import { csrfProtection } from "../middleware/security";
import { ensureAuthenticated } from "../middleware/auth";

const router = express.Router();

// Placeholder route for file management
router.get("/list", csrfProtection, ensureAuthenticated, (req, res) => {
  res.json({
    success: true,
    message: "File list",
    files: []
  });
});

export default router;