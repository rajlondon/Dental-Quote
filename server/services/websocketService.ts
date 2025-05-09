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
    
    // Send ping every 30 seconds to prevent connections from timing out
    setInterval(() => {
      // Use Array.from to convert the Map entries to avoid MapIterator issues
      Array.from(this.clients.entries()).forEach(([clientId, client]) => {
        try {
          if (client.ws.readyState === WebSocket.OPEN) {
            // Use noop function for callback to handle potential errors
            client.ws.ping(() => {
              // Ping successful, client is responsive
              console.log(`Heartbeat ping successful for client ${clientId} (${client.type})`);
            });
          } else if (client.ws.readyState === WebSocket.CLOSED || client.ws.readyState === WebSocket.CLOSING) {
            // Remove dead connections to prevent memory leaks
            console.log(`Removing dead WebSocket connection for ${clientId} (${client.type})`);
            this.clients.delete(clientId);
          }
        } catch (error) {
          console.error(`Error during WebSocket heartbeat for client ${clientId}:`, error);
          // Clean up broken connections
          try {
            this.clients.delete(clientId);
          } catch (cleanupError) {
            console.error(`Error removing dead client ${clientId}:`, cleanupError);
          }
        }
      });
      
      // Log active connections count for monitoring
      console.log(`WebSocket heartbeat: ${this.getClientCount()} active connections`);
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
    if (!WebSocketService.instance) {
      console.error('WebSocketService not initialized yet');
      return;
    }
    
    const message = JSON.stringify(data);
    let clientCount = 0;
    
    // Use Array.from to convert Map values to array to avoid MapIterator issues
    Array.from(WebSocketService.instance.clients.values()).forEach(client => {
      try {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(message);
          clientCount++;
        }
      } catch (error) {
        console.error(`Error broadcasting to client ${client.id}:`, error);
      }
    });
    
    console.log(`Broadcast message sent to ${clientCount} clients:`, data.type);
  }
  
  private setupEventHandlers() {
    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (message: string) => this.handleMessage(ws, message));
      
      ws.on('close', () => {
        // Remove client on disconnect
        // Convert Map entries to Array to avoid downlevelIteration issues
        Array.from(this.clients.entries()).forEach(([id, client]) => {
          if (client.ws === ws) {
            this.clients.delete(id);
            console.log(`Client ${id} disconnected`);
          }
        });
      });
      
      // Send a welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to MyDentalFly synchronization service',
      }));
    });
  }
  
  private handleMessage(ws: WebSocket, message: string) {
    try {
      const data = JSON.parse(message) as Message;
      
      switch (data.type) {
        case 'register':
          // Register a new client
          this.registerClient(ws, data.sender.id, data.sender.type);
          break;
          
        case 'sync_appointment':
          // Sync appointment data between patient and clinic
          this.syncAppointmentData(data);
          break;
          
        case 'treatment_update':
          // Update treatment status/progress
          this.notifyTreatmentUpdate(data);
          break;
          
        case 'message':
          // Handle direct messaging
          this.relayMessage(data);
          break;
          
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
      }));
    }
  }
  
  private registerClient(ws: WebSocket, id: string, type: 'patient' | 'clinic' | 'admin') {
    const newClient: Client = { ws, id, type };
    this.clients.set(id, newClient);
    
    console.log(`New ${type} client registered with ID: ${id}`);
    
    // Notify client of successful registration
    ws.send(JSON.stringify({
      type: 'registered',
      message: `Registered as ${type} with ID: ${id}`,
    }));
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
  
  // Broadcast to all clients of a specific type
  public broadcast(message: any, targetType?: 'patient' | 'clinic' | 'admin') {
    const payload = JSON.stringify(message);
    let clientCount = 0;
    
    // Use Array.from to convert Map values to array to avoid MapIterator issues
    Array.from(this.clients.values()).forEach(client => {
      try {
        if (
          client.ws.readyState === WebSocket.OPEN && 
          (!targetType || client.type === targetType)
        ) {
          client.ws.send(payload);
          clientCount++;
        }
      } catch (error) {
        console.error(`Error broadcasting to client ${client.id}:`, error);
      }
    });
    
    console.log(`Broadcast message sent to ${clientCount} clients of type ${targetType || 'any'}`);
  }
  
  // Broadcast special offer image updates to all connected clients
  public broadcastSpecialOfferImageRefresh(offerId: string, imageUrl: string) {
    console.log(`📢 Broadcasting special offer image refresh for offer ${offerId}`);
    
    const message = {
      type: 'special_offer_image_refreshed',
      offerId,
      imageUrl,
      timestamp: Date.now(),
    };
    
    const payload = JSON.stringify(message);
    let clientCount = 0;
    
    // Use Array.from to convert Map values to array to avoid MapIterator issues
    Array.from(this.clients.values()).forEach(client => {
      try {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(payload);
          clientCount++;
        }
      } catch (error) {
        console.error(`Error sending image refresh to client ${client.id}:`, error);
      }
    });
    
    console.log(`📊 Sent image refresh notification to ${clientCount} connected clients`);
    return clientCount;
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