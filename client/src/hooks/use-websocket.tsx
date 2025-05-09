import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { useWebSocketWatchdog } from './use-websocket-watchdog';

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
  const isComponentMounted = useRef(true);
  
  // Track additional state
  const connectionIdRef = useRef<string>(`ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  const reconnectCountRef = useRef(0);
  const lastSuccessfulConnectionRef = useRef<number | null>(null);
  
  // Function to initialize WebSocket connection with improved error handling
  const initializeSocket = useCallback(() => {
    if (!user || !isComponentMounted.current) {
      // No WebSocket connection if not authenticated or if component is unmounting
      console.log('Skipping WebSocket initialization - user not available or component unmounting');
      return;
    }
    
    try {
      // Check for global connection throttling
      // If we had rapid connection failures, wait for a cooling-off period
      const lastFailureTime = parseInt(sessionStorage.getItem('ws_last_failure_time') || '0', 10);
      const currentTime = Date.now();
      const timeSinceLastFailure = currentTime - lastFailureTime;
      const consecutiveFailures = parseInt(sessionStorage.getItem('ws_consecutive_failures') || '0', 10);
      
      // If we've had multiple failures in rapid succession, implement an exponential backoff
      if (consecutiveFailures > 2 && timeSinceLastFailure < 30000) {
        // Exponential backoff based on failure count (max 30 seconds)
        const backoffDelay = Math.min(1000 * Math.pow(1.5, consecutiveFailures), 30000);
        const remainingCooldown = Math.max(0, backoffDelay - timeSinceLastFailure);
        
        if (remainingCooldown > 0) {
          console.warn(`Connection throttling active. ${consecutiveFailures} consecutive failures, waiting ${remainingCooldown}ms before next attempt`);
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isComponentMounted.current) {
              console.log('Cooling-off period complete, attempting connection');
              initializeSocket();
            }
          }, remainingCooldown);
          
          return;
        }
      }
      
      // Clean up any existing connection first
      if (socketRef.current) {
        // Mark for manual close to prevent reconnect loop
        (socketRef.current as any)._manualClose = true;
        
        if (socketRef.current.readyState === WebSocket.OPEN || 
            socketRef.current.readyState === WebSocket.CONNECTING) {
          console.log('Closing existing socket before creating new one');
          socketRef.current.close(1000, "Creating new connection");
        }
        
        // Always reset reference to avoid memory leak
        socketRef.current = null;
      }
      
      // Create timestamp for this connection attempt
      const connectionAttemptTime = Date.now();
      
      // Check individual connection rate limiting
      if (lastSuccessfulConnectionRef.current) {
        const timeSinceLastConnection = connectionAttemptTime - lastSuccessfulConnectionRef.current;
        
        // If we're attempting to reconnect too quickly (within 2 seconds), add a delay
        if (timeSinceLastConnection < 2000) {
          console.log(`Connection attempts too frequent (${timeSinceLastConnection}ms apart). Adding delay.`);
          const delayTime = 2000 - timeSinceLastConnection;
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isComponentMounted.current) {
              // Try again after delay
              initializeSocket();
            }
          }, delayTime);
          
          return;
        }
      }
      
      // Determine correct protocol based on HTTPS/HTTP
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log(`WebSocket attempt #${reconnectCountRef.current + 1} at ${new Date().toISOString()}`);
      
      // Create connection with timeout protection
      let connectionTimeoutId: NodeJS.Timeout | null = setTimeout(() => {
        console.log('WebSocket connection attempt timed out');
        if (socketRef.current && socketRef.current.readyState === WebSocket.CONNECTING) {
          // Close the hanging connection
          socketRef.current.close();
          socketRef.current = null;
          
          // Update reconnect count and schedule retry
          reconnectCountRef.current++;
          
          if (reconnectCountRef.current < 3 && isComponentMounted.current) {
            console.log('Scheduling another connection attempt after timeout');
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isComponentMounted.current) {
                initializeSocket();
              }
            }, 3000);
          }
        }
      }, 10000); // 10 second connection timeout
      
      // Create new WebSocket connection
      const socket = new WebSocket(wsUrl);
      socket.binaryType = 'blob';
      socketRef.current = socket;
      
      // Create unique ID for this connection instance
      const thisConnectionId = connectionIdRef.current;
      (socket as any)._connectionId = thisConnectionId;
      
      socket.addEventListener('open', () => {
        // Clear the connection timeout
        if (connectionTimeoutId) {
          clearTimeout(connectionTimeoutId);
          connectionTimeoutId = null;
        }
        
        console.log(`WebSocket connection ${thisConnectionId} established`);
        
        // Reset the consecutive failures counter on successful connection
        sessionStorage.setItem('ws_consecutive_failures', '0');
        
        // Only update state if this is still the current socket
        if (isComponentMounted.current && 
            socketRef.current === socket && 
            (socketRef.current as any)._connectionId === thisConnectionId) {
          setConnected(true);
          
          // Track successful connection
          lastSuccessfulConnectionRef.current = Date.now();
          reconnectCountRef.current = 0;
          
          // Register client with the server
          socket.send(JSON.stringify({
            type: 'register',
            sender: {
              id: user.id.toString(),
              type: user.role
            }
          }));
          
          // Log connection success with readable timestamp for correlation with server logs
          console.log(`WebSocket registered client ${user.id} (${user.role}) at ${new Date().toISOString()}`);
        }
      });
      
      socket.addEventListener('message', (event) => {
        try {
          // Check if this is from the current socket
          if (socketRef.current !== socket || (socket as any)._connectionId !== thisConnectionId) {
            console.log('Ignoring message from obsolete socket connection');
            return;
          }
          
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Only update state if component is still mounted
          if (isComponentMounted.current) {
            setLastMessage(message);
          }
          
          // Handle connection confirmation
          if (message.type === 'connection' || message.type === 'registered') {
            console.log('WebSocket registration confirmed:', message.message);
            return;
          }
          
          // Handle error messages
          if (message.type === 'error') {
            console.error('WebSocket error:', message.message);
            if (isComponentMounted.current) {
              toast({
                title: 'Connection Error',
                description: message.message || 'Unknown error occurred',
                variant: 'destructive'
              });
            }
            return;
          }
          
          // Dispatch message to the appropriate handler if component still mounted
          if (isComponentMounted.current) {
            const handler = messageHandlersRef.current[message.type];
            if (handler) {
              handler(message);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
      
      socket.addEventListener('close', (event) => {
        // Clear the connection timeout if it's still active
        if (connectionTimeoutId) {
          clearTimeout(connectionTimeoutId);
          connectionTimeoutId = null;
        }
        
        console.log(`WebSocket connection ${thisConnectionId} closed with code ${event.code}:`, event.reason || 'No reason provided');
        
        // Track consecutive failures for throttling
        const isAbnormalClosure = (event.code !== 1000 && !event.wasClean);
        if (isAbnormalClosure) {
          // Track failure in session storage for global connection throttling
          const currentTime = Date.now();
          sessionStorage.setItem('ws_last_failure_time', currentTime.toString());
          
          const consecutiveFailures = parseInt(sessionStorage.getItem('ws_consecutive_failures') || '0', 10);
          sessionStorage.setItem('ws_consecutive_failures', (consecutiveFailures + 1).toString());
          
          console.warn(`WebSocket failure #${consecutiveFailures + 1} at ${new Date(currentTime).toISOString()}`);
        } else {
          // Reset consecutive failures on clean closure
          sessionStorage.setItem('ws_consecutive_failures', '0');
        }
        
        // Log special case for abnormal closure
        if (event.code === 1006) {
          console.warn(`⚠️ WebSocket abnormal closure (1006) detected for connection ${thisConnectionId}. This typically indicates network issues or server restart.`);
        }
        
        // Only update state if this is still the current socket and component is mounted
        if (isComponentMounted.current && 
            socketRef.current === socket && 
            (socketRef.current as any)._connectionId === thisConnectionId) {
          
          setConnected(false);
          
          // Check if this was a manual close (triggered during logout)
          const wasManualClose = (socket as any)._manualClose === true;
          
          // Special check for clinic portal to prevent automatic reconnects
          const inClinicPortal = typeof window !== 'undefined' && 
                                 (window.location.pathname.includes('clinic-portal') || 
                                  window.location.pathname.includes('/clinic'));
          
          // Determine if we should skip reconnection
          // We skip if:
          // 1. Manual close was requested (logout)
          // 2. In clinic portal (to prevent refresh cycles)
          // 3. Normal closure with code 1000 (intentional server or client disconnect)
          // 4. Policy violation (1008) or authentication issues (4001-4003)
          const skipReconnect = wasManualClose || 
                               inClinicPortal || 
                               event.code === 1000 || 
                               event.code === 1008 || 
                               (event.code >= 4001 && event.code <= 4003);
          
          if (skipReconnect) {
            console.log(`WebSocket ${thisConnectionId} closed - skip reconnect - Manual: ${wasManualClose}, Clinic: ${inClinicPortal}, Code: ${event.code}`);
            socketRef.current = null;
            
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
              reconnectTimeoutRef.current = null;
            }
            return;
          }
          
          // Only attempt to reconnect if we have a valid user and component is still mounted
          if (user && isComponentMounted.current) {
            // Determine reconnection priority based on close code
            let isHighPriority = false;
            
            // High priority reconnection for specific close codes indicating temporary issues:
            // - 1001: Going away (server restart)
            // - 1006: Abnormal closure (network interruption)
            // - 1012: Service restart
            // - 1013: Try again later
            if ([1001, 1006, 1012, 1013].includes(event.code)) {
              isHighPriority = true;
            }
            
            // Increment reconnect count
            reconnectCountRef.current++;
            
            // Calculate backoff delay (gradually increasing with each attempt)
            // For high priority issues, use shorter delays
            const baseDelay = isHighPriority ? 1000 : 2000;
            const maxReconnectAttempts = isHighPriority ? 10 : 5;
            const reconnectDelay = Math.min(baseDelay + (reconnectCountRef.current * 1000), 15000);
            
            console.log(`Scheduling reconnect attempt #${reconnectCountRef.current} in ${reconnectDelay}ms (priority: ${isHighPriority ? 'high' : 'normal'})`);
            
            // Clear any existing reconnect timeout
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            
            // Stop trying after too many attempts
            if (reconnectCountRef.current > maxReconnectAttempts) {
              console.warn(`Giving up reconnection after ${maxReconnectAttempts} attempts`);
              
              // Notify user of persistent connection issues
              if (isComponentMounted.current) {
                toast({
                  title: 'Connection Issue',
                  description: 'Unable to maintain connection to the server. Please try refreshing the page.',
                  variant: 'destructive'
                });
              }
              
              reconnectTimeoutRef.current = null;
              return;
            }
            
            // Set reconnect timeout
            reconnectTimeoutRef.current = setTimeout(() => {
              // Only reconnect if component is still mounted
              if (isComponentMounted.current) {
                console.log(`Executing reconnect attempt #${reconnectCountRef.current}`);
                initializeSocket();
              }
            }, reconnectDelay);
          }
        }
      });
      
      socket.addEventListener('error', (error) => {
        console.error(`WebSocket ${thisConnectionId} error:`, error);
        
        // Track error in application monitoring
        try {
          // Add timestamp and user info for better debugging
          const errorInfo = {
            timestamp: new Date().toISOString(),
            connectionId: thisConnectionId,
            userId: user?.id,
            userType: user?.role,
            url: window.location.href,
            readyState: socket.readyState,
            errorType: (error as any)?.type || 'unknown'
          };
          
          console.error('WebSocket error details:', errorInfo);
          
          // Store the error timestamp in sessionStorage to avoid showing too many error messages
          const lastErrorTime = parseInt(sessionStorage.getItem('ws_last_error_time') || '0', 10);
          const currentTime = Date.now();
          const showErrorMessage = (currentTime - lastErrorTime) > 10000; // Only show error message every 10 seconds
          
          // Only show toast if this is the current socket, component is mounted, and we haven't shown errors recently
          if (isComponentMounted.current && 
              socketRef.current === socket && 
              (socketRef.current as any)._connectionId === thisConnectionId &&
              showErrorMessage) {
            
            // Update the last error time
            sessionStorage.setItem('ws_last_error_time', currentTime.toString());
            
            toast({
              title: 'Connection Issue',
              description: 'Experiencing network connectivity issues. Attempting to reconnect...',
              variant: 'destructive',
              duration: 5000
            });
            
            // Force close and attempt to reconnect if socket is in a bad state after error
            // This helps prevent sockets getting stuck in error states
            if (socket.readyState !== WebSocket.CLOSED && socket.readyState !== WebSocket.CLOSING) {
              try {
                console.log(`Forcibly closing WebSocket after error, readyState: ${socket.readyState}`);
                socket.close(3000, "Error recovery");
              } catch (closeError) {
                console.error('Error while trying to close socket after error:', closeError);
              }
            }
          }
        } catch (handlerError) {
          console.error('Error in WebSocket error handler:', handlerError);
        }
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
  
  // Shared WebSocket connection tracking across components
  const getSharedConnectionState = () => {
    // Check for a global connection pool to prevent duplicate connections
    if (!(window as any).__websocketConnections) {
      (window as any).__websocketConnections = {};
      (window as any).__websocketLastActivity = {};
    }
    return {
      connections: (window as any).__websocketConnections,
      lastActivity: (window as any).__websocketLastActivity
    };
  };
  
  // Initialize WebSocket on login - with improved refresh prevention
  useEffect(() => {
    // Special case: if we're on the clinic portal, don't auto-connect WebSockets
    // This helps prevent refresh cycles
    if (typeof window !== 'undefined' && 
        window.location.pathname.includes('clinic-portal') &&
        !initialConnectionMadeRef.current) {
      console.log('CLINIC PORTAL OPTIMIZATION: Delaying WebSocket connection to prevent refresh cycles');
      
      // Set a small timeout before attempting to connect
      setTimeout(() => {
        initialConnectionMadeRef.current = true;
        console.log('Safe to initialize WebSocket now on clinic portal');
      }, 2000);
      
      return;
    }
    
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
      // Check if another component already has an active WebSocket connection for this user
      const { connections, lastActivity } = getSharedConnectionState();
      const userKey = `user-${user.id}`;
      const hasExistingConnection = connections[userKey] && 
                                   (Date.now() - (lastActivity[userKey] || 0)) < 30000; // Connection activity in last 30 seconds
      
      if (hasExistingConnection) {
        console.log(`Reusing existing WebSocket connection for user ${user.id}`);
        // Mark our usage of the shared connection
        lastActivity[userKey] = Date.now();
        
        // Still set connected state to true since we're reusing a connection
        if (isComponentMounted.current) {
          setConnected(true);
          initialConnectionMadeRef.current = true;
        }
        return;
      }
      
      // Only initialize if not already connected and we haven't tried too many times
      if (!initialConnectionMadeRef.current && connectionAttemptCountRef.current < 2) {
        console.log(`WebSocket initialization attempt #${connectionAttemptCountRef.current + 1}`);
        connectionAttemptCountRef.current++;
        
        // Add a slight delay before connecting to avoid race conditions
        const timeoutId = setTimeout(() => {
          console.log("Initializing WebSocket connection for user:", user.id);
          initializeSocket();
          initialConnectionMadeRef.current = true;
          
          // Register as an active connection
          const { connections, lastActivity } = getSharedConnectionState();
          connections[userKey] = true;
          lastActivity[userKey] = Date.now();
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
  
  // Listen for external component unmount events
  useEffect(() => {
    const handleWebSocketCleanup = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && user && customEvent.detail.userId == user.id) {
        console.log(`Received external cleanup request for user ${user.id}`);
        // Force close any open connections
        if (socketRef.current) {
          (socketRef.current as any)._manualClose = true;
          if (socketRef.current.readyState === WebSocket.OPEN || 
              socketRef.current.readyState === WebSocket.CONNECTING) {
            socketRef.current.close(1000, "Component cleanup requested");
          }
          socketRef.current = null;
        }
      }
    };
    
    // Add event listener for component cleanup events
    document.addEventListener('websocket-component-cleanup', handleWebSocketCleanup);
    
    return () => {
      document.removeEventListener('websocket-component-cleanup', handleWebSocketCleanup);
    };
  }, [user]);
  
  // Cleanup on unmount
  useEffect(() => {
    // Set as mounted
    isComponentMounted.current = true;
    
    // Generate a new connection ID for this component instance
    connectionIdRef.current = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Register time of component mount to help with race conditions
    (window as any).__lastWebSocketMountTime = Date.now();
    
    // Comprehensive cleanup on unmount
    return () => {
      console.log(`WebSocket hook unmounting with connection ID: ${connectionIdRef.current}`);
      
      // Mark component as unmounted to prevent state updates
      isComponentMounted.current = false;
      
      // Record time of unmount to ensure cleanup doesn't interfere with new mounts
      (window as any).__lastWebSocketUnmountTime = Date.now();
      
      // Clear all timers
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Check if we should preserve the connection
      if (user) {
        const { connections, lastActivity } = getSharedConnectionState();
        const userKey = `user-${user.id}`;
        
        // Update last activity timestamp on unmount
        if (connections[userKey]) {
          console.log(`Preserving WebSocket connection for user ${user.id} (other components may be using it)`);
          lastActivity[userKey] = Date.now();
          
          // Don't close the socket, just update our state
          setConnected(false);
          return;
        }
      }
      
      // Close any active socket connections if no other components are using it
      if (socketRef.current) {
        try {
          // Mark as manually closed to prevent reconnect attempts
          (socketRef.current as any)._manualClose = true;
          
          // Only try to close if not already closed/closing
          if (socketRef.current.readyState === WebSocket.OPEN || 
              socketRef.current.readyState === WebSocket.CONNECTING) {
            console.log('Closing WebSocket during component unmount');
            socketRef.current.close(1000, "Component unmount");
          }
        } catch (err) {
          console.error('Error closing WebSocket during unmount:', err);
        } finally {
          // Always null the reference
          socketRef.current = null;
        }
      }
      
      // Reset state tracking
      initialConnectionMadeRef.current = false;
      connectionAttemptCountRef.current = 0;
      reconnectCountRef.current = 0;
    };
  }, [user]);
  
  // Function to send message through WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    // Add retry logic for sending messages
    const attemptSend = (attempt: number = 0, maxAttempts: number = 3) => {
      // If we've exhausted retries, notify the user
      if (attempt >= maxAttempts) {
        console.error(`Failed to send message after ${maxAttempts} attempts`);
        toast({
          title: 'Connection Error',
          description: 'Failed to send message after multiple attempts. Please try again later.',
          variant: 'destructive'
        });
        return;
      }
      
      // If not connected, try to force a new connection
      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        console.log(`WebSocket not ready (attempt ${attempt + 1}/${maxAttempts}), status: ${socketRef.current?.readyState}`);
        
        // For first attempt, try to reconnect immediately
        if (attempt === 0) {
          console.log('Attempting to reconnect WebSocket...');
          initializeSocket(); // Try to reestablish connection
          
          // Try again after a short delay
          setTimeout(() => attemptSend(attempt + 1, maxAttempts), 1000);
          return;
        } else {
          // For subsequent attempts, use longer backoff
          setTimeout(() => attemptSend(attempt + 1, maxAttempts), 2000 * attempt);
          return;
        }
      }
      
      try {
        // Ensure sender information is included
        if (!message.sender && user) {
          message.sender = {
            id: user.id.toString(),
            type: user.role as 'patient' | 'clinic' | 'admin'
          };
        }
        
        // Track message in session storage to detect duplicates
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const messageToSend = { ...message, _messageId: messageId };
        
        // Add to pending messages
        const pendingMessages = JSON.parse(sessionStorage.getItem('pendingWebSocketMessages') || '{}');
        pendingMessages[messageId] = {
          timestamp: Date.now(),
          attempt: attempt + 1
        };
        sessionStorage.setItem('pendingWebSocketMessages', JSON.stringify(pendingMessages));
        
        // Send the message
        socketRef.current.send(JSON.stringify(messageToSend));
        console.log(`Message sent (attempt ${attempt + 1}): ${messageId}`);
        
        // Consider message sent successfully
        return true;
      } catch (error) {
        console.error(`Error sending message (attempt ${attempt + 1}):`, error);
        
        // Try again with backoff
        setTimeout(() => attemptSend(attempt + 1, maxAttempts), 2000 * attempt);
      }
    };
    
    // Start the send attempt sequence
    return attemptSend(0);
  }, [user, toast, initializeSocket]);
  
  // Register a message handler for a specific message type
  const registerMessageHandler = useCallback((type: string, handler: MessageHandler) => {
    messageHandlersRef.current[type] = handler;
    
    // Log registration for debugging
    if (type === 'special_offer_updated') {
      console.log('🔄 Registered enhanced handler for special offer updates with forced browser cache clearing');
    }
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