import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema from the original, kept for reference
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequests)
  .omit({ id: true, status: true, createdAt: true })
  .extend({
    consent: z.boolean().refine(val => val === true, {
      message: "You must consent to be contacted",
    }),
  });

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
