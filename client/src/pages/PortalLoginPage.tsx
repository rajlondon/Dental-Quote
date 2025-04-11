import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Mail, Lock, ArrowRight, LogIn, UserCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import logo from '@assets/logo.png';

const PortalLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // This is a simple mock authentication function
  // In a real app, this would validate credentials against the server
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Using setTimeout to simulate network request
    setTimeout(() => {
      // Test credentials
      if (email === 'test@example.com' && password === 'password123') {
        toast({
          title: t('auth.login_success', 'Login Successful'),
          description: t('auth.welcome_back', 'Welcome back to Istanbul Dental Smile!'),
        });
        
        // In a real app, would store auth token in localStorage or cookies
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        
        // Redirect to client portal
        setLocation('/client-portal');
      } else {
        setError(t('auth.invalid_credentials', 'Invalid email or password. Please try again.'));
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Header */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-blue-800 px-3 py-1 text-sm">
                {t('auth.portal_access', 'Patient Portal Access')}
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {t('auth.login_title', 'Access Your Dental Care Journey')}
              </h1>
              <p className="text-gray-200 md:text-xl">
                {t('auth.portal_desc', 'Securely login to manage your dental treatments, view your personalized care plan, and communicate with your dental team.')}
              </p>
            </div>
            
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                  <div className="flex justify-center mb-4">
                    <img src={logo} alt="Istanbul Dental Smile" className="h-10" />
                  </div>
                  <CardTitle className="text-2xl text-center">
                    {t('auth.login', 'Login to Patient Portal')}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {t('auth.enter_credentials', 'Enter your credentials to access your account')}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="mb-4 text-sm">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('auth.email', 'Email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">{t('auth.password', 'Password')}</Label>
                        <a 
                          href="#" 
                          className="text-sm text-blue-600 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            toast({
                              title: t('auth.password_reset', 'Password Reset'),
                              description: t('auth.reset_instructions', 'Please contact our support team to reset your password.'),
                            });
                          }}
                        >
                          {t('auth.forgot', 'Forgot password?')}
                        </a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="password"
                          type="password"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-b-transparent border-white"></div>
                          {t('auth.logging_in', 'Logging in...')}
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4 mr-2" />
                          {t('auth.login', 'Login')}
                        </>
                      )}
                    </Button>
                  </form>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">
                        {t('auth.demo_info', 'Demo Information')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">
                    <div className="font-medium text-blue-800 mb-1">{t('auth.test_credentials', 'Test Credentials:')}</div>
                    <div className="grid grid-cols-[80px_1fr] gap-1 text-blue-700">
                      <span className="font-medium">Email:</span>
                      <code className="font-mono">test@example.com</code>
                      <span className="font-medium">Password:</span>
                      <code className="font-mono">password123</code>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-center">
                  <p className="text-center text-sm text-gray-500">
                    <a 
                      href="mailto:info@istanbuldentalsmile.co.uk"
                      className="text-blue-600 hover:underline"
                    >
                      {t('auth.need_help', 'Need help? Contact our support team')}
                    </a>
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {t('auth.portal_features', 'Your Patient Portal Benefits')}
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                {t('auth.features_desc', 'Istanbul Dental Smile\'s patient portal gives you full control over your dental care journey.')}
              </p>
            </div>
          </div>
          
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
            <div className="flex flex-col items-center space-y-2 rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="rounded-full bg-blue-100 p-3">
                <UserCircle2 className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold">{t('auth.feature1_title', 'Personalized Care')}</h3>
              <p className="text-center text-gray-500">
                {t('auth.feature1_desc', 'Access your personalized treatment plan and track your dental care journey.')}
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="rounded-full bg-blue-100 p-3">
                <Mail className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold">{t('auth.feature2_title', 'Direct Communication')}</h3>
              <p className="text-center text-gray-500">
                {t('auth.feature2_desc', 'Message your dental team directly and get answers to your questions.')}
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="rounded-full bg-blue-100 p-3">
                <ArrowRight className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold">{t('auth.feature3_title', 'Streamlined Travel')}</h3>
              <p className="text-center text-gray-500">
                {t('auth.feature3_desc', 'Manage your travel details and accommodations for your dental tourism journey.')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PortalLoginPage;