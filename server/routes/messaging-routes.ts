import express from 'express';
import { db } from '../db';
import { eq, and, desc, sql, asc } from 'drizzle-orm';
import { messages, users, bookings, files, notifications } from '@shared/schema';
import { isAuthenticated } from '../middleware/auth-middleware';
import multer from 'multer';
import { CloudStorage } from '../services/cloudStorage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const cloudStorage = new CloudStorage();

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow certain file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

// Get all messages for a booking
router.get('/booking/:bookingId', isAuthenticated, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user!.id;
    
    // First verify that this user has access to this booking
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, parseInt(bookingId)),
        sql`(${bookings.userId} = ${userId} OR ${bookings.clinicId} = ${userId} OR ${req.user!.role} = 'admin')`
      )
    });
    
    if (!booking) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access messages for this booking'
      });
    }
    
    // Get messages with file attachments
    const messageResults = await db.query.messages.findMany({
      where: eq(messages.bookingId, parseInt(bookingId)),
      orderBy: [asc(messages.createdAt)],
      with: {
        sender: {
          columns: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImageUrl: true
          }
        },
        attachment: true
      }
    });
    
    // Mark messages as read if they were sent to this user
    const unreadMessages = messageResults.filter(
      m => !m.isRead && m.recipientId === userId
    );
    
    if (unreadMessages.length > 0) {
      const now = new Date();
      const updatePromises = unreadMessages.map(message => 
        db.update(messages)
          .set({ isRead: true, readAt: now })
          .where(eq(messages.id, message.id))
      );
      
      await Promise.all(updatePromises);
    }
    
    res.json({
      success: true,
      messages: messageResults
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching messages'
    });
  }
});

// Send a new message
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { bookingId, content, recipientId, messageType = 'text', attachmentId } = req.body;
    const senderId = req.user!.id;
    
    if (!bookingId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and message content are required'
      });
    }
    
    // Verify sender has access to this booking
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, bookingId),
        sql`(${bookings.userId} = ${senderId} OR ${bookings.clinicId} = ${senderId} OR ${req.user!.role} = 'admin')`
      )
    });
    
    if (!booking) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to send messages for this booking'
      });
    }
    
    // Determine the recipient if not explicitly provided
    let recipient = recipientId;
    if (!recipient) {
      if (senderId === booking.userId) {
        // If sender is patient, recipient is clinic
        recipient = booking.clinicId;
      } else if (senderId === booking.clinicId) {
        // If sender is clinic, recipient is patient
        recipient = booking.userId;
      } else {
        // If sender is admin, need to determine context
        // For simplicity, default to patient as recipient
        recipient = booking.userId;
      }
    }
    
    // Create the new message
    const [newMessage] = await db.insert(messages)
      .values({
        bookingId,
        senderId,
        recipientId: recipient,
        content,
        messageType,
        hasAttachment: !!attachmentId,
        attachmentId: attachmentId || null
      })
      .returning();
    
    // Get the full message with sender and attachment details
    const messageWithDetails = await db.query.messages.findFirst({
      where: eq(messages.id, newMessage.id),
      with: {
        sender: {
          columns: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImageUrl: true
          }
        },
        attachment: true
      }
    });
    
    // Access the WebSocket service to notify the recipient
    const wsService = req.app.locals.wsService;
    if (wsService && recipient) {
      // Send a notification through WebSocket
      wsService.broadcast({
        type: 'new_message',
        payload: messageWithDetails,
        sender: {
          id: senderId.toString(),
          type: req.user!.role
        },
        target: recipient.toString()
      }, req.user!.role === 'admin' ? 'admin' : (req.user!.role === 'clinic' ? 'clinic' : 'patient'));
    }
    
    res.status(201).json({
      success: true,
      message: messageWithDetails
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while sending the message'
    });
  }
});

