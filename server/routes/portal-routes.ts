import express, { Router, Request, Response } from "express";
import { storage } from "../storage";
import { ensureAuthenticated, ensureRole, ensureOwnResources } from "../middleware/auth";
import { apiRateLimit, csrfProtection } from "../middleware/security";

const router = express.Router();

// Common routes - accessible to any authenticated user
router.get("/api/portal/user-profile", ensureAuthenticated, async (req, res) => {
  try {
    // User is already authenticated, so req.user should be available
    // We return user data without the password
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update user profile - ensure users can only update their own profile
router.post("/api/portal/update-profile", ensureAuthenticated, csrfProtection, async (req, res) => {
  try {
    const userId = req.user?.id;
    const updateData = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    // TODO: Implement update user profile in storage
    
    res.json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Admin routes
router.get("/api/portal/admin/users", ensureRole("admin"), async (req, res) => {
  try {
    // TODO: Implement get all users from storage
    
    res.json({
      success: true,
      message: "Admin users endpoint"
    });
  } catch (error) {
    console.error("Error in admin users endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

router.get("/api/portal/admin/dashboard", ensureRole("admin"), async (req, res) => {
  try {
    // TODO: Implement admin dashboard data retrieval
    
    res.json({
      success: true,
      message: "Admin dashboard data",
      stats: {
        totalUsers: 0,
        totalClinics: 0,
        totalQuotes: 0,
        recentBookings: []
      }
    });
  } catch (error) {
    console.error("Error in admin dashboard endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Clinic routes
router.get("/api/portal/clinic/dashboard", ensureRole("clinic_staff"), async (req, res) => {
  try {
    const clinicId = req.user?.clinicId;
    
    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: "Clinic ID not associated with user"
      });
    }
    
    // TODO: Implement clinic dashboard data retrieval
    
    res.json({
      success: true,
      message: "Clinic dashboard data",
      stats: {
        totalPatients: 0,
        upcomingAppointments: 0,
        quotesGenerated: 0,
        recentConsultations: []
      }
    });
  } catch (error) {
    console.error("Error in clinic dashboard endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get clinic dashboard data",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get clinic profile data
router.get("/api/portal/clinic/profile", ensureRole("clinic_staff"), async (req, res) => {
  try {
    const clinicId = req.user?.clinicId;
    
    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: "Clinic ID not associated with user"
      });
    }
    
    // TODO: Implement get clinic profile from storage
    
    res.json({
      success: true,
      message: "Clinic profile retrieved",
      clinicProfile: {
        id: clinicId,
        name: "Sample Clinic",
        location: "Istanbul",
        specialties: ["General Dentistry", "Cosmetic Dentistry"],
        contactInfo: {
          email: "clinic@example.com",
          phone: "+90 123 456 7890"
        }
      }
    });
  } catch (error) {
    console.error("Error getting clinic profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get clinic profile",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Generic dashboard endpoint for all user types
router.get("/api/portal/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    // Check the user role and route to the appropriate dashboard
    const userRole = req.user?.role;

    // If it's a clinic user, they should be using the clinic-specific endpoint
    if (userRole === 'clinic_staff') {
      return res.redirect(307, '/api/portal/clinic/dashboard');
    }
    
    // If it's an admin user, they should be using the admin-specific endpoint
    if (userRole === 'admin') {
      return res.redirect(307, '/api/portal/admin/dashboard');
    }
    
    // For patient users or others, return some basic stats
    res.json({
      success: true,
      message: "User dashboard data",
      stats: {
        pendingAppointments: 0,
        totalPatients: 0,
        activeQuotes: 0,
        monthlyRevenue: 0,
        upcomingAppointments: [],
        recentQuotes: []
      }
    });
  } catch (error) {
    console.error("Error in dashboard endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Portal route health check
router.get("/api/portal/health", ensureAuthenticated, (req, res) => {
  res.json({
    success: true,
    message: "Portal API is running",
    user: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role
    }
  });
});

export default router;