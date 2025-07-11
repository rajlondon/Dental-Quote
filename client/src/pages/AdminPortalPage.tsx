import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";  // CHANGED: Use working auth

// Placeholder translation function
const t = (key: string, fallback: string) => fallback;

// Interface for component props
interface AdminPortalPageProps {
  disableAutoRefresh?: boolean;
}
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, MessageSquare, FileText, Calendar, BarChart3, 
  ClipboardList, Clock, LogOut, Settings, ChevronRight, Search,
  Bell, Banknote, Grid3X3, Database, Network, TestTube, CheckCircle
} from "lucide-react";
import AdminTreatmentMapperPage from "@/pages/AdminTreatmentMapperPage";
import DataArchitecturePage from "@/pages/DataArchitecturePage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import AdminPortalTesting from "@/components/portal/AdminPortalTesting";
import { queryClient } from "@/lib/queryClient";
import { useDisableRefetch } from "@/lib/adminDisableRefetch";

// Import admin portal components 
import AdminDashboardSection from "@/components/admin/AdminDashboardSection";
import PatientManagementSection from "@/components/admin/PatientManagementSection";
import AdminQuotesSection from "@/components/admin/AdminQuotesSection";
import BookingManagementSection from "@/components/admin/BookingManagementSection";
import MessageManagementSection from "@/components/admin/MessageManagementSection";
import AdminAnalyticsSection from "@/components/admin/AdminAnalyticsSection";
import AdminSettingsSection from "@/components/admin/AdminSettingsSection";
import { OffersApprovalDashboard } from "@/components/admin/OffersApprovalDashboard";
import AdminPortalGuard from "@/components/AdminPortalGuard";
import ConsistentPageHeader from '@/components/ConsistentPageHeader';

// Notification type definition
interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'quote' | 'message' | 'booking' | 'system';
}

