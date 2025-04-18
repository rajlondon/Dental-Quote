import { db } from "./db";
import { eq, and, desc, asc, or, isNull, sql } from "drizzle-orm";
import createMemoryStore from "memorystore";
import session from "express-session";
import {
  users, User, InsertUser,
  quoteRequests, QuoteRequest, InsertQuoteRequest,
  quoteVersions, QuoteVersion, InsertQuoteVersion,
  treatmentPlans, TreatmentPlan, InsertTreatmentPlan,
  bookings, Booking, InsertBooking,
  payments, Payment, InsertPayment,
  appointments, Appointment, InsertAppointment,
  files, File, InsertFile,
  messages, Message, InsertMessage,
  clinics, Clinic, InsertClinic,
  clinicReviews, ClinicReview, InsertClinicReview,
  notifications, Notification, InsertNotification
} from "@shared/schema";

// Memory store for session storage
const MemoryStore = createMemoryStore(session);

// Storage interface for all database operations
export interface IStorage {
  // Session store for authentication
  sessionStore: any; // Using express-session store

  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(data: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Quote management
  getQuoteRequest(id: number): Promise<QuoteRequest | undefined>;
  getQuoteRequestsByUserId(userId: number): Promise<QuoteRequest[]>;
  getQuoteRequestsByClinicId(clinicId: number): Promise<QuoteRequest[]>;
  getAllQuoteRequests(filters?: Partial<QuoteRequest>): Promise<QuoteRequest[]>;
  createQuoteRequest(data: InsertQuoteRequest): Promise<QuoteRequest>;
  updateQuoteRequest(id: number, data: Partial<QuoteRequest>): Promise<QuoteRequest | undefined>;
  
  // Quote versions
  getQuoteVersions(quoteRequestId: number): Promise<QuoteVersion[]>;
  getLatestQuoteVersion(quoteRequestId: number): Promise<QuoteVersion | undefined>;
  createQuoteVersion(data: InsertQuoteVersion): Promise<QuoteVersion>;
  
  // Treatment plans
  getTreatmentPlan(id: number): Promise<TreatmentPlan | undefined>;
  getTreatmentPlansByPatientId(patientId: number): Promise<TreatmentPlan[]>;
  getTreatmentPlansByClinicId(clinicId: number): Promise<TreatmentPlan[]>;
  getTreatmentPlanByQuoteRequestId(quoteRequestId: number): Promise<TreatmentPlan | undefined>;
  createTreatmentPlan(data: InsertTreatmentPlan): Promise<TreatmentPlan>;
  updateTreatmentPlan(id: number, data: Partial<TreatmentPlan>): Promise<TreatmentPlan | undefined>;
  getFilesByTreatmentPlanId(treatmentPlanId: number): Promise<File[]>;
  
  // Bookings
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByQuoteRequestId(quoteRequestId: number): Promise<Booking | undefined>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  getBookingsByClinicId(clinicId: number): Promise<Booking[]>;
  createBooking(data: InsertBooking): Promise<Booking>;
  updateBooking(id: number, data: Partial<Booking>): Promise<Booking | undefined>;
  
  // Appointments
  getAppointmentsByBookingId(bookingId: number): Promise<Appointment[]>;
  getAppointmentsByClinicId(clinicId: number, date?: Date): Promise<Appointment[]>;
  createAppointment(data: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined>;
  
  // Payments
  getPaymentsByBookingId(bookingId: number): Promise<Payment[]>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  createPayment(data: InsertPayment): Promise<Payment>;
  updatePayment(id: number, data: Partial<Payment>): Promise<Payment | undefined>;
  
  // Files
  getFile(id: number): Promise<File | undefined>;
  getFilesByBookingId(bookingId: number): Promise<File[]>;
  getFilesByQuoteRequestId(quoteRequestId: number): Promise<File[]>;
  getFilesByUserId(userId: number): Promise<File[]>;
  getFilesByTreatmentPlanId(treatmentPlanId: number): Promise<File[]>;
  createFile(data: InsertFile): Promise<File>;
  updateFile(id: number, data: Partial<File>): Promise<File | undefined>;
  deleteFile(id: number): Promise<void>;
  
  // Messages
  getMessagesByBookingId(bookingId: number): Promise<Message[]>;
  getMessageThreads(userId: number): Promise<any[]>;
  createMessage(data: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<void>;
  
  // Clinics
  getClinic(id: number): Promise<Clinic | undefined>;
  getAllClinics(filters?: Partial<Clinic>): Promise<Clinic[]>;
  createClinic(data: InsertClinic): Promise<Clinic>;
  updateClinic(id: number, data: Partial<Clinic>): Promise<Clinic | undefined>;
  
  // Clinic reviews
  getClinicReviews(clinicId: number): Promise<ClinicReview[]>;
  createClinicReview(data: InsertClinicReview): Promise<ClinicReview>;
  
  // Notifications
  getUserNotifications(userId: number, unreadOnly?: boolean): Promise<Notification[]>;
  createNotification(data: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Stats and aggregations
  getDashboardStats(userRole: string, id: number): Promise<any>;
}

// Database implementation of IStorage
export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using express-session store

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // === User Management ===
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // === Quote Management ===
  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    const [quoteRequest] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id));
    return quoteRequest;
  }

