import { pgTable, foreignKey, serial, integer, text, varchar, boolean, timestamp, numeric, json, bigint, date, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const clinicReviews = pgTable("clinic_reviews", {
	id: serial().primaryKey().notNull(),
	clinicId: integer("clinic_id").notNull(),
	userId: integer("user_id"),
	bookingId: integer("booking_id"),
	rating: integer().notNull(),
	reviewText: text("review_text"),
	treatment: varchar({ length: 100 }),
	verified: boolean().default(false),
	status: varchar({ length: 20 }).default('pending'),
	adminResponse: text("admin_response"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "clinic_reviews_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "clinic_reviews_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "clinic_reviews_booking_id_bookings_id_fk"
		}),
]);

export const clinics = pgTable("clinics", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	location: varchar({ length: 255 }),
	address: text(),
	city: varchar({ length: 100 }).default('Istanbul'),
	country: varchar({ length: 100 }).default('Turkey'),
	description: text(),
	email: varchar({ length: 255 }),
	phone: varchar({ length: 50 }),
	website: varchar({ length: 255 }),
	tier: varchar({ length: 20 }).default('standard'),
	rating: numeric({ precision: 3, scale:  1 }),
	reviewCount: integer("review_count").default(0),
	guarantee: varchar({ length: 50 }),
	features: json(),
	materials: json(),
	languages: json(),
	specialties: json(),
	treatments: json(),
	logoUrl: varchar("logo_url", { length: 255 }),
	mainImageUrl: varchar("main_image_url", { length: 255 }),
	galleryImages: json("gallery_images"),
	beforeAfterImages: json("before_after_images").default([]),
	clinicTourVideos: json("clinic_tour_videos").default([]),
	testimonialVideos: json("testimonial_videos").default([]),
	adminNotes: text("admin_notes"),
	active: boolean().default(true),
	featured: boolean().default(false),
	verified: boolean().default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const files = pgTable("files", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	bookingId: integer("booking_id"),
	quoteRequestId: integer("quote_request_id"),
	treatmentPlanId: integer("treatment_plan_id"),
	uploadedById: integer("uploaded_by_id"),
	filename: varchar({ length: 255 }).notNull(),
	originalName: varchar("original_name", { length: 255 }),
	mimetype: varchar({ length: 100 }),
	fileType: varchar("file_type", { length: 50 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fileSize: bigint("file_size", { mode: "number" }),
	fileUrl: varchar("file_url", { length: 255 }),
	fileCategory: varchar("file_category", { length: 50 }).default('xray'),
	visibility: varchar({ length: 20 }).default('private'),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "files_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "files_booking_id_bookings_id_fk"
		}),
	foreignKey({
			columns: [table.quoteRequestId],
			foreignColumns: [quoteRequests.id],
			name: "files_quote_request_id_quote_requests_id_fk"
		}),
	foreignKey({
			columns: [table.treatmentPlanId],
			foreignColumns: [treatmentPlans.id],
			name: "files_treatment_plan_id_treatment_plans_id_fk"
		}),
	foreignKey({
			columns: [table.uploadedById],
			foreignColumns: [users.id],
			name: "files_uploaded_by_id_users_id_fk"
		}),
]);

export const quoteVersions = pgTable("quote_versions", {
	id: serial().primaryKey().notNull(),
	quoteRequestId: integer("quote_request_id").notNull(),
	versionNumber: integer("version_number").notNull(),
	createdById: integer("created_by_id"),
	status: varchar({ length: 50 }).default('draft').notNull(),
	quoteData: json("quote_data").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.quoteRequestId],
			foreignColumns: [quoteRequests.id],
			name: "quote_versions_quote_request_id_quote_requests_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "quote_versions_created_by_id_users_id_fk"
		}),
]);

