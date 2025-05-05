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
  Bell,
  Hotel,
  Plane,
  CheckCircle2,
  AlertCircle,
  Clock
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
import { queryClient } from '@/lib/queryClient';

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

// Import components 
import MessagesSection from '@/components/portal/MessagesSection';
import PatientPortalTesting from '@/components/portal/PatientPortalTesting';
import PatientQuotesPage from '@/pages/patient/PatientQuotesPage';
import PatientQuoteXrayUploadPage from '@/pages/patient/PatientQuoteXrayUploadPage';
import PatientQuoteReviewPage from '@/pages/patient/PatientQuoteReviewPage';
import HotelSelectionSection from '@/components/dashboard/HotelSelectionSection';
import HotelAccommodationSection from '@/components/dashboard/HotelAccommodationSection';
import FlightDetailsSection from '@/components/dashboard/FlightDetailsSection';
const AppointmentsSection = () => <div className="p-4">Appointments functionality would go here</div>;
const DocumentsSection = () => <div className="p-4">Documents functionality would go here</div>;
const SupportSection = () => <div className="p-4">Support functionality would go here</div>;
const ProfileSection = () => <div className="p-4">Profile functionality would go here</div>;
const TreatmentPlanSection = () => <div className="p-4">Treatment Plan details would go here</div>;
const DentalChartSection = () => <div className="p-4">Dental chart would go here</div>;
const TreatmentComparisonSection = () => <div className="p-4">Treatment comparison would go here</div>;

// Dashboard section component interface
interface DashboardSectionProps {
  setActiveSection: (section: string) => void;
}

// Dashboard section component
const DashboardSection: React.FC<DashboardSectionProps> = ({ setActiveSection }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { notifications } = useNotifications();
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
                <Badge className="bg-blue-500">
                  {notifications.filter(n => n.type === 'message' && !n.read).length || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-500 mr-2" />
                  <span>{t('portal.dashboard.upcoming_appointments', 'Upcoming Appointments')}</span>
                </div>
                <Badge className="bg-green-500">
                  {notifications.filter(n => n.type === 'appointment' && !n.read).length || 0}
                </Badge>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => {
                  // Open the notifications popover or navigate to the notifications page
                  const notificationsElement = document.querySelector('[data-notifications-trigger]');
                  if (notificationsElement) {
                    (notificationsElement as HTMLButtonElement).click();
                  }
                }}
              >
                {t('portal.dashboard.view_all', 'View All Notifications')}
              </Button>
              
              {/* Generate Test Notifications Button - Only visible in non-production environments */}
              {process.env.NODE_ENV !== 'production' && (
                <Button 
                  variant="outline"
                  className="w-full mt-2 text-sm text-amber-600 border-amber-200 hover:bg-amber-50 flex items-center gap-2"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/notifications/generate-test', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                      });
                      
                      const data = await response.json();
                      
                      if (data.success) {
                        toast({
                          title: "Test Notifications Created",
                          description: `Created ${data.count} test notifications`,
                          variant: "default",
                        });
                        
                        // Refresh the notifications list
                        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
                      } else {
                        toast({
                          title: "Error",
                          description: data.message || "Failed to create test notifications",
                          variant: "destructive",
                        });
                      }
                    } catch (error) {
                      console.error("Error generating test notifications:", error);
                      toast({
                        title: "Error",
                        description: "Something went wrong. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Bell className="h-4 w-4" />
                  Generate Test Notifications
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Dental Journey Progress Section */}
      <div id="dental-journey-section" className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t('portal.dashboard.your_journey', 'Your Dental Journey')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="flex items-center mb-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-500 rounded-full" 
                    style={{ width: `${mockBookingData.journeyProgress}%` }}
                  />
                </div>
                <span className="ml-3 text-sm font-medium text-blue-600">
                  {mockBookingData.journeyProgress}%
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex">
                <div className="rounded-full bg-blue-100 p-2 h-10 w-10 flex items-center justify-center mr-3">
                  <span className="text-blue-700 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">{t('portal.dashboard.step1', 'Initial Consultation')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('portal.dashboard.step1_description', 'Complete your dental screening and consultation')}
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="rounded-full bg-blue-100 p-2 h-10 w-10 flex items-center justify-center mr-3">
                  <span className="text-blue-700 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">{t('portal.dashboard.step2', 'Treatment Planning')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('portal.dashboard.step2_description', 'Create your personalized treatment plan with the dentist')}
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="rounded-full bg-blue-100 p-2 h-10 w-10 flex items-center justify-center mr-3">
                  <span className="text-blue-700 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">{t('portal.dashboard.step3', 'Treatment Procedure')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('portal.dashboard.step3_description', 'Undergo your scheduled dental procedures')}
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="rounded-full bg-blue-100 p-2 h-10 w-10 flex items-center justify-center mr-3">
                  <span className="text-blue-700 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-medium">{t('portal.dashboard.step4', 'Follow-up & Care')}</h4>
                  <p className="text-sm text-gray-600">
                    {t('portal.dashboard.step4_description', 'Receive post-treatment support and follow-up care')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Hotel Accommodation Section */}
      <div id="hotel-section" className="grid md:grid-cols-1 gap-6 mt-6">
        {/* Hotel Accommodation Section with view toggle controls */}
        <Card className="mb-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Hotel Accommodation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                variant={hotelViewMode === 'selection' ? 'default' : 'outline'} 
                onClick={() => setHotelViewMode('selection')}
                size="sm"
              >
                Hotel Selection View
              </Button>
              <Button 
                variant={hotelViewMode === 'confirmed' ? 'default' : 'outline'} 
                onClick={() => setHotelViewMode('confirmed')}
                size="sm"
              >
                Confirmed Hotel View
              </Button>
              <Button 
                variant={hotelViewMode === 'self-arranged' ? 'default' : 'outline'} 
                onClick={() => setHotelViewMode('self-arranged')}
                size="sm"
              >
                Self-Arranged View
              </Button>
            </div>
            
            {hotelViewMode === 'selection' && <HotelSelectionSection 
              showSelfArrangedOption={true}
              clinicName="DentSpa Istanbul"
              checkInDate={new Date(2025, 5, 10)}
              checkOutDate={new Date(2025, 5, 17)}
              numberOfGuests={2}
            />}
            {hotelViewMode === 'confirmed' && <HotelAccommodationSection hotelBooking={{
              id: "123",
              hotelName: "Istanbul Luxury Suites",
              roomType: "Deluxe Room",
              checkInDate: "2025-06-10",
              checkOutDate: "2025-06-17",
              numberOfGuests: 2,
              status: "confirmed",
              bookingReference: "HTL-12345",
              hotelAddress: "123 Golden Horn Blvd, Istanbul",
              hotelPhone: "+90 212 555 1234",
              hotelWebsite: "https://istanbulluxurysuites.example.com",
              hotelEmail: "reservations@istanbulluxurysuites.example.com",
              amenities: ["Free WiFi", "Breakfast Included", "Spa Access"],
              distanceToClinic: "1.2 km",
              transferIncluded: true,
              notes: "Near the metro station, 20 minutes from the airport",
              bookingDate: "2025-05-01",
              paymentStatus: "paid",
              cancellationPolicy: "Free cancellation until 48 hours before check-in"
            }} />}
            {hotelViewMode === 'self-arranged' && <HotelSelectionSection 
              showSelfArrangedOption={true}
              clinicName="DentSpa Istanbul"
              checkInDate={new Date(2025, 5, 10)}
              checkOutDate={new Date(2025, 5, 17)}
              numberOfGuests={2}
            />}
          </CardContent>
        </Card>
      </div>
      
      {/* Flight Details Section */}
      <div id="flight-section" className="mt-6 mb-8">
        <FlightDetailsSection />
      </div>
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
  const { unreadCount, notifications, markAsRead, markAllAsRead, deleteNotification, generateTestNotifications } = useNotifications();

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
        // Use direct window.location for more reliable navigation after logout
        window.location.href = '/portal-login';
        
        // Toast notification will be shown before redirect
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
        return <MessagesSection />;
      case 'quotes':
        return <PatientQuotesPage />;
      case 'quote_upload_xrays':
        return <PatientQuoteXrayUploadPage />;
      case 'quote_review':
        return <PatientQuoteReviewPage />;
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
                  {item.notificationCount > 0 && (
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
              onClick={() => window.location.href = '/my-profile'}
            >
              <Users className="h-5 w-5 mr-3" />
              {t('portal.my_profile', 'My Profile')}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-700 mb-2"
              onClick={() => window.location.href = '/account-settings'}
            >
              <UserCog className="h-5 w-5 mr-3" />
              {t('portal.account_settings', 'Account Settings')}
            </Button>
            {/* Only show test notifications button in development */}
            {process.env.NODE_ENV !== 'production' && (
              <Button 
                variant="outline" 
                className="w-full justify-start text-blue-600 mb-2"
                onClick={async () => {
                  try {
                    await generateTestNotifications();
                  } catch (error: any) {
                    toast({
                      title: "Error Creating Test Notifications",
                      description: error.message || "Something went wrong",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Bell className="h-5 w-5 mr-3" />
                Generate Test Notifications
              </Button>
            )}
            
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
                              {item.notificationCount > 0 && (
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
                    onClick={() => window.location.href = '/my-profile'}
                  >
                    <Users className="h-5 w-5 mr-3" />
                    {t('portal.my_profile', 'My Profile')}
                  </Button>
                
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-gray-700 mb-2"
                    onClick={() => window.location.href = '/account-settings'}
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
              generateTestNotifications={generateTestNotifications}
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
                generateTestNotifications={generateTestNotifications}
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

export default PatientPortalPage;