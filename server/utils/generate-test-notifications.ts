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
    
    // Define test notifications with various types that match our schema
    const testNotifications = [
      {
        target_id: String(patientUser.id),
        title: "New Message from Dr. Smith",
        message: "Your treatment plan has been updated. Please review the changes.",
        category: "message",
        priority: "medium",
        target_type: "patient",
        source_type: "clinic",
        source_id: "1", // Clinic ID
        read: false,
        action_url: "/portal?section=messages",
        metadata: {
          sender_name: "Dr. Smith",
          conversation_id: "1",
          message_preview: "I've updated your treatment plan with the latest recommendations..."
        }
      },
      {
        target_id: String(patientUser.id),
        title: "Upcoming Appointment",
        message: "You have an appointment scheduled for tomorrow at 10:00 AM.",
        category: "appointment",
        priority: "high",
        target_type: "patient",
        source_type: "system",
        source_id: "system",
        read: false,
        action_url: "/portal?section=appointments",
        metadata: {
          appointment_id: "2",
          appointment_date: "2025-05-06T10:00:00",
          clinic_name: "DentSpa Istanbul",
          doctor_name: "Dr. Smith"
        }
      },
      {
        target_id: String(patientUser.id),
        title: "New Quote Available",
        message: "Your quote for dental implants is now available for review.",
        category: "treatment",
        priority: "medium",
        target_type: "patient",
        source_type: "clinic",
        source_id: "1",
        read: false,
        action_url: "/portal?section=quotes",
        metadata: {
          quote_id: "3",
          treatment_type: "Dental Implants",
          price_estimate: "3200",
          currency: "GBP"
        }
      },
      {
        target_id: String(patientUser.id),
        title: "Document Upload Reminder",
        message: "Please upload your X-rays for your upcoming consultation.",
        category: "document",
        priority: "medium",
        target_type: "patient",
        source_type: "system",
        source_id: "system",
        read: false,
        action_url: "/portal?section=documents",
        metadata: {
          required_document: "X-rays",
          due_date: "2025-05-10",
          appointment_id: "2"
        }
      },
      {
        target_id: String(patientUser.id),
        title: "Special Offer: 20% Off Teeth Whitening",
        message: "Limited time offer on professional teeth whitening when booked with any other treatment.",
        category: "offer",
        priority: "low",
        target_type: "patient",
        source_type: "clinic",
        source_id: "2",
        read: false,
        action_url: "/portal?section=offers",
        metadata: {
          offer_id: "5",
          clinic_name: "Premium Dental Clinic",
          discount: "20%",
          expires: "2025-06-01"
        }
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