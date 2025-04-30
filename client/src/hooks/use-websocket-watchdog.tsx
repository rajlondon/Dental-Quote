import { useEffect, useRef } from 'react';
import { useToast } from './use-toast';

/**
 * Safer connection watchdog that doesn't forcibly reload the page
 * This replaces the old watchdog that would cause refresh cycles
 */
export function useWebSocketWatchdog(
  socketRef: React.MutableRefObject<WebSocket | null>,
  isConnected: boolean,
  reconnectCallback: () => void
) {
  const { toast } = useToast();
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);
  
  // Clear any existing timers when component unmounts
  useEffect(() => {
    return () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
    };
  }, []);
  
  // Set up the safer watchdog timer
  useEffect(() => {
    // Skip watchdog completely for clinic portal
    const inClinicPortal = typeof window !== 'undefined' && 
                            (window.location.pathname === '/clinic-portal' || 
                             window.location.pathname === '/clinic');
    
    if (inClinicPortal) {
      console.log('Skipping WebSocket watchdog in clinic portal to prevent refresh issues');
      return;
    }
                             
    // Only run the watchdog if we're supposed to be connected but aren't
    if (!isConnected && socketRef.current) {
      // Clear any existing timers
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
      }
      
      // First check after 5 seconds
      watchdogTimerRef.current = setTimeout(() => {
        if (socketRef.current?.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection check: Not open, showing reconnect toast');
          reconnectAttemptRef.current++;
          
          // Show a toast with a reconnect option instead of forcing reload
          toast({
            title: 'Connection Issue',
            description: 'Connection to server was lost. Click to reconnect.',
            duration: 10000,
            action: (
              <button
                onClick={() => reconnectCallback()}
                className="bg-primary text-white px-3 py-1 rounded-md text-xs"
              >
                Reconnect
              </button>
            )
          });
          
          // Attempt to reconnect automatically as a fallback
          // but do NOT force a page reload
          reconnectCallback();
        }
      }, 5000);
      
      // If we're still disconnected after 10 seconds, try one more time
      setTimeout(() => {
        if (socketRef.current?.readyState !== WebSocket.OPEN) {
          console.log('WebSocket still disconnected after 10s, attempting final reconnect');
          reconnectCallback();
        }
      }, 10000);
    }
    
    // Clean up when connection state changes
    return () => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
    };
  }, [isConnected, socketRef, toast, reconnectCallback]);
  
  return reconnectAttemptRef.current;
}