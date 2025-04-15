import { pgTable, text, serial, integer, boolean, timestamp, varchar, primaryKey, json, bigint, foreignKey, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// === USERS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  profileImage: varchar("profile_image", { length: 255 }),
  // Role-based fields
  role: varchar("role", { length: 20 }).default("patient").notNull(), // patient, admin, clinic_staff
  clinicId: integer("clinic_id").references(() => clinics.id), // For clinic_staff only
  jobTitle: varchar("job_title", { length: 100 }), // For clinic_staff only
  // Tracking fields
  lastLogin: timestamp("last_login"),
  emailVerified: boolean("email_verified").default(false),
  profileComplete: boolean("profile_complete").default(false),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  quoteRequests: many(quoteRequests),
  bookings: many(bookings),
  payments: many(payments),
  files: many(files),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "recipient" }),
  clinic: one(clinics, {
    fields: [users.clinicId],
    references: [clinics.id],
  }),
  notifications: many(notifications),
}));

export const insertUserSchema = createInsertSchema(users)
  .omit({ 
    id: true, 
    createdAt: true, 
    updatedAt: true, 
    emailVerified: true, 
    profileComplete: true,
    lastLogin: true 
  })
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

// === QUOTE REQUESTS ===
export const quoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  // User info
  userId: integer("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  // Treatment info
  treatment: text("treatment").notNull(),
  specificTreatment: text("specific_treatment"),
  otherTreatment: text("other_treatment"),
  // Travel info
  departureCity: varchar("departure_city", { length: 100 }),
  travelMonth: varchar("travel_month", { length: 50 }),
  // Accommodation
  needsAccommodation: boolean("needs_accommodation").default(false),
  accommodationType: varchar("accommodation_type", { length: 50 }),
  // X-rays
  hasXrays: boolean("has_xrays").default(false),
  xrayCount: integer("xray_count"),
  // Quote info
  budget: varchar("budget", { length: 50 }),
  dates: varchar("dates", { length: 100 }),
  notes: text("notes"),
  // Quote tracking
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, sent, approved, declined, converted
  quoteData: json("quote_data"),
  // Selected clinic
  selectedClinicId: integer("selected_clinic_id").references(() => clinics.id),
  // Notes visible to different users
  adminNotes: text("admin_notes"),
  clinicNotes: text("clinic_notes"),
  // Tracking flags
  viewedByAdmin: boolean("viewed_by_admin").default(false),
  viewedByClinic: boolean("viewed_by_clinic").default(false),
  consent: boolean("consent").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quoteRequestsRelations = relations(quoteRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [quoteRequests.userId],
    references: [users.id],
  }),
  selectedClinic: one(clinics, {
    fields: [quoteRequests.selectedClinicId],
    references: [clinics.id],
  }),
  quoteVersions: many(quoteVersions),
  booking: one(bookings),
  xrayFiles: many(files, { relationName: "quote_xrays" }),
}));

export const insertQuoteRequestSchema = createInsertSchema(quoteRequests)
  .omit({ 
    id: true, 
    status: true, 
    createdAt: true, 
    updatedAt: true, 
    userId: true, 
    quoteData: true,
    viewedByAdmin: true,
    viewedByClinic: true
  })
  .extend({
    consent: z.boolean().refine(val => val === true, {
      message: "You must consent to be contacted",
    }),
  });

// === QUOTE VERSIONS ===
export const quoteVersions = pgTable("quote_versions", {
  id: serial("id").primaryKey(),
  quoteRequestId: integer("quote_request_id").notNull().references(() => quoteRequests.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  createdById: integer("created_by_id").references(() => users.id),
  status: varchar("status", { length: 50 }).default("draft").notNull(), // draft, sent, approved, declined
  quoteData: json("quote_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quoteVersionsRelations = relations(quoteVersions, ({ one }) => ({
  quoteRequest: one(quoteRequests, {
    fields: [quoteVersions.quoteRequestId],
    references: [quoteRequests.id],
  }),
  createdBy: one(users, {
    fields: [quoteVersions.createdById],
    references: [users.id],
  }),
}));

// === CLINICS ===
export const clinics = pgTable("clinics", {
  id: serial("id").primaryKey(),
  // Basic info
  name: varchar("name", { length: 100 }).notNull(),
  location: varchar("location", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }).default("Istanbul"),
  country: varchar("country", { length: 100 }).default("Turkey"),
  description: text("description"),
  // Contact info
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 255 }),
  // Classification
  tier: varchar("tier", { length: 20 }).default("standard"), // affordable, standard, premium
  rating: decimal("rating", { precision: 3, scale: 1 }),
  reviewCount: integer("review_count").default(0),
  // Features
  guarantee: varchar("guarantee", { length: 50 }),
  features: json("features"),
  materials: json("materials"),
  languages: json("languages"),
  specialties: json("specialties"),
  treatments: json("treatments"),
  // Images
  logoUrl: varchar("logo_url", { length: 255 }),
  mainImageUrl: varchar("main_image_url", { length: 255 }),
  galleryImages: json("gallery_images"),
  // Admin notes
  adminNotes: text("admin_notes"),
  active: boolean("active").default(true),
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clinicsRelations = relations(clinics, ({ many }) => ({
  bookings: many(bookings),
  staff: many(users),
  quoteRequests: many(quoteRequests),
  reviews: many(clinicReviews),
  appointments: many(appointments),
}));

