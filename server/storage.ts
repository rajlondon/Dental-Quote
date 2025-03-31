import { users, type User, type InsertUser, type InsertQuoteRequest, type QuoteRequest, quoteRequests } from "@shared/schema";

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

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quoteRequests: Map<number, QuoteRequest>;
  private userCurrentId: number;
  private quoteRequestCurrentId: number;

  constructor() {
    this.users = new Map();
    this.quoteRequests = new Map();
    this.userCurrentId = 1;
    this.quoteRequestCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Quote request methods
  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    return this.quoteRequests.get(id);
  }
  
  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return Array.from(this.quoteRequests.values());
  }
  
  async createQuoteRequest(insertQuoteRequest: Omit<InsertQuoteRequest, "consent">): Promise<QuoteRequest> {
    const id = this.quoteRequestCurrentId++;
    const now = new Date();
    
    const quoteRequest: QuoteRequest = {
      ...insertQuoteRequest,
      id,
      status: "pending",
      createdAt: now,
    };
    
    this.quoteRequests.set(id, quoteRequest);
    return quoteRequest;
  }
  
  async updateQuoteRequestStatus(id: number, status: string): Promise<QuoteRequest | undefined> {
    const quoteRequest = await this.getQuoteRequest(id);
    
    if (!quoteRequest) {
      return undefined;
    }
    
    const updatedQuoteRequest: QuoteRequest = {
      ...quoteRequest,
      status,
    };
    
    this.quoteRequests.set(id, updatedQuoteRequest);
    return updatedQuoteRequest;
  }
}

// Create and export the storage instance
export const storage = new MemStorage();
