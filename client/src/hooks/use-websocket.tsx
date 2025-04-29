import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

// Define WebSocket message types
export interface WebSocketMessage {
  type: string;
  payload: any;
  sender?: {
    id: string;
    type: 'patient' | 'clinic' | 'admin';
  };
  target?: string;
  message?: string;
}

type MessageHandler = (message: WebSocketMessage) => void;

interface WebSocketHookResult {
  connected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: WebSocketMessage) => void;
  registerMessageHandler: (type: string, handler: MessageHandler) => void;
  unregisterMessageHandler: (type: string) => void;
}

// Custom hook for managing WebSocket connection
export const useWebSocket = (): WebSocketHookResult => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageHandlersRef = useRef<Record<string, MessageHandler>>({});
  
  // Function to initialize WebSocket connection
  const initializeSocket = useCallback(() => {
    if (!user) {
      // No WebSocket connection if not authenticated
      console.log('No WebSocket connection - user not authenticated');
      return;
    }
    
    try {
      // Close existing socket if any
      if (socketRef.current) {
        console.log('Closing existing WebSocket connection');
        socketRef.current.close();
        socketRef.current = null;
      }
      
      // Don't attempt to reconnect if user is not logged in
      if (!user.id) {
        console.log('User ID missing, not connecting WebSocket');
        return;
      }
      
      // Determine correct protocol based on HTTPS/HTTP
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log('Initializing WebSocket connection to:', wsUrl);
      
      // Create new WebSocket connection with error handling
      let socketInitialized = false;
      try {
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;
        socketInitialized = true;
        
        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          if (socket.readyState !== WebSocket.OPEN) {
            console.log('WebSocket connection timeout');
            socket.close();
          }
        }, 10000); // 10-second connection timeout
        
        socket.addEventListener('open', () => {
          console.log('WebSocket connection established successfully');
          clearTimeout(connectionTimeout);
          setConnected(true);
          
          // Register client with the server - with retry
          try {
            socket.send(JSON.stringify({
              type: 'register',
              sender: {
                id: user.id.toString(),
                type: user.role === 'clinic_staff' ? 'clinic' : user.role
              }
            }));
            console.log('Sent registration message to WebSocket server');
          } catch (sendError) {
            console.error('Failed to send registration message:', sendError);
          }
        });
      } catch (socketError) {
        console.error('Failed to create WebSocket instance:', socketError);
        socketInitialized = false;
      }
      
      if (!socketInitialized || !socketRef.current) {
        console.log('Socket not initialized properly, will retry later');
        reconnectTimeoutRef.current = setTimeout(() => {
          initializeSocket();
        }, 5000);
        return;
      }
      
      socketRef.current.addEventListener('message', (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Log all incoming messages for debugging
          console.log('WebSocket message received:', message.type);
          
          // Handle connection confirmation
          if (message.type === 'connection' || message.type === 'registered') {
            console.log('WebSocket registration confirmed:', message.message);
            return;
          }
          
          // Handle error messages
          if (message.type === 'error') {
            console.error('WebSocket server error:', message.message);
            // Only show toast for major errors, not connection retries
            if (message.message !== 'Reconnecting' && message.message !== 'Retrying connection') {
              toast({
                title: 'Server Message',
                description: message.message || 'Unknown error occurred',
                variant: 'destructive'
              });
            }
            return;
          }
          
          // Dispatch message to the appropriate handler
          const handler = messageHandlersRef.current[message.type];
          if (handler) {
            handler(message);
          } else {
            console.log('No handler registered for message type:', message.type);
          }
          
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
      
      socketRef.current.addEventListener('close', (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setConnected(false);
        
        // Only attempt to reconnect if we have a user and it wasn't a clean close
        if (user) {
          const delay = event.wasClean ? 10000 : 3000; // longer delay for clean closes
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          console.log(`Will attempt to reconnect WebSocket in ${delay/1000} seconds`);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket now...');
            initializeSocket();
          }, delay);
        }
      });
      
      socketRef.current.addEventListener('error', (error) => {
        console.error('WebSocket connection error:', error);
        // Don't show toast for every error to avoid spamming the user
        // Only use console logs for debugging
      });
      
    } catch (error) {
      console.error('Error in WebSocket initialization:', error);
      
      // Schedule retry
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Retrying WebSocket initialization after error...');
        initializeSocket();
      }, 8000); // 8-second retry delay after errors
    }
  }, [user, toast]);
  
  // Initialize WebSocket on login
  useEffect(() => {
    if (user) {
      initializeSocket();
    } else {
      // Close socket on logout
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnected(false);
    }
    
    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user, initializeSocket]);
  
  // Function to send message through WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket not connected');
      toast({
        title: 'Connection Error',
        description: 'Not connected to server. Please try again later.',
        variant: 'destructive'
      });
      return;
    }
    
    // Ensure sender information is included
    if (!message.sender && user) {
      message.sender = {
        id: user.id.toString(),
        type: user.role as 'patient' | 'clinic' | 'admin'
      };
    }
    
    socketRef.current.send(JSON.stringify(message));
  }, [user, toast]);
  
  // Register a message handler for a specific message type
  const registerMessageHandler = useCallback((type: string, handler: MessageHandler) => {
    messageHandlersRef.current[type] = handler;
  }, []);
  
  // Unregister a message handler
  const unregisterMessageHandler = useCallback((type: string) => {
    delete messageHandlersRef.current[type];
  }, []);
  
  return {
    connected,
    lastMessage,
    sendMessage,
    registerMessageHandler,
    unregisterMessageHandler
  };
};