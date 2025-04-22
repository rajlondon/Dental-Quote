import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
  Menu, LogOut, ChevronRight, Grid3X3, TestTube
} from 'lucide-react';
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

const ClinicPortalPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Get auth context for logout functionality
  const { logoutMutation } = useAuth();
  
  // Handle logout
  const handleLogout = () => {
    // Using non-async function to make sure the button click handler completes immediately
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // When successful, show toast and redirect
        toast({
          title: t('portal.logout_success', 'Successfully logged out'),
          description: t('portal.logout_message', 'You have been logged out of your account.'),
        });
        
        // Use wouter navigation instead of direct URL change
        setLocation('/portal-login');
      },
      onError: (error) => {
        console.error("Logout error:", error);
        toast({
          title: t('portal.logout_error', 'Logout failed'),
          description: t('portal.logout_error_message', 'There was an issue logging out. Please try again.'),
          variant: "destructive",
        });
      }
    });
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
    switch (activeSection) {
      case 'dashboard':
        return <ClinicDashboardSection />;
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
        return <ClinicDashboardSection />;
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
              <div className="bg-primary/10 p-2 rounded-full">
                <Building className="h-6 w-6 text-primary" />
              </div>
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