import { 
  NotificationCategory, 
  NotificationPriority, 
  NotificationTarget 
} from '@shared/notifications';
import { db } from '../db/database';
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
      return;
    }
    
    // Define test notifications with various types
    const testNotifications = [
      {
        title: "New Message from Dr. Smith",
        message: "Your treatment plan has been updated. Please review the changes.",
        category: "message" as NotificationCategory,
        priority: "high" as NotificationPriority,
        target_type: "patient" as NotificationTarget,
        target_id: patientUser.id.toString(),
        action_url: "/portal?section=messages",
        read: false,
        metadata: {
          sender_id: 1,
          sender_name: "Dr. Smith",
          sender_role: "dentist"
        }
      },
      {
        title: "Upcoming Appointment",
        message: "You have an appointment scheduled for tomorrow at 10:00 AM.",
        category: "appointment" as NotificationCategory,
        priority: "high" as NotificationPriority,
        target_type: "patient" as NotificationTarget,
        target_id: patientUser.id.toString(),
        action_url: "/portal?section=appointments",
        read: false,
        metadata: {
          appointment_id: "12345",
          appointment_date: "2025-05-06T10:00:00Z",
          clinic_name: "DentSpa Istanbul"
        }
      },
      {
        title: "New Quote Available",
        message: "Your quote for dental implants is now available for review.",
        category: "treatment" as NotificationCategory,
        priority: "medium" as NotificationPriority,
        target_type: "patient" as NotificationTarget,
        target_id: patientUser.id.toString(),
        action_url: "/portal?section=quotes",
        read: false,
        metadata: {
          quote_id: "Q987",
          treatment_type: "Dental Implants",
          quote_amount: "£3,200"
        }
      },
      {
        title: "Document Upload Reminder",
        message: "Please upload your X-rays for your upcoming consultation.",
        category: "document" as NotificationCategory,
        priority: "medium" as NotificationPriority,
        target_type: "patient" as NotificationTarget,
        target_id: patientUser.id.toString(),
        action_url: "/portal?section=documents",
        read: false,
        metadata: {
          document_type: "X-ray",
          due_date: "2025-05-10T00:00:00Z"
        }
      }
    ];
    
    // Insert the test notifications into the database
    for (const notification of testNotifications) {
      await db.insert(notifications).values({
        ...notification,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
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