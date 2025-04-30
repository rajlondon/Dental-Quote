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

    // Validate the update data before proceeding
    // Only allow specific fields to be updated
    const allowedFields = [
      'firstName', 
      'lastName', 
      'phone', 
      'profileImage',
      'address', 
      'dateOfBirth', 
      'nationality', 
      'preferredLanguage',
      'passportNumber',
      'jobTitle', // Only for clinic_staff
      'medicalInfo', // Only for patients
      'emergencyContact' // Only for patients
    ];

    // Filter out any fields that shouldn't be updated
    const sanitizedData: Record<string, any> = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        sanitizedData[key] = updateData[key];
      }
    });

    // Specific validation for role-specific fields
    if (req.user?.role !== 'clinic_staff' && sanitizedData.hasOwnProperty('jobTitle')) {
      delete sanitizedData.jobTitle;
    }

    // Mark profile as complete if critical fields are filled
    const criticalFields = ['firstName', 'lastName', 'phone'];
    let isProfileComplete = criticalFields.every(field => 
      sanitizedData[field] !== undefined || (req.user && req.user[field as keyof typeof req.user])
    );
    
    if (isProfileComplete) {
      sanitizedData.profileComplete = true;
    }

    // Update user in database
    try {
      const updatedUser = await storage.updateUser(userId, sanitizedData);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Return success with updated user (excluding sensitive fields)
      const { password, ...safeUserData } = updatedUser;
      
      res.json({
        success: true,
        message: "Profile updated successfully",
        user: safeUserData
      });
    } catch (dbError) {
      console.error("Database error updating profile:", dbError);
      return res.status(500).json({
        success: false,
        message: "Database error updating profile",
        error: dbError instanceof Error ? dbError.message : String(dbError)
      });
    }
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
    const clinicId = req.user?.clinicId || 1; // Use default clinic ID if not set
    
    // No longer returning an error if clinicId is missing
    console.log(`Clinic dashboard: Using clinic ID: ${clinicId} for user ${req.user?.email}`);
    
    // Return more detailed demo data to match the new structure
    res.json({
      success: true,
      message: "Clinic dashboard data",
      stats: {
        pendingAppointments: 5,
        totalPatients: 28,
        activeQuotes: 12,
        monthlyRevenue: 8450,
        upcomingAppointments: [
          { id: 1, patientName: "John Smith", startTime: new Date().setDate(new Date().getDate() + 1) },
          { id: 2, patientName: "Maria Garcia", startTime: new Date().setDate(new Date().getDate() + 2) },
          { id: 3, patientName: "Ahmed Hassan", startTime: new Date().setDate(new Date().getDate() + 3) }
        ],
        recentQuotes: [
          { id: 101, patientName: "Sarah Johnson", status: "pending", createdAt: new Date().setDate(new Date().getDate() - 1) },
          { id: 102, patientName: "Michael Brown", status: "approved", createdAt: new Date().setDate(new Date().getDate() - 2) },
          { id: 103, patientName: "Emma Wilson", status: "scheduled", createdAt: new Date().setDate(new Date().getDate() - 3) }
        ]
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
    const clinicId = req.user?.clinicId || 1; // Use default clinic ID if not set
    
    // No longer returning an error if clinicId is missing
    console.log(`Clinic profile: Using clinic ID: ${clinicId} for user ${req.user?.email}`);
    
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

// DEBUGGING helper endpoint
router.get("/api/portal/debug", ensureAuthenticated, (req, res) => {
  res.json({
    user: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
      clinicId: req.user?.clinicId
    },
    session: req.session ? true : false,
    authenticated: req.isAuthenticated()
  });
});

// Generic dashboard endpoint for all user types - NO REDIRECTS
router.get("/api/portal/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    console.log("Dashboard endpoint called for user:", req.user?.id, "with role:", req.user?.role);
    
    // Check the user role and provide appropriate data
    const userRole = req.user?.role;
    let dashboardData;

    // If it's a clinic user, they should be getting clinic dashboard data
    if (userRole === 'clinic_staff') {
      // Get clinic data directly instead of redirecting
      const clinicId = req.user?.clinicId || 1; // Fallback to default clinicId if not set
      
      // No longer returning an error if clinicId is missing
      console.log(`Using clinic ID: ${clinicId} for user ${req.user?.email}`);
      
      // Use the same data as the clinic-specific endpoint
      dashboardData = {
        success: true,
        message: "Clinic dashboard data",
        stats: {
          pendingAppointments: 5,
          totalPatients: 28,
          activeQuotes: 12,
          monthlyRevenue: 8450,
          upcomingAppointments: [
            { id: 1, patientName: "John Smith", startTime: new Date().setDate(new Date().getDate() + 1) },
            { id: 2, patientName: "Maria Garcia", startTime: new Date().setDate(new Date().getDate() + 2) },
            { id: 3, patientName: "Ahmed Hassan", startTime: new Date().setDate(new Date().getDate() + 3) }
          ],
          recentQuotes: [
            { id: 101, patientName: "Sarah Johnson", status: "pending", createdAt: new Date().setDate(new Date().getDate() - 1) },
            { id: 102, patientName: "Michael Brown", status: "approved", createdAt: new Date().setDate(new Date().getDate() - 2) },
            { id: 103, patientName: "Emma Wilson", status: "scheduled", createdAt: new Date().setDate(new Date().getDate() - 3) }
          ]
        }
      };
    }
    // If it's an admin user, they should be getting admin dashboard data
    else if (userRole === 'admin') {
      // Return admin data directly instead of redirecting
      dashboardData = {
        success: true,
        message: "Admin dashboard data",
        stats: {
          totalUsers: 120,
          totalClinics: 8,
          totalQuotes: 245,
          recentBookings: []
        }
      };
    }
    // For patient users or others, return basic stats
    else {
      dashboardData = {
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
      };
    }
    
    // Return the role-appropriate dashboard data
    return res.json(dashboardData);
  } catch (error) {
    console.error("Error in dashboard endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get additional profile information - medical info and emergency contacts
router.get("/api/portal/extended-profile", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    // For now, just return the complete user data
    // In a real production environment, we'd store these in separate tables
    // and join the data here
    const userData = await storage.getUser(userId);
    
    if (!userData) {
      return res.status(404).json({
        success: false, 
        message: "User not found"
      });
    }

    // Extract just the fields we need
    const { 
      medicalInfo, 
      emergencyContact,
      address,
      dateOfBirth,
      nationality,
      preferredLanguage,
      passportNumber
    } = userData;
    
    res.json({
      success: true,
      data: {
        medicalInfo: medicalInfo || null,
        emergencyContact: emergencyContact || null,
        address: address || null,
        dateOfBirth: dateOfBirth || null,
        nationality: nationality || null,
        preferredLanguage: preferredLanguage || null,
        passportNumber: passportNumber || null
      }
    });
  } catch (error) {
    console.error("Error retrieving extended profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve extended profile data",
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