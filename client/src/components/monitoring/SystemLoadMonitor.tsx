import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowUpCircle, 
  Users, 
  MessageSquare, 
  Save, 
  RefreshCw, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3, 
  Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemStats {
  activeConnections: number;
  messageRate: number;
  averageLatency: number;
  errorRate: number;
  dbQueries: number;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  uptime: number;
  lastUpdated: Date;
}

interface CapacityMetrics {
  maxConnections: number;
  targetMessageRate: number;
  acceptableLatency: number;
  acceptableErrorRate: number;
  maxDbQueriesPerSecond: number;
  status: 'healthy' | 'warning' | 'critical';
}

const calculateCapacity = (stats: SystemStats): CapacityMetrics => {
  // Default capacity thresholds for the system
  const maxConnections = 5000; // Maximum concurrent WebSocket connections
  const targetMessageRate = 1000; // Messages per second the system can handle
  const acceptableLatency = 250; // Milliseconds
  const acceptableErrorRate = 0.01; // 1% error rate is acceptable
  const maxDbQueriesPerSecond = 500;
  
  // Determine overall system status
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  
  // Check connection load
  if (stats.activeConnections > maxConnections * 0.8) {
    status = 'warning';
  }
  
  // Check message rate
  if (stats.messageRate > targetMessageRate * 0.8) {
    status = 'warning';
  }
  
  // Check latency
  if (stats.averageLatency > acceptableLatency * 1.5) {
    status = 'warning';
  }
  
  // Check error rate
  if (stats.errorRate > acceptableErrorRate * 2) {
    status = 'warning';
  }
  
  // Check for critical conditions
  if (
    stats.activeConnections > maxConnections * 0.95 ||
    stats.messageRate > targetMessageRate * 0.95 ||
    stats.averageLatency > acceptableLatency * 3 ||
    stats.errorRate > acceptableErrorRate * 5 ||
    stats.cpuUsage > 0.9 ||
    stats.memoryUsage > 0.9
  ) {
    status = 'critical';
  }
  
  return {
    maxConnections,
    targetMessageRate,
    acceptableLatency,
    acceptableErrorRate,
    maxDbQueriesPerSecond,
    status
  };
};

/**
 * Estimates if the system can handle 100+ daily signups based on current metrics
 */
const canHandleTargetLoad = (stats: SystemStats, capacity: CapacityMetrics): { 
  canHandle: boolean;
  bottlenecks: string[];
  recommendations: string[];
} => {
  const bottlenecks: string[] = [];
  const recommendations: string[] = [];
  
  // 100 signups per day means approximately:
  // - Average 4-5 new users per hour
  // - Peak times might see 10-15 users per hour
  // - Each user might generate ~50-100 WebSocket messages during active sessions
  // - Each user might make 20-30 DB queries during their session
  
  // Connection capacity check (assuming 20% of daily users active concurrently)
  if (stats.activeConnections > capacity.maxConnections * 0.5) {
    bottlenecks.push("WebSocket connection capacity");
    recommendations.push("Implement connection pooling and scaling for WebSocket server");
  }
  
  // Message throughput check
  if (stats.messageRate > capacity.targetMessageRate * 0.5) {
    bottlenecks.push("Message processing rate");
    recommendations.push("Add message queue system to handle peak loads");
  }
  
  // Latency check
  if (stats.averageLatency > capacity.acceptableLatency) {
    bottlenecks.push("System response time");
    recommendations.push("Optimize database queries and API endpoints");
  }
  
  // Error rate check
  if (stats.errorRate > capacity.acceptableErrorRate) {
    bottlenecks.push("Error handling");
    recommendations.push("Improve error handling and retry logic");
  }
  
  // Database capacity check
  if (stats.dbQueries > capacity.maxDbQueriesPerSecond * 0.5) {
    bottlenecks.push("Database query capacity");
    recommendations.push("Implement database caching and query optimization");
  }
  
  // Resource usage check
  if (stats.cpuUsage > 0.7 || stats.memoryUsage > 0.7) {
    bottlenecks.push("Server resource utilization");
    recommendations.push("Upgrade server resources or implement horizontal scaling");
  }
  
  return {
    canHandle: bottlenecks.length === 0,
    bottlenecks,
    recommendations
  };
};

// Function to simulate metrics - in a real application this would fetch from a backend API
const getSimulatedMetrics = (): SystemStats => {
  // Simulate some realistic metrics
  // In a production application, these would come from server monitoring
  return {
    activeConnections: Math.floor(Math.random() * 500) + 800,
    messageRate: Math.floor(Math.random() * 100) + 200,
    averageLatency: Math.floor(Math.random() * 50) + 100,
    errorRate: Math.random() * 0.01,
    dbQueries: Math.floor(Math.random() * 100) + 150,
    cpuUsage: Math.random() * 0.3 + 0.3,
    memoryUsage: Math.random() * 0.2 + 0.5,
    storageUsage: Math.random() * 0.2 + 0.4,
    uptime: Math.floor(Math.random() * 100000) + 10000,
    lastUpdated: new Date()
  };
};

