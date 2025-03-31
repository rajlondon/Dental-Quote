import { users, type User, type InsertUser, type InsertQuoteRequest, type QuoteRequest, quoteRequests } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quote request methods
  getQuoteRequest(id: number): Promise<QuoteRequest | undefined>;
  getQuoteRequests(): Promise<QuoteRequest[]>;
  createQuoteRequest(quoteRequest: Omit<InsertQuoteRequest, "consent">): Promise<QuoteRequest>;
  updateQuoteRequestStatus(id: number, status: string): Promise<QuoteRequest | undefined>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Quote request methods
  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    const [quoteRequest] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id));
    return quoteRequest || undefined;
  }
  
  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return await db.select().from(quoteRequests);
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
      .set({ status })
      .where(eq(quoteRequests.id, id))
      .returning();
    return updatedQuoteRequest || undefined;
  }
}

// Create and export the storage instance
export const storage = new DatabaseStorage();
