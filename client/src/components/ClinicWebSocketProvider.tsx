import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

// Define message structure
export interface WebSocketMessage {
  type: string;
  payload?: any;
  data?: any; // For backwards compatibility 
  timestamp?: number;
  connectionId?: string;
  sender?: {
    id: number;
    type: 'patient' | 'clinic' | 'admin';
  };
  target?: string;
  message?: string;
}

// Define context type
interface ClinicWebSocketContextType {
  isConnected: boolean;
  connectionId: string | undefined;
  reconnectAttempt: number;
  sendMessage: (message: WebSocketMessage) => void;
  lastError: string | undefined;
  usingFallback: boolean;
}

// Create context with default values
const ClinicWebSocketContext = createContext<ClinicWebSocketContextType>({
  isConnected: false,
  connectionId: undefined,
  reconnectAttempt: 0,
  sendMessage: () => {},
  lastError: undefined,
  usingFallback: false,
});

// Define provider props
interface ClinicWebSocketProviderProps {
  children: React.ReactNode;
  disableNotifications?: boolean;
}

export const ClinicWebSocketProvider: React.FC<ClinicWebSocketProviderProps> = ({ 
  children,
  disableNotifications = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | undefined>(undefined);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [lastError, setLastError] = useState<string | undefined>(undefined);
  const [usingFallback, setUsingFallback] = useState(false);
  
  // Create refs for WebSocket and related state
  const socketRef = useRef<WebSocket | undefined>(undefined);
  const messageQueueRef = useRef<WebSocketMessage[]>([]);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const manualDisconnectRef = useRef<boolean>(false);
  const clinicIdRef = useRef<number | null>(null);
  
  // Initialize with clinic ID if available
  useEffect(() => {
    if (user?.clinicId) {
      clinicIdRef.current = user.clinicId;
    } else if (user?.id && user?.role === 'clinic_staff') {
      // Fallback to user ID for clinic staff without explicit clinic ID
      clinicIdRef.current = user.id;
    }
  }, [user]);
  
  // Connect to WebSocket server with resilient logic
  const connect = () => {
    // Skip if manually disconnected
    if (manualDisconnectRef.current) {
      console.log("Skipping WebSocket connection - manual disconnect flag is set");
      return;
    }
    
    // Generate a unique connection ID
    const uniqueId = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    setConnectionId(uniqueId);
    
    try {
      // Determine protocol based on current URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      let userId = user?.id || clinicIdRef.current;
      
      // Create WebSocket URL with connection tracking parameters
      const wsUrl = `${protocol}//${host}/ws?connectionId=${uniqueId}${userId ? `&userId=${userId}` : ''}${clinicIdRef.current ? `&clinicId=${clinicIdRef.current}` : ''}&isClinic=true`;
      
      console.log(`Connecting to WebSocket at ${wsUrl} (attempt ${reconnectAttempt + 1}/10)`);
      console.log(`WebSocket ${uniqueId} connecting...`);
      
      // Create new WebSocket
      socketRef.current = new WebSocket(wsUrl);
      
      // Set up event handlers
      socketRef.current.onopen = () => {
        setIsConnected(true);
        setLastError(undefined);
        setReconnectAttempt(0);
        
        console.log(`WebSocket ${uniqueId} connected successfully!`);
        
        // Send queued messages
        if (messageQueueRef.current.length > 0) {
          console.log(`Sending ${messageQueueRef.current.length} queued messages`);
          messageQueueRef.current.forEach(msg => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify(msg));
            }
          });
          messageQueueRef.current = [];
        }
        
        // Track successful connection
        sessionStorage.setItem('clinic_websocket_connected', 'true');
        sessionStorage.setItem('last_successful_connection', Date.now().toString());
        
        // Show toast notification
        if (!disableNotifications) {
          toast({
            title: "Connected to Clinic Portal",
            description: "Real-time updates are now active",
            duration: 3000,
          });
        }
      };
      
      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log(`WebSocket ${uniqueId} received message:`, message);
          
          // Process specific message types
          if (message.type === 'notification' && !disableNotifications) {
            toast({
              title: message.payload?.title || 'New Notification',
              description: message.payload?.message || 'You have a new notification',
            });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      socketRef.current.onclose = (event) => {
        setIsConnected(false);
        console.log(`WebSocket ${uniqueId} closed:`, event);
        
        // Mark connection as closed in session storage
        sessionStorage.setItem('clinic_websocket_connected', 'false');
        
        // Don't attempt to reconnect if manually disconnected
        if (manualDisconnectRef.current) {
          console.log(`WebSocket ${uniqueId} was manually disconnected, won't reconnect`);
          return;
        }
        
        // Handle abnormal closure (network issues)
        if (event.code === 1006) {
          console.warn(`⚠️ WebSocket abnormal closure (1006) detected for connection ${uniqueId}. This typically indicates network issues or server restart.`);
          setUsingFallback(true);
          setLastError("Network connectivity issue detected");
          
          // Special handling for clinic portal to prevent user experience issues
          let reconnectDelay = Math.min(1000 * Math.pow(1.5, reconnectAttempt), 10000);
          
          // If more than 5 attempts, switch to fallback mode
          if (reconnectAttempt >= 5) {
            console.log("Multiple WebSocket failures detected, using long-polling fallback");
            setUsingFallback(true);
            
            // Show notification about fallback mode
            if (!disableNotifications) {
              toast({
                title: "Limited Connectivity",
                description: "Using alternative connection method",
                duration: 5000,
              });
            }
          }
          
          // Try to reconnect with exponential backoff
          if (reconnectAttempt < 10) {
            reconnectTimeoutRef.current = window.setTimeout(() => {
              setReconnectAttempt(prev => prev + 1);
              connect();
            }, reconnectDelay);
          } else {
            setLastError("Connection failed after multiple attempts");
          }
        }
      };
      
      socketRef.current.onerror = (error) => {
        console.error(`WebSocket ${uniqueId} error:`, error);
        setLastError("WebSocket connection error");
      };
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setLastError("Failed to establish connection");
      setUsingFallback(true);
    }
  };
  
  // Method to send messages
  const sendMessage = (message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      // Add connection tracking metadata
      const enhancedMessage = {
        ...message,
        timestamp: Date.now(),
        connectionId,
        sender: {
          id: user?.id || 0,
          type: 'clinic'
        }
      };
      
      socketRef.current.send(JSON.stringify(enhancedMessage));
    } else {
      // Queue the message for later
      messageQueueRef.current.push({
        ...message,
        timestamp: Date.now(),
        connectionId
      });
      
      console.log(`WebSocket not connected, queued message of type ${message.type}`);
      
      // If socket is not connected, try to connect
      if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
        connect();
      }
    }
  };
  
  // Method to manually disconnect
  const disconnect = () => {
    manualDisconnectRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      console.log(`Manually disconnecting WebSocket ${connectionId}`);
      socketRef.current.close();
      socketRef.current = undefined;
      setIsConnected(false);
    }
  };
  
  // Connect when component mounts and user is available
  useEffect(() => {
    // Reset manual disconnect flag
    manualDisconnectRef.current = false;
    
    if (user?.id) {
      connect();
    }
    
    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [user?.id]);
  
  // Memoized context value
  const contextValue: ClinicWebSocketContextType = {
    isConnected,
    connectionId,
    reconnectAttempt,
    sendMessage,
    lastError,
    usingFallback
  };
  
  return (
    <ClinicWebSocketContext.Provider value={contextValue}>
      {children}
    </ClinicWebSocketContext.Provider>
  );
};

// Custom hook to use the WebSocket context
export const useClinicWebSocket = () => {
  const context = useContext(ClinicWebSocketContext);
  
  if (!context) {
    throw new Error('useClinicWebSocket must be used within a ClinicWebSocketProvider');
  }
  
  return context;
};

export default ClinicWebSocketProvider;