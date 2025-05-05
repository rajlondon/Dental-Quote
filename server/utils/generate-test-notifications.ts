import { db } from '../db';
import { notifications } from '@shared/schema';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Generates test notifications for development and testing purposes.
 * This creates sample notifications for each type (message, appointment, etc.)
 * to allow UI testing without needing real data.
 */
export async function generateTestNotifications() {
  try {
    console.log('Generating test notifications...');
    
    // Get the patient user ID (user with role 'patient')
    const patientUser = await db.query.users.findFirst({
      where: eq(users.role, 'patient')
    });
    
    if (!patientUser) {
      console.error('No patient user found. Cannot generate test notifications.');
      return 0;
    }
    
    // Define test notifications that match our schema (notifications table)
    const testNotifications = [
      {
        userId: patientUser.id,
        title: "New Message from Dr. Smith",
        message: "Your treatment plan has been updated. Please review the changes.",
        content: "Dr. Smith has sent you a message about your upcoming treatment plan. Please review the updates and respond at your earliest convenience.",
        isRead: false,
        type: "info",
        action: "/portal?section=messages",
        entityType: "message",
        entityId: 1
      },
      {
        userId: patientUser.id,
        title: "Upcoming Appointment",
        message: "You have an appointment scheduled for tomorrow at 10:00 AM.",
        content: "Reminder: You have a dental consultation appointment scheduled for tomorrow at 10:00 AM with Dr. Smith at DentSpa Istanbul. Please arrive 15 minutes early.",
        isRead: false,
        type: "info",
        action: "/portal?section=appointments",
        entityType: "appointment",
        entityId: 2
      },
      {
        userId: patientUser.id,
        title: "New Quote Available",
        message: "Your quote for dental implants is now available for review.",
        content: "We've prepared a detailed quote for your dental implant treatment. The total estimate is £3,200. Please review and contact us if you have any questions.",
        isRead: false,
        type: "success",
        action: "/portal?section=quotes",
        entityType: "quote",
        entityId: 3
      },
      {
        userId: patientUser.id,
        title: "Document Upload Reminder",
        message: "Please upload your X-rays for your upcoming consultation.",
        content: "To help us prepare for your consultation, please upload your recent X-rays through the documents section. This will allow our dentists to review your case before your arrival.",
        isRead: false,
        type: "warning",
        action: "/portal?section=documents",
        entityType: "document",
        entityId: 4
      },
      {
        userId: patientUser.id,
        title: "Special Offer: 20% Off Teeth Whitening",
        message: "Limited time offer on professional teeth whitening when booked with any other treatment.",
        content: "Take advantage of our special promotion! Book any treatment and get 20% off professional teeth whitening. This offer is valid until June 1, 2025.",
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