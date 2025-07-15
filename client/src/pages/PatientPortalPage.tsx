import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useGlobalAuth } from '@/contexts/GlobalAuthProvider';

// Placeholder translation function
const t = (key: string, fallback: string) => fallback;
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  FileText, 
  UserCog, 
  Users, 
  LogOut,
  Menu,
  X,
  Stethoscope,
  BarChart2,
  TestTube,
  Bell,
  Plane
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { NotificationsPopover } from '@/components/ui/notifications-popover';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import ConsistentPageHeader from '@/components/ConsistentPageHeader';
import { queryClient } from '@/lib/queryClient';

// Real booking data will be fetched from API

// Import components 
import MessagesSection from '@/components/portal/MessagesSection';
import PatientPortalTesting from '@/components/portal/PatientPortalTesting';
import PatientQuotesPage from '@/pages/patient/PatientQuotesPage';
import PatientQuoteXrayUploadPage from '@/pages/patient/PatientQuoteXrayUploadPage';
import PatientQuoteReviewPage from '@/pages/patient/PatientQuoteReviewPage';
import FlightBookingSection from '@/components/portal/FlightBookingSection';
import DashboardSectionComponent from '@/components/portal/DashboardSection';
const AppointmentsSection = () => <div className="p-4">Appointments functionality would go here</div>;
const DocumentsSection = () => <div className="p-4">Documents functionality would go here</div>;
const SupportSection = () => <div className="p-4">Support functionality would go here</div>;
const ProfileSection = () => <div className="p-4">Profile functionality would go here</div>;
const TreatmentPlanSection = () => <div className="p-4">Treatment Plan details would go here</div>;
import DentalChartSection from '@/components/portal/DentalChartSection';
const TreatmentComparisonSection = () => <div className="p-4">Treatment comparison would go here</div>;

// Use the imported dashboard component
const DashboardSection = DashboardSectionComponent;

