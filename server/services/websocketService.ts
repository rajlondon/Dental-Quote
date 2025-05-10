import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface Client {
  ws: WebSocket;
  id: string;
  type: 'patient' | 'clinic' | 'admin';
}

interface Message {
  type: string;
  payload: any;
  sender: {
    id: string;
    type: 'patient' | 'clinic' | 'admin';
  };
  target?: string; // Optional target client ID
}

/**
 * WebSocket Service for real-time data synchronization
 * Handles bidirectional communication between patient and clinic portals
 */
export class WebSocketService {
  private static instance: WebSocketService;
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();
  
  constructor(server: Server) {
    // Initialize WebSocket server on a specific path to avoid conflict with Vite HMR
    // Add heartbeat settings to prevent disconnections
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      // Increase these values to handle slow connections
      clientTracking: true,
      // These would be passed to socket.io if we were using it
      // pingTimeout: 60000,
      // pingInterval: 25000,
    });
    
    this.setupEventHandlers();
    
    // Setup ping interval to keep connections alive
    this.setupHeartbeat();
    
    // Store the instance for static access
    WebSocketService.instance = this;
    
    console.log('WebSocket service initialized with improved heartbeat settings');
  }
  
  // Setup heartbeat to keep connections alive with improved error handling
  private setupHeartbeat() {
    const HEARTBEAT_INTERVAL = 30000; // 30 seconds
    const INACTIVE_TIMEOUT = 120000; // 2 minutes (time after which to consider connection inactive)
    
    // Track last ping response time for each client
    const lastPongTimes = new Map<string, number>();
    
    // Set up the ping interval
    setInterval(() => {
      try {
        // Log current state
        console.log(`WebSocket heartbeat: ${this.getClientCount()} active connections`);
        const now = Date.now();
        
        // Use Array.from to convert the Map entries to avoid MapIterator issues
        Array.from(this.clients.entries()).forEach(([clientId, client]) => {
          try {
            // Check for stale connections (no pong received in 2 minutes)
            const lastPongTime = lastPongTimes.get(clientId) || now;
            const timeSinceLastPong = now - lastPongTime;
            
            if (timeSinceLastPong > INACTIVE_TIMEOUT) {
              console.warn(`Client ${clientId} (${client.type}) has been unresponsive for ${Math.floor(timeSinceLastPong/1000)}s. Terminating connection.`);
              try {
                // Force close and cleanup the connection
                if (client.ws.readyState !== WebSocket.CLOSED) {
                  client.ws.close(1000, "Connection timeout - no response to ping");
                }
                this.clients.delete(clientId);
                lastPongTimes.delete(clientId);
              } catch (terminateError) {
                console.error(`Error terminating unresponsive client ${clientId}:`, terminateError);
              }
              return; // Skip to next client
            }
            
            // Only ping open connections
            if (client.ws.readyState === WebSocket.OPEN) {
              // Set up pong handler for this specific client
              client.ws.once('pong', () => {
                // Update last pong time on response
                lastPongTimes.set(clientId, Date.now());
                console.log(`Heartbeat ping successful for client ${clientId} (${client.type})`);
              });
              
              // Send the ping
              client.ws.ping();
            } else if (client.ws.readyState === WebSocket.CLOSED || client.ws.readyState === WebSocket.CLOSING) {
              // Remove dead connections to prevent memory leaks
              console.log(`Removing dead WebSocket connection for ${clientId} (${client.type})`);
              this.clients.delete(clientId);
              lastPongTimes.delete(clientId);
            }
          } catch (error) {
            console.error(`Error during WebSocket heartbeat for client ${clientId}:`, error);
            // Clean up broken connections
            try {
              this.clients.delete(clientId);
              lastPongTimes.delete(clientId);
            } catch (cleanupError) {
              console.error(`Error removing dead client ${clientId}:`, cleanupError);
            }
          }
        });
      } catch (error) {
        console.error("Fatal error in heartbeat system:", error);
      }
    }, HEARTBEAT_INTERVAL);
  }
  
  // Get client count for health checks
  public getClientCount(): number {
    let activeCount = 0;
    this.clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        activeCount++;
      }
    });
    return activeCount;
  }
  
  // Static method to broadcast to all connected clients
  public static broadcastToAll(data: any): void {
    try {
      if (!WebSocketService.instance) {
        console.error('WebSocketService not initialized yet');
        return;
      }
      
      // Use the instance method
      WebSocketService.instance.broadcast(data);
    } catch (error) {
      console.error('Error in static broadcastToAll method:', error);
    }
  }
  
  private setupEventHandlers() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      // Set a unique identifier for this connection - preserve client-side ID if available
      let connectionId = '';
      const urlParams = new URL(req.url || '', `http://${req.headers.host}`).searchParams;
      const clientProvidedId = urlParams.get('connectionId');
      const userId = urlParams.get('userId');
      const isClinic = urlParams.get('isClinic') === 'true';
      
      // Log connection details for debugging
      console.log(`New WebSocket connection request received with params:`, { 
        clientProvidedId, 
        userId, 
        isClinic,
        url: req.url,
        headers: {
          userAgent: req.headers['user-agent'],
          origin: req.headers.origin
        }
      });
      
      if (clientProvidedId && clientProvidedId.length > 10) {
        // Use client-provided ID if available (helps with error tracking)
        connectionId = clientProvidedId;
      } else {
        // Generate server-side ID
        connectionId = `ws-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      }
      
      // Store the connection ID on the socket object for reference
      (ws as any).connectionId = connectionId;
      (ws as any).connectedAt = Date.now();
      console.log(`New WebSocket connection established: ${connectionId}`);
      
      // Handle messages with error catching
      ws.on('message', (message: string) => {
        try {
          this.handleMessage(ws, message);
        } catch (error) {
          console.error(`Error processing WebSocket message for ${connectionId}:`, error);
          // Send error response
          this.sendErrorResponse(ws, "Internal server error while processing message");
        }
      });
      
      // Handle connection closing with improved error handling for code 1006
      ws.on('close', (code: number, reason: string) => {
        // Remove client on disconnect
        // Convert Map entries to Array to avoid downlevelIteration issues
        let clientId = "unknown";
        let clientType = "unknown";
        
        Array.from(this.clients.entries()).forEach(([id, client]) => {
          if (client.ws === ws) {
            this.clients.delete(id);
            clientId = id;
            clientType = client.type;
            console.log(`Client ${id} (${client.type}) disconnected with code ${code}, reason: ${reason || 'No reason'}`);
          }
        });
        
        // If code 1006 (abnormal closure), log more details for debugging
        if (code === 1006) {
          console.warn(`Abnormal WebSocket closure (1006) for client ${clientId} type ${clientType}. This typically indicates network issues or server restart.`);
          
          // No need to attempt reconnect here - the client will handle reconnection
          // Just log detailed information to help diagnose the issue
          console.log(`WebSocket connection details:
            - Connection ID: ${clientId}
            - Client type: ${clientType}
            - Close code: ${code}
            - Close reason: ${reason || 'No reason provided'}
            - Current server uptime: ${process.uptime().toFixed(2)}s
            - Active connections: ${this.getClientCount()}
          `);
        }
      });
      
      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for connection ${connectionId}:`, error);
        
        // Try to determine client ID
        let clientId = "unknown";
        try {
          Array.from(this.clients.entries()).forEach(([id, client]) => {
            if (client.ws === ws) {
              clientId = id;
            }
          });
          
          // Log detailed error information
          console.error(`WebSocket error for client ${clientId}:`, error);
        } catch (cleanupError) {
          console.error(`Error identifying client during error handling:`, cleanupError);
        }
      });
      
      // Send a welcome message with enhanced error handling
      try {
        ws.send(JSON.stringify({
          type: 'connection',
          message: 'Connected to MyDentalFly synchronization service',
        }));
      } catch (error) {
        console.error(`Failed to send welcome message to new connection ${connectionId}:`, error);
      }
    });
  }
  
  // Helper for sending error responses
  private sendErrorResponse(ws: WebSocket, message: string) {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          message
        }));
      }
    } catch (error) {
      console.error('Failed to send error response:', error);
    }
  }
  
  private handleMessage(ws: WebSocket, message: string) {
    const connectionId = (ws as any).connectionId || 'unknown';
    let parsedData: any = null;
    
    try {
      // Parse the message and add more context for debugging
      parsedData = JSON.parse(message);
      
      // Skip detailed logging for heartbeat messages to reduce noise
      if (parsedData.type !== 'ping' && parsedData.type !== 'pong') {
        console.log(`WebSocket message received from ${connectionId}:`, {
          type: parsedData.type,
          sender: parsedData.sender,
          hasConnectionId: !!parsedData.connectionId,
          timestamp: new Date().toISOString()
        });
      }
      
      // Add connection tracking fields if missing
      if (!parsedData.connectionId) {
        parsedData.connectionId = connectionId;
      }
      
      // Check for critical fields
      if (!parsedData.type) {
        throw new Error('Message type is required');
      }
      
      // Enhanced handling with connection tracking
      if (parsedData.type === 'auth') {
        if (!parsedData.sender || !parsedData.sender.id || !parsedData.sender.type) {
          throw new Error('Auth message requires sender.id and sender.type');
        }
        
        // Log enhanced authentication attempt
        console.log(`Authentication attempt: ID=${parsedData.sender.id}, Type=${parsedData.sender.type}, ConnectionID=${connectionId}`);
        
        // Register the client
        this.registerClient(ws, parsedData.sender.id, parsedData.sender.type);
        return;
      }
      
      // Apply handlers based on message type
      switch (parsedData.type) {
        case 'ping':
          // Respond to keep-alive ping
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: Date.now(),
              connectionId: connectionId
            }));
          }
          break;
          
        case 'register':
          // Register a new client
          this.registerClient(ws, parsedData.sender.id, parsedData.sender.type);
          break;
          
        case 'sync_appointment':
          // Sync appointment data between patient and clinic
          this.syncAppointmentData(parsedData);
          break;
          
        case 'treatment_update':
          // Update treatment status/progress
          this.notifyTreatmentUpdate(parsedData);
          break;
          
        case 'message':
          // Handle direct messaging
          this.relayMessage(parsedData);
          break;
          
        case 'disconnect':
          // Handle client-initiated disconnects gracefully
          console.log(`Received graceful disconnect message from ${connectionId}`);
          
          // Find and remove the client from the clients map
          Array.from(this.clients.entries()).forEach(([id, client]) => {
            if (client.ws === ws) {
              console.log(`Removing client ${id} due to graceful disconnect request`);
              this.clients.delete(id);
            }
          });
          
          // Send confirmation to client before closing
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'disconnect_ack',
              connectionId: connectionId,
              timestamp: Date.now(),
              message: 'Disconnect request acknowledged'
            }));
            
            // Close the connection properly with normal close code
            ws.close(1000, 'Client requested disconnect');
          }
          break;
          
        default:
          console.log(`Unknown message type: ${parsedData.type} from connection ${connectionId}`);
          // Echo back unknown message types with warning
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'warning',
              originalType: parsedData.type,
              message: `Unrecognized message type: ${parsedData.type}`,
              timestamp: Date.now(),
              connectionId: connectionId
            }));
          }
      }
    } catch (error) {
      console.error(`Error handling WebSocket message from ${connectionId}:`, error);
      console.error('Problem message content:', message.substring(0, 200) + (message.length > 200 ? '...' : ''));
      
      // Send detailed error response for easier debugging
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format: ' + (error instanceof Error ? error.message : 'Unknown error'),
          timestamp: Date.now(),
          connectionId: connectionId,
          originalMessage: parsedData ? { type: parsedData.type } : null
        }));
      }
    }
  }
  
  private registerClient(ws: WebSocket, id: string, type: 'patient' | 'clinic' | 'admin') {
    try {
      // Remove any existing client with this ID to avoid duplicates
      if (this.clients.has(id)) {
        const existingClient = this.clients.get(id);
        
        if (existingClient && existingClient.ws !== ws && 
            existingClient.ws.readyState === WebSocket.OPEN) {
          try {
            console.log(`Closing existing connection for user ${id} before creating new one`);
            existingClient.ws.close(1000, "User connected from another device/tab");
          } catch (error) {
            console.error(`Error closing existing connection for user ${id}:`, error);
          }
        }
      }
      
      // Create the new client entry
      const newClient: Client = { ws, id, type };
      this.clients.set(id, newClient);
      
      console.log(`New ${type} client registered with ID: ${id}`);
      
      // Notify client of successful registration with error handling
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'registered',
          message: `Registered as ${type} with ID: ${id}`,
        }));
      } else {
        console.error(`Cannot send registration confirmation to client ${id} - connection not open (state: ${ws.readyState})`);
        // Remove the client if the connection is not open
        if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
          this.clients.delete(id);
        }
      }
    } catch (error) {
      console.error(`Error registering client ${id}:`, error);
    }
  }
  
  private syncAppointmentData(data: Message) {
    // Handle appointment synchronization
    // Depending on sender type, update relevant clients
    if (data.sender.type === 'clinic') {
      this.notifyPatient(data);
    } else if (data.sender.type === 'patient') {
      this.notifyClinic(data);
    }
    
    // Log the sync action
    console.log(`Appointment sync from ${data.sender.type} ${data.sender.id}`);
  }
  
  private notifyTreatmentUpdate(data: Message) {
    // Mostly one-way: clinic updates patient on treatment progress
    if (data.sender.type === 'clinic' && data.target) {
      const targetClient = this.clients.get(data.target);
      
      if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
        targetClient.ws.send(JSON.stringify({
          type: 'treatment_update',
          payload: data.payload,
          sender: data.sender,
        }));
        
        console.log(`Treatment update sent to patient ${data.target}`);
      }
    }
  }
  
  private relayMessage(data: Message) {
    if (data.target) {
      const targetClient = this.clients.get(data.target);
      
      if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
        targetClient.ws.send(JSON.stringify({
          type: 'message',
          payload: data.payload,
          sender: {
            id: data.sender.id,
            type: data.sender.type
          }
        }));
        
        console.log(`Message relayed from ${data.sender.type} ${data.sender.id} to ${targetClient.type} ${targetClient.id}`);
      } else {
        // Store message for offline delivery if needed
        console.log(`Target client ${data.target} not found or not connected`);
      }
    }
  }
  
  private notifyPatient(data: Message) {
    // Find patient client based on target or data
    const patientId = data.target || (data.payload?.patientId);
    
    if (patientId) {
      const patientClient = this.clients.get(patientId);
      
      if (patientClient && patientClient.ws.readyState === WebSocket.OPEN) {
        patientClient.ws.send(JSON.stringify({
          type: data.type,
          payload: data.payload,
          sender: data.sender,
        }));
        
        console.log(`Notification sent to patient ${patientId}`);
      }
    }
  }
  
  private notifyClinic(data: Message) {
    // Find clinic client based on target or data
    const clinicId = data.target || (data.payload?.clinicId);
    
    if (clinicId) {
      const clinicClient = this.clients.get(clinicId);
      
      if (clinicClient && clinicClient.ws.readyState === WebSocket.OPEN) {
        clinicClient.ws.send(JSON.stringify({
          type: data.type,
          payload: data.payload,
          sender: data.sender,
        }));
        
        console.log(`Notification sent to clinic ${clinicId}`);
      }
    }
  }
  
  // Broadcast to all clients of a specific type with enhanced error handling
  public broadcast(message: any, targetType?: 'patient' | 'clinic' | 'admin') {
    try {
      // Early validation of the message format
      const payload = JSON.stringify(message);
      let clientCount = 0;
      let errorCount = 0;
      
      // Create array from clients map to avoid iterator issues
      const clientArray = Array.from(this.clients.entries());
      
      for (const [id, client] of clientArray) {
        try {
          // Only send to open connections and matching client types
          if (
            client.ws.readyState === WebSocket.OPEN && 
            (!targetType || client.type === targetType)
          ) {
            client.ws.send(payload);
            clientCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`Error broadcasting to client ${id} (${client.type}):`, error);
          
          // Try to close the broken connection
          try {
            if (client.ws.readyState !== WebSocket.CLOSED) {
              client.ws.close(1011, "Internal server error");
            }
            // Remove the client from the pool
            this.clients.delete(id);
          } catch (cleanupError) {
            console.error(`Error cleaning up broken client connection ${id}:`, cleanupError);
          }
        }
      }
      
      if (errorCount > 0) {
        console.warn(`⚠️ Broadcast encountered ${errorCount} errors out of ${clientArray.length} total clients`);
      }
      
      console.log(`✅ Broadcast message (type: ${message.type || 'unknown'}) sent to ${clientCount} clients of type ${targetType || 'any'}`);
    } catch (error) {
      console.error(`❌ Fatal error in broadcast operation:`, error);
    }
  }
  
  // Broadcast special offer image updates to all connected clients
  public broadcastSpecialOfferImageRefresh(offerId: string, imageUrl: string) {
    console.log(`📢 Broadcasting special offer image refresh for offer ${offerId}`);
    
    try {
      const message = {
        type: 'special_offer_image_refreshed',
        offerId,
        imageUrl,
        timestamp: Date.now(),
      };
      
      // Use the enhanced broadcast method to handle errors properly
      this.broadcast(message);
      return this.getClientCount();
    } catch (error) {
      console.error(`❌ Error broadcasting special offer image refresh:`, error);
      return 0;
    }
  }
}

// Singleton instance of WebSocketService
let webSocketServiceInstance: WebSocketService | null = null;

export const setupWebSocketService = (server: Server): WebSocketService => {
  webSocketServiceInstance = new WebSocketService(server);
  return webSocketServiceInstance;
};

export const getWebSocketService = (): WebSocketService | null => {
  return webSocketServiceInstance;
};