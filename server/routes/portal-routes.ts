import express, { Request, Response } from "express";
import { csrfProtection } from "../middleware/security";

const router = express.Router();

// Admin portal routes
router.get("/api/portal/admin/dashboard", csrfProtection, (req, res) => {
  res.json({
    success: true,
    message: "Admin dashboard data",
    user: req.user,
    stats: {
      totalUsers: 123,
      totalClinics: 8,
      pendingAppointments: 15,
      totalQuotes: 456
    }
  });
});

// Clinic portal routes
router.get("/api/portal/clinic/dashboard", csrfProtection, (req, res) => {
  const user = req.user as Express.User;
  const clinicId = user.clinicId;
  
  res.json({
    success: true,
    message: "Clinic dashboard data",
    user: req.user,
    clinicId,
    stats: {
      pendingAppointments: 5,
      completedTreatments: 23,
      currentPatients: 12,
      totalRevenue: "£38,500"
    }
  });
});

// Client portal routes (open to any authenticated user)
router.get("/api/portal/client/dashboard", csrfProtection, (req, res) => {
  res.json({
    success: true,
    message: "Client dashboard data",
    user: req.user,
    appointments: [],
    quotes: [],
    messages: []
  });
});

export default router;