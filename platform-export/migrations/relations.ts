import { relations } from "drizzle-orm/relations";
import { clinics, clinicReviews, users, bookings, files, quoteRequests, treatmentPlans, quoteVersions, messages, notifications, payments, hotelBookings, hotels, appointments, verificationTokens, treatmentPackages, packageInclusions, packageTreatments } from "./schema";

export const clinicReviewsRelations = relations(clinicReviews, ({one}) => ({
	clinic: one(clinics, {
		fields: [clinicReviews.clinicId],
		references: [clinics.id]
	}),
	user: one(users, {
		fields: [clinicReviews.userId],
		references: [users.id]
	}),
	booking: one(bookings, {
		fields: [clinicReviews.bookingId],
		references: [bookings.id]
	}),
}));

export const clinicsRelations = relations(clinics, ({many}) => ({
	clinicReviews: many(clinicReviews),
}));

export const usersRelations = relations(users, ({many}) => ({
	clinicReviews: many(clinicReviews),
	files_userId: many(files, {
		relationName: "files_userId_users_id"
	}),
	files_uploadedById: many(files, {
		relationName: "files_uploadedById_users_id"
	}),
	quoteVersions: many(quoteVersions),
	messages_senderId: many(messages, {
		relationName: "messages_senderId_users_id"
	}),
	messages_recipientId: many(messages, {
		relationName: "messages_recipientId_users_id"
	}),
	notifications: many(notifications),
	payments: many(payments),
	hotelBookings_userId: many(hotelBookings, {
		relationName: "hotelBookings_userId_users_id"
	}),
	hotelBookings_createdById: many(hotelBookings, {
		relationName: "hotelBookings_createdById_users_id"
	}),
	quoteRequests: many(quoteRequests),
	bookings_userId: many(bookings, {
		relationName: "bookings_userId_users_id"
	}),
	bookings_assignedAdminId: many(bookings, {
		relationName: "bookings_assignedAdminId_users_id"
	}),
	bookings_assignedClinicStaffId: many(bookings, {
		relationName: "bookings_assignedClinicStaffId_users_id"
	}),
	appointments: many(appointments),
	treatmentPlans_patientId: many(treatmentPlans, {
		relationName: "treatmentPlans_patientId_users_id"
	}),
	treatmentPlans_createdById: many(treatmentPlans, {
		relationName: "treatmentPlans_createdById_users_id"
	}),
	verificationTokens: many(verificationTokens),
}));

export const bookingsRelations = relations(bookings, ({one, many}) => ({
	clinicReviews: many(clinicReviews),
	files: many(files),
	messages: many(messages),
	payments: many(payments),
	hotelBookings: many(hotelBookings),
	user_userId: one(users, {
		fields: [bookings.userId],
		references: [users.id],
		relationName: "bookings_userId_users_id"
	}),
	quoteRequest: one(quoteRequests, {
		fields: [bookings.quoteRequestId],
		references: [quoteRequests.id]
	}),
	treatmentPlan: one(treatmentPlans, {
		fields: [bookings.treatmentPlanId],
		references: [treatmentPlans.id]
	}),
	user_assignedAdminId: one(users, {
		fields: [bookings.assignedAdminId],
		references: [users.id],
		relationName: "bookings_assignedAdminId_users_id"
	}),
	user_assignedClinicStaffId: one(users, {
		fields: [bookings.assignedClinicStaffId],
		references: [users.id],
		relationName: "bookings_assignedClinicStaffId_users_id"
	}),
	appointments: many(appointments),
}));

export const filesRelations = relations(files, ({one, many}) => ({
	user_userId: one(users, {
		fields: [files.userId],
		references: [users.id],
		relationName: "files_userId_users_id"
	}),
	booking: one(bookings, {
		fields: [files.bookingId],
		references: [bookings.id]
	}),
	quoteRequest: one(quoteRequests, {
		fields: [files.quoteRequestId],
		references: [quoteRequests.id]
	}),
	treatmentPlan: one(treatmentPlans, {
		fields: [files.treatmentPlanId],
		references: [treatmentPlans.id]
	}),
	user_uploadedById: one(users, {
		fields: [files.uploadedById],
		references: [users.id],
		relationName: "files_uploadedById_users_id"
	}),
	messages: many(messages),
}));

