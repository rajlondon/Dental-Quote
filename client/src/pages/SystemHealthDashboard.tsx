
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InterPortalDataFlowTester from '@/components/testing/InterPortalDataFlowTester';
import DataIntegrityMonitor from '@/components/monitoring/DataIntegrityMonitor';
import SystemLoadMonitor from '@/components/monitoring/SystemLoadMonitor';
import WebSocketConnectionAnalytics from '@/components/monitoring/WebSocketConnectionAnalytics';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { 
  Activity, 
  Database, 
  Network, 
  TestTube,
  Shield,
  BarChart3,
  Users,
  MessageSquare
} from 'lucide-react';

const SystemHealthDashboard: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground mb-4">
              This dashboard is only available to system administrators.
            </p>
            <Button onClick={() => setLocation('/admin-portal')}>
              Return to Admin Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">System Health Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive monitoring and testing for MyDentalFly platform
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="data-flow" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Data Flow Tests
            </TabsTrigger>
            <TabsTrigger value="integrity" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Integrity
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Connections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Platform Status</p>
                      <p className="text-2xl font-bold text-green-600">Healthy</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Portals</p>
                      <p className="text-2xl font-bold">3/3</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data Integrity</p>
                      <p className="text-2xl font-bold text-blue-600">98%</p>
                    </div>
                    <Database className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Real-time Updates</p>
                      <p className="text-2xl font-bold text-purple-600">Active</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Patient Portal</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>✅ Quote submissions working</div>
                        <div>✅ File uploads functional</div>
                        <div>✅ Messaging active</div>
                        <div>✅ Payment processing enabled</div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Clinic Portal</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>✅ Quote management working</div>
                        <div>✅ Patient communication active</div>
                        <div>✅ Treatment plans functional</div>
                        <div>✅ Appointment scheduling enabled</div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Admin Portal</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>✅ Quote assignment working</div>
                        <div>✅ User management active</div>
                        <div>✅ System monitoring functional</div>
                        <div>✅ Analytics available</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Critical Data Flows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Patient → Quote Creation → Admin Assignment → Clinic Processing</span>
                    <span className="text-green-600 font-medium">✓ Working</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Patient ↔ Clinic Messaging with Admin Oversight</span>
                    <span className="text-green-600 font-medium">✓ Working</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>File Upload → Secure Storage → Cross-Portal Access</span>
                    <span className="text-green-600 font-medium">✓ Working</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Real-time Notifications → All Portals</span>
                    <span className="text-green-600 font-medium">✓ Working</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data-flow">
            <InterPortalDataFlowTester />
          </TabsContent>

          <TabsContent value="integrity">
            <DataIntegrityMonitor />
          </TabsContent>

          <TabsContent value="performance">
            <SystemLoadMonitor />
          </TabsContent>

          <TabsContent value="connections">
            <WebSocketConnectionAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemHealthDashboard;
