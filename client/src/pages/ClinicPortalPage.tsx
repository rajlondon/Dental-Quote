import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building, Users, ClipboardList, Calendar, MessageSquare, 
  FileText, BarChart3, Settings, FileBarChart, 
  Menu, LogOut, ChevronRight, Grid3X3, TestTube,
  Clock, TrendingUp, CalendarDays
} from 'lucide-react';
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
import ClinicTreatmentMapperPage from '@/pages/ClinicTreatmentMapperPage';

// Import all clinic section components
import ClinicDashboardSection from '@/components/clinic/ClinicDashboardSection';
import ClinicPatientsSection from '@/components/clinic/ClinicPatientsSection';
import ClinicQuotesSection from '@/components/clinic/ClinicQuotesSection';
import ClinicTreatmentPlansSection from '@/components/clinic/ClinicTreatmentPlansSection';
import ClinicAppointmentsSection from '@/components/clinic/ClinicAppointmentsSection';
import ClinicMessagesSection from '@/components/clinic/ClinicMessagesSection';
import ClinicDocumentsSection from '@/components/clinic/ClinicDocumentsSection';
import ClinicAnalyticsSection from '@/components/clinic/ClinicAnalyticsSection';
import ClinicSettingsSection from '@/components/clinic/ClinicSettingsSection';
import ClinicReportsSection from '@/components/clinic/ClinicReportsSection';
import ClinicPortalTesting from '@/components/portal/ClinicPortalTesting';

interface ClinicPortalPageProps {
  disableAutoRefresh?: boolean;
}

