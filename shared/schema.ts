import { pgTable, text, serial, integer, boolean, timestamp, varchar, primaryKey, json, bigint, foreignKey, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced user schema for patient management
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  role: varchar("role", { length: 20 }).default("patient").notNull(),
  emailVerified: boolean("email_verified").default(false),
  profileComplete: boolean("profile_complete").default(false)
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, updatedAt: true, emailVerified: true, profileComplete: true })
  .extend({
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string(),
    consent: z.boolean().refine(val => val === true, {
      message: "You must consent to our terms and privacy policy",
    })
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Schema for quote requests
export const quoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  treatment: text("treatment").notNull(),
  specificTreatment: text("specific_treatment"),
  otherTreatment: text("other_treatment"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  budget: text("budget"),
  dates: text("dates"),
  needsAccommodation: boolean("needs_accommodation").default(false),
  notes: text("notes"),
  status: text("status").default("pending").notNull(),
  userId: integer("user_id").references(() => users.id),
  quoteData: json("quote_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequests)
  .omit({ id: true, status: true, createdAt: true, updatedAt: true, userId: true, quoteData: true })
  .extend({
    consent: z.boolean().refine(val => val === true, {
      message: "You must consent to be contacted",
    }),
  });

// Clinics table for storing clinic information
export const clinics = pgTable("clinics", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  tier: varchar("tier", { length: 20 }).default("standard"),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  guarantee: varchar("guarantee", { length: 50 }),
  features: json("features"),
  materials: json("materials"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bookings table for clinic appointments and reservations
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id),
  clinicId: integer("clinic_id").references(() => clinics.id),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  depositPaid: boolean("deposit_paid").default(false),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).default("200.00"),
  appointmentDate: date("appointment_date"),
  treatmentPlan: json("treatment_plan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payments table to track all financial transactions
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("GBP").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 255 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  paymentType: varchar("payment_type", { length: 50 }).default("deposit").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Files table for X-rays and other medical documents
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }),
  fileType: varchar("file_type", { length: 50 }),
  fileSize: bigint("file_size", { mode: "number" }),
  fileUrl: varchar("file_url", { length: 255 }),
  fileCategory: varchar("file_category", { length: 50 }).default("xray"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Messages table for patient-clinic communication
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Export types
export type InsertUser = Omit<z.infer<typeof insertUserSchema>, "confirmPassword" | "consent">;
export type User = typeof users.$inferSelect;

export type InsertQuoteRequest = Omit<z.infer<typeof insertQuoteRequestSchema>, "consent">;
export type QuoteRequest = typeof quoteRequests.$inferSelect;

export type InsertBooking = Omit<typeof bookings.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type Booking = typeof bookings.$inferSelect;

export type InsertPayment = Omit<typeof payments.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type Payment = typeof payments.$inferSelect;

export type InsertFile = Omit<typeof files.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type File = typeof files.$inferSelect;

export type InsertMessage = Omit<typeof messages.$inferInsert, "id" | "createdAt">;
export type Message = typeof messages.$inferSelect;

export type InsertClinic = Omit<typeof clinics.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type Clinic = typeof clinics.$inferSelect;
