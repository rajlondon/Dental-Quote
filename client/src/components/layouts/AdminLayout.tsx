import React, { ReactNode } from 'react';
import { useLocation, Link } from 'wouter';
import { useAdminAuth } from '@/hooks/use-admin-auth';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location] = useLocation();
  const { adminUser, isLoading } = useAdminAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!adminUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You must be an admin to access this page.</p>
        <Link href="/admin-portal">
          <a className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition">
            Go to Admin Login
          </a>
        </Link>
      </div>
    );
  }
  
  const navItems = [
    { path: '/admin-portal', label: 'Dashboard' },
    { path: '/admin-portal/treatment-plans', label: 'Treatment Plans' },
    { path: '/admin-portal/promotions', label: 'Promotions' },
    { path: '/admin/bookings', label: 'Bookings' },
    { path: '/admin/new-quote', label: 'New Quote' },
    { path: '/admin/quote-builder', label: 'Quote Builder' },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Admin Portal</h1>
          <p className="text-sm text-gray-500">MyDentalFly</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium">{adminUser.username || adminUser.firstName}</p>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
          <Link href="/admin-portal/profile">
            <a className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {(adminUser.username || adminUser.firstName || 'A').charAt(0).toUpperCase()}
            </a>
          </Link>
        </div>
      </header>
      
      <div className="flex flex-1">
        <nav className="w-64 bg-white border-r border-gray-200 p-6">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.path}>
                <Link href={item.path}>
                  <a 
                    className={`block px-4 py-2 rounded-md ${
                      location === item.path
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <main className="flex-1 p-6">
          {title && <h1 className="text-3xl font-bold mb-6">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  );
}