import { Express, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getWebSocketService } from '../services/websocketService';

/**
 * Global message queue for long-polling fallback
 * This is used when WebSockets are not available or fail to connect
 */
interface MessageQueueItem {
  id: string;
  connectionId: string;
  type: string;
  payload: any;
  timestamp: number;
}

// Map of connectionId to array of messages
const messageQueues: Map<string, MessageQueueItem[]> = new Map();
// Map of connectionId to client information
const httpClients: Map<string, {
  id: string;
  userId?: number;
  isClinic?: boolean;
  lastPoll: number;
  lastMessageId?: string;
}> = new Map();

// Configuration
const MAX_QUEUE_SIZE = 100; // Maximum number of messages to keep per client
const CLIENT_TIMEOUT_MS = 60000; // Consider client disconnected after 60 seconds of no polls
const LONG_POLL_TIMEOUT_MS = 30000; // Long-polling timeout (30 seconds)

/**
 * Clean up old clients that haven't polled in a while
 */
function cleanupStaleClients() {
  const now = Date.now();
  let removedCount = 0;
  
  httpClients.forEach((client, connectionId) => {
    if (now - client.lastPoll > CLIENT_TIMEOUT_MS) {
      httpClients.delete(connectionId);
      messageQueues.delete(connectionId);
      removedCount++;
    }
  });
  
  if (removedCount > 0) {
    console.log(`Cleaned up ${removedCount} stale HTTP clients`);
  }
}

// Periodically clean up stale clients
setInterval(cleanupStaleClients, 30000);

