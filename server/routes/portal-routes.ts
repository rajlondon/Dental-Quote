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
        // Handle mapping of camelCase field names to snake_case DB columns
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        
        // Special handling for JSON fields
        if (key === 'medicalInfo') {
          sanitizedData['medical_info'] = updateData[key];
        } else if (key === 'emergencyContact') {
          sanitizedData['emergency_contact'] = updateData[key];
        } else if (key === 'dateOfBirth') {
          sanitizedData['date_of_birth'] = updateData[key];
        } else if (key === 'preferredLanguage') {
          sanitizedData['preferred_language'] = updateData[key];
        } else if (key === 'passportNumber') {
          sanitizedData['passport_number'] = updateData[key];
        } else if (key === 'profileImage') {
          sanitizedData['profile_image'] = updateData[key];
        } else {
          // For fields that don't need special handling
          sanitizedData[dbKey] = updateData[key];
        }
      }
    });

    // Specific validation for role-specific fields
    if (req.user?.role !== 'clinic_staff' && sanitizedData.hasOwnProperty('jobTitle')) {
      delete sanitizedData.jobTitle;
    }

    // Mark profile as complete if critical fields are filled
    // Map to database field names
    const criticalFieldsMapping = {
      'firstName': 'first_name', 
      'lastName': 'last_name', 
      'phone': 'phone'
    };
    
    // Check if critical fields are present in sanitized data or in existing user data
    let isProfileComplete = Object.entries(criticalFieldsMapping).every(([fieldName, dbField]) => {
      // Check if field is in our sanitized data
      if (sanitizedData[dbField] !== undefined) {
        return true;
      }
      
      // If not in sanitized data, check existing user data
      const user_any = req.user as any;
      return user_any && user_any[fieldName] !== null && user_any[fieldName] !== undefined;
    });
    
    if (isProfileComplete) {
      sanitizedData['profile_complete'] = true;
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

    // Extract just the fields we need, handling potentially missing fields
    // TypeScript doesn't know about our new fields, so we need to use type assertions
    const userData_any = userData as any;
    
    const medicalInfo = userData_any.medical_info || null;
    const emergencyContact = userData_any.emergency_contact || null;
    const address = userData_any.address || null;
    const dateOfBirth = userData_any.date_of_birth || null;
    const nationality = userData_any.nationality || null;
    const preferredLanguage = userData_any.preferred_language || null;
    const passportNumber = userData_any.passport_number || null;
    
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

// Patients endpoints for clinics
// Get patients list
router.get("/api/clinic/patients", ensureRole("clinic_staff"), async (req, res) => {
  try {
    const clinicId = req.user?.clinicId || 1;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || 'all';
    
    // Calculate pagination values
    const skip = (page - 1) * limit;
    
    console.log(`Retrieving patients for clinic ${clinicId}, page ${page}, limit ${limit}, search "${search}", status "${status}"`);
    
    // Mock data with pagination support
    const allPatients = [
      {
        id: 1,
        name: "James Wilson",
        email: "james.wilson@example.com",
        phone: "+44 7700 900123",
        treatment: "Dental Implants",
        status: "Active",
        lastVisit: "2025-03-10"
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "+44 7700 900456",
        treatment: "Veneers",
        status: "Completed",
        lastVisit: "2025-04-05"
      },
      {
        id: 3,
        name: "Michael Brown",
        email: "m.brown@example.com",
        phone: "+44 7700 900789",
        treatment: "Crowns",
        status: "Scheduled",
        lastVisit: "2025-02-25"
      },
      {
        id: 4,
        name: "Emma Davis",
        email: "e.davis@example.com",
        phone: "+44 7700 900555",
        treatment: "Root Canal",
        status: "Active",
        lastVisit: "2025-03-18"
      },
      {
        id: 5,
        name: "Robert Taylor",
        email: "r.taylor@example.com",
        phone: "+44 7700 900222",
        treatment: "Full Mouth Restoration",
        status: "New Patient",
        lastVisit: null
      },
      {
        id: 6,
        name: "Jennifer Lewis",
        email: "j.lewis@example.com",
        phone: "+44 7700 900333",
        treatment: "Teeth Whitening",
        status: "Completed",
        lastVisit: "2025-04-15"
      },
      {
        id: 7,
        name: "William Clark",
        email: "w.clark@example.com",
        phone: "+44 7700 900444",
        treatment: "Orthodontics",
        status: "Active",
        lastVisit: "2025-03-28"
      },
      {
        id: 8,
        name: "Olivia Martinez",
        email: "o.martinez@example.com",
        phone: "+44 7700 900666",
        treatment: "Dental Implants",
        status: "Scheduled",
        lastVisit: "2025-04-02"
      },
      {
        id: 9,
        name: "Thomas Anderson",
        email: "t.anderson@example.com",
        phone: "+44 7700 900777",
        treatment: "Crowns",
        status: "Active",
        lastVisit: "2025-03-22"
      },
      {
        id: 10,
        name: "Sophia White",
        email: "s.white@example.com",
        phone: "+44 7700 900888",
        treatment: "Veneers",
        status: "Completed",
        lastVisit: "2025-04-11"
      },
      {
        id: 11,
        name: "Daniel Harris",
        email: "d.harris@example.com",
        phone: "+44 7700 900999",
        treatment: "Root Canal",
        status: "Scheduled",
        lastVisit: "2025-04-20"
      },
      {
        id: 12,
        name: "Ava Thompson",
        email: "a.thompson@example.com",
        phone: "+44 7700 901000",
        treatment: "Teeth Cleaning",
        status: "New Patient",
        lastVisit: null
      },
      {
        id: 13,
        name: "James Garcia",
        email: "j.garcia@example.com",
        phone: "+44 7700 901111",
        treatment: "Dental Bridge",
        status: "Active",
        lastVisit: "2025-03-30"
      },
      {
        id: 14,
        name: "Charlotte Miller",
        email: "c.miller@example.com",
        phone: "+44 7700 901222",
        treatment: "Dental Implants",
        status: "Scheduled",
        lastVisit: "2025-04-08"
      },
      {
        id: 15,
        name: "Matthew Wilson",
        email: "m.wilson@example.com",
        phone: "+44 7700 901333",
        treatment: "Veneers",
        status: "Active",
        lastVisit: "2025-03-25"
      },
      {
        id: 16,
        name: "Amelia Jones",
        email: "a.jones@example.com",
        phone: "+44 7700 901444",
        treatment: "Orthodontics",
        status: "Completed",
        lastVisit: "2025-04-12"
      },
      {
        id: 17,
        name: "Benjamin Moore",
        email: "b.moore@example.com",
        phone: "+44 7700 901555",
        treatment: "Root Canal",
        status: "Scheduled",
        lastVisit: "2025-04-22"
      },
      {
        id: 18,
        name: "Mia Lee",
        email: "m.lee@example.com",
        phone: "+44 7700 901666",
        treatment: "Teeth Whitening",
        status: "Active",
        lastVisit: "2025-03-15"
      },
      {
        id: 19,
        name: "Ethan Allen",
        email: "e.allen@example.com",
        phone: "+44 7700 901777",
        treatment: "Dental Implants",
        status: "New Patient",
        lastVisit: null
      },
      {
        id: 20,
        name: "Isabella Scott",
        email: "i.scott@example.com",
        phone: "+44 7700 901888",
        treatment: "Crowns",
        status: "Completed",
        lastVisit: "2025-04-18"
      }
    ];
    
    // Filter by search term (name, email, or phone)
    let filteredPatients = allPatients;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPatients = allPatients.filter(patient => 
        patient.name.toLowerCase().includes(searchLower) ||
        patient.email.toLowerCase().includes(searchLower) ||
        patient.phone.includes(search)
      );
    }
    
    // Filter by status if not 'all'
    if (status && status !== 'all') {
      filteredPatients = filteredPatients.filter(patient => 
        patient.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    // Get total count for pagination
    const total = filteredPatients.length;
    
    // Apply pagination
    const paginatedPatients = filteredPatients.slice(skip, skip + limit);
    
    // Return the paginated and filtered results
    res.json({
      success: true,
      message: "Patients retrieved successfully",
      data: {
        patients: paginatedPatients,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error("Error retrieving patients:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve patients"
    });
  }
});

// Create a new patient
router.post("/api/clinic/patients", ensureRole("clinic_staff"), async (req, res) => {
  try {
    const clinicId = req.user?.clinicId || 1;
    const { name, email, phone, treatment, status } = req.body;
    
    // Basic validation
    if (!name || !email || !phone || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }
    
    console.log(`Creating new patient for clinic ${clinicId}: ${name}, ${email}`);
    
    // Mock creating a new patient (in a real app, this would save to the database)
    // For now, we'll just return success with a mocked ID
    const newPatient = {
      id: Date.now(), // Using timestamp as a mock ID
      name,
      email,
      phone,
      treatment: treatment || "",
      status,
      lastVisit: null
    };
    
    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: {
        patient: newPatient
      }
    });
    
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create patient"
    });
  }
});

export default router;