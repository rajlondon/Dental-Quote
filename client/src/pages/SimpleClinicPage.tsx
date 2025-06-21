import React, { useState } from 'react';
// Removed react-i18next
import { useLocation, Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, Building, Users, MessageSquare, Calendar, ClipboardList,
  FileText, BarChart3, Settings, ChevronRight, TrendingUp, Clock, FileBarChart
} from 'lucide-react';

// A simplified clinic page that doesn't have any complex reload detection
// or setup that might cause refresh issues
const SimpleClinicPage: React.FC = () => {
  // Translation removed
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Simple handler for logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation('/portal-login');
      }
    });
  };
  
  // Track active tab
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  
  // Handle navigation action
  const handleNav = (path: string) => {
    toast({
      title: "Navigation",
      description: `Navigating to ${path}`,
    });
  };
  
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 hidden md:block">
        <div className="p-4 bg-primary text-primary-foreground">
          <h2 className="font-bold text-lg">Istanbul Dental Smile</h2>
          <p className="text-xs text-primary-foreground/80">Clinic Management Portal</p>
        </div>
        
        <nav className="p-4 space-y-1">
          <Link href="/simple-clinic" className="flex items-center rounded-md px-3 py-2 text-sm font-medium bg-gray-100 text-primary">
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
          
          <button 
            onClick={() => handleNav('/patients')}
            className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            <Users className="mr-2 h-4 w-4" />
            Patients
          </button>
          
          <button 
            onClick={() => handleNav('/quotes')}
            className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            <ClipboardList className="mr-2 h-4 w-4" />
            Quotes
          </button>
          
          <button 
            onClick={() => handleNav('/appointments')}
            className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            <Calendar className="mr-2 h-4 w-4" />
            Appointments
          </button>
          
          <button 
            onClick={() => handleNav('/messages')}
            className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </button>
          
          <button 
            onClick={() => handleNav('/documents')}
            className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </button>
          
          <Link href="/clinic-treatment-mapper" className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            <FileBarChart className="mr-2 h-4 w-4" />
            Treatment Mapper
          </Link>
          
          <button 
            onClick={() => handleNav('/settings')}
            className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </button>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white p-4 flex justify-between items-center border-b">
          <h1 className="text-xl font-bold hidden md:block">
            Dashboard
          </h1>
          
          <div className="flex items-center space-x-2 md:hidden">
            <h1 className="text-lg font-bold">
              {t("clinic.title", "Clinic Portal")}
            </h1>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')}>
              Back to Website
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout} className="md:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Clinic Dashboard</h2>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                    <Users className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">28</div>
                    <p className="text-xs text-muted-foreground">+2 from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">4 urgent notifications</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">Next: Today at 2:00 PM</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Treatment Value</CardTitle>
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">€42,500</div>
                    <p className="text-xs text-muted-foreground">Monthly revenue</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Patients</CardTitle>
                    <CardDescription>Showing 5 most recent patients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Patient {i}</p>
                              <p className="text-xs text-muted-foreground">Consultation - Veneers</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <p className="text-xs text-muted-foreground mr-2">{i} day{i !== 1 ? 's' : ''} ago</p>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Next 3 scheduled appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { time: 'Today, 2:00 PM', patient: 'Patient A', type: 'Consultation' },
                        { time: 'Tomorrow, 10:30 AM', patient: 'Patient B', type: 'Follow-up' },
                        { time: 'May 2, 3:15 PM', patient: 'Patient C', type: 'Treatment' }
                      ].map((appt, i) => (
                        <div key={i} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{appt.patient}</p>
                              <p className="text-xs text-muted-foreground">{appt.type}</p>
                            </div>
                          </div>
                          <p className="text-xs font-medium">{appt.time}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="account" className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Account Information</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1 text-lg">{user?.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Role</h3>
                        <p className="mt-1 text-lg capitalize">{user?.role}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                        <p className="mt-1 text-lg">{user?.id}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <p className="mt-1 text-lg capitalize">{user?.status || 'active'}</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-2">Clinic Details</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Clinic Name</h3>
                          <p className="mt-1 text-lg">Istanbul Dental Smile</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Location</h3>
                          <p className="mt-1 text-lg">Istanbul, Turkey</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="patients" className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Patient List</h2>
              <p className="text-muted-foreground">This is a placeholder for the patient management interface.</p>
              <Card>
                <CardContent className="pt-6">
                  <p>Patient management coming soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
              <p className="text-muted-foreground">Your recent actions and activity log</p>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {[
                      { action: 'Logged in', time: '2 minutes ago' },
                      { action: 'Viewed patient record', time: '1 day ago' },
                      { action: 'Updated treatment plan', time: '2 days ago' },
                      { action: 'Added new appointment', time: '1 week ago' },
                      { action: 'Sent message to patient', time: '1 week ago' }
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-2">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default SimpleClinicPage;