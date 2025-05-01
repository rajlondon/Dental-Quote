import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/lib/localstorage-state';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, User, LogOut, Settings, Bell, BarChart3, Users, Calendar, MessageSquare, FileText, Search } from 'lucide-react';

// Admin user type
interface AdminUser {
  id: number;
  email: string;
  username: string;
  role: 'admin';
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

const StandaloneAdminPortal: React.FC = () => {
  // Use localStorage for admin session data
  const [adminUser, setAdminUser] = useLocalStorage<AdminUser | null>('standalone_admin_session', null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // No automatic fetching or API calls - completely sync/manual
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      // Manual fetch with credentials
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.user || data.user.role !== 'admin') {
        throw new Error('Not an admin account');
      }

      // Store admin session in localStorage
      setAdminUser(data.user as AdminUser);
      
      toast({
        title: 'Login successful',
        description: 'Welcome to the standalone admin portal',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Invalid credentials');
      
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Manual fetch for logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear admin session regardless of API result
      setAdminUser(null);
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out of the admin portal',
      });
    }
  };

  // Render login form if not authenticated
  if (!adminUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/images/mydentalfly-logo.png" 
                alt="MyDentalFly Logo" 
                className="h-12 w-auto" 
              />
            </div>
            <CardTitle className="text-2xl text-center">Standalone Admin Portal</CardTitle>
            <p className="text-center text-sm text-gray-500">
              Enter your credentials to access the admin portal
            </p>
          </CardHeader>
          <CardContent>
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="admin@mydentalfly.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Logging in...' : 'Login to Admin Portal'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard content
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/images/mydentalfly-logo.png" 
              alt="MyDentalFly" 
              className="h-8 w-auto mr-3" 
            />
            <h1 className="text-xl font-semibold">Standalone Admin Portal</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input 
                type="search" 
                placeholder="Search..." 
                className="w-64 pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="bg-primary text-white rounded-full p-1">
                <User className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">{adminUser.email}</span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-1/5 bg-white rounded-lg shadow">
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Button 
                    variant={activeTab === 'dashboard' ? 'default' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Dashboard
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === 'patients' ? 'default' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('patients')}
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Patients
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === 'bookings' ? 'default' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('bookings')}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Bookings
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === 'messages' ? 'default' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('messages')}
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Messages
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === 'documents' ? 'default' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('documents')}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Documents
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === 'settings' ? 'default' : 'ghost'} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Settings
                  </Button>
                </li>
              </ul>
            </nav>
          </aside>
          
          {/* Content area */}
          <main className="w-full md:w-4/5 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'patients' && 'Patient Management'}
              {activeTab === 'bookings' && 'Booking Management'}
              {activeTab === 'messages' && 'Messages'}
              {activeTab === 'documents' && 'Documents'}
              {activeTab === 'settings' && 'Settings'}
            </h2>
            
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Patients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">No recent patients to display</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">No upcoming appointments</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Patients</span>
                        <span className="font-bold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Bookings</span>
                        <span className="font-bold">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Quotes</span>
                        <span className="font-bold">0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab !== 'dashboard' && (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">This section is coming soon</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default StandaloneAdminPortal;