// Function to format uptime in a human-readable way
const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${days}d ${hours}h ${minutes}m`;
};

const SystemLoadMonitor: React.FC = () => {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('current');
  const { toast } = useToast();
  
  // Calculate capacity metrics
  const capacityMetrics = systemStats ? calculateCapacity(systemStats) : null;
  
  // Calculate if system can handle 100+ signups per day
  const loadCapacity = systemStats && capacityMetrics 
    ? canHandleTargetLoad(systemStats, capacityMetrics) 
    : null;
    
  // Effect to load initial metrics
  useEffect(() => {
    // In a real application, fetch initial metrics from an API
    setSystemStats(getSimulatedMetrics());
    setIsLoading(false);
  }, []);
  
  // Effect to update metrics periodically if simulation is active
  useEffect(() => {
    if (!simulationActive) return;
    
    const interval = setInterval(() => {
      setSystemStats(getSimulatedMetrics());
    }, 5000);
    
    return () => clearInterval(interval);
  }, [simulationActive]);
  
  // Toggle simulation on/off
  const toggleSimulation = () => {
    setSimulationActive(prev => !prev);
    
    if (!simulationActive) {
      toast({
        title: "Simulation Started",
        description: "System monitoring simulation is now active. Metrics will update every 5 seconds.",
        variant: "default"
      });
    } else {
      toast({
        title: "Simulation Stopped",
        description: "System monitoring simulation has been stopped.",
        variant: "default"
      });
    }
  };
  
  // Force a metrics refresh
  const refreshMetrics = () => {
    setIsLoading(true);
    
    // Simulate an API call
    setTimeout(() => {
      setSystemStats(getSimulatedMetrics());
      setIsLoading(false);
      
      toast({
        title: "Metrics Refreshed",
        description: "System monitoring data has been updated.",
        variant: "default"
      });
    }, 1000);
  };
  
  // Run a simulated load test
  const runLoadTest = () => {
    setIsLoading(true);
    toast({
      title: "Load Test Started",
      description: "Running a simulated load test for 100+ daily users...",
      variant: "default"
    });
    
    // Simulate a load test (would be a real server action in production)
    setTimeout(() => {
      setSystemStats(getSimulatedMetrics());
      setIsLoading(false);
      
      toast({
        title: "Load Test Complete",
        description: loadCapacity?.canHandle 
          ? "The system can handle the target load of 100+ daily signups." 
          : "The system may have bottlenecks handling 100+ daily signups. See recommendations.",
        variant: loadCapacity?.canHandle ? "default" : "destructive"
      });
    }, 3000);
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Loading system metrics...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Load Monitor</CardTitle>
            <CardDescription>
              Real-time system metrics and capacity planning
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshMetrics}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button
              variant={simulationActive ? "default" : "outline"}
              size="sm"
              onClick={toggleSimulation}
            >
              {simulationActive ? "Stop Simulation" : "Start Simulation"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {systemStats && (
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">Current Metrics</TabsTrigger>
              <TabsTrigger value="capacity">Capacity Analysis</TabsTrigger>
              <TabsTrigger value="forecast">Load Forecast</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Active Connections</span>
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">{systemStats.activeConnections}</div>
                  <Progress
                    value={(systemStats.activeConnections / 
                      (capacityMetrics?.maxConnections || 5000)) * 100}
                    className="h-1 mt-2"
                  />
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Message Rate</span>
                    <MessageSquare className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">{systemStats.messageRate}/s</div>
                  <Progress
                    value={(systemStats.messageRate / 
                      (capacityMetrics?.targetMessageRate || 1000)) * 100}
                    className="h-1 mt-2"
                  />
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Avg. Latency</span>
                    <ArrowUpCircle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold">{systemStats.averageLatency} ms</div>
                  <Progress
                    value={(systemStats.averageLatency / 
                      (capacityMetrics?.acceptableLatency || 250)) * 100}
                    className="h-1 mt-2"
                  />
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Error Rate</span>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold">{(systemStats.errorRate * 100).toFixed(2)}%</div>
                  <Progress
                    value={(systemStats.errorRate / 
                      (capacityMetrics?.acceptableErrorRate || 0.01)) * 100}
                    className="h-1 mt-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                  </div>
                  <div className="text-2xl font-bold">{(systemStats.cpuUsage * 100).toFixed(1)}%</div>
                  <Progress value={systemStats.cpuUsage * 100} className="h-1 mt-2" />
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                  </div>
                  <div className="text-2xl font-bold">{(systemStats.memoryUsage * 100).toFixed(1)}%</div>
                  <Progress value={systemStats.memoryUsage * 100} className="h-1 mt-2" />
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">DB Queries</span>
                    <Database className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold">{systemStats.dbQueries}/s</div>
                  <Progress
                    value={(systemStats.dbQueries / 
                      (capacityMetrics?.maxDbQueriesPerSecond || 500)) * 100}
                    className="h-1 mt-2"
                  />
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">System Uptime</span>
                  </div>
                  <div className="text-2xl font-bold">{formatUptime(systemStats.uptime)}</div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Last updated: {systemStats.lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="capacity" className="mt-4">
              {capacityMetrics && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-full ${
                      capacityMetrics.status === 'healthy' 
                        ? 'bg-green-100 text-green-600' 
                        : capacityMetrics.status === 'warning'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-red-100 text-red-600'
                    }`}>
                      {capacityMetrics.status === 'healthy' && <CheckCircle2 className="h-5 w-5" />}
                      {capacityMetrics.status === 'warning' && <AlertTriangle className="h-5 w-5" />}
                      {capacityMetrics.status === 'critical' && <AlertTriangle className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-medium">System Status: {capacityMetrics.status === 'healthy' 
                        ? 'Healthy' 
                        : capacityMetrics.status === 'warning'
                          ? 'Warning'
                          : 'Critical'
                      }</h3>
                      <p className="text-sm text-muted-foreground">
                        {capacityMetrics.status === 'healthy' 
                          ? 'All systems operating within normal parameters' 
                          : capacityMetrics.status === 'warning'
                            ? 'Some metrics approaching system capacity limits'
                            : 'Multiple metrics exceeding recommended thresholds'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Current Capacity Utilization</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Connection Capacity</span>
                          <span className="text-sm font-medium">
                            {systemStats.activeConnections} / {capacityMetrics.maxConnections}
                          </span>
                        </div>
                        <Progress 
                          value={(systemStats.activeConnections / capacityMetrics.maxConnections) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Message Processing</span>
                          <span className="text-sm font-medium">
                            {systemStats.messageRate} / {capacityMetrics.targetMessageRate} per second
                          </span>
                        </div>
                        <Progress 
                          value={(systemStats.messageRate / capacityMetrics.targetMessageRate) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Response Time</span>
                          <span className="text-sm font-medium">
                            {systemStats.averageLatency} ms / {capacityMetrics.acceptableLatency} ms target
                          </span>
                        </div>
                        <Progress 
                          value={(systemStats.averageLatency / capacityMetrics.acceptableLatency) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Error Rate</span>
                          <span className="text-sm font-medium">
                            {(systemStats.errorRate * 100).toFixed(2)}% / {(capacityMetrics.acceptableErrorRate * 100).toFixed(2)}% target
                          </span>
                        </div>
                        <Progress 
                          value={(systemStats.errorRate / capacityMetrics.acceptableErrorRate) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Database Throughput</span>
                          <span className="text-sm font-medium">
                            {systemStats.dbQueries} / {capacityMetrics.maxDbQueriesPerSecond} queries/sec
                          </span>
                        </div>
                        <Progress 
                          value={(systemStats.dbQueries / capacityMetrics.maxDbQueriesPerSecond) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="forecast" className="mt-4">
              {loadCapacity && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-muted/40 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      loadCapacity.canHandle 
                        ? 'bg-green-100 text-green-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}>
                      {loadCapacity.canHandle 
                        ? <CheckCircle2 className="h-5 w-5" />
                        : <AlertTriangle className="h-5 w-5" />
                      }
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {loadCapacity.canHandle 
                          ? 'System can handle target load (100+ signups/day)'
                          : 'System may have bottlenecks with target load'
                        }
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {loadCapacity.canHandle 
                          ? 'Current metrics indicate the system should handle the expected load without issues'
                          : `${loadCapacity.bottlenecks.length} potential bottleneck(s) identified`
                        }
                      </p>
                    </div>
                  </div>
                  
                  {!loadCapacity.canHandle && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Identified Bottlenecks</h3>
                      <ul className="space-y-2">
                        {loadCapacity.bottlenecks.map((bottleneck, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{bottleneck}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <h3 className="text-lg font-medium mt-4">Recommendations</h3>
                      <ul className="space-y-2">
                        {loadCapacity.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <ArrowUpCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button onClick={runLoadTest}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Run Load Test Simulation
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Simulates expected load patterns for 100+ daily signups and analyzes system response
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/20 border-t flex justify-between items-center py-3">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Note:</span> This is a simulated monitoring dashboard for demonstration purposes.
        </div>
        <div className="text-xs text-muted-foreground">
          System last updated: {systemStats?.lastUpdated.toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SystemLoadMonitor;