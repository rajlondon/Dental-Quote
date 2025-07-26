import { z } from 'zod';

// Base Zod schemas
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['admin', 'patient', 'clinic_staff']).optional(),
});

export const insertQuoteRequestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  treatment: z.string(),
  status: z.string().optional(),
  selectedClinicId: z.number().optional(),
});

export const insertBookingSchema = z.object({
  userId: z.number(),
  clinicId: z.number(),
  quoteRequestId: z.number().optional(),
  status: z.string(),
  depositPaid: z.boolean().optional(),
  depositAmount: z.string().optional(),
  stage: z.string().optional(),
});

export const insertMessageSchema = z.object({
  senderId: z.number(),
  receiverId: z.number().optional(),
  bookingId: z.number().optional(),
  content: z.string(),
  messageType: z.string(),
  isRead: z.boolean().optional(),
  attachmentId: z.number().optional(),
  hasAttachment: z.boolean().optional(),
});

export const insertNotificationSchema = z.object({
  userId: z.number().optional(),
  title: z.string(),
  message: z.string(),
  category: z.string(),
  priority: z.string(),
  target_type: z.string(),
  target_id: z.string(),
  source_type: z.string(),
  source_id: z.string().optional(),
  action_url: z.string().optional(),
  status: z.string(),
});

// TypeScript interfaces (derived from Zod schemas)
export type User = {
  id: number;
  email: string;
  role: 'admin' | 'patient' | 'clinic_staff';
  firstName?: string;
  lastName?: string;
  clinicId?: number;
};

export type QuoteRequest = {
  id: number;
  userId?: number;
  name: string;
  email: string;
  treatment: string;
  status: string;
  selectedClinicId?: number;
};

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// File interfaces
export interface InsertFile {
  originalName: string;
  mimetype: string;
  fileSize: number;
  filename: string;
  fileType: string;
  fileCategory: string;
  userId: number;
  quoteRequestId?: number;
  visibility: string;
  uploadedById: number;
}

export interface File extends InsertFile {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mock database table exports (simplified for compatibility)
export const users = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const quoteRequests = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const bookings = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const messages = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const notifications = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const files = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const clinics = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };

// Additional schemas that might be needed
export const appointments = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const payments = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const clinicReviews = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const verificationTokens = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const quoteVersions = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const treatmentPlans = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const treatmentPackages = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const packageTreatments = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const packageInclusions = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
export const specialOffers = { insert: (data: any) => data, select: () => [], update: (data: any) => data, delete: () => true };
