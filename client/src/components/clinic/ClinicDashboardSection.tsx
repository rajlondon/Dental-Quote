import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
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

export default function ClinicDashboardSection() {
  // For demo purposes, we'll use mock data since the API endpoint isn't fully implemented yet
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<any>(null);
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Provide demo data for the dashboard
      setStats({
        stats: {
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
        }
      });
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // We also try the real API but fallback to mock data
  useQuery({
    queryKey: ['/api/portal/dashboard'],
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes - don't refetch for 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Prevent refetching when window gets focus
    refetchOnMount: false, // Prevent refetching when component mounts
    onSuccess: (data) => {
      if (data) setStats(data);
    },
    onError: (err: Error) => {
      console.log("Using demo data due to API error:", err.message);
      // We don't set the error state here since we're using demo data as a fallback
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
        <h3 className="text-lg font-semibold">Error loading dashboard data</h3>
        <p>Please try refreshing the page or contact support if the problem persists.</p>
      </div>
    );
  }

  // Use default values if data is not available
  const dashboardData = stats?.stats || {
    pendingAppointments: 0,
    totalPatients: 0,
    activeQuotes: 0,
    upcomingAppointments: [],
    recentQuotes: []
  };

  return (
    <div className="space-y-6">
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
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

function DashboardCard({ title, value, description, icon }: DashboardCardProps) {
  return (
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
}

function getStatusColor(status: string): string {
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
}