import express, { Router, Request, Response } from "express";
import { db } from "../db";
import { createVerificationToken } from "../services/email-service";
import { users, bookings, clinics, messages, notifications } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import passport from "passport";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const router: Router = express.Router();

// Test route to send a verification email (ONLY available in development mode)
router.post("/test-verification-email", async (req: Request, res: Response) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false, 
      message: "This endpoint is not available in production mode" 
    });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    // Get user with email
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found with this email" 
      });
    }

    // Create new verification token
    const verificationToken = await createVerificationToken(user.id, "email_verification");

    // Generate verification URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    // Format verification email data
    const userName = user.firstName || "User";
    const verificationData = {
      userEmail: user.email,
      userName: userName,
      verificationLink: verificationUrl
    };

    // Import and use the Mailjet service
    try {
      const { sendVerificationEmail } = await import('../mailjet-service');
      const emailSent = await sendVerificationEmail(verificationData);

      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to send verification email via email service"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
        // Include the link in response for testing purposes
        verificationUrl: verificationUrl
      });
    } catch (emailError: any) {
      console.error('Error sending test verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: `Email service error: ${emailError.message}`,
        error: emailError
      });
    }
  } catch (error: any) {
    console.error("Test verification email error:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      error: error
    });
  }
});

// Test login endpoint (ONLY available in development mode)
router.post("/test-login", async (req: Request, res: Response) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false, 
      message: "This endpoint is not available in production mode" 
    });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // Get user with email
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Check if the user's email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified",
        code: "EMAIL_NOT_VERIFIED",
        userId: user.id
      });
    }

    // Verify password (handle null password safely)
    if (!user.password) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Convert user to compatible format to fix type issues
    const userForAuth = {
      ...user,
      // Convert null values to undefined to satisfy Express.User interface
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      phone: user.phone || undefined,
      profileImage: user.profileImage || undefined,
      jobTitle: user.jobTitle || undefined,
      clinicId: user.clinicId || undefined,
      // Ensure emailVerified is never null (convert null to false)
      emailVerified: user.emailVerified === true
    };

    // Login the user
    req.login(userForAuth, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({
          success: false,
          message: "Login failed",
          error: err.message
        });
      }

      // Return user data (without sensitive information)
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: userWithoutPassword
      });
    });
  } catch (error: any) {
    console.error("Test login error:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      error: error
    });
  }
});

// Test user verification status endpoint (ONLY available in development mode)
router.get("/verification-status/:email", async (req: Request, res: Response) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false, 
      message: "This endpoint is not available in production mode" 
    });
  }

  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    // Get user with email
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found with this email" 
      });
    }

    // Return verification status
    return res.status(200).json({
      success: true,
      email: user.email,
      verified: user.emailVerified
    });
  } catch (error: any) {
    console.error("Verification status error:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      error: error
    });
  }
});

// Test session endpoint to check if the user is authenticated
router.get("/session-check", (req: Request, res: Response) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false, 
      message: "This endpoint is not available in production mode" 
    });
  }

  // Check if the user is authenticated
  if (req.isAuthenticated()) {
    const user = req.user;
    // Return user data (without sensitive information)
    const { password, ...userWithoutPassword } = user as any;
    return res.status(200).json({
      success: true,
      message: "User is authenticated",
      user: userWithoutPassword,
      session: req.session
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
      sessionID: req.sessionID,
      cookies: req.headers.cookie
    });
  }
});

// Test endpoint to delete a user by email (ONLY available in development mode)
router.delete("/delete-user-by-email/:email", async (req: Request, res: Response) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false, 
      message: "This endpoint is not available in production mode" 
    });
  }

  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email parameter is required" 
      });
    }

    // Find the user first to confirm it exists
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found with this email" 
      });
    }

    // Delete the user
    await db.delete(users).where(eq(users.email, email));

    return res.status(200).json({
      success: true,
      message: `User with email ${email} has been successfully deleted`
    });
  } catch (error: any) {
    console.error("User deletion error:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      error: error
    });
  }
});

