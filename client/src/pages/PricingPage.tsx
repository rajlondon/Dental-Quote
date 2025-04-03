import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PriceCalculator from '@/components/PriceCalculator';
import { Separator } from '@/components/ui/separator';

export default function PricingPage() {
  const { t } = useTranslation();
  
  // Set page title when component mounts
  useEffect(() => {
    document.title = `${t('pricing')} | DentalMatch`;
  }, [t]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('pricing_title')}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {t('pricing_description')}
        </p>
      </div>
      
      <Separator className="my-8" />
      
      <PriceCalculator />
      
      <div className="mt-16 bg-muted/30 rounded-lg p-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">{t('frequently_asked_questions')}</h2>
          
          <div className="space-y-6 mt-8">
            <div>
              <h3 className="text-lg font-medium mb-2">{t('pricing_faq_1_question')}</h3>
              <p className="text-muted-foreground">{t('pricing_faq_1_answer')}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">{t('pricing_faq_2_question')}</h3>
              <p className="text-muted-foreground">{t('pricing_faq_2_answer')}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">{t('pricing_faq_3_question')}</h3>
              <p className="text-muted-foreground">{t('pricing_faq_3_answer')}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">{t('pricing_faq_4_question')}</h3>
              <p className="text-muted-foreground">{t('pricing_faq_4_answer')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}