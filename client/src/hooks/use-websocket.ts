import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Standard WebSocket message format for communication between client and server
 */
export interface WebSocketMessage {
  /** 
   * Message type identifier (required)
   * Common types:
   * - 'ping': Heartbeat message
   * - 'pong': Server heartbeat response
   * - 'auth': Authentication message
   * - 'disconnect': Client-initiated disconnect
   * - 'notification': User notification
   * - 'update': Data update (specific entity data in the `data` field)
   * - 'error': Error message (error details in the `message` field)
   */
  type: string;
  
  /**
   * Optional payload data specific to the message type
   * Structure depends on the `type` field
   */
  data?: any;
  
  /**
   * Optional text message, used for notifications, errors, etc.
   */
  message?: string;
  
  /**
   * For response messages, the original request type
   */
  originalType?: string;
  
  /**
   * For response messages, the original request message
   */
  originalMessage?: any;
  
  /**
   * Timestamp in milliseconds (if not provided, will be added by the hook)
   */
  timestamp?: number;
  
  /**
   * Unique connection identifier (automatically added by the hook)
   */
  connectionId?: string;
  
  /**
   * User ID for authenticated messages (automatically added by the hook if available)
   */
  userId?: number;
  
  /**
   * Flag indicating if message is from/to a clinic user (automatically added by the hook if available)
   */
  isClinic?: boolean;
}

/**
 * Configuration options for the useWebSocket hook
 */
interface UseWebSocketOptions {
  /**
   * Callback when a message is received from the server
   * @param message The received message
   */
  onMessage?: (message: WebSocketMessage) => void;
  
  /**
   * Callback when connection is established
   */
  onOpen?: () => void;
  
  /**
   * Callback when connection is closed
   */
  onClose?: () => void;
  
  /**
   * Callback when an error occurs
   * @param error The error event
   */
  onError?: (error: Event) => void;
  
  /**
   * Time between reconnection attempts in milliseconds
   * @default 2000
   */
  reconnectInterval?: number;
  
  /**
   * Maximum number of reconnection attempts before giving up
   * @default 10
   */
  maxReconnectAttempts?: number;
  
  /**
   * User ID for authenticated connections
   * Automatically added to outgoing messages
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
}

/**
 * Hook for WebSocket communication with enhanced reliability and reconnection
 * 
 * @param options Configuration options for the WebSocket connection
 * @returns Object containing connection state and control methods
 * 
 * Returned values:
 * - socket: The active WebSocket instance or null if not connected
 * - isConnected: Boolean indicating if the socket is currently connected
 * - reconnectAttempt: The current reconnection attempt count
 * - sendMessage: Function to send a message to the server
 * - disconnect: Function to gracefully disconnect from the server (properly notifies the server)
 * - connect: Function to force a connection (useful after manual disconnect)
 * - connectionId: Unique identifier for this connection (useful for debugging)
 */
export function useWebSocket(options: UseWebSocketOptions = {}): {
  socket: WebSocket | null;
  isConnected: boolean;
  reconnectAttempt: number;
  sendMessage: (message: WebSocketMessage) => void;
  disconnect: () => void;
  connect: () => void;
  connectionId: string | null;
} {
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
  } = options;

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const { toast } = useToast();
  
  // Use refs to track the socket instance and connection state
  // across render cycles and not lose track during reconnects
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const messageQueueRef = useRef<WebSocketMessage[]>([]);
  const connectionIdRef = useRef<string>(`ws-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`);
  const manualDisconnectRef = useRef<boolean>(false);
  const clinicModeRef = useRef<boolean>(isClinic);

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (disableAutoConnect) {
      console.log('WebSocket auto-connect disabled');
      return;
    }

    // Don't try to reconnect if we've manually disconnected
    if (manualDisconnectRef.current) {
      console.log('Skipping WebSocket connection - manual disconnect flag is set');
      return;
    }

