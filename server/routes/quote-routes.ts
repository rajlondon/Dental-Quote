import express from "express";
import { storage } from "../storage";
import { insertQuoteRequestSchema, InsertFile, InsertNotification } from "@shared/schema";
import multer from "multer";
import { BadRequestError, NotFoundError } from "../models/custom-errors";
import { DatabaseError } from "pg";
import { isAuthenticated, ensureRole } from "../middleware/auth";
// We need to import these in routes.ts and make them available

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Create a new quote request
router.post("/", async (req, res, next) => {
  try {
    // Allow unauthenticated users to create quote requests
    const quoteData = insertQuoteRequestSchema.parse(req.body);
    
    // If authenticated, associate with user
    if (req.isAuthenticated()) {
      quoteData.userId = req.user!.id;
    }
    
    const quoteRequest = await storage.createQuoteRequest(quoteData);
    
    // Create a notification for admin
    if (quoteRequest) {
      try {
        await storage.createNotification({
          userId: 1, // Admin user (ID 1)
          title: "New Quote Request",
          message: `New quote request received from ${quoteRequest.name}`,
          category: "treatment", // Use a valid category from NotificationCategory
          priority: "medium",
          target_type: "admin",
          target_id: "1", // Admin ID as string
          source_type: "system",
          action_url: `/admin/quotes/${quoteRequest.id}`,
          status: "unread",
        });
      } catch (error) {
        console.error("Failed to create notification:", error);
        // Continue despite notification error
      }
    }
    
    res.status(201).json({
      success: true,
      message: "Quote request submitted successfully",
      data: quoteRequest
    });
  } catch (error) {
    next(error);
  }
});

// Get all quote requests (admin only)
router.get("/admin/all", isAuthenticated, ensureRole("admin"), async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    
    const quotes = await storage.getAllQuoteRequests(
      status ? { status } : undefined
    );
    
    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    next(error);
  }
});

// Get all quote requests for a clinic
router.get("/clinic", isAuthenticated, ensureRole("clinic_staff"), async (req, res, next) => {
  try {
    const user = req.user!;
    
    console.log(`[DEBUG] Clinic staff (${user.id}: ${user.username}) requesting quotes for clinic ID: ${user.clinicId}`);
    
    if (!user.clinicId) {
      console.log(`[ERROR] User ${user.id} doesn't have an associated clinic`);
      return res.status(400).json({
        success: false,
        message: "User is not associated with a clinic"
      });
    }
    
    console.log(`[DEBUG] Fetching quotes for clinic ID: ${user.clinicId}`);
    const quotes = await storage.getQuoteRequestsByClinicId(user.clinicId);
    console.log(`[DEBUG] Found ${quotes.length} quotes for clinic ${user.clinicId}`);
    
    // Let's check directly in the database if there are any quotes assigned to this clinic
    try {
      const { db } = await import("../db");
      const sql = `SELECT id, status, name, selected_clinic_id FROM quote_requests WHERE selected_clinic_id = ${user.clinicId}`;
      console.log(`[DEBUG] Running raw SQL: ${sql}`);
      const sqlResults = await db.execute(sql);
      console.log(`[DEBUG] Raw SQL results:`, sqlResults.rows);
    } catch (dbError) {
      console.error(`[ERROR] Failed to run raw SQL query:`, dbError);
    }
    
    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error(`[ERROR] Error in /quotes/clinic route:`, error);
    next(error);
  }
});

