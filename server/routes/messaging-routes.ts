import express from 'express';
import { db } from '../db';
import { eq, and, desc, sql, asc } from 'drizzle-orm';
import { messages, users, bookings, files } from '@shared/schema';
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
      if (senderId === booking.patientId) {
        // If sender is patient, recipient is clinic
        recipient = booking.clinicId;
      } else if (senderId === booking.clinicId) {
        // If sender is clinic, recipient is patient
        recipient = booking.patientId;
      } else {
        // If sender is admin, need to determine context
        // For simplicity, default to patient as recipient
        recipient = booking.patientId;
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
        sql`(${bookings.patientId} = ${userId} OR ${bookings.clinicId} = ${userId} OR ${req.user!.role} = 'admin')`
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

export default router;