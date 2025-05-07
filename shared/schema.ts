import { pgTable, text, serial, integer, boolean, timestamp, varchar, primaryKey, json, jsonb, bigint, foreignKey, date, decimal, uuid } from "drizzle-orm/pg-core";
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
  // Additional personal information
  address: varchar("address", { length: 255 }),
  dateOfBirth: varchar("date_of_birth", { length: 20 }), // Store as YYYY-MM-DD
  nationality: varchar("nationality", { length: 100 }),
  preferredLanguage: varchar("preferred_language", { length: 50 }).default("English"),
  passportNumber: varchar("passport_number", { length: 50 }),
  // JSON fields for structured data
  emergencyContact: json("emergency_contact").$type<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
  }>(),
  medicalInfo: json("medical_info").$type<{
    allergies: string[];
    medications: string[];
    conditions: string[];
    notes: string;
  }>(),
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
  hotelBookings: many(hotelBookings),
  savedSpecialOffers: many(userSavedSpecialOffers),
  treatmentLines: many(treatmentLines, { relationName: "patient_treatment_lines" }),
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
  hotelAccommodation: varchar("hotel_accommodation", { length: 20 }).default("clinic_decide"),
  needsAccommodation: boolean("needs_accommodation").default(false), // legacy field
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
  // Special offer data
  specialOffer: json("special_offer"),
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
    specialOffer: true,
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

// === VERIFICATION TOKENS ===
export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "email_verification" or "password_reset"
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [verificationTokens.userId],
    references: [users.id],
  }),
}));