  async getQuoteRequestsByUserId(userId: number): Promise<QuoteRequest[]> {
    return db.select().from(quoteRequests).where(eq(quoteRequests.userId, userId));
  }

  async getQuoteRequestsByClinicId(clinicId: number): Promise<QuoteRequest[]> {
    return db.select().from(quoteRequests).where(eq(quoteRequests.selectedClinicId, clinicId));
  }

  async getAllQuoteRequests(filters?: Partial<QuoteRequest>): Promise<QuoteRequest[]> {
    if (!filters) {
      return db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt));
    }

    // Build the filter conditions
    const conditions = [];
    if (filters.status) conditions.push(eq(quoteRequests.status, filters.status));
    if (filters.selectedClinicId) conditions.push(eq(quoteRequests.selectedClinicId, filters.selectedClinicId));
    if (filters.hasXrays !== undefined) conditions.push(eq(quoteRequests.hasXrays, filters.hasXrays));
    
    if (conditions.length === 0) {
      return db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt));
    }

    return db
      .select()
      .from(quoteRequests)
      .where(and(...conditions))
      .orderBy(desc(quoteRequests.createdAt));
  }

  async createQuoteRequest(data: InsertQuoteRequest): Promise<QuoteRequest> {
    const [quoteRequest] = await db.insert(quoteRequests).values(data).returning();
    return quoteRequest;
  }

  async updateQuoteRequest(id: number, data: Partial<QuoteRequest>): Promise<QuoteRequest | undefined> {
    const [quoteRequest] = await db
      .update(quoteRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(quoteRequests.id, id))
      .returning();
    return quoteRequest;
  }

  // === Quote Versions ===
  async getQuoteVersions(quoteRequestId: number): Promise<QuoteVersion[]> {
    return db
      .select()
      .from(quoteVersions)
      .where(eq(quoteVersions.quoteRequestId, quoteRequestId))
      .orderBy(desc(quoteVersions.versionNumber));
  }

  async getLatestQuoteVersion(quoteRequestId: number): Promise<QuoteVersion | undefined> {
    const [version] = await db
      .select()
      .from(quoteVersions)
      .where(eq(quoteVersions.quoteRequestId, quoteRequestId))
      .orderBy(desc(quoteVersions.versionNumber))
      .limit(1);
    return version;
  }

  async createQuoteVersion(data: InsertQuoteVersion): Promise<QuoteVersion> {
    const [version] = await db.insert(quoteVersions).values(data).returning();
    return version;
  }

  // === Treatment Plans ===
  async getTreatmentPlan(id: number): Promise<TreatmentPlan | undefined> {
    const [plan] = await db.select().from(treatmentPlans).where(eq(treatmentPlans.id, id));
    return plan;
  }

  async getTreatmentPlansByPatientId(patientId: number): Promise<TreatmentPlan[]> {
    return db
      .select()
      .from(treatmentPlans)
      .where(eq(treatmentPlans.patientId, patientId))
      .orderBy(desc(treatmentPlans.createdAt));
  }

  async getTreatmentPlansByClinicId(clinicId: number): Promise<TreatmentPlan[]> {
    return db
      .select()
      .from(treatmentPlans)
      .where(eq(treatmentPlans.clinicId, clinicId))
      .orderBy(desc(treatmentPlans.createdAt));
  }
  
  async getTreatmentPlanByQuoteRequestId(quoteRequestId: number): Promise<TreatmentPlan | undefined> {
    const [plan] = await db
      .select()
      .from(treatmentPlans)
      .where(eq(treatmentPlans.quoteRequestId, quoteRequestId));
    return plan;
  }
  
  async createTreatmentPlan(data: InsertTreatmentPlan): Promise<TreatmentPlan> {
    const [plan] = await db.insert(treatmentPlans).values(data).returning();
    return plan;
  }
  
  async updateTreatmentPlan(id: number, data: Partial<TreatmentPlan>): Promise<TreatmentPlan | undefined> {
    // Convert number to string for estimatedTotalCost if needed
    const formattedData = {
      ...data,
      estimatedTotalCost: data.estimatedTotalCost !== undefined ? 
        String(data.estimatedTotalCost) : undefined,
      updatedAt: new Date()
    };
    
    const [plan] = await db
      .update(treatmentPlans)
      .set(formattedData)
      .where(eq(treatmentPlans.id, id))
      .returning();
    return plan;
  }
  
  async getFilesByTreatmentPlanId(treatmentPlanId: number): Promise<File[]> {
    return db
      .select()
      .from(files)
      .where(eq(files.treatmentPlanId, treatmentPlanId))
      .orderBy(desc(files.createdAt));
  }



  // === Bookings ===
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingByQuoteRequestId(quoteRequestId: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.quoteRequestId, quoteRequestId));
    return booking;
  }

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getBookingsByClinicId(clinicId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.clinicId, clinicId));
  }

  async createBooking(data: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(data).returning();
    return booking;
  }

  async updateBooking(id: number, data: Partial<Booking>): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // === Appointments ===
  async getAppointmentsByBookingId(bookingId: number): Promise<Appointment[]> {
    return db
      .select()
      .from(appointments)
      .where(eq(appointments.bookingId, bookingId))
      .orderBy(asc(appointments.startTime));
  }

  async getAppointmentsByClinicId(clinicId: number, date?: Date): Promise<Appointment[]> {
    if (date) {
      // Convert the date to start and end of the specified day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      return db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.clinicId, clinicId),
            appointments.startTime >= startDate,
            appointments.startTime <= endDate
          )
        )
        .orderBy(asc(appointments.startTime));
    }
    
    return db
      .select()
      .from(appointments)
      .where(eq(appointments.clinicId, clinicId))
      .orderBy(asc(appointments.startTime));
  }

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(data).returning();
    return appointment;
  }

  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  // === Payments ===
  async getPaymentsByBookingId(bookingId: number): Promise<Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
      .orderBy(desc(payments.createdAt));
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(data: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  async updatePayment(id: number, data: Partial<Payment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // === Files ===
  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }
  
  async getFilesByBookingId(bookingId: number): Promise<File[]> {
    return db
      .select()
      .from(files)
      .where(eq(files.bookingId, bookingId))
      .orderBy(desc(files.createdAt));
  }

  async getFilesByQuoteRequestId(quoteRequestId: number): Promise<File[]> {
    return db
      .select()
      .from(files)
      .where(eq(files.quoteRequestId, quoteRequestId))
      .orderBy(desc(files.createdAt));
  }

  async getFilesByUserId(userId: number): Promise<File[]> {
    return db
      .select()
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(files.createdAt));
  }
  
  async getFilesByTreatmentPlanId(treatmentPlanId: number): Promise<File[]> {
    return db
      .select()
      .from(files)
      .where(eq(files.treatmentPlanId, treatmentPlanId))
      .orderBy(desc(files.createdAt));
  }

  async createFile(data: InsertFile): Promise<File> {
    const [file] = await db.insert(files).values(data).returning();
    return file;
  }
  
  async updateFile(id: number, data: Partial<File>): Promise<File | undefined> {
    const [file] = await db
      .update(files)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return file;
  }
  
  async deleteFile(id: number): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  // === Messages ===
  async getMessagesByBookingId(bookingId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.bookingId, bookingId))
      .orderBy(asc(messages.createdAt));
  }

  async getMessageThreads(userId: number): Promise<any[]> {
    // This is a complex query that would return unique threads with their latest message
    // For now, we'll return a simplified version
    return db
      .select({
        bookingId: messages.bookingId,
        lastMessage: messages.content,
        lastMessageTime: messages.createdAt,
        senderId: messages.senderId,
        recipientId: messages.recipientId,
        isRead: messages.isRead
      })
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.recipientId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(data).returning();
    
    // Update the relevant "lastMessageAt" field in the booking
    if (message.bookingId) {
      const bookingUpdate: Partial<Booking> = {};
      
      // Determine which field to update based on the sender's role
      const sender = await this.getUser(message.senderId);
      if (sender) {
        switch (sender.role) {
          case 'patient':
            bookingUpdate.lastPatientMessageAt = message.createdAt;
            break;
          case 'clinic_staff':
            bookingUpdate.lastClinicMessageAt = message.createdAt;
            break;
          case 'admin':
            bookingUpdate.lastAdminMessageAt = message.createdAt;
            break;
        }
        
        // Update the booking if we have a field to update
        if (Object.keys(bookingUpdate).length > 0) {
          await this.updateBooking(message.bookingId, bookingUpdate);
        }
      }
    }
    
    return message;
  }

  async markMessageAsRead(id: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(messages.id, id));
  }

  // === Clinics ===
  async getClinic(id: number): Promise<Clinic | undefined> {
    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id));
    return clinic;
  }

  async getAllClinics(filters?: Partial<Clinic>): Promise<Clinic[]> {
    if (!filters) {
      return db.select().from(clinics).where(eq(clinics.active, true));
    }

    // Build the filter conditions
    const conditions = [];
    if (filters.tier) conditions.push(eq(clinics.tier, filters.tier));
    if (filters.city) conditions.push(eq(clinics.city, filters.city));
    if (filters.featured !== undefined) conditions.push(eq(clinics.featured, filters.featured));
    
    // Always filter for active clinics unless explicitly set to false
    if (filters.active !== false) {
      conditions.push(eq(clinics.active, true));
    }
    
    if (conditions.length === 0) {
      return db.select().from(clinics).where(eq(clinics.active, true));
    }

    return db
      .select()
      .from(clinics)
      .where(and(...conditions));
  }

  async createClinic(data: InsertClinic): Promise<Clinic> {
    const [clinic] = await db.insert(clinics).values(data).returning();
    return clinic;
  }

  async updateClinic(id: number, data: Partial<Clinic>): Promise<Clinic | undefined> {
    const [clinic] = await db
      .update(clinics)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clinics.id, id))
      .returning();
    return clinic;
  }

  // === Clinic Reviews ===
  async getClinicReviews(clinicId: number): Promise<ClinicReview[]> {
    return db
      .select()
      .from(clinicReviews)
      .where(
        and(
          eq(clinicReviews.clinicId, clinicId),
          eq(clinicReviews.status, 'approved')
        )
      )
      .orderBy(desc(clinicReviews.createdAt));
  }

  async createClinicReview(data: InsertClinicReview): Promise<ClinicReview> {
    const [review] = await db.insert(clinicReviews).values(data).returning();
    
    // Update the clinic's rating and review count
    const clinic = await this.getClinic(data.clinicId);
    if (clinic) {
      const allApprovedReviews = await db
        .select()
        .from(clinicReviews)
        .where(
          and(
            eq(clinicReviews.clinicId, data.clinicId),
            eq(clinicReviews.status, 'approved')
          )
        );
      
      // Calculate the new average rating
      const totalRating = allApprovedReviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = allApprovedReviews.length > 0 ? totalRating / allApprovedReviews.length : 0;
      
      // Update the clinic
      await this.updateClinic(data.clinicId, {
        rating: avgRating,
        reviewCount: allApprovedReviews.length
      });
    }
    
    return review;
  }

  // === Notifications ===
  async getUserNotifications(userId: number, unreadOnly: boolean = false): Promise<Notification[]> {
    if (unreadOnly) {
      return db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        )
        .orderBy(desc(notifications.createdAt));
    }
    
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // === Dashboard Stats ===
  async getDashboardStats(userRole: string, id: number): Promise<any> {
    let stats: any = {};
    
    switch(userRole) {
      case 'admin':
        // Admin dashboard stats - platform-wide
        const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
        const totalBookings = await db.select({ count: sql`count(*)` }).from(bookings);
        const pendingQuotes = await db
          .select({ count: sql`count(*)` })
          .from(quoteRequests)
          .where(eq(quoteRequests.status, 'pending'));
        
        stats = {
          totalUsers: totalUsers[0]?.count || 0,
          totalBookings: totalBookings[0]?.count || 0,
          pendingQuotes: pendingQuotes[0]?.count || 0,
          // Add more stats as needed
        };
        break;
        
      case 'clinic_staff':
        // Clinic dashboard stats - clinic specific
        const clinicBookings = await db
          .select({ count: sql`count(*)` })
          .from(bookings)
          .where(eq(bookings.clinicId, id));
        
        const upcomingAppointments = await db
          .select({ count: sql`count(*)` })
          .from(appointments)
          .where(
            and(
              eq(appointments.clinicId, id),
              appointments.startTime > new Date(),
              eq(appointments.status, 'scheduled')
            )
          );
        
        const clinicQuotes = await db
          .select({ count: sql`count(*)` })
          .from(quoteRequests)
          .where(eq(quoteRequests.selectedClinicId, id));
        
        stats = {
          totalBookings: clinicBookings[0]?.count || 0,
          upcomingAppointments: upcomingAppointments[0]?.count || 0,
          totalQuotes: clinicQuotes[0]?.count || 0,
          // Add more stats as needed
        };
        break;
        
      case 'patient':
        // Patient dashboard stats - user specific
        const userBookings = await db
          .select({ count: sql`count(*)` })
          .from(bookings)
          .where(eq(bookings.userId, id));
        
        const userAppointments = await db
          .select({ count: sql`count(*)` })
          .from(appointments)
          .innerJoin(bookings, eq(appointments.bookingId, bookings.id))
          .where(
            and(
              eq(bookings.userId, id),
              appointments.startTime > new Date(),
              eq(appointments.status, 'scheduled')
            )
          );
        
        const userUnreadMessages = await db
          .select({ count: sql`count(*)` })
          .from(messages)
          .where(
            and(
              eq(messages.recipientId, id),
              eq(messages.isRead, false)
            )
          );
        
        stats = {
          totalBookings: userBookings[0]?.count || 0,
          upcomingAppointments: userAppointments[0]?.count || 0,
          unreadMessages: userUnreadMessages[0]?.count || 0,
          // Add more stats as needed
        };
        break;
    }
    
    return stats;
  }
}

// Export an instance of the storage class
export const storage = new DatabaseStorage();