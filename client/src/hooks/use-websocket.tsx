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
        
        // Check if this was a manual close (triggered during logout)
        const wasManualClose = (socket as any)._manualClose === true;
        
        if (wasManualClose) {
          console.log('WebSocket closed manually - skip reconnect');
          socketRef.current = null;
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
          return;
        }
        
        // Attempt to reconnect after delay (if user is still logged in and socket wasn't manually closed)
        if (user && !event.wasClean) {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            if (socketRef.current === null) {
              // Only reconnect if we haven't already created a new socket
              initializeSocket();
            }
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
  
  // State to track if initial connection has been made
  const initialConnectionMadeRef = useRef(false);
  const lastLoginTimestampRef = useRef(0);
  
  // Track how often we're initializing to avoid repeated reconnects
  const connectionAttemptCountRef = useRef(0);
  
  // Initialize WebSocket on login
  useEffect(() => {
    // If user just logged in (check session flag)
    const justLoggedIn = sessionStorage.getItem('just_logged_in') === 'true';
    const loginTimestamp = parseInt(sessionStorage.getItem('login_timestamp') || '0', 10);
    
    // Check if this is a new login session
    const isNewLoginSession = justLoggedIn && loginTimestamp > lastLoginTimestampRef.current;
    
    if (isNewLoginSession) {
      console.log("New login session detected, updating timestamp", loginTimestamp);
      lastLoginTimestampRef.current = loginTimestamp;
      initialConnectionMadeRef.current = false;
      connectionAttemptCountRef.current = 0;
      
      // Clear the logged in flag (only want to detect it once)
      sessionStorage.removeItem('just_logged_in');
    }
    
    if (user) {
      // Only initialize if not already connected and we haven't tried too many times
      if (!initialConnectionMadeRef.current && connectionAttemptCountRef.current < 2) {
        console.log(`WebSocket initialization attempt #${connectionAttemptCountRef.current + 1}`);
        connectionAttemptCountRef.current++;
        
        // Add a slight delay before connecting to avoid race conditions
        const timeoutId = setTimeout(() => {
          console.log("Initializing WebSocket connection for user:", user.id);
          initializeSocket();
          initialConnectionMadeRef.current = true;
        }, 300);
        
        return () => clearTimeout(timeoutId);
      }
      
      // Setup manual close event listener (for logout scenarios)
      const handleManualClose = () => {
        console.log("Manual WebSocket close triggered");
        if (socketRef.current) {
          try {
            // Just close the socket directly - the close event handler will handle cleanup
            console.log(`Closing WebSocket connection with readyState: ${socketRef.current.readyState}`);
            
            // Set a flag to prevent automatic reconnection
            (socketRef.current as any)._manualClose = true;
            
            // Only close if not already closing/closed
            if (socketRef.current.readyState === WebSocket.OPEN ||
                socketRef.current.readyState === WebSocket.CONNECTING) {
              socketRef.current.close(1000, "Manual close during logout");
            }
          } catch (e) {
            console.error("Error during manual WebSocket close:", e);
          } finally {
            // Always null out the reference and update state
            socketRef.current = null;
            setConnected(false);
          }
        }
      };
      
      document.addEventListener('manual-websocket-close', handleManualClose);
      
      return () => {
        document.removeEventListener('manual-websocket-close', handleManualClose);
      };
    } else {
      // Reset connection state when user logs out
      initialConnectionMadeRef.current = false;
      connectionAttemptCountRef.current = 0;
      
      // Close socket on logout
      if (socketRef.current) {
        (socketRef.current as any)._manualClose = true;
        socketRef.current.close(1000, "User logged out");
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