// Test endpoint to create a booking between patient and clinic
// This will set up a test environment to test messaging functionality
router.post("/create-test-booking", async (req: Request, res: Response) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false, 
      message: "This endpoint is not available in production mode" 
    });
  }

  try {
    const { patientEmail, clinicEmail } = req.body;

    if (!patientEmail || !clinicEmail) {
      return res.status(400).json({ 
        success: false, 
        message: "Patient email and clinic email are required" 
      });
    }

    // Get patient with email
    const [patient] = await db.select().from(users).where(eq(users.email, patientEmail));

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: "Patient not found with this email" 
      });
    }

    // Get clinic staff with email
    const [clinicStaff] = await db.select().from(users).where(eq(users.email, clinicEmail));

    if (!clinicStaff || clinicStaff.role !== 'clinic_staff') {
      return res.status(404).json({ 
        success: false, 
        message: "Clinic staff not found with this email" 
      });
    }

    if (!clinicStaff.clinicId) {
      return res.status(400).json({ 
        success: false, 
        message: "Clinic staff has no associated clinic" 
      });
    }

    // Get clinic info
    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, clinicStaff.clinicId));

    if (!clinic) {
      return res.status(404).json({ 
        success: false, 
        message: "Clinic not found for this staff member" 
      });
    }

    // Check if a booking already exists between these users
    const existingBooking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.userId, patient.id),
        eq(bookings.clinicId, clinic.id)
      )
    });

    if (existingBooking) {
      // Return the existing booking
      return res.status(200).json({
        success: true,
        message: "Existing booking found between this patient and clinic",
        booking: existingBooking
      });
    }

    // Create a new booking with a reference number
    const reference = `TEST-${randomUUID().substring(0, 8).toUpperCase()}`;

    const [newBooking] = await db.insert(bookings).values({
      bookingReference: reference,
      userId: patient.id,
      clinicId: clinic.id,
      status: 'confirmed',
      assignedClinicStaffId: clinicStaff.id,
      depositPaid: true,
      depositAmount: 200.00,
      adminNotes: 'This is a test booking for messaging',
      clinicNotes: 'Created for testing purposes'
    }).returning();

    // Create initial welcome message from clinic to patient
    const [welcomeMessage] = await db.insert(messages).values({
      bookingId: newBooking.id,
      senderId: clinicStaff.id,
      recipientId: patient.id,
      content: `Welcome to ${clinic.name}! This is a test conversation to check messaging functionality. Feel free to ask any questions about your treatment.`,
      messageType: 'text',
    }).returning();

    // Create a notification for the patient about the new message
    const [notification] = await db.insert(notifications).values({
      userId: patient.id,
      title: 'New Message',
      message: `You have a new message from ${clinic.name}`,
      type: 'message',
      entityType: 'message',
      entityId: welcomeMessage.id,
      isRead: false
    }).returning();

    // Try to send real-time notification via WebSocket if available
    const wsService = req.app.locals.wsService;
    if (wsService) {
      wsService.broadcast({
        type: 'notification',
        payload: notification,
        sender: {
          id: clinicStaff.id.toString(),
          type: 'clinic_staff'
        },
        target: patient.id.toString()
      });
    }

    return res.status(201).json({
      success: true,
      message: "Test booking created successfully with initial message",
      booking: newBooking,
      welcomeMessage,
      notification
    });

  } catch (error: any) {
    console.error("Test booking creation error:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      error: error
    });
  }
});

