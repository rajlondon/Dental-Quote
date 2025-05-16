import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export function MainNavigation() {
  const [location] = useLocation();
  // For now we'll create a simplified version without actual auth integration
  // This will be connected to the real auth system later
  const isAuthenticated = false;
  const user = null;
  const logout = () => console.log('Logout clicked');
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                MyDentalFly
              </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === '/' 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Home
              </Link>
              
              <Link 
                href="/basic-quote-demo"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location === '/basic-quote-demo' 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Quote Builder
              </Link>
              
              {isAuthenticated && (
                <>
                  {user?.role === 'admin' && (
                    <Link 
                      href="/admin/dashboard"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        location.includes('/admin') 
                          ? 'border-blue-500 text-gray-900' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Admin Portal
                    </Link>
                  )}
                  
                  {user?.role === 'clinic' && (
                    <Link 
                      href="/clinic/dashboard"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        location.includes('/clinic') 
                          ? 'border-blue-500 text-gray-900' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Clinic Portal
                    </Link>
                  )}
                  
                  {user?.role === 'patient' && (
                    <Link 
                      href="/patient/dashboard"
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        location.includes('/patient') 
                          ? 'border-blue-500 text-gray-900' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Patient Portal
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user?.name}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}