// Upload a file attachment for a message
router.post('/upload-attachment', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const file = req.file;
    const userId = req.user!.id;
    const { bookingId } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required'
      });
    }
    
    // Verify user has access to this booking
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, parseInt(bookingId)),
        sql`(${bookings.userId} = ${userId} OR ${bookings.clinicId} = ${userId} OR ${req.user!.role} = 'admin')`
      )
    });
    
    if (!booking) {
      // Clean up the temporary file
      fs.unlinkSync(file.path);
      
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to upload files for this booking'
      });
    }
    
    // Determine file type category
    let fileType = 'document';
    if (file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (file.mimetype === 'application/pdf') {
      fileType = 'document';
    }
    
    // Upload to cloud storage
    const uploadResult = await cloudStorage.uploadFile(
      file.path,
      `messages/${bookingId}/${path.basename(file.path)}`,
      {
        contentType: file.mimetype,
        visibility: 'private'
      }
    );
    
    // Clean up the temporary file
    fs.unlinkSync(file.path);
    
    if (!uploadResult || !uploadResult.url) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file to storage'
      });
    }
    
    // Save file record in database
    const [fileRecord] = await db.insert(files)
      .values({
        userId,
        bookingId: parseInt(bookingId),
        uploadedById: userId,
        filename: path.basename(file.path),
        originalName: file.originalname,
        mimetype: file.mimetype,
        fileType,
        fileSize: file.size,
        fileUrl: uploadResult.url,
        fileCategory: 'message',
        visibility: 'private'
      })
      .returning();
    
    res.status(201).json({
      success: true,
      file: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        originalname: fileRecord.originalName,
        mimetype: fileRecord.mimetype,
        size: fileRecord.fileSize,
        url: fileRecord.fileUrl
      }
    });
  } catch (error) {
    console.error('Error uploading file attachment:', error);
    
    // Clean up temporary file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred during file upload'
    });
  }
});

// Mark message as read
router.put('/:messageId/read', isAuthenticated, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user!.id;
    
    // First check if the message exists and is addressed to this user
    const message = await db.query.messages.findFirst({
      where: and(
        eq(messages.id, parseInt(messageId)),
        eq(messages.recipientId, userId)
      )
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you do not have permission to access it'
      });
    }
    
    // Update the message as read
    await db.update(messages)
      .set({ 
        isRead: true,
        readAt: new Date()
      })
      .where(eq(messages.id, parseInt(messageId)));
    
    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the message'
    });
  }
});

// Get unread message count
router.get('/unread/count', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.recipientId, userId),
          eq(messages.isRead, false)
        )
      );
    
    const unreadCount = result[0]?.count || 0;
    
    res.json({
      success: true,
      count: unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching unread message count'
    });
  }
});

// Get all conversations for a patient
router.get('/patient/conversations', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Get the patient record
    const patient = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!patient.length || patient[0].role !== 'patient') {
      return res.status(403).json({ success: false, message: 'User is not authorized as a patient' });
    }

    // Get all bookings for this patient with clinic info
    const patientBookings = await db.query.bookings.findMany({
      where: eq(bookings.userId, userId),
      with: {
        clinic: true, // Join with clinic table
      },
      orderBy: [desc(bookings.updatedAt)]
    });

    // For each booking, get the latest message
    const conversationsWithLatestMessage = await Promise.all(
      patientBookings.map(async (booking) => {
        // Get the latest message for this booking
        const latestMessage = await db.query.messages.findFirst({
          where: eq(messages.bookingId, booking.id),
          orderBy: [desc(messages.createdAt)]
        });

        // Count unread messages for this booking where patient is recipient
        const unreadCount = await db.select({
          count: sql<number>`count(*)`
        })
        .from(messages)
        .where(
          and(
            eq(messages.bookingId, booking.id),
            eq(messages.recipientId, userId),
            eq(messages.isRead, false)
          )
        );

        return {
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          clinicId: booking.clinicId,
          clinicName: booking.clinic?.name || 'MyDentalFly Clinic',
          clinicEmail: booking.clinic?.email,
          clinicAvatar: booking.clinic?.logoUrl,
          status: booking.status,
          lastMessage: latestMessage?.content || 'No messages yet',
          lastMessageTime: latestMessage?.createdAt || booking.createdAt,
          unreadCount: unreadCount[0]?.count || 0,
          treatmentType: booking.treatmentType || 'Dental Treatment'
        };
      })
    );

    return res.status(200).json({
      success: true,
      conversations: conversationsWithLatestMessage
    });
  } catch (error: any) {
    console.error('Error getting patient conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get patient conversations',
      error: error.message
    });
  }
});

