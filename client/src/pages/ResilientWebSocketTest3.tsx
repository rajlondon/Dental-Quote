import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useResilientWebSocket } from '@/hooks/use-resilient-websocket-fixed';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, ArrowUpDown, Info, History } from 'lucide-react';

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
  const [eventLog, setEventLog] = useState<Array<{event: string, timestamp: number}>>([]);
  
  // Environment information for debugging
  const [envInfo, setEnvInfo] = useState({
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    userAgent: navigator.userAgent,
    time: new Date().toISOString()
  });
  
  // Log transport-related events
  const logEvent = useCallback((event: string) => {
    setEventLog(prev => [
      { event, timestamp: Date.now() },
      ...prev.slice(0, 19) // Keep last 20 events
    ]);
  }, []);
  
  // Define constant for options
  const useResilientMode = true;
  
  const { 
    isConnected, 
    reconnectAttempt, 
    connectionId,
    disconnect,
    connect,
    sendMessage,
    usingFallback,
    transportMethod,
    switchToWebSocket,
    switchToHttp,
    resetFailureCount
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

  // Add wrappers to log transport-related events
  const handleSwitchToWebSocket = useCallback(() => {
    logEvent("Manually switching to WebSocket transport");
    switchToWebSocket();
  }, [switchToWebSocket, logEvent]);
  
  const handleSwitchToHttp = useCallback(() => {
    logEvent("Manually switching to HTTP fallback transport");
    switchToHttp();
  }, [switchToHttp, logEvent]);
  
  const handleResetFailureCount = useCallback(() => {
    logEvent("Manually resetting transport failure count");
    resetFailureCount();
  }, [resetFailureCount, logEvent]);
  
  const handleConnect = useCallback(() => {
    logEvent("Manually initiating connection");
    connect();
  }, [connect, logEvent]);
  
  const handleDisconnect = useCallback(() => {
    logEvent("Manually disconnecting");
    disconnect();
  }, [disconnect, logEvent]);

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
    
    logEvent(`Sent message via ${transportMethod === 'http' ? 'HTTP' : 'WebSocket'}`);
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
    
    logEvent(`Sent ping via ${transportMethod === 'http' ? 'HTTP' : 'WebSocket'}`);
  };

  // Environment info was already defined at the top

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setEnvInfo((prev) => ({
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
          This page demonstrates our enhanced resilient WebSocket solution with HTTP long-polling fallback and smart 
          transport selection. This version fixes circular dependencies, improves error handling, and implements persistent 
          failure tracking to automatically select the most reliable transport method. The system now includes intelligent 
          rate limiting with priority handling for critical connections and better recovery strategies.
        </p>
        <p className="mt-2 text-sm text-blue-600">
          <strong>New Features:</strong> Smart failure tracking, automatic transport method switching based on connection 
          history, extended rate limiting window (60s) with higher request allowance (150), and enhanced visual indicators.
        </p>
        <div className="mt-3 text-xs font-mono text-blue-500 grid grid-cols-2 gap-x-4 gap-y-1">
          <div>Host: {envInfo.hostname}</div>
          <div>Protocol: {envInfo.protocol}</div>
          <div>Time: {new Date(envInfo.time).toLocaleTimeString()}</div>
          <div>Auto-fallback: {useResilientMode ? "Enabled" : "Disabled"}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transport Event Log
            </CardTitle>
            <CardDescription>
              Records of transport method changes and connection events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              {eventLog.length > 0 ? (
                <div className="space-y-2">
                  {eventLog.map((event, i) => (
                    <div 
                      key={i} 
                      className={`text-sm p-2 rounded ${
                        event.event.includes('error') || event.event.includes('failed')
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : event.event.includes('switch') || event.event.includes('transport')
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : event.event.includes('connect')
                              ? 'bg-green-50 text-green-800 border border-green-200'
                              : 'bg-gray-50 text-gray-800 border border-gray-200'
                      }`}
                    >
                      <span className="font-mono text-xs text-gray-500 mr-2">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      {event.event}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10">
                  No transport events recorded yet
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
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
                ? transportMethod === 'http'
                  ? "Connected via HTTP fallback (long-polling)"
                  : "Connected to server via WebSocket" 
                : "Not connected to server"}
            </CardDescription>
            
            <div className="mt-4">
              <div className={`text-sm px-3 py-2 rounded-md ${
                isConnected 
                  ? "bg-green-50 text-green-800 border border-green-200" 
                  : reconnectAttempt > 0
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-gray-50 text-gray-800 border border-gray-200"
              }`}>
                {isConnected 
                  ? `Connected via ${transportMethod === 'http' ? 'HTTP polling' : 'WebSocket'} (ID: ${connectionId})` 
                  : reconnectAttempt > 0
                    ? `Attempting to connect... (Attempt ${reconnectAttempt})`
                    : "Disconnected"}
              </div>
            </div>
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
                  transportMethod === 'http' 
                    ? "bg-amber-100 text-amber-800 border border-amber-300" 
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}>
                  {transportMethod === 'http' ? "HTTP Fallback" : "WebSocket"}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Failure Count:</span>
                <span className={`font-mono ${
                  (() => {
                    try {
                      const count = parseInt(localStorage.getItem('websocket_failure_count') || '0');
                      if (count > 5) return "text-red-600 font-semibold";
                      if (count > 2) return "text-amber-600";
                      return "";
                    } catch (e) {
                      return "";
                    }
                  })()
                }`}>
                  {(() => {
                    try {
                      const count = localStorage.getItem('websocket_failure_count');
                      return count ? `${count} failures` : "No failures";
                    } catch (e) {
                      return "N/A";
                    }
                  })()}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Auto-Selection:</span>
                <span className="font-mono">
                  {(() => {
                    try {
                      const count = parseInt(localStorage.getItem('websocket_failure_count') || '0');
                      if (count > 5) return "HTTP Preferred";
                      if (count > 2) return "WebSocket with Caution";
                      return "WebSocket Preferred";
                    } catch (e) {
                      return "N/A";
                    }
                  })()}
                </span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 items-stretch">
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={pingServer}
                disabled={!isConnected}
                className="flex-1"
              >
                Ping Server
              </Button>
              
              {isConnected ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisconnect}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleConnect}
                  className="flex-1"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${reconnectAttempt > 0 ? "animate-spin" : ""}`} />
                  Connect
                </Button>
              )}
            </div>
            
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => transportMethod === 'http' ? switchToWebSocket() : switchToHttp()}
                className="flex-1 flex items-center gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                {transportMethod === 'http' ? "Try WebSocket" : "Try HTTP Fallback"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetFailureCount()}
                className="flex-1 flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                Reset Failure Count
              </Button>
            </div>
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