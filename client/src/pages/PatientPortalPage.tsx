import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
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
  BarChart2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

// Import client portal components
import MessagingSection from '@/components/portal/MessagingSection';
import DocumentsSection from '@/components/portal/DocumentsSection';
import TreatmentPlanSection from '@/components/portal/TreatmentPlanSection';
import AppointmentsSection from '@/components/portal/AppointmentsSection';
import SupportSection from '@/components/portal/SupportSection';
import ProfileSection from '@/components/portal/ProfileSection';
import DentalChartSection from '@/components/portal/DentalChartSection';
import TreatmentComparisonSection from '@/components/portal/TreatmentComparisonSection';
import HotelAccommodationSection from '@/components/dashboard/HotelAccommodationSection';
import HotelSelectionSection from '@/components/dashboard/HotelSelectionSection';
import FlightDetailsSection from '@/components/dashboard/FlightDetailsSection';
import { 
  EXAMPLE_BOOKING, 
  EXAMPLE_CLINIC_HOTEL_OPTIONS, 
  EXAMPLE_SELF_ARRANGED_STATUS,
  EXAMPLE_FLIGHT_DETAILS
} from '@/components/dashboard/exampleHotelData';

// Temporary Mock Data
const mockUserData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+44 7123 456789',
};

const mockBookingData = {
  id: 123,
  clinic: 'DentGroup Istanbul',
  status: 'confirmed',
  depositPaid: true,
  treatmentPlan: {
    items: [
      { treatment: 'Dental Implant', quantity: 2 },
      { treatment: 'Dental Crown', quantity: 4 },
    ],
    totalGBP: 1800,
  },
  unreadMessages: 3,
  upcomingAppointments: 1,
};

// Navigation items
const navItems = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, id: 'dashboard' },
  { label: 'Messages', icon: <MessageSquare className="h-5 w-5" />, id: 'messages', notificationCount: 3 },
  { label: 'Treatment Plan', icon: <FileText className="h-5 w-5" />, id: 'treatment_plan' },
  { label: 'Dental Chart', icon: <Stethoscope className="h-5 w-5" />, id: 'dental_chart' },
  { label: 'Treatment Comparison', icon: <BarChart2 className="h-5 w-5" />, id: 'treatment_comparison' },
  { label: 'Appointments', icon: <Calendar className="h-5 w-5" />, id: 'appointments' },
  { label: 'Documents', icon: <FileText className="h-5 w-5" />, id: 'documents' },
  { label: 'Support', icon: <UserCog className="h-5 w-5" />, id: 'support' },
  { label: 'My Details', icon: <Users className="h-5 w-5" />, id: 'profile' },
];

