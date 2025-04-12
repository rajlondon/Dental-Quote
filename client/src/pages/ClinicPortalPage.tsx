import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, MessageSquare, FileText, Calendar, BarChart3, 
  SquarePen, Clock, LogOut, Settings, ChevronRight, Search,
  Bell, Banknote, FileCheck, ClipboardList, LayoutDashboard
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import clinic portal components
import ClinicDashboardSection from "@/components/clinic/ClinicDashboardSection";
import ClinicPatientsSection from "@/components/clinic/ClinicPatientsSection";
import ClinicQuotesSection from "@/components/clinic/ClinicQuotesSection";
import ClinicAppointmentsSection from "@/components/clinic/ClinicAppointmentsSection";
import ClinicMessagesSection from "@/components/clinic/ClinicMessagesSection";
import ClinicDocumentsSection from "@/components/clinic/ClinicDocumentsSection";
import ClinicAnalyticsSection from "@/components/clinic/ClinicAnalyticsSection";
import ClinicSettingsSection from "@/components/clinic/ClinicSettingsSection";
import ClinicReportsSection from "@/components/clinic/ClinicReportsSection";

// Notification type definition
interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'quote' | 'message' | 'appointment' | 'system';
}

const ClinicPortalPage: React.FC = () => {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Quote Request",
      description: "New quote request for dental implants from IDS Admin",
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
      title: "Appointment Confirmed",
      description: "Michael Brown confirmed his appointment for June 15",
      time: "3 hours ago",
      read: true,
      type: 'appointment'
    }
  ]);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/portal");
  };

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
    { id: "dashboard", label: t("clinic.sidebar.dashboard", "Dashboard"), icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "patients", label: t("clinic.sidebar.patients", "Patients"), icon: <Users className="h-5 w-5" /> },
    { id: "quotes", label: t("clinic.sidebar.quotes", "Quote Requests"), icon: <ClipboardList className="h-5 w-5" /> },
    { id: "appointments", label: t("clinic.sidebar.appointments", "Appointments"), icon: <Calendar className="h-5 w-5" /> },
    { id: "reports", label: t("clinic.sidebar.reports", "Medical Reports"), icon: <FileCheck className="h-5 w-5" /> },
    { id: "messages", label: t("clinic.sidebar.messages", "Messages"), icon: <MessageSquare className="h-5 w-5" /> },
    { id: "documents", label: t("clinic.sidebar.documents", "Documents"), icon: <FileText className="h-5 w-5" /> },
    { id: "analytics", label: t("clinic.sidebar.analytics", "Analytics"), icon: <BarChart3 className="h-5 w-5" /> },
    { id: "settings", label: t("clinic.sidebar.settings", "Settings"), icon: <Settings className="h-5 w-5" /> }
  ];

  // Render the active section content
  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <ClinicDashboardSection />;
      case "patients":
        return <ClinicPatientsSection />;
      case "quotes":
        return <ClinicQuotesSection />;
      case "appointments":
        return <ClinicAppointmentsSection />;
      case "reports":
        return <ClinicReportsSection />;
      case "messages":
        return <ClinicMessagesSection />;
      case "documents":
        return <ClinicDocumentsSection />;
      case "analytics":
        return <ClinicAnalyticsSection />;
      case "settings":
        return <ClinicSettingsSection />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-500 mb-4">{t("clinic.section_coming_soon", "Coming Soon")}</h2>
            <p className="text-gray-400 max-w-md">
              {t("clinic.section_under_development", "This section is currently under development. Please check back later.")}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
                <img 
                  src="/images/istanbul-dental-smile-logo.png" 
                  alt="Istanbul Dental Smile" 
                  className="h-10 w-auto mr-2" 
                />
                <div className="hidden md:block">
                  <h1 className="text-lg font-semibold text-primary">
                    {t("clinic.title", "Clinic Portal")} <span className="text-sm text-gray-500">- Maltepe Dental Clinic</span>
                  </h1>
                  <p className="text-xs text-gray-500">
                    {t("clinic.subtitle", "Manage your patients and appointments")}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Search, Notifications, Profile */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block relative">
                <Input
                  type="search"
                  placeholder={t("clinic.search_placeholder", "Search patients...")}
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
                      <h3 className="font-medium">{t("clinic.notifications", "Notifications")}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={markAllNotificationsAsRead}
                        disabled={unreadNotificationsCount === 0}
                      >
                        {t("clinic.mark_all_read", "Mark all as read")}
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
                                      : notification.type === 'appointment' 
                                        ? 'bg-purple-100 text-purple-600'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {notification.type === 'quote' && <ClipboardList className="h-4 w-4" />}
                                  {notification.type === 'message' && <MessageSquare className="h-4 w-4" />}
                                  {notification.type === 'appointment' && <Calendar className="h-4 w-4" />}
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
                          {t("clinic.no_notifications", "No notifications at this time")}
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        {t("clinic.view_all_notifications", "View all notifications")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile Button */}
              <div className="relative inline-block text-left">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/clinic-avatar.png" alt="Clinic Profile" />
                    <AvatarFallback>M</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block ml-2 text-sm">
                    <div className="font-medium text-gray-700">Maltepe Dental</div>
                    <div className="text-xs text-gray-500">clinic@maltepe-dental.com</div>
                  </div>
                </div>
              </div>
              
              {/* Logout Button */}
              <Button variant="ghost" size="icon" onClick={handleLogout} title={t("clinic.logout", "Logout")}>
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
                    <img 
                      src="/images/istanbul-dental-smile-logo.png" 
                      alt="Istanbul Dental Smile" 
                      className="h-8 w-auto mr-2" 
                    />
                    <span className="text-lg font-semibold text-primary">
                      {t("clinic.title", "Clinic Portal")}
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
                  <span>{t("clinic.logout", "Logout")}</span>
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
                {sidebarItems.find(item => item.id === activeSection)?.label || t("clinic.dashboard", "Dashboard")}
              </h1>
              <div className="space-x-2">
                {activeSection === "dashboard" && (
                  <Button variant="outline" size="sm">
                    {t("clinic.view_weekly_schedule", "View Weekly Schedule")}
                  </Button>
                )}
                {activeSection === "patients" && (
                  <Button size="sm">
                    {t("clinic.add_patient", "Add Patient")}
                  </Button>
                )}
                {activeSection === "quotes" && (
                  <Button size="sm">
                    {t("clinic.respond_to_quote", "Respond to Quote")}
                  </Button>
                )}
                {activeSection === "appointments" && (
                  <Button size="sm">
                    {t("clinic.new_appointment", "New Appointment")}
                  </Button>
                )}
                {activeSection === "reports" && (
                  <Button size="sm">
                    {t("clinic.upload_report", "Upload Report")}
                  </Button>
                )}
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {t("clinic.last_updated", "Last updated")} {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content for the active section */}
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};

export default ClinicPortalPage;