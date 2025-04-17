import { useState, useEffect, useCallback, useRef } from 'react';

type MessageType = 'register' | 'sync_appointment' | 'treatment_update' | 'message';

interface SyncMessage {
  type: MessageType;
  payload: any;
  sender?: {
    id: string;
    type: 'patient' | 'clinic' | 'admin';
  };
  target?: string;
}

interface UseSyncOptions {
  userId: string;
  userType: 'patient' | 'clinic' | 'admin';
  onMessage?: (message: SyncMessage) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

/**
 * Hook for managing WebSocket data synchronization between patient and clinic portals
 */
export const useDataSync = ({
  userId,
  userType,
  onMessage,
  autoReconnect = true,
  reconnectInterval = 5000,
}: UseSyncOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [wsEndpoint, setWsEndpoint] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch WebSocket configuration
  useEffect(() => {
    fetch('/api/ws-status')
      .then(res => res.json())
      .then(data => {
        if (data.enabled) {
          // Determine the full WebSocket URL
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = `${protocol}//${window.location.host}${data.endpoint}`;
          setWsEndpoint(wsUrl);
        }
      })
      .catch(err => {
        console.error('Failed to get WebSocket configuration:', err);
        setLastError(err);
      });
  }, []);
  
  // Cleanup function for WebSocket connection
  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!wsEndpoint || !userId) return;
    
    cleanup();
    
    try {
      const socket = new WebSocket(wsEndpoint);
      socketRef.current = socket;
      
      socket.onopen = () => {
        setIsConnected(true);
        setLastError(null);
        
        // Register with the server
        socket.send(JSON.stringify({
          type: 'register',
          sender: {
            id: userId,
            type: userType
          }
        }));
      };
      
      socket.onclose = () => {
        setIsConnected(false);
        
        // Reconnect logic
        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
      
      socket.onerror = (event) => {
        // Convert the Event to an Error object
        const error = new Error('WebSocket connection error');
        setLastError(error);
        console.error('WebSocket error:', event);
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle messages based on type
          if (message.type === 'connection' || message.type === 'registered') {
            console.log('WebSocket:', message.message);
          } else if (onMessage && typeof onMessage === 'function') {
            onMessage(message);
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (err) {
      // Ensure we're setting an Error object
      const error = err instanceof Error ? err : new Error(String(err));
      setLastError(error);
      console.error('Error establishing WebSocket connection:', err);
      
      // If failed to connect, try again after reconnectInterval
      if (autoReconnect) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      }
    }
  }, [wsEndpoint, userId, userType, onMessage, autoReconnect, reconnectInterval, cleanup]);
  
  // Connect to WebSocket when endpoint and userId are available
  useEffect(() => {
    if (wsEndpoint && userId) {
      connect();
    }
    
    return cleanup;
  }, [wsEndpoint, userId, connect, cleanup]);
  
  // Function to send a message through the WebSocket
  const sendMessage = useCallback((message: SyncMessage) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }
    
    try {
      // Add sender info if not already present
      const fullMessage = {
        ...message,
        sender: message.sender || {
          id: userId,
          type: userType
        }
      };
      
      socketRef.current.send(JSON.stringify(fullMessage));
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }, [userId, userType]);
  
  // Function to reconnect manually
  const reconnect = useCallback(() => {
    connect();
  }, [connect]);
  
  return {
    isConnected,
    lastError,
    sendMessage,
    reconnect
  };
};

export default useDataSync;