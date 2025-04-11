import { 
  users, type User, type InsertUser, 
  type InsertQuoteRequest, type QuoteRequest, quoteRequests,
  type InsertBooking, type Booking, bookings,
  type InsertPayment, type Payment, payments,
  type InsertFile, type File, files,
  type InsertMessage, type Message, messages,
  type InsertClinic, type Clinic, clinics
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Quote request methods
  getQuoteRequest(id: number): Promise<QuoteRequest | undefined>;
  getQuoteRequestByEmail(email: string): Promise<QuoteRequest | undefined>;
  getQuoteRequests(): Promise<QuoteRequest[]>;
  getQuoteRequestsByUserId(userId: number): Promise<QuoteRequest[]>;
  createQuoteRequest(quoteRequest: Omit<InsertQuoteRequest, "consent">): Promise<QuoteRequest>;
  updateQuoteRequestStatus(id: number, status: string): Promise<QuoteRequest | undefined>;
  updateQuoteRequestData(id: number, quoteData: any): Promise<QuoteRequest | undefined>;
  
  // Booking methods
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  updateBookingDetails(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined>;
  
  // Payment methods
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByBookingId(bookingId: number): Promise<Payment[]>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  getPaymentByStripeId(stripePaymentIntentId: string): Promise<Payment | undefined>;
  
  // File methods
  getFile(id: number): Promise<File | undefined>;
  getFilesByBookingId(bookingId: number): Promise<File[]>;
  getFilesByUserId(userId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByBookingId(bookingId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  
  // Clinic methods
  getClinic(id: number): Promise<Clinic | undefined>;
  getClinics(): Promise<Clinic[]>;
  getActiveClinicsByTier(tier: string): Promise<Clinic[]>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  // Quote request methods
  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    const [quoteRequest] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id));
    return quoteRequest || undefined;
  }
  
  async getQuoteRequestByEmail(email: string): Promise<QuoteRequest | undefined> {
    const [quoteRequest] = await db
      .select()
      .from(quoteRequests)
      .where(eq(quoteRequests.email, email))
      .orderBy(desc(quoteRequests.createdAt))
      .limit(1);
    return quoteRequest || undefined;
  }
  
  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return await db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt));
  }
  
  async getQuoteRequestsByUserId(userId: number): Promise<QuoteRequest[]> {
    return await db
      .select()
      .from(quoteRequests)
      .where(eq(quoteRequests.userId, userId))
      .orderBy(desc(quoteRequests.createdAt));
  }
  
  async createQuoteRequest(insertQuoteRequest: Omit<InsertQuoteRequest, "consent">): Promise<QuoteRequest> {
    const [quoteRequest] = await db
      .insert(quoteRequests)
      .values(insertQuoteRequest)
      .returning();
    return quoteRequest;
  }
  
  async updateQuoteRequestStatus(id: number, status: string): Promise<QuoteRequest | undefined> {
    const [updatedQuoteRequest] = await db
      .update(quoteRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(quoteRequests.id, id))
      .returning();
    return updatedQuoteRequest || undefined;
  }
  
  async updateQuoteRequestData(id: number, quoteData: any): Promise<QuoteRequest | undefined> {
    const [updatedQuoteRequest] = await db
      .update(quoteRequests)
      .set({ quoteData, updatedAt: new Date() })
      .where(eq(quoteRequests.id, id))
      .returning();
    return updatedQuoteRequest || undefined;
  }
  
  // Booking methods
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }
  
  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }
  
  async updateBookingDetails(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ ...bookingData, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking || undefined;
  }
  
  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }
  
  async getPaymentsByBookingId(bookingId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
      .orderBy(desc(payments.createdAt));
  }
  
  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }
  
  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment || undefined;
  }
  
  async getPaymentByStripeId(stripePaymentIntentId: string): Promise<Payment | undefined> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
    return payment || undefined;
  }
  
  // File methods
  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }
  
  async getFilesByBookingId(bookingId: number): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.bookingId, bookingId))
      .orderBy(desc(files.createdAt));
  }
  
  async getFilesByUserId(userId: number): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(files.createdAt));
  }
  
  async createFile(insertFile: InsertFile): Promise<File> {
    const [file] = await db
      .insert(files)
      .values(insertFile)
      .returning();
    return file;
  }
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }
  
  async getMessagesByBookingId(bookingId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.bookingId, bookingId))
      .orderBy(asc(messages.createdAt));
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updatedMessage] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage || undefined;
  }
  
  // Clinic methods
  async getClinic(id: number): Promise<Clinic | undefined> {
    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id));
    return clinic || undefined;
  }
  
  async getClinics(): Promise<Clinic[]> {
    return await db
      .select()
      .from(clinics)
      .where(eq(clinics.active, true))
      .orderBy(asc(clinics.name));
  }
  
  async getActiveClinicsByTier(tier: string): Promise<Clinic[]> {
    return await db
      .select()
      .from(clinics)
      .where(and(eq(clinics.active, true), eq(clinics.tier, tier)))
      .orderBy(asc(clinics.name));
  }
}

// Create and export the storage instance
export const storage = new DatabaseStorage();