// === CLINIC REVIEWS ===
export const clinicReviews = pgTable("clinic_reviews", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  rating: integer("rating").notNull(),
  reviewText: text("review_text"),
  treatment: varchar("treatment", { length: 100 }),
  verified: boolean("verified").default(false),
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clinicReviewsRelations = relations(clinicReviews, ({ one }) => ({
  clinic: one(clinics, {
    fields: [clinicReviews.clinicId],
    references: [clinics.id],
  }),
  user: one(users, {
    fields: [clinicReviews.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [clinicReviews.bookingId],
    references: [bookings.id],
  }),
}));

// === TREATMENT PLANS ===
export const treatmentPlans = pgTable("treatment_plans", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  clinicId: integer("clinic_id").references(() => clinics.id),
  createdById: integer("created_by_id").references(() => users.id),
  status: varchar("status", { length: 50 }).default("draft").notNull(), // draft, finalized, in_treatment, completed
  treatmentDetails: json("treatment_details").notNull(), // JSON array of selected treatments
  estimatedTotalCost: decimal("estimated_total_cost", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("GBP"),
  notes: text("notes"), // Clinic comments
  portalStatus: varchar("portal_status", { length: 50 }).default("active"), // active, in_progress, completed
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const treatmentPlansRelations = relations(treatmentPlans, ({ one, many }) => ({
  patient: one(users, {
    fields: [treatmentPlans.patientId],
    references: [users.id],
  }),
  clinic: one(clinics, {
    fields: [treatmentPlans.clinicId],
    references: [clinics.id],
  }),
  createdBy: one(users, {
    fields: [treatmentPlans.createdById],
    references: [users.id],
    relationName: "treatment_plan_creator"
  }),
  quoteRequest: one(quoteRequests, {
    fields: [treatmentPlans.quoteRequestId],
    references: [quoteRequests.id],
  }),
}));

// === BOOKINGS ===
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  // Reference and relationships
  bookingReference: varchar("booking_reference", { length: 20 }).unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id).unique(),
  clinicId: integer("clinic_id").references(() => clinics.id),
  treatmentPlanId: integer("treatment_plan_id").references(() => treatmentPlans.id),
  // Assigned staff
  assignedAdminId: integer("assigned_admin_id").references(() => users.id),
  assignedClinicStaffId: integer("assigned_clinic_staff_id").references(() => users.id),
  // Status and tracking
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, confirmed, in_progress, completed, cancelled
  stage: varchar("stage", { length: 50 }).default("deposit"), // deposit, pre_travel, treatment, post_treatment, completed
  depositPaid: boolean("deposit_paid").default(false),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).default("200.00"),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }).default("0.00"),
  balanceDue: decimal("balance_due", { precision: 10, scale: 2 }),
  // Travel details
  arrivalDate: date("arrival_date"),
  departureDate: date("departure_date"),
  flightNumber: varchar("flight_number", { length: 50 }),
  // Accommodation
  accommodationType: varchar("accommodation_type", { length: 50 }),
  accommodationDetails: text("accommodation_details"),
  // Treatment notes
  treatmentNotes: text("treatment_notes"),
  // Notes for different user types
  patientNotes: text("patient_notes"),
  adminNotes: text("admin_notes"),
  clinicNotes: text("clinic_notes"),
  // Tracking
  lastPatientMessageAt: timestamp("last_patient_message_at"),
  lastClinicMessageAt: timestamp("last_clinic_message_at"),
  lastAdminMessageAt: timestamp("last_admin_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  quoteRequest: one(quoteRequests, {
    fields: [bookings.quoteRequestId],
    references: [quoteRequests.id],
  }),
  clinic: one(clinics, {
    fields: [bookings.clinicId],
    references: [clinics.id],
  }),
  assignedAdmin: one(users, {
    fields: [bookings.assignedAdminId],
    references: [users.id],
    relationName: "assigned_admin",
  }),
  assignedClinicStaff: one(users, {
    fields: [bookings.assignedClinicStaffId],
    references: [users.id],
    relationName: "assigned_clinic_staff",
  }),
  payments: many(payments),
  files: many(files),
  messages: many(messages),
  appointments: many(appointments),
  reviews: many(clinicReviews),
}));

