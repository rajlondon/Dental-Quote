import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PriceCalculator from '@/components/PriceCalculator';
import { DentalChart } from '@/components/DentalChart';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PricingPage() {
  const { t } = useTranslation();
  
  // Set page title when component mounts
  useEffect(() => {
    document.title = `${t('pricing.pricing_title')} | MyDentalFly.com`;
  }, [t]);
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('pricing.pricing_title')}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('pricing.pricing_description')}
          </p>
        </div>
        
        <Separator className="my-8" />
        
        <div className="mb-10 p-6 bg-white border border-blue-200 rounded-lg shadow-md relative">
          <div className="absolute -top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            New Feature
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-4 text-blue-800">Interactive Dental Chart</h2>
          <p className="text-center mb-4 text-gray-700 max-w-2xl mx-auto">
            Click on any tooth to indicate conditions (pain, chipped, missing) or 
            desired treatments (implants, crowns, veneers). This information will be included in your quote.
          </p>
          
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-50 text-blue-800 text-sm border border-blue-200">
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your dental chart data is automatically saved and included with your quote
            </div>
          </div>
          
          <DentalChart 
            onTeethUpdate={(teethData) => {
              console.log('Teeth data updated:', teethData);
              localStorage.setItem('dentalChartData', JSON.stringify(teethData));
            }}
          />
          
          <div className="mt-6 text-center">
            <a href="/dental-chart" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors">
              Open Full Dental Chart Editor
            </a>
          </div>
        </div>
        
        <PriceCalculator />

        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">{t('pricing.why_choose_istanbul')}</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-3">
              {t('pricing.all_treatments_include')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
              <div className="text-center">
                <div className="mb-4 text-primary text-3xl font-bold">70%</div>
                <p className="text-neutral-700">{t('pricing.benefit_savings')}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
              <div className="text-center">
                <div className="mb-4 text-primary text-3xl">⭐⭐⭐⭐⭐</div>
                <p className="text-neutral-700">{t('pricing.benefit_quality')}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
              <div className="text-center">
                <div className="mb-4 text-primary text-3xl">🌍</div>
                <p className="text-neutral-700">{t('pricing.benefit_support')}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
              <div className="text-center">
                <div className="mb-4 text-primary text-3xl">✓</div>
                <p className="text-neutral-700">{t('pricing.benefit_guarantee')}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 bg-muted/30 rounded-lg p-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{t('faq.title')}</h2>
            
            <div className="space-y-6 mt-8">
              <div>
                <h3 className="text-lg font-medium mb-2">{t('pricing.pricing_faq_1_question')}</h3>
                <p className="text-muted-foreground">{t('pricing.pricing_faq_1_answer')}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">{t('pricing.pricing_faq_2_question')}</h3>
                <p className="text-muted-foreground">{t('pricing.pricing_faq_2_answer')}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">{t('pricing.pricing_faq_3_question')}</h3>
                <p className="text-muted-foreground">{t('pricing.pricing_faq_3_answer')}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">{t('pricing.pricing_faq_4_question')}</h3>
                <p className="text-muted-foreground">{t('pricing.pricing_faq_4_answer')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}