// Get quote requests for the authenticated user
router.get("/user", isAuthenticated, async (req, res, next) => {
  try {
    const quotes = await storage.getQuoteRequestsByUserId(req.user!.id);
    
    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific quote request by ID
router.get("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const quoteId = parseInt(req.params.id);
    
    if (isNaN(quoteId)) {
      throw new BadRequestError("Invalid quote ID");
    }
    
    const quote = await storage.getQuoteRequest(quoteId);
    
    if (!quote) {
      throw new NotFoundError("Quote request not found");
    }
    
    // Check permissions based on role
    const user = req.user!;
    
    if (user.role === "patient" && quote.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this quote"
      });
    }
    
    if (user.role === "clinic_staff") {
      if (!user.clinicId || quote.selectedClinicId !== user.clinicId) {
        return res.status(403).json({
          success: false,
          message: "This quote is not assigned to your clinic"
        });
      }
    }
    
    // Get quote versions if available
    const versions = await storage.getQuoteVersions(quoteId);
    
    res.json({
      success: true,
      data: {
        quoteRequest: quote,
        versions
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update a quote request
router.patch("/:id", isAuthenticated, async (req, res, next) => {
  try {
    const quoteId = parseInt(req.params.id);
    
    if (isNaN(quoteId)) {
      throw new BadRequestError("Invalid quote ID");
    }
    
    const quote = await storage.getQuoteRequest(quoteId);
    
    if (!quote) {
      throw new NotFoundError("Quote request not found");
    }
    
    // Check permissions based on role
    const user = req.user!;
    let updateData = req.body;
    
    if (user.role === "patient") {
      if (quote.userId !== user.id) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to update this quote"
        });
      }
      
      // Patients can only update specific fields
      updateData = {
        notes: updateData.notes,
        // Add any other fields that patients are allowed to update
      };
    } else if (user.role === "clinic_staff") {
      if (!user.clinicId || quote.selectedClinicId !== user.clinicId) {
        return res.status(403).json({
          success: false,
          message: "This quote is not assigned to your clinic"
        });
      }
      
      // Clinic staff can only update specific fields
      updateData = {
        clinicNotes: updateData.clinicNotes,
        viewedByClinic: true,
        // Add any other fields that clinic staff are allowed to update
      };
    } else if (user.role === "admin") {
      // Admins can update anything, but we'll set viewed flag
      updateData.viewedByAdmin = true;
    }
    
    // Check if this update changes the quote status
    const statusChanged = updateData.status && updateData.status !== quote.status;
    const updatedQuote = await storage.updateQuoteRequest(quoteId, updateData);
    
    // Send WebSocket notification if status was changed or if explicitly requested
    if (statusChanged || req.body.notifyUpdate) {
      try {
        // Broadcast quote status update to all relevant parties
        req.app.locals.wsService.broadcast({
          type: 'quote_status_update',
          payload: {
            quoteId,
            previousStatus: quote.status,
            newStatus: updatedQuote.status,
            updatedBy: user.id,
            updatedAt: new Date().toISOString(),
            updaterRole: user.role
          },
          sender: {
            id: String(user.id),
            type: user.role
          }
        });
        
        console.log(`WebSocket broadcast: Quote #${quoteId} status updated from ${quote.status} to ${updatedQuote.status}`);
      } catch (error) {
        console.error('Failed to send WebSocket notification:', error);
        // Continue despite WebSocket error
      }
    }
    
    res.json({
      success: true,
      message: "Quote request updated successfully",
      data: updatedQuote
    });
  } catch (error) {
    next(error);
  }
});

// Create a new quote version (admin and clinic staff can create)
router.post("/:id/versions", isAuthenticated, async (req, res, next) => {
  try {
    const quoteId = parseInt(req.params.id);
    const user = req.user!;
    
    if (isNaN(quoteId)) {
      throw new BadRequestError("Invalid quote ID");
    }
    
    const quote = await storage.getQuoteRequest(quoteId);
    
    if (!quote) {
      throw new NotFoundError("Quote request not found");
    }
    
    // Check permissions
    if (user.role === "patient") {
      return res.status(403).json({
        success: false,
        message: "Patients cannot create quote versions"
      });
    }
    
    // For clinic staff, verify they're assigned to this quote
    if (user.role === "clinic_staff") {
      if (!user.clinicId || quote.selectedClinicId !== user.clinicId) {
        return res.status(403).json({
          success: false,
          message: "This quote is not assigned to your clinic"
        });
      }
      
      // Verify the quote is in a state where clinic can create a quote version
      if (!["assigned", "in_progress"].includes(quote.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot create quote versions when quote is in '${quote.status}' status. Quote must be 'assigned' or 'in_progress'.`
        });
      }
    }
    
    // Get all existing versions to determine next version number
    const existingVersions = await storage.getQuoteVersions(quoteId);
    const versionNumber = existingVersions.length > 0 
      ? Math.max(...existingVersions.map(v => v.versionNumber)) + 1 
      : 1;
    
    // Create the quote version
    const quoteVersion = await storage.createQuoteVersion({
      quoteRequestId: quoteId,
      versionNumber,
      createdById: user.id,
      status: "draft",
      quoteData: req.body.quoteData
    });
    
    // Create a notification for the patient if they have an account
    if (quote.userId) {
      try {
        await storage.createNotification({
          title: "New Quote Version",
          message: `Your quote request has been updated with a new quote version`,
          category: "treatment",
          priority: "high", // Increased priority to high since this is important
          target_type: "patient",
          target_id: String(quote.userId),
          source_type: user.role,  // 'admin' or 'clinic_staff'
          source_id: String(user.id),
          action_url: `/patient/quotes/${quoteId}`,
          status: "unread"
        });
      } catch (error) {
        console.error("Failed to create notification:", error);
        // Continue despite notification error
      }
    }
    
    // Update quote request status if requested
    let updatedQuote = quote;
    if (req.body.updateQuoteStatus) {
      // For clinics, set status to in_progress if it's assigned
      let newStatus = "sent";
      if (user.role === "clinic_staff" && quote.status === "assigned") {
        newStatus = "in_progress";
      }
      
      updatedQuote = await storage.updateQuoteRequest(quoteId, { 
        status: newStatus,
        lastUpdatedBy: user.id
      });
      
      // Also notify admin when clinic creates a quote version
      if (user.role === "clinic_staff") {
        try {
          await storage.createNotification({
            title: "Clinic Created Quote Version",
            message: `Clinic has created a new quote version for request #${quoteId}`,
            category: "treatment",
            priority: "medium",
            target_type: "admin",
            target_id: "1", // Admin ID as string
            source_type: "clinic",
            source_id: String(user.id),
            action_url: `/admin/quotes/${quoteId}`,
            status: "unread"
          });
        } catch (error) {
          console.error("Failed to create admin notification:", error);
          // Continue despite notification error
        }
      }
      
      // Send WebSocket notification about the status change
      try {
        req.app.locals.wsService.broadcast({
          type: 'quote_version_created',
          payload: {
            quoteId,
            versionId: quoteVersion.id,
            versionNumber: quoteVersion.versionNumber,
            status: updatedQuote?.status || newStatus,
            createdBy: user.id,
            createdAt: new Date().toISOString(),
            creatorRole: user.role
          },
          sender: {
            id: String(user.id),
            type: user.role
          }
        });
        
        console.log(`WebSocket broadcast: New quote version #${quoteVersion.versionNumber} created for quote #${quoteId} with status ${updatedQuote?.status || newStatus}`);
      } catch (error) {
        console.error('Failed to send WebSocket notification:', error);
        // Continue despite WebSocket error
      }
    }
    
    res.status(201).json({
      success: true,
      message: "Quote version created successfully",
      data: quoteVersion
    });
  } catch (error) {
    next(error);
  }
});