const AdminPortalPage: React.FC<AdminPortalPageProps> = ({ disableAutoRefresh = true }) => {
  // Translation removed
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();  // CHANGED: Use working auth
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const initialLoadComplete = React.useRef(false);

  // Flag to track component mount status
  const isMounted = React.useRef(true);

  // Apply the disable refetch hook to prevent unwanted refreshes
  useDisableRefetch();

  // Simple initialization for admin portal
  useEffect(() => {
    // Skip if no user or not admin
    if (!user || user.role !== 'admin') {
      console.log("No admin user found, redirecting to login");
      navigate('/portal-login');  // CHANGED: Use working login
      return;
    }

    console.log("AdminPortalPage: Initializing for admin user:", user.id);

    // Set flag indicating successful initialization
    initialLoadComplete.current = true;
    (window as any).__adminPortalMounted = true;

    // Disable all React Query auto-fetching for this admin session
    console.log("Setting up extra admin portal protections");

    // Cleanup function for component unmount
    return () => {
      console.log("AdminPortalPage unmounting");
      isMounted.current = false;

      setTimeout(() => {
        if (window.location.pathname !== '/admin-portal') {
          console.log("Clearing admin portal mounted flag after navigation");
          (window as any).__adminPortalMounted = false;
        }
      }, 1000);
    };
  }, [user, navigate]);  // CHANGED: Use user instead of adminUser

  // CHANGED: Updated logout handler to use working auth
  const handleLogout = () => {
    try {
      // Use both storage options to ensure the guard allows the navigation
      localStorage.setItem('admin_logout_in_progress', 'true');
      sessionStorage.setItem('admin_intentional_logout', 'true');

      // Mark the navigation as intentional
      if (typeof window.markAdminPortalNavigation === 'function') {
        window.markAdminPortalNavigation();
      }

      // Use the working logout mutation
      logoutMutation.mutate();

      // Clear additional admin-specific storage
      localStorage.removeItem('admin_session');
      localStorage.removeItem('auth_guard');
      sessionStorage.clear();

      // Navigate to home
      navigate('/');
    } catch (err) {
      console.error("Admin logout error:", err);
      // Force redirect to home page as a fallback
      window.location.replace('/');
    }
  };

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Quote Request",
      description: "Sarah Johnson requested a quote for dental implants",
      time: "10 minutes ago",
      read: false,
      type: 'quote'
    },
    {
      id: "2",
      title: "New Message",
      description: "David Smith sent a message about his upcoming appointment",
      time: "1 hour ago",
      read: false,
      type: 'message'
    },
    {
      id: "3",
      title: "Booking Confirmed",
      description: "Michael Brown confirmed his booking for June 15",
      time: "3 hours ago",
      read: true,
      type: 'booking'
    }
  ]);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been marked as read",
    });
  };

  const unreadNotificationsCount = notifications.filter(notification => !notification.read).length;

  // Sidebar items configuration
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="h-5 w-5" /> },
    { id: "patients", label: "Patients", icon: <Users className="h-5 w-5" /> },
    { id: "quotes", label: "Quote Requests", icon: <ClipboardList className="h-5 w-5" /> },
    { id: "bookings", label: "Bookings", icon: <Calendar className="h-5 w-5" /> },
    { id: "payments", label: "Payments", icon: <Banknote className="h-5 w-5" /> },
    { id: "messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
    { id: "documents", label: "Documents", icon: <FileText className="h-5 w-5" /> },
    { id: "offers_approval", label: "Content Approval", icon: <CheckCircle className="h-5 w-5" /> },
    { id: "treatment_mapper", label: "Treatment Mapper", icon: <Grid3X3 className="h-5 w-5" /> },
    { id: "portal_communication", label: "Portal Communication Tester", icon: <TestTube className="h-5 w-5" /> },
    { id: "data_architecture", label: "Data Architecture", icon: <Network className="h-5 w-5" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { id: "testing", label: "Testing", icon: <TestTube className="h-5 w-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> }
  ];

  // Render the active section content
  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboardSection />;
      case "patients":
        return <PatientManagementSection />;
      case "quotes":
        return <AdminQuotesSection />;
      case "bookings":
        return <BookingManagementSection />;
      case "messages":
        return <MessageManagementSection />;
      case "analytics":
        return <AdminAnalyticsSection />;
      case "settings":
        return <AdminSettingsSection />;
      case "treatment_mapper":
        return <AdminTreatmentMapperPage />;
      case "data_architecture":
        return <DataArchitecturePage />;
      case "offers_approval":
        return <OffersApprovalDashboard />;
      case "portal_communication":
        // Redirect to the portal communication tester page
        if (typeof window !== 'undefined') {
          window.location.href = '/portal-communication-test';
        }
        return <div className="p-8 text-center">Redirecting to Portal Communication Tester...</div>;
      case "testing":
        return <AdminPortalTesting setActiveSection={setActiveSection} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-500 mb-4">Coming Soon</h2>
            <p className="text-gray-400 max-w-md">
              This section is currently under development. Please check back later.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* AdminPortalGuard is now applied as a wrapper in App.tsx */}
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Menu Button */}
            <div className="flex items-center">
              <button 
                className="lg:hidden mr-4 text-gray-500 hover:text-gray-600" 
                onClick={toggleMobileMenu}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center">
                <a href="/" className="flex-shrink-0">
                  <img 
                    src="/images/mydentalfly-logo.png" 
                    alt="MyDentalFly Admin Portal" 
                    className="h-10 w-auto mr-2 cursor-pointer" 
                  />
                </a>
                <div className="hidden md:block">
                  <h1 className="text-lg font-semibold text-primary">
                    Admin Portal
                  </h1>
                  <p className="text-xs text-gray-500">
                    Manage your dental concierge service
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Search, Notifications, Profile */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block relative">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={toggleNotifications}
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-medium">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Button>

                {/* Notifications dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-40 border border-gray-100">
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-medium">Notifications</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={markAllNotificationsAsRead}
                        disabled={unreadNotificationsCount === 0}
                      >
                        Mark all as read
                      </Button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                            >
                              <div className="flex items-start">
                                <div className={`p-2 rounded-full mr-3 ${
                                  notification.type === 'quote' 
                                    ? 'bg-green-100 text-green-600' 
                                    : notification.type === 'message' 
                                      ? 'bg-blue-100 text-blue-600' 
                                      : notification.type === 'booking' 
                                        ? 'bg-purple-100 text-purple-600'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {notification.type === 'quote' && <ClipboardList className="h-4 w-4" />}
                                  {notification.type === 'message' && <MessageSquare className="h-4 w-4" />}
                                  {notification.type === 'booking' && <Calendar className="h-4 w-4" />}
                                  {notification.type === 'system' && <Bell className="h-4 w-4" />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{notification.description}</p>
                                  <p className="text-xs text-gray-400 mt-1 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {notification.time}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="h-2.5 w-2.5 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No notifications at this time
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        View all notifications
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Button */}
              <div className="relative inline-block text-left">
                <div className="flex items-center">
                  {/* Use a simple div instead of Avatar to prevent infinite rendering */}
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    A
                  </div>
                  <div className="hidden md:block ml-2 text-sm">
                    <div className="font-medium text-gray-700">Admin</div>
                    <div className="text-xs text-gray-500">{user?.email || "admin@test.com"}</div>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 pt-6 pb-10 overflow-y-auto">
          <nav className="mt-5 px-3 space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start py-2.5 mb-1 ${
                  activeSection === item.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <div className="flex items-center">
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {activeSection === item.id && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 flex z-40">
            <div className="fixed inset-0 bg-black/50" onClick={toggleMobileMenu}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center">
                    <a href="/" className="flex-shrink-0">
                      <img 
                        src="/images/mydentalfly-logo.png" 
                        alt="MyDentalFly Admin Portal" 
                        className="h-8 w-auto mr-2 cursor-pointer" 
                      />
                    </a>
                    <span className="text-lg font-semibold text-primary">
                      Admin Portal
                    </span>
                  </div>
                  <button 
                    className="text-gray-500 hover:text-gray-600" 
                    onClick={toggleMobileMenu}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="mt-5 px-3 space-y-1">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "secondary" : "ghost"}
                      className={`w-full justify-start py-2.5 mb-1 ${
                        activeSection === item.id 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                      }`}
                      onClick={() => {
                        setActiveSection(item.id);
                        toggleMobileMenu();
                      }}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {activeSection === item.id && (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </Button>
                  ))}
                </nav>
              </div>
              <div className="border-t border-gray-200 p-4">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8">
          {/* Page header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {sidebarItems.find(item => item.id === activeSection)?.label || "Dashboard"}
              </h1>
              <div className="space-x-2">
                {activeSection === "dashboard" && (
                  <Button variant="outline" size="sm">
                    View Reports
                  </Button>
                )}
                {activeSection === "patients" && (
                  <Button size="sm">
                    Add Patient
                  </Button>
                )}
                {activeSection === "quotes" && (
                  <Button 
                    size="sm"
                    onClick={() => {
                      // Mark as intentional navigation
                      if (typeof window.markAdminPortalNavigation === 'function') {
                        window.markAdminPortalNavigation();
                      }
                      navigate('/admin/new-quote');
                    }}
                  >
                    Create Quote
                  </Button>
                )}
                {activeSection === "bookings" && (
                  <Button size="sm">
                    New Booking
                  </Button>
                )}
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Last updated {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content for the active section */}
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminPortalPage;
