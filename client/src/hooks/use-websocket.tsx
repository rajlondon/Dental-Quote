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
      return;
    }
    
    try {
      // Close existing socket if any
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      
      // Determine correct protocol based on HTTPS/HTTP
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      // Create new WebSocket connection
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
        setConnected(true);
        
        // Register client with the server
        socket.send(JSON.stringify({
          type: 'register',
          sender: {
            id: user.id.toString(),
            type: user.role
          }
        }));
      });
      
      socket.addEventListener('message', (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle connection confirmation
          if (message.type === 'connection' || message.type === 'registered') {
            console.log('WebSocket registration confirmed:', message.message);
            return;
          }
          
          // Handle error messages
          if (message.type === 'error') {
            console.error('WebSocket error:', message.message);
            toast({
              title: 'Connection Error',
              description: message.message || 'Unknown error occurred',
              variant: 'destructive'
            });
            return;
          }
          
          // Dispatch message to the appropriate handler
          const handler = messageHandlersRef.current[message.type];
          if (handler) {
            handler(message);
          }
          
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
      
      socket.addEventListener('close', (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setConnected(false);
        
        // Attempt to reconnect after delay
        if (user && !event.wasClean) {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            initializeSocket();
          }, 5000); // 5-second reconnect delay
        }
      });
      
      socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to the server. Retrying...',
          variant: 'destructive'
        });
      });
      
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }, [user, toast]);
  
  // Initialize WebSocket on login
  useEffect(() => {
    if (user) {
      initializeSocket();
      
      // Setup manual close event listener (for logout scenarios)
      const handleManualClose = () => {
        console.log("Manual WebSocket close triggered");
        if (socketRef.current) {
          // Prevent automatic reconnect by marking this as "clean"
          const closeEvent = new CloseEvent('close', { wasClean: true });
          socketRef.current.dispatchEvent(closeEvent);
          
          // Properly close the connection
          socketRef.current.close();
          socketRef.current = null;
        }
        setConnected(false);
      };
      
      document.addEventListener('manual-websocket-close', handleManualClose);
      
      return () => {
        document.removeEventListener('manual-websocket-close', handleManualClose);
      };
    } else {
      // Close socket on logout
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setConnected(false);
    }
  }, [user, initializeSocket]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);
  
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