// Assign a quote to a clinic (admin only)
router.post("/:id/assign-clinic", isAuthenticated, ensureRole("admin"), async (req, res, next) => {
  try {
    const quoteId = parseInt(req.params.id);
    const { clinicId } = req.body;
    
    console.log(`[DEBUG] Assign clinic request - quoteId: ${quoteId}, clinicId: ${clinicId}`);
    
    if (isNaN(quoteId) || !clinicId || isNaN(parseInt(clinicId))) {
      console.log(`[ERROR] Invalid quote ID or clinic ID - quoteId: ${quoteId}, clinicId: ${clinicId}`);
      throw new BadRequestError("Invalid quote ID or clinic ID");
    }
    
    const clinic = await storage.getClinic(parseInt(clinicId));
    
    if (!clinic) {
      console.log(`[ERROR] Clinic not found for ID: ${clinicId}`);
      throw new NotFoundError("Clinic not found");
    }
    
    console.log(`[DEBUG] Found clinic: ${clinic.name} (ID: ${clinic.id})`);
    
    console.log(`[DEBUG] Updating quote #${quoteId} with clinicId: ${clinicId} (type: ${typeof parseInt(clinicId)})`);
    
    const updatedQuote = await storage.updateQuoteRequest(quoteId, {
      selectedClinicId: parseInt(clinicId),
      status: "assigned"
    });
    
    console.log(`[DEBUG] Updated quote result:`, updatedQuote);
    
    if (!updatedQuote) {
      throw new NotFoundError("Quote request not found");
    }
    
    // Create notification for clinic staff users
    const clinicStaff = await storage.getUsersByClinicId(parseInt(clinicId));
    
    for (const staffMember of clinicStaff) {
      try {
        await storage.createNotification({
          title: "New Quote Assignment",
          message: `A new quote request has been assigned to your clinic`,
          category: "treatment",
          priority: "medium",
          target_type: "clinic",
          target_id: String(staffMember.id),
          source_type: "admin",
          source_id: String(req.user!.id),
          action_url: `/clinic/quotes/${quoteId}`,
          status: "unread"
        });
      } catch (error) {
        console.error(`Failed to create notification for user ${staffMember.id}:`, error);
        // Continue despite notification error
      }
    }
    
    // Send real-time WebSocket notification to clinic staff
    try {
      // Get clinic details for notification
      const clinicDetails = await storage.getClinic(parseInt(clinicId));
      const clinicName = clinicDetails?.name || 'assigned clinic';
      
      // Broadcast assignment to all WebSocket clients using app.locals
      req.app.locals.wsService.broadcast({
        type: 'quote_assignment',
        payload: {
          quoteId,
          clinicId: parseInt(clinicId),
          clinicName,
          assignedBy: req.user!.id,
          assignedAt: new Date().toISOString()
        },
        sender: {
          id: String(req.user!.id),
          type: 'admin'
        }
      });
      
      console.log(`WebSocket broadcast: Quote #${quoteId} assigned to clinic #${clinicId}`);
    } catch (error) {
      console.error('Failed to send WebSocket notification:', error);
      // Continue despite WebSocket error
    }
    
    res.json({
      success: true,
      message: "Quote assigned to clinic successfully",
      data: updatedQuote
    });
  } catch (error) {
    next(error);
  }
});

