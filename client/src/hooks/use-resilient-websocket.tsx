import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp?: number;
  connectionId?: string;
  sender?: {
    id: number;
    type: 'patient' | 'clinic' | 'admin';
  };
  target?: string;
  message?: string;
}

interface WebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  reconnectLimit?: number;
  reconnectInterval?: number;
  reconnectBackoff?: boolean;
  autoReconnect?: boolean;
}

interface WebSocketResult {
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  connectionId: string | undefined;
  lastError: string | undefined;
  reconnectAttempt: number;
  disconnect: () => void;
  connect: () => void;
}

/**
 * A custom hook for reliable WebSocket connections with automatic reconnection
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Message queuing when disconnected
 * - Connection status tracking
 * - Error handling
 */
export const useResilientWebSocket = (
  userId: number | undefined,
  options?: WebSocketOptions
): WebSocketResult => {
  const { toast } = useToast();
  
  // State for connection status and tracking
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | undefined>(undefined);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [lastError, setLastError] = useState<string | undefined>(undefined);
  
  // Refs for socket and related state
  const socketRef = useRef<WebSocket | undefined>(undefined);
  const messageQueueRef = useRef<WebSocketMessage[]>([]);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const manualDisconnectRef = useRef<boolean>(false);
  
  // Determine configuration
  const reconnectLimit = options?.reconnectLimit ?? 10;
  const reconnectInterval = options?.reconnectInterval ?? 1000;
  const reconnectBackoff = options?.reconnectBackoff ?? true;
  const autoReconnect = options?.autoReconnect ?? true;
  const onMessageCallback = options?.onMessage;
  const onOpenCallback = options?.onOpen;
  const onCloseCallback = options?.onClose;
  const onErrorCallback = options?.onError;
  
  // Connect method
  const connect = useCallback(() => {
    // Skip if manually disconnected
    if (manualDisconnectRef.current) {
      console.log("Skipping WebSocket connection - manual disconnect flag is set");
      return;
    }
    
    if (!userId) {
      console.log("No user ID provided, skipping connection");
      return;
    }
    
    // Generate a unique connection ID
    const uniqueId = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    setConnectionId(uniqueId);
    
    try {
      // Determine protocol based on current URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      
      // Create WebSocket URL with connection tracking parameters
      const wsUrl = `${protocol}//${host}/ws?connectionId=${uniqueId}&userId=${userId}&isClinic=true`;
      
      console.log(`Connecting to WebSocket at ${wsUrl} (attempt ${reconnectAttempt + 1}/${reconnectLimit})`);
      
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
        
        // Call provided callback
        if (onOpenCallback) {
          onOpenCallback();
        }
      };
      
      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log(`WebSocket ${uniqueId} received message:`, message);
          
          // Call provided callback
          if (onMessageCallback) {
            onMessageCallback(message);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      socketRef.current.onclose = (event) => {
        setIsConnected(false);
        console.log(`WebSocket ${uniqueId} closed:`, event);
        
        // Call provided callback
        if (onCloseCallback) {
          onCloseCallback(event);
        }
        
        // Don't attempt to reconnect if manually disconnected
        if (manualDisconnectRef.current || !autoReconnect) {
          console.log(`WebSocket ${uniqueId} was manually disconnected, won't reconnect`);
          return;
        }
        
        // Handle abnormal closure (network issues)
        if (event.code === 1006) {
          console.warn(`⚠️ WebSocket abnormal closure (1006) detected for connection ${uniqueId}`);
          setLastError("Network connectivity issue detected");
          
          // Calculate reconnect delay with optional exponential backoff
          let reconnectDelay = reconnectInterval;
          if (reconnectBackoff) {
            reconnectDelay = Math.min(reconnectInterval * Math.pow(1.5, reconnectAttempt), 10000);
          }
          
          // Try to reconnect
          if (reconnectAttempt < reconnectLimit) {
            reconnectTimeoutRef.current = window.setTimeout(() => {
              setReconnectAttempt(prev => prev + 1);
              connect();
            }, reconnectDelay);
          } else {
            setLastError(`Connection failed after ${reconnectLimit} attempts`);
          }
        }
      };
      
      socketRef.current.onerror = (error) => {
        console.error(`WebSocket ${uniqueId} error:`, error);
        setLastError("WebSocket connection error");
        
        // Call provided callback
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      };
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setLastError("Failed to establish connection");
    }
  }, [
    userId, 
    reconnectAttempt, 
    reconnectLimit, 
    reconnectInterval,
    reconnectBackoff,
    autoReconnect,
    onMessageCallback,
    onOpenCallback,
    onCloseCallback,
    onErrorCallback
  ]);
  
  // Method to send messages
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      // Add connection tracking metadata
      const enhancedMessage = {
        ...message,
        timestamp: Date.now(),
        connectionId,
        sender: {
          id: userId || 0,
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
  }, [connectionId, userId, connect]);
  
  // Method to manually disconnect
  const disconnect = useCallback(() => {
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
  }, [connectionId]);
  
  // Connect when component mounts and user ID changes
  useEffect(() => {
    if (userId) {
      // Reset manual disconnect flag
      manualDisconnectRef.current = false;
      connect();
    }
    
    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);
  
  return {
    isConnected,
    connectionId,
    reconnectAttempt,
    sendMessage,
    lastError,
    disconnect,
    connect
  };
};

export default useResilientWebSocket;