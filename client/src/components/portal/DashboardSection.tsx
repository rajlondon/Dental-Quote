import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarClock, FileText, MessageSquare, Stethoscope, 
  Plane, Home, CreditCard, Clipboard, ArrowRight, ChevronUp, Package
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useQuotes } from '@/hooks/use-quotes';

// Translation function placeholder
const t = (key: string, fallback: string, options?: any) => {
  if (options && options.name) {
    return fallback.replace('{{name}}', options.name);
  }
  return fallback;
};

// This will be replaced by real data from the API

// Sample action items
const patientActions = [
  { 
    id: 1, 
    title: "Review & Approve Treatment Plan", 
    description: "Review your proposed treatment plan and provide your approval to proceed", 
    icon: <Clipboard className="h-5 w-5" />,
    isPrimary: true,
    isComplete: false
  },
  { 
    id: 2, 
    title: "Upload Medical History", 
    description: "Please upload your complete medical history form", 
    icon: <FileText className="h-5 w-5" />,
    isPrimary: false,
    isComplete: true
  },
  { 
    id: 3, 
    title: "Confirm Flight Details", 
    description: "Confirm your flight details for your upcoming trip to Istanbul", 
    icon: <Plane className="h-5 w-5" />,
    isPrimary: false,
    isComplete: false
  },
  { 
    id: 4, 
    title: "Review Accommodation", 
    description: "Review and confirm your hotel reservation in Istanbul", 
    icon: <Home className="h-5 w-5" />,
    isPrimary: false,
    isComplete: false
  },
];

// Timeline events
const timelineEvents = [
  { date: "May 1, 2025", event: "Quote Requested", status: "completed" },
  { date: "May 3, 2025", event: "Quote Generated", status: "completed" },
  { date: "May 5, 2025", event: "Deposit Paid", status: "completed" },
  { date: "May 10, 2025", event: "Treatment Plan Created", status: "completed" },
  { date: "May 15, 2025", event: "Pre-Travel Consultation", status: "active" },
  { date: "June 14, 2025", event: "Travel to Istanbul", status: "upcoming" },
  { date: "June 15, 2025", event: "Initial Consultation", status: "upcoming" },
  { date: "June 16-20, 2025", event: "Treatment Period", status: "upcoming" },
  { date: "June 21, 2025", event: "Return Travel", status: "upcoming" },
  { date: "July 15, 2025", event: "Follow-up Consultation", status: "upcoming" },
];

