import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PriceCalculator from '@/components/PriceCalculator';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PricingPage() {
  const { t } = useTranslation();
  
  // Set page title when component mounts
  useEffect(() => {
    document.title = `${t('pricing.pricing_title')} | Istanbul Dental Smile`;
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