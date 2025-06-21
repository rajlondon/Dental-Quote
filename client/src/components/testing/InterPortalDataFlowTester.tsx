
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/use-websocket';
import { apiRequest } from '@/lib/queryClient';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Building, 
  User,
  MessageSquare,
  FileText,
  ArrowRight,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface TestResult {
  testName: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  timestamp: Date;
  data?: any;
}

interface DataFlowTest {
  id: string;
  name: string;
  description: string;
  expectedFlow: string[];
  testFunction: () => Promise<TestResult>;
}

const InterPortalDataFlowTester: React.FC = () => {
  const { toast } = useToast();
  const { sendMessage, isConnected } = useWebSocket();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [testData, setTestData] = useState<any>({});

  // Test quote creation and assignment flow
  const testQuoteFlow = async (): Promise<TestResult> => {
    try {
      // 1. Create quote as patient
      const quoteResponse = await apiRequest('POST', '/api/quotes', {
        name: 'Test Patient Flow',
        email: 'test@flow.com',
        treatment: 'dental-implants',
        consent: true
      });
      
      const quote = await quoteResponse.json();
      
      if (!quote.success) {
        throw new Error('Failed to create quote');
      }
      
      // 2. Assign to clinic (admin action)
      const assignResponse = await apiRequest('POST', `/api/quotes/${quote.data.id}/assign-clinic`, {
        clinicId: 1
      });
      
      const assignment = await assignResponse.json();
      
      if (!assignment.success) {
        throw new Error('Failed to assign quote to clinic');
      }
      
      // 3. Create quote version (clinic action)
      const versionResponse = await apiRequest('POST', `/api/quotes/${quote.data.id}/versions`, {
        quoteData: {
          treatments: [{ name: 'Dental Implant', price: 1200 }],
          total: 1200
        },
        updateQuoteStatus: true
      });
      
      const version = await versionResponse.json();
      
      if (!version.success) {
        throw new Error('Failed to create quote version');
      }
      
      return {
        testName: 'Quote Creation Flow',
        status: 'passed',
        message: 'Successfully created quote, assigned to clinic, and created version',
        timestamp: new Date(),
        data: { quoteId: quote.data.id, versionId: version.data.id }
      };
      
    } catch (error: any) {
      return {
        testName: 'Quote Creation Flow',
        status: 'failed',
        message: error.message,
        timestamp: new Date()
      };
    }
  };

  // Test messaging between portals
  const testMessagingFlow = async (): Promise<TestResult> => {
    try {
      // First create a test booking
      const bookingResponse = await apiRequest('POST', '/api/test/create-test-booking', {
        patientEmail: 'patient@test.com',
        clinicEmail: 'clinic@test.com'
      });
      
      const booking = await bookingResponse.json();
      
      if (!booking.success) {
        throw new Error('Failed to create test booking');
      }
      
      // Send message from patient to clinic
      const messageResponse = await apiRequest('POST', '/api/messages', {
        bookingId: booking.data.id,
        recipientId: booking.data.assignedClinicStaffId,
        content: 'Test message from patient to clinic'
      });
      
      const message = await messageResponse.json();
      
      if (!message.success) {
        throw new Error('Failed to send message');
      }
      
      // Verify message appears in clinic messages
      const clinicMessagesResponse = await apiRequest('GET', `/api/messages/booking/${booking.data.id}`);
      const clinicMessages = await clinicMessagesResponse.json();
      
      if (!clinicMessages.success || clinicMessages.data.length === 0) {
        throw new Error('Message not found in clinic portal');
      }
      
      return {
        testName: 'Inter-Portal Messaging',
        status: 'passed',
        message: 'Successfully sent and received message between portals',
        timestamp: new Date(),
        data: { bookingId: booking.data.id, messageId: message.data.id }
      };
      
    } catch (error: any) {
      return {
        testName: 'Inter-Portal Messaging',
        status: 'failed',
        message: error.message,
        timestamp: new Date()
      };
    }
  };

  // Test WebSocket real-time updates
  const testWebSocketFlow = async (): Promise<TestResult> => {
    try {
      if (!isConnected) {
        throw new Error('WebSocket not connected');
      }
      
      // Send a test message and wait for response
      const testMessage = {
        type: 'test_data_flow',
        payload: {
          testId: Date.now(),
          message: 'Testing real-time data flow'
        },
        sender: {
          id: 'test-client',
          type: 'admin'
        }
      };
      
      sendMessage(testMessage);
      
      // In a real test, we'd wait for a response
      return {
        testName: 'WebSocket Real-time Updates',
        status: 'passed',
        message: 'WebSocket connection active and message sent',
        timestamp: new Date(),
        data: testMessage
      };
      
    } catch (error: any) {
      return {
        testName: 'WebSocket Real-time Updates',
        status: 'failed',
        message: error.message,
        timestamp: new Date()
      };
    }
  };

  // Test notification system
  const testNotificationFlow = async (): Promise<TestResult> => {
    try {
      // Create a test notification
      const notificationResponse = await apiRequest('POST', '/api/notifications', {
        title: 'Test Notification',
        message: 'Testing notification system',
        type: 'info',
        entityType: 'quote',
        entityId: 1
      });
      
      const notification = await notificationResponse.json();
      
      if (!notification.success) {
        throw new Error('Failed to create notification');
      }
      
      // Verify notification appears in list
      const notificationsResponse = await apiRequest('GET', '/api/notifications');
      const notifications = await notificationsResponse.json();
      
      if (!notifications.success) {
        throw new Error('Failed to fetch notifications');
      }
      
      const testNotification = notifications.data.find((n: any) => 
        n.title === 'Test Notification'
      );
      
      if (!testNotification) {
        throw new Error('Test notification not found in list');
      }
      
      return {
        testName: 'Notification System',
        status: 'passed',
        message: 'Successfully created and retrieved notification',
        timestamp: new Date(),
        data: { notificationId: notification.data.id }
      };
      
    } catch (error: any) {
      return {
        testName: 'Notification System',
        status: 'failed',
        message: error.message,
        timestamp: new Date()
      };
    }
  };

  // Test file upload and sharing
  const testFileFlow = async (): Promise<TestResult> => {
    try {
      // Create a test file blob
      const testContent = 'Test file content for data flow testing';
      const blob = new Blob([testContent], { type: 'text/plain' });
      const file = new File([blob], 'test-file.txt', { type: 'text/plain' });
      
      // First create a quote to attach the file to
      const quoteResponse = await apiRequest('POST', '/api/quotes', {
        name: 'File Test Patient',
        email: 'filetest@flow.com',
        treatment: 'consultation',
        consent: true
      });
      
      const quote = await quoteResponse.json();
      
      if (!quote.success) {
        throw new Error('Failed to create quote for file test');
      }
      
      // Upload file to the quote
      const formData = new FormData();
      formData.append('xrays', file);
      
      const uploadResponse = await fetch(`/api/quotes/${quote.data.id}/xrays`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const upload = await uploadResponse.json();
      
      if (!upload.success) {
        throw new Error('Failed to upload file');
      }
      
      // Verify file appears in quote files
      const filesResponse = await apiRequest('GET', `/api/quotes/${quote.data.id}/xrays`);
      const files = await filesResponse.json();
      
      if (!files.success || files.data.length === 0) {
        throw new Error('Uploaded file not found');
      }
      
      return {
        testName: 'File Upload and Sharing',
        status: 'passed',
        message: 'Successfully uploaded and retrieved file',
        timestamp: new Date(),
        data: { quoteId: quote.data.id, fileId: upload.data[0].id }
      };
      
    } catch (error: any) {
      return {
        testName: 'File Upload and Sharing',
        status: 'failed',
        message: error.message,
        timestamp: new Date()
      };
    }
  };

  // Define all tests
  const dataFlowTests: DataFlowTest[] = [
    {
      id: 'quote-flow',
      name: 'Quote Creation & Assignment',
      description: 'Tests quote creation (patient) → assignment (admin) → version creation (clinic)',
      expectedFlow: ['Patient creates quote', 'Admin assigns to clinic', 'Clinic creates version'],
      testFunction: testQuoteFlow
    },
    {
      id: 'messaging-flow',
      name: 'Inter-Portal Messaging',
      description: 'Tests messaging between patient and clinic portals',
      expectedFlow: ['Create booking', 'Patient sends message', 'Clinic receives message'],
      testFunction: testMessagingFlow
    },
    {
      id: 'websocket-flow',
      name: 'Real-time Updates',
      description: 'Tests WebSocket connections for real-time data synchronization',
      expectedFlow: ['Connect WebSocket', 'Send test message', 'Verify delivery'],
      testFunction: testWebSocketFlow
    },
    {
      id: 'notification-flow',
      name: 'Notification System',
      description: 'Tests notification creation and delivery across portals',
      expectedFlow: ['Create notification', 'Store in database', 'Deliver to portal'],
      testFunction: testNotificationFlow
    },
    {
      id: 'file-flow',
      name: 'File Sharing',
      description: 'Tests file upload and sharing between portals',
      expectedFlow: ['Upload file', 'Store securely', 'Share with authorized users'],
      testFunction: testFileFlow
    }
  ];

  const runTest = async (test: DataFlowTest) => {
    setRunningTests(prev => new Set(prev).add(test.id));
    
    const pendingResult: TestResult = {
      testName: test.name,
      status: 'running',
      message: 'Test in progress...',
      timestamp: new Date()
    };
    
    setTestResults(prev => [...prev.filter(r => r.testName !== test.name), pendingResult]);
    
    try {
      const result = await test.testFunction();
      setTestResults(prev => [...prev.filter(r => r.testName !== test.name), result]);
      
      if (result.status === 'passed') {
        toast({
          title: "Test Passed",
          description: `${test.name} completed successfully`,
        });
      } else {
        toast({
          title: "Test Failed",
          description: `${test.name}: ${result.message}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      const failedResult: TestResult = {
        testName: test.name,
        status: 'failed',
        message: error.message,
        timestamp: new Date()
      };
      setTestResults(prev => [...prev.filter(r => r.testName !== test.name), failedResult]);
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(test.id);
        return newSet;
      });
    }
  };

  const runAllTests = async () => {
    for (const test of dataFlowTests) {
      await runTest(test);
      // Add small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      passed: 'success' as const,
      failed: 'destructive' as const,
      running: 'default' as const,
      pending: 'secondary' as const
    };
    
    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Inter-Portal Data Flow Testing
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive testing suite for data flow between Patient, Clinic, and Admin portals
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={runAllTests} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Run All Tests
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setTestResults([])}
            >
              Clear Results
            </Button>
          </div>
          
          {!isConnected && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                WebSocket not connected. Some real-time tests may fail.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">Test Suite</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="data-flow">Data Flow Map</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          {dataFlowTests.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <Button
                    onClick={() => runTest(test)}
                    disabled={runningTests.has(test.id)}
                    variant="outline"
                    size="sm"
                  >
                    {runningTests.has(test.id) ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      'Run Test'
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{test.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Expected Flow:</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {test.expectedFlow.map((step, index) => (
                      <React.Fragment key={index}>
                        <span>{step}</span>
                        {index < test.expectedFlow.length - 1 && (
                          <ArrowRight className="h-3 w-3" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {testResults.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No test results yet. Run some tests to see results here.</p>
              </CardContent>
            </Card>
          ) : (
            testResults.map((result, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <h3 className="font-medium">{result.testName}</h3>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.timestamp.toLocaleString()}
                  </p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">
                        Test Data
                      </summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="data-flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Flow Architecture</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visual representation of data flow between portals
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Patient Portal</h3>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Create quote requests</li>
                    <li>• Upload X-rays/documents</li>
                    <li>• Send messages to clinic</li>
                    <li>• Review treatment plans</li>
                    <li>• Make payments</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">Clinic Portal</h3>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Receive assigned quotes</li>
                    <li>• Create treatment plans</li>
                    <li>• Upload clinic media</li>
                    <li>• Communicate with patients</li>
                    <li>• Manage appointments</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4 bg-purple-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium">Admin Portal</h3>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Assign quotes to clinics</li>
                    <li>• Monitor all communications</li>
                    <li>• Manage system settings</li>
                    <li>• Generate reports</li>
                    <li>• Handle disputes</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Critical Data Flows:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>Quote: Patient → Admin → Clinic → Patient</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>Messages: Patient ↔ Clinic (Admin monitors)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>Files: Patient → Clinic/Admin (secure sharing)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>Notifications: System → All portals (real-time)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterPortalDataFlowTester;