const DashboardSection: React.FC = () => {
  const { user } = useAuth();
    const { userQuotesQuery } = useQuotes();

    const [pendingQuoteData, setPendingQuoteData] = useState<any>(null);
    const [packageData, setPackageData] = useState<any>(null);
    const [clinicId, setClinicId] = useState<string | null>(null);

  // Check for test patient data
  const testPatientData = sessionStorage.getItem('test_patient_data');
  const parsedTestData = testPatientData ? JSON.parse(testPatientData) : null;

    useEffect(() => {
        if (user) {
            userQuotesQuery.refetch();
        }

        // Aggressively check for quote data with retry mechanism
        const loadQuoteData = () => {
            console.log('🔍 DASHBOARD: Loading quote data from storage...');

            // Load pending quote data from localStorage
            const storedQuoteData = localStorage.getItem('treatmentPlanData');
            if (storedQuoteData) {
                console.log('📋 DASHBOARD: Found treatment plan data:', storedQuoteData);
                setPendingQuoteData(JSON.parse(storedQuoteData));
            } else {
                console.log('📋 DASHBOARD: No treatment plan data found');
            }

            // Load package data from sessionStorage
            const storedPackageData = sessionStorage.getItem('pendingPackageData');
            if (storedPackageData) {
                console.log('📦 DASHBOARD: Found package data:', storedPackageData);
                setPackageData(JSON.parse(storedPackageData));
            } else {
                console.log('📦 DASHBOARD: No package data found');
            }

            // Load clinic id from sessionStorage
            const storedClinicId = sessionStorage.getItem('pendingPromoCodeClinicId');
            if (storedClinicId) {
                console.log('🏥 DASHBOARD: Found clinic ID:', storedClinicId);
                setClinicId(storedClinicId);
            } else {
                console.log('🏥 DASHBOARD: No clinic ID found');
            }
        };

        // Load immediately
        loadQuoteData();

        // Also set up a listener for storage changes (in case data is added after login)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'treatmentPlanData' || e.key === 'pendingPackageData' || e.key === 'pendingPromoCodeClinicId') {
                console.log('🔄 DASHBOARD: Storage changed, reloading data...');
                loadQuoteData();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Force a check after a short delay to catch any race conditions
        const timeoutId = setTimeout(() => {
            console.log('⏰ DASHBOARD: Delayed check for quote data...');
            loadQuoteData();
        }, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearTimeout(timeoutId);
        };
    }, [user]);

    // Get the most recent quote for dashboard display
    const recentQuote = userQuotesQuery.data?.[0] || null;

  // Mock data for patient dashboard
  const mockPatientData = {
    upcomingAppointments: [
      {
        id: 1,
        date: '2024-07-15',
        time: '10:00 AM',
        clinic: parsedTestData?.treatmentPlan?.clinicName || 'Maltepe Dental Clinic',
        treatment: parsedTestData?.treatmentPlan?.treatments?.[0]?.name || 'Premium Porcelain Veneer Consultation',
        status: 'confirmed'
      }
    ],
    messages: 3,
    currentTreatmentPlan: parsedTestData?.treatmentPlan || {
      clinic: 'Maltepe Dental Clinic',
      treatments: [
        { name: 'Premium Porcelain Veneer', quantity: 10, status: 'planned' },
        { name: 'Zoom Whitening', quantity: 1, status: 'planned' }
      ],
      totalCost: '£2,258',
      startDate: '2024-07-20',
      packageName: 'Hollywood Smile Vacation Package'
    },
    medicalDocuments: 5,
    paymentHistory: [
      { date: '2024-05-05', description: 'Deposit Payment', amount: '£500', status: 'confirmed' }
    ],
    tripDetails: {
      flight: 'TK789 - July 14, 2024',
      hotel: 'The Ritz-Carlton, Istanbul',
      transfer: 'Private car service arranged'
    }
  };

  // Fetch real patient data - only if user is authenticated
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['patient-dashboard', user?.id],
    queryFn: async () => {
      try {
        const response = await api.get('/api/portal/patient/dashboard');
        return response.data;
      } catch (error) {
        console.log('Dashboard API call failed:', error);
        return null;
      }
    },
    enabled: !!user?.id && !!user?.email,
    staleTime: 60000, // 1 minute
    retry: false // Don't retry failed auth requests
  });

  // Fetch bookings data separately - only if user is authenticated
  const { data: bookingData, isLoading: bookingLoading } = useQuery({
    queryKey: ['patient-bookings', user?.id],
    queryFn: async () => {
      try {
        const response = await api.get('/api/portal/patient/bookings');
        return response.data;
      } catch (error) {
        console.log('Bookings API call failed:', error);
        return null;
      }
    },
    enabled: !!user?.id && !!user?.email,
    staleTime: 60000, // 1 minute
    retry: false // Don't retry failed auth requests
  });

  // Use real user data or fallback to defaults
  const userName = user?.firstName || user?.email || "Patient";
  const hasActiveBooking = bookingData && bookingData.length > 0;

  // Build treatment overview from quote data in storage
    const buildTreatmentOverview = () => {
        const baseName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || "Patient User";

        // Check for quote data in localStorage and sessionStorage
        const hasPendingQuote = pendingQuoteData && (
            Array.isArray(pendingQuoteData) ? pendingQuoteData.length > 0 :
            pendingQuoteData.treatments && pendingQuoteData.treatments.length > 0
        );
        const hasPackageData = packageData && packageData.name;

        console.log('🔍 DASHBOARD: Building treatment overview with:', {
            hasPendingQuote,
            hasPackageData,
            pendingQuoteDataType: Array.isArray(pendingQuoteData) ? 'array' : typeof pendingQuoteData,
            pendingQuoteDataLength: Array.isArray(pendingQuoteData) ? pendingQuoteData.length : 
                (pendingQuoteData?.treatments ? pendingQuoteData.treatments.length : 0),
            packageDataName: packageData?.name,
            clinicId
        });

        // Get clinic name from stored clinic ID
        let clinicName = "No clinic selected yet";
        if (clinicId) {
            const clinicMap: Record<string, string> = {
                'maltepe-dental-clinic': 'Maltepe Dental Clinic',
                'dentgroup-istanbul': 'DentGroup Istanbul',
                'istanbul-dental-care': 'Istanbul Dental Care'
            };
            clinicName = clinicMap[clinicId] || clinicId;
        }

        // Build treatment plan description
        let treatmentPlan = "No active treatment plan";
        if (hasPackageData) {
            treatmentPlan = `${packageData.name} (${packageData.treatments?.length || 0} treatments)`;
        } else if (hasPendingQuote) {
            // Handle both array format and object format
            let treatmentCount = 0;
            if (Array.isArray(pendingQuoteData)) {
                treatmentCount = pendingQuoteData.length;
            } else if (pendingQuoteData.treatments) {
                treatmentCount = pendingQuoteData.treatments.length;
            }
            treatmentPlan = `${treatmentCount} treatment${treatmentCount !== 1 ? 's' : ''} selected`;
        }

        // Determine next appointment message
        let nextAppointment = "Please submit a quote request to begin";
        if (hasPendingQuote || hasPackageData) {
            nextAppointment = "Ready to book consultation";
        }

        // Determine progress
        let progress = 0;
        if (hasPackageData || hasPendingQuote) {
            progress = 25; // Quote/package selected
        }

    return hasActiveBooking ? {
      name: baseName,
      nextAppointment: bookingData[0]?.nextAppointment || nextAppointment,
      treatmentPlan: bookingData[0]?.treatmentPlan || treatmentPlan,
      clinic: bookingData[0]?.clinic || clinicName,
      progress: bookingData[0]?.progress || progress,
      documents: bookingData[0]?.documents || 0,
      messages: bookingData[0]?.messages || 0,
      paymentStatus: bookingData[0]?.paymentStatus || "In Progress",
      trip: bookingData[0]?.trip || {
        flight: "To be booked",
        hotel: "To be selected",
        transfer: "To be arranged"
      },
    } : {
      name: baseName,
      nextAppointment,
      treatmentPlan,
      clinic: clinicName,
      progress,
      documents: 0,
      messages: 0,
      paymentStatus: "No payments made",
      trip: {
        flight: "Not booked",
        hotel: "Not selected", 
        transfer: "Not arranged"
      }
    };
  };

  const treatmentOverview = buildTreatmentOverview();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-primary text-white border-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {t("portal.dashboard.welcome", "Welcome, {{name}}!", { name: userName })}
              </h2>
              <p className="text-primary-foreground/80">
                {t("portal.dashboard.welcome_message", "Your journey to a beautiful new smile is underway.")}
              </p>
            </div>
            <Avatar className="h-16 w-16 border-2 border-white">
              <AvatarFallback className="text-xl bg-primary-foreground text-primary">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t("portal.dashboard.treatment_overview", "Treatment Overview")}</CardTitle>
          <CardDescription>
            {t("portal.dashboard.overview_desc", "Current status of your dental treatment journey")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">{t("portal.dashboard.treatment", "Treatment")}</p>
              <p className="font-medium">{treatmentOverview.treatmentPlan}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">{t("portal.dashboard.clinic", "Clinic")}</p>
              <p className="font-medium">{treatmentOverview.clinic}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">{t("portal.dashboard.next_appointment", "Next Appointment")}</p>
              <p className="font-medium">{treatmentOverview.nextAppointment}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">{t("portal.dashboard.payment_status", "Payment Status")}</p>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {treatmentOverview.paymentStatus}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">{t("portal.dashboard.treatment_progress", "Treatment Progress")}</p>
              <p className="text-sm font-medium">{treatmentOverview.progress}%</p>
            </div>
            <Progress value={treatmentOverview.progress} className="h-2" />
            <p className="text-xs text-gray-500">
              {t("portal.dashboard.progress_message", "Your treatment is on track. Next step: Initial consultation in Istanbul.")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Items & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ALWAYS show the quote data card first if data exists */}
        {(pendingQuoteData || packageData) && (
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center text-green-900">
                  <FileText className="h-5 w-5 mr-2" />
                  {packageData ? 'Package Quote Ready' : 'Treatment Plan Ready'}
                </CardTitle>
                <Badge className="bg-green-600 text-white">
                  Ready to Book
                </Badge>
              </div>
            </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {packageData && (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-700">Package:</span>
                                            <span className="font-medium text-green-900">{packageData.name}</span>
                                        </div>

                                        <div className="text-sm text-green-700">
                                            <p className="mb-2">{packageData.description}</p>
                                            {packageData.treatments && packageData.treatments.length > 0 && (
                                                <div>
                                                    <span className="font-medium">Included treatments:</span>
                                                    <ul className="mt-1 space-y-1">
                                                        {packageData.treatments.map((treatment: any, index: number) => (
                                                            <li key={index} className="text-xs">
                                                                • {treatment.quantity}x {treatment.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {packageData.originalPrice && packageData.packagePrice && (
                                            <div className="bg-green-100 rounded-lg p-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-green-700">Original Price:</span>
                                                    <span className="line-through text-green-600">£{packageData.originalPrice}</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-bold">
                                                    <span className="text-green-800">Package Price:</span>
                                                    <span className="text-green-800">£{packageData.packagePrice}</span>
                                                </div>
                                                {packageData.originalPrice - packageData.packagePrice > 0 && (
                                                    <div className="text-xs text-green-700 mt-1">
                                                        You save £{packageData.originalPrice - packageData.packagePrice}!
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {pendingQuoteData && !packageData && pendingQuoteData.treatments && (
                                    <div className="text-sm text-green-700">
                                        <span className="font-medium">Selected treatments:</span>
                                        <ul className="mt-1 space-y-1">
                                            {pendingQuoteData.treatments.map((treatment: any, index: number) => (
                                                <li key={index} className="text-xs">
                                                    • {treatment.quantity || 1}x {treatment.name} - £{treatment.subtotalGBP || treatment.priceGBP}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {clinicId && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-700">Assigned Clinic:</span>
                                        <span className="font-medium text-green-900">
                                            {clinicId === 'maltepe-dental-clinic' ? 'Maltepe Dental Clinic' : 
                                             clinicId === 'dentgroup-istanbul' ? 'DentGroup Istanbul' :
                                             clinicId === 'istanbul-dental-care' ? 'Istanbul Dental Care' : 
                                             clinicId}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-green-200 space-y-2">
                                <Button 
                                    size="sm" 
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                        // Save the quote data to user's account
                                        fetch('/api/quotes', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                                userId: user?.id,
                                                email: user?.email,
                                                name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email,
                                                treatment: packageData ? packageData.name : (pendingQuoteData?.treatments?.[0]?.name || 'Consultation'),
                                                consent: true,
                                                treatments: pendingQuoteData?.treatments || packageData?.treatments || [],
                                                promoCode: packageData ? 'HOLLYWOOD_SMILE' : null,
                                                isPackage: !!packageData,
                                                packageName: packageData?.name,
                                                subtotal: packageData?.originalPrice || pendingQuoteData?.subtotal || 0,
                                                discount: packageData ? (packageData.originalPrice - packageData.packagePrice) : 0,
                                                total: packageData?.packagePrice || pendingQuoteData?.total || 0,
                                                clinicId: clinicId
                                            })
                                        })
                                        .then(response => response.json())
                                        .then(result => {
                                            if (result.success) {
                                                // Clear the pending data
                                                sessionStorage.removeItem('pendingQuoteTransfer');
                                                sessionStorage.removeItem('pendingPackageData');
                                                sessionStorage.removeItem('pendingPromoCodeClinicId');
                                                localStorage.removeItem('treatmentPlanData');

                                                // Refresh the quotes
                                                userQuotesQuery.refetch();

                                                // Clear the pending state
                                                setPendingQuoteData(null);
                                                setPackageData(null);
                                                setClinicId(null);

                                                // Navigate to quotes section
                                                window.location.href = '/patient-portal?section=quotes';
                                            }
                                        })
                                        .catch(error => {
                                            console.error('Error saving quote:', error);
                                        });
                                    }}
                                >
                                    Save Quote to My Account
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>

                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="w-full border-green-300 text-green-700 hover:bg-green-50"
                                    onClick={() => {
                                        // Clear pending data without saving
                                        sessionStorage.removeItem('pendingQuoteTransfer');
                                        sessionStorage.removeItem('pendingPackageData');
                                        sessionStorage.removeItem('pendingPromoCodeClinicId');
                                        localStorage.removeItem('treatmentPlanData');

                                        setPendingQuoteData(null);
                                        setPackageData(null);
                                        setClinicId(null);
                                    }}
                                >
                                    Clear Quote Data
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Quote Card - only show if NO pending data */}
        {!pendingQuoteData && !packageData && recentQuote && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                {t('dashboard.your_quote', 'Your Treatment Quote')}
              </CardTitle>
            </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Quote ID:</span>
                                    <span className="font-medium">#{recentQuote.id}</span>
                                </div>

                                {recentQuote.treatmentPlanData && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Treatments:</span>
                                        <span className="font-medium">
                                            {JSON.parse(recentQuote.treatmentPlanData).treatments?.length || 1} item(s)
                                        </span>
                                    </div>
                                )}

                                {recentQuote.packageData && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Package:</span>
                                        <span className="font-medium text-blue-600">
                                            {JSON.parse(recentQuote.packageData).name || 'Treatment Package'}
                                        </span>
                                    </div>
                                )}

                                {recentQuote.selectedClinicId && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Assigned Clinic:</span>
                                        <span className="font-medium">
                                            {recentQuote.selectedClinicId === 1 ? 'Maltepe Dental Clinic' :
                                                recentQuote.selectedClinicId === 2 ? 'DentGroup Istanbul' :
                                                    recentQuote.selectedClinicId === 3 ? 'Istanbul Dental Care' : 'Clinic'}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Status:</span>
                                    <Badge variant={
                                        recentQuote.status === 'assigned' ? 'default' :
                                            recentQuote.status === 'sent' ? 'secondary' :
                                                recentQuote.status === 'accepted' ? 'default' :
                                                    'outline'
                                    }>
                                        {recentQuote.status.charAt(0).toUpperCase() + recentQuote.status.slice(1)}
                                    </Badge>
                                </div>

                                <div className="pt-2 border-t">
                                    <Button variant="outline" className="w-full" size="sm">
                                        <FileText className="h-4 w-4 mr-2" />
                                        View Full Quote Details
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

        {/* Action Items */}
        <Card className={`${(pendingQuoteData || packageData) ? 'md:col-span-1' : 'md:col-span-2'}`} id="next-steps-section">
          <CardHeader className="pb-2">
            <CardTitle>{t("portal.dashboard.action_items", "Next Steps")}</CardTitle>
            <CardDescription>
              {t("portal.dashboard.action_desc", "Items that require your attention")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patientActions.map((action) => (
                <div 
                  key={action.id} 
                  className={`p-4 rounded-lg border ${
                    action.isComplete 
                      ? 'bg-gray-50 border-gray-200' 
                      : action.isPrimary 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex">
                    <div className={`p-2 rounded-full mr-4 ${
                      action.isComplete 
                        ? 'bg-gray-100 text-gray-500' 
                        : action.isPrimary 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-blue-50 text-blue-600'
                    }`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${action.isComplete ? 'line-through text-gray-500' : ''}`}>
                          {action.title}
                        </h3>
                        {action.isComplete ? (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                            {t("portal.dashboard.completed", "Completed")}
                          </Badge>
                        ) : action.isPrimary ? (
                          <Badge variant="default">
                            {t("portal.dashboard.required", "Required")}
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            {t("portal.dashboard.pending", "Pending")}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${action.isComplete ? 'text-gray-400' : 'text-gray-500'}`}>
                        {action.description}
                      </p>
                      {!action.isComplete && (
                        <Button 
                          size="sm" 
                          className={`mt-3 ${action.isPrimary ? '' : 'variant-outline'}`}
                          variant={action.isPrimary ? "default" : "outline"}
                        >
                          {action.isPrimary 
                            ? t("portal.dashboard.complete_now", "Complete Now") 
                            : t("portal.dashboard.view_details", "View Details")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t("portal.dashboard.quick_links", "Quick Links")}</CardTitle>
            <CardDescription>
              {t("portal.dashboard.quick_links_desc", "Frequently accessed sections")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-left h-auto py-3 px-4">
                <div className="flex items-center">
                  <div className="bg-blue-50 p-2 rounded-full mr-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{t("portal.dashboard.treatment_plan", "Treatment Plan")}</p>
                    <p className="text-xs text-gray-500">{t("portal.dashboard.view_plan", "View your treatment plan")}</p>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start text-left h-auto py-3 px-4">
                <div className="flex items-center">
                  <div className="bg-purple-50 p-2 rounded-full mr-3">
                    <CalendarClock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{t("portal.dashboard.appointments", "Appointments")}</p>
                    <p className="text-xs text-gray-500">{t("portal.dashboard.manage_appointments", "Manage your appointments")}</p>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start text-left h-auto py-3 px-4">
                <div className="flex items-center">
                  <div className="bg-green-50 p-2 rounded-full mr-3">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium">{t("portal.dashboard.messages", "Messages")}</p>
                      {treatmentOverview.messages > 0 && (
                        <div className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {treatmentOverview.messages}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{t("portal.dashboard.chat_team", "Chat with your dental team")}</p>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start text-left h-auto py-3 px-4">
                <div className="flex items-center">
                  <div className="bg-amber-50 p-2 rounded-full mr-3">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">{t("portal.dashboard.payments", "Payments")}</p>
                    <p className="text-xs text-gray-500">{t("portal.dashboard.payment_history", "View payment history")}</p>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start text-left h-auto py-3 px-4">
                <div className="flex items-center">
                  <div className="bg-red-50 p-2 rounded-full mr-3">
                    <Stethoscope className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">{t("portal.dashboard.aftercare", "Aftercare")}</p>
                    <p className="text-xs text-gray-500">{t("portal.dashboard.aftercare_info", "View aftercare instructions")}</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Timeline */}
      <Card id="dental-journey-section">
        <CardHeader className="pb-2">
          <CardTitle>{t("portal.dashboard.timeline", "Treatment Timeline")}</CardTitle>
          <CardDescription>
            {hasActiveBooking 
              ? t("portal.dashboard.timeline_desc", "Your dental treatment journey from start to finish")
              : t("portal.dashboard.sample_timeline_desc", "Sample timeline showing what your dental journey would look like")
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasActiveBooking && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Sample Timeline:</strong> This shows what your treatment journey would look like once you submit a quote request.
              </p>
            </div>
          )}
          <div className="relative pb-4">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {timelineEvents.map((event, index) => (
                <div key={index} className="relative pl-10">
                  <div className={`absolute left-0 p-2 rounded-full ${
                    !hasActiveBooking
                      ? 'bg-gray-100'
                      : event.status === 'completed' 
                        ? 'bg-green-100' 
                        : event.status === 'active' 
                          ? 'bg-blue-100' 
                          : 'bg-gray-100'
                  }`}>
                    <div className={`h-2 w-2 rounded-full ${
                      !hasActiveBooking
                        ? 'bg-gray-400'
                        : event.status === 'completed' 
                          ? 'bg-green-600' 
                          : event.status === 'active' 
                            ? 'bg-blue-600' 
                            : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      <p className={`font-medium ${
                        !hasActiveBooking
                          ? 'text-gray-500'
                          : event.status === 'completed' 
                            ? 'text-gray-700' 
                            : event.status === 'active' 
                              ? 'text-blue-700' 
                              : 'text-gray-500'
                      }`}>{event.event}</p>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                    {hasActiveBooking && event.status === 'completed' && (
                      <Badge className="mt-1 sm:mt-0 bg-green-50 text-green-700 border-green-200">
                        {t("portal.dashboard.completed", "Completed")}
                      </Badge>
                    )}
                    {hasActiveBooking && event.status === 'active' && (
                      <Badge className="mt-1 sm:mt-0 bg-blue-50 text-blue-700 border-blue-200">
                        {t("portal.dashboard.in_progress", "In Progress")}
                      </Badge>
                    )}
                    {hasActiveBooking && event.status === 'upcoming' && (
                      <Badge className="mt-1 sm:mt-0 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
                        {t("portal.dashboard.upcoming", "Upcoming")}
                      </Badge>
                    )}
                    {!hasActiveBooking && (
                      <Badge className="mt-1 sm:mt-0 bg-gray-50 text-gray-600 border-gray-200">
                        {t("portal.dashboard.sample", "Sample")}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-center">
          <Button variant="outline" className="gap-1 text-sm">
            {hasActiveBooking 
              ? t("portal.dashboard.view_detailed_timeline", "View Detailed Timeline")
              : t("portal.dashboard.start_your_journey", "Start Your Journey")
            }
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>

      {/* Travel Arrangements */}
      <Card id="hotel-section">
        <CardHeader className="pb-2">
          <CardTitle>{t("portal.dashboard.travel_arrangements", "Travel Arrangements")}</CardTitle>
          <CardDescription>
            {t("portal.dashboard.travel_desc", "Your upcoming trip to Istanbul for dental treatment")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-50 rounded-full mr-3">
                  <Plane className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium">{t("portal.dashboard.flight", "Flight")}</h3>
              </div>
              <p className="text-sm">{treatmentOverview.trip.flight}</p>
              <Button variant="link" className="px-0 py-1 h-auto text-sm">
                {t("portal.dashboard.view_details", "View Details")}
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-amber-50 rounded-full mr-3">
                  <Home className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-medium">{t("portal.dashboard.accommodation", "Accommodation")}</h3>
              </div>
              <p className="text-sm">{treatmentOverview.trip.hotel}</p>
              <Button variant="link" className="px-0 py-1 h-auto text-sm">
                {t("portal.dashboard.view_details", "View Details")}
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-green-50 rounded-full mr-3">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="font-medium">{t("portal.dashboard.transfers", "Transfers")}</h3>
              </div>
              <p className="text-sm">{treatmentOverview.trip.transfer}</p>
              <Button variant="link" className="px-0 py-1 h-auto text-sm">
                {t("portal.dashboard.view_details", "View Details")}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-center">
          <Button variant="outline" className="gap-1 text-sm">
            {t("portal.dashboard.manage_travel", "Manage Travel Arrangements")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>
      {/* Debug Quote Data Display */}
      {(pendingQuoteData || packageData) && (
        <Card className="border-2 border-blue-500 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">🚨 DEBUG: Quote Data Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>Pending Quote Data:</strong> {pendingQuoteData ? 'YES' : 'NO'}</div>
              <div><strong>Package Data:</strong> {packageData ? 'YES' : 'NO'}</div>
              <div><strong>Clinic ID:</strong> {clinicId || 'NONE'}</div>
              {packageData && (
                <div className="mt-2 p-2 bg-white rounded">
                  <div><strong>Package Name:</strong> {packageData.name}</div>
                  <div><strong>Treatments:</strong> {packageData.treatments?.length || 0}</div>
                  <div><strong>Price:</strong> £{packageData.packagePrice}</div>
                </div>
              )}
              {pendingQuoteData && (
                <div className="mt-2 p-2 bg-white rounded">
                  <div><strong>Treatments:</strong> {pendingQuoteData.treatments?.length || 0}</div>
                  <div><strong>Total:</strong> £{pendingQuoteData.total}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Get Started Button */}
      {!hasActiveBooking && (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {t('portal.dashboard.get_started', 'Get started with your treatment')}
              </h2>
              <p className="text-gray-600">
                {t('portal.dashboard.get_started_message', 'Ready to begin? Get a personalized quote now.')}
              </p>
            </div>
            <div className="md:ml-6">
              <Button 
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 px-8 py-3"
                onClick={() => window.location.href = '/pricing?city=Istanbul&treatment=dental-implants&from=dashboard'}
              >
                {t('portal.dashboard.get_quote', 'Get Your Quote')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
};

export default DashboardSection;