export default function PatientPortalPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Clear any quote flow cache when accessing patient portal directly
  useEffect(() => {
    const isDirectAccess = !window.location.search.includes('from=quote');
    if (isDirectAccess) {
      // Clear quote flow related cache
      sessionStorage.removeItem('pendingPromoCode');
      sessionStorage.removeItem('pendingPackageData');
      sessionStorage.removeItem('pendingPromoCodeClinicId');
    }

    // Check if there's a transferred quote to display
    const transferredQuoteId = sessionStorage.getItem('transferred_quote_id');
    if (transferredQuoteId && user) {
      // Navigate to quotes section to show the transferred quote
      setActiveSection('quotes');
      // Clear the transferred quote ID flag
      sessionStorage.removeItem('transferred_quote_id');
      
      toast({
        title: "Quote Loaded",
        description: "Your quote has been saved to your account and is ready for review.",
      });
    }
  }, [user]);

  // Use global auth context
  const { user: globalUser, loading: globalLoading } = useGlobalAuth();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { logoutMutation, user } = useAuth();

  // Log user state changes
  React.useEffect(() => {
    console.log('👤 PATIENT PORTAL: User state changed:', user ? `${user.email} (${user.role})` : 'null');
  }, [user]);

  const { unreadCount, notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // Nav items with icons
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { 
      id: 'messages', 
      label: 'Messages', 
      icon: <MessageSquare className="h-5 w-5" />, 
      notificationCount: notifications.filter(n => n.type === 'message' && !n.read).length 
    },
    { 
      id: 'quotes', 
      label: 'My Quotes', 
      icon: <FileText className="h-5 w-5" />,
      notificationCount: notifications.filter(n => n.type === 'quote' && !n.read).length
    },
    { 
      id: 'appointments', 
      label: 'Appointments', 
      icon: <Calendar className="h-5 w-5" />, 
      notificationCount: notifications.filter(n => n.type === 'appointment' && !n.read).length 
    },
    { id: 'flights', label: 'Flight Booking', icon: <Plane className="h-5 w-5" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="h-5 w-5" /> },
    { id: 'treatment_plan', label: 'Treatment Plan', icon: <Stethoscope className="h-5 w-5" /> },
    { id: 'dental_chart', label: 'Dental Chart', icon: <BarChart2 className="h-5 w-5" /> },
    { id: 'support', label: 'Support', icon: <Users className="h-5 w-5" /> },
    { id: 'testing', label: 'Testing', icon: <TestTube className="h-5 w-5" /> }
  ];

  // Handle navigation item click
  const handleNavigation = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileNavOpen(false); // Close mobile nav when an item is selected
  };

  // Handle logout
  const handleLogout = async () => {
    console.log('👤 PATIENT PORTAL: handleLogout called');
    try {
      console.log('👤 PATIENT PORTAL: Calling logoutMutation.mutate()');

      // Clear session storage and local storage first
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.removeItem('authToken');
        localStorage.removeItem('cached_user_data');
      }

      // Call the logout mutation
      await logoutMutation.mutateAsync();

      // Force clear React Query cache
      queryClient.setQueryData(['auth-user'], null);
      queryClient.setQueryData(['global-auth-user'], null);
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      queryClient.invalidateQueries({ queryKey: ['global-auth-user'] });
      queryClient.clear();

      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });

      console.log('👤 PATIENT PORTAL: Logout successful, redirecting...');

      // Small delay to ensure state is cleared
      setTimeout(() => {
        setLocation('/portal-login');
        window.location.reload(); // Force reload to clear any cached state
      }, 100);

    } catch (error) {
      console.error('👤 PATIENT PORTAL: Logout error:', error);

      // Even if logout fails on server, clear client state
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        localStorage.removeItem('authToken');
        localStorage.removeItem('cached_user_data');
      }

      queryClient.setQueryData(['auth-user'], null);
      queryClient.setQueryData(['global-auth-user'], null);
      queryClient.clear();

      toast({
        title: "Logged out",
        description: "You have been logged out locally.",
        variant: "default",
      });

      setTimeout(() => {
        setLocation('/portal-login');
        window.location.reload();
      }, 100);
    }
  };

  // Initialize based on URL parameters
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const section = params.get('section');
      if (section && navItems.some(item => item.id === section)) {
        setActiveSection(section);
      }

      // Handle direct navigation to specific sections
      const path = window.location.pathname;
      if (path.includes('/patient-portal')) {
        const pathSection = path.split('/').pop();
        if (pathSection && navItems.some(item => item.id === pathSection)) {
          setActiveSection(pathSection);
        }
      }
    } catch (error) {
      console.error("Error parsing URL parameters:", error);
      // Fallback to dashboard if there's an error
      setActiveSection('dashboard');
    }
  }, [navItems]);

  // Render the appropriate section based on activeSection
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'messages':
        return <MessagesSection />;
      case 'quotes':
        return <PatientQuotesPage />;
      case 'quote_upload_xrays':
        return <PatientQuoteXrayUploadPage />;
      case 'quote_review':
        return <PatientQuoteReviewPage />;
      case 'appointments':
        return <AppointmentsSection />;
      case 'flights':
        return <FlightBookingSection />;
      case 'documents':
        return <DocumentsSection />;
      case 'support':
        return <SupportSection />;
      case 'profile':
        return <ProfileSection />;
      case 'treatment_plan':
        return <TreatmentPlanSection />;
      case 'dental_chart':
        return <DentalChartSection />;
      case 'treatment_comparison':
        return <TreatmentComparisonSection />;
      case 'testing':
        return <PatientPortalTesting setActiveSection={setActiveSection} />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsistentPageHeader
        title="Patient Portal"
        subtitle={user ? `Welcome back, ${user.firstName || user.lastName || user.email?.split('@')[0] || 'Patient'}!` : "Manage your dental journey"}
      />
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <img 
              className="h-8 w-auto shadow-sm border border-gray-100 rounded-md p-1" 
              src="/images/mydentalfly-logo.png" 
              alt="MyDentalFly" 
            />
            <h1 className="ml-2 text-xl font-bold text-blue-600">MyDentalFly</h1>
          </div>
          <nav className="mt-5 flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={`w-full justify-start mb-1 ${activeSection === item.id ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800' : ''}`}
                onClick={() => handleNavigation(item.id)}
              >
                <div className="flex items-center w-full">
                  <span className="mr-3">{item.icon}</span>
                  <span>{t(`portal.nav.${item.id}`, item.label)}</span>
                  {item.notificationCount && (
                    <Badge className="ml-auto bg-blue-500">{item.notificationCount}</Badge>
                  )}
                </div>
              </Button>
            ))}
          </nav>
          <div className="mt-auto p-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-700 mb-2"
              onClick={() => setActiveSection('profile')}
            >
              <Users className="h-5 w-5 mr-3" />
              {t('portal.my_profile', 'My Profile')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-700 mb-2"
              onClick={() => setActiveSection('profile')}
            >
              <UserCog className="h-5 w-5 mr-3" />
              {t('portal.account_settings', 'Account Settings')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              {t('portal.logout', 'Logout')}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile header and navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pt-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <img 
                      className="h-8 w-auto shadow-sm border border-gray-100 rounded-md p-1" 
                      src="/images/mydentalfly-logo.png" 
                      alt="MyDentalFly" 
                    />
                    <h1 className="ml-2 text-xl font-bold text-blue-600">MyDentalFly</h1>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {user ? `Welcome back, ${user.firstName || user.lastName || user.email?.split('@')[0] || 'Patient'}!` : t('portal.welcome', 'Welcome back')}
                </p>

                <Separator />

                <ScrollArea className="h-[calc(100vh-12rem)]">
                  <nav className="p-4">
                    <ul className="space-y-1">
                      {navItems.map((item) => (
                        <li key={item.id}>
                          <Button
                            variant={activeSection === item.id ? "default" : "ghost"}
                            className={`w-full justify-start ${activeSection === item.id ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800' : ''}`}
                            onClick={() => handleNavigation(item.id)}
                          >
                            <div className="flex items-center w-full">
                              <span className="mr-3">{item.icon}</span>
                              <span>{t(`portal.nav.${item.id}`, item.label)}</span>
                              {item.notificationCount && (
                                <Badge className="ml-auto bg-blue-500">{item.notificationCount}</Badge>
                              )}
                            </div>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </ScrollArea>

                <div className="p-4 mt-auto border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-gray-700 mb-2"
                    onClick={() => {
                      setActiveSection('profile');
                      setMobileNavOpen(false);
                    }}
                  >
                    <Users className="h-5 w-5 mr-3" />
                    {t('portal.my_profile', 'My Profile')}
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-gray-700 mb-2"
                    onClick={() => {
                      setActiveSection('profile');
                      setMobileNavOpen(false);
                    }}
                  >
                    <UserCog className="h-5 w-5 mr-3" />
                    {t('portal.account_settings', 'Account Settings')}
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-gray-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    {t('portal.logout', 'Logout')}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="ml-4">
              <h1 className="text-lg font-semibold">{t(`portal.nav.${activeSection}`, navItems.find(item => item.id === activeSection)?.label || 'Dashboard')}</h1>
            </div>
          </div>

          {/* Add notifications icon in mobile header */}
          <div className="flex items-center space-x-2">
            <NotificationsPopover 
              notifications={notifications} 
              unreadCount={unreadCount}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
              deleteNotification={deleteNotification}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Desktop header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 md:flex hidden">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {t(`portal.nav.${activeSection}`, navItems.find(item => item.id === activeSection)?.label || 'Dashboard')}
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              {/* Desktop notifications icon */}
              <NotificationsPopover 
                notifications={notifications} 
                unreadCount={unreadCount}
                markAsRead={markAsRead}
                markAllAsRead={markAllAsRead}
                deleteNotification={deleteNotification}
              />

              <Button 
                variant="ghost" 
                size="icon"
              >
                <UserCog className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 md:p-8 p-4 md:pt-8 pt-20 overflow-auto">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};