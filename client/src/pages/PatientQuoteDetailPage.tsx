import React from 'react';
import { useParams } from 'wouter';
import PatientQuoteDetail from '@/components/patient/PatientQuoteDetail';
import { PageHeader } from '@/components/ui/page-header';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

/**
 * Page component for displaying a single quote with detailed information
 * Including promo code details and PDF download functionality
 */
const PatientQuoteDetailPage: React.FC = () => {
  return (
    <Container>
      <div className="mb-6">
        <Link href="/patient/quotes">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotes
          </Button>
        </Link>
        
        <PageHeader 
          title="Quote Details" 
          description="View your treatment quote details including any applied promotions"
        />
      </div>
      
      <PatientQuoteDetail />
    </Container>
  );
};

export default PatientQuoteDetailPage;