import express from "express";
import { storage } from "../storage";
import { insertQuoteRequestSchema } from "@shared/schema";
import { ensureAuthenticated, ensureRole } from "../middleware/auth";
import multer from "multer";
import { BadRequestError, NotFoundError } from "../models/custom-errors";
import { DatabaseError } from "pg";

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
          type: "quote_request",
          linkUrl: `/admin/quotes/${quoteRequest.id}`,
          read: false,
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
router.get("/admin/all", ensureAuthenticated, ensureRole("admin"), async (req, res, next) => {
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
router.get("/clinic", ensureAuthenticated, ensureRole("clinic_staff"), async (req, res, next) => {
  try {
    const user = req.user!;
    
    if (!user.clinicId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a clinic"
      });
    }
    
    const quotes = await storage.getQuoteRequestsByClinicId(user.clinicId);
    
    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    next(error);
  }
});

// Get quote requests for the authenticated user
router.get("/user", ensureAuthenticated, async (req, res, next) => {
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
router.get("/:id", ensureAuthenticated, async (req, res, next) => {
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
router.patch("/:id", ensureAuthenticated, async (req, res, next) => {
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
    
    const updatedQuote = await storage.updateQuoteRequest(quoteId, updateData);
    
    res.json({
      success: true,
      message: "Quote request updated successfully",
      data: updatedQuote
    });
  } catch (error) {
    next(error);
  }
});

// Create a new quote version (admin only)
router.post("/:id/versions", ensureAuthenticated, ensureRole("admin"), async (req, res, next) => {
  try {
    const quoteId = parseInt(req.params.id);
    
    if (isNaN(quoteId)) {
      throw new BadRequestError("Invalid quote ID");
    }
    
    const quote = await storage.getQuoteRequest(quoteId);
    
    if (!quote) {
      throw new NotFoundError("Quote request not found");
    }
    
    // Get all existing versions to determine next version number
    const existingVersions = await storage.getQuoteVersions(quoteId);
    const versionNumber = existingVersions.length > 0 
      ? Math.max(...existingVersions.map(v => v.versionNumber)) + 1 
      : 1;
    
    const quoteVersion = await storage.createQuoteVersion({
      quoteRequestId: quoteId,
      versionNumber,
      createdById: req.user!.id,
      status: "draft",
      quoteData: req.body.quoteData
    });
    
    // Create a notification for the patient if they have an account
    if (quote.userId) {
      try {
        await storage.createNotification({
          userId: quote.userId,
          title: "New Quote Version",
          message: `Your quote request has been updated with a new quote version`,
          type: "quote_version",
          linkUrl: `/patient/quotes/${quoteId}`,
          read: false
        });
      } catch (error) {
        console.error("Failed to create notification:", error);
        // Continue despite notification error
      }
    }
    
    // Update quote request status to "sent"
    if (req.body.updateQuoteStatus) {
      await storage.updateQuoteRequest(quoteId, { status: "sent" });
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
router.post("/:id/assign-clinic", ensureAuthenticated, ensureRole("admin"), async (req, res, next) => {
  try {
    const quoteId = parseInt(req.params.id);
    const { clinicId } = req.body;
    
    if (isNaN(quoteId) || !clinicId || isNaN(parseInt(clinicId))) {
      throw new BadRequestError("Invalid quote ID or clinic ID");
    }
    
    const clinic = await storage.getClinic(parseInt(clinicId));
    
    if (!clinic) {
      throw new NotFoundError("Clinic not found");
    }
    
    const updatedQuote = await storage.updateQuoteRequest(quoteId, {
      selectedClinicId: parseInt(clinicId),
      status: "assigned"
    });
    
    if (!updatedQuote) {
      throw new NotFoundError("Quote request not found");
    }
    
    // Create notification for clinic staff users
    const clinicStaff = await storage.getUsersByClinicId(parseInt(clinicId));
    
    for (const staffMember of clinicStaff) {
      try {
        await storage.createNotification({
          userId: staffMember.id,
          title: "New Quote Assignment",
          message: `A new quote request has been assigned to your clinic`,
          type: "quote_assignment",
          linkUrl: `/clinic/quotes/${quoteId}`,
          read: false
        });
      } catch (error) {
        console.error(`Failed to create notification for user ${staffMember.id}:`, error);
        // Continue despite notification error
      }
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
router.post("/:id/xrays", ensureAuthenticated, upload.array("xrays", 10), async (req, res, next) => {
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
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        storageKey: file.filename,
        userId: user.id,
        quoteRequestId: quoteId,
        fileType: "xray",
        isPublic: false
      });
    });
    
    const savedFiles = await Promise.all(filePromises);
    
    // Update quote request with xray count and flag
    await storage.updateQuoteRequest(quoteId, {
      hasXrays: true,
      xrayCount: (quote.xrayCount || 0) + files.length
    });
    
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
router.get("/:id/xrays", ensureAuthenticated, async (req, res, next) => {
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
    
    const files = await storage.getFilesByQuoteRequestId(quoteId, "xray");
    
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    next(error);
  }
});

export default router;