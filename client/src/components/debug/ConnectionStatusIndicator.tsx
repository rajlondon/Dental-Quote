import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import useWebSocket from '@/hooks/use-websocket';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

/**
 * WebSocket connection status indicator component for debugging
 * Provides visual feedback about the current WebSocket connection state
 * Demonstrates the proper use of the useWebSocket hook's disconnect and connect methods
 */
export function ConnectionStatusIndicator({ 
  userId, 
  isClinic = false
}: { 
  userId?: number;
  isClinic?: boolean;
}) {
  const [messages, setMessages] = React.useState<Array<{ type: string; timestamp: number; text: string }>>([]);

  // Use the WebSocket hook with proper reconnection handling
  const { 
    isConnected, 
    reconnectAttempt, 
    connectionId,
    disconnect,
    connect,
    sendMessage 
  } = useWebSocket({
    userId,
    isClinic,
    onMessage: (message) => {
      setMessages(prev => [
        { 
          type: message.type, 
          timestamp: Date.now(), 
          text: JSON.stringify(message).substring(0, 50) + '...'
        },
        ...prev.slice(0, 9) // Keep last 10 messages
      ]);
    },
    onOpen: () => {
      setMessages(prev => [
        { type: 'system', timestamp: Date.now(), text: 'Connection opened' },
        ...prev.slice(0, 9)
      ]);
    },
    onClose: () => {
      setMessages(prev => [
        { type: 'system', timestamp: Date.now(), text: 'Connection closed' },
        ...prev.slice(0, 9)
      ]);
    },
    onError: () => {
      setMessages(prev => [
        { type: 'error', timestamp: Date.now(), text: 'Connection error' },
        ...prev.slice(0, 9)
      ]);
    }
  });

  // Send a test ping message to the server
  const handlePing = () => {
    sendMessage({ type: 'ping' });
    setMessages(prev => [
      { type: 'outgoing', timestamp: Date.now(), text: 'Ping sent' },
      ...prev.slice(0, 9)
    ]);
  };

  // Perform a graceful disconnect
  const handleDisconnect = () => {
    setMessages(prev => [
      { type: 'outgoing', timestamp: Date.now(), text: 'Disconnect requested' },
      ...prev.slice(0, 9)
    ]);
    disconnect();
  };

  // Reconnect to the server
  const handleConnect = () => {
    setMessages(prev => [
      { type: 'outgoing', timestamp: Date.now(), text: 'Connect requested' },
      ...prev.slice(0, 9)
    ]);
    connect();
  };

  return (
    <Card className="w-[450px] shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          WebSocket Status
          <Badge 
            variant={isConnected ? "success" : "destructive"}
            className="ml-2 px-3 py-1"
          >
            {isConnected ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <XCircle className="h-4 w-4 mr-1" />
            )}
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
        <CardDescription>
          {isConnected 
            ? `Connected with ID: ${connectionId}`
            : reconnectAttempt > 0 
              ? `Attempting to reconnect (${reconnectAttempt})...` 
              : 'Not connected to server'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">User ID:</span>
            <span className="font-mono">{userId || 'Not set'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">User Type:</span>
            <span className="font-mono">{isClinic ? 'Clinic' : 'Patient'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Connection ID:</span>
            <span className="font-mono truncate max-w-[250px]">{connectionId || 'None'}</span>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <h4 className="text-sm font-semibold mb-2">Message History</h4>
        <div className="bg-muted rounded-md p-2 h-[150px] overflow-y-auto text-xs">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No messages received yet
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start ${
                  msg.type === 'error' ? 'text-destructive' : 
                  msg.type === 'system' ? 'text-muted-foreground' :
                  msg.type === 'outgoing' ? 'text-blue-500' : ''
                }`}>
                  {msg.type === 'error' && <AlertCircle className="h-3 w-3 mr-1 mt-0.5" />}
                  {msg.type === 'system' && <RefreshCw className="h-3 w-3 mr-1 mt-0.5" />}
                  <span className="font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString()}: {msg.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePing}
            disabled={!isConnected}
          >
            Ping Server
          </Button>
          
          {isConnected ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleConnect}
            >
              Connect
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default ConnectionStatusIndicator;