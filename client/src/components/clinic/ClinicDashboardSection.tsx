import React, { useState, memo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Users, FileText, Clock, TrendingUp } from 'lucide-react';

// Define the helper components within the main component's scope
interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const DashboardCard = ({ title, value, description, icon }: DashboardCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-500';
    case 'approved':
      return 'bg-green-500';
    case 'rejected':
    case 'declined':
      return 'bg-red-500';
    case 'scheduled':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

// Main component using React.memo to prevent unnecessary re-renders
const ClinicDashboardSection = memo(() => {
  // For now, we're using hard-coded data instead of API calls
  // This is a temporary solution until we fix the API issues
  const dashboardData = {
    pendingAppointments: 5,
    totalPatients: 28,
    activeQuotes: 12,
    monthlyRevenue: 8450,
    upcomingAppointments: [
      { id: 1, patientName: "John Smith", startTime: new Date().setDate(new Date().getDate() + 1) },
      { id: 2, patientName: "Maria Garcia", startTime: new Date().setDate(new Date().getDate() + 2) },
      { id: 3, patientName: "Ahmed Hassan", startTime: new Date().setDate(new Date().getDate() + 3) }
    ],
    recentQuotes: [
      { id: 101, patientName: "Sarah Johnson", status: "pending", createdAt: new Date().setDate(new Date().getDate() - 1) },
      { id: 102, patientName: "Michael Brown", status: "approved", createdAt: new Date().setDate(new Date().getDate() - 2) },
      { id: 103, patientName: "Emma Wilson", status: "scheduled", createdAt: new Date().setDate(new Date().getDate() - 3) }
    ]
  };

  // Main render
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clinic Dashboard</h2>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white" 
          onClick={() => {
            // Get clinic ID from session storage
            const clinicId = sessionStorage.getItem('clinic_id') || '0';
            // Navigate to the integrated quote flow with clinic ID
            window.location.href = `/quote-flow?clinic=${clinicId}`;
          }}
        >
          Create New Quote
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Pending Appointments" 
          value={dashboardData.pendingAppointments} 
          description="Appointments awaiting confirmation"
          icon={<Clock className="h-5 w-5 text-blue-600" />}
        />
        <DashboardCard 
          title="Total Patients" 
          value={dashboardData.totalPatients} 
          description="Patients associated with your clinic"
          icon={<Users className="h-5 w-5 text-emerald-600" />}
        />
        <DashboardCard 
          title="Active Quotes" 
          value={dashboardData.activeQuotes} 
          description="Quotes awaiting response"
          icon={<FileText className="h-5 w-5 text-yellow-600" />}
        />
        <DashboardCard 
          title="Revenue" 
          value={`£${dashboardData.monthlyRevenue || 0}`} 
          description="Current month revenue"
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
        />
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
          <TabsTrigger value="quotes">Recent Quotes</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          {dashboardData.upcomingAppointments?.length > 0 ? (
            <div className="divide-y divide-gray-200 rounded-md border">
              {dashboardData.upcomingAppointments.map((appointment: any) => (
                <div key={appointment.id} className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{appointment.patientName}</p>
                    <p className="text-sm text-gray-500">{new Date(appointment.startTime).toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-center border rounded-md border-dashed">
              <div className="space-y-2">
                <CalendarDays className="mx-auto h-8 w-8 text-gray-400" />
                <h3 className="text-lg font-semibold">No upcoming appointments</h3>
                <p className="text-sm text-gray-500">New appointments will appear here when scheduled.</p>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="quotes" className="space-y-4">
          {dashboardData.recentQuotes?.length > 0 ? (
            <div className="divide-y divide-gray-200 rounded-md border">
              {dashboardData.recentQuotes.map((quote: any) => (
                <div key={quote.id} className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{quote.patientName}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex h-2 w-2 rounded-full ${getStatusColor(quote.status)}`} />
                      <p className="text-sm text-gray-500">
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)} • 
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-center border rounded-md border-dashed">
              <div className="space-y-2">
                <FileText className="mx-auto h-8 w-8 text-gray-400" />
                <h3 className="text-lg font-semibold">No recent quotes</h3>
                <p className="text-sm text-gray-500">New quotes will appear here when received.</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
});

// Export with displayName for better debugging
ClinicDashboardSection.displayName = 'ClinicDashboardSection';

export default ClinicDashboardSection;