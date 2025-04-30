import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Building, Users, MessageSquare } from 'lucide-react';

// A simplified clinic page that doesn't have any complex reload detection
// or setup that might cause refresh issues
const SimpleClinicPage: React.FC = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Simple handler for logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation('/portal-login');
      }
    });
  };
  
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-primary p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary-foreground">
          {t("clinic.title", "Clinic Portal")} - {user?.email}
        </h1>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("clinic.nav.logout", "Log out")}
        </Button>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Welcome to the Clinic Portal</h2>
        <p className="text-muted-foreground">This is a simplified version of the clinic portal with no complex state management.</p>
        
        {/* Dashboard cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Patients</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">Total patients</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Clinic Info</CardTitle>
              <Building className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">Istanbul Dental Smile</div>
              <p className="text-xs text-muted-foreground">Main Location</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Current User Information</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-lg">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-lg capitalize">{user?.role}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">User ID</dt>
              <dd className="mt-1 text-lg">{user?.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-lg capitalize">{user?.status || 'active'}</dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
};

export default SimpleClinicPage;