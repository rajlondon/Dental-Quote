import { Router, Request, Response } from 'express';

// Simple in-memory storage for support tickets (replace with database in production)
const supportTicketStorage = new Map<string, any>();

export const setupSupportRoutes = () => {
  const router = Router();
  
  // Get all support tickets for the current user
  router.get('/tickets', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }
      
      const user = req.user as Express.User;
      const userId = user.id;
      
      // Get all tickets for this user
      const userTickets = Array.from(supportTicketStorage.values())
        .filter(ticket => ticket.userId === userId)
        .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
      
      return res.status(200).json({
        success: true,
        tickets: userTickets
      });
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch support tickets'
      });
    }
  });
  
  // Create a new support ticket
  router.post('/ticket', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }
      
      const { subject, message, category } = req.body;
      
      if (!subject || !message) {
        return res.status(400).json({
          success: false,
          error: 'Subject and message are required'
        });
      }
      
      const user = req.user as Express.User;
      const userId = user.id;
      const userName = user.username || user.name || 'Patient';
      const userEmail = user.email;
      
      if (!userEmail) {
        return res.status(400).json({
          success: false,
          error: 'User email not found'
        });
      }
      
      // Create a new ticket
      const ticketId = `ticket_${Date.now()}_${userId}`;
      const newTicket = {
        id: ticketId,
        userId,
        userName,
        userEmail,
        subject,
        status: 'open',
        category: category || 'General',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messages: [
          {
            id: `msg_${Date.now()}`,
            text: message,
            sender: 'user',
            timestamp: new Date().toISOString(),
            read: false
          }
        ]
      };
      
      // Store the ticket
      supportTicketStorage.set(ticketId, newTicket);
      
      console.log(`New support ticket created by ${userName} (${userEmail}): ${subject}`);
      
      // Add auto-response message after a short delay
      setTimeout(() => {
        const ticket = supportTicketStorage.get(ticketId);
        if (ticket) {
          const autoResponse = {
            id: `msg_${Date.now()}`,
            text: "Thank you for contacting MyDentalFly support. We've received your ticket and will respond as soon as possible, typically within 2 hours during business hours.",
            sender: 'support',
            timestamp: new Date().toISOString(),
            read: false
          };
          
          ticket.messages.push(autoResponse);
          ticket.lastActivity = new Date().toISOString();
          supportTicketStorage.set(ticketId, ticket);
        }
      }, 5000);
      
      return res.status(201).json({
        success: true,
        message: 'Support ticket created successfully',
        ticket: newTicket
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create support ticket'
      });
    }
  });
  
  // Reply to a support ticket
  router.post('/ticket/:ticketId/reply', async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }
      
      const { ticketId } = req.params;
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }
      
      const ticket = supportTicketStorage.get(ticketId);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          error: 'Support ticket not found'
        });
      }
      
      const user = req.user as Express.User;
      const userId = user.id;
      
      // Ensure the ticket belongs to the user
      if (ticket.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to reply to this ticket'
        });
      }
      
      // Add the reply
      const reply = {
        id: `msg_${Date.now()}`,
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      ticket.messages.push(reply);
      ticket.lastActivity = new Date().toISOString();
      ticket.status = 'waiting'; // Change status to waiting for response
      
      supportTicketStorage.set(ticketId, ticket);
      
      console.log(`User ${userId} replied to support ticket ${ticketId}`);
      
      // Add automated response after delay (simulation only)
      setTimeout(() => {
        const updatedTicket = supportTicketStorage.get(ticketId);
        if (updatedTicket) {
          const autoResponse = {
            id: `msg_${Date.now()}`,
            text: "We've received your message. Our support team will review it and respond as soon as possible.",
            sender: 'support',
            timestamp: new Date().toISOString(),
            read: false
          };
          
          updatedTicket.messages.push(autoResponse);
          updatedTicket.lastActivity = new Date().toISOString();
          updatedTicket.status = 'open'; // Change status back to open
          supportTicketStorage.set(ticketId, updatedTicket);
        }
      }, 8000);
      
      return res.status(200).json({
        success: true,
        message: 'Reply added successfully',
        ticket
      });
    } catch (error) {
      console.error('Error replying to support ticket:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to reply to support ticket'
      });
    }
  });
  
  return router;
};