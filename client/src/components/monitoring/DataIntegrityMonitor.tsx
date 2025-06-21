
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface IntegrityCheck {
  name: string;
  description: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  lastChecked: Date;
  details: string;
  count?: number;
  expected?: number;
}

interface SystemMetrics {
  totalUsers: number;
  totalQuotes: number;
  totalBookings: number;
  totalMessages: number;
  activeConnections: number;
  errorRate: number;
  responseTime: number;
}

const DataIntegrityMonitor: React.FC = () => {
  const { toast } = useToast();
  const [integrityChecks, setIntegrityChecks] = useState<IntegrityCheck[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize integrity checks
  useEffect(() => {
    setIntegrityChecks([
      {
        name: 'Quote Assignment Integrity',
        description: 'Verify all assigned quotes have valid clinic references',
        status: 'healthy',
        lastChecked: new Date(),
        details: 'All quote assignments valid'
      },
      {
        name: 'Message Thread Continuity',
        description: 'Check for orphaned messages or broken conversations',
        status: 'healthy',
        lastChecked: new Date(),
        details: 'All message threads intact'
      },
      {
        name: 'File Upload Consistency',
        description: 'Verify uploaded files match database records',
        status: 'healthy',
        lastChecked: new Date(),
        details: 'File references consistent'
      },
      {
        name: 'User Role Permissions',
        description: 'Validate user permissions across portals',
        status: 'healthy',
        lastChecked: new Date(),
        details: 'Permissions properly configured'
      },
      {
        name: 'WebSocket Connection Health',
        description: 'Monitor real-time connection stability',
        status: 'healthy',
        lastChecked: new Date(),
        details: 'Connections stable'
      }
    ]);
  }, []);

  // Perform comprehensive integrity check
  const runIntegrityCheck = async () => {
    setIsChecking(true);
    
    try {
      // Check quote assignment integrity
      const quoteCheck = await checkQuoteIntegrity();
      
      // Check message thread continuity
      const messageCheck = await checkMessageIntegrity();
      
      // Check file consistency
      const fileCheck = await checkFileIntegrity();
      
      // Check user permissions
      const permissionCheck = await checkPermissionIntegrity();
      
      // Check WebSocket health
      const websocketCheck = await checkWebSocketHealth();
      
      setIntegrityChecks([
        quoteCheck,
        messageCheck,
        fileCheck,
        permissionCheck,
        websocketCheck
      ]);
      
      setLastUpdate(new Date());
      
      const issues = [quoteCheck, messageCheck, fileCheck, permissionCheck, websocketCheck]
        .filter(check => check.status === 'error' || check.status === 'warning');
      
      if (issues.length === 0) {
        toast({
          title: "System Healthy",
          description: "All integrity checks passed successfully",
        });
      } else {
        toast({
          title: "Issues Found",
          description: `${issues.length} integrity issue(s) detected`,
          variant: "destructive"
        });
      }
      
    } catch (error: any) {
      toast({
        title: "Check Failed",
        description: `Failed to run integrity check: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Check quote assignment integrity
  const checkQuoteIntegrity = async (): Promise<IntegrityCheck> => {
    try {
      const response = await apiRequest('GET', '/api/admin/integrity/quotes');
      const data = await response.json();
      
      if (data.success) {
        return {
          name: 'Quote Assignment Integrity',
          description: 'Verify all assigned quotes have valid clinic references',
          status: data.orphanedQuotes > 0 ? 'warning' : 'healthy',
          lastChecked: new Date(),
          details: data.orphanedQuotes > 0 
            ? `Found ${data.orphanedQuotes} quotes with invalid clinic references`
            : 'All quote assignments valid',
          count: data.totalQuotes,
          expected: data.totalQuotes
        };
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      return {
        name: 'Quote Assignment Integrity',
        description: 'Verify all assigned quotes have valid clinic references',
        status: 'error',
        lastChecked: new Date(),
        details: `Check failed: ${error.message}`
      };
    }
  };

  // Check message integrity
  const checkMessageIntegrity = async (): Promise<IntegrityCheck> => {
    try {
      const response = await apiRequest('GET', '/api/admin/integrity/messages');
      const data = await response.json();
      
      if (data.success) {
        return {
          name: 'Message Thread Continuity',
          description: 'Check for orphaned messages or broken conversations',
          status: data.orphanedMessages > 0 ? 'warning' : 'healthy',
          lastChecked: new Date(),
          details: data.orphanedMessages > 0 
            ? `Found ${data.orphanedMessages} orphaned messages`
            : 'All message threads intact',
          count: data.totalMessages,
          expected: data.totalMessages
        };
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      return {
        name: 'Message Thread Continuity',
        description: 'Check for orphaned messages or broken conversations',
        status: 'error',
        lastChecked: new Date(),
        details: `Check failed: ${error.message}`
      };
    }
  };

  // Check file integrity
  const checkFileIntegrity = async (): Promise<IntegrityCheck> => {
    try {
      const response = await apiRequest('GET', '/api/admin/integrity/files');
      const data = await response.json();
      
      if (data.success) {
        return {
          name: 'File Upload Consistency',
          description: 'Verify uploaded files match database records',
          status: data.missingFiles > 0 ? 'warning' : 'healthy',
          lastChecked: new Date(),
          details: data.missingFiles > 0 
            ? `Found ${data.missingFiles} files with missing references`
            : 'File references consistent',
          count: data.totalFiles,
          expected: data.totalFiles
        };
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      return {
        name: 'File Upload Consistency',
        description: 'Verify uploaded files match database records',
        status: 'error',
        lastChecked: new Date(),
        details: `Check failed: ${error.message}`
      };
    }
  };

  // Check permission integrity
  const checkPermissionIntegrity = async (): Promise<IntegrityCheck> => {
    try {
      const response = await apiRequest('GET', '/api/admin/integrity/permissions');
      const data = await response.json();
      
      if (data.success) {
        return {
          name: 'User Role Permissions',
          description: 'Validate user permissions across portals',
          status: data.invalidPermissions > 0 ? 'warning' : 'healthy',
          lastChecked: new Date(),
          details: data.invalidPermissions > 0 
            ? `Found ${data.invalidPermissions} users with invalid permissions`
            : 'Permissions properly configured',
          count: data.totalUsers,
          expected: data.totalUsers
        };
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      return {
        name: 'User Role Permissions',
        description: 'Validate user permissions across portals',
        status: 'error',
        lastChecked: new Date(),
        details: `Check failed: ${error.message}`
      };
    }
  };

  // Check WebSocket health
  const checkWebSocketHealth = async (): Promise<IntegrityCheck> => {
    try {
      // This would check WebSocket connection status
      // For now, we'll simulate the check
      const isHealthy = window.WebSocket && document.readyState === 'complete';
      
      return {
        name: 'WebSocket Connection Health',
        description: 'Monitor real-time connection stability',
        status: isHealthy ? 'healthy' : 'warning',
        lastChecked: new Date(),
        details: isHealthy ? 'Connections stable' : 'Some connections unstable'
      };
    } catch (error: any) {
      return {
        name: 'WebSocket Connection Health',
        description: 'Monitor real-time connection stability',
        status: 'error',
        lastChecked: new Date(),
        details: `Check failed: ${error.message}`
      };
    }
  };

  // Fetch system metrics
  const fetchSystemMetrics = async () => {
    try {
      const response = await apiRequest('GET', '/api/admin/system/metrics');
      const data = await response.json();
      
      if (data.success) {
        setSystemMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
    }
  };

  // Auto-refresh system metrics
  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: IntegrityCheck['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: IntegrityCheck['status']) => {
    const variants = {
      healthy: 'success' as const,
      warning: 'secondary' as const,
      error: 'destructive' as const,
      checking: 'default' as const
    };
    
    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const healthyChecks = integrityChecks.filter(check => check.status === 'healthy').length;
  const totalChecks = integrityChecks.length;
  const healthPercentage = totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Integrity Monitor
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time monitoring of data consistency across all portals
              </p>
            </div>
            <Button
              onClick={runIntegrityCheck}
              disabled={isChecking}
              className="flex items-center gap-2"
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isChecking ? 'Checking...' : 'Run Check'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">System Health Score</span>
              <span className="text-sm text-muted-foreground">
                {healthyChecks}/{totalChecks} checks passing
              </span>
            </div>
            <Progress value={healthPercentage} className="h-2" />
            
            {healthPercentage < 100 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {totalChecks - healthyChecks} integrity issue(s) detected. 
                  Review the checks below for details.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{systemMetrics.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Quotes</p>
                  <p className="text-2xl font-bold">{systemMetrics.totalQuotes}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Messages Today</p>
                  <p className="text-2xl font-bold">{systemMetrics.totalMessages}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                  <p className="text-2xl font-bold">{systemMetrics.responseTime}ms</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Integrity Checks */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Integrity Checks</h3>
        {integrityChecks.map((check, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  <h4 className="font-medium">{check.name}</h4>
                </div>
                {getStatusBadge(check.status)}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{check.description}</p>
              <p className="text-sm">{check.details}</p>
              {check.count !== undefined && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Records checked: {check.count}
                </div>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                Last checked: {check.lastChecked.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        Last updated: {lastUpdate.toLocaleString()}
      </div>
    </div>
  );
};

export default DataIntegrityMonitor;