// Get all messages for a specific booking for a patient
router.get('/patient/booking/:bookingId/messages', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { bookingId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Verify patient
    const patient = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!patient.length || patient[0].role !== 'patient') {
      return res.status(403).json({ success: false, message: 'User is not authorized as a patient' });
    }

    // Verify booking belongs to this patient
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, parseInt(bookingId)),
        eq(bookings.userId, userId)
      ),
      with: {
        clinic: true
      }
    });

    if (!booking) {
      return res.status(403).json({ 
        success: false, 
        message: 'Booking not found or you do not have permission to view messages for this booking' 
      });
    }

    // Get all messages for this booking
    const messagesList = await db.query.messages.findMany({
      where: eq(messages.bookingId, parseInt(bookingId)),
      with: {
        sender: true,
        recipient: true
      },
      orderBy: [asc(messages.createdAt)]
    });

    // Mark messages as read if patient is the recipient
    const messagesToUpdate = messagesList
      .filter(msg => msg.recipientId === userId && !msg.isRead)
      .map(msg => msg.id);
    
    if (messagesToUpdate.length > 0) {
      await db
        .update(messages)
        .set({ isRead: true, readAt: new Date() })
        .where(sql`id IN (${messagesToUpdate.join(', ')})`);
    }

    // Format messages for client
    const formattedMessages = messagesList.map(message => ({
      id: message.id,
      bookingId: message.bookingId,
      content: message.content,
      sender: message.senderId === userId ? 'patient' : 'clinic',
      senderName: message.senderId === userId 
        ? `${message.sender.firstName || ''} ${message.sender.lastName || 'You'}`.trim()
        : `${message.sender.firstName || ''} ${message.sender.lastName || 'Clinic Staff'}`.trim(),
      senderAvatar: message.sender.profileImage,
      timestamp: message.createdAt,
      isRead: message.isRead,
      messageType: message.messageType,
      attachmentId: message.attachmentId,
      hasAttachment: message.hasAttachment
    }));

    return res.status(200).json({
      success: true,
      booking: {
        id: booking.id,
        reference: booking.bookingReference,
        status: booking.status,
        treatmentType: booking.treatmentType || booking.treatmentName || 'Dental Treatment',
        clinic: {
          id: booking.clinicId,
          name: booking.clinic?.name || 'MyDentalFly Clinic',
          email: booking.clinic?.email,
          avatar: booking.clinic?.logoUrl
        }
      },
      messages: formattedMessages
    });
  } catch (error: any) {
    console.error('Error getting booking messages for patient:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get booking messages',
      error: error.message
    });
  }
});

// Get all conversations for a clinic
router.get('/clinic/conversations', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Get the clinic ID for this clinic staff
    const clinicStaff = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!clinicStaff.length || clinicStaff[0].role !== 'clinic_staff' || !clinicStaff[0].clinicId) {
      return res.status(403).json({ success: false, message: 'User is not authorized as clinic staff' });
    }
    
    const clinicId = clinicStaff[0].clinicId;

    // Get all bookings for this clinic with patient info
    const clinicBookings = await db.query.bookings.findMany({
      where: eq(bookings.clinicId, clinicId),
      with: {
        user: true,
      },
      orderBy: [desc(bookings.updatedAt)]
    });

    // For each booking, get the latest message
    const conversationsWithLatestMessage = await Promise.all(
      clinicBookings.map(async (booking) => {
        // Get the latest message for this booking
        const latestMessage = await db.query.messages.findFirst({
          where: eq(messages.bookingId, booking.id),
          orderBy: [desc(messages.createdAt)]
        });

        // Count unread messages for this booking where clinic staff is recipient
        const unreadCount = await db.select({
          count: sql<number>`count(*)`
        })
        .from(messages)
        .where(
          and(
            eq(messages.bookingId, booking.id),
            eq(messages.recipientId, userId),
            eq(messages.isRead, false)
          )
        );

        return {
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          patientId: booking.userId,
          patientName: `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim(),
          patientEmail: booking.user.email,
          patientAvatar: booking.user.profileImage,
          status: booking.status,
          lastMessage: latestMessage?.content || 'No messages yet',
          lastMessageTime: latestMessage?.createdAt || booking.createdAt,
          unreadCount: unreadCount[0]?.count || 0,
          treatmentType: booking.treatmentType || 'Dental Treatment'
        };
      })
    );

    return res.status(200).json({
      success: true,
      conversations: conversationsWithLatestMessage
    });
  } catch (error: any) {
    console.error('Error getting clinic conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get clinic conversations',
      error: error.message
    });
  }
});

// Get all messages for a specific booking with patient and clinic details
router.get('/clinic/booking/:bookingId/messages', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { bookingId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Get the clinic ID for this clinic staff
    const clinicStaff = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!clinicStaff.length || clinicStaff[0].role !== 'clinic_staff' || !clinicStaff[0].clinicId) {
      return res.status(403).json({ success: false, message: 'User is not authorized as clinic staff' });
    }
    
    const clinicId = clinicStaff[0].clinicId;

    // Verify booking belongs to this clinic
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, parseInt(bookingId)),
        eq(bookings.clinicId, clinicId)
      ),
      with: {
        user: true
      }
    });

    if (!booking) {
      return res.status(403).json({ 
        success: false, 
        message: 'Booking not found or you do not have permission to view messages for this booking' 
      });
    }

    // Get all messages for this booking
    const messagesList = await db.query.messages.findMany({
      where: eq(messages.bookingId, parseInt(bookingId)),
      with: {
        sender: true,
        recipient: true
      },
      orderBy: [asc(messages.createdAt)]
    });

    // Mark messages as read if clinic staff is the recipient
    const messagesToUpdate = messagesList
      .filter(msg => msg.recipientId === userId && !msg.isRead)
      .map(msg => msg.id);
    
    if (messagesToUpdate.length > 0) {
      await db
        .update(messages)
        .set({ isRead: true })
        .where(sql`id IN (${messagesToUpdate.join(', ')})`);
    }

    // Format messages for client
    const formattedMessages = messagesList.map(message => ({
      id: message.id,
      bookingId: message.bookingId,
      content: message.content,
      sender: message.sender.id === userId ? 'clinic' : 'patient',
      senderName: message.sender.id === userId 
        ? `${message.sender.firstName || ''} ${message.sender.lastName || 'Clinic Staff'}`.trim()
        : `${message.sender.firstName || ''} ${message.sender.lastName || 'Patient'}`.trim(),
      senderAvatar: message.sender.profileImage,
      timestamp: message.createdAt,
      isRead: message.isRead,
      messageType: message.messageType,
      attachmentUrl: message.attachmentUrl,
      attachmentType: message.attachmentType
    }));

    return res.status(200).json({
      success: true,
      booking: {
        id: booking.id,
        reference: booking.bookingReference,
        status: booking.status,
        treatmentType: booking.treatmentType,
        patient: {
          id: booking.user.id,
          name: `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim(),
          email: booking.user.email,
          avatar: booking.user.profileImage
        }
      },
      messages: formattedMessages
    });
  } catch (error: any) {
    console.error('Error getting booking messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get booking messages',
      error: error.message
    });
  }
});

