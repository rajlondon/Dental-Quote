import React from 'react';
import { Link } from 'wouter';
import { Home, FlaskConical, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Navigation header for the testing environment
 * Provides easy navigation between the main app and test pages
 */
const TestNavigationHeader: React.FC = () => {
  return (
    <header className="bg-slate-800 text-white py-2 px-4 shadow-md mb-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FlaskConical className="h-6 w-6 text-yellow-400" />
          <h1 className="text-lg font-semibold">MyDentalFly Testing Environment</h1>
        </div>
        
        <nav className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white hover:bg-slate-700">
              <Home className="h-4 w-4 mr-2" />
              Main App
            </Button>
          </Link>
          
          <Link href="/test-dashboard">
            <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white hover:bg-slate-700">
              <Settings className="h-4 w-4 mr-2" />
              Test Dashboard
            </Button>
          </Link>
          
          <Link href="/quote-test">
            <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white hover:bg-slate-700">
              <FileText className="h-4 w-4 mr-2" />
              Quote Test
            </Button>
          </Link>
          
          <Link href="/simple-quote-test">
            <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white hover:bg-slate-700">
              <FileText className="h-4 w-4 mr-2" />
              Simple Test
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default TestNavigationHeader;