// === PROMO TOKENS ===
export const promoTokens = pgTable("promo_tokens", {
  token: varchar("token", { length: 50 }).primaryKey(),
  clinicId: varchar("clinic_id", { length: 50 }).notNull().references(() => clinics.id),
  promoType: varchar("promo_type", { length: 20 }).notNull(),
  payload: json("payload").notNull(), // { offerId: "..." } or { packageId: "...", discount: 800 }
  validUntil: date("valid_until").notNull(),
  displayOnHome: boolean("display_on_home").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const promoTokensRelations = relations(promoTokens, ({ one }) => ({
  clinic: one(clinics, {
    fields: [promoTokens.clinicId],
    references: [clinics.id],
  }),
}));

// Add promoToken field to quotes table
export const quotes = pgTable("quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  clinicId: varchar("clinic_id", { length: 50 }).notNull().references(() => clinics.id),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("GBP"),
  promoToken: varchar("promo_token", { length: 50 }).references(() => promoTokens.token),
  offerId: varchar("offer_id", { length: 50 }),
  packageId: varchar("package_id", { length: 50 }),
  source: varchar("source", { length: 20 }).default("normal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  patient: one(users, {
    fields: [quotes.patientId],
    references: [users.id],
  }),
  clinic: one(clinics, {
    fields: [quotes.clinicId],
    references: [clinics.id],
  }),
  promoToken: one(promoTokens, {
    fields: [quotes.promoToken],
    references: [promoTokens.token],
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
  // Results media
  beforeAfterImages: json("before_after_images").default([]),
  clinicTourVideos: json("clinic_tour_videos").default([]),
  testimonialVideos: json("testimonial_videos").default([]),
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
  includesHotel: boolean("includes_hotel").default(false),
  hotelDetails: json("hotel_details"), // JSON object with hotel info
  notes: text("notes"), // Clinic comments
  portalStatus: varchar("portal_status", { length: 50 }).default("active"), // active, in_progress, completed
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id),
  // Special offer and package selection fields
  selectedOfferId: uuid("selected_offer_id").references(() => specialOffers.id),
  selectedPackageId: uuid("selected_package_id").references(() => treatmentPackages.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTreatmentPlanSchema = createInsertSchema(treatmentPlans)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });
  
export type InsertTreatmentPlan = z.infer<typeof insertTreatmentPlanSchema>;
export type TreatmentPlan = typeof treatmentPlans.$inferSelect;

// Define the specialOffers and treatmentPackages tables
export const specialOffers = pgTable("special_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  clinicId: integer("clinic_id").references(() => clinics.id),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
  discountType: varchar("discount_type", { length: 20 }).default("percentage"), // percentage or fixed_amount
  imageUrl: varchar("image_url", { length: 255 }),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create insert schema and type definitions for specialOffers
export const insertSpecialOfferSchema = createInsertSchema(specialOffers)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export type InsertSpecialOffer = z.infer<typeof insertSpecialOfferSchema>;
export type SpecialOffer = typeof specialOffers.$inferSelect;

// Define relations for specialOffers
export const specialOffersRelations = relations(specialOffers, ({ one, many }) => ({
  clinic: one(clinics, {
    fields: [specialOffers.clinicId],
    references: [clinics.id],
  }),
  treatmentPlans: many(treatmentPlans)
}));

export const treatmentPackages = pgTable("treatment_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  clinicId: integer("clinic_id").references(() => clinics.id),
  priceGBP: decimal("price_gbp", { precision: 10, scale: 2 }),
  priceUSD: decimal("price_usd", { precision: 10, scale: 2 }),
  imageUrl: varchar("image_url", { length: 255 }),
  treatments: json("treatments").default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create insert schema and type definitions for treatmentPackages
export const insertTreatmentPackageSchema = createInsertSchema(treatmentPackages)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export type InsertTreatmentPackage = z.infer<typeof insertTreatmentPackageSchema>;
export type TreatmentPackage = typeof treatmentPackages.$inferSelect;

// Define relations for treatmentPackages
export const treatmentPackagesRelations = relations(treatmentPackages, ({ one, many }) => ({
  clinic: one(clinics, {
    fields: [treatmentPackages.clinicId],
    references: [clinics.id],
  }),
  treatmentPlans: many(treatmentPlans)
}));

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
  // Define the relations for special offers and packages
  specialOffer: one(specialOffers, {
    fields: [treatmentPlans.selectedOfferId],
    references: [specialOffers.id],
  }),
  treatmentPackage: one(treatmentPackages, {
    fields: [treatmentPlans.selectedPackageId], 
    references: [treatmentPackages.id],
  }),
  files: many(files, { relationName: "treatment_plan_files" }),
  booking: many(bookings),
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
  treatmentPlan: one(treatmentPlans, {
    fields: [bookings.treatmentPlanId],
    references: [treatmentPlans.id],
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
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "cascade" }),
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

export const insertPaymentSchema = createInsertSchema(payments)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// === FILES ===
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  // Relationships
  userId: integer("user_id").notNull().references(() => users.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  quoteRequestId: integer("quote_request_id").references(() => quoteRequests.id),
  treatmentPlanId: integer("treatment_plan_id").references(() => treatmentPlans.id),
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
  treatmentPlan: one(treatmentPlans, {
    fields: [files.treatmentPlanId],
    references: [treatmentPlans.id],
    relationName: "treatment_plan_files",
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
  // Note: content column does not exist in the actual database schema
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

// === HOTELS ===
export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }).default("Istanbul"),
  country: varchar("country", { length: 100 }).default("Turkey"),
  starRating: decimal("star_rating", { precision: 2, scale: 1 }),
  description: text("description"),
  amenities: json("amenities"),
  // Images
  mainImageUrl: varchar("main_image_url", { length: 255 }),
  galleryImages: json("gallery_images"),
  // Location
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  distanceToClinic: json("distance_to_clinic"), // JSON mapping of clinicId to distance in km
  // Contact
  contactPhone: varchar("contact_phone", { length: 50 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  // Admin fields
  isActive: boolean("is_active").default(true),
  isPartner: boolean("is_partner").default(false),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hotelsRelations = relations(hotels, ({ many }) => ({
  hotelBookings: many(hotelBookings),
}));

export const hotelBookings = pgTable("hotel_bookings", {
  id: serial("id").primaryKey(),
  // Relationships
  userId: integer("user_id").notNull().references(() => users.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  treatmentPlanId: integer("treatment_plan_id").references(() => treatmentPlans.id),
  hotelId: integer("hotel_id").references(() => hotels.id),
  // Booking details
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  roomType: varchar("room_type", { length: 100 }),
  numberOfGuests: integer("number_of_guests").default(1),
  accommodationPackage: varchar("accommodation_package", { length: 50 }).default("standard"), // standard, premium, etc.
  // Booking status
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, confirmed, cancelled, completed
  confirmationNumber: varchar("confirmation_number", { length: 50 }),
  // Provider
  providedBy: varchar("provided_by", { length: 50 }).default("clinic"), // clinic, dental_fly, third_party
  providerDetails: json("provider_details"),
  // Cost
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("GBP"),
  includesBreakfast: boolean("includes_breakfast").default(true),
  additionalServices: json("additional_services"),
  // Notes
  specialRequests: text("special_requests"),
  adminNotes: text("admin_notes"),
  // Tracking
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hotelBookingsRelations = relations(hotelBookings, ({ one }) => ({
  user: one(users, {
    fields: [hotelBookings.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [hotelBookings.bookingId],
    references: [bookings.id],
  }),
  treatmentPlan: one(treatmentPlans, {
    fields: [hotelBookings.treatmentPlanId],
    references: [treatmentPlans.id],
  }),
  hotel: one(hotels, {
    fields: [hotelBookings.hotelId],
    references: [hotels.id],
  }),
  createdBy: one(users, {
    fields: [hotelBookings.createdById],
    references: [users.id],
    relationName: "hotel_booking_creator",
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

// Treatment plan types defined earlier in the file

// Booking types
export type Booking = typeof bookings.$inferSelect;

export const insertBookingSchema = createInsertSchema(bookings)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastPatientMessageAt: true,
    lastClinicMessageAt: true,
    lastAdminMessageAt: true,
  });
  
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type InsertAppointment = Omit<typeof appointments.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type Appointment = typeof appointments.$inferSelect;

// Payment types
export type InsertPayment = Omit<typeof payments.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type Payment = typeof payments.$inferSelect;

// File types
export type InsertFile = Omit<typeof files.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type File = typeof files.$inferSelect;

// Message types
export const insertMessageSchema = createInsertSchema(messages)
  .omit({ id: true, createdAt: true, updatedAt: true, readAt: true })
  .extend({
    content: z.string().min(1, "Message content cannot be empty"),
    bookingId: z.number().int().positive("Booking ID is required"),
    recipientId: z.number().int().positive("Recipient ID is required")
  });

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

// Hotel types
export type InsertHotel = Omit<typeof hotels.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type Hotel = typeof hotels.$inferSelect;

// Hotel booking types
export type InsertHotelBooking = Omit<typeof hotelBookings.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type HotelBooking = typeof hotelBookings.$inferSelect;

// === USER SAVED SPECIAL OFFERS ===
export const userSavedSpecialOffers = pgTable("user_saved_special_offers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  specialOfferId: varchar("special_offer_id", { length: 36 }).notNull(),
  clinicId: integer("clinic_id").references(() => clinics.id),
  offerDetails: json("offer_details").notNull(), // Store full offer details
  savedAt: timestamp("saved_at").defaultNow().notNull(),
  viewed: boolean("viewed").default(false),
  status: varchar("status", { length: 20 }).default("active"), // active, redeemed, expired
  redemptionDate: timestamp("redemption_date"),
  notes: text("notes"),
});

export const userSavedSpecialOffersRelations = relations(userSavedSpecialOffers, ({ one }) => ({
  user: one(users, {
    fields: [userSavedSpecialOffers.userId],
    references: [users.id],
  }),
  clinic: one(clinics, {
    fields: [userSavedSpecialOffers.clinicId],
    references: [clinics.id],
  }),
}));

export type InsertUserSavedSpecialOffer = Omit<typeof userSavedSpecialOffers.$inferInsert, "id" | "savedAt">;
export type UserSavedSpecialOffer = typeof userSavedSpecialOffers.$inferSelect;

// === PACKAGES ===
export const packages = pgTable("packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("image_url", { length: 255 }),
  procedureCode: varchar("procedure_code", { length: 50 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("GBP"),
  isActive: boolean("is_active").default(true),
  includesHotel: boolean("includes_hotel").default(false),
  hotelDetails: json("hotel_details"),
  includesFlight: boolean("includes_flight").default(false),
  flightDetails: json("flight_details"),
  treatmentDuration: integer("treatment_duration"), // in days
  featuredOnHomepage: boolean("featured_on_homepage").default(false),
  adminApproved: boolean("admin_approved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPackageSchema = createInsertSchema(packages)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export type Package = typeof packages.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;

// === TREATMENT LINES ===
export const treatmentLines = pgTable("treatment_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id),
  patientId: integer("patient_id").notNull().references(() => users.id),
  quoteId: uuid("quote_id").notNull(), // parent quote ID
  procedureCode: varchar("procedure_code", { length: 50 }).notNull(), // e.g. "ALL_ON_4"
  description: text("description").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  isPackage: boolean("is_package").default(false), // true if came from package rail
  packageId: uuid("package_id").references(() => packages.id),
  status: varchar("status", { length: 20 }).default("draft").notNull(), // draft, confirmed, deleted
  patientNotes: text("patient_notes"),
  clinicNotes: text("clinic_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTreatmentLineSchema = createInsertSchema(treatmentLines)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export type TreatmentLine = typeof treatmentLines.$inferSelect;
export type InsertTreatmentLine = z.infer<typeof insertTreatmentLineSchema>;

export const packagesRelations = relations(packages, ({ one, many }) => ({
  clinic: one(clinics, {
    fields: [packages.clinicId],
    references: [clinics.id],
  }),
  treatmentLines: many(treatmentLines),
}));

export const treatmentLinesRelations = relations(treatmentLines, ({ one }) => ({
  clinic: one(clinics, {
    fields: [treatmentLines.clinicId],
    references: [clinics.id],
  }),
  package: one(packages, {
    fields: [treatmentLines.packageId],
    references: [packages.id],
  }),
  patient: one(users, {
    fields: [treatmentLines.patientId],
    references: [users.id],
    relationName: "patient_treatment_lines",
  }),
}));
