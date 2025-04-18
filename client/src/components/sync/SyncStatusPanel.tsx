import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import useDataSync from '@/hooks/useDataSync';

interface SyncStatusPanelProps {
  userId: string;
  userType: 'patient' | 'clinic' | 'admin';
  targetId?: string;
  name: string;
}

interface SyncEvent {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  status: 'success' | 'error' | 'pending';
}

const SyncStatusPanel: React.FC<SyncStatusPanelProps> = ({ 
  userId, 
  userType, 
  targetId,
  name
}) => {
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [showEvents, setShowEvents] = useState(false);
  
  // Use our data sync hook
  const { isConnected, lastError, sendMessage, reconnect } = useDataSync({
    userId,
    userType,
    onMessage: (message) => {
      handleIncomingMessage(message);
    }
  });
  
  // Handle incoming messages from the WebSocket
  const handleIncomingMessage = (message: any) => {
    const newEvent: SyncEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date(),
      type: message.type,
      description: getMessageDescription(message),
      status: 'success'
    };
    
    setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events
  };
  
  // Helper to generate a human-readable message description
  const getMessageDescription = (message: any): string => {
    switch (message.type) {
      case 'sync_appointment':
        return `Appointment ${message.payload.action || 'updated'}: ${message.payload.date || 'Unknown date'}`;
      case 'treatment_update':
        return `Treatment progress update: ${message.payload.status || 'Status changed'}`;
      case 'message':
        return `Message from ${message.sender?.type || 'unknown'}: ${message.payload.text?.substring(0, 30) || 'No content'}...`;
      default:
        return `${message.type} event received`;
    }
  };
  
  // Add a test event to demonstrate functionality
  const addTestEvent = (type: string, success: boolean = true) => {
    const newEvent: SyncEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date(),
      type,
      description: `Test ${type} event ${success ? 'succeeded' : 'failed'}`,
      status: success ? 'success' : 'error'
    };
    
    setEvents(prev => [newEvent, ...prev].slice(0, 50));
    
    // If it's a test send event, actually send a test message via WebSocket
    if (type === 'send' && success && targetId) {
      sendMessage({
        type: 'message',
        payload: {
          text: `Test message from ${userType} ${name} at ${new Date().toLocaleTimeString()}`,
          timestamp: new Date().toISOString()
        },
        target: targetId
      });
    }
  };
  
  // Load initial events if needed
  useEffect(() => {
    // Initialize with a connection event
    const initialEvent: SyncEvent = {
      id: `evt-init-${Date.now()}`,
      timestamp: new Date(),
      type: 'connection',
      description: 'Initializing data sync connection...',
      status: 'pending'
    };
    
    setEvents([initialEvent]);
  }, []);
  
  // Update connection status events
  useEffect(() => {
    if (isConnected) {
      addTestEvent('connection', true);
    } else if (lastError) {
      addTestEvent('connection', false);
    }
  }, [isConnected, lastError]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Synchronization</CardTitle>
            <CardDescription>
              {userType === 'patient' ? 'Your data is synced with your dental clinic' : 'Patient data synchronization status'}
            </CardDescription>
          </div>
          <Badge 
            variant={isConnected ? "default" : "destructive"}
            className="ml-2"
          >
            {isConnected ? (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                <span>Disconnected</span>
              </div>
            )}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">
                {userType === 'patient' 
                  ? `Connected as Patient: ${name}`
                  : `Connected as Clinic: ${name}`
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {userType === 'patient' 
                  ? 'Your data is securely shared with your dental provider'
                  : 'Access to patient data is logged and secure'
                }
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              disabled={isConnected}
              onClick={reconnect}
            >
              {isConnected ? (
                <CheckCircle2 className="h-4 w-4 mr-1" />
              ) : (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              )}
              {isConnected ? 'Connected' : 'Reconnect'}
            </Button>
          </div>
          
          {targetId && (
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addTestEvent('send', true)}
                disabled={!isConnected}
              >
                Send Test Message
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEvents(!showEvents)}
              >
                {showEvents ? 'Hide Activity' : 'Show Activity'}
              </Button>
            </div>
          )}
          
          {showEvents && events.length > 0 && (
            <div className="mt-4 border rounded-md p-2 h-[200px] overflow-y-auto">
              <h4 className="text-sm font-semibold mb-2">Sync Activity Log</h4>
              <ul className="space-y-2">
                {events.map(event => (
                  <li key={event.id} className="text-xs border-b pb-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{event.type}</span>
                      <span className="text-muted-foreground">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {event.status === 'success' && (
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                      )}
                      {event.status === 'error' && (
                        <XCircle className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      {event.status === 'pending' && (
                        <Loader2 className="h-3 w-3 text-blue-500 animate-spin mr-1" />
                      )}
                      <span>{event.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/50 border-t px-6 py-3">
        <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
          <div>
            Sync Interval: <span className="font-medium">30 seconds</span>
          </div>
          <div>
            {isConnected 
              ? 'All changes are synchronized in real-time' 
              : 'Changes will sync when connection is restored'
            }
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SyncStatusPanel;