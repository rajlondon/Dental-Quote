import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';
import clinicsData from '@/data/clinics.json';

// Interface for storing clinic lookup history
interface ClinicRoutingEvent {
  timestamp: string;
  clinicId: string;
  success: boolean;
  route: string;
}

/**
 * Hook for managing and tracking clinic routing
 * This provides enhanced debugging and fallback for clinic routing issues
 */
export const useClinicRouting = () => {
  const [, navigate] = useLocation();
  const [routingHistory, setRoutingHistory] = useState<ClinicRoutingEvent[]>([]);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Initialize WebSocket for routing diagnostics
  useEffect(() => {
    // Only create one WebSocket connection
    if (socket) return;

    // When in development mode, create a debug socket
    if (process.env.NODE_ENV !== 'production') {
      console.log('Initializing clinic routing diagnostic WebSocket');
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const newSocket = new WebSocket(wsUrl);
        
        newSocket.onopen = () => {
          console.log('Clinic routing diagnostic WebSocket connected');
          setIsWebSocketConnected(true);
          setSocket(newSocket);
          
          // Register with server for routing diagnostics
          newSocket.send(JSON.stringify({
            type: 'register',
            module: 'clinic_routing',
            clientId: `browser_${Date.now()}`
          }));
        };
        
        newSocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle direct navigation commands
            if (data.type === 'navigate' && data.target) {
              console.log(`Clinic routing WebSocket received navigation command: ${data.target}`);
              navigate(data.target);
            }
            
            // Handle clinic direct access
            if (data.type === 'clinic_access' && data.clinicId) {
              console.log(`Clinic routing WebSocket received direct clinic access: ${data.clinicId}`);
              navigateToClinic(data.clinicId);
            }
          } catch (err) {
            console.error('Error processing WebSocket message', err);
          }
        };
        
        newSocket.onclose = () => {
          console.log('Clinic routing diagnostic WebSocket closed');
          setIsWebSocketConnected(false);
          setSocket(null);
        };
        
        newSocket.onerror = (error) => {
          console.error('Clinic routing diagnostic WebSocket error:', error);
          setIsWebSocketConnected(false);
        };
        
        // Clean up the WebSocket on unmount
        return () => {
          if (newSocket && newSocket.readyState === WebSocket.OPEN) {
            newSocket.close();
          }
        };
      } catch (err) {
        console.error('Error initializing clinic routing WebSocket:', err);
      }
    }
  }, [navigate, socket]);

  // Function to navigate to a clinic by ID
  const navigateToClinic = (clinicId: string) => {
    if (!clinicId) {
      console.error('Cannot navigate to clinic: No clinic ID provided');
      return false;
    }
    
    // Try to find the clinic in our local data
    const clinic = clinicsData.find(c => c.id === clinicId);
    
    // Record the routing attempt
    const event: ClinicRoutingEvent = {
      timestamp: new Date().toISOString(),
      clinicId,
      success: !!clinic,
      route: `/clinic/${clinicId}`
    };
    
    // Add to routing history
    setRoutingHistory(prev => [...prev, event]);
    
    // Log the routing attempt
    console.log(`Navigating to clinic: ${clinicId}`, { clinic: clinic?.name || 'Not found' });
    
    // If we found the clinic, navigate to it
    if (clinic) {
      navigate(`/clinic/${clinicId}`);
      
      // If WebSocket is connected, send a routing event
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'clinic_routing',
          event: 'navigation',
          clinicId,
          success: true,
          timestamp: Date.now()
        }));
      }
      
      return true;
    } else {
      // If we didn't find the clinic, show an error
      console.error(`Clinic not found: ${clinicId}`);
      toast({
        title: 'Clinic Not Found',
        description: `We couldn't find a clinic with ID: ${clinicId}`,
        variant: 'destructive'
      });
      
      // If WebSocket is connected, send a routing failure event
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'clinic_routing',
          event: 'navigation_failed',
          clinicId,
          reason: 'clinic_not_found',
          timestamp: Date.now()
        }));
      }
      
      return false;
    }
  };

  // Return the hook utilities
  return {
    navigateToClinic,
    routingHistory,
    isWebSocketConnected,
    clearHistory: () => setRoutingHistory([])
  };
};