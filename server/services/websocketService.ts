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
      console.log('WebSocket message received:', data.type);
      
      switch (data.type) {
        case 'register':
          // Register a new client - validate and map role if needed
          let clientType = data.sender.type;
          
          // Map 'clinic_staff' role to 'clinic' for WebSocket consistency
          if (clientType === 'clinic_staff') {
            clientType = 'clinic' as const;
            console.log('Mapped clinic_staff role to clinic for WebSocket');
          }
          
          this.registerClient(ws, data.sender.id, clientType as 'patient' | 'clinic' | 'admin');
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
      try {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        }));
      } catch (sendError) {
        console.error('Error sending error message:', sendError);
      }
    }
  }
  
  private registerClient(ws: WebSocket, id: string, type: 'patient' | 'clinic' | 'admin') {
    // Check if this client is already registered with a different connection
    const existingClient = this.clients.get(id);
    if (existingClient) {
      console.log(`Client ${id} is already connected, closing old connection`);
      try {
        existingClient.ws.close();
      } catch (error) {
        console.error('Error closing existing connection:', error);
      }
    }
    
    const newClient: Client = { ws, id, type };
    this.clients.set(id, newClient);
    console.log(`Client registered successfully: ${id} (${type})`);
    
    // Confirm registration to client
    try {
      ws.send(JSON.stringify({
        type: 'registered',
        message: `Successfully registered as ${type} with ID ${id}`,
      }));
      console.log(`Registration confirmation sent to ${type} client ${id}`);
    } catch (error) {
      console.error('Error sending registration confirmation:', error);
    }
    
    console.log(`New ${type} client registered with ID: ${id}`);
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

export const setupWebSocketService = (server: Server): WebSocketService => {
  return new WebSocketService(server);
};