// Upload X-ray files for a quote request
router.post("/:id/xrays", isAuthenticated, upload.array("xrays", 10), async (req, res, next) => {
  try {
    const quoteId = parseInt(req.params.id);
    
    if (isNaN(quoteId)) {
      throw new BadRequestError("Invalid quote ID");
    }
    
    const quote = await storage.getQuoteRequest(quoteId);
    
    if (!quote) {
      throw new NotFoundError("Quote request not found");
    }
    
    // Check permissions
    const user = req.user!;
    
    // Only patient who owns the quote or admin can upload xrays
    if (user.role === "patient" && quote.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to upload files for this quote"
      });
    }
    
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      throw new BadRequestError("No files uploaded");
    }
    
    // Process uploaded files
    const filePromises = files.map(async (file) => {
      return storage.createFile({
        originalName: file.originalname,
        mimetype: file.mimetype,
        fileSize: file.size,
        filename: file.filename,
        fileType: "xray",
        fileCategory: "xray",
        userId: user.id,
        quoteRequestId: quoteId,
        visibility: "private",
        uploadedById: user.id
      });
    });
    
    const savedFiles = await Promise.all(filePromises);
    
    // Update quote request with xray count and flag
    const updatedQuote = await storage.updateQuoteRequest(quoteId, {
      hasXrays: true,
      xrayCount: (quote.xrayCount || 0) + files.length
    });
    
    // Send WebSocket notification about file uploads
    try {
      req.app.locals.wsService.broadcast({
        type: 'quote_files_uploaded',
        payload: {
          quoteId,
          fileCount: files.length,
          totalFiles: updatedQuote?.xrayCount || files.length,
          fileType: 'xray',
          uploadedBy: user.id,
          uploadedAt: new Date().toISOString()
        },
        sender: {
          id: String(user.id),
          type: user.role
        }
      });
      
      console.log(`WebSocket broadcast: ${files.length} x-ray files uploaded for quote #${quoteId}`);
    } catch (error) {
      console.error('Failed to send WebSocket notification:', error);
      // Continue despite WebSocket error
    }
    
    res.status(201).json({
      success: true,
      message: "X-ray files uploaded successfully",
      data: savedFiles
    });
  } catch (error) {
    next(error);
  }
});

// Get x-ray files for a quote
router.get("/:id/xrays", isAuthenticated, async (req, res, next) => {
  try {
    const quoteId = parseInt(req.params.id);
    
    if (isNaN(quoteId)) {
      throw new BadRequestError("Invalid quote ID");
    }
    
    const quote = await storage.getQuoteRequest(quoteId);
    
    if (!quote) {
      throw new NotFoundError("Quote request not found");
    }
    
    // Check permissions based on role
    const user = req.user!;
    
    if (user.role === "patient" && quote.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access files for this quote"
      });
    }
    
    if (user.role === "clinic_staff") {
      if (!user.clinicId || quote.selectedClinicId !== user.clinicId) {
        return res.status(403).json({
          success: false,
          message: "This quote is not assigned to your clinic"
        });
      }
    }
    
    const files = await storage.getFilesByQuoteRequestId(quoteId);
    
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    next(error);
  }
});

export default router;