import React, { useState } from 'react';
import DataFlowDiagram from '@/components/diagrams/DataFlowDiagram';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SyncStatusPanel from '@/components/sync/SyncStatusPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SystemLoadMonitor from '@/components/monitoring/SystemLoadMonitor';
import WebSocketConnectionAnalytics from '@/components/monitoring/WebSocketConnectionAnalytics';

const DataArchitecturePage: React.FC = () => {
  return (
    <div>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">MyDentalFly Data Architecture</h1>
        <p className="text-gray-600 mb-8">
          This page illustrates how data flows between the patient portal and clinic portal, 
          showing data ownership and synchronization methods.
        </p>
        
        <div className="space-y-8">
          <DataFlowDiagram />
          
          <Card>
            <CardHeader>
              <CardTitle>Data Ownership & Permissions</CardTitle>
              <CardDescription>
                Who controls different types of data in the MyDentalFly ecosystem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Patient-Owned Data</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Personal contact information</li>
                    <li>Privacy preferences & GDPR consent settings</li>
                    <li>Dental images & X-rays (uploaded by patient)</li>
                    <li>Travel details (flight information)</li>
                    <li>Accommodation preferences</li>
                    <li>Medical history & health questionnaires</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Clinic-Owned Data</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Treatment plans & dental procedures</li>
                    <li>Pricing information for services</li>
                    <li>Clinical notes & assessments</li>
                    <li>Clinic schedule & availability</li>
                    <li>Hotel partner selection & packages</li>
                    <li>Post-treatment care instructions</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Shared/Synced Data</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Appointment schedule (bidirectional sync between portals)</li>
                  <li>Communication/messaging history (shared record)</li>
                  <li>Payment statuses & deposit information (platform-managed)</li>
                  <li>Treatment progress tracking (updated by clinic, viewed by patient)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Synchronization System</CardTitle>
              <CardDescription>
                How information stays updated across both patient and clinic portals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Real-time Sync</h3>
                  <p className="text-gray-600">
                    Certain data types require immediate updates across portals, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
                    <li>Appointment scheduling & changes</li>
                    <li>Urgent messages & notifications</li>
                    <li>Treatment status updates</li>
                    <li>Payment confirmations</li>
                  </ul>
                  <p className="text-gray-600 mt-2">
                    These use WebSocket connections for instant bidirectional synchronization.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Background Sync</h3>
                  <p className="text-gray-600">
                    Less time-sensitive data is synchronized through background API calls, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
                    <li>Profile updates & GDPR preference changes</li>
                    <li>Document uploads & large file transfers</li>
                    <li>Medical history updates</li>
                    <li>Hotel & accommodation selection changes</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Write Protection & Access Control</h3>
                  <p className="text-gray-600">
                    The platform enforces data ownership rules through:
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
                    <li>Role-based access controls for each data type</li>
                    <li>Read/write permissions specific to patient or clinic roles</li>
                    <li>Edit history tracking for accountability</li>
                    <li>Approval workflows for sensitive data changes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Live Data Sync Demo Section */}
          <Card>
            <CardHeader>
              <CardTitle>Live Data Sync Demonstration</CardTitle>
              <CardDescription>
                See how data synchronizes in real-time between patient and clinic portals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="patient">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="patient">Patient Portal</TabsTrigger>
                  <TabsTrigger value="clinic">Clinic Portal</TabsTrigger>
                </TabsList>
                
                <TabsContent value="patient" className="mt-4">
                  <SyncStatusPanel 
                    userId="patient-123"
                    userType="patient"
                    targetId="clinic-456"
                    name="John Smith"
                  />
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>The patient portal maintains a secure WebSocket connection with the clinic portal, allowing for instantaneous updates to treatment plans, appointment schedules, and communication.</p>
                    <p className="mt-2">As a patient, you'll receive real-time notifications about treatment updates, appointment confirmations, and messages from your dental provider.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="clinic" className="mt-4">
                  <SyncStatusPanel 
                    userId="clinic-456"
                    userType="clinic"
                    targetId="patient-123"
                    name="Istanbul Dental Clinic"
                  />
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>The clinic portal receives patient data changes in real-time, allowing dental providers to respond quickly to patient needs and keep treatment records up-to-date.</p>
                    <p className="mt-2">Clinic staff can send treatment updates, appointment confirmations, and instant messages that appear immediately in the patient's portal.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataArchitecturePage;