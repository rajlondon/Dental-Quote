import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Message structure for WebSocket communications
 */
export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface UseResilientWebSocketOptions {
  /**
   * Callback function called when a message is received
   */
  onMessage?: (message: WebSocketMessage) => void;
  
  /**
   * Callback function called when the WebSocket connection is opened
   */
  onOpen?: () => void;
  
  /**
   * Callback function called when the WebSocket connection is closed
   */
  onClose?: (event?: CloseEvent) => void;
  
  /**
   * Callback function called when an error occurs
   */
  onError?: (event?: Event) => void;
  
  /**
   * Time in milliseconds to wait before attempting to reconnect after a disconnect
   * @default 2000
   */
  reconnectInterval?: number;
  
  /**
   * Maximum number of reconnection attempts before giving up
   * @default 10
   */
  maxReconnectAttempts?: number;
  
  /**
   * User ID to associate with this connection
   * Used for authentication and server-side tracking
   */
  userId?: number;
  
  /**
   * Whether this connection is for a clinic user
   * Affects message routing on the server
   */
  isClinic?: boolean;
  
  /**
   * Disable automatic connection on hook mount
   * If true, you must manually call the returned connect function
   * @default false
   */
  disableAutoConnect?: boolean;
  
  /**
   * Enable debug mode with verbose logging
   * @default false
   */
  debug?: boolean;

  /**
   * Use resilient mode for environments with problematic WebSockets
   * This will fall back to long polling if WebSockets fail
   * @default true
   */
  useResilientMode?: boolean;
}

/**
 * Enhanced WebSocket hook with resilient fallback for problematic environments
 * Provides WebSocket-like functionality even in environments where WebSockets may be blocked
 * 
 * @param options Configuration options for the connection
 * @returns Object containing connection state and control methods
 */
