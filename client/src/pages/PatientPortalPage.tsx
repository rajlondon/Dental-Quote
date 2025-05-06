import React, { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ensureUuidFormat } from '@/lib/id-converter';
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import TreatmentPlansSection from '@/components/portal/TreatmentPlansSection';

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
import SavedSpecialOffersSection from '@/components/portal/SavedSpecialOffersSection';
import PatientQuotesPage from '@/pages/patient/PatientQuotesPage';
import PatientQuoteXrayUploadPage from '@/pages/patient/PatientQuoteXrayUploadPage';
import PatientQuoteReviewPage from '@/pages/patient/PatientQuoteReviewPage';
import HotelSelectionSection from '@/components/dashboard/HotelSelectionSection';
import HotelAccommodationSection from '@/components/dashboard/HotelAccommodationSection';
import FlightDetailsSection from '@/components/dashboard/FlightDetailsSection';

// Import our components for the quotes section
import PatientQuotesContent from '@/components/patient/PatientQuotesContent-new';
import PatientQuoteDetail from '@/components/patient/PatientQuoteDetail';

// Create a proper wrapper component for quotes section that can use hooks
const QuotesSectionWrapper = () => {
  const { t } = useTranslation();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  // Check URL params for quote ID
  useEffect(() => {
    const quoteId = searchParams.get('quoteId');
    if (quoteId) {
      console.log(`[DEBUG] Found quoteId in URL params: ${quoteId}`);
      setSelectedQuoteId(quoteId);
    }
  }, [searchParams]);
  
  // Use effect hook to refresh quotes data when this section is displayed
  useEffect(() => {
    console.log('[DEBUG] Quotes section wrapper mounted, refreshing quotes data');
    queryClient.invalidateQueries({ queryKey: ['/api/quotes/user'] });
  }, []);
  
  // Handler for going back to quotes list
  const handleBackToQuotes = () => {
    setSelectedQuoteId(null);
    // Clear the quoteId from URL without navigation
    const newUrl = window.location.pathname + window.location.search.replace(/[?&]quoteId=[^&]+/, '');
    window.history.replaceState({}, '', newUrl);
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold mb-6">{t('portal.quotes.title', 'My Quotes')}</h2>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {selectedQuoteId ? (
            // Show the quote detail component when a quote is selected
            <PatientQuoteDetail 
              quoteId={selectedQuoteId} 
              onBack={handleBackToQuotes} 
            />
          ) : (
            // Show the quotes list when no quote is selected
            <PatientQuotesContent 
              onSelectQuote={(id) => {
                console.log(`[DEBUG] Quote selected: ${id}`);
                setSelectedQuoteId(id.toString());
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
const AppointmentsSection = () => <div className="p-4">Appointments functionality would go here</div>;
const DocumentsSection = () => <div className="p-4">Documents functionality would go here</div>;
const SupportSection = () => <div className="p-4">Support functionality would go here</div>;
const ProfileSection = () => <div className="p-4">Profile functionality would go here</div>;
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
      
      {/* Saved Special Offers Section */}
      <div id="saved-offers-section" className="mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t('portal.dashboard.saved_offers', 'Your Saved Special Offers')}</CardTitle>
            <CardDescription>
              {t('portal.dashboard.saved_offers_description', 'View and manage your saved treatment offers and promotions')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  {t('portal.dashboard.saved_offers_prompt', 'Find your saved special offers from clinics including discounts and promotions')}
                </p>
                <Button 
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setActiveSection('saved_offers')}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t('portal.dashboard.view_saved_offers', 'View Saved Offers')}
                </Button>
              </div>
              <div className="hidden md:block">
                <CheckCircle2 className="h-16 w-16 text-blue-200" />
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

interface PatientPortalPageProps {
  initialSection?: string;
  quoteId?: string;
  treatmentLineId?: string;
}

const PatientPortalPage: React.FC<PatientPortalPageProps> = ({ 
  initialSection = 'dashboard',
  quoteId,
  treatmentLineId
}) => {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { logoutMutation, user } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { unreadCount, notifications, markAsRead, markAllAsRead, deleteNotification, generateTestNotifications } = useNotifications();
  
  // Fetch user's quotes for treatment plans with comprehensive error handling
  const { 
    data: userQuotes, 
    isLoading: isLoadingQuotes,
    error: quotesError
  } = useQuery({
    queryKey: ['/api/quotes/user'],
    queryFn: async () => {
      console.log('[DEBUG] Fetching user quotes from API');
      try {
        const response = await apiRequest('GET', '/api/quotes/user');
        const data = await response.json();
        console.log('[DEBUG] User quotes API response:', data);
        
        if (!data.success) {
          console.error('[ERROR] User quotes API returned unsuccessful response:', data);
          return [];
        }
        
        if (!data.data || !Array.isArray(data.data)) {
          console.error('[ERROR] User quotes API returned invalid data format:', data);
          return [];
        }
        
        console.log('[DEBUG] Successfully loaded user quotes:', data.data);
        return data.data;
      } catch (error) {
        console.error('[ERROR] Failed to fetch user quotes:', error);
        throw error;
      }
    }
  });
  
  // Always have userQuotes as an array
  const safeUserQuotes = Array.isArray(userQuotes) ? userQuotes : [];
  
  // Special offers handling: Save pending offers to user account instead of just clearing
  useEffect(() => {
    // Only proceed if we have a logged in user
    if (!user?.id) return;
    
    // Check if we have a pending special offer to save
    const pendingOfferData = sessionStorage.getItem('pendingSpecialOffer');
    const processingOffer = sessionStorage.getItem('processingSpecialOffer');
    const activeOffer = sessionStorage.getItem('activeSpecialOffer');
    
    const saveSpecialOfferToAccount = async (offerData: string) => {
      try {
        // Parse the offer data
        const offer = JSON.parse(offerData);
        
        // Save the offer to the user's account using our new API endpoint
        const response = await fetch('/api/special-offers/save-to-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            specialOfferId: offer.id,
            clinicId: parseInt(offer.clinic_id) || null,
            offerDetails: offer,
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          toast({
            title: "Special Offer Saved",
            description: "We've saved this special offer to your account for future reference.",
            variant: "default"
          });
        } else {
          console.error("Failed to save special offer:", result.message);
          toast({
            title: "Couldn't Save Offer",
            description: "There was an issue saving this offer to your account. You can try again later.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error saving special offer:", error);
        toast({
          title: "Error",
          description: "There was an error processing your special offer.",
          variant: "destructive"
        });
      }
    };
    
    if (pendingOfferData) {
      console.log("📋 Patient portal loaded - saving pending special offer to user account");
      
      // Save the pending offer to the user's account
      saveSpecialOfferToAccount(pendingOfferData);
    }
    
    // Always clear session storage to prevent redirect loops
    if (pendingOfferData || processingOffer || activeOffer) {
      console.log("🧹 Cleaning up special offer session storage");
      
      // Remove all special offer related data from session storage
      sessionStorage.removeItem('pendingSpecialOffer');
      sessionStorage.removeItem('processingSpecialOffer');
      sessionStorage.removeItem('activeSpecialOffer');
    }
  }, [toast, user?.id]);

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
    { id: 'saved_offers', label: 'Saved Offers', icon: <CheckCircle2 className="h-5 w-5" /> },
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
    // Clear all special offer data when logging out
    sessionStorage.removeItem('pendingSpecialOffer');
    sessionStorage.removeItem('processingSpecialOffer');
    sessionStorage.removeItem('activeSpecialOffer');
    
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

  // Initialize based on URL parameters, props, and session storage
  useEffect(() => {
    try {
      // Check for the session flag first
      if (typeof window !== 'undefined') {
        const storedSection = sessionStorage.getItem('patient_portal_section');
        if (storedSection) {
          console.log(`[DEBUG] Setting active section from session storage: ${storedSection}`);
          setActiveSection(storedSection);
          
          // If it's the quotes section, ensure we trigger a quotes data refresh
          if (storedSection === 'quotes') {
            console.log(`[DEBUG] Quotes section activated, refreshing quote data`);
            // Force a refresh of quotes data when the section is selected via session storage
            queryClient.invalidateQueries({ queryKey: ['/api/quotes/user'] });
          }
          
          // Clear the flag to prevent it from affecting future navigation
          sessionStorage.removeItem('patient_portal_section');
          return; // Skip the rest of the initialization
        }
      }
      
      // Handle initialSection from props if no session flag
      if (initialSection && initialSection !== 'dashboard') {
        console.log(`[DEBUG] Setting active section from props: ${initialSection}`);
        setActiveSection(initialSection);
        
        // If the section is quotes, ensure we have fresh data
        if (initialSection === 'quotes') {
          console.log(`[DEBUG] Quotes section activated from props, refreshing quote data`);
          queryClient.invalidateQueries({ queryKey: ['/api/quotes/user'] });
        }
        
        // If we have a quoteId, we may need to handle it in specific sections
        if (quoteId) {
          console.log(`[DEBUG] Quote ID provided: ${quoteId}`);
          
          if (initialSection === 'quotes') {
            // For quotes section, the quoteId will be handled by PatientQuotesPage
            console.log(`[DEBUG] Setting quotes section with quoteId: ${quoteId}`);
          } else if (initialSection === 'treatment_plan') {
            // For treatment_plan section, the quoteId will be passed to TreatmentPlansSection
            console.log(`[DEBUG] Setting treatment_plan section with quoteId: ${quoteId}`);
          }
        }
        
        // If we have a treatmentLineId, direct to the treatments section and prepare to show details
        if (treatmentLineId) {
          console.log(`[DEBUG] Treatment Line ID provided: ${treatmentLineId}`);
          
          // Force treatment_plan section when a specific treatment line is requested
          if (initialSection === 'treatments') {
            console.log(`[DEBUG] Setting treatment_plan section with treatment line: ${treatmentLineId}`);
            setActiveSection('treatment_plan');
            
            // Store the treatment line ID in session storage for the component to access
            sessionStorage.setItem('selected_treatment_line_id', treatmentLineId);
          }
        }
        
        // Return early as we've already set the section from props
        return;
      }
      
      // Fall back to URL parameters if no initialSection was provided
      const params = new URLSearchParams(window.location.search);
      const section = params.get('section');
      const booked = params.get('booked');
      const packageName = params.get('package');
      const error = params.get('error');
      
      // Handle section navigation from URL parameters
      if (section && navItems.some(item => item.id === section)) {
        setActiveSection(section);
      }
      
      // Handle package booking success
      if (booked === 'true' && packageName) {
        toast({
          title: "Package Booked Successfully",
          description: `You have successfully booked the ${packageName} package.`,
          variant: "default",
        });
        
        // Clean up URL parameters by replacing with just the current path
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } 
      // Handle package booking error
      else if (error === 'booking-failed' && packageName) {
        toast({
          title: "Booking Failed",
          description: `There was an error booking the ${packageName} package. Please try again or contact support.`,
          variant: "destructive",
        });
        
        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (error) {
      console.error("Error initializing section:", error);
      // Fallback to dashboard if there's an error
      setActiveSection('dashboard');
    }
  }, [toast, initialSection, quoteId, treatmentLineId]);

  // Render the appropriate section based on activeSection
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection setActiveSection={setActiveSection} />;
      case 'messages':
        return <MessagesSection />;
      case 'quotes':
        // Use the proper wrapper component that contains the useEffect hook
        return <QuotesSectionWrapper />;
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
        // Use provided quoteId from props if available, otherwise use latest quote
        let treatmentQuoteId = quoteId;
        
        if (!treatmentQuoteId) {
          // Find and use the latest quote ID if available using our safe array
          const latestQuote = safeUserQuotes.length > 0 ? safeUserQuotes[0] : null;
          
          // Convert quote ID to proper UUID format if needed
          treatmentQuoteId = ensureUuidFormat(latestQuote?.id);
        }
        
        console.log('[DEBUG] Using quote ID for treatment plan:', treatmentQuoteId);
        
        return <TreatmentPlansSection quoteId={treatmentQuoteId} />;
      case 'dental_chart':
        return <DentalChartSection />;
      case 'treatment_comparison':
        return <TreatmentComparisonSection />;
      case 'saved_offers':
        return <SavedSpecialOffersSection />;
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