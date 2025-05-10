import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  userId?: number;
  isClinic?: boolean;
  disableAutoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
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
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      // Close any existing socket before creating a new one
      if (socketRef.current) {
        socketRef.current.onclose = null; // Prevent onclose from triggering reconnect
        socketRef.current.close();
      }
      
      console.log(`Connecting to WebSocket at ${wsUrl} (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})`);
      
      // Generate a unique connection ID for this connection
      connectionIdRef.current = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // Log connection ID and details for debugging
      console.log(`WebSocket ${connectionIdRef.current} connecting...`);
      
      socket.onopen = () => {
        console.log(`WebSocket ${connectionIdRef.current} connected successfully`);
        setSocket(socket);
        setIsConnected(true);
        setReconnectAttempt(0);
        
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
          
          // Call onMessage callback if provided
          if (onMessage) {
            onMessage(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
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
          // Show toast notification for connection failures, but only for patient users
          if (!clinicModeRef.current) {
            toast({
              title: 'Connection Lost',
              description: 'Lost connection to the server. Please refresh the page to reconnect.',
              variant: 'destructive',
              duration: 10000, // 10 seconds
            });
          }
          console.error(`WebSocket failed to reconnect after ${maxReconnectAttempts} attempts`);
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
    // Add timestamp to message
    const timestampedMessage = {
      ...message,
      timestamp: Date.now(),
    };
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      // If connected, send immediately
      socketRef.current.send(JSON.stringify(timestampedMessage));
    } else {
      // Otherwise, queue for later
      console.log('WebSocket not connected, queueing message:', message.type);
      messageQueueRef.current.push(timestampedMessage);
    }
  }, []);

  // Manual disconnect function - won't try to reconnect
  const disconnect = useCallback(() => {
    console.log(`Manually disconnecting WebSocket ${connectionIdRef.current}`);
    manualDisconnectRef.current = true;
    
    if (socketRef.current) {
      socketRef.current.onclose = null; // Prevent onclose from triggering reconnect
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
  }, []);

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
      // Clean up on unmount
      if (socketRef.current) {
        console.log(`Closing WebSocket ${connectionIdRef.current} on hook unmount`);
        
        // Explicitly tell the server we're disconnecting to avoid reconnect problems
        if (socketRef.current.readyState === WebSocket.OPEN) {
          try {
            socketRef.current.send(JSON.stringify({
              type: 'disconnect',
              userId,
              connectionId: connectionIdRef.current,
              reason: 'component_unmount',
              timestamp: Date.now()
            }));
          } catch (e) {
            console.error('Error sending disconnect message:', e);
          }
        }
        
        socketRef.current.onclose = null; // Prevent onclose from triggering reconnect
        socketRef.current.close();
        socketRef.current = null;
      }
      
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
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