export function registerMessageRoutes(app: Express) {
  /**
   * Register a new HTTP client for message polling
   * This endpoint is called when a client wants to use the HTTP fallback
   */
  app.post('/api/messages/register', (req: Request, res: Response) => {
    const { connectionId, userId, isClinic } = req.body;
    
    if (!connectionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing connectionId' 
      });
    }
    
    // Create or update client record
    httpClients.set(connectionId, {
      id: connectionId,
      userId: userId || undefined,
      isClinic: isClinic || false,
      lastPoll: Date.now()
    });
    
    // Initialize message queue if needed
    if (!messageQueues.has(connectionId)) {
      messageQueues.set(connectionId, []);
    }
    
    console.log(`HTTP client registered: ${connectionId} (userId: ${userId || 'none'}, isClinic: ${isClinic || false})`);
    
    return res.json({ 
      success: true, 
      connectionId, 
      httpFallbackActive: true,
      registeredAt: new Date().toISOString(),
      clientCount: httpClients.size
    });
  });
  
  /**
   * Long-polling endpoint for receiving messages
   * Clients will make a request to this endpoint and it will wait until
   * there are messages available or the timeout is reached
   */
  app.get('/api/messages/poll/:connectionId', async (req: Request, res: Response) => {
    const { connectionId } = req.params;
    const { lastMessageId } = req.query;
    
    // Validate connection ID
    if (!connectionId || !httpClients.has(connectionId)) {
      return res.status(404).json({ 
        success: false, 
        error: 'Unknown connection ID or client not registered' 
      });
    }
    
    // Update last poll time
    const client = httpClients.get(connectionId)!;
    client.lastPoll = Date.now();
    if (lastMessageId) {
      client.lastMessageId = lastMessageId as string;
    }
    
    // Get messages for this client
    let messages = messageQueues.get(connectionId) || [];
    
    // Filter messages by lastMessageId if provided
    if (lastMessageId) {
      const lastMsgIndex = messages.findIndex(m => m.id === lastMessageId);
      if (lastMsgIndex !== -1) {
        messages = messages.slice(lastMsgIndex + 1);
      }
    }
    
    // If there are already messages, send them immediately
    if (messages.length > 0) {
      return res.json({ 
        success: true, 
        messages,
        timestamp: Date.now(),
        queueSize: messages.length
      });
    }
    
    // Otherwise, set up a timeout and wait for messages
    const timeout = setTimeout(() => {
      // If no messages after timeout, send empty response
      if (!res.headersSent) {
        res.json({ 
          success: true, 
          messages: [],
          timestamp: Date.now(),
          queueSize: 0,
          timeout: true
        });
      }
    }, LONG_POLL_TIMEOUT_MS);
    
    // Clean up timeout on request close
    req.on('close', () => {
      clearTimeout(timeout);
    });
    
    // Set up interval to check for new messages
    const interval = setInterval(() => {
      if (res.headersSent) {
        clearInterval(interval);
        return;
      }
      
      const currentMessages = messageQueues.get(connectionId) || [];
      let filteredMessages = currentMessages;
      
      // Filter messages by lastMessageId if provided
      if (lastMessageId) {
        const lastMsgIndex = currentMessages.findIndex(m => m.id === lastMessageId);
        if (lastMsgIndex !== -1) {
          filteredMessages = currentMessages.slice(lastMsgIndex + 1);
        }
      }
      
      // If new messages are available, send them
      if (filteredMessages.length > 0) {
        clearInterval(interval);
        clearTimeout(timeout);
        
        if (!res.headersSent) {
          res.json({ 
            success: true, 
            messages: filteredMessages,
            timestamp: Date.now(),
            queueSize: filteredMessages.length
          });
        }
      }
    }, 500); // Check every 500ms
  });
  
  /**
   * Send a message via HTTP
   * This endpoint is used by clients when WebSocket is not available
   */
  app.post('/api/messages/send', (req: Request, res: Response) => {
    const { connectionId, message } = req.body;
    
    if (!connectionId || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing connectionId or message' 
      });
    }
    
    if (!httpClients.has(connectionId)) {
      return res.status(404).json({ 
        success: false, 
        error: 'Unknown connection ID or client not registered' 
      });
    }
    
    // Get the WebSocket service
    const wsService = getWebSocketService();
    if (!wsService) {
      return res.status(500).json({ 
        success: false, 
        error: 'WebSocket service not available' 
      });
    }
    
    // Process the message as if it came from WebSocket
    try {
      // Route message to appropriate handler based on type
      console.log(`HTTP message received: ${message.type} from ${connectionId}`);
      
      // Use the WebSocket service to broadcast or relay the message
      if (message.target) {
        // Targeted message to specific client
        const targetClient = httpClients.get(message.target);
        if (targetClient) {
          // Add message to target's queue
          const messageItem: MessageQueueItem = {
            id: uuidv4(),
            connectionId: message.target,
            type: message.type,
            payload: message.payload,
            timestamp: Date.now()
          };
          
          const queue = messageQueues.get(message.target) || [];
          queue.push(messageItem);
          
          // Trim queue if it gets too large
          if (queue.length > MAX_QUEUE_SIZE) {
            queue.splice(0, queue.length - MAX_QUEUE_SIZE);
          }
          
          messageQueues.set(message.target, queue);
        }
      } else {
        // Broadcast to all based on type
        if (message.type === 'patient_notification' && wsService) {
          wsService.broadcast({
            type: 'patient_notification',
            payload: message.payload
          }, 'patient');
        } else if (message.type === 'clinic_notification' && wsService) {
          wsService.broadcast({
            type: 'clinic_notification',
            payload: message.payload
          }, 'clinic');
        } else {
          // Default: process as normal WebSocket message
          const client = httpClients.get(connectionId);
          if (client) {
            // Also add to all other clients' queues for this type
            httpClients.forEach((otherClient, otherConnectionId) => {
              if (otherConnectionId !== connectionId) {
                // Only send to appropriate client type
                if (
                  (message.type.includes('patient') && !otherClient.isClinic) ||
                  (message.type.includes('clinic') && otherClient.isClinic) ||
                  message.type === 'heartbeat' // Always relay heartbeats
                ) {
                  const messageItem: MessageQueueItem = {
                    id: uuidv4(),
                    connectionId: otherConnectionId,
                    type: message.type,
                    payload: message.payload,
                    timestamp: Date.now()
                  };
                  
                  const queue = messageQueues.get(otherConnectionId) || [];
                  queue.push(messageItem);
                  
                  // Trim queue if it gets too large
                  if (queue.length > MAX_QUEUE_SIZE) {
                    queue.splice(0, queue.length - MAX_QUEUE_SIZE);
                  }
                  
                  messageQueues.set(otherConnectionId, queue);
                }
              }
            });
          }
        }
      }
      
      return res.json({ 
        success: true, 
        messageProcessed: true,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error processing HTTP message:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Error processing message' 
      });
    }
  });
  
  /**
   * Unregister an HTTP client
   * This endpoint is called when a client disconnects and no longer needs the HTTP fallback
   */
  app.post('/api/messages/unregister', (req: Request, res: Response) => {
    const { connectionId } = req.body;
    
    if (!connectionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing connectionId' 
      });
    }
    
    // Remove client and its message queue
    httpClients.delete(connectionId);
    messageQueues.delete(connectionId);
    
    console.log(`HTTP client unregistered: ${connectionId}`);
    
    return res.json({ 
      success: true, 
      unregistered: true,
      remainingClients: httpClients.size
    });
  });
  
  /**
   * Get HTTP client status and metrics
   * This is useful for monitoring and debugging
   */
  app.get('/api/messages/status', (req: Request, res: Response) => {
    // Clean up stale clients before reporting status
    cleanupStaleClients();
    
    const clients: any[] = [];
    httpClients.forEach((client, connectionId) => {
      const queue = messageQueues.get(connectionId) || [];
      clients.push({
        connectionId,
        userId: client.userId,
        isClinic: client.isClinic,
        lastPoll: new Date(client.lastPoll).toISOString(),
        queueSize: queue.length,
        lastMessageId: client.lastMessageId,
        inactive: Date.now() - client.lastPoll > CLIENT_TIMEOUT_MS / 2
      });
    });
    
    return res.json({
      success: true,
      totalClients: httpClients.size,
      clients,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
  
  // Add a diagnostic endpoint to verify message routes are registered
  app.get('/api/messages/ping', (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Long-polling message routes are active',
      timestamp: new Date().toISOString(),
      clientCount: httpClients.size,
      queueCount: messageQueues.size
    });
  });
}