    // Don't reconnect if we're already connected
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping reconnect');
      return;
    }
    
    // Check for clinic staff cookies and session storage flags
    const isClinicStaff = document.cookie.split(';').some(cookie => 
      cookie.trim().startsWith('is_clinic_staff=true') || 
      cookie.trim().startsWith('is_clinic_login=true'));
      
    const clinicSessionActive = sessionStorage.getItem('clinic_portal_access_successful') === 'true';
    
    // If we're in clinic mode, check more persistently for portal access
    if (isClinic || isClinicStaff || clinicSessionActive || (window as any).__inClinicPortal) {
      console.log('In clinic portal - using special WebSocket handling', { 
        isClinic, 
        isClinicStaff, 
        clinicSessionActive, 
        inClinicPortal: (window as any).__inClinicPortal 
      });
      
      // For clinic staff, try to get stored clinic ID from sessionStorage
      let clinicUserId: number | undefined = undefined;
      const storedUserId = sessionStorage.getItem('clinic_user_id');
      if (storedUserId) {
        clinicUserId = parseInt(storedUserId, 10);
        if (!isNaN(clinicUserId) && clinicUserId > 0) {
          console.log(`Retrieved clinic user ID from sessionStorage: ${clinicUserId}`);
        }
      }
      
      // IMPORTANT IMPROVEMENT: Instead of skipping WebSocket connection for clinic staff,
      // we'll establish a proper connection with clinic ID
      if (clinicUserId) {
        try {
          // Use the correct protocol based on page protocol
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = `${protocol}//${window.location.host}/ws`;
          
          console.log(`Establishing clinic staff WebSocket connection to ${wsUrl} with clinic ID ${clinicUserId}`);
          
          // Close any existing socket before creating a new one
          if (socketRef.current) {
            socketRef.current.onclose = null; // Prevent onclose from triggering reconnect
            socketRef.current.close();
          }
          
          // Generate unique connection ID for clinic connection
          connectionIdRef.current = `ws-clinic-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
          
          const socket = new WebSocket(wsUrl);
          socketRef.current = socket;
          
          console.log(`WebSocket ${connectionIdRef.current} connecting for clinic ID: ${clinicUserId}`);
          
          socket.onopen = () => {
            console.log(`Clinic WebSocket ${connectionIdRef.current} connected successfully`);
            setSocket(socket);
            setIsConnected(true);
            setReconnectAttempt(0);
            
            // Send auth message to associate this connection with clinic user
            const authMessage = {
              type: 'auth',
              userId: clinicUserId,
              connectionId: connectionIdRef.current,
              isClinic: true,
              timestamp: Date.now()
            };
            socket.send(JSON.stringify(authMessage));
            
            // Set clinic mode flag for other components
            (window as any).__clinicWebSocketConnected = true;
            sessionStorage.setItem('clinic_websocket_connected', 'true');
            
            // Call the onOpen callback if provided
            if (onOpen) {
              onOpen();
            }
          };
          
          // Set up standard event handlers for the clinic WebSocket
          socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              
              // Call user-provided message handler if available
              if (onMessage) {
                onMessage(data);
              }
              
              // Special handling for certain message types
              if (data.type === 'ping') {
                // Respond to ping with pong
                sendMessage({
                  type: 'pong',
                  timestamp: Date.now(),
                  connectionId: connectionIdRef.current
                });
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };
          
          // Use the same close handler as regular connections
          socket.onclose = (event) => {
            console.log(`Clinic WebSocket ${connectionIdRef.current} closed with code ${event.code}:`, event.reason || 'No reason provided');
            setSocket(null);
            setIsConnected(false);
            
            if (onClose) {
              onClose();
            }
            
            // For abnormal closures, attempt to reconnect faster
            if (event.code === 1006) {
              console.warn(`⚠️ Abnormal closure of clinic WebSocket. Attempting rapid reconnect.`);
              
              // Quick reconnect for clinic staff
              setTimeout(() => {
                setReconnectAttempt(prevAttempt => prevAttempt + 1);
                connect();
              }, 1000);
            }
          };
          
          // Simple error handler
          socket.onerror = (error) => {
            console.error(`Clinic WebSocket error:`, error);
            if (onError) {
              onError(error);
            }
          };
          
          return;
        } catch (clinicConnectError) {
          console.error('Error establishing clinic WebSocket connection:', clinicConnectError);
          // Fall through to normal connection logic on failure
        }
      } else {
        // If we couldn't get a clinic user ID but we're in clinic mode,
        // skip the connection but don't block reconnection attempts
        console.log('Clinic mode detected but no valid clinic user ID found - skipping WebSocket connection for now');
        setSocket(null);
        setIsConnected(false);
        return;
      }
    }

    try {
      // Use the correct protocol based on page protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Generate a unique connection ID for this connection
      connectionIdRef.current = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      
      // Build URL with connection tracking parameters
      let wsUrl = `${protocol}//${window.location.host}/ws?connectionId=${connectionIdRef.current}`;
      
      // Add user identification when available
      if (userId) {
        wsUrl += `&userId=${userId}`;
      }
      
      // Add clinic mode flag
      if (clinicModeRef.current) {
        wsUrl += `&isClinic=true`;
      }
      
      // Close any existing socket before creating a new one
      if (socketRef.current) {
        socketRef.current.onclose = null; // Prevent onclose from triggering reconnect
        socketRef.current.close();
      }
      
      console.log(`Connecting to WebSocket at ${wsUrl} (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})`);
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // Log connection ID and details for debugging
      console.log(`WebSocket ${connectionIdRef.current} connecting...`);
      
      // Track ping-pong heartbeat
      const lastPingTime = { current: 0 };
      const lastPongTime = { current: 0 };
      
      // Set up binary message event handler for ping/pong
      socket.onopen = () => {
        console.log(`WebSocket ${connectionIdRef.current} connected successfully`);
        setSocket(socket);
        setIsConnected(true);
        setReconnectAttempt(0);
        
        // Add ping event listener for server heartbeats
        socket.addEventListener('ping', () => {
          // Record ping receipt time
          lastPingTime.current = Date.now();
          
          // Don't need to manually send pong - browser does it automatically
          // Just for tracking, we record that we got a ping
          if (debug) {
            console.log(`Received ping from server at ${new Date().toISOString()}`);
          }
        });
        
        // Add pong event listener 
        socket.addEventListener('pong', () => {
          // Update the last pong time
          lastPongTime.current = Date.now();
          
          if (debug) {
            console.log(`Received pong from server at ${new Date().toISOString()}`);
          }
        });
        
        // Store user ID association with this socket
        if (userId) {
          // Send auth message to associate this connection with the user
          const authMessage = {
            type: 'auth',
            userId,
            connectionId: connectionIdRef.current,
            isClinic,
            timestamp: Date.now()
          };
          socket.send(JSON.stringify(authMessage));
          
          // Set up connection tracking
          if (!(window as any).__websocketConnections) {
            (window as any).__websocketConnections = {};
          }
          (window as any).__websocketConnections[`user-${userId}`] = {
            socket,
            connectionId: connectionIdRef.current,
            timestamp: Date.now()
          };
          
          // Track last activity time for this user
          if (!(window as any).__websocketLastActivity) {
            (window as any).__websocketLastActivity = {};
          }
          (window as any).__websocketLastActivity[`user-${userId}`] = Date.now();
        }
        
        // Set up heartbeat check to detect dead connections that the browser hasn't recognized
        const HEARTBEAT_CHECK_INTERVAL = 30000; // 30 seconds
        const MAX_TIME_WITHOUT_SERVER_HEARTBEAT = 90000; // 90 seconds
        
        // Create an interval that checks if we've received server heartbeats
        const heartbeatCheckInterval = setInterval(() => {
          const now = Date.now();
          
          // Skip check if disconnecting or if no pings have ever been received
          if (manualDisconnectRef.current || lastPingTime.current === 0) {
            return;
          }
          
          // Check if we haven't received a ping in too long
          const timeSinceLastHeartbeat = now - lastPingTime.current;
          if (timeSinceLastHeartbeat > MAX_TIME_WITHOUT_SERVER_HEARTBEAT && lastPingTime.current !== 0) {
            console.warn(`No server heartbeats received for ${Math.floor(timeSinceLastHeartbeat/1000)}s. Connection may be dead.`);
            
            // If socket still appears open, it might be a zombie connection
            if (socket.readyState === WebSocket.OPEN) {
              console.warn('WebSocket appears open but no heartbeats received. Forcing reconnection.');
              
              // Force close and trigger reconnect
              try {
                // Clear this interval first to prevent multiple executions
                clearInterval(heartbeatCheckInterval);
                
                // Close the socket
                socket.close(4000, 'Client-initiated close due to heartbeat timeout');
                
                // Let onclose handle reconnection
              } catch (closeError) {
                console.error('Error forcing socket close:', closeError);
              }
            }
          }
        }, HEARTBEAT_CHECK_INTERVAL);
        
        // Clean up the heartbeat interval when connection closes
        socket.addEventListener('close', () => {
          clearInterval(heartbeatCheckInterval);
        });
        
        // Send any queued messages
        if (messageQueueRef.current.length > 0) {
          console.log(`Sending ${messageQueueRef.current.length} queued messages`);
          messageQueueRef.current.forEach(msg => {
            socket.send(JSON.stringify(msg));
          });
          messageQueueRef.current = [];
        }
        
        // Call onOpen callback if provided
        if (onOpen) {
          onOpen();
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          
          // Update last activity timestamp
          if (userId && (window as any).__websocketLastActivity) {
            (window as any).__websocketLastActivity[`user-${userId}`] = Date.now();
          }
          
          // Handle system messages with special logging
          if (message.type === 'error' || message.type === 'warning') {
            console.warn(`WebSocket ${message.type} received:`, message);
            // Show toast for important errors
            if (message.type === 'error' && toast) {
              // Extract error message from any of the possible message formats
              const errorMessage = 
                typeof message.message === 'string' ? message.message :
                typeof message.data === 'string' ? message.data :
                message.data?.message || message.data?.error || 
                'An error occurred with the real-time connection';
                
              toast({
                title: 'Connection Error',
                description: errorMessage,
                variant: 'destructive',
              });
            }
          } else if (message.type === 'registered') {
            console.log('WebSocket registration confirmed:', message);
            
            // Track connection status in session
            try {
              const connectionEntry = {
                connectionId: connectionIdRef.current,
                userId: userId,
                timestamp: Date.now(),
                isClinic: clinicModeRef.current
              };
              sessionStorage.setItem('ws_last_connection', JSON.stringify(connectionEntry));
            } catch (e) {
              // Ignore storage errors
            }
          } else if (message.type !== 'pong') {
            // Skip logging for routine pong messages
            console.log(`WebSocket message received [${message.type}]`, message);
          }
          
          // Call onMessage callback if provided
          if (onMessage) {
            onMessage(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          console.error('Raw message:', event.data ? 
            (typeof event.data === 'string' ? event.data.substring(0, 200) : '[Binary data]') : 
            '[Empty message]'
          );
        }
      };

      socket.onclose = (event) => {
        console.log(`WebSocket ${connectionIdRef.current} closed with code ${event.code}:`, event.reason || 'No reason provided');
        
        // Check clinic mode again to catch late clinic status flags
        const isClinicStaff = document.cookie.split(';').some(cookie => 
          cookie.trim().startsWith('is_clinic_staff=true') || 
          cookie.trim().startsWith('is_clinic_login=true'));
          
        const clinicSessionActive = sessionStorage.getItem('clinic_portal_access_successful') === 'true';
        
        // Update clinic mode reference with latest status
        clinicModeRef.current = isClinic || isClinicStaff || clinicSessionActive || !!(window as any).__inClinicPortal;
        
        // Determine if we should skip reconnection
        const skipReconnect = manualDisconnectRef.current || clinicModeRef.current;
        
        console.log(`WebSocket ${connectionIdRef.current} closed - skip reconnect analysis:`, {
          manual: manualDisconnectRef.current, 
          clinicMode: clinicModeRef.current,
          isClinicStaff,
          clinicSessionActive,
          inClinicPortal: !!(window as any).__inClinicPortal,
          closeCode: event.code,
          closeReason: event.reason || 'No reason provided'
        });
        
        setSocket(null);
        setIsConnected(false);
        
        if (onClose) {
          onClose();
        }

        // Enhanced handling for code 1006 (abnormal closure)
        const isAbnormalClosure = event.code === 1006;
        if (isAbnormalClosure) {
          // Log with warning level for abnormal closures
          console.warn(`⚠️ WebSocket abnormal closure (1006) detected for connection ${connectionIdRef.current}. This typically indicates network issues or server restart.`);
          
          // Track failures for debugging
          const failureTime = new Date().toISOString();
          console.warn(`WebSocket failure #${reconnectAttempt + 1} at ${failureTime}`);
          
          // Special handling for clinic staff
          if (clinicModeRef.current) {
            console.log('Clinic portal detected abnormal WebSocket closure - handling with enhanced reconnection');
            
            // For clinic connections, use more aggressive reconnection strategy
            // This helps ensure clinic staff maintain stable connections
            if (reconnectTimeoutRef.current) {
              window.clearTimeout(reconnectTimeoutRef.current);
            }
            
            // Use a shorter initial delay for clinic users to minimize disruption
            const clinicReconnectDelay = 1000; // 1 second instead of normal backoff
            
            // Store timestamp of last abnormal close
            sessionStorage.setItem('last_ws_error_time', Date.now().toString());
            
            // Add entry to sessionStorage to track reconnection attempts
            const reconnectAttempts = JSON.parse(sessionStorage.getItem('ws_reconnect_attempts') || '[]');
            reconnectAttempts.push({
              timestamp: Date.now(),
              connectionId: connectionIdRef.current,
              code: event.code,
              reason: event.reason || 'No reason provided'
            });
            
            // Keep only the last 10 attempts
            if (reconnectAttempts.length > 10) {
              reconnectAttempts.shift();
            }
            
            sessionStorage.setItem('ws_reconnect_attempts', JSON.stringify(reconnectAttempts));
            
            // Use special priority reconnection for clinic staff
            reconnectTimeoutRef.current = window.setTimeout(() => {
              console.log('Clinic staff priority reconnection attempt');
              setReconnectAttempt(prevAttempt => prevAttempt + 1);
              // Will trigger connect() in useEffect
            }, clinicReconnectDelay);
            
            return;
          }
        }

        // Don't reconnect if we've explicitly flagged to skip reconnect
        if (skipReconnect) {
          console.log('Skipping WebSocket reconnect - manual disconnect or clinic mode active');
          return;
        }
        
        // Implement exponential backoff for reconnection attempts
        if (reconnectAttempt < maxReconnectAttempts) {
          // Calculate backoff time with jitter for reconnect attempts
          const baseDelay = Math.min(reconnectInterval * Math.pow(1.5, reconnectAttempt), 30000); // Max 30 seconds
          const jitter = Math.random() * 1000; // Add up to 1 second of jitter to prevent thundering herd
          const delay = baseDelay + jitter;
          
          console.log(`Attempting to reconnect in ${Math.round(delay)}ms (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})`);
          
          // Clear any existing timeout
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }
          
          // Set up the next reconnect attempt
          reconnectTimeoutRef.current = window.setTimeout(() => {
            setReconnectAttempt(prev => prev + 1);
            connect();
          }, delay);
        } else {
          // Log detailed diagnostic information about the failure
          const connectionInfo = {
            connectionId: connectionIdRef.current,
            userId: userId,
            isClinic: clinicModeRef.current,
            attempts: reconnectAttempt,
            maxAttempts: maxReconnectAttempts,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          };
          
          console.error(`WebSocket failed to reconnect after ${maxReconnectAttempts} attempts`, connectionInfo);
          
          // Track reconnection failure in session for debugging
          try {
            const failures = JSON.parse(sessionStorage.getItem('ws_reconnect_failures') || '[]');
            failures.push({
              connectionId: connectionIdRef.current,
              timestamp: Date.now(),
              attempts: reconnectAttempt
            });
            sessionStorage.setItem('ws_reconnect_failures', JSON.stringify(failures.slice(-5))); // Keep last 5
          } catch (e) {
            // Ignore storage errors
          }
          
          // Show toast notification for connection failures
          toast({
            title: 'Connection Issue',
            description: clinicModeRef.current 
              ? 'Lost connection to the server. Some real-time updates will be delayed until you refresh the page.' 
              : 'Lost connection to the server. Please refresh the page to reconnect.',
            variant: 'destructive',
            duration: 10000, // 10 seconds
          });
        }
      };

      socket.onerror = (error) => {
        console.error(`WebSocket ${connectionIdRef.current} error:`, error);
        
        if (onError) {
          onError(error);
        }
        
        // Log reconnect attempt warnings
        if (reconnectAttempt > 0) {
          console.warn(`WebSocket failure #${reconnectAttempt} at ${new Date().toISOString()}`);
        }
        
        // Show detailed error message for abnormal closures and network issues
        if (error.type === 'error') {
          console.warn(`⚠️ WebSocket abnormal closure (1006) detected for connection ${connectionIdRef.current}. This typically indicates network issues or server restart.`);
        }
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
      
      // Show error toast only for patient users, not clinic
      if (!isClinic) {
        toast({
          title: 'Connection Error',
          description: 'Failed to establish connection to the server. Some features may be unavailable.',
          variant: 'destructive',
        });
      }
      
      setSocket(null);
      setIsConnected(false);
    }
  }, [
    disableAutoConnect,
    isClinic,
    maxReconnectAttempts,
    onClose,
    onError,
    onMessage,
    onOpen,
    reconnectAttempt,
    reconnectInterval,
    toast,
    userId,
  ]);

  // Send a message through the WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    // Add timestamp and connection tracking info to message
    const enhancedMessage = {
      ...message,
      timestamp: Date.now(),
      connectionId: connectionIdRef.current,
      userId: userId,
      isClinic: clinicModeRef.current
    };
    
    // Log message for enhanced debugging
    if (message.type !== 'ping' && message.type !== 'pong') {
      console.log(`Sending WebSocket message [${message.type}] on connection ${connectionIdRef.current}`, 
        message.type === 'auth' ? '(auth message, details hidden)' : message);
    }
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      // If connected, send immediately
      socketRef.current.send(JSON.stringify(enhancedMessage));
      
      // Track message in session for debugging
      try {
        if (message.type !== 'ping' && message.type !== 'pong') {
          const sentMessages = JSON.parse(sessionStorage.getItem('ws_sent_messages') || '[]');
          if (sentMessages.length >= 20) sentMessages.shift(); // Keep last 20
          sentMessages.push({
            timestamp: Date.now(),
            type: message.type,
            connectionId: connectionIdRef.current
          });
          sessionStorage.setItem('ws_sent_messages', JSON.stringify(sentMessages));
        }
      } catch (e) {
        // Ignore storage errors
      }
    } else {
      // Otherwise, queue for later (maximum 50 messages to prevent memory issues)
      if (messageQueueRef.current.length < 50) {
        console.log(`WebSocket not connected, queueing message [${message.type}] (queue size: ${messageQueueRef.current.length + 1})`);
        messageQueueRef.current.push(enhancedMessage);
      } else {
        console.warn(`WebSocket message queue full (50), dropping message [${message.type}]`);
      }
    }
  }, [userId]);

  // Manual disconnect function - won't try to reconnect
  const disconnect = useCallback(() => {
    console.log(`Manually disconnecting WebSocket ${connectionIdRef.current}`);
    manualDisconnectRef.current = true;
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        // Send graceful disconnect notification to server
        console.log('Sending graceful disconnect signal to server');
        socketRef.current.send(JSON.stringify({
          type: 'disconnect',
          connectionId: connectionIdRef.current,
          userId: userId,
          isClinic: clinicModeRef.current,
          timestamp: new Date().toISOString()
        }));
        
        // Add small delay to allow server to process disconnect message
        setTimeout(() => {
          if (socketRef.current) {
            socketRef.current.onclose = null; // Prevent onclose from triggering reconnect
            socketRef.current.close(1000, 'Client initiated disconnect');
            socketRef.current = null;
          }
        }, 100);
      } catch (e) {
        console.error('Error sending disconnect message:', e);
        // Fall back to immediate close if message fails
        if (socketRef.current) {
          socketRef.current.onclose = null;
          socketRef.current.close();
          socketRef.current = null;
        }
      }
    } else if (socketRef.current) {
      // Socket exists but not in OPEN state
      socketRef.current.onclose = null;
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setSocket(null);
    setIsConnected(false);
    
    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, [userId]);

  // Force connect - will try to connect even after manual disconnect
  const forceConnect = useCallback(() => {
    manualDisconnectRef.current = false;
    setReconnectAttempt(0);
    connect();
  }, [connect]);

  // Initial connection
  useEffect(() => {
    // Update the clinic mode ref whenever isClinic changes
    clinicModeRef.current = isClinic;
    
    // Only connect automatically if not disabled
    if (!disableAutoConnect) {
      connect();
    }
    
    // Listen for manual WebSocket close events
    const handleManualClose = () => {
      disconnect();
    };
    
    // Set up event listener for component cleanup events
    const handleComponentCleanup = (event: CustomEvent) => {
      // Check if this cleanup is for our user
      if (event.detail && event.detail.userId === userId) {
        console.log(`Received cleanup event for user ${userId}`);
        disconnect();
      }
    };
    
    document.addEventListener('manual-websocket-close', handleManualClose);
    document.addEventListener('websocket-component-cleanup', handleComponentCleanup as EventListener);
    
    return () => {
      // Clean up on unmount using the improved disconnect method
      if (socketRef.current) {
        console.log(`Closing WebSocket ${connectionIdRef.current} on hook unmount`);
        // Use our enhanced disconnect method with proper server notification
        disconnect();
      }
      
      // Remove event listeners
      document.removeEventListener('manual-websocket-close', handleManualClose);
      document.removeEventListener('websocket-component-cleanup', handleComponentCleanup as EventListener);
    };
  }, [connect, disconnect, disableAutoConnect, isClinic, userId]);

  return {
    socket, 
    isConnected, 
    reconnectAttempt,
    sendMessage,
    disconnect,
    connect: forceConnect,
    connectionId: connectionIdRef.current
  };
}

export default useWebSocket;