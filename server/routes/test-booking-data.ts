import { db } from '../db';
import { bookings, users, notifications, messages, clinics } from '@shared/schema';
import { randomUUID } from 'crypto';
import { eq, and, count } from 'drizzle-orm';

export async function createTestBookingData() {
  try {
    console.log('Creating test booking data...');
    
    // Get existing users
    const patientUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'patient@mydentalfly.com')
    });
    
    const clinicUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'clinic@mydentalfly.com')
    });
    
    if (!patientUser || !clinicUser) {
      throw new Error('Patient or clinic user not found. Please ensure they exist in the database.');
    }
    
    // Check for existing clinic entity
    let clinicEntity = await db.query.clinics.findFirst({
      where: (clinics, { eq }) => eq(clinics.id, clinicUser.clinicId || 0)
    });
    
    // Create clinic entity if it doesn't exist
    if (!clinicEntity && clinicUser.clinicId) {
      [clinicEntity] = await db.insert(clinics).values({
        id: clinicUser.clinicId,
        name: 'Test Dental Clinic',
        email: clinicUser.email,
        phone: '+90 123 456 7890',
        address: 'Test Address, Istanbul',
        city: 'Istanbul',
        country: 'Turkey',
        description: 'A test dental clinic for development purposes',
        specialties: ['implants', 'cosmetic', 'general'],
        treatments: ['implants', 'veneers', 'crowns', 'whitening'],
        active: true,
        verified: true
      }).returning();
    }
    
    // Create a test booking if it doesn't exist
    const existingBooking = await db.query.bookings.findFirst({
      where: (bookings, { and, eq }) => and(
        eq(bookings.userId, patientUser.id),
        eq(bookings.clinicId, clinicUser.clinicId!)
      )
    });
    
    let bookingId = existingBooking?.id;
    
    if (!existingBooking) {
      const [newBooking] = await db.insert(bookings).values({
        userId: patientUser.id,
        clinicId: clinicUser.clinicId,
        bookingReference: `B-${Date.now().toString().substring(7)}`,
        status: 'confirmed',
        stage: 'pre_travel',
        treatmentNotes: 'Test booking for dental veneers treatment',
        arrivalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        departureDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        accommodationType: 'hotel',
        assignedClinicStaffId: clinicUser.id,
      }).returning();
      
      bookingId = newBooking.id;
      console.log(`Created new test booking with ID: ${bookingId}`);
    } else {
      console.log(`Using existing test booking with ID: ${bookingId}`);
    }
    
    // Check for existing messages in this booking
    const messageCount = await db.select({ countValue: count() })
      .from(messages)
      .where(eq(messages.bookingId, bookingId!));
    
    const messageCountValue = Number(messageCount[0].countValue);
    
    // Add initial messages if none exist
    if (messageCountValue === 0) {
      // Create initial messages
      const initialMessages = [
        {
          bookingId: bookingId!,
          senderId: patientUser.id,
          recipientId: clinicUser.id,
          content: "Hello, I have some questions about my upcoming treatment. Can you provide more details?",
          messageType: "text",
          isRead: true,
          readAt: new Date()
        },
        {
          bookingId: bookingId!,
          senderId: clinicUser.id,
          recipientId: patientUser.id,
          content: "Hello! Of course, I'd be happy to provide more information. What specific details would you like to know?",
          messageType: "text",
          isRead: true,
          readAt: new Date()
        },
        {
          bookingId: bookingId!,
          senderId: patientUser.id,
          recipientId: clinicUser.id,
          content: "Thank you! I'd like to know about the treatment process, how long it will take, and what to expect during recovery.",
          messageType: "text",
          isRead: true,
          readAt: new Date()
        }
      ];
      
      for (const message of initialMessages) {
        await db.insert(messages).values(message);
      }
      
      console.log(`Added ${initialMessages.length} test messages to booking ${bookingId}`);
      
      // Create notification for the last message
      await db.insert(notifications).values({
        userId: clinicUser.id,
        title: "New Message",
        message: "You have a new message from a patient about their treatment process.",
        type: "message",
        action: `/bookings/${bookingId}/messages`,
        entityType: "message",
        entityId: bookingId,
        isRead: false
      });
      
      console.log('Added test notification for clinic user');
    } else {
      console.log(`Found ${messageCountValue} existing messages for booking ${bookingId}`);
    }
    
    return {
      success: true,
      bookingId: bookingId,
      patientId: patientUser.id,
      clinicId: clinicUser.id
    };
  } catch (error) {
    console.error('Error creating test booking data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}