// === APPOINTMENTS ===
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  clinicId: integer("clinic_id").references(() => clinics.id),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  type: varchar("type", { length: 50 }).default("consultation"), // consultation, treatment, follow_up
  status: varchar("status", { length: 50 }).default("scheduled"), // scheduled, in_progress, completed, cancelled, missed
  clinicNotes: text("clinic_notes"),
  adminNotes: text("admin_notes"),
  reminderSent: boolean("reminder_sent").default(false),
  followUpRequired: boolean("follow_up_required").default(false),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  booking: one(bookings, {
    fields: [appointments.bookingId],
    references: [bookings.id],
  }),
  clinic: one(clinics, {
    fields: [appointments.clinicId],
    references: [clinics.id],
  }),
  createdBy: one(users, {
    fields: [appointments.createdById],
    references: [users.id],
  }),
}));

// === PAYMENTS ===
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  // Relationships
  userId: integer("user_id").notNull().references(() => users.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  // Payment details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("GBP").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, completed, failed, refunded
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentType: varchar("payment_type", { length: 50 }).default("deposit").notNull(), // deposit, balance, refund, other
  // Stripe details
  transactionId: varchar("transaction_id", { length: 255 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  receiptUrl: varchar("receipt_url", { length: 255 }),
  // Notes
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

// === FILES ===
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  // Relationships
  userId: integer("user_id").notNull().references(() => users.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id),
  uploadedById: integer("uploaded_by_id").references(() => users.id),
  // File info
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }),
  mimetype: varchar("mimetype", { length: 100 }),
  fileType: varchar("file_type", { length: 50 }), // document, image, xray, report, other
  fileSize: bigint("file_size", { mode: "number" }),
  fileUrl: varchar("file_url", { length: 255 }),
  fileCategory: varchar("file_category", { length: 50 }).default("xray"), 
  // Visibility and access
  visibility: varchar("visibility", { length: 20 }).default("private"), // private, clinic, admin, public
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const filesRelations = relations(files, ({ one }) => ({
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [files.bookingId],
    references: [bookings.id],
  }),
  quoteRequest: one(quoteRequests, {
    fields: [files.quoteRequestId],
    references: [quoteRequests.id],
    relationName: "quote_xrays",
  }),
  uploadedBy: one(users, {
    fields: [files.uploadedById],
    references: [users.id],
    relationName: "file_uploader",
  }),
}));

// === MESSAGES ===
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  // Relationships
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").references(() => users.id),
  // Message content
  content: text("content").notNull(),
  // Status
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  // File attachments
  hasAttachment: boolean("has_attachment").default(false),
  attachmentId: integer("attachment_id").references(() => files.id),
  // Metadata 
  messageType: varchar("message_type", { length: 20 }).default("text"), // text, notification, system
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  booking: one(bookings, {
    fields: [messages.bookingId],
    references: [bookings.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "recipient",
  }),
  attachment: one(files, {
    fields: [messages.attachmentId],
    references: [files.id],
  }),
}));

// === NOTIFICATIONS ===
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 100 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  type: varchar("type", { length: 20 }).default("info"), // info, success, warning, error
  action: varchar("action", { length: 255 }),
  entityType: varchar("entity_type", { length: 50 }), // booking, payment, message, quote, appointment
  entityId: integer("entity_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// === EXPORT TYPES ===

// User types
export type InsertUser = Omit<z.infer<typeof insertUserSchema>, "confirmPassword" | "consent">;
export type User = typeof users.$inferSelect;

// Quote types
export type InsertQuoteRequest = Omit<z.infer<typeof insertQuoteRequestSchema>, "consent">;
export type QuoteRequest = typeof quoteRequests.$inferSelect;

export type InsertQuoteVersion = Omit<typeof quoteVersions.$inferInsert, "id" | "createdAt">;
export type QuoteVersion = typeof quoteVersions.$inferSelect;

// Booking types
export type InsertBooking = Omit<typeof bookings.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type Booking = typeof bookings.$inferSelect;

export type InsertAppointment = Omit<typeof appointments.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type Appointment = typeof appointments.$inferSelect;

// Payment types
export type InsertPayment = Omit<typeof payments.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type Payment = typeof payments.$inferSelect;

// File types
export type InsertFile = Omit<typeof files.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type File = typeof files.$inferSelect;

// Message types
export type InsertMessage = Omit<typeof messages.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type Message = typeof messages.$inferSelect;

// Clinic types
export type InsertClinic = Omit<typeof clinics.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type Clinic = typeof clinics.$inferSelect;

export type InsertClinicReview = Omit<typeof clinicReviews.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type ClinicReview = typeof clinicReviews.$inferSelect;

// Notification types
export type InsertNotification = Omit<typeof notifications.$inferInsert, "id" | "createdAt">;
export type Notification = typeof notifications.$inferSelect;