export function useResilientWebSocket(options: UseResilientWebSocketOptions = {}) {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectInterval = 2000,
    maxReconnectAttempts = 10,
    userId,
    isClinic = false,
    disableAutoConnect = false,
    debug = false,
    useResilientMode = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { toast } = useToast();

  // Use a ref for the actual connection ID to ensure it persists across renders
  const connectionId = useRef<string | null>(null);
  
  // Track message queue for sending during reconnection
  const messageQueue = useRef<WebSocketMessage[]>([]);
  
  // Track manual disconnect state to prevent auto-reconnect
  const manualDisconnect = useRef<boolean>(false);
  
  // Track clinic mode for special handling
  const clinicMode = useRef<boolean>(isClinic);
  
  // Track WebSocket close reason for better diagnostics
  const lastCloseEvent = useRef<CloseEvent | null>(null);
  
  // Track last ping/pong times for heartbeat monitoring
  const lastPingTime = useRef<number>(0);
  const lastPongTime = useRef<number>(0);
  
  // Track reconnection timeout reference for cleanup
  const reconnectTimeoutId = useRef<NodeJS.Timeout | null>(null);

  // Track long-polling interval ID for cleanup
  const pollingIntervalId = useRef<NodeJS.Timeout | null>(null);
  
  // Track if we're using the fallback long-polling method
  const [usingFallback, setUsingFallback] = useState(false);
  
  // Track WebSocket failure counter
  const wsFailureCount = useRef<number>(0);
  
  /**
   * Generate a unique connection ID
   */
  const generateConnectionId = useCallback(() => {
    return `ws-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }, []);

  /**
   * Send a message via HTTP POST (fallback method)
   */
  const sendMessageViaHttp = useCallback(async (message: WebSocketMessage) => {
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...message,
          connectionId: connectionId.current,
          userId: userId,
          isClinic: isClinic,
          timestamp: Date.now(),
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to send message via HTTP:', response.status, response.statusText);
        // Queue the message for retry
        messageQueue.current.push(message);
      }
    } catch (error) {
      console.error('Error sending message via HTTP:', error);
      // Queue the message for retry
      messageQueue.current.push(message);
    }
  }, [connectionId, isClinic, userId]);
  
  /**
   * Send all queued messages via HTTP
   */
  const sendQueuedMessagesViaHttp = useCallback(async () => {
    const messages = [...messageQueue.current];
    messageQueue.current = [];
    
    for (const message of messages) {
      await sendMessageViaHttp(message);
    }
  }, [sendMessageViaHttp]);
  
  /**
   * Internal helper for sending messages
   * This is defined before it's used to avoid circular reference issues
   */
  const sendMessageInternal = (message: WebSocketMessage, socket: WebSocket | null) => {
    // Add connection ID if not present
    if (!message.connectionId && connectionId.current) {
      message.connectionId = connectionId.current;
    }
    
    // If using fallback mode, send via HTTP
    if (usingFallback) {
      sendMessageViaHttp(message);
      return;
    }
    
    // If socket is connected, send immediately
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      return;
    }
    
    // Otherwise queue the message for later
    if (debug) console.log(`WebSocket not connected, queueing message of type ${message.type}`);
    // Limit queue size to prevent memory issues
    if (messageQueue.current.length < 50) {
      messageQueue.current.push(message);
    } else {
      console.warn('Message queue full, dropping message:', message);
    }
  };

  /**
   * Establish a WebSocket connection
   */
  const connectWebSocket = useCallback(() => {
    // Skip if manually disconnected
    if (manualDisconnect.current) {
      if (debug) console.log('Skipping WebSocket connection - manual disconnect flag is set');
      return;
    }
    
    try {
      // Generate a new connection ID if we don't have one
      if (!connectionId.current) {
        connectionId.current = generateConnectionId();
      }
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws?connectionId=${connectionId.current}${userId ? `&userId=${userId}` : ''}${isClinic ? '&isClinic=true' : ''}`;
      
      if (debug) console.log(`Connecting to WebSocket at ${wsUrl} (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})`);
      
      const newSocket = new WebSocket(wsUrl);
      if (debug) console.log(`WebSocket ${connectionId.current} connecting...`);
      
      newSocket.onopen = () => {
        setSocket(newSocket);
        setIsConnected(true);
        setReconnectAttempt(0);
        wsFailureCount.current = 0; // Reset failure counter on successful connection
        
        // Send any queued messages
        if (messageQueue.current.length > 0) {
          console.log(`Sending ${messageQueue.current.length} queued messages`);
          messageQueue.current.forEach(msg => {
            newSocket.send(JSON.stringify(msg));
          });
          messageQueue.current = [];
        }
        
        // Call user's onOpen callback if provided
        if (onOpen) onOpen();
      };
      
      newSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Update heartbeat timing for ping messages
          if (message.type === 'ping') {
            lastPingTime.current = Date.now();
            if (debug) console.log(`Received ping from server at ${new Date().toISOString()}`);
            
            // Respond to ping with pong
            sendMessageInternal({
              type: 'pong',
              timestamp: Date.now(),
              connectionId: connectionId.current
            }, newSocket);
          } else if (message.type === 'pong') {
            lastPongTime.current = Date.now();
            if (debug) console.log(`Received pong from server at ${new Date().toISOString()}`);
          }
          
          // Forward message to user's callback
          if (onMessage) onMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      newSocket.onclose = (event) => {
        setSocket(null);
        setIsConnected(false);
        lastCloseEvent.current = event;
        
        // Call user's onClose callback if provided
        if (onClose) onClose(event);
        
        // Handle reconnection for abnormal closures
        const isAbnormalClosure = event.code === 1006;
        
        if (isAbnormalClosure) {
          wsFailureCount.current += 1;
          
          console.warn(`⚠️ WebSocket abnormal closure (1006) detected for connection ${connectionId.current}. This typically indicates network issues or server restart.`);
          
          // If we've had too many WebSocket failures, switch to fallback mode
          if (wsFailureCount.current >= 3 && useResilientMode) {
            console.log(`Switching to fallback long-polling after ${wsFailureCount.current} WebSocket failures`);
            setUsingFallback(true);
            startLongPolling();
            return;
          }
        }
        
        // Only attempt to reconnect if we haven't exceeded the maximum attempts
        // and the socket hasn't been explicitly closed by the user
        if (reconnectAttempt < maxReconnectAttempts && !manualDisconnect.current) {
          console.log(`Attempting to reconnect WebSocket (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})...`);
          
          // Generate a fresh connection ID for the next attempt
          connectionId.current = generateConnectionId();
          
          // Exponential backoff for reconnection attempts
          const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempt), 10000);
          
          // Schedule reconnection attempt
          reconnectTimeoutId.current = setTimeout(() => {
            setReconnectAttempt((prev) => prev + 1);
            connectWebSocket();
          }, delay);
        } else if (reconnectAttempt >= maxReconnectAttempts) {
          // Switch to fallback mode if we've exceeded max reconnect attempts
          if (useResilientMode) {
            console.log(`Switching to fallback long-polling after ${reconnectAttempt} failed reconnection attempts`);
            setUsingFallback(true);
            startLongPolling();
          } else {
            toast({
              title: "Connection Error",
              description: "Failed to establish WebSocket connection after multiple attempts.",
              variant: "destructive",
            });
          }
        }
      };
      
      newSocket.onerror = (error) => {
        console.error(`WebSocket error:`, error);
        
        // Call user's onError callback if provided
        if (onError) onError(error);
      };
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
      
      // Fall back to long polling if WebSocket creation failed and resilient mode is enabled
      if (useResilientMode) {
        console.log('Falling back to long-polling due to WebSocket initialization error');
        setUsingFallback(true);
        startLongPolling();
      }
    }
  }, [
    debug,
    generateConnectionId,
    isClinic,
    maxReconnectAttempts,
    onClose,
    onError,
    onMessage,
    onOpen,
    reconnectAttempt,
    toast,
    userId,
    useResilientMode,
  ]);
  
  /**
   * Start long-polling as fallback for WebSockets
   * This provides a similar experience but uses regular HTTP requests
   */
  const startLongPolling = useCallback(() => {
    // Clear any existing interval
    if (pollingIntervalId.current) {
      clearInterval(pollingIntervalId.current);
    }
    
    // Generate a connection ID if we don't have one
    if (!connectionId.current) {
      connectionId.current = generateConnectionId();
    }
    
    // Notify that we're connected via fallback
    setIsConnected(true);
    if (onOpen) onOpen();
    
    console.log(`Starting long-polling fallback with ID ${connectionId.current}`);
    
    // Immediately send any queued messages
    if (messageQueue.current.length > 0) {
      sendQueuedMessagesViaHttp();
    }
    
    // Set up polling interval (every 3 seconds)
    pollingIntervalId.current = setInterval(async () => {
      try {
        // Poll for messages
        const response = await fetch(`/api/messages/poll?connectionId=${connectionId.current}&userId=${userId || 'anonymous'}&isClinic=${isClinic ? 'true' : 'false'}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Process each message
          if (data.messages && Array.isArray(data.messages)) {
            data.messages.forEach((message: WebSocketMessage) => {
              if (onMessage) onMessage(message);
            });
          }
          
          // Send ping every few intervals
          if (Math.random() < 0.3) { // ~30% chance each poll
            sendMessageViaHttp({
              type: 'ping',
              timestamp: Date.now(),
              connectionId: connectionId.current
            });
          }
        } else {
          console.warn('Long-polling request failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error in long-polling:', error);
      }
    }, 3000);
    
  }, [connectionId, generateConnectionId, isClinic, onMessage, onOpen, sendQueuedMessagesViaHttp, sendMessageViaHttp, userId]);
  
  /**
   * Send a message to the server
   * This will use WebSocket if connected, otherwise queue for later or use HTTP fallback
   */
  const sendMessage = useCallback((message: WebSocketMessage) => {
    sendMessageInternal(message, socket);
  }, [socket]);
  
  /**
   * Gracefully disconnect from the server
   */
  const disconnect = useCallback(() => {
    manualDisconnect.current = true;
    
    // Clear any reconnection timeouts
    if (reconnectTimeoutId.current) {
      clearTimeout(reconnectTimeoutId.current);
      reconnectTimeoutId.current = null;
    }
    
    // Clear any polling intervals
    if (pollingIntervalId.current) {
      clearInterval(pollingIntervalId.current);
      pollingIntervalId.current = null;
    }
    
    if (usingFallback) {
      // Send disconnect message via HTTP
      sendMessageViaHttp({
        type: 'disconnect',
        reason: 'Manual disconnect',
        timestamp: Date.now(),
        connectionId: connectionId.current
      });
      
      setIsConnected(false);
      setUsingFallback(false);
      
      if (onClose) onClose();
    } else if (socket && socket.readyState === WebSocket.OPEN) {
      // Send a disconnect message before closing
      console.log(`Manually disconnecting WebSocket ${connectionId.current}`);
      
      try {
        socket.send(JSON.stringify({
          type: 'disconnect',
          reason: 'Manual disconnect',
          timestamp: Date.now(),
          connectionId: connectionId.current
        }));
      } catch (error) {
        console.error('Error sending disconnect message:', error);
      }
      
      // Close the socket after a short delay to allow the message to be sent
      setTimeout(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close(1000, 'Manual disconnect');
        }
        setSocket(null);
        setIsConnected(false);
      }, 100);
    } else {
      setSocket(null);
      setIsConnected(false);
    }
  }, [onClose, sendMessageViaHttp, socket, usingFallback]);
  
  /**
   * Connect or reconnect to the server
   */
  const connect = useCallback(() => {
    manualDisconnect.current = false;
    
    if (usingFallback) {
      // Clear fallback state and restart with WebSockets
      if (pollingIntervalId.current) {
        clearInterval(pollingIntervalId.current);
        pollingIntervalId.current = null;
      }
      
      setUsingFallback(false);
      wsFailureCount.current = 0;
      connectionId.current = generateConnectionId();
      connectWebSocket();
    } else {
      // Standard WebSocket connection
      connectWebSocket();
    }
  }, [connectWebSocket, generateConnectionId, usingFallback]);
  
  // Connect on mount if not disabled
  useEffect(() => {
    clinicMode.current = isClinic;
    
    if (!disableAutoConnect) {
      connect();
    }
    
    // Clean up on unmount
    return () => {
      if (debug) console.log(`Closing WebSocket ${connectionId.current} on hook unmount`);
      
      // Clear any timeouts and intervals
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
      
      if (pollingIntervalId.current) {
        clearInterval(pollingIntervalId.current);
      }
      
      // Close socket if open
      if (socket && socket.readyState === WebSocket.OPEN) {
        try {
          socket.close(1000, 'Component unmounted');
        } catch (error) {
          console.error('Error closing WebSocket on unmount:', error);
        }
      }
    };
  }, [connect, debug, disableAutoConnect, isClinic, socket]);
  
  return {
    socket,
    isConnected,
    reconnectAttempt,
    sendMessage,
    disconnect,
    connect,
    connectionId: connectionId.current,
    usingFallback
  };
}

export default useResilientWebSocket;