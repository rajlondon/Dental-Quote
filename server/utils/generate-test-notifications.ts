import { db } from '../db';
import { notifications } from '@shared/schema';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Generates test notifications for development and testing purposes.
 * This creates sample notifications for each type (message, appointment, etc.)
 * to allow UI testing without needing real data.
 * 
 * @param userId - The user ID for which to generate notifications. If not provided,
 *                will use the first patient found in the database.
 */
export async function generateTestNotifications(userId?: number) {
  try {
    console.log('Generating test notifications...');
    
    let targetUserId = userId;
    
    // If no userId was provided, find a patient user
    if (!targetUserId) {
      const patientUser = await db.query.users.findFirst({
        where: eq(users.role, 'patient')
      });
      
      if (!patientUser) {
        console.error('No patient user found. Cannot generate test notifications.');
        return 0;
      }
      
      targetUserId = patientUser.id;
    }
    
    console.log(`Generating test notifications for user ID: ${targetUserId}`);
    
    // Define test notifications that match our schema (notifications table)
    const testNotifications = [
      {
        userId: targetUserId,
        title: "New Message from Dr. Smith",
        message: "Your treatment plan has been updated. Please review the changes.",
        isRead: false,
        type: "info",
        action: "/portal?section=messages",
        entityType: "message",
        entityId: 1
      },
      {
        userId: targetUserId,
        title: "Upcoming Appointment",
        message: "You have an appointment scheduled for tomorrow at 10:00 AM.",
        isRead: false,
        type: "info",
        action: "/portal?section=appointments",
        entityType: "appointment",
        entityId: 2
      },
      {
        userId: targetUserId,
        title: "New Quote Available",
        message: "Your quote for dental implants is now available for review.",
        isRead: false,
        type: "success",
        action: "/portal?section=quotes",
        entityType: "quote",
        entityId: 3
      },
      {
        userId: targetUserId,
        title: "Document Upload Reminder",
        message: "Please upload your X-rays for your upcoming consultation.",
        isRead: false,
        type: "warning",
        action: "/portal?section=documents",
        entityType: "document",
        entityId: 4
      },
      {
        userId: targetUserId,
        title: "Special Offer: 20% Off Teeth Whitening",
        message: "Limited time offer on professional teeth whitening when booked with any other treatment.",
        isRead: false,
        type: "info",
        action: "/portal?section=offers",
        entityType: "offer",
        entityId: 5
      }
    ];
    
    // Insert the test notifications into the database
    for (const notification of testNotifications) {
      await db.insert(notifications).values(notification);
    }
    
    console.log(`Successfully created ${testNotifications.length} test notifications`);
    return testNotifications.length;
    
  } catch (error) {
    console.error('Error generating test notifications:', error);
    throw error;
  }
}

// To call this function manually in development:
// import { generateTestNotifications } from './server/utils/generate-test-notifications';
// generateTestNotifications().then(() => console.log('Done!'));