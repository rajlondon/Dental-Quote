import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import ConnectionStatusIndicator from '@/components/debug/ConnectionStatusIndicator';

/**
 * Test page for WebSocket connection handling
 * This page demonstrates the enhanced WebSocket connection management
 * with proper disconnect handling and reconnection strategies
 */
export default function WebSocketTestPage() {
  const { user } = useAuth();

  return (
    <div className="container max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">WebSocket Connection Test</h1>
        <p className="text-muted-foreground mb-4">
          This page demonstrates the enhanced WebSocket connection functionality with proper
          graceful disconnect handling and reconnection strategies.
        </p>
        <div className="p-4 bg-muted rounded-md mb-6">
          <h3 className="font-medium mb-2">Connection testing instructions:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>The connection indicator below shows the current WebSocket state.</li>
            <li>Use the <strong>Disconnect</strong> button to test a graceful disconnect.</li>
            <li>Use the <strong>Connect</strong> button to test manual reconnection.</li>
            <li>Use the <strong>Ping Server</strong> button to test sending messages.</li>
            <li>Watch the logs to see the connection activities.</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-3">Patient Connection</h2>
          <ConnectionStatusIndicator 
            userId={user?.id} 
            isClinic={false}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Clinic Connection</h2>
          <ConnectionStatusIndicator 
            userId={user?.id} 
            isClinic={true}
          />
        </div>
      </div>

      <div className="mt-16 p-4 border border-dashed border-muted-foreground/40 rounded-md">
        <h3 className="font-medium mb-2">Technical information:</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The WebSocket implementation includes the following enhancements:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>Improved connection tracking with unique connection IDs</li>
          <li>Graceful disconnect handling with server notification</li>
          <li>Enhanced reconnection logic with exponential backoff</li>
          <li>Improved error recovery for abnormal closures (code 1006)</li>
          <li>Better diagnostic information through connection tracking</li>
          <li>Session-based authentication preservation</li>
          <li>Message queue for handling messages during reconnection</li>
        </ul>
      </div>
    </div>
  );
}