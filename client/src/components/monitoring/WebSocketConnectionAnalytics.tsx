import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  RefreshCw, 
  WifiOff, 
  Wifi, 
  Users, 
  Clock,
  BarChart4,
  Network
} from "lucide-react";

interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  patientConnections: number;
  clinicConnections: number;
  adminConnections: number;
  averageLatency: number;
  messageCount: {
    sent: number;
    received: number;
    pending: number;
    failed: number;
  };
  connectionEvents: Array<{
    id: string;
    timestamp: Date;
    type: 'connect' | 'disconnect' | 'error' | 'message';
    clientType: 'patient' | 'clinic' | 'admin';
    clientId: string;
    description: string;
  }>;
  lastUpdated: Date;
}

const WebSocketConnectionAnalytics: React.FC = () => {
  const [stats, setStats] = useState<ConnectionStats>({
    totalConnections: 0,
    activeConnections: 0,
    patientConnections: 0,
    clinicConnections: 0,
    adminConnections: 0,
    averageLatency: 0,
    messageCount: {
      sent: 0,
      received: 0,
      pending: 0,
      failed: 0
    },
    connectionEvents: [],
    lastUpdated: new Date()
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  
  // Function to generate simulated connection statistics
  const generateConnectionStats = (): ConnectionStats => {
    // In a real implementation, this would be an API call to get actual stats
    const activeConnections = Math.floor(Math.random() * 50) + 100;
    const patientConnections = Math.floor(activeConnections * 0.7);
    const clinicConnections = Math.floor(activeConnections * 0.2);
    const adminConnections = activeConnections - patientConnections - clinicConnections;
    
    // Generate some random connection events
    const eventTypes: Array<'connect' | 'disconnect' | 'error' | 'message'> = ['connect', 'disconnect', 'error', 'message'];
    const clientTypes: Array<'patient' | 'clinic' | 'admin'> = ['patient', 'clinic', 'admin'];
    
    const newEvents = Array.from({ length: 20 }, (_, i) => {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const clientType = clientTypes[Math.floor(Math.random() * clientTypes.length)];
      const clientId = `${clientType}-${Math.floor(Math.random() * 1000)}`;
      
      let description = '';
      switch (eventType) {
        case 'connect':
          description = `${clientType} ${clientId} connected to WebSocket server`;
          break;
        case 'disconnect':
          description = `${clientType} ${clientId} disconnected from WebSocket server`;
          break;
        case 'error':
          description = `Error occurred with ${clientType} ${clientId}: Connection refused`;
          break;
        case 'message':
          description = `${clientType} ${clientId} sent a message`;
          break;
      }
      
      return {
        id: `event-${Date.now()}-${i}`,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)), // Random time in the last hour
        type: eventType,
        clientType,
        clientId,
        description
      };
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by most recent
    
    return {
      totalConnections: activeConnections + Math.floor(Math.random() * 200),
      activeConnections,
      patientConnections,
      clinicConnections,
      adminConnections,
      averageLatency: Math.floor(Math.random() * 100) + 50,
      messageCount: {
        sent: Math.floor(Math.random() * 5000) + 1000,
        received: Math.floor(Math.random() * 5000) + 1000,
        pending: Math.floor(Math.random() * 50),
        failed: Math.floor(Math.random() * 20)
      },
      connectionEvents: newEvents,
      lastUpdated: new Date()
    };
  };
  
  // Initial load of connection statistics
  useEffect(() => {
    setStats(generateConnectionStats());
    setIsLoading(false);
  }, []);
  
  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setStats(prev => ({
        ...generateConnectionStats(),
        connectionEvents: [
          ...generateConnectionStats().connectionEvents.slice(0, 5),
          ...prev.connectionEvents
        ].slice(0, 50) // Keep the most recent 50 events
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  // Manual refresh handler
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setStats(prev => ({
        ...generateConnectionStats(),
        connectionEvents: [
          ...generateConnectionStats().connectionEvents.slice(0, 5),
          ...prev.connectionEvents
        ].slice(0, 50)
      }));
      setIsLoading(false);
    }, 600);
  };
  
  // Format timestamp to readable string
  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString();
  };
  
  // Calculate connection health status
  const getConnectionHealthStatus = (): { 
    status: 'healthy' | 'warning' | 'critical',
    message: string
  } => {
    const { messageCount, averageLatency } = stats;
    
    // Check for critical conditions
    if (messageCount.failed > 10 || averageLatency > 500) {
      return {
        status: 'critical',
        message: 'System experiencing high latency or connection failures'
      };
    }
    
    // Check for warning conditions
    if (messageCount.failed > 5 || averageLatency > 200 || messageCount.pending > 20) {
      return {
        status: 'warning',
        message: 'Some WebSocket connections experiencing delays'
      };
    }
    
    // Default healthy status
    return {
      status: 'healthy',
      message: 'All WebSocket connections operating normally'
    };
  };
  
  const connectionHealth = getConnectionHealthStatus();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>WebSocket Connection Analytics</CardTitle>
            <CardDescription>
              Real-time monitoring of WebSocket connections and messages
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? (
                <>
                  <Clock className="h-4 w-4 mr-1" />
                  Live
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-1" />
                  Auto-update
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Connection Health Status */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
          <div className={`p-2 rounded-full ${
            connectionHealth.status === 'healthy' 
              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
              : connectionHealth.status === 'warning'
                ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
                : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
          }`}>
            {connectionHealth.status === 'healthy' && <Wifi className="h-5 w-5" />}
            {connectionHealth.status === 'warning' && <Activity className="h-5 w-5" />}
            {connectionHealth.status === 'critical' && <WifiOff className="h-5 w-5" />}
          </div>
          <div>
            <div className="font-medium">
              Connection Status: {
                connectionHealth.status === 'healthy' 
                  ? 'Healthy' 
                  : connectionHealth.status === 'warning'
                    ? 'Warning'
                    : 'Critical'
              }
            </div>
            <div className="text-sm text-muted-foreground">{connectionHealth.message}</div>
          </div>
          <Badge 
            variant={
              connectionHealth.status === 'healthy' 
                ? 'default' 
                : connectionHealth.status === 'warning'
                  ? 'outline'
                  : 'destructive'
            }
            className="ml-auto"
          >
            {stats.averageLatency}ms avg latency
          </Badge>
        </div>
        
        {/* Connection Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Active Connections</span>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{stats.activeConnections}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Total historical: {stats.totalConnections}
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Connection Types</span>
              <Network className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="flex gap-2 text-xs mt-1">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                Patients: {stats.patientConnections}
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                Clinics: {stats.clinicConnections}
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
                Admin: {stats.adminConnections}
              </Badge>
            </div>
            <div className="flex justify-between items-center mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ 
                  width: `${(stats.patientConnections / stats.activeConnections) * 100}%` 
                }}></div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Message Stats</span>
              <BarChart4 className="h-4 w-4 text-green-500" />
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div>
                <span className="text-muted-foreground">Sent:</span>{' '}
                <span className="font-medium">{stats.messageCount.sent}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Received:</span>{' '}
                <span className="font-medium">{stats.messageCount.received}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pending:</span>{' '}
                <span className="font-medium text-amber-600">{stats.messageCount.pending}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Failed:</span>{' '}
                <span className="font-medium text-red-600">{stats.messageCount.failed}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Queue Health</span>
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
            <div className="flex items-end gap-1 h-10">
              {Array.from({ length: 10 }).map((_, i) => {
                // Random bar heights for visualization
                const height = Math.max(15, Math.random() * 100);
                return (
                  <div 
                    key={i} 
                    className="w-full bg-purple-200 dark:bg-purple-900/40 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Message processing rate: {Math.floor(Math.random() * 100) + 150}/sec
            </div>
          </div>
        </div>
        
        {/* Connection Events */}
        <div>
          <Tabs defaultValue="recent">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="recent">Recent Events</TabsTrigger>
                <TabsTrigger value="errors">Connection Errors</TabsTrigger>
              </TabsList>
              <div className="text-xs text-muted-foreground">
                Last updated: {stats.lastUpdated.toLocaleString()}
              </div>
            </div>
            
            <TabsContent value="recent" className="mt-4">
              <div className="border rounded-md">
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Client</th>
                        <th className="text-left p-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {stats.connectionEvents.map(event => (
                        <tr key={event.id} className="hover:bg-muted/30">
                          <td className="p-2 whitespace-nowrap">{formatTimestamp(event.timestamp)}</td>
                          <td className="p-2">
                            <Badge variant={
                              event.type === 'connect' 
                                ? 'default' 
                                : event.type === 'disconnect'
                                  ? 'outline'
                                  : event.type === 'error'
                                    ? 'destructive'
                                    : 'secondary'
                            }>
                              {event.type}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center">
                              <span className={`h-2 w-2 rounded-full mr-2 ${
                                event.clientType === 'patient' 
                                  ? 'bg-blue-500' 
                                  : event.clientType === 'clinic'
                                    ? 'bg-green-500'
                                    : 'bg-purple-500'
                              }`}></span>
                              <span>{event.clientType}</span>
                            </div>
                          </td>
                          <td className="p-2 text-muted-foreground">{event.description}</td>
                        </tr>
                      ))}
                      
                      {stats.connectionEvents.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-muted-foreground">
                            No recent connection events
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="errors" className="mt-4">
              <div className="border rounded-md">
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Client</th>
                        <th className="text-left p-2">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {stats.connectionEvents
                        .filter(event => event.type === 'error')
                        .map(event => (
                          <tr key={event.id} className="hover:bg-muted/30">
                            <td className="p-2 whitespace-nowrap">{formatTimestamp(event.timestamp)}</td>
                            <td className="p-2">
                              <div className="flex items-center">
                                <span className={`h-2 w-2 rounded-full mr-2 ${
                                  event.clientType === 'patient' 
                                    ? 'bg-blue-500' 
                                    : event.clientType === 'clinic'
                                      ? 'bg-green-500'
                                      : 'bg-purple-500'
                                }`}></span>
                                <span>{event.clientId}</span>
                              </div>
                            </td>
                            <td className="p-2 text-red-600">{event.description}</td>
                          </tr>
                      ))}
                      
                      {stats.connectionEvents.filter(event => event.type === 'error').length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-muted-foreground">
                            No connection errors
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/20 border-t py-3">
        <div className="text-xs text-muted-foreground w-full flex justify-between">
          <div>Connection analytics helps identify potential WebSocket communication issues</div>
          {autoRefresh && (
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
              <span>Live monitoring active</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default WebSocketConnectionAnalytics;