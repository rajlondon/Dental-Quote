import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useResilientWebSocket } from '@/hooks/use-resilient-websocket-fixed';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, ArrowUpDown, Info } from 'lucide-react';

interface Message {
  type: string;
  timestamp: number;
  content?: string;
  error?: boolean;
}

/**
 * Test page for the improved resilient WebSocket implementation
 * This demonstrates the use of WebSockets with HTTP long-polling fallback
 * Using our new implementation with circular dependency fixes
 */
export function ResilientWebSocketTest3() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageToSend, setMessageToSend] = useState('');
  
  // Define constant for options
  const useResilientMode = true;
  
  const { 
    isConnected, 
    reconnectAttempt, 
    connectionId,
    disconnect,
    connect,
    sendMessage,
    usingFallback 
  } = useResilientWebSocket({
    userId: 40, // Use a test user ID
    isClinic: true, // Test as clinic user
    debug: true, // Enable debug mode
    onMessage: (message) => {
      setMessages(prev => [
        { 
          type: message.type, 
          timestamp: Date.now(), 
          content: message.content || JSON.stringify(message) 
        },
        ...prev.slice(0, 19) // Keep last 20 messages
      ]);
    },
    onOpen: () => {
      setMessages(prev => [
        { type: 'connect', timestamp: Date.now(), content: 'Connected to server' },
        ...prev.slice(0, 19)
      ]);
    },
    onClose: () => {
      setMessages(prev => [
        { type: 'disconnect', timestamp: Date.now(), content: 'Disconnected from server', error: true },
        ...prev.slice(0, 19)
      ]);
    },
    onError: () => {
      setMessages(prev => [
        { type: 'error', timestamp: Date.now(), content: 'Connection error', error: true },
        ...prev.slice(0, 19)
      ]);
    },
  });

  const handleSendMessage = () => {
    if (!messageToSend.trim()) return;
    
    const message = {
      type: 'chat',
      content: messageToSend,
      timestamp: Date.now(),
      connectionId,
    };
    
    sendMessage(message);
    setMessages(prev => [
      { type: 'outgoing', timestamp: Date.now(), content: messageToSend },
      ...prev.slice(0, 19)
    ]);
    setMessageToSend('');
  };

  const pingServer = () => {
    sendMessage({
      type: 'ping',
      timestamp: Date.now(),
      connectionId,
    });
    
    setMessages(prev => [
      { type: 'outgoing', timestamp: Date.now(), content: 'Ping sent to server' },
      ...prev.slice(0, 19)
    ]);
  };

  // Add info about environment 
  const [envInfo, setEnvInfo] = useState({
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    userAgent: navigator.userAgent,
    time: new Date().toISOString()
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setEnvInfo(prev => ({
        ...prev,
        time: new Date().toISOString()
      }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Improved Resilient WebSocket Testing</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-medium text-blue-700">About This Page</h2>
        </div>
        <p className="mt-2 text-sm text-blue-600">
          This page demonstrates our improved resilient WebSocket solution with HTTP long-polling fallback. 
          This version fixes circular dependencies and improves error handling. If normal WebSockets fail, 
          the system will automatically switch to HTTP-based communication while maintaining the same API.
        </p>
        <div className="mt-3 text-xs font-mono text-blue-500 grid grid-cols-2 gap-x-4 gap-y-1">
          <div>Host: {envInfo.hostname}</div>
          <div>Protocol: {envInfo.protocol}</div>
          <div>Time: {new Date(envInfo.time).toLocaleTimeString()}</div>
          <div>Auto-fallback: {useResilientMode ? "Enabled" : "Disabled"}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              WebSocket Status
              {isConnected ? (
                <Badge className="ml-2 bg-green-500">Connected</Badge>
              ) : (
                <Badge className="ml-2 bg-red-500">Disconnected</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {isConnected 
                ? usingFallback 
                  ? "Connected via HTTP fallback (long-polling)"
                  : "Connected to server via WebSocket" 
                : "Not connected to server"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono">40</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">User Type:</span>
                <span className="font-mono">Clinic</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Connection ID:</span>
                <span className="font-mono text-xs truncate max-w-[200px]">{connectionId || "None"}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reconnect Attempts:</span>
                <span className={`font-mono ${
                  reconnectAttempt > 5 ? "text-red-500 font-bold" : reconnectAttempt > 2 ? "text-amber-500" : ""
                }`}>{reconnectAttempt}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transport Method:</span>
                <span className={`font-mono rounded px-2 py-0.5 text-xs ${
                  usingFallback 
                    ? "bg-amber-100 text-amber-800 border border-amber-300" 
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}>
                  {usingFallback ? "HTTP Fallback" : "WebSocket"}
                </span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={pingServer}
              disabled={!isConnected}
            >
              Ping Server
            </Button>
            
            {isConnected ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={disconnect}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={connect}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${reconnectAttempt > 0 ? "animate-spin" : ""}`} />
                Connect
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Send Message</CardTitle>
            <CardDescription>Send a test message to the server</CardDescription>
          </CardHeader>
          
          <CardContent className="pb-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={messageToSend}
                onChange={(e) => setMessageToSend(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Type a message..."
                disabled={!isConnected}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!isConnected || !messageToSend.trim()}
              >
                Send
              </Button>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <Button 
                variant={usingFallback ? "default" : "destructive"} 
                size="sm"
                onClick={() => {
                  // Test switching between WebSocket and HTTP fallback
                  if (usingFallback) {
                    // Force a WebSocket reconnect - add a notification
                    setMessages(prev => [
                      { type: 'system', timestamp: Date.now(), content: 'Attempting to switch back to WebSocket mode...' },
                      ...prev.slice(0, 19)
                    ]);
                    disconnect();
                    setTimeout(() => {
                      connect();
                    }, 500);
                  } else {
                    // Force fallback mode - add a notification
                    setMessages(prev => [
                      { type: 'system', timestamp: Date.now(), content: 'Forcing HTTP fallback mode...' },
                      ...prev.slice(0, 19)
                    ]);
                    // First disconnect
                    disconnect();
                    // Then force fallback mode by deliberately causing WebSocket to fail
                    setTimeout(() => {
                      // Try to connect with a deliberately invalid URL parameter
                      // This will trigger a WebSocket failure and fallback to HTTP
                      sendMessage({
                        type: 'force_fallback',
                        timestamp: Date.now(),
                        forceFailure: true
                      });
                    }, 500);
                  }
                }}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {usingFallback ? "Try WebSocket Mode" : "Force HTTP Fallback Mode"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>Recent messages and connection events</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No messages yet. Connect to the server to get started.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-md ${
                    message.error 
                      ? 'bg-red-50 border border-red-200' 
                      : message.type === 'connect' 
                        ? 'bg-green-50 border border-green-200'
                        : message.type === 'outgoing'
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.error ? (
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    ) : message.type === 'connect' ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : message.type === 'outgoing' ? (
                      <div className="h-4 w-4 rounded-full bg-blue-500 mr-2" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gray-500 mr-2" />
                    )}
                    <span className="text-sm font-medium">{message.type}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResilientWebSocketTest3;