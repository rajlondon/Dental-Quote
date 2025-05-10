import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useResilientWebSocket } from '@/hooks/use-resilient-websocket-new';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, ArrowUpDown, Info } from 'lucide-react';

interface Message {
  type: string;
  timestamp: number;
  content?: string;
  error?: boolean;
}

/**
 * Test page for the resilient WebSocket implementation
 * This demonstrates the use of WebSockets with HTTP long-polling fallback
 */
export function ResilientWebSocketTest2() {
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
      const newMessage: Message = {
        type: message.type,
        timestamp: message.timestamp || Date.now(),
        content: JSON.stringify(message),
      };
      
      setMessages((prev) => [newMessage, ...prev].slice(0, 20));
    },
    onOpen: () => {
      const connectedMessage: Message = {
        type: 'system',
        timestamp: Date.now(),
        content: `Connected to server${usingFallback ? ' (using HTTP fallback)' : ' (using WebSocket)'}`,
      };
      
      setMessages((prev) => [connectedMessage, ...prev].slice(0, 20));
    },
    onClose: (event) => {
      const closedMessage: Message = {
        type: 'system',
        timestamp: Date.now(),
        content: `Disconnected from server (code: ${event?.code || 'unknown'}, reason: ${event?.reason || 'unknown'})`,
        error: true
      };
      
      setMessages((prev) => [closedMessage, ...prev].slice(0, 20));
    },
    onError: (event) => {
      const errorMessage: Message = {
        type: 'system',
        timestamp: Date.now(),
        content: `Error: ${event ? JSON.stringify(event) : 'unknown'}`,
        error: true
      };
      
      setMessages((prev) => [errorMessage, ...prev].slice(0, 20));
    },
    useResilientMode: true
  });
  
  const handleSendMessage = () => {
    if (!messageToSend.trim()) return;
    
    // Send the message
    sendMessage({
      type: 'chat',
      content: messageToSend,
      timestamp: Date.now(),
      sender: 'user',
    });
    
    // Add to local messages
    const sentMessage: Message = {
      type: 'chat',
      timestamp: Date.now(),
      content: messageToSend,
    };
    
    setMessages((prev) => [sentMessage, ...prev].slice(0, 20));
    setMessageToSend('');
  };
  
  const handleSendPing = () => {
    sendMessage({
      type: 'ping',
      timestamp: Date.now(),
    });
    
    const pingMessage: Message = {
      type: 'system',
      timestamp: Date.now(),
      content: 'Ping sent',
    };
    
    setMessages((prev) => [pingMessage, ...prev].slice(0, 20));
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
      <h1 className="text-2xl font-bold mb-6">Resilient WebSocket Testing</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-medium text-blue-700">About This Page</h2>
        </div>
        <p className="mt-2 text-sm text-blue-600">
          This page demonstrates our resilient WebSocket solution with HTTP long-polling fallback. 
          If normal WebSockets fail (which is common in Replit), the system will automatically switch 
          to HTTP-based communication while maintaining the same API.
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
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Current WebSocket connection information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">Status</div>
                <div>
                  {isConnected ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center">
                      <XCircle className="w-3 h-3 mr-1" />
                      Disconnected
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="font-medium">Connection ID</div>
                <div className="font-mono text-xs">{connectionId || 'None'}</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="font-medium">Connection Type</div>
                <div>
                  {usingFallback ? (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      HTTP Fallback
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      WebSocket
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="font-medium">Reconnect Attempts</div>
                <div>{reconnectAttempt}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-3">
            <Button 
              variant="outline" 
              onClick={disconnect}
              className="flex items-center space-x-1"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Disconnect
            </Button>
            
            <Button 
              variant="outline" 
              onClick={connect}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reconnect
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Send Message</CardTitle>
            <CardDescription>Test sending messages to the server</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message
                </label>
                <div className="flex space-x-2">
                  <input
                    id="message"
                    type="text"
                    value={messageToSend}
                    onChange={(e) => setMessageToSend(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!isConnected}>
                    Send
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Button 
                  variant="outline" 
                  onClick={handleSendPing}
                  disabled={!isConnected}
                  className="w-full"
                >
                  Send Ping
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Message Log</CardTitle>
          <CardDescription>Real-time messages from the server</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No messages yet
              </div>
            )}
            
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-md ${
                  message.error 
                    ? 'bg-red-50 border border-red-100' 
                    : message.type === 'system' 
                      ? 'bg-blue-50 border border-blue-100' 
                      : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <div className="font-medium">{message.type}</div>
                  <div>{new Date(message.timestamp).toLocaleTimeString()}</div>
                </div>
                <div className="break-words whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setMessages([])}
            className="ml-auto text-gray-500"
          >
            Clear Messages
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-6 text-center text-gray-500 text-sm">
        This test page helps debug WebSocket and HTTP fallback functionality. Check browser console for detailed logs.
      </div>
    </div>
  );
}

export default ResilientWebSocketTest2;