import { db } from "./db";
import { eq, and, desc, asc, or, isNull, sql, gte, lte } from "drizzle-orm";
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
  getUsersByClinicId(clinicId: number): Promise<User[]>;

  // Quote management
  getQuoteRequest(id: number): Promise<QuoteRequest | undefined>;
  getQuoteRequestsByUserId(userId: number): Promise<QuoteRequest[]>;
  getQuoteRequestsByClinicId(clinicId: number): Promise<QuoteRequest[]>;
  getAllQuoteRequests(filters?: Partial<QuoteRequest>): Promise<QuoteRequest[]>;
  createQuoteRequest(data: InsertQuoteRequest): Promise<QuoteRequest>;
  updateQuoteRequest(id: number, data: Partial<QuoteRequest>): Promise<QuoteRequest | undefined>;

  // File upload
  uploadFile(file: Express.Multer.File): Promise<{ url: string, filename: string }>;

  // Special offers
  updateSpecialOfferImage(offerId: string, imageUrl: string): Promise<boolean>;

  // Quote versions
  getQuoteVersions(quoteRequestId: number): Promise<QuoteVersion[]>;
  getLatestQuoteVersion(quoteRequestId: number): Promise<QuoteVersion | undefined>;
  createQuoteVersion(data: InsertQuoteVersion): Promise<QuoteVersion>;

  // File upload
  uploadFile(file: Express.Multer.File): Promise<{ url: string, filename: string }>;

  // Special offers
  updateSpecialOfferImage(offerId: string, imageUrl: string): Promise<boolean>;

  // Treatment plans
  getTreatmentPlanById(id: number): Promise<TreatmentPlan | undefined>;
  getTreatmentPlansByPatientId(patientId: number): Promise<TreatmentPlan[]>;
  getTreatmentPlansByClinicId(clinicId: number): Promise<TreatmentPlan[]>;
  getTreatmentPlanByQuoteRequestId(quoteRequestId: number): Promise<TreatmentPlan | undefined>;
  getAllTreatmentPlans(status?: string, search?: string): Promise<TreatmentPlan[]>;
  createTreatmentPlan(data: InsertTreatmentPlan): Promise<TreatmentPlan>;
  updateTreatmentPlan(id: number, data: Partial<TreatmentPlan>): Promise<TreatmentPlan | undefined>;
  deleteTreatmentPlan(id: number): Promise<void>;
  getFilesByTreatmentPlanId(treatmentPlanId: number): Promise<File[]>;

  // Bookings
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByQuoteRequestId(quoteRequestId: number): Promise<Booking | undefined>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  getBookingsByClinicId(clinicId: number): Promise<Booking[]>;
  createBooking(data: InsertBooking): Promise<Booking>;
  updateBooking(id: number, data: Partial<Booking>): Promise<Booking | undefined>;

  // Appointments
  getBookingAppointments(bookingId: number): Promise<Appointment[]>;
  getAppointmentsByBookingId(bookingId: number): Promise<Appointment[]>;
  getClinicAppointments(clinicId: number, dateStr?: string): Promise<Appointment[]>;
  getAppointmentsByClinicId(clinicId: number, date?: Date): Promise<Appointment[]>;
  createAppointment(data: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<void>;

  // Payments
  getPaymentsByBookingId(bookingId: number): Promise<Payment[]>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  getAllPayments(limit?: number): Promise<Payment[]>;
  getPaymentById(id: number): Promise<Payment | undefined>;
  createPayment(data: InsertPayment): Promise<Payment>;
  updatePayment(id: number, data: Partial<Payment>): Promise<Payment | undefined>;
  createPaymentFromStripe(stripePaymentIntentId: string, paymentData: Partial<InsertPayment>): Promise<Payment>;

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

  // Additional booking methods
  getAllBookings(filters?: { status?: string, stage?: string }): Promise<Booking[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;

  // Admin dashboard statistics
  getUserCount(): Promise<number>;
  getClinicCount(): Promise<number>;
  getQuoteRequestCount(): Promise<number>;
  getRecentBookings(limit?: number): Promise<any[]>;
  getPendingQuotes(limit?: number): Promise<any[]>;
  getRecentUsers(limit?: number): Promise<any[]>;

  // Patient portal data methods
  getPatientBookings(userId: number): Promise<any[]>;
  getPatientQuotes(userId: number): Promise<any[]>;
  getPatientAppointments(userId: number): Promise<any[]>;

  // Clinic portal data methods
  getClinicBookings(clinicId: number): Promise<any[]>;
  getClinicQuotes(clinicId: number): Promise<any[]>;
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

  async getUsersByClinicId(clinicId: number): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.clinicId, clinicId));
  }

  // === Quote Management ===
  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    const [quoteRequest] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id));

    if (!quoteRequest) {
      return undefined;
    }

    // Process special offer data if it exists (similar to getQuoteRequestsByClinicId)
    if (quoteRequest.specialOffer && typeof quoteRequest.specialOffer === 'object') {
      // Parse it if it's a string (shouldn't happen, but just in case)
      const offerData = typeof quoteRequest.specialOffer === 'string' 
        ? JSON.parse(quoteRequest.specialOffer) 
        : quoteRequest.specialOffer;

      const specialOffer = {
        id: offerData.id || '',
        title: offerData.title || 'Special Offer',
        clinicId: offerData.clinicId || '1',
        discountType: offerData.discountType || 'percentage',
        discountValue: offerData.discountValue || 0,
        applicableTreatment: offerData.applicableTreatment || '',
        expiryDate: offerData.expiryDate,
        terms: offerData.terms
      };

      // Return a new object with processed special offer
      return {
        ...quoteRequest,
        specialOffer
      };
    }

    return quoteRequest;
  }

  async getQuoteRequestsByUserId(userId: number): Promise<QuoteRequest[]> {
    const results = await db.select().from(quoteRequests).where(eq(quoteRequests.userId, userId));

    // Transform the data to match the expected client format, just like in getQuoteRequestsByClinicId
    return results.map(quote => {
      // Process special offer data if it exists
      let specialOffer;

      // Check if specialOffer exists and is not null
      if (quote.specialOffer && typeof quote.specialOffer === 'object') {
        // Parse it if it's a string (shouldn't happen, but just in case)
        const offerData = typeof quote.specialOffer === 'string' 
          ? JSON.parse(quote.specialOffer) 
          : quote.specialOffer;

        specialOffer = {
          id: offerData.id || '',
          title: offerData.title || 'Special Offer',
          clinicId: offerData.clinicId || '1',
          discountType: offerData.discountType || 'percentage',
          discountValue: offerData.discountValue || 0,
          applicableTreatment: offerData.applicableTreatment || '',
          expiryDate: offerData.expiryDate,
          terms: offerData.terms
        };
      }

      return {
        ...quote,
        specialOffer
      };
    });
  }

  async getQuoteRequestsByClinicId(clinicId: number): Promise<QuoteRequest[]> {
    console.log(`[DEBUG] Getting quotes for clinic ID: ${clinicId}`);

    // Log the actual SQL that would be generated
    const query = db.select().from(quoteRequests).where(eq(quoteRequests.selectedClinicId, clinicId));
    const queryString = query.toSQL();
    console.log(`[DEBUG] Generated SQL: ${queryString.sql} with params: ${JSON.stringify(queryString.params)}`);

    const results = await query;
    console.log(`[DEBUG] Found ${results.length} quotes for clinic ID: ${clinicId}`);

    // Transform the data to match the expected client format
    const transformedResults = results.map(quote => {
      // Process special offer data if it exists
      let specialOffer;

      // Check if specialOffer exists and is not null
      if (quote.specialOffer && typeof quote.specialOffer === 'object') {
        // Parse it if it's a string (shouldn't happen, but just in case)
        const offerData = typeof quote.specialOffer === 'string' 
          ? JSON.parse(quote.specialOffer) 
          : quote.specialOffer;

        specialOffer = {
          id: offerData.id || '',
          title: offerData.title || 'Special Offer',
          clinicId: offerData.clinicId || '1',
          discountType: offerData.discountType || 'percentage',
          discountValue: offerData.discountValue || 0,
          applicableTreatment: offerData.applicableTreatment || '',
          expiryDate: offerData.expiryDate,
          terms: offerData.terms
        };
      }

      return {
        ...quote,
        specialOffer
      };
    });

    if (results.length === 0) {
      // Query to check if there are any quotes with this clinic ID in the database directly
      const rawSql = `SELECT id, name, status, selected_clinic_id, special_offer FROM quote_requests WHERE selected_clinic_id = ${clinicId}`;
      console.log(`[DEBUG] Executing raw SQL: ${rawSql}`);
      try {
        const rawResults = await db.execute(rawSql);
        console.log(`[DEBUG] Raw SQL results: ${JSON.stringify(rawResults.rows)}`);
      } catch (error) {
        console.error(`[ERROR] Raw SQL query failed: ${error}`);
      }

      // Check all quotes in the database
      const allQuotes = await db.select().from(quoteRequests);
      console.log(`[DEBUG] Total quotes in database: ${allQuotes.length}`);
      console.log(`[DEBUG] Quotes with clinic assignments:`);
      allQuotes.forEach(quote => {
        if (quote.selectedClinicId) {
          console.log(`  - Quote #${quote.id}: selectedClinicId = ${quote.selectedClinicId} (typeof: ${typeof quote.selectedClinicId})`);
        }
      });

      // Let's check if clinic exists
      try {
        const clinic = await db.select().from(clinics).where(eq(clinics.id, clinicId));
        console.log(`[DEBUG] Clinic check: found ${clinic.length} clinics with ID ${clinicId}`);
        if (clinic.length > 0) {
          console.log(`[DEBUG] Clinic details: ${JSON.stringify(clinic[0])}`);
        }
      } catch (error) {
        console.error(`[ERROR] Clinic check failed: ${error}`);
      }
    }

    return transformedResults;
  }

  async getAllQuoteRequests(filters?: Partial<QuoteRequest>): Promise<QuoteRequest[]> {
    let results;

    if (!filters) {
      results = await db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt));
    } else {
      // Build the filter conditions
      const conditions = [];
      if (filters.status) conditions.push(eq(quoteRequests.status, filters.status));
      if (filters.selectedClinicId) conditions.push(eq(quoteRequests.selectedClinicId, filters.selectedClinicId));
      if (filters.hasXrays !== undefined) conditions.push(eq(quoteRequests.hasXrays, filters.hasXrays));

      if (conditions.length === 0) {
        results = await db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt));
      } else {
        results = await db
          .select()
          .from(quoteRequests)
          .where(and(...conditions))
          .orderBy(desc(quoteRequests.createdAt));
      }
    }

    // Transform the data to match the expected client format, just like in other methods
    return results.map(quote => {
      // Process special offer data if it exists
      let specialOffer;

      // Check if specialOffer exists and is not null
      if (quote.specialOffer && typeof quote.specialOffer === 'object') {
        // Parse it if it's a string (shouldn't happen, but just in case)
        const offerData = typeof quote.specialOffer === 'string' 
          ? JSON.parse(quote.specialOffer) 
          : quote.specialOffer;

        specialOffer = {
          id: offerData.id || '',
          title: offerData.title || 'Special Offer',
          clinicId: offerData.clinicId || '1',
          discountType: offerData.discountType || 'percentage',
          discountValue: offerData.discountValue || 0,
          applicableTreatment: offerData.applicableTreatment || '',
          expiryDate: offerData.expiryDate,
          terms: offerData.terms
        };
      }

      return {
        ...quote,
        specialOffer
      };
    });
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
  async getTreatmentPlanById(id: number): Promise<TreatmentPlan | undefined> {
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

  // File upload methods
  async uploadFile(file: Express.Multer.File): Promise<{ url: string; filename: string }> {
    try {
      // Import necessary functions from cloud-storage service
      const { 
        generateSecureFilename, 
        parseFileType, 
        uploadToS3 
      } = await import('./services/cloud-storage');

      // Generate a secure filename
      const fileType = parseFileType(file.mimetype);
      const secureFilename = generateSecureFilename(file.originalname);
      const key = `${fileType}-${secureFilename}`;

      // Upload to S3
      const result = await uploadToS3(file.buffer, key, file.mimetype);

      if (!result.success) {
        throw new Error(result.message || 'Failed to upload file to S3');
      }

      return {
        url: result.url || '',
        filename: secureFilename
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Special offers methods
  async updateSpecialOfferImage(offerId: string, imageUrl: string): Promise<boolean> {
    try {
      console.log(`Updating special offer image for offer ID: ${offerId}`);

      // Import the module to get direct access to the map
      const { specialOffers } = await import('./routes/special-offers-routes');

      if (!specialOffers) {
        throw new Error('Failed to get specialOffers map');
      }

      // Find and update the special offer directly
      let updated = false;

      for (const [clinicId, clinicOffers] of specialOffers.entries()) {
        const offerIndex = clinicOffers.findIndex(o => o.id === offerId);
        if (offerIndex !== -1) {
          clinicOffers[offerIndex].banner_image = imageUrl;
          clinicOffers[offerIndex].updated_at = new Date().toISOString();
          specialOffers.set(clinicId, clinicOffers);
          updated = true;
          break;
        }
      }

      if (updated) {
        console.log(`Special offer image updated successfully for offer ID: ${offerId}`);
        return true;
      } else {
        console.error(`Special offer with ID ${offerId} not found`);
        return false;
      }
    } catch (error) {
      console.error('Error updating special offer image:', error);
      return false;
    }
  }

  async getAllTreatmentPlans(status?: string, search?: string): Promise<TreatmentPlan[]> {
    let query = db.select().from(treatmentPlans);

    // Apply status filter if provided
    if (status) {
      query = query.where(eq(treatmentPlans.status, status));
    }

    // For search functionality, we would need to join with users table for patient name
    // or search within the JSON treatmentDetails field
    // This is a basic implementation

    return query.orderBy(desc(treatmentPlans.createdAt));
  }

  async createTreatmentPlan(data: InsertTreatmentPlan): Promise<TreatmentPlan> {
    const [plan] = await db.insert(treatmentPlans).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
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

  async deleteTreatmentPlan(id: number): Promise<void> {
    await db
      .delete(treatmentPlans)
      .where(eq(treatmentPlans.id, id));
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

  /**
   * Create a new booking or update an existing one if it exists
   * @param data The booking data
   * @returns The created or updated booking
   */
  async createOrUpdateBooking(data: Partial<InsertBooking>): Promise<Booking> {
    // Check if a booking already exists for the user and clinic
    let existingBooking: Booking | undefined;

    if (data.quoteRequestId) {
      // Try to find by quote request ID first
      existingBooking = await this.getBookingByQuoteRequestId(data.quoteRequestId);
    }

    if (!existingBooking && data.userId && data.clinicId) {
      // If not found by quote, try to find by user and clinic
      const userBookings = await this.getBookingsByUserId(data.userId);
      existingBooking = userBookings.find(b => b.clinicId === data.clinicId);
    }

    // Generate a unique booking reference if needed
    if (!data.bookingReference) {
      data.bookingReference = `MDF-${Date.now().toString().substring(7)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }

    // Add created/updated dates
    const now = new Date();

    if (existingBooking) {
      // Update the existing booking
      const updatedBooking = await this.updateBooking(existingBooking.id, {
        ...data,
        updatedAt: now
      });

      if (!updatedBooking) {
        throw new Error('Failed to update existing booking');
      }

      return updatedBooking;
    } else {
      // Create a new booking
      const fullData: InsertBooking = {
        ...(data as any),
        createdAt: now,
        updatedAt: now
      };

      return this.createBooking(fullData);
    }
  }

  // === Appointments ===
  async getBookingAppointments(bookingId: number): Promise<Appointment[]> {
    return db
      .select()
      .from(appointments)
      .where(eq(appointments.bookingId, bookingId))
      .orderBy(asc(appointments.startTime));
  }

  async getAppointmentsByBookingId(bookingId: number): Promise<Appointment[]> {
    return this.getBookingAppointments(bookingId);
  }

  async getClinicAppointments(clinicId: number, dateStr?: string): Promise<Appointment[]> {
    if (dateStr) {
      // Parse the date string in YYYY-MM-DD format
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format. Expected YYYY-MM-DD");
      }

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
            sql`${appointments.startTime} >= ${startDate}`,
            sql`${appointments.startTime} <= ${endDate}`
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
            sql`${appointments.startTime} >= ${startDate}`,
            sql`${appointments.startTime} <= ${endDate}`
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
    // Ensure dates are properly converted to Date objects and are valid
    let startTime: Date;
    let endTime: Date;

    // Handle startTime conversion
    if (data.startTime instanceof Date) {
      startTime = data.startTime;
    } else if (typeof data.startTime === 'string') {
      startTime = new Date(data.startTime);
      if (isNaN(startTime.getTime())) {
        throw new Error(`Invalid startTime date format: ${data.startTime}`);
      }
    } else {
      throw new Error('startTime must be a Date object or ISO date string');
    }

    // Handle endTime conversion
    if (data.endTime instanceof Date) {
      endTime = data.endTime;
    } else if (typeof data.endTime === 'string') {
      endTime = new Date(data.endTime);
      if (isNaN(endTime.getTime())) {
        throw new Error(`Invalid endTime date format: ${data.endTime}`);
      }
    } else {
      throw new Error('endTime must be a Date object or ISO date string');
    }

    // Construct the formatted data with valid Date objects
    const formattedData = {
      ...data,
      startTime,
      endTime
    };

    console.log('Creating appointment with data:', {
      ...formattedData,
      startTime: formattedData.startTime.toISOString(),
      endTime: formattedData.endTime.toISOString()
    });

    const [appointment] = await db.insert(appointments).values(formattedData).returning();
    return appointment;
  }

  async updateAppointment(id: number, data: Partial<Appointment>): Promise<Appointment | undefined> {
    // Format dates properly if they exist in the data
    const formattedData = { ...data };

    // Handle startTime conversion if present
    if ('startTime' in formattedData && formattedData.startTime) {
      if (formattedData.startTime instanceof Date) {
        // Already a Date object, no conversion needed
      } else if (typeof formattedData.startTime === 'string') {
        const startTime = new Date(formattedData.startTime);
        if (isNaN(startTime.getTime())) {
          throw new Error(`Invalid startTime date format: ${formattedData.startTime}`);
        }
        formattedData.startTime = startTime;
      } else {
        throw new Error('startTime must be a Date object or ISO date string');
      }
    }

    // Handle endTime conversion if present
    if ('endTime' in formattedData && formattedData.endTime) {
      if (formattedData.endTime instanceof Date) {
        // Already a Date object, no conversion needed
      } else if (typeof formattedData.endTime === 'string') {
        const endTime = new Date(formattedData.endTime);
        if (isNaN(endTime.getTime())) {
          throw new Error(`Invalid endTime date format: ${formattedData.endTime}`);
        }
        formattedData.endTime = endTime;
      } else {
        throw new Error('endTime must be a Date object or ISO date string');
      }
    }

    console.log('Updating appointment with data:', {
      ...formattedData,
      startTime: formattedData.startTime instanceof Date ? formattedData.startTime.toISOString() : formattedData.startTime,
      endTime: formattedData.endTime instanceof Date ? formattedData.endTime.toISOString() : formattedData.endTime
    });

    const [appointment] = await db
      .update(appointments)
      .set({ ...formattedData, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
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

  async getAllPayments(limit?: number): Promise<Payment[]> {
    const query = db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt));

    if (limit && limit > 0) {
      query.limit(limit);
    }

    return query;
  }

  async getPaymentById(id: number): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));

    return payment;
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

  async createPaymentFromStripe(
    stripePaymentIntentId: string, 
    paymentData: Partial<InsertPayment>
  ): Promise<Payment> {
    // Check if payment already exists with this paymentIntentId
    const existingPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));

    if (existingPayments.length > 0) {
      // Payment already exists, return it
      return existingPayments[0];
    }

    // Create a new payment record
    const fullPaymentData: InsertPayment = {
      userId: paymentData.userId!,
      amount: paymentData.amount!,
      currency: paymentData.currency || 'GBP',
      status: paymentData.status || 'pending',
      paymentMethod: paymentData.paymentMethod || 'card',
      paymentType: paymentData.paymentType || 'treatment',
      transactionId: paymentData.transactionId || stripePaymentIntentId,
      stripePaymentIntentId: stripePaymentIntentId,
      stripeCustomerId: paymentData.stripeCustomerId,
      receiptUrl: paymentData.receiptUrl,
      notes: paymentData.notes,
      bookingId: paymentData.bookingId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the payment record
    const [payment] = await db
      .insert(payments)
      .values(fullPaymentData)
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

  // === Additional Booking Methods ===
  async getAllBookings(filters?: { status?: string, stage?: string }): Promise<Booking[]> {
    let query = db.select().from(bookings);

    if (filters) {
      const conditions = [];
      if (filters.status) conditions.push(eq(bookings.status, filters.status));
      if (filters.stage) conditions.push(eq(bookings.stage, filters.stage));

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    return query.orderBy(desc(bookings.createdAt));
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    return this.getBookingsByUserId(userId);
  }

  async getClinicBookings(clinicId: number): Promise<Booking[]> {
    return this.getBookingsByClinicId(clinicId);
  }

  async updateBooking(id: number, data: Partial<InsertBooking>): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    return this.updateBooking(id, { status, updatedAt: new Date() });
  }

  async updateBookingStage(id: number, stage: string): Promise<Booking> {
    return this.updateBooking(id, { stage, updatedAt: new Date() });
  }

  async deleteBooking(id: number): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
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

  async createNotification(data: any): Promise<Notification> {
    try {
      // Use our own manual SQL to avoid any ORM errors
      const { pool } = await import('./db');

      // We'll use direct SQL instead of the ORM since there seems to be a schema mismatch
      // that the ORM is having trouble with
      let query = `
        INSERT INTO notifications
        (user_id, title, message, is_read, type, action, entity_type, entity_id) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      // Map the incoming fields to the actual database columns
      const userId = data.userId || null;
      const title = data.title || '';
      const message = data.message || data.content || '';
      const isRead = data.isRead === true;
      const type = data.type || data.priority || 'info';
      const action = data.action || data.action_url || null;
      const entityType = data.entityType || data.category || null;

      // Try to parse entityId/target_id as a number if it exists
      let entityId = null;
      if (data.entityId !== undefined) {
        entityId = typeof data.entityId === 'string' ? parseInt(data.entityId, 10) || null : data.entityId;
      } else if (data.target_id !== undefined) {
        entityId = typeof data.target_id === 'string' ? parseInt(data.target_id, 10) || null : data.target_id;
      }

      console.log('Creating notification with direct SQL params:', [userId, title, message, isRead, type, action, entityType, entityId]);

      // Connect directly to the database
      const client = await pool.connect();
      try {
        // Execute the query directly with the pool connection
        const result = await client.query(query, [userId, title, message, isRead, type, action, entityType, entityId]);

        if (result.rows.length > 0) {
          console.log('Successfully created notification:', result.rows[0]);
          return result.rows[0] as Notification;
        } else {
          throw new Error('Failed to create notification - no rows returned');
        }
      } finally {
        // Always release the client
        client.release();
      }
    } catch (error) {
      console.error('Failed to create notification with direct SQL:', error);
      // Continue despite error by returning a minimal notification object
      return {
        id: 0,
        userId: data.userId || 0,
        title: data.title || '',
        message: data.message || '',
        isRead: false,
        type: 'info',
        action: null,
        entityType: null,
        entityId: null,
        createdAt: new Date()
      } as Notification;
    }
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

  // Admin dashboard statistics
  async getUserCount(): Promise<number> {
    try {
      const result = await db.select({ count: sql`count(*)`.as('count') }).from(users);
      return Number(result[0]?.count || 0);
    } catch (error) {
      console.error('Error getting user count:', error);
      return 0;
    }
  }

  async getClinicCount(): Promise<number> {
    try {
      const result = await db.select({ count: sql`count(*)`.as('count') }).from(clinics);
      return Number(result[0]?.count || 0);
    } catch (error) {
      console.error('Error getting clinic count:', error);
      return 0;
    }
  }

  async getQuoteRequestCount(): Promise<number> {
    try {
      const result = await db.select({ count: sql`count(*)`.as('count') }).from(quoteRequests);
      return Number(result[0]?.count || 0);
    } catch (error) {
      console.error('Error getting quote request count:', error);
      return 0;
    }
  }

  async getRecentBookings(limit: number = 10): Promise<any[]> {
    try {
      const results = await db
        .select()
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .leftJoin(clinics, eq(bookings.clinicId, clinics.id))
        .orderBy(desc(bookings.createdAt))
        .limit(limit);

      return results.map(result => ({
        ...result.bookings,
        user: result.users,
        clinic: result.clinics
      }));
    } catch (error) {
      console.error('Error getting recent bookings:', error);
      return [];
    }
  }

  async getPendingQuotes(limit: number = 10): Promise<any[]> {
    try {
      const results = await db
        .select()
        .from(quoteRequests)
        .where(eq(quoteRequests.status, 'pending'))
        .orderBy(desc(quoteRequests.createdAt))
        .limit(limit);

      return results;
    } catch (error) {
      console.error('Error getting pending quotes:', error);
      return [];
    }
  }

  async getRecentUsers(limit: number = 10): Promise<any[]> {
    try {
      const results = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit);

      return results;
    } catch (error) {
      console.error('Error getting recent users:', error);
      return [];
    }
  }

  // Patient portal data methods
  async getPatientBookings(userId: number): Promise<any[]> {
    try {
      const results = await db
        .select()
        .from(bookings)
        .leftJoin(clinics, eq(bookings.clinicId, clinics.id))
        .leftJoin(quoteRequests, eq(bookings.quoteRequestId, quoteRequests.id))
        .where(eq(bookings.userId, userId))
        .orderBy(desc(bookings.createdAt));

      return results.map(result => ({
        ...result.bookings,
        clinic: result.clinics,
        quoteRequest: result.quote_requests
      }));
    } catch (error) {
      console.error('Error getting patient bookings:', error);
      return [];
    }
  }

  async getPatientQuotes(userId: number): Promise<any[]> {
    try {
      const results = await db
        .select()
        .from(quoteRequests)
        .leftJoin(clinics, eq(quoteRequests.selectedClinicId, clinics.id))
        .where(eq(quoteRequests.userId, userId))
        .orderBy(desc(quoteRequests.createdAt));

      return results.map(result => ({
        ...result.quote_requests,
        selectedClinic: result.clinics
      }));
    } catch (error) {
      console.error('Error getting patient quotes:', error);
      return [];
    }
  }

  // Clinic portal data methods
  async getClinicBookings(clinicId: number): Promise<any[]> {
    try {
      const results = await db
        .select()
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .leftJoin(quoteRequests, eq(bookings.quoteRequestId, quoteRequests.id))
        .where(eq(bookings.clinicId, clinicId))
        .orderBy(desc(bookings.createdAt));

      return results.map(result => ({
        ...result.bookings,
        patient: result.users,
        quoteRequest: result.quote_requests
      }));
    } catch (error) {
      console.error('Error getting clinic bookings:', error);
      return [];
    }
  }

  async getClinicQuotes(clinicId: number): Promise<any[]> {
    try {
      const results = await db
        .select()
        .from(quoteRequests)
        .where(eq(quoteRequests.selectedClinicId, clinicId))
        .orderBy(desc(quoteRequests.createdAt));

      return results;
    } catch (error) {
      console.error('Error getting clinic quotes:', error);
      return [];
    }
  }

  async getPatientAppointments(userId: number): Promise<any[]> {
    try {
      const results = await db
        .select()
        .from(appointments)
        .leftJoin(bookings, eq(appointments.bookingId, bookings.id))
        .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
        .where(and(
          eq(bookings.userId, userId),
          gte(appointments.startTime, new Date())
        ))
        .orderBy(appointments.startTime);

      return results.map(result => ({
        ...result.appointments,
        booking: result.bookings,
        clinic: result.clinics
      }));
    } catch (error) {
      console.error('Error getting patient appointments:', error);
      return [];
    }
  }
}

// Export an instance of the storage class
export const storage = new DatabaseStorage();