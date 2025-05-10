import { Express, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

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

/**
 * Client connection tracking
 */
interface HttpClient {
  connectionId: string;
  userId?: number;
  isClinic?: boolean;
  lastActivity: number;
  lastMessageId?: string;
}

// In-memory storage for HTTP fallback clients and messages
const httpClients: Map<string, HttpClient> = new Map();
const messageQueue: MessageQueueItem[] = [];

// Time in milliseconds after which to consider a connection stale
const STALE_CONNECTION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const MESSAGE_RETENTION_PERIOD = 2 * 60 * 1000; // 2 minutes

/**
 * Cleanup function to remove stale connections and old messages
 */
function cleanupStaleClients() {
  const now = Date.now();
  
  // Remove stale clients
  for (const [connectionId, client] of httpClients.entries()) {
    if (now - client.lastActivity > STALE_CONNECTION_TIMEOUT) {
      console.log(`Removing stale HTTP client: ${connectionId}`);
      httpClients.delete(connectionId);
    }
  }
  
  // Remove old messages
  let oldestValidMessageTime = now - MESSAGE_RETENTION_PERIOD;
  while (messageQueue.length > 0 && messageQueue[0].timestamp < oldestValidMessageTime) {
    messageQueue.shift();
  }
}

// Run cleanup every minute
setInterval(cleanupStaleClients, 60000);

export function registerMessageRoutes(app: Express) {
  /**
   * Register a new HTTP client for message polling
   * This endpoint is called when a client wants to use the HTTP fallback
   */
  app.post('/api/messages/register', (req: Request, res: Response) => {
    try {
      const { connectionId, userId, isClinic } = req.body;
      
      if (!connectionId) {
        return res.status(400).json({ success: false, message: 'Connection ID is required' });
      }
      
      // Update or create the client
      httpClients.set(connectionId, {
        connectionId,
        userId: userId || undefined,
        isClinic: isClinic || false,
        lastActivity: Date.now(),
      });
      
      console.log(`HTTP fallback client registered: ${connectionId}${userId ? ` (User ID: ${userId})` : ''}`);
      
      return res.status(200).json({ 
        success: true, 
        message: 'HTTP client registered successfully',
        connectionId
      });
    } catch (error) {
      console.error('Error registering HTTP client:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
  /**
   * Long-polling endpoint for receiving messages
   * Clients will make a request to this endpoint and it will wait until
   * there are messages available or the timeout is reached
   */
  app.get('/api/messages/poll/:connectionId', async (req: Request, res: Response) => {
    const connectionId = req.params.connectionId;
    const lastMessageId = req.query.lastMessageId as string | undefined;
    
    // Check if the client exists
    const client = httpClients.get(connectionId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    
    // Update last activity
    client.lastActivity = Date.now();
    client.lastMessageId = lastMessageId || client.lastMessageId;
    
    try {
      // Get messages for this client
      let clientMessages = messageQueue.filter(msg => 
        msg.connectionId === connectionId ||
        msg.connectionId === 'broadcast'
      );
      
      // Filter for messages newer than the last one received by the client
      if (lastMessageId) {
        const lastMessageIndex = clientMessages.findIndex(msg => msg.id === lastMessageId);
        if (lastMessageIndex !== -1) {
          clientMessages = clientMessages.slice(lastMessageIndex + 1);
        }
      }
      
      // If there are messages, send them immediately
      if (clientMessages.length > 0) {
        return res.status(200).json({ 
          success: true, 
          messages: clientMessages
        });
      }
      
      // For immediate response with no messages
      return res.status(200).json({ 
        success: true, 
        messages: [] 
      });
      
    } catch (error) {
      console.error('Error polling for messages:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
  /**
   * Send a message via HTTP
   * This endpoint is used by clients when WebSocket is not available
   */
  app.post('/api/messages/send', (req: Request, res: Response) => {
    try {
      const { connectionId, message } = req.body;
      
      if (!connectionId || !message) {
        return res.status(400).json({ success: false, message: 'Connection ID and message are required' });
      }
      
      // Check if the client exists
      const client = httpClients.get(connectionId);
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found' });
      }
      
      // Update last activity
      client.lastActivity = Date.now();
      
      if (message.type === 'heartbeat') {
        // Just update the activity timestamp for heartbeats
        return res.status(200).json({ 
          success: true, 
          message: 'Heartbeat received'
        });
      }
      
      console.log(`Message received via HTTP from ${connectionId}: Type=${message.type}`);
      
      if (message.type === 'ping') {
        // Respond with a pong message
        const pongMessageId = uuidv4();
        const timestamp = Date.now();
        
        const messageItem: MessageQueueItem = {
          id: pongMessageId,
          connectionId,
          type: 'pong',
          payload: {
            timestamp,
            originalTimestamp: message.timestamp,
            roundTrip: timestamp - message.timestamp
          },
          timestamp
        };
        
        messageQueue.push(messageItem);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Ping processed, pong queued' 
        });
      } else if (message.type === 'chat') {
        // Process chat message (echo it back for testing)
        if (client.userId) {
          // Here you could handle the chat message, e.g., save to database, deliver to recipients, etc.
          const timestamp = Date.now();
          const echoMessageId = uuidv4();
          
                  const messageItem: MessageQueueItem = {
                    id: echoMessageId,
                    connectionId,
                    type: 'chat',
                    payload: {
                      content: `Echo: ${message.content}`,
                      timestamp,
                      sender: 'server'
                    },
                    timestamp
                  };
                  
                  messageQueue.push(messageItem);
        }
        
        return res.status(200).json({ 
          success: true, 
          message: 'Message received and processed' 
        });
      }
      
      // Handle other message types
      return res.status(200).json({ 
        success: true, 
        message: 'Message received' 
      });
    } catch (error) {
      console.error('Error processing message:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
  /**
   * Unregister an HTTP client
   * This endpoint is called when a client disconnects and no longer needs the HTTP fallback
   */
  app.post('/api/messages/unregister', (req: Request, res: Response) => {
    try {
      const { connectionId } = req.body;
      
      if (!connectionId) {
        return res.status(400).json({ success: false, message: 'Connection ID is required' });
      }
      
      // Remove the client
      const removed = httpClients.delete(connectionId);
      
      if (removed) {
        console.log(`HTTP fallback client unregistered: ${connectionId}`);
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'HTTP client unregistered successfully' 
      });
    } catch (error) {
      console.error('Error unregistering HTTP client:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
  /**
   * Get HTTP client status and metrics
   * This is useful for monitoring and debugging
   */
  app.get('/api/messages/status', (req: Request, res: Response) => {
    try {
      return res.status(200).json({
        success: true,
        metrics: {
          activeHttpClients: httpClients.size,
          queuedMessages: messageQueue.length,
        },
        clients: Array.from(httpClients.values()).map(client => ({
          connectionId: client.connectionId,
          userId: client.userId,
          isClinic: client.isClinic,
          lastActivity: new Date(client.lastActivity).toISOString(),
          idleTimeSeconds: Math.floor((Date.now() - client.lastActivity) / 1000)
        }))
      });
    } catch (error) {
      console.error('Error getting HTTP client status:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
  app.get('/api/messages/ping', (req: Request, res: Response) => {
    res.status(200).json({ success: true, timestamp: Date.now() });
  });
}