// Send a message
router.post('/send', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { bookingId, content, messageType = 'text', attachmentId = null } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    if (!bookingId || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields: bookingId, content' });
    }
    
    // Validate the booking
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        user: true
      }
    });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Determine if this user is authorized to send messages for this booking
    const isClinicStaff = req.user?.role === 'clinic_staff';
    const isPatient = req.user?.role === 'patient';
    const isAdmin = req.user?.role === 'admin';
    
    if (!isAdmin) {
      if (isClinicStaff) {
        // Check if the clinic staff belongs to the clinic associated with this booking
        if (req.user?.clinicId !== booking.clinicId) {
          return res.status(403).json({ 
            success: false, 
            message: 'Not authorized: You do not belong to the clinic associated with this booking' 
          });
        }
      } else if (isPatient) {
        // Check if the patient is the one associated with this booking
        if (req.user?.id !== booking.userId) {
          return res.status(403).json({ 
            success: false, 
            message: 'Not authorized: This booking does not belong to you' 
          });
        }
      }
    }
    
    // Determine the recipient based on sender role
    let recipientId = null;
    
    if (isClinicStaff || isAdmin) {
      // If sender is clinic staff or admin, recipient is the patient
      // The userId in bookings table is the patient's ID
      recipientId = booking.userId;
    } else if (isPatient) {
      // If sender is patient, recipient is a clinic staff (assigned to the booking if available)
      if (booking.assignedClinicStaffId) {
        recipientId = booking.assignedClinicStaffId;
      } else {
        // Find a clinic staff to assign to this booking
        const [clinicStaff] = await db
          .select()
          .from(users)
          .where(
            and(
              eq(users.role, 'clinic_staff'),
              eq(users.clinicId, booking.clinicId!)
            )
          )
          .limit(1);
        
        if (clinicStaff) {
          // Update the booking with the assigned staff
          await db
            .update(bookings)
            .set({ 
              assignedClinicStaffId: clinicStaff.id,
              updatedAt: new Date()
            })
            .where(eq(bookings.id, bookingId));
            
          recipientId = clinicStaff.id;
        }
      }
    }
    
    // Create the message
    const [message] = await db.insert(messages).values({
      bookingId,
      senderId: userId,
      recipientId,
      content,
      messageType,
      attachmentId
    }).returning();
    
    // Create a notification for the recipient
    if (recipientId) {
      await db.insert(notifications).values({
        userId: recipientId,
        title: 'New Message',
        message: `You have a new message from ${isClinicStaff ? 'clinic staff' : 'patient'}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        type: 'message',
        action: `/bookings/${bookingId}/messages`,
        entityType: 'message',
        entityId: message.id,
        isRead: false
      });
    }
    
    // Update the booking's last message timestamp based on sender role
    const updateData: Record<string, any> = { updatedAt: new Date() };
    
    if (isClinicStaff) {
      updateData.lastClinicMessageAt = new Date();
    } else if (isPatient) {
      updateData.lastPatientMessageAt = new Date();
    } else if (isAdmin) {
      updateData.lastAdminMessageAt = new Date();
    }
    
    await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, bookingId));
    
    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

export default router;