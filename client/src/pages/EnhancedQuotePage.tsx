import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SimplePatientQuoteBuilder } from '@/components/quotes/SimplePatientQuoteBuilder';

const EnhancedQuotePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('quote.page_title', 'Get Your Dental Treatment Quote - MyDentalFly')}</title>
        <meta name="description" content={t('quote.page_description', 'Build your personalized dental treatment quote with our easy-to-use quote builder. Get instant price comparisons from top Turkish dental clinics.')} />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow bg-gray-50 py-10">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                {t('quote.builder_title', 'Your Personalized Dental Treatment Quote')}
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('quote.builder_subtitle', 'Build your quote below and receive instant price comparisons from our network of top-rated Turkish dental clinics.')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <SimplePatientQuoteBuilder />
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default EnhancedQuotePage;