// Patient portal page component
const PatientPortalPage: React.FC = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Handle navigation
  const handleNavigation = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileNavOpen(false);
  };

  // Handle logout - modified to simply redirect without authentication
  const handleLogout = () => {
    toast({
      title: t('portal.back_to_main', 'Returning to main site'),
      description: t('portal.demo_mode', 'This is operating in demo mode - no authentication required.'),
    });
    // Use direct URL navigation for reliability
    window.location.href = '/';
  };

  // Check URL for section parameter with more robust parsing
  useEffect(() => {
    try {
      // Get the hash part of the URL (e.g., #/client-portal?section=messages or #/patient-portal?section=messages)
      const hash = window.location.hash;
      
      // Check if there are query parameters
      if (hash.includes('?')) {
        // Extract the query string part
        const queryString = hash.split('?')[1];
        const params = new URLSearchParams(queryString);
        
        // Get section parameter
        const sectionParam = params.get('section');
        
        // Only set active section if it's valid
        if (sectionParam && navItems.some(item => item.id === sectionParam)) {
          setActiveSection(sectionParam);
          console.log(`Setting active section from URL: ${sectionParam}`);
        }
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
      default:
        return <DashboardSection setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <img 
              src="/images/mydentalfly-logo.png" 
              alt="MyDentalFly Logo" 
              className="h-10 w-auto mb-2" 
            />
          </div>
          <h1 className="text-xl font-bold text-blue-600">
            {t('portal.title', 'Patient Portal')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('portal.welcome', 'Welcome back')}
          </p>
        </div>
        
        <Separator />
        
        <nav className="flex-1 p-4">
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
        
        <div className="p-4 mt-auto">
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
          
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-500">
              {t('portal.need_help', 'Need help?')} <br />
              <a href="tel:+447572445856" className="text-blue-600 hover:underline">+44 7572 445856</a><br />
              <a href="mailto:info@istanbuldentalsmile.co.uk" className="text-blue-600 hover:underline">info@istanbuldentalsmile.co.uk</a>
            </p>
          </div>
        </div>
      </aside>
      
      {/* Mobile Header and Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-30 border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <img 
              src="/images/mydentalfly-logo.png" 
              alt="MyDentalFly Logo" 
              className="h-10 w-auto mr-3 shadow-sm border border-gray-100 rounded-md p-1" 
            />
            <h1 className="text-lg font-bold text-blue-600">
              {t('portal.title', 'Patient Portal')}
            </h1>
          </div>
          
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <img 
                      src="/images/mydentalfly-logo.png" 
                      alt="MyDentalFly Logo" 
                      className="h-12 w-auto mb-2 shadow-sm border border-gray-100 rounded-md p-1" 
                    />
                    <h2 className="text-lg font-bold text-blue-600">
                      {t('portal.title', 'Patient Portal')}
                    </h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {t('portal.welcome', 'Welcome back')}
                </p>
              </div>
              
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
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 md:p-8 p-4 md:pt-8 pt-20 overflow-auto">
        {renderActiveSection()}
      </main>
    </div>
  );
};

// Dashboard section component
interface DashboardSectionProps {
  setActiveSection: (section: string) => void;
}

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

      {/* Next Steps and Dental Journey Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Next Steps */}
        <Card id="next-steps-section">
          <CardHeader>
            <CardTitle>{t('portal.dashboard.next_steps', 'Next Steps')}</CardTitle>
            <CardDescription>
              {t('portal.dashboard.to_do', 'Things you need to do')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-blue-600 text-xs font-medium">1</span>
                </div>
                <div>
                  <p className="font-medium">{t('portal.dashboard.upload_xrays', 'Upload your dental X-rays')}</p>
                  <p className="text-sm text-gray-600">
                    {t('portal.dashboard.upload_description', 'This helps your dentist provide an accurate treatment plan')}
                  </p>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-blue-600 text-xs font-medium">2</span>
                </div>
                <div>
                  <p className="font-medium">{t('portal.dashboard.complete_medical', 'Complete your medical history form')}</p>
                  <p className="text-sm text-gray-600">
                    {t('portal.dashboard.medical_description', 'Your health information is important for safe treatment')}
                  </p>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-blue-600 text-xs font-medium">3</span>
                </div>
                <div>
                  <p className="font-medium">{t('portal.dashboard.schedule_consultation', 'Schedule your online consultation')}</p>
                  <p className="text-sm text-gray-600">
                    {t('portal.dashboard.consultation_description', 'Discuss your treatment plan with your dentist')}
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        {/* Your Dental Journey */}
        <Card id="dental-journey-section">
          <CardHeader>
            <CardTitle>{t('portal.dashboard.your_journey', 'Your Dental Journey')}</CardTitle>
            <CardDescription>
              {t('portal.dashboard.journey_description', 'Track your progress through the treatment process')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-8 relative">
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-green-100 border-4 border-white flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <h3 className="font-medium">{t('portal.dashboard.step1', 'Initial Quote & Booking')}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('portal.dashboard.step1_description', 'You\'ve received your quote and secured your booking with a deposit')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('portal.dashboard.completed', 'Completed')}
                  </p>
                </div>
                
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  </div>
                  <h3 className="font-medium">{t('portal.dashboard.step2', 'Consultation & Treatment Planning')}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('portal.dashboard.step2_description', 'Your dentist will review your records and create a personalized treatment plan')}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    {t('portal.dashboard.in_progress', 'In Progress')}
                  </p>
                </div>
                
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                  </div>
                  <h3 className="font-medium text-gray-500">{t('portal.dashboard.step3', 'Travel & Treatment')}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('portal.dashboard.step3_description', 'Travel to Istanbul and receive your dental treatment')}
                  </p>
                </div>
                
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                  </div>
                  <h3 className="font-medium text-gray-500">{t('portal.dashboard.step4', 'Aftercare & Follow-up')}</h3>
                  <p className="text-sm text-gray-500 mt-1">
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
            <CardTitle className="text-lg">Demonstration Controls</CardTitle>
            <CardDescription>Toggle between different accommodation views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
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
          </CardContent>
        </Card>

        {/* Hotel Selection View - Multiple hotel options to choose from */}
        {hotelViewMode === 'selection' && (
          <HotelSelectionSection 
            hotelOptions={EXAMPLE_CLINIC_HOTEL_OPTIONS}
            checkInDate={new Date('2025-06-10')}
            checkOutDate={new Date('2025-06-17')}
            numberOfGuests={2}
            clinicName="DentGroup Istanbul"
            showSelfArrangedOption={true}
            onSelectHotel={(hotelId) => console.log('Selected hotel ID:', hotelId)}
            onAddSelfArranged={(data) => console.log('Self-arranged data:', data)}
          />
        )}
        
        {/* Confirmed Hotel View - After a hotel has been selected and confirmed */}
        {hotelViewMode === 'confirmed' && (
          <HotelAccommodationSection 
            hotelBooking={EXAMPLE_BOOKING} 
            isLoading={false} 
          />
        )}
        
        {/* Self-Arranged Accommodation View - When user arranges their own hotel */}
        {hotelViewMode === 'self-arranged' && (
          <HotelSelectionSection 
            hotelOptions={EXAMPLE_CLINIC_HOTEL_OPTIONS}
            checkInDate={new Date('2025-06-10')}
            checkOutDate={new Date('2025-06-17')}
            numberOfGuests={2}
            clinicName="DentGroup Istanbul"
            showSelfArrangedOption={true}
            selfArrangedStatus={EXAMPLE_SELF_ARRANGED_STATUS}
            onSelectHotel={(hotelId) => console.log('Selected hotel ID:', hotelId)}
            onAddSelfArranged={(data) => console.log('Self-arranged data:', data)}
          />
        )}
      </div>
      
      {/* Flight Details Section */}
      <div id="flight-section" className="mt-6">
        <FlightDetailsSection />
      </div>
    </div>
  );
};

// Placeholder section component
const PlaceholderSection: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-gray-600 text-center max-w-md">
        This section is coming soon. Here you'll be able to manage your {title.toLowerCase()}.
      </p>
    </div>
  );
};

export default PatientPortalPage;