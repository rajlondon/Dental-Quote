import React from 'react';
import { useParams } from 'wouter';
import PatientQuoteDetail from '@/components/patient/PatientQuoteDetail';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';

const PatientQuoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();

  const handleBackToQuotes = () => {
    navigate('/patient-portal/quotes');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBackToQuotes}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to My Quotes
        </Button>
      </div>
      
      {id && <PatientQuoteDetail />}
    </div>
  );
};

export default PatientQuoteDetailPage;