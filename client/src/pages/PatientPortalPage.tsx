import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
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
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { NotificationsPopover } from '@/components/ui/notifications-popover';
import { useNotifications } from '@/hooks/use-notifications';

// Mock data for the dashboard view
const mockBookingData = {
  status: "Confirmed",
  clinic: "DentSpa Istanbul",
  treatmentPlan: {
    items: [
      { treatment: "Dental Implant", quantity: 4 },
      { treatment: "Porcelain Crown", quantity: 6 },
      { treatment: "Root Canal", quantity: 2 }
    ],
    totalGBP: 3200
  },
  unreadMessages: 3,
  upcomingAppointments: 1,
  journeyProgress: 35
};

// Each section component will be defined in its own file in a real application
const MessagingSection = () => <div className="p-4">Messaging functionality would go here</div>;
const AppointmentsSection = () => <div className="p-4">Appointments functionality would go here</div>;
const DocumentsSection = () => <div className="p-4">Documents functionality would go here</div>;
const SupportSection = () => <div className="p-4">Support functionality would go here</div>;
const ProfileSection = () => <div className="p-4">Profile functionality would go here</div>;
const TreatmentPlanSection = () => <div className="p-4">Treatment Plan details would go here</div>;
const DentalChartSection = () => <div className="p-4">Dental chart would go here</div>;
const TreatmentComparisonSection = () => <div className="p-4">Treatment comparison would go here</div>;
const PatientPortalTesting = ({ setActiveSection }: { setActiveSection: (section: string) => void }) => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Testing Area</h2>
    <Button onClick={() => setActiveSection('dashboard')}>Back to Dashboard</Button>
  </div>
);

// Dashboard section component interface
interface DashboardSectionProps {
  setActiveSection: (section: string) => void;
}

// Dashboard section component
const DashboardSection: React.FC<DashboardSectionProps> = ({ setActiveSection }) => {
  const { t } = useTranslation();
  const [hotelViewMode, setHotelViewMode] = useState<'selection' | 'confirmed' | 'self-arranged'>('selection');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {t('portal.dashboard.title', 'Dashboard')}
        </h2>
      </div>
      
      {/* Mobile Navigation Hint - Only visible on mobile */}
      <div className="md:hidden p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-full p-2 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-blue-800">
              {t('portal.dashboard.mobile_hint_title', 'Explore Your Dashboard')}
            </h3>
            <p className="text-sm text-blue-600">
              {t('portal.dashboard.mobile_hint_description', 'Scroll down to see all sections including your dental journey, hotel options, and flight details')}
            </p>
            <div className="flex items-center mt-2 text-blue-700 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
              {t('portal.dashboard.hamburger_hint', 'Tap the menu icon for more options')}
            </div>
          </div>
        </div>
        
        {/* Quick section links for mobile */}
        <div className="mt-3 pt-3 border-t border-blue-100">
          <p className="text-sm font-medium text-blue-700 mb-2">
            {t('portal.dashboard.quick_links', 'Quick Navigation')}:
          </p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                const nextStepsElement = document.getElementById('next-steps-section');
                nextStepsElement?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs bg-white text-blue-600 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50"
            >
              {t('portal.dashboard.next_steps', 'Next Steps')}
            </button>
            <button 
              onClick={() => {
                const journeyElement = document.getElementById('dental-journey-section');
                journeyElement?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs bg-white text-blue-600 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50"
            >
              {t('portal.dashboard.your_journey', 'Dental Journey')}
            </button>
            <button 
              onClick={() => {
                const hotelElement = document.getElementById('hotel-section');
                hotelElement?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs bg-white text-blue-600 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50"
            >
              {t('portal.dashboard.hotel', 'Hotel Options')}
            </button>
            <button 
              onClick={() => {
                const flightElement = document.getElementById('flight-section');
                flightElement?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs bg-white text-blue-600 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-50"
            >
              {t('portal.dashboard.flight_details', 'Flight Details')}
            </button>
          </div>
        </div>
      </div>
      
      {/* Dashboard status cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t('portal.dashboard.booking_status', 'Booking Status')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Badge className="bg-green-500">{mockBookingData.status}</Badge>
              <span className="ml-2 text-gray-600">{t('portal.dashboard.deposit_paid', 'Deposit Paid')}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {t('portal.dashboard.clinic', 'Clinic')}: <strong>{mockBookingData.clinic}</strong>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t('portal.dashboard.treatment_plan', 'Treatment Plan')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {mockBookingData.treatmentPlan.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>{item.treatment}</span>
                  <span className="text-gray-600">x{item.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
              <span className="font-medium">{t('portal.dashboard.total', 'Total')}:</span>
              <span className="font-bold">£{mockBookingData.treatmentPlan.totalGBP}</span>
            </div>
            <div className="space-y-2 mt-4">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setActiveSection('treatment_plan')}
              >
                {t('portal.dashboard.view_treatment_plan', 'View Full Treatment Plan')}
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setActiveSection('treatment_comparison')}
              >
                {t('portal.dashboard.compare_treatments', 'Compare Treatment Options')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t('portal.dashboard.notifications', 'Notifications')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
                  <span>{t('portal.dashboard.unread_messages', 'Unread Messages')}</span>
                </div>
                <Badge className="bg-blue-500">{mockBookingData.unreadMessages}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-500 mr-2" />
                  <span>{t('portal.dashboard.upcoming_appointments', 'Upcoming Appointments')}</span>
                </div>
                <Badge className="bg-green-500">{mockBookingData.upcomingAppointments}</Badge>
              </div>
              
              <Button variant="outline" className="w-full mt-2">
                {t('portal.dashboard.view_all', 'View All Notifications')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* More dashboard content would go here... */}
    </div>
  );
};

const PatientPortalPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { logoutMutation } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { unreadCount, notifications } = useNotifications();

  // Nav items with icons
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="h-5 w-5" />, notificationCount: 3 },
    { id: 'appointments', label: 'Appointments', icon: <Calendar className="h-5 w-5" />, notificationCount: 1 },
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
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation('/auth');
        toast({
          title: t('auth.logout_success', 'Logged out successfully'),
          description: t('auth.logout_message', 'You have been logged out of your account'),
        });
      }
    });
  };

  // Initialize based on URL parameters
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const section = params.get('section');
      if (section && navItems.some(item => item.id === section)) {
        setActiveSection(section);
      }
    } catch (error) {
      console.error("Error parsing URL parameters:", error);
      // Fallback to dashboard if there's an error
      setActiveSection('dashboard');
    }
  }, []);

  // Render the appropriate section based on activeSection
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection setActiveSection={setActiveSection} />;
      case 'messages':
        return <MessagingSection />;
      case 'appointments':
        return <AppointmentsSection />;
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
        return <DashboardSection setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <img className="h-8 w-auto" src="/logo.svg" alt="MyDentalFly" />
            <h1 className="ml-2 text-xl font-bold text-gray-900">MyDentalFly</h1>
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
              onClick={() => setLocation('/account-settings')}
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
                    <img className="h-8 w-auto" src="/logo.svg" alt="MyDentalFly" />
                    <h1 className="ml-2 text-xl font-bold text-gray-900">MyDentalFly</h1>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {t('portal.welcome', 'Welcome back')}
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
                    onClick={() => setLocation('/account-settings')}
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
            <NotificationsPopover notifications={notifications} unreadCount={unreadCount} />
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
              <NotificationsPopover notifications={notifications} unreadCount={unreadCount} />
              
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

export default PatientPortalPage;