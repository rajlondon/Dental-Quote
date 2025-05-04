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
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();
  
  constructor(server: Server) {
    // Initialize WebSocket server on a specific path to avoid conflict with Vite HMR
    this.wss = new WebSocketServer({ server, path: '/ws' });
    
    this.setupEventHandlers();
    
    console.log('WebSocket service initialized');
  }
  
  private setupEventHandlers() {
    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (message: string) => this.handleMessage(ws, message));
      
      ws.on('close', () => {
        // Remove client on disconnect
        for (const [id, client] of this.clients.entries()) {
          if (client.ws === ws) {
            this.clients.delete(id);
            console.log(`Client ${id} disconnected`);
            break;
          }
        }
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
    
    this.clients.forEach((client) => {
      if (
        client.ws.readyState === WebSocket.OPEN && 
        (!targetType || client.type === targetType)
      ) {
        client.ws.send(payload);
      }
    });
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