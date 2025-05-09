import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { logger } from './utils/logger';

// Interface for WebSocket messages
interface WebSocketMessage {
  type: string;
  userId?: number;
  connectionId?: string;
  isClinic?: boolean;
  data?: any;
  timestamp?: number;
}

interface ConnectedClient {
  socket: WebSocket;
  userId?: number;
  connectionId: string;
  isClinic?: boolean;
  lastActivity: number;
}

// Map to store connected clients
const clients = new Map<string, ConnectedClient>();
// Map to track connections by user
const userConnections = new Map<number, Set<string>>();

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ 
    server, 
    path: '/ws',
    clientTracking: true 
  });

  logger.info('WebSocket server initialized');

  // Set up heartbeat interval to check for stale connections
  const heartbeatInterval = setInterval(() => {
    const activeConnections = clients.size;
    if (activeConnections > 0) {
      logger.info(`WebSocket heartbeat: ${activeConnections} active connections`);
    }
    
    clients.forEach((client, connectionId) => {
      // Check if the connection is still alive
      if (client.socket.readyState === WebSocket.OPEN) {
        try {
          // For authenticated users, send a ping to keep connection alive
          if (client.userId) {
            client.socket.send(JSON.stringify({ 
              type: 'ping', 
              timestamp: Date.now() 
            }));
            logger.info(`Heartbeat ping successful for client ${client.userId} (${client.isClinic ? 'clinic' : 'patient'})`);
          }
        } catch (e) {
          logger.error(`Error sending heartbeat to connection ${connectionId}:`, e);
          // Close problematic connections
          try {
            client.socket.terminate();
          } catch (err) {
            logger.error(`Error terminating problematic connection ${connectionId}:`, err);
          }
          clients.delete(connectionId);
          // Remove from user connections if associated with a user
          if (client.userId && userConnections.has(client.userId)) {
            const connections = userConnections.get(client.userId);
            connections?.delete(connectionId);
            if (connections?.size === 0) {
              userConnections.delete(client.userId);
            }
          }
        }
      } else {
        // Clean up dead connections
        logger.warn(`Dead connection found ${connectionId}, cleaning up`);
        clients.delete(connectionId);
        // Remove from user connections if associated with a user
        if (client.userId && userConnections.has(client.userId)) {
          const connections = userConnections.get(client.userId);
          connections?.delete(connectionId);
          if (connections?.size === 0) {
            userConnections.delete(client.userId);
          }
        }
      }
    });
  }, 30000); // Every 30 seconds

  // Handle new WebSocket connections
  wss.on('connection', (socket, req) => {
    const connectionId = `conn-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Store connection information
    clients.set(connectionId, {
      socket,
      connectionId,
      lastActivity: Date.now()
    });
    
    logger.info(`New WebSocket connection established: ${connectionId}`);
    
    // Send welcome message to client
    socket.send(JSON.stringify({
      type: 'welcome',
      connectionId,
      timestamp: Date.now()
    }));
    
    // Handle incoming messages
    socket.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        
        // Update last activity timestamp
        const client = clients.get(connectionId);
        if (client) {
          client.lastActivity = Date.now();
        }
        
        // Handle different message types
        switch (message.type) {
          case 'auth':
            // Associate this connection with a user
            if (message.userId) {
              const client = clients.get(connectionId);
              if (client) {
                client.userId = message.userId;
                client.isClinic = message.isClinic || false;
                
                // Add to user connections map
                if (!userConnections.has(message.userId)) {
                  userConnections.set(message.userId, new Set());
                }
                userConnections.get(message.userId)?.add(connectionId);
                
                logger.info(`WebSocket authenticated for user ${message.userId} (${message.isClinic ? 'clinic' : 'patient'})`);
                
                // Acknowledge authentication
                socket.send(JSON.stringify({
                  type: 'auth_success',
                  userId: message.userId,
                  timestamp: Date.now()
                }));
              }
            }
            break;
            
          case 'disconnect':
            // Handle client-initiated disconnect
            logger.info(`Client-initiated disconnect from ${connectionId}`);
            // Allow clean disconnection
            clients.delete(connectionId);
            
            // Remove from user connections if associated with a user
            if (message.userId && userConnections.has(message.userId)) {
              const connections = userConnections.get(message.userId);
              connections?.delete(connectionId);
              if (connections?.size === 0) {
                userConnections.delete(message.userId);
              }
            }
            break;
            
          case 'ping':
            // Respond to ping with pong
            socket.send(JSON.stringify({
              type: 'pong',
              timestamp: Date.now()
            }));
            break;
            
          default:
            // Forward message handling to more specific handlers
            handleClientMessage(connectionId, message);
            break;
        }
      } catch (e) {
        logger.error('Error processing WebSocket message:', e);
      }
    });
    
    // Handle connection close
    socket.on('close', (code, reason) => {
      logger.info(`WebSocket connection ${connectionId} closed with code ${code}: ${reason || 'No reason provided'}`);
      
      // Clean up client connection
      const client = clients.get(connectionId);
      if (client && client.userId) {
        // Remove from user connections
        if (userConnections.has(client.userId)) {
          const connections = userConnections.get(client.userId);
          connections?.delete(connectionId);
          if (connections?.size === 0) {
            userConnections.delete(client.userId);
          }
        }
      }
      
      clients.delete(connectionId);
    });
    
    // Handle connection errors
    socket.on('error', (error) => {
      logger.error(`WebSocket error on connection ${connectionId}:`, error);
      
      // Clean up on error
      clients.delete(connectionId);
    });
  });
  
  // Handle server shutdown
  process.on('SIGINT', () => {
    clearInterval(heartbeatInterval);
    
    // Close all WebSocket connections gracefully
    wss.clients.forEach((client) => {
      client.terminate();
    });
    
    logger.info('WebSocket server shut down gracefully');
  });
  
  return wss;
}

// Function to handle client messages
function handleClientMessage(connectionId: string, message: WebSocketMessage) {
  const client = clients.get(connectionId);
  if (!client) {
    logger.warn(`Message received for unknown connection ${connectionId}`);
    return;
  }
  
  // Handle specific message types
  switch (message.type) {
    case 'notification_read':
      // Handle notification read notifications
      if (message.data?.notificationId && client.userId) {
        logger.info(`User ${client.userId} marked notification ${message.data.notificationId} as read`);
        
        // Notify all user's connections about this change
        notifyUser(client.userId, {
          type: 'notification_updated',
          data: {
            notificationId: message.data.notificationId,
            read: true
          },
          timestamp: Date.now()
        });
      }
      break;
      
    case 'broadcast':
      // Only allow admin users to broadcast (to be implemented)
      break;
      
    default:
      logger.info(`Received unhandled message type: ${message.type}`);
      break;
  }
}

// Function to send a message to a specific user across all their connections
export function notifyUser(userId: number, message: WebSocketMessage) {
  if (!userConnections.has(userId)) {
    logger.warn(`Cannot notify user ${userId} - no active connections`);
    return false;
  }
  
  const connections = userConnections.get(userId);
  let success = false;
  
  connections?.forEach(connectionId => {
    const client = clients.get(connectionId);
    if (client && client.socket.readyState === WebSocket.OPEN) {
      try {
        client.socket.send(JSON.stringify(message));
        success = true;
      } catch (e) {
        logger.error(`Error sending notification to user ${userId} on connection ${connectionId}:`, e);
      }
    }
  });
  
  return success;
}

// Function to broadcast a message to all connected clients
export function broadcastMessage(message: WebSocketMessage) {
  let successCount = 0;
  
  clients.forEach((client, connectionId) => {
    if (client.socket.readyState === WebSocket.OPEN) {
      try {
        client.socket.send(JSON.stringify(message));
        successCount++;
      } catch (e) {
        logger.error(`Error broadcasting to connection ${connectionId}:`, e);
      }
    }
  });
  
  logger.info(`Broadcast message sent to ${successCount} clients`);
  return successCount;
}

// Get the number of connected clients
export function getConnectedClientsCount() {
  return clients.size;
}

// Get the number of connected users
export function getConnectedUsersCount() {
  return userConnections.size;
}

// Check if a user is connected
export function isUserConnected(userId: number) {
  if (!userConnections.has(userId)) {
    return false;
  }
  
  const connections = userConnections.get(userId);
  return connections && connections.size > 0;
}