export const messages = pgTable("messages", {
	id: serial().primaryKey().notNull(),
	bookingId: integer("booking_id").notNull(),
	senderId: integer("sender_id").notNull(),
	recipientId: integer("recipient_id"),
	content: text().notNull(),
	isRead: boolean("is_read").default(false),
	readAt: timestamp("read_at", { mode: 'string' }),
	hasAttachment: boolean("has_attachment").default(false),
	attachmentId: integer("attachment_id"),
	messageType: varchar("message_type", { length: 20 }).default('text'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "messages_booking_id_bookings_id_fk"
		}),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "messages_sender_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.recipientId],
			foreignColumns: [users.id],
			name: "messages_recipient_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.attachmentId],
			foreignColumns: [files.id],
			name: "messages_attachment_id_files_id_fk"
		}),
]);

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	title: varchar({ length: 100 }).notNull(),
	message: text().notNull(),
	content: text(),
	isRead: boolean("is_read").default(false),
	type: varchar({ length: 20 }).default('info'),
	action: varchar({ length: 255 }),
	entityType: varchar("entity_type", { length: 50 }),
	entityId: integer("entity_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const payments = pgTable("payments", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	bookingId: integer("booking_id"),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	currency: varchar({ length: 3 }).default('GBP').notNull(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	paymentMethod: varchar("payment_method", { length: 50 }),
	paymentType: varchar("payment_type", { length: 50 }).default('deposit').notNull(),
	transactionId: varchar("transaction_id", { length: 255 }),
	stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
	receiptUrl: varchar("receipt_url", { length: 255 }),
	notes: text(),
	adminNotes: text("admin_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "payments_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "payments_booking_id_bookings_id_fk"
		}),
]);

export const hotelBookings = pgTable("hotel_bookings", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	bookingId: integer("booking_id"),
	treatmentPlanId: integer("treatment_plan_id"),
	hotelId: integer("hotel_id"),
	checkInDate: date("check_in_date").notNull(),
	checkOutDate: date("check_out_date").notNull(),
	roomType: varchar("room_type", { length: 100 }),
	numberOfGuests: integer("number_of_guests").default(1),
	accommodationPackage: varchar("accommodation_package", { length: 50 }).default('standard'),
	status: varchar({ length: 50 }).default('pending').notNull(),
	confirmationNumber: varchar("confirmation_number", { length: 50 }),
	providedBy: varchar("provided_by", { length: 50 }).default('clinic'),
	providerDetails: json("provider_details"),
	totalCost: numeric("total_cost", { precision: 10, scale:  2 }),
	currency: varchar({ length: 3 }).default('GBP'),
	includesBreakfast: boolean("includes_breakfast").default(true),
	additionalServices: json("additional_services"),
	specialRequests: text("special_requests"),
	adminNotes: text("admin_notes"),
	createdById: integer("created_by_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "hotel_bookings_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "hotel_bookings_booking_id_bookings_id_fk"
		}),
	foreignKey({
			columns: [table.treatmentPlanId],
			foreignColumns: [treatmentPlans.id],
			name: "hotel_bookings_treatment_plan_id_treatment_plans_id_fk"
		}),
	foreignKey({
			columns: [table.hotelId],
			foreignColumns: [hotels.id],
			name: "hotel_bookings_hotel_id_hotels_id_fk"
		}),
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "hotel_bookings_created_by_id_users_id_fk"
		}),
]);

export const quoteRequests = pgTable("quote_requests", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	phone: varchar({ length: 50 }),
	treatment: text().notNull(),
	specificTreatment: text("specific_treatment"),
	otherTreatment: text("other_treatment"),
	departureCity: varchar("departure_city", { length: 100 }),
	travelMonth: varchar("travel_month", { length: 50 }),
	hotelAccommodation: varchar("hotel_accommodation", { length: 20 }).default('clinic_decide'),
	needsAccommodation: boolean("needs_accommodation").default(false),
	accommodationType: varchar("accommodation_type", { length: 50 }),
	hasXrays: boolean("has_xrays").default(false),
	xrayCount: integer("xray_count"),
	budget: varchar({ length: 50 }),
	dates: varchar({ length: 100 }),
	notes: text(),
	status: varchar({ length: 50 }).default('pending').notNull(),
	quoteData: json("quote_data"),
	specialOffer: json("special_offer"),
	selectedClinicId: integer("selected_clinic_id"),
	adminNotes: text("admin_notes"),
	clinicNotes: text("clinic_notes"),
	viewedByAdmin: boolean("viewed_by_admin").default(false),
	viewedByClinic: boolean("viewed_by_clinic").default(false),
	consent: boolean().default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "quote_requests_user_id_users_id_fk"
		}),
]);

export const hotels = pgTable("hotels", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	address: text(),
	city: varchar({ length: 100 }).default('Istanbul'),
	country: varchar({ length: 100 }).default('Turkey'),
	starRating: numeric("star_rating", { precision: 2, scale:  1 }),
	description: text(),
	amenities: json(),
	mainImageUrl: varchar("main_image_url", { length: 255 }),
	galleryImages: json("gallery_images"),
	latitude: numeric({ precision: 10, scale:  6 }),
	longitude: numeric({ precision: 10, scale:  6 }),
	distanceToClinic: json("distance_to_clinic"),
	contactPhone: varchar("contact_phone", { length: 50 }),
	contactEmail: varchar("contact_email", { length: 255 }),
	website: varchar({ length: 255 }),
	isActive: boolean("is_active").default(true),
	isPartner: boolean("is_partner").default(false),
	adminNotes: text("admin_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
	id: serial().primaryKey().notNull(),
	bookingReference: varchar("booking_reference", { length: 20 }),
	userId: integer("user_id").notNull(),
	quoteRequestId: integer("quote_request_id"),
	clinicId: integer("clinic_id"),
	treatmentPlanId: integer("treatment_plan_id"),
	assignedAdminId: integer("assigned_admin_id"),
	assignedClinicStaffId: integer("assigned_clinic_staff_id"),
	status: varchar({ length: 50 }).default('pending').notNull(),
	stage: varchar({ length: 50 }).default('deposit'),
	depositPaid: boolean("deposit_paid").default(false),
	depositAmount: numeric("deposit_amount", { precision: 10, scale:  2 }).default('200.00'),
	totalPaid: numeric("total_paid", { precision: 10, scale:  2 }).default('0.00'),
	balanceDue: numeric("balance_due", { precision: 10, scale:  2 }),
	arrivalDate: date("arrival_date"),
	departureDate: date("departure_date"),
	flightNumber: varchar("flight_number", { length: 50 }),
	accommodationType: varchar("accommodation_type", { length: 50 }),
	accommodationDetails: text("accommodation_details"),
	treatmentNotes: text("treatment_notes"),
	patientNotes: text("patient_notes"),
	adminNotes: text("admin_notes"),
	clinicNotes: text("clinic_notes"),
	lastPatientMessageAt: timestamp("last_patient_message_at", { mode: 'string' }),
	lastClinicMessageAt: timestamp("last_clinic_message_at", { mode: 'string' }),
	lastAdminMessageAt: timestamp("last_admin_message_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "bookings_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.quoteRequestId],
			foreignColumns: [quoteRequests.id],
			name: "bookings_quote_request_id_quote_requests_id_fk"
		}),
	foreignKey({
			columns: [table.treatmentPlanId],
			foreignColumns: [treatmentPlans.id],
			name: "bookings_treatment_plan_id_treatment_plans_id_fk"
		}),
	foreignKey({
			columns: [table.assignedAdminId],
			foreignColumns: [users.id],
			name: "bookings_assigned_admin_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.assignedClinicStaffId],
			foreignColumns: [users.id],
			name: "bookings_assigned_clinic_staff_id_users_id_fk"
		}),
	unique("bookings_booking_reference_unique").on(table.bookingReference),
	unique("bookings_quote_request_id_unique").on(table.quoteRequestId),
]);

export const appointments = pgTable("appointments", {
	id: serial().primaryKey().notNull(),
	bookingId: integer("booking_id"),
	clinicId: integer("clinic_id"),
	title: varchar({ length: 100 }).notNull(),
	description: text(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }).notNull(),
	type: varchar({ length: 50 }).default('consultation'),
	status: varchar({ length: 50 }).default('scheduled'),
	clinicNotes: text("clinic_notes"),
	adminNotes: text("admin_notes"),
	reminderSent: boolean("reminder_sent").default(false),
	followUpRequired: boolean("follow_up_required").default(false),
	createdById: integer("created_by_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bookingId],
			foreignColumns: [bookings.id],
			name: "appointments_booking_id_bookings_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "appointments_created_by_id_users_id_fk"
		}),
]);

export const treatmentPlans = pgTable("treatment_plans", {
	id: serial().primaryKey().notNull(),
	patientId: integer("patient_id").notNull(),
	clinicId: integer("clinic_id"),
	createdById: integer("created_by_id"),
	status: varchar({ length: 50 }).default('draft').notNull(),
	treatmentDetails: json("treatment_details").notNull(),
	estimatedTotalCost: numeric("estimated_total_cost", { precision: 10, scale:  2 }),
	currency: varchar({ length: 3 }).default('GBP'),
	includesHotel: boolean("includes_hotel").default(false),
	hotelDetails: json("hotel_details"),
	notes: text(),
	portalStatus: varchar("portal_status", { length: 50 }).default('active'),
	quoteRequestId: integer("quote_request_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [users.id],
			name: "treatment_plans_patient_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.createdById],
			foreignColumns: [users.id],
			name: "treatment_plans_created_by_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.quoteRequestId],
			foreignColumns: [quoteRequests.id],
			name: "treatment_plans_quote_request_id_quote_requests_id_fk"
		}),
]);

export const verificationTokens = pgTable("verification_tokens", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	token: varchar({ length: 64 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	type: varchar({ length: 20 }).notNull(),
	used: boolean().default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "verification_tokens_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }),
	firstName: varchar("first_name", { length: 100 }),
	lastName: varchar("last_name", { length: 100 }),
	phone: varchar({ length: 50 }),
	profileImage: varchar("profile_image", { length: 255 }),
	address: varchar({ length: 255 }),
	dateOfBirth: varchar("date_of_birth", { length: 20 }),
	nationality: varchar({ length: 100 }),
	preferredLanguage: varchar("preferred_language", { length: 50 }).default('English'),
	passportNumber: varchar("passport_number", { length: 50 }),
	emergencyContact: json("emergency_contact"),
	medicalInfo: json("medical_info"),
	role: varchar({ length: 20 }).default('patient').notNull(),
	clinicId: integer("clinic_id"),
	jobTitle: varchar("job_title", { length: 100 }),
	lastLogin: timestamp("last_login", { mode: 'string' }),
	emailVerified: boolean("email_verified").default(false),
	profileComplete: boolean("profile_complete").default(false),
	status: varchar({ length: 20 }).default('active'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	googleId: varchar("google_id", { length: 255 }),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_google_id_unique").on(table.googleId),
]);

export const treatmentPackages = pgTable("treatment_packages", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	packagePrice: numeric("package_price").notNull(),
	originalPrice: numeric("original_price").notNull(),
	clinicId: text("clinic_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const packageInclusions = pgTable("package_inclusions", {
	packageId: text("package_id"),
	inclusionType: text("inclusion_type").notNull(),
	description: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.packageId],
			foreignColumns: [treatmentPackages.id],
			name: "package_inclusions_package_id_treatment_packages_id_fk"
		}),
]);

export const packageTreatments = pgTable("package_treatments", {
	packageId: text("package_id"),
	treatmentType: text("treatment_type").notNull(),
	treatmentName: text("treatment_name").notNull(),
	quantity: integer().default(1).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.packageId],
			foreignColumns: [treatmentPackages.id],
			name: "package_treatments_package_id_treatment_packages_id_fk"
		}),
]);
