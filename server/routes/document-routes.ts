import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { isAuthenticated } from "../middleware/auth-middleware";
import { ensureRole } from "../middleware/auth";
import { generateS3PresignedUrl, getS3DownloadUrl, deleteS3Object } from "../services/s3-service";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Schema for document metadata
const documentMetadataSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().min(0),
  documentType: z.enum(['x-ray', 'treatment-plan', 'medical', 'contract', 'other']),
  notes: z.string().optional(),
  isPublic: z.boolean().default(false)
});

// Generate presigned upload URL for secure S3 uploads
router.post(
  "/documents/presigned-upload",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      // Validate request body
      const metadata = documentMetadataSchema.parse(req.body);
      
      // Generate a unique file key based on user ID, document type, and a UUID
      const userId = req.user!.id;
      const fileExtension = metadata.fileName.split('.').pop() || '';
      const fileKey = `${req.user!.role}/${userId}/${metadata.documentType}/${uuidv4()}.${fileExtension}`;
      
      // Get a presigned URL from S3
      const presignedUrl = await generateS3PresignedUrl(fileKey, metadata.fileType, metadata.isPublic);
      
      return res.json({
        success: true,
        presignedUrl,
        fileKey
      });
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid document metadata",
          errors: error.errors
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to generate upload URL"
      });
    }
  }
);

// Register a document in the database after S3 upload
router.post(
  "/documents/register",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      // Validate request body
      const metadata = documentMetadataSchema.parse(req.body);
      const { fileKey } = req.body;
      
      if (!fileKey) {
        return res.status(400).json({
          success: false,
          message: "File key is required"
        });
      }
      
      // Create a document entry in the database
      const document = await storage.createDocument({
        userId: req.user!.id,
        fileKey,
        fileName: metadata.fileName,
        fileType: metadata.fileType,
        fileSize: metadata.fileSize,
        documentType: metadata.documentType,
        notes: metadata.notes,
        isPublic: metadata.isPublic || false,
        uploadedAt: new Date().toISOString(),
      });
      
      // Generate a download URL for the document
      const fileUrl = await getS3DownloadUrl(fileKey);
      
      return res.status(201).json({
        success: true,
        document,
        fileUrl
      });
    } catch (error) {
      console.error("Error registering document:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid document metadata",
          errors: error.errors
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to register document"
      });
    }
  }
);

// Get all documents for the authenticated user
router.get(
  "/documents/user",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      
      // Get all documents for this user
      const documents = await storage.getUserDocuments(userId);
      
      // Generate download URLs for each document
      const documentsWithUrls = await Promise.all(
        documents.map(async (doc) => {
          const fileUrl = await getS3DownloadUrl(doc.fileKey);
          return {
            ...doc,
            fileUrl
          };
        })
      );
      
      return res.json({
        success: true,
        documents: documentsWithUrls
      });
    } catch (error) {
      console.error("Error fetching user documents:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch documents"
      });
    }
  }
);

// Get a specific document by ID
router.get(
  "/documents/:documentId",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const documentId = req.params.documentId;
      
      // Get the document
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found"
        });
      }
      
      // Check access permissions
      if (
        !document.isPublic && 
        req.user!.role !== "admin" &&
        req.user!.id !== document.userId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to access this document"
        });
      }
      
      // Generate a download URL for the document
      const fileUrl = await getS3DownloadUrl(document.fileKey);
      
      return res.json({
        success: true,
        document: {
          ...document,
          fileUrl
        }
      });
    } catch (error) {
      console.error("Error fetching document:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch document"
      });
    }
  }
);

// Update document metadata
router.patch(
  "/documents/:documentId",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const documentId = req.params.documentId;
      
      // Get the current document
      const existingDocument = await storage.getDocument(documentId);
      
      if (!existingDocument) {
        return res.status(404).json({
          success: false,
          message: "Document not found"
        });
      }
      
      // Check access permissions
      if (
        req.user!.role !== "admin" &&
        req.user!.id !== existingDocument.userId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to update this document"
        });
      }
      
      // Parse the update data
      const updateData = documentMetadataSchema.partial().parse(req.body);
      
      // Update the document
      const updatedDocument = await storage.updateDocument(documentId, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      
      // Generate a download URL for the document
      const fileUrl = await getS3DownloadUrl(existingDocument.fileKey);
      
      return res.json({
        success: true,
        document: {
          ...updatedDocument,
          fileUrl
        }
      });
    } catch (error) {
      console.error("Error updating document:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid document metadata",
          errors: error.errors
        });
      }
      return res.status(500).json({
        success: false,
        message: "Failed to update document"
      });
    }
  }
);

// Delete a document
router.delete(
  "/documents/:documentId",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const documentId = req.params.documentId;
      
      // Get the document
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found"
        });
      }
      
      // Check access permissions
      if (
        req.user!.role !== "admin" &&
        req.user!.id !== document.userId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to delete this document"
        });
      }
      
      // Delete the document from S3
      await deleteS3Object(document.fileKey);
      
      // Delete the document from the database
      await storage.deleteDocument(documentId);
      
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting document:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete document"
      });
    }
  }
);

// Get documents by treatment plan
router.get(
  "/treatment-plans/:planId/documents",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const planId = req.params.planId;
      
      // Get the treatment plan
      const treatmentPlan = await storage.getTreatmentPlan(planId);
      
      if (!treatmentPlan) {
        return res.status(404).json({
          success: false,
          message: "Treatment plan not found"
        });
      }
      
      // Check access permissions
      if (
        req.user!.role !== "admin" &&
        (req.user!.role === "clinic_staff" && req.user!.clinicId !== treatmentPlan.clinicId) &&
        req.user!.id !== treatmentPlan.patientId
      ) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to access documents for this treatment plan"
        });
      }
      
      // Get all documents associated with this treatment plan
      const documents = await storage.getTreatmentPlanDocuments(planId);
      
      // Generate download URLs for each document
      const documentsWithUrls = await Promise.all(
        documents.map(async (doc) => {
          const fileUrl = await getS3DownloadUrl(doc.fileKey);
          return {
            ...doc,
            fileUrl
          };
        })
      );
      
      return res.json({
        success: true,
        documents: documentsWithUrls
      });
    } catch (error) {
      console.error("Error fetching treatment plan documents:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch documents"
      });
    }
  }
);

// Attach a document to a treatment plan
router.post(
  "/treatment-plans/:planId/documents/:documentId",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const planId = req.params.planId;
      const documentId = req.params.documentId;
      
      // Get the treatment plan
      const treatmentPlan = await storage.getTreatmentPlan(planId);
      
      if (!treatmentPlan) {
        return res.status(404).json({
          success: false,
          message: "Treatment plan not found"
        });
      }
      
      // Get the document
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Document not found"
        });
      }
      
      // Check access permissions
      const canAttach = 
        req.user!.role === "admin" ||
        (req.user!.role === "clinic_staff" && req.user!.clinicId === treatmentPlan.clinicId) ||
        (req.user!.id === treatmentPlan.patientId && req.user!.id === document.userId);
      
      if (!canAttach) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to attach documents to this treatment plan"
        });
      }
      
      // Attach the document to the treatment plan
      await storage.attachDocumentToTreatmentPlan(planId, documentId);
      
      return res.json({
        success: true,
        message: "Document attached to treatment plan"
      });
    } catch (error) {
      console.error("Error attaching document to treatment plan:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to attach document to treatment plan"
      });
    }
  }
);

export default router;