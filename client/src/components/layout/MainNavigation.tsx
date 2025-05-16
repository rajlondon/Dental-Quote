import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  FileText, 
  Package, 
  Settings, 
  Menu, 
  X, 
  User,
  PercentCircle,
  Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Home',
    icon: <Home className="h-5 w-5" />
  },
  {
    path: '/quick-quote',
    label: 'New Quote',
    icon: <Calculator className="h-5 w-5" />
  },
  {
    path: '/quotes',
    label: 'My Quotes',
    icon: <FileText className="h-5 w-5" />
  }
];

export default function MainNavigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };
  
  // Close mobile menu when a link is clicked
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" onClick={closeMobileMenu}>
            <div className="flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block text-xl text-blue-600">
                MyDentalFly
              </span>
              <span className="sm:hidden font-bold text-xl text-blue-600">
                MDF
              </span>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center space-x-1">
          {navItems.map(item => (
            <Link href={item.path} key={item.path}>
              <Button
                variant={location === item.path ? "default" : "ghost"}
                className={cn(
                  "px-4",
                  location === item.path ? 
                  "bg-primary text-primary-foreground hover:bg-primary/90" : 
                  "hover:bg-transparent hover:text-primary"
                )}
                onClick={closeMobileMenu}
              >
                <span className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </span>
              </Button>
            </Link>
          ))}
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="flex md:hidden flex-1 justify-end">
          <Button 
            variant="ghost" 
            className="px-2"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMobileMenuOpen ? 
              <X className="h-6 w-6" /> : 
              <Menu className="h-6 w-6" />
            }
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="md:hidden border-t py-4">
          <div className="container space-y-1">
            {navItems.map(item => (
              <Link href={item.path} key={item.path}>
                <Button
                  variant={location === item.path ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start px-4",
                    location === item.path ? 
                    "bg-primary text-primary-foreground" : 
                    ""
                  )}
                  onClick={closeMobileMenu}
                >
                  <span className="flex items-center">
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </span>
                </Button>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}