// Create test booking data for messaging testing
router.post('/create-messaging-test-data', async (req, res) => {
  try {
    const { createTestBookingData } = await import('./test-booking-data');
    const result = await createTestBookingData();

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Test booking data created successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create test booking data',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in create-messaging-test-data endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test booking data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint to create a patient notification
router.post('/create-patient-notification', async (req: Request, res: Response) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false, 
      message: "This endpoint is not available in production mode" 
    });
  }

  try {
    // Access the notification service through the app locals
    const notificationService = req.app.locals.notificationService;

    if (!notificationService) {
      return res.status(500).json({
        success: false,
        message: "Notification service not available"
      });
    }

    // Create a test notification for the patient
    const notification = await notificationService.createNotification({
      title: "Test Notification",
      message: "This is a test notification to verify the unread count and marking as read functionality",
      target_type: "patient",
      target_id: "45", // Patient ID from login
      source_type: "system",
      source_id: "test-script",
      category: "message",
      priority: "medium",
      action_url: "/patient-portal?section=messages",
      created_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Test patient notification created",
      notification
    });
  } catch (error: any) {
    console.error('Error creating test patient notification:', error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      error: error
    });
  }
});

router.post('/generate-notification-analytics-data', async (req: Request, res: Response) => {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ 
      success: false, 
      message: "This endpoint is not available in production mode" 
    });
  }

  // Check for test token for easier testing
  const { testToken } = req.body;
  const hasValidTestToken = (testToken === 'test_notification_analytics_12345');

  // Require authentication or valid test token
  if (!req.isAuthenticated() && !hasValidTestToken) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required or provide valid test token" 
    });
  }

  // Only allow admin users or valid test token
  if (req.isAuthenticated() && req.user.role !== 'admin' && !hasValidTestToken) {
    return res.status(403).json({ 
      success: false, 
      message: "Admin access required" 
    });
  }

  try {
    // Access the notification service through the app locals
    const notificationService = req.app.locals.notificationService;

    if (!notificationService) {
      return res.status(500).json({
        success: false,
        message: "Notification service not available"
      });
    }

    // Categories, priorities, and types for test data
    const categories = ['appointment', 'treatment', 'payment', 'message', 'document', 'system', 'offer'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const targetTypes = ['admin', 'clinic', 'patient', 'all']; // Add 'all' for system-wide notifications

    // Helper for random selection and integers
    const randomItem = (array: any[]) => array[Math.floor(Math.random() * array.length)];
    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Number of test notifications to create
    const numNotifications = req.body.count || 30;
    let successCount = 0;
    let failCount = 0;

    // Create and track notification results
    const results = [];

    for (let i = 0; i < numNotifications; i++) {
      const category = randomItem(categories);
      const priority = randomItem(priorities);
      const targetType = randomItem(targetTypes);

      // Generate appropriate titles based on category
      let title, message, action_url;

      const baseUrl = 'https://mydentalfly.com';

      switch (category) {
        case 'appointment':
          title = `New appointment request (#${1000 + i})`;
          message = 'A patient has requested an appointment for dental consultation';
          action_url = `${baseUrl}/admin/appointments`;
          break;
        case 'treatment':
          title = `Treatment plan update (#${2000 + i})`;
          message = `A clinic has proposed a new treatment plan #${2000 + i}`;
          action_url = `${baseUrl}/admin/treatment-plans`;
          break;
        case 'payment':
          title = `Payment confirmation (#${3000 + i})`;
          message = `Payment of €${randomInt(50, 500)} has been received for treatment plan #${3000 + i}`;
          action_url = `${baseUrl}/admin/payments`;
          break;
        case 'message':
          title = `New message from clinic`;
          message = 'You have received a new message regarding patient treatment options';
          action_url = `${baseUrl}/admin/messages`;
          break;
        case 'document':
          title = `Document uploaded`;
          message = `A new document has been uploaded to the treatment plan #${4000 + i}`;
          action_url = `${baseUrl}/admin/documents`;
          break;
        case 'system':
          title = `System notification`;
          message = 'System maintenance is scheduled for this weekend';
          action_url = `${baseUrl}/admin/settings`;
          break;
        case 'offer':
          title = `New special offer submitted`;
          message = 'A clinic has submitted a special offer for approval';
          action_url = `${baseUrl}/admin/offers-approval`;
          break;
      }

      // Determine if notification should be read or unread (70% chance of being read)
      const shouldBeRead = Math.random() < 0.7;

      try {
        // Create the notification
        const newNotification = {
          title,
          message,
          target_type: targetType,
          // Use proper IDs for different portals
          target_id: targetType === 'admin' ? '41' : 
                     targetType === 'patient' ? '45' : // Patient ID is 45
                     targetType === 'clinic' ? '40' : // Clinic ID is 40
                     randomInt(1, 50).toString(),
          source_type: 'system' as const,
          source_id: 'test-script',
          category: category as any,
          priority: priority as any,
          action_url,
          created_at: new Date(Date.now() - randomInt(60000, 2592000000)), // Between 1 minute and 30 days ago
        };

        // Save the notification
        const notification = await notificationService.createNotification(newNotification);

        // If it should be read, mark it as read
        if (shouldBeRead) {
          // Add a random delay for when it was read (between 30 seconds and 1 hour)
          const timeToRead = randomInt(30, 3600); // in seconds

          // Mark as read
          await notificationService.updateNotification({
            id: notification.id,
            status: 'read'
          });
        }

        successCount++;
        results.push({
          id: notification.id,
          status: shouldBeRead ? 'read' : 'unread',
          category
        });
      } catch (error: any) {
        console.error('Error creating test notification:', error);
        failCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Generated ${successCount} test notifications (${failCount} failed)`,
      results,
      analytics: await notificationService.getNotificationAnalytics()
    });

  } catch (error: any) {
    console.error('Error generating test notifications:', error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      error: error
    });
  }
});

// Create test admin account
router.post('/create-test-admin', async (req, res) => {
  try {
    // Delete existing admin if it exists
    await db.delete(users).where(eq(users.email, 'admin@mydentalfly.com'));

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const adminUser = await db.insert(users).values({
      email: 'admin@mydentalfly.com',
      password_hash: hashedPassword,
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      created_at: new Date(),
      updated_at: new Date()
    }).returning();

    res.json({
      success: true,
      message: 'Test admin created successfully',
      user: {
        email: adminUser[0].email,
        role: adminUser[0].role
      }
    });
  } catch (error) {
    console.error('Error creating test admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test admin',
      error: error.message
    });
  }
});

// Create test patient account
router.post('/create-test-patient', async (req, res) => {
  try {
    // Delete existing patient if it exists
    await db.delete(users).where(eq(users.email, 'patient@mydentalfly.co.uk'));

    // Create patient user
    const hashedPassword = await bcrypt.hash('Patient123!', 10);
    const patientUser = await db.insert(users).values({
      email: 'patient@mydentalfly.co.uk',
      password_hash: hashedPassword,
      role: 'patient',
      first_name: 'Raj',
      last_name: 'Singh',
      phone: '+44 7700 900123',
      created_at: new Date(),
      updated_at: new Date()
    }).returning();

    // Create a sample booking for the patient with Maltepe Dental Clinic
    try {
      await db.insert(bookings).values({
        user_id: patientUser[0].id,
        clinic_id: 'maltepe-dental-clinic',
        booking_reference: 'MDC-' + Date.now(),
        treatment_name: 'Hollywood Smile Package',
        status: 'confirmed',
        appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        total_cost: 2850,
        currency: 'GBP',
        notes: 'Test booking for patient portal testing',
        created_at: new Date(),
        updated_at: new Date()
      });
    } catch (bookingError) {
      console.log('Booking creation skipped (table may not exist):', bookingError.message);
    }

    res.json({
      success: true,
      message: 'Test patient created successfully',
      user: {
        email: patientUser[0].email,
        role: patientUser[0].role,
        firstName: patientUser[0].first_name,
        lastName: patientUser[0].last_name
      }
    });
  } catch (error) {
    console.error('Error creating test patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test patient',
      error: error.message
    });
  }
});

export default router;