const ClinicPortalPage: React.FC<ClinicPortalPageProps> = ({ disableAutoRefresh = true }) => {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const initialLoadComplete = React.useRef(false);
  
  // When disableAutoRefresh is true, block any programmatic refreshes
  React.useEffect(() => {
    if (disableAutoRefresh && typeof window !== 'undefined') {
      console.log("🛡️ Setting up refresh prevention for ClinicPortalPage");
      
      // Use a safer approach - intercept reload attempts with an event handler
      const preventReload = (e: BeforeUnloadEvent) => {
        if (window.location.pathname.includes('clinic-portal')) {
          console.log("🛡️ Blocked programmatic page reload on clinic portal");
          e.preventDefault();
          e.returnValue = '';
          return '';
        }
      };
      
      // Add event listener
      window.addEventListener('beforeunload', preventReload);
      
      // Cleanup function
      return () => {
        window.removeEventListener('beforeunload', preventReload);
      };
    }
  }, [disableAutoRefresh]);

  // Get auth context for user info and logout functionality
  const { user, logoutMutation } = useAuth();
  
  // CRITICAL FIX: When disableAutoRefresh is true, completely disable WebSocket connections
  useEffect(() => {
    if (disableAutoRefresh && typeof window !== 'undefined') {
      console.log("🔌 Disabling WebSocket connections for clinic portal");
      
      // Block any WebSocket creation attempts globally when in clinic portal
      const originalWebSocket = window.WebSocket;
      
      // Replace WebSocket constructor with a stub that prevents connections
      (window as any).WebSocket = function BlockedWebSocket(url: string) {
        console.log(`⛔ Blocked WebSocket connection attempt to: ${url}`);
        
        // Return a dummy object that has the same interface but does nothing
        return {
          send: () => console.log("⛔ Blocked WebSocket send"),
          close: () => console.log("⛔ Blocked WebSocket close"),
          addEventListener: () => console.log("⛔ Blocked WebSocket addEventListener"),
          removeEventListener: () => console.log("⛔ Blocked WebSocket removeEventListener"),
          readyState: 3, // CLOSED
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3
        };
      };
      
      (window as any).WebSocket.CONNECTING = 0;
      (window as any).WebSocket.OPEN = 1;
      (window as any).WebSocket.CLOSING = 2;
      (window as any).WebSocket.CLOSED = 3;
      
      // Restore WebSocket when unmounting
      return () => {
        (window as any).WebSocket = originalWebSocket;
        console.log("🔄 Restored original WebSocket in clinic portal");
      };
    }
  }, [disableAutoRefresh]);
  
  // Flag to track component mount status
  const isMounted = React.useRef(true);
  
  // SIMPLIFIED: Just a simple effect for initialization - no complicated checks
  useEffect(() => {
    // Skip if no user
    if (!user) {
      return;
    }
    
    console.log("ClinicPortalPage: Initializing for clinic staff user:", user.id);
    
    // Simple straightforward initialization
    initialLoadComplete.current = true;
    
    // Cleanup function for component unmount
    return () => {
      console.log("ClinicPortalPage unmounting");
      isMounted.current = false;
      
      // This prevents issues with WebSocket connection management
      setTimeout(() => {
        if (window.location.pathname !== '/clinic-portal') {
          console.log("Clearing clinic portal mounted flag after navigation");
          (window as any).__clinicPortalMounted = false;
        }
      }, 1000);
    };
  }, [user]);
  
  // Component unmount cleanup effect with advanced WebSocket handling
  useEffect(() => {
    // Set a flag on mount to track this instance
    const instanceId = `clinic-portal-instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    (window as any).__lastClinicPortalInstance = instanceId;
    
    return () => {
      // Prevent WebSocket connection errors on unmount
      if (isMounted.current) {
        console.log("ClinicPortalPage unmounting, performing cleanup");
        
        // Only perform full cleanup if this is the most recent instance
        // This prevents older unmounted instances from clearing newer ones
        if ((window as any).__lastClinicPortalInstance === instanceId) {
          // Clear any stored session data
          sessionStorage.removeItem('clinic_portal_active');
          
          // Disconnect WebSocket safely if this component is responsible for it
          if (user) {
            // Manually trigger WebSocket cleanup via custom event
            // This event is caught by the useWebSocket hook
            const cleanupEvent = new CustomEvent('websocket-component-cleanup', {
              detail: { userId: user.id, componentId: instanceId }
            });
            document.dispatchEvent(cleanupEvent);
            console.log(`Triggered WebSocket cleanup for user ${user.id}`);
          }
        } else {
          console.log("Skipping full cleanup - newer instance exists");
        }
      }
    };
  }, [user]);
  
  // Handle logout with improved cleanup sequence for better reliability
  const handleLogout = async () => {
    try {
      // Clear shared state indicators first to prevent reconnection attempts
      if (user) {
        // Clear connection pooling references
        if ((window as any).__websocketConnections) {
          const userKey = `user-${user.id}`;
          delete (window as any).__websocketConnections[userKey];
          if ((window as any).__websocketLastActivity) {
            delete (window as any).__websocketLastActivity[userKey];
          }
          console.log(`Cleared shared WebSocket references for user ${user.id}`);
        }
      }
      
      // Step 1: Mark session as needing reset (for next login)
      sessionStorage.removeItem('clinic_portal_timestamp');
      sessionStorage.removeItem('cached_user_data');
      sessionStorage.removeItem('cached_user_timestamp');
      
      // Step 2: Clear WebSocket connections to prevent reconnect loops
      console.log("Manually closing any open WebSocket connections");
      document.dispatchEvent(new CustomEvent('manual-websocket-close'));
      
      // Add a brief delay to allow WebSocket to close properly
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Step 3: Parallel processing - server logout and client cleanup
      // A. Server-side session termination with timeout protection
      const logoutPromise = Promise.race([
        fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        // 5 second timeout to prevent hanging
        new Promise((_, reject) => setTimeout(() => reject(new Error("Logout request timeout")), 5000))
      ]).catch(error => {
        // Log but continue even if server logout fails
        console.error("Server logout error:", error);
      });
      
      // B. Client-side cleanup
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Step 4: Complete both operations
      await logoutPromise;
      
      // Step 5: Provide feedback to the user after successful logout
      toast({
        title: t('portal.logout_success', 'Successfully logged out'),
        description: t('portal.logout_message', 'You have been logged out of your account.'),
      });
      
      // Step 6: Redirect to login page
      console.log("Logout sequence complete, redirecting to login page");
      setLocation('/portal-login');
      
    } catch (err) {
      console.error("Logout handler error:", err);
      toast({
        title: t('portal.logout_success', 'Logged out'),
        description: t('portal.logout_error', 'Logout completed with some errors, but you have been signed out.'),
      });
      
      // Fallback: redirect even if something fails
      setLocation('/portal-login');
    }
  };

  // Clinic navigation items
  const navItems = [
    { id: 'dashboard', label: t("clinic.nav.dashboard", "Dashboard"), icon: <Building className="h-5 w-5" /> },
    { id: 'patients', label: t("clinic.nav.patients", "Patients"), icon: <Users className="h-5 w-5" /> },
    { id: 'quotes', label: t("clinic.nav.quotes", "Quotes"), icon: <ClipboardList className="h-5 w-5" /> },
    { id: 'treatmentplans', label: t("clinic.nav.treatment_plans", "Treatment Plans"), icon: <FileText className="h-5 w-5" /> },
    { id: 'treatment_mapper', label: t("clinic.nav.treatment_mapper", "Treatment Mapper"), icon: <Grid3X3 className="h-5 w-5" /> },
    { id: 'appointments', label: t("clinic.nav.appointments", "Appointments"), icon: <Calendar className="h-5 w-5" /> },
    { id: 'messages', label: t("clinic.nav.messages", "Messages"), icon: <MessageSquare className="h-5 w-5" /> },
    { id: 'documents', label: t("clinic.nav.documents", "Documents"), icon: <FileText className="h-5 w-5" /> },
    { id: 'payments', label: t("clinic.nav.payments", "Payments"), icon: <FileBarChart className="h-5 w-5" /> },
    { id: 'reports', label: t("clinic.nav.reports", "Reports"), icon: <FileBarChart className="h-5 w-5" /> },
    { id: 'analytics', label: t("clinic.nav.analytics", "Analytics"), icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'settings', label: t("clinic.nav.settings", "Settings"), icon: <Settings className="h-5 w-5" /> },
    { id: 'testing', label: t("clinic.nav.testing", "Testing Mode"), icon: <TestTube className="h-5 w-5" /> },
  ];

  // Payment section redirect effect
  useEffect(() => {
    if (activeSection === 'payments') {
      // Short timeout to allow the state to update before navigating
      const redirectTimer = setTimeout(() => {
        setLocation('/treatment-payment');
      }, 100);
      return () => clearTimeout(redirectTimer);
    }
  }, [activeSection, setLocation]);

  // Render the active section content
  const renderSection = () => {
    // For the dashboard section, we'll render an embedded dashboard directly
    if (activeSection === 'dashboard') {
      // Hard-coded dashboard data
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
      
      const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
          case 'pending': return 'bg-yellow-500';
          case 'approved': return 'bg-green-500';
          case 'rejected': 
          case 'declined': return 'bg-red-500';
          case 'scheduled': return 'bg-blue-500';
          case 'completed': return 'bg-purple-500';
          default: return 'bg-gray-500';
        }
      };
      
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Pending Appointments Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
                <Clock className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.pendingAppointments}</div>
                <p className="text-xs text-muted-foreground">Appointments awaiting confirmation</p>
              </CardContent>
            </Card>
            
            {/* Total Patients Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalPatients}</div>
                <p className="text-xs text-muted-foreground">Patients associated with your clinic</p>
              </CardContent>
            </Card>
            
            {/* Active Quotes Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Quotes</CardTitle>
                <FileText className="h-5 w-5 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.activeQuotes}</div>
                <p className="text-xs text-muted-foreground">Quotes awaiting response</p>
              </CardContent>
            </Card>
            
            {/* Revenue Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">£{dashboardData.monthlyRevenue}</div>
                <p className="text-xs text-muted-foreground">Current month revenue</p>
              </CardContent>
            </Card>
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
    
    // Handle other sections as before
    switch (activeSection) {
      case 'patients':
        return <ClinicPatientsSection />;
      case 'quotes':
        return <ClinicQuotesSection />;
      case 'treatmentplans':
        return <ClinicTreatmentPlansSection />;
      case 'treatment_mapper':
        return <ClinicTreatmentMapperPage />;
      case 'appointments':
        return <ClinicAppointmentsSection />;
      case 'messages':
        return <ClinicMessagesSection />;
      case 'documents':
        return <ClinicDocumentsSection />;
      case 'payments':
        // Show loading spinner while redirecting to payment page
        return (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        );
      case 'reports':
        return <ClinicReportsSection />;
      case 'analytics':
        return <ClinicAnalyticsSection />;
      case 'settings':
        return <ClinicSettingsSection />;
      case 'testing':
        return <ClinicPortalTesting setActiveSection={setActiveSection} />;
      default:
        // Fallback to embedded dashboard if something goes wrong
        return (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-lg font-medium text-blue-800">Welcome to Your Clinic Dashboard</h3>
            <p className="mt-2 text-blue-600">Please select an option from the menu to continue.</p>
          </div>
        );
    }
  };

  // Sample clinic data (in a real app, this would come from an API/context)
  const clinicData = {
    name: "DentGroup Istanbul",
    role: "Clinic Admin",
    logo: "/images/mydentalfly-logo.png" // Path to the MyDentalFly logo
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Mobile menu button */}
      <div className="block lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar - Desktop (always visible) & Mobile (toggleable) */}
      <div className={`
        fixed inset-y-0 left-0 z-40 bg-white border-r w-64 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Clinic profile section */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <a href="/" className="flex-shrink-0">
                <img 
                  src="/images/mydentalfly-logo.png" 
                  alt="MyDentalFly Logo" 
                  className="h-10 w-auto cursor-pointer" 
                />
              </a>
              <div>
                <h2 className="font-medium">{clinicData.name}</h2>
                <p className="text-sm text-muted-foreground">{clinicData.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors
                    ${activeSection === item.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'}
                  `}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </ScrollArea>

          {/* Logout section */}
          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {t("clinic.nav.logout", "Log out")}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-0">
        {/* Header */}
        <header className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">{t("clinic.title", "Clinic Portal")}</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Language Switcher */}
              <div className="mr-2">
                <Select
                  defaultValue={i18n.language}
                  onValueChange={(value) => {
                    i18n.changeLanguage(value);
                  }}
                >
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">
                      <div className="flex items-center">
                        <span className="mr-2">🇬🇧</span> {t("language.en", "English")}
                      </div>
                    </SelectItem>
                    <SelectItem value="tr">
                      <div className="flex items-center">
                        <span className="mr-2">🇹🇷</span> {t("language.tr", "Türkçe")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="flex items-center gap-1">
                  {t("clinic.back_to_site", "Back to Website")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
            <span>{t("clinic.title", "Clinic Portal")}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">
              {navItems.find(item => item.id === activeSection)?.label}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {renderSection()}
        </main>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default ClinicPortalPage;