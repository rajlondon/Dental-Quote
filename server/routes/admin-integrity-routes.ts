
import express from "express";
import { storage } from "../storage";
import { isAuthenticated, ensureRole } from "../middleware/auth";
import { db } from "../db";
import { users, quoteRequests, messages, files, bookings } from "@shared/schema";
import { eq, sql, isNull, count } from "drizzle-orm";

const router = express.Router();

// Check quote assignment integrity
router.get("/integrity/quotes", isAuthenticated, ensureRole("admin"), async (req, res, next) => {
  try {
    // Count total quotes
    const totalQuotesResult = await db.select({ count: count() }).from(quoteRequests);
    const totalQuotes = totalQuotesResult[0].count;
    
    // Count quotes with invalid clinic references
    const orphanedQuotesResult = await db
      .select({ count: count() })
      .from(quoteRequests)
      .leftJoin(storage.clinics, eq(quoteRequests.selectedClinicId, storage.clinics.id))
      .where(
        sql`${quoteRequests.selectedClinicId} IS NOT NULL AND ${storage.clinics.id} IS NULL`
      );
    
    const orphanedQuotes = orphanedQuotesResult[0].count;
    
    // Check for quotes assigned to inactive clinics
    const inactiveClinicQuotesResult = await db
      .select({ count: count() })
      .from(quoteRequests)
      .leftJoin(storage.clinics, eq(quoteRequests.selectedClinicId, storage.clinics.id))
      .where(
        sql`${quoteRequests.selectedClinicId} IS NOT NULL AND ${storage.clinics.active} = false`
      );
    
    const inactiveClinicQuotes = inactiveClinicQuotesResult[0].count;
    
    res.json({
      success: true,
      data: {
        totalQuotes,
        orphanedQuotes,
        inactiveClinicQuotes,
        healthStatus: orphanedQuotes === 0 && inactiveClinicQuotes === 0 ? 'healthy' : 'warning'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Check message thread integrity
router.get("/integrity/messages", isAuthenticated, ensureRole("admin"), async (req, res, next) => {
  try {
    // Count total messages
    const totalMessagesResult = await db.select({ count: count() }).from(messages);
    const totalMessages = totalMessagesResult[0].count;
    
    // Count messages with invalid booking references
    const orphanedMessagesResult = await db
      .select({ count: count() })
      .from(messages)
      .leftJoin(bookings, eq(messages.bookingId, bookings.id))
      .where(isNull(bookings.id));
    
    const orphanedMessages = orphanedMessagesResult[0].count;
    
    // Count messages with invalid sender references
    const invalidSenderMessagesResult = await db
      .select({ count: count() })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(isNull(users.id));
    
    const invalidSenderMessages = invalidSenderMessagesResult[0].count;
    
    res.json({
      success: true,
      data: {
        totalMessages,
        orphanedMessages,
        invalidSenderMessages,
        healthStatus: orphanedMessages === 0 && invalidSenderMessages === 0 ? 'healthy' : 'warning'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Check file integrity
router.get("/integrity/files", isAuthenticated, ensureRole("admin"), async (req, res, next) => {
  try {
    // Count total files
    const totalFilesResult = await db.select({ count: count() }).from(files);
    const totalFiles = totalFilesResult[0].count;
    
    // Count files with invalid user references
    const orphanedFilesResult = await db
      .select({ count: count() })
      .from(files)
      .leftJoin(users, eq(files.userId, users.id))
      .where(isNull(users.id));
    
    const orphanedFiles = orphanedFilesResult[0].count;
    
    // Count files with invalid quote references (where quote reference exists)
    const invalidQuoteFilesResult = await db
      .select({ count: count() })
      .from(files)
      .leftJoin(quoteRequests, eq(files.quoteRequestId, quoteRequests.id))
      .where(
        sql`${files.quoteRequestId} IS NOT NULL AND ${quoteRequests.id} IS NULL`
      );
    
    const invalidQuoteFiles = invalidQuoteFilesResult[0].count;
    
    res.json({
      success: true,
      data: {
        totalFiles,
        orphanedFiles,
        invalidQuoteFiles,
        missingFiles: orphanedFiles + invalidQuoteFiles,
        healthStatus: orphanedFiles === 0 && invalidQuoteFiles === 0 ? 'healthy' : 'warning'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Check user permission integrity
router.get("/integrity/permissions", isAuthenticated, ensureRole("admin"), async (req, res, next) => {
  try {
    // Count total users
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0].count;
    
    // Count clinic staff without valid clinic references
    const invalidClinicStaffResult = await db
      .select({ count: count() })
      .from(users)
      .leftJoin(storage.clinics, eq(users.clinicId, storage.clinics.id))
      .where(
        sql`${users.role} = 'clinic_staff' AND (${users.clinicId} IS NULL OR ${storage.clinics.id} IS NULL)`
      );
    
    const invalidClinicStaff = invalidClinicStaffResult[0].count;
    
    // Count users with invalid roles
    const validRoles = ['patient', 'admin', 'clinic_staff'];
    const invalidRoleUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(
        sql`${users.role} NOT IN ${sql.raw(`('${validRoles.join("','")}')`)} OR ${users.role} IS NULL`
      );
    
    const invalidRoleUsers = invalidRoleUsersResult[0].count;
    
    res.json({
      success: true,
      data: {
        totalUsers,
        invalidClinicStaff,
        invalidRoleUsers,
        invalidPermissions: invalidClinicStaff + invalidRoleUsers,
        healthStatus: invalidClinicStaff === 0 && invalidRoleUsers === 0 ? 'healthy' : 'warning'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get system metrics
router.get("/system/metrics", isAuthenticated, ensureRole("admin"), async (req, res, next) => {
  try {
    // Get user count by role
    const userStatsResult = await db
      .select({
        role: users.role,
        count: count()
      })
      .from(users)
      .groupBy(users.role);
    
    const totalUsers = userStatsResult.reduce((sum, stat) => sum + stat.count, 0);
    
    // Get quote stats
    const quoteStatsResult = await db.select({ count: count() }).from(quoteRequests);
    const totalQuotes = quoteStatsResult[0].count;
    
    // Get booking stats
    const bookingStatsResult = await db.select({ count: count() }).from(bookings);
    const totalBookings = bookingStatsResult[0].count;
    
    // Get message stats (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const messageStatsResult = await db
      .select({ count: count() })
      .from(messages)
      .where(sql`${messages.createdAt} >= ${today.toISOString()}`);
    
    const totalMessages = messageStatsResult[0].count;
    
    // Calculate response time (simulated for now)
    const responseTime = Math.floor(Math.random() * 100) + 50; // 50-150ms
    
    // Calculate error rate (simulated)
    const errorRate = Math.random() * 2; // 0-2%
    
    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalQuotes,
        totalBookings,
        totalMessages,
        activeConnections: Math.floor(Math.random() * 50) + 10, // Simulated
        errorRate: Number(errorRate.toFixed(2)),
        responseTime,
        usersByRole: userStatsResult.reduce((acc, stat) => {
          acc[stat.role] = stat.count;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Run comprehensive data cleanup
router.post("/cleanup/orphaned-data", isAuthenticated, ensureRole("admin"), async (req, res, next) => {
  try {
    const results = {
      orphanedMessages: 0,
      orphanedFiles: 0,
      invalidQuoteAssignments: 0
    };
    
    // Clean up orphaned messages (messages without valid bookings)
    const orphanedMessagesResult = await db
      .delete(messages)
      .where(
        sql`${messages.bookingId} NOT IN (SELECT id FROM ${bookings})`
      );
    
    results.orphanedMessages = orphanedMessagesResult.rowCount || 0;
    
    // Clean up orphaned files (files without valid users)
    const orphanedFilesResult = await db
      .delete(files)
      .where(
        sql`${files.userId} NOT IN (SELECT id FROM ${users})`
      );
    
    results.orphanedFiles = orphanedFilesResult.rowCount || 0;
    
    // Reset invalid quote assignments
    const invalidQuoteAssignmentsResult = await db
      .update(quoteRequests)
      .set({ selectedClinicId: null, status: 'pending' })
      .where(
        sql`${quoteRequests.selectedClinicId} NOT IN (SELECT id FROM ${storage.clinics} WHERE active = true)`
      );
    
    results.invalidQuoteAssignments = invalidQuoteAssignmentsResult.rowCount || 0;
    
    res.json({
      success: true,
      message: 'Data cleanup completed successfully',
      results
    });
  } catch (error) {
    next(error);
  }
});

export default router;
