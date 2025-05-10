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
  
  // We'll define these functions later in the code
  const pollForMessagesRef = useRef<(retryCount?: number) => Promise<void>>();
  const startLongPollingRef = useRef<() => Promise<void>>();
  
  // Generate a unique connection ID
  const generateConnectionId = useCallback(() => {
    return `ws-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }, []);
  
  // Send a message to the server via HTTP
  const sendMessageViaHttp = useCallback(async (message: WebSocketMessage) => {
    if (!connectionIdState) return;
    
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: connectionIdState,
          message,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to send message via HTTP:', response.status, response.statusText);
        // Queue the message for retry
        messageQueueRef.current.push(message);
      }
    } catch (error) {
      console.error('Error sending message via HTTP:', error);
      // Queue the message for retry
      messageQueueRef.current.push(message);
    }
  }, [connectionIdState]);
  
  // Send all queued messages
  const sendQueuedMessagesViaHttp = useCallback(async () => {
    const messages = [...messageQueueRef.current];
    messageQueueRef.current = [];
    
    for (const message of messages) {
      await sendMessageViaHttp(message);
    }
  }, [sendMessageViaHttp]);
  
  // Poll for messages from the server with retry logic
  const pollForMessages = useCallback(async (retryCount = 0) => {
    if (!connectionIdState || !usingFallback) return;
    
    try {
      const url = `/api/messages/poll/${connectionIdState}${lastMessageIdRef.current ? `?lastMessageId=${lastMessageIdRef.current}` : ''}`;
      const response = await fetch(url);
      
      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        const maxRetries = 5;
        
        if (retryCount < maxRetries) {
          const nextRetry = retryCount + 1;
          const delay = Math.min(1000 * Math.pow(2, nextRetry), 10000); // Cap at 10 seconds
          
          if (debug) console.log(`Rate limited during polling, backing off for ${delay}ms before retry ${nextRetry}/${maxRetries}`);
          
          // Wait and retry with exponential backoff
          if (pollIntervalRef.current) clearTimeout(pollIntervalRef.current);
          pollIntervalRef.current = setTimeout(() => {
            pollForMessages(nextRetry);
          }, delay);
          
          return;
        } else {
          // After max retries, try to reestablish the connection completely
          if (debug) console.log('Max polling retries reached, attempting to reestablish connection');
          
          // Reset for a fresh connection
          await startLongPolling();
          return;
        }
      } else if (response.ok) {
        const data = await response.json();
        
        // Process each message
        if (data.success && data.messages && Array.isArray(data.messages)) {
          // Update last message ID if we received messages
          if (data.messages.length > 0) {
            const lastMessage = data.messages[data.messages.length - 1];
            lastMessageIdRef.current = lastMessage.id;
            
            // Process each message
            data.messages.forEach((message: any) => {
              // Convert server message format to our WebSocketMessage format
              const wsMessage: WebSocketMessage = {
                type: message.type,
                ...message.payload,
                timestamp: message.timestamp
              };
              
              if (onMessage) onMessage(wsMessage);
            });
          }
          
          // Send heartbeat occasionally
          if (Math.random() < 0.2) { // ~20% chance each poll
            sendMessageViaHttp({
              type: 'heartbeat',
              timestamp: Date.now(),
              connectionId: connectionIdState
            });
          }
          
          // Continue polling with reset retry count
          if (pollIntervalRef.current) clearTimeout(pollIntervalRef.current);
          pollIntervalRef.current = setTimeout(() => {
            pollForMessages(0); // Reset retry count on success
          }, 1000);
        } else {
          // No messages, but successful response - continue polling with reset retry count
          if (pollIntervalRef.current) clearTimeout(pollIntervalRef.current);
          pollIntervalRef.current = setTimeout(() => {
            pollForMessages(0); // Reset retry count on success
          }, 1000);
        }
      } else {
        console.warn('Long-polling request failed:', response.status, response.statusText);
        
        // For other errors, also use exponential backoff
        const maxRetries = 5;
        
        if (retryCount < maxRetries) {
          const nextRetry = retryCount + 1;
          const delay = Math.min(1000 * Math.pow(2, nextRetry), 10000);
          
          if (debug) console.log(`Polling error ${response.status}, backing off for ${delay}ms before retry ${nextRetry}/${maxRetries}`);
          
          // Wait and retry with exponential backoff
          if (pollIntervalRef.current) clearTimeout(pollIntervalRef.current);
          pollIntervalRef.current = setTimeout(() => {
            pollForMessages(nextRetry);
          }, delay);
        } else {
          // After max retries, try to reestablish the connection completely
          if (debug) console.log('Max polling error retries reached, attempting to reestablish connection');
          await startLongPolling();
        }
      }
    } catch (error) {
      console.error('Error in long-polling:', error);
      
      // For network errors, also use exponential backoff
      const maxRetries = 5;
      
      if (retryCount < maxRetries) {
        const nextRetry = retryCount + 1;
        const delay = Math.min(1000 * Math.pow(2, nextRetry), 10000);
        
        if (debug) console.log(`Polling network error, backing off for ${delay}ms before retry ${nextRetry}/${maxRetries}`);
        
        // Wait and retry with exponential backoff
        if (pollIntervalRef.current) clearTimeout(pollIntervalRef.current);
        pollIntervalRef.current = setTimeout(() => {
          pollForMessages(nextRetry);
        }, delay);
      } else {
        // After max retries, try to reestablish the connection completely
        if (debug) console.log('Max polling error retries reached, attempting to reestablish connection');
        await startLongPolling();
      }
    }
  }, [connectionIdState, debug, onMessage, sendMessageViaHttp, startLongPolling, usingFallback]);
  
  // Start long-polling as a fallback
  const startLongPolling = useCallback(async () => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    // Generate a new connection ID if needed
    const connId = connectionIdState || generateConnectionId();
    if (!connectionIdState) {
      setConnectionIdState(connId);
    }
    
    // Track retry attempts for exponential backoff
    let retryAttempt = 0;
    const maxRetries = 5;
    
    // Helper function to handle rate limiting with exponential backoff
    const registerWithRetry = async (): Promise<boolean> => {
      try {
        if (retryAttempt > 0 && debug) {
          console.log(`Retrying HTTP fallback registration (attempt ${retryAttempt}/${maxRetries})`);
        }
        
        const response = await fetch('/api/messages/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connectionId: connId,
            userId: userId || undefined,
            isClinic: isClinic || false
          }),
        });
        
        // If rate limited, implement exponential backoff
        if (response.status === 429) {
          if (retryAttempt < maxRetries) {
            retryAttempt++;
            const delay = Math.min(1000 * (2 ** retryAttempt), 10000); // Cap at 10 seconds
            if (debug) console.log(`Rate limited, backing off for ${delay}ms`);
            
            // Wait and retry
            await new Promise(resolve => setTimeout(resolve, delay));
            return registerWithRetry();
          } else {
            console.error('Failed to register after max retry attempts');
            return false;
          }
        } else if (!response.ok) {
          console.error('Failed to register for long-polling:', response.status, response.statusText);
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Error during HTTP fallback registration:', error);
        return false;
      }
    };
    
    // First register with the server for long polling
    try {
      const registrationSuccessful = await registerWithRetry();
      
      if (!registrationSuccessful) {
        setUsingFallback(false);
        return;
      }
      
      // Notify that we're connected via fallback
      setIsConnected(true);
      setUsingFallback(true);
      if (onOpen) onOpen();
      
      if (debug) console.log(`Starting long-polling fallback with ID ${connId}`);
      
      // Immediately send any queued messages
      if (messageQueueRef.current.length > 0) {
        sendQueuedMessagesViaHttp();
      }
      
      // Start polling immediately
      pollForMessages();
      
      // Set up polling interval
      pollIntervalRef.current = setInterval(pollForMessages, 5000);
      
    } catch (error) {
      console.error('Error setting up long-polling:', error);
      setUsingFallback(false);
    }
  }, [connectionIdState, debug, generateConnectionId, isClinic, onOpen, pollForMessages, sendQueuedMessagesViaHttp, userId]);
  
  // Connect to the WebSocket server
  const connectWebSocket = useCallback(() => {
    if (manuallyDisconnected) {
      if (debug) console.log('Skipping WebSocket connection - manual disconnect flag is set');
      return;
    }
    
    // Add more debug info
    if (debug) console.log('Browser environment details:', {
      protocol: window.location.protocol,
      host: window.location.host,
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
      webSocketSupported: typeof WebSocket !== 'undefined',
      secureContext: window.isSecureContext
    });
    
    
    try {
      // Generate a connection ID if needed
      const connId = connectionIdState || generateConnectionId();
      if (!connectionIdState) {
        setConnectionIdState(connId);
      }
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws?connectionId=${connId}${userId ? `&userId=${userId}` : ''}${isClinic ? '&isClinic=true' : ''}`;
      
      if (debug) console.log(`Connecting to WebSocket at ${wsUrl} (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})`);
      
      const socket = new WebSocket(wsUrl);
      websocketRef.current = socket;
      
      socket.onopen = () => {
        setIsConnected(true);
        setReconnectAttempt(0);
        setUsingFallback(false);
        
        // Send any queued messages
        if (messageQueueRef.current.length > 0 && socket.readyState === WebSocket.OPEN) {
          if (debug) console.log(`Sending ${messageQueueRef.current.length} queued messages`);
          messageQueueRef.current.forEach(msg => {
            socket.send(JSON.stringify(msg));
          });
          messageQueueRef.current = [];
        }
        
        if (onOpen) onOpen();
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (onMessage) onMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.onclose = (event) => {
        websocketRef.current = null;
        setIsConnected(false);
        
        if (onClose) onClose(event);
        
        // Try to reconnect if not manually disconnected and haven't exceeded max attempts
        if (!manuallyDisconnected && reconnectAttempt < maxReconnectAttempts) {
          if (debug) console.log(`WebSocket closed. Reconnecting (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})...`);
          setReconnectAttempt(prev => prev + 1);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            // Try WebSocket again
            connectWebSocket();
          }, reconnectInterval);
        } else if (reconnectAttempt >= maxReconnectAttempts && useResilientMode) {
          // Switch to fallback mode after max reconnect attempts
          if (debug) console.log('Max reconnect attempts reached. Switching to fallback mode.');
          
          startLongPolling();
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
        
        // If we get an error and we're using resilient mode, try the fallback
        if (useResilientMode && reconnectAttempt >= 2) {
          if (debug) console.log('WebSocket error. Switching to fallback mode.');
          if (websocketRef.current) {
            websocketRef.current.close();
          }
          
          startLongPolling();
        }
      };
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
      
      // Fall back to HTTP if WebSocket creation failed
      if (useResilientMode) {
        if (debug) console.log('Error creating WebSocket. Switching to fallback mode.');
        startLongPolling();
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
    startLongPolling, 
    userId, 
    useResilientMode
  ]);
  
  // Send a message
  const sendMessage = useCallback((message: WebSocketMessage) => {
    // Add connection ID if not present
    if (!message.connectionId && connectionIdState) {
      message.connectionId = connectionIdState;
    }
    
    // If using fallback mode, send via HTTP
    if (usingFallback) {
      sendMessageViaHttp(message);
      return;
    }
    
    // If socket is connected, send immediately
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
      return;
    }
    
    // Otherwise queue the message for later
    if (debug) console.log(`WebSocket not connected, queueing message of type ${message.type}`);
    // Limit queue size to prevent memory issues
    if (messageQueueRef.current.length < 50) {
      messageQueueRef.current.push(message);
    } else {
      console.warn('Message queue full, dropping message:', message);
    }
  }, [connectionIdState, debug, sendMessageViaHttp, usingFallback]);
  
  // Disconnect from the server
  const disconnect = useCallback(() => {
    setManuallyDisconnected(true);
    
    // Clean up the connection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    if (usingFallback) {
      if (connectionIdState) {
        fetch('/api/messages/unregister', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connectionId: connectionIdState
          }),
        }).catch(err => console.error('Error unregistering HTTP client:', err));
      }
      
      setIsConnected(false);
      setUsingFallback(false);
      
      if (onClose) onClose();
    } else if (websocketRef.current) {
      if (websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.close();
      }
      websocketRef.current = null;
      setIsConnected(false);
    }
  }, [connectionIdState, onClose, usingFallback]);
  
  // Connect to the server when the component mounts
  useEffect(() => {
    // Skip if auto-connect is disabled
    if (disableAutoConnect) return;
    
    // Connect to the server
    connectWebSocket();
    
    // Clean up on unmount
    return () => {
      if (debug) console.log(`Cleaning up WebSocket ${connectionIdState} on hook unmount`);
      
      // Clean up timers
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      
      // Close the WebSocket connection
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      
      // Unregister HTTP client if using fallback
      if (usingFallback && connectionIdState) {
        fetch('/api/messages/unregister', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connectionId: connectionIdState
          }),
        }).catch(err => console.error('Error unregistering HTTP client:', err));
      }
    };
  }, [connectWebSocket, connectionIdState, debug, disableAutoConnect, usingFallback]);
  
  // Return the public API
  return {
    isConnected,
    usingFallback,
    reconnectAttempt,
    connectionId: connectionIdState,
    sendMessage,
    connect: connectWebSocket,
    disconnect,
  };
}

export default useResilientWebSocket;