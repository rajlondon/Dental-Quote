import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from './use-toast';

// Global connection tracking to prevent duplicate connections
const activeConnections = new Map<string, boolean>();

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
  const [usingFallback, setUsingFallback] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [manuallyDisconnected, setManuallyDisconnected] = useState(false);
  const [connectionIdState, setConnectionIdState] = useState<string | null>(null);
  
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<WebSocketMessage[]>([]);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const { toast } = useToast();
  
  // Function references to break circular dependencies
  const pollForMessagesRef = useRef<(retryCount?: number) => Promise<void>>();
  const startLongPollingRef = useRef<(manualStartForRetry?: boolean, retryCount?: number) => Promise<void>>();
  
  // Generate a unique connection ID
  const generateConnectionId = useCallback(() => {
    return `ws-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }, []);
  
  // Send a message via HTTP with improved error handling and timeout
  const sendMessageViaHttp = useCallback(async (message: WebSocketMessage) => {
    if (!connectionIdState) return;
    
    try {
      // Add timeout handling to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'X-Priority': 'high' // Prioritize message sending
        },
        body: JSON.stringify({
          connectionId: connectionIdState,
          message,
          timestamp: Date.now() // Add timestamp for debugging
        }),
        signal: controller.signal,
        cache: 'no-store'
      });
      
      // Clear the timeout since request completed
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('Failed to send message via HTTP:', response.status, response.statusText);
        // Queue the message for retry, but only for retriable status codes
        const retriableStatusCodes = [408, 429, 500, 502, 503, 504];
        if (retriableStatusCodes.includes(response.status)) {
          messageQueueRef.current.push(message);
        }
      }
    } catch (error: unknown) {
      // Specific handling for timeout errors with proper type checking
      if (
        error && 
        typeof error === 'object' && 
        'name' in error && 
        typeof error.name === 'string' && 
        error.name === 'AbortError'
      ) {
        console.warn('HTTP message send timed out, will retry');
      } else {
        console.error('Error sending message via HTTP:', error);
      }
      
      // Queue the message for retry
      messageQueueRef.current.push(message);
    }
  }, [connectionIdState]);
  
  // Send all queued messages
  const sendQueuedMessagesViaHttp = useCallback(async () => {
    if (messageQueueRef.current.length === 0) return;
    
    const messages = [...messageQueueRef.current];
    messageQueueRef.current = [];
    
    for (const message of messages) {
      await sendMessageViaHttp(message);
    }
  }, [sendMessageViaHttp]);
  
  // Poll for messages from the server with enhanced retry logic and timeout handling
  const pollForMessages = useCallback(async (retryCount = 0) => {
    if (!connectionIdState || !usingFallback) return;
    
    try {
      // Add timeout handling for long polling to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout (longer for polling)
      
      const response = await fetch(`/api/messages/poll/${connectionIdState}?lastMessageId=${lastMessageIdRef.current || ''}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'X-Priority': retryCount < 2 ? 'high' : 'normal' // Prioritize initial polls
        },
        signal: controller.signal,
        cache: 'no-store'
      });
      
      // Clear the timeout since request completed
      clearTimeout(timeoutId);
      
      if (response.status === 204) {
        // No content, continue polling
        // This is the normal response when no messages are available
        if (pollIntervalRef.current === null && isConnected) {
          pollIntervalRef.current = setTimeout(() => {
            pollIntervalRef.current = null;
            if (pollForMessagesRef.current) {
              pollForMessagesRef.current();
            }
          }, 1000);
        }
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.messages && Array.isArray(data.messages)) {
        // Process received messages
        for (const message of data.messages) {
          if (onMessage) {
            onMessage(message.payload);
          }
          lastMessageIdRef.current = message.id;
        }
      }
      
      // Continue polling
      if (pollIntervalRef.current === null && isConnected) {
        pollIntervalRef.current = setTimeout(() => {
          pollIntervalRef.current = null;
          if (pollForMessagesRef.current) {
            pollForMessagesRef.current();
          }
        }, 500);
      }
    } catch (error: unknown) {
      // Special handling for timeout vs. other errors
      if (
        error && 
        typeof error === 'object' && 
        'name' in error && 
        typeof error.name === 'string' && 
        error.name === 'AbortError'
      ) {
        console.warn('HTTP polling request timed out, will retry with increased timeout');
      } else {
        console.error('Error polling for messages:', error);
      }
      
      // If we're connected and this is a temporary issue, retry with backoff
      if (isConnected && retryCount < 6) { // Increased retry limit
        // Higher level of backoff for polling to reduce rate-limiting issues
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 15000);
        
        if (debug) {
          console.warn(`Polling retry ${retryCount + 1} in ${backoffTime}ms`);
        }
        
        setTimeout(() => {
          if (pollForMessagesRef.current) {
            pollForMessagesRef.current(retryCount + 1);
          }
        }, backoffTime);
      } else if (isConnected) {
        // Too many failures, try to re-establish the HTTP connection entirely
        console.error('Too many polling failures, resetting HTTP connection');
        setIsConnected(false);
        
        if (startLongPollingRef.current) {
          startLongPollingRef.current(true);
        }
      }
    }
  }, [connectionIdState, debug, isConnected, onMessage, usingFallback]);
  
  // Store the function in the ref to break circular dependencies
  pollForMessagesRef.current = pollForMessages;
  
  // Start long polling for messages with exponential backoff
  const startLongPolling = useCallback(async (manualStartForRetry = false, retryCount = 0) => {
    if ((!useResilientMode && !manualStartForRetry) || manuallyDisconnected) return;
    
    try {
      // If we're already using fallback and connected, don't start again
      if (usingFallback && isConnected && !manualStartForRetry) return;
      
      // Don't retry too many times
      if (retryCount > 5) {
        if (debug) {
          console.log(`Giving up on HTTP fallback after ${retryCount} attempts`);
        }
        return;
      }
      
      // Generate a new connection ID if we don't have one
      const connectionId = connectionIdState || generateConnectionId();
      if (!connectionIdState) {
        setConnectionIdState(connectionId);
      }
      
      const registrationData: any = {
        connectionId,
      };
      
      if (userId !== undefined) {
        registrationData.userId = userId;
      }
      
      if (isClinic !== undefined) {
        registrationData.isClinic = isClinic;
      }
      
      // Register with the server with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Increase timeout to 8 seconds
      
      try {
        // Add a critical flag to indicate this is a first connection attempt
        // This will help server prioritize these requests
        const response = await fetch('/api/messages/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Priority': retryCount === 0 ? 'high' : 'normal'
          },
          body: JSON.stringify({
            ...registrationData,
            isCriticalConnection: retryCount === 0
          }),
          signal: controller.signal,
          // Add cache control to prevent caching issues
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        
        if (response.status === 429) {
          // Rate limited - use exponential backoff
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
          if (debug) {
            console.log(`Rate limited, retrying HTTP fallback in ${retryDelay}ms (attempt ${retryCount + 1})`);
          }
          
          setTimeout(() => {
            if (startLongPollingRef.current) {
              // TypeScript doesn't like us passing params here
              (startLongPollingRef.current as any)(true, retryCount + 1);
            }
          }, retryDelay);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Failed to register HTTP client: ${response.status}`);
        }
        
        // Success
        setIsConnected(true);
        setUsingFallback(true);
        setReconnectAttempt(0);
        
        if (onOpen) {
          onOpen();
        }
        
        if (debug) {
          console.log(`HTTP polling fallback active for connection ${connectionId}`);
          toast({
            title: 'Using HTTP Fallback',
            description: 'WebSocket connection unavailable, using HTTP instead',
            variant: 'default',
          });
        }
        
        // Start polling for messages
        if (pollForMessagesRef.current) {
          // TypeScript doesn't like us passing params here, but this is
          // correctly defined in the useCallback below
          (pollForMessagesRef.current as any)(0);
        }
        
        // Send any queued messages
        await sendQueuedMessagesViaHttp();
      } catch (err) {
        clearTimeout(timeoutId);
        throw err; // Re-throw for outer catch
      }
    } catch (error: any) {
      if (error && error.name === 'AbortError') {
        console.warn('HTTP registration request timed out');
      } else {
        console.error('Error starting long polling:', error ? error.message || String(error) : 'Unknown error');
      }
      
      if (onError) {
        onError(new Event('error'));
      }
      
      // Calculate backoff delay
      const retryDelay = Math.min(reconnectInterval * Math.pow(1.5, retryCount), 30000);
      
      if (debug) {
        console.log(`Retrying HTTP fallback in ${retryDelay}ms (attempt ${retryCount + 1})`);
      }
      
      // Try to restart polling after delay with incremented retry count
      setTimeout(() => {
        if (startLongPollingRef.current) {
          // TypeScript doesn't like us passing params here
          (startLongPollingRef.current as any)(true, retryCount + 1);
        }
      }, retryDelay);
    }
  }, [
    connectionIdState,
    debug,
    generateConnectionId,
    isClinic,
    isConnected,
    manuallyDisconnected,
    onError,
    onOpen,
    reconnectInterval,
    sendQueuedMessagesViaHttp,
    toast,
    useResilientMode,
    userId,
    usingFallback,
  ]);
  
  // Store the function in the ref to break circular dependencies
  startLongPollingRef.current = startLongPolling;
  
  // Connect to WebSocket with transport mode awareness
  const connectWebSocket = useCallback(() => {
    // Check for persistent WebSocket failures from past page loads
    const getFailureCount = () => {
      try {
        return parseInt(localStorage.getItem('websocket_failure_count') || '0', 10);
      } catch (e) {
        return 0;
      }
    };
    
    // If we've had consistent failures with WebSockets, go directly to HTTP
    const failureCount = getFailureCount();
    if (failureCount > 5 && !forceWebSocket) {
      // We've had multiple failures across page loads, prefer HTTP fallback
      if (debug) console.warn(`Detected ${failureCount} consecutive WebSocket failures, starting with HTTP fallback directly`);
      setTransportMethod('http');
      startLongPolling();
      return;
    }
    
    if (manuallyDisconnected) {
      if (debug) console.log('Skipping WebSocket connection - manual disconnect flag is set');
      return;
    }
    
    // Close any existing connections
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    const connectionId = connectionIdState || generateConnectionId();
    if (!connectionIdState) {
      setConnectionIdState(connectionId);
    }
    
    // If connection is already tracked globally, update it (and potentially clean up old connections)
    if (activeConnections.has(connectionId)) {
      activeConnections.set(connectionId, true);
    }
    
    // Construct WebSocket URL with parameters
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Build URL with all parameters
    const urlParams = new URLSearchParams();
    urlParams.append('connectionId', connectionId);
    
    if (userId !== undefined) {
      urlParams.append('userId', userId.toString());
    }
    
    if (isClinic !== undefined) {
      urlParams.append('isClinic', isClinic.toString());
    }
    
    // Final WebSocket URL
    const wsUrl = `${protocol}//${window.location.host}/ws?${urlParams.toString()}`;
    
    if (debug) {
      console.log(`Connecting to WebSocket at ${wsUrl} (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})`);
    }
    
    try {
      const ws = new WebSocket(wsUrl);
      websocketRef.current = ws;
      
      if (debug) {
        console.log(`WebSocket ${connectionId} connecting...`);
      }
      
      ws.onopen = () => {
        setIsConnected(true);
        setUsingFallback(false);
        setReconnectAttempt(0);
        
        // Register this connection
        activeConnections.set(connectionId, true);
        
        if (debug) {
          console.log(`WebSocket ${connectionId} connected successfully`);
        }
        
        // Send any queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
          }
        }
        
        if (onOpen) {
          onOpen();
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (onMessage) {
            onMessage(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        setIsConnected(false);
        websocketRef.current = null;
        
        // If this was an abnormal closure and we're not manually disconnected, try fallback
        if (event.code === 1006 && useResilientMode && !manuallyDisconnected) {
          if (debug) {
            console.warn(`⚠️ WebSocket abnormal closure (${event.code}) detected for connection ${connectionId}. This typically indicates network issues or server restart.`);
          }
          
          // Switch to long polling fallback
          if (startLongPollingRef.current) {
            startLongPollingRef.current();
          }
          return;
        }
        
        if (debug) {
          console.log(`WebSocket ${connectionId} closed with code ${event.code}`);
        }
        
        if (onClose) {
          onClose(event);
        }
        
        // If not manually disconnected and not at max attempts, try to reconnect
        if (!manuallyDisconnected && reconnectAttempt < maxReconnectAttempts) {
          const nextAttempt = reconnectAttempt + 1;
          setReconnectAttempt(nextAttempt);
          
          // Exponential backoff
          const delay = Math.min(reconnectInterval * Math.pow(1.5, nextAttempt), 30000);
          
          if (debug) {
            console.log(`Reconnecting in ${delay}ms (attempt ${nextAttempt}/${maxReconnectAttempts})`);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connectWebSocket();
          }, delay);
        }
      };
      
      ws.onerror = (event) => {
        if (debug) {
          console.log(`WebSocket ${connectionId} error:`, event);
        }
        
        // Track WebSocket failures for smart transport selection
        try {
          const currentFailures = parseInt(localStorage.getItem('websocket_failure_count') || '0', 10);
          localStorage.setItem('websocket_failure_count', (currentFailures + 1).toString());
          if (debug) {
            console.warn(`WebSocket failure count increased to ${currentFailures + 1}`);
          }
        } catch (e) {
          // Ignore localStorage errors
        }
        
        if (onError) {
          onError(event);
        }
        
        // Don't set connection state here, let onclose handle it
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      
      if (onError) {
        onError(new Event('error'));
      }
      
      // If WebSocket creation failed and resilient mode is enabled, try HTTP fallback
      if (useResilientMode && startLongPollingRef.current) {
        startLongPollingRef.current();
      }
    }
  }, [
    connectionIdState,
    debug,
    generateConnectionId,
    isClinic,
    manuallyDisconnected,
    maxReconnectAttempts,
    onClose,
    onError,
    onMessage,
    onOpen,
    reconnectAttempt,
    reconnectInterval,
    useResilientMode,
    userId,
  ]);
  
  // Connect to the server
  const connect = useCallback(() => {
    setManuallyDisconnected(false);
    
    // First try WebSocket, fallback to HTTP if needed
    connectWebSocket();
  }, [connectWebSocket]);
  
  // Disconnect from the server
  const disconnect = useCallback(() => {
    setManuallyDisconnected(true);
    setIsConnected(false);
    setUsingFallback(false);
    
    // Clear any reconnect timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Clear any polling intervals
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    // Close WebSocket if it exists
    if (websocketRef.current) {
      if (debug) {
        console.log(`Manually disconnecting WebSocket ${connectionIdState}`);
      }
      
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    // If using HTTP fallback, unregister
    if (usingFallback && connectionIdState) {
      fetch('/api/messages/unregister', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId: connectionIdState }),
      }).catch(error => {
        console.error('Error unregistering HTTP client:', error);
      });
    }
    
    // Remove from active connections
    if (connectionIdState) {
      activeConnections.delete(connectionIdState);
    }
    
    if (onClose) {
      onClose();
    }
  }, [connectionIdState, debug, onClose, usingFallback]);
  
  // Send a message to the server
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN && !usingFallback) {
      // Send via WebSocket
      websocketRef.current.send(JSON.stringify(message));
    } else if (usingFallback && isConnected && connectionIdState) {
      // Send via HTTP
      sendMessageViaHttp(message);
    } else {
      // Queue for when connection is established
      messageQueueRef.current.push(message);
      
      if (debug) {
        console.log('Message queued for later delivery:', message);
      }
      
      // If not connected or connecting, try to connect
      if (!isConnected && !websocketRef.current && !manuallyDisconnected) {
        connect();
      }
    }
  }, [
    connect,
    connectionIdState,
    debug,
    isConnected,
    manuallyDisconnected,
    sendMessageViaHttp,
    usingFallback,
  ]);
  
  // Setup connection on mount
  useEffect(() => {
    if (!disableAutoConnect) {
      connect();
    }
    
    return () => {
      if (connectionIdState) {
        if (debug) {
          console.log(`Closing WebSocket ${connectionIdState} on hook unmount`);
        }
        disconnect();
      }
    };
  }, [connect, connectionIdState, debug, disconnect, disableAutoConnect]);
  
  return {
    isConnected,
    usingFallback,
    reconnectAttempt,
    connectionId: connectionIdState,
    connect,
    disconnect,
    sendMessage,
  };
}

export default useResilientWebSocket;