import React from 'react';
import { Button } from "@/components/ui/button";
import { TestTube } from 'lucide-react';

/**
 * Component to add a test page link for clinic staff
 * Provides easy access to the simplified quote test page
 */
const ClinicTestPageLink: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={() => window.location.href = '/clinic-quote-test'} 
        className="bg-blue-600 hover:bg-blue-700"
      >
        <TestTube className="h-4 w-4 mr-2" />
        Quote Test Page
      </Button>
    </div>
  );
};

export default ClinicTestPageLink;