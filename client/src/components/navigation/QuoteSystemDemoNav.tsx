import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Navigation component for quick access to the Quote System Demo
 */
const QuoteSystemDemoNav: React.FC = () => {
  return (
    <Card className="my-4 border-2 border-primary/20">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold">Quote System Demo</h3>
            <p className="text-sm text-gray-500">Test the complete quote management system</p>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </Link>
            <Link href="/quote-system-demo">
              <Button size="sm" className="flex items-center gap-1">
                <span>Launch Demo</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteSystemDemoNav;