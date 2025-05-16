import React from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

// Simple placeholder for PatientPortalPage
const PatientPortalPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('portal.title', 'Patient Portal')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                {t('portal.under_development', 'The patient portal is currently under development.')}
              </p>
              <Link href="/quote">
                <Button>
                  {t('portal.try_quote_builder', 'Try our Quote Builder')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PatientPortalPage;