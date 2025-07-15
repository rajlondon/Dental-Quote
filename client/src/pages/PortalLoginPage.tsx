import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Redirect } from 'wouter';
import { Loader2, Mail, Lock, User, Building, Shield, ArrowLeft, Home } from 'lucide-react';
import { useLocation } from 'wouter';

export default function PortalLoginPage() {
  const [data, setData] = useState(null);
  const [role, setRole] = useState('');
  const { user, loginMutation, isLoading } = useAuth();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState('patient');

  // Form states for each portal
  const [patientForm, setPatientForm] = useState({ email: '', password: '' });
  const [clinicForm, setClinicForm] = useState({ email: '', password: '' });
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });

  // Check URL parameter for initial tab and clear any cached auth data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    if (type && ['patient', 'clinic', 'admin'].includes(type)) {
      setActiveTab(type);
    }
    
    // Clear any cached authentication data when arriving at login page
    console.log('🔍 LOGIN PAGE: Clearing cached authentication data');
    sessionStorage.removeItem('cached_user_data');
    sessionStorage.removeItem('cached_user_timestamp');
    localStorage.removeItem('authToken');
  }, [location]);

  // Redirect if already logged in
  if (user) {
    // Check if there's a redirect URL stored
    const redirectAfterLogin = sessionStorage.getItem('redirect_after_login');
    
    if (redirectAfterLogin) {
      sessionStorage.removeItem('redirect_after_login');
      return <Redirect to={redirectAfterLogin} />;
    }
    
    if (user.role === 'admin') {
      return <Redirect to="/admin-portal" />;
    } else if (user.role === 'clinic') {
      return <Redirect to="/clinic-portal" />;
    } else if (user.role === 'patient') {
      return <Redirect to="/patient-portal" />;
    }
  }

  const handleEmailLogin = (e: React.FormEvent, userType: 'patient' | 'clinic' | 'admin') => {
    e.preventDefault();

    let credentials;
    switch (userType) {
      case 'patient':
        credentials = patientForm;
        break;
      case 'clinic':
        credentials = clinicForm;
        break;
      case 'admin':
        credentials = adminForm;
        break;
    }

    loginMutation.mutate(credentials);
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = '/auth/google';
  };

  const updateForm = (type: 'patient' | 'clinic' | 'admin', field: 'email' | 'password', value: string) => {
    switch (type) {
      case 'patient':
        setPatientForm(prev => ({ ...prev, [field]: value }));
        break;
      case 'clinic':
        setClinicForm(prev => ({ ...prev, [field]: value }));
        break;
      case 'admin':
        setAdminForm(prev => ({ ...prev, [field]: value }));
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Portal Login</CardTitle>
          <p className="text-center text-gray-600">Choose your portal to continue</p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patient" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Patient
              </TabsTrigger>
              <TabsTrigger value="clinic" className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                Clinic
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            {/* Patient Login */}
            <TabsContent value="patient" className="space-y-4 mt-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">Patient Portal</h3>
                <p className="text-sm text-gray-600">Access your appointments and treatment plans</p>
              </div>

              {/* Google Login for Patients */}
              <Button 
                onClick={handleGoogleLogin}
                variant="outline" 
                className="w-full flex items-center gap-2"
                type="button"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={(e) => handleEmailLogin(e, 'patient')} className="space-y-4">
                <div>
                  <Label htmlFor="patient-email">Email</Label>
                  <Input
                    id="patient-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={patientForm.email}
                    onChange={(e) => updateForm('patient', 'email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="patient-password">Password</Label>
                  <Input
                    id="patient-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={patientForm.password}
                    onChange={(e) => updateForm('patient', 'password', e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Clinic Login */}
            <TabsContent value="clinic" className="space-y-4 mt-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">Clinic Portal</h3>
                <p className="text-sm text-gray-600">Manage patients and appointments</p>
              </div>

              <form onSubmit={(e) => handleEmailLogin(e, 'clinic')} className="space-y-4">
                <div>
                  <Label htmlFor="clinic-email">Clinic Email</Label>
                  <Input
                    id="clinic-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter clinic email"
                    value={clinicForm.email}
                    onChange={(e) => updateForm('clinic', 'email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clinic-password">Password</Label>
                  <Input
                    id="clinic-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter clinic password"
                    value={clinicForm.password}
                    onChange={(e) => updateForm('clinic', 'password', e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Building className="h-4 w-4 mr-2" />
                      Access Clinic Portal
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Admin Login */}
            <TabsContent value="admin" className="space-y-4 mt-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">Admin Portal</h3>
                <p className="text-sm text-gray-600">System administration and management</p>
              </div>

              <form onSubmit={(e) => handleEmailLogin(e, 'admin')} className="space-y-4">
                <div>
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter admin email"
                    value={adminForm.email}
                    onChange={(e) => updateForm('admin', 'email', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter admin password"
                    value={adminForm.password}
                    onChange={(e) => updateForm('admin', 'password', e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Access Admin Portal
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}