export const quoteRequestsRelations = relations(quoteRequests, ({one, many}) => ({
	files: many(files),
	quoteVersions: many(quoteVersions),
	user: one(users, {
		fields: [quoteRequests.userId],
		references: [users.id]
	}),
	bookings: many(bookings),
	treatmentPlans: many(treatmentPlans),
}));

export const treatmentPlansRelations = relations(treatmentPlans, ({one, many}) => ({
	files: many(files),
	hotelBookings: many(hotelBookings),
	bookings: many(bookings),
	user_patientId: one(users, {
		fields: [treatmentPlans.patientId],
		references: [users.id],
		relationName: "treatmentPlans_patientId_users_id"
	}),
	user_createdById: one(users, {
		fields: [treatmentPlans.createdById],
		references: [users.id],
		relationName: "treatmentPlans_createdById_users_id"
	}),
	quoteRequest: one(quoteRequests, {
		fields: [treatmentPlans.quoteRequestId],
		references: [quoteRequests.id]
	}),
}));

export const quoteVersionsRelations = relations(quoteVersions, ({one}) => ({
	quoteRequest: one(quoteRequests, {
		fields: [quoteVersions.quoteRequestId],
		references: [quoteRequests.id]
	}),
	user: one(users, {
		fields: [quoteVersions.createdById],
		references: [users.id]
	}),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	booking: one(bookings, {
		fields: [messages.bookingId],
		references: [bookings.id]
	}),
	user_senderId: one(users, {
		fields: [messages.senderId],
		references: [users.id],
		relationName: "messages_senderId_users_id"
	}),
	user_recipientId: one(users, {
		fields: [messages.recipientId],
		references: [users.id],
		relationName: "messages_recipientId_users_id"
	}),
	file: one(files, {
		fields: [messages.attachmentId],
		references: [files.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	user: one(users, {
		fields: [payments.userId],
		references: [users.id]
	}),
	booking: one(bookings, {
		fields: [payments.bookingId],
		references: [bookings.id]
	}),
}));

export const hotelBookingsRelations = relations(hotelBookings, ({one}) => ({
	user_userId: one(users, {
		fields: [hotelBookings.userId],
		references: [users.id],
		relationName: "hotelBookings_userId_users_id"
	}),
	booking: one(bookings, {
		fields: [hotelBookings.bookingId],
		references: [bookings.id]
	}),
	treatmentPlan: one(treatmentPlans, {
		fields: [hotelBookings.treatmentPlanId],
		references: [treatmentPlans.id]
	}),
	hotel: one(hotels, {
		fields: [hotelBookings.hotelId],
		references: [hotels.id]
	}),
	user_createdById: one(users, {
		fields: [hotelBookings.createdById],
		references: [users.id],
		relationName: "hotelBookings_createdById_users_id"
	}),
}));

export const hotelsRelations = relations(hotels, ({many}) => ({
	hotelBookings: many(hotelBookings),
}));

export const appointmentsRelations = relations(appointments, ({one}) => ({
	booking: one(bookings, {
		fields: [appointments.bookingId],
		references: [bookings.id]
	}),
	user: one(users, {
		fields: [appointments.createdById],
		references: [users.id]
	}),
}));

export const verificationTokensRelations = relations(verificationTokens, ({one}) => ({
	user: one(users, {
		fields: [verificationTokens.userId],
		references: [users.id]
	}),
}));

export const packageInclusionsRelations = relations(packageInclusions, ({one}) => ({
	treatmentPackage: one(treatmentPackages, {
		fields: [packageInclusions.packageId],
		references: [treatmentPackages.id]
	}),
}));

export const treatmentPackagesRelations = relations(treatmentPackages, ({many}) => ({
	packageInclusions: many(packageInclusions),
	packageTreatments: many(packageTreatments),
}));

export const packageTreatmentsRelations = relations(packageTreatments, ({one}) => ({
	treatmentPackage: one(treatmentPackages, {
		fields: [packageTreatments.packageId],
		references: [treatmentPackages.id]
	}),
}));