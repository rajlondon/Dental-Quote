import { Router } from 'express';
import { WebSocketService } from '../services/websocketService';

const router = Router();

/**
 * Message queue for clients using long-polling fallback
 * Maps connectionId to array of pending messages
 */
const messageQueues: { [connectionId: string]: any[] } = {};

/**
 * Active long-polling connections
 * Maps connectionId to client information
 */
const activePollingClients: { [connectionId: string]: any } = {};

/**
 * Add a message to a client's queue
 */
function addMessageToQueue(connectionId: string, message: any) {
  if (!messageQueues[connectionId]) {
    messageQueues[connectionId] = [];
  }
  messageQueues[connectionId].push({
    ...message,
    timestamp: Date.now()
  });
  
  // Limit queue size to prevent memory issues
  if (messageQueues[connectionId].length > 100) {
    messageQueues[connectionId] = messageQueues[connectionId].slice(-100);
  }
}

/**
 * Clear old inactive clients periodically
 */
setInterval(() => {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes
  
  Object.keys(activePollingClients).forEach(connectionId => {
    const client = activePollingClients[connectionId];
    if (now - client.lastActive > maxAge) {
      console.log(`Removing inactive long-polling client ${connectionId}`);
      delete activePollingClients[connectionId];
      delete messageQueues[connectionId];
    }
  });
}, 60 * 1000); // Check every minute

/**
 * Register the long-polling client
 */
function registerPollingClient(connectionId: string, userId: string | number, isClinic: boolean) {
  const clientId = userId || 'anonymous';
  const clientType = isClinic ? 'clinic' : 'patient';
  
  // Create or update client
  activePollingClients[connectionId] = {
    id: clientId,
    type: clientType,
    connectionId,
    lastActive: Date.now(),
    pollingCount: (activePollingClients[connectionId]?.pollingCount || 0) + 1
  };
  
  // Initialize message queue if needed
  if (!messageQueues[connectionId]) {
    messageQueues[connectionId] = [];
  }
  
  // Add welcome message for first-time registration
  if (activePollingClients[connectionId].pollingCount === 1) {
    addMessageToQueue(connectionId, {
      type: 'connection',
      message: 'Connected via long-polling fallback',
      connectionId,
      timestamp: Date.now()
    });
    
    console.log(`Long-polling client registered: ${connectionId} (${clientType} ${clientId})`);
  }
  
  return activePollingClients[connectionId];
}

/**
 * Long-polling endpoint for clients to receive messages
 */
router.get('/poll', (req, res) => {
  const { connectionId, userId, isClinic } = req.query;
  
  if (!connectionId) {
    return res.status(400).json({ success: false, error: 'Missing connectionId parameter' });
  }
  
  // Register or update client
  const client = registerPollingClient(
    connectionId as string,
    userId as string,
    isClinic === 'true'
  );
  
  // Update last active timestamp
  client.lastActive = Date.now();
  
  // Get pending messages for this client
  const messages = messageQueues[connectionId as string] || [];
  
  // Clear the queue after sending
  messageQueues[connectionId as string] = [];
  
  // Send heartbeat message if no other messages
  if (messages.length === 0) {
    messages.push({
      type: 'ping',
      timestamp: Date.now(),
      connectionId
    });
  }
  
  // Return messages to client
  res.json({
    success: true,
    connectionId,
    messages,
    timestamp: Date.now()
  });
});

/**
 * Endpoint for clients to send messages
 */
router.post('/send', (req, res) => {
  const { connectionId, type, userId, isClinic, ...messageData } = req.body;
  
  if (!connectionId || !type) {
    return res.status(400).json({ success: false, error: 'Missing required parameters' });
  }
  
  // Update client activity timestamp
  if (activePollingClients[connectionId]) {
    activePollingClients[connectionId].lastActive = Date.now();
  } else {
    // Register new client if not already registered
    registerPollingClient(
      connectionId,
      userId || 'anonymous',
      !!isClinic
    );
  }
  
  // Handle special message types
  if (type === 'disconnect') {
    console.log(`Long-polling client ${connectionId} requested disconnect`);
    
    // Clean up client data
    delete activePollingClients[connectionId];
    delete messageQueues[connectionId];
    
    return res.json({
      success: true,
      message: 'Disconnected successfully'
    });
  }
  
  // Special message processing
  if (type === 'ping') {
    // Respond to ping with pong
    addMessageToQueue(connectionId, {
      type: 'pong',
      timestamp: Date.now(),
      connectionId
    });
  }
  
  // Forward message to WebSocket service if available
  try {
    WebSocketService.broadcastToAll({
      type,
      ...messageData,
      sender: {
        id: userId || 'anonymous',
        type: isClinic ? 'clinic' : 'patient'
      },
      connectionId,
      timestamp: Date.now(),
      source: 'longpoll'
    });
  } catch (error) {
    console.error('Error forwarding long-polling message to WebSocket service:', error);
  }
  
  res.json({
    success: true,
    message: 'Message received'
  });
});

export function registerMessageRoutes(app: any) {
  app.use('/api/messages', router);
  
  // Make message queue available to WebSocket service
  (global as any).httpMessageQueue = {
    addMessageToQueue
  };
  
  console.log('Long-polling message routes registered');
}