import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  // Translation removed
  
  // Set page title when component mounts
  useEffect(() => {
    document.title = `${t('faq.title')} | Istanbul Dental Smile`;
  }, [t]);
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('faq.title')}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Get answers to the most commonly asked questions about dental treatment in Istanbul.
          </p>
        </div>
        
        <Separator className="my-8" />
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {/* General Questions */}
            <h2 className="text-2xl font-bold mb-4 text-primary">General Questions</h2>
            
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                {t('pricing.pricing_faq_1_question')}
              </AccordionTrigger>
              <AccordionContent>
                {t('pricing.pricing_faq_1_answer')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                {t('pricing.pricing_faq_2_question')}
              </AccordionTrigger>
              <AccordionContent>
                {t('pricing.pricing_faq_2_answer')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                How do I pay for my treatment?
              </AccordionTrigger>
              <AccordionContent>
                To start the process and secure your appointment including your hotel we need a £200 deposit which will be taken off your treatment plan when you pay the full balance before your treatment starts at the clinic.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                {t('pricing.pricing_faq_4_question')}
              </AccordionTrigger>
              <AccordionContent>
                {t('pricing.pricing_faq_4_answer')}
              </AccordionContent>
            </AccordionItem>
            
            {/* Treatment Questions */}
            <h2 className="text-2xl font-bold mb-4 mt-8 text-primary">Treatment Questions</h2>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                How long do dental veneers last?
              </AccordionTrigger>
              <AccordionContent>
                With proper care, dental veneers in Istanbul can last between 10-15 years. The exact lifespan depends on the material used (porcelain veneers last longer than composite), your oral hygiene routine, and whether you avoid habits that can damage veneers, such as biting on hard objects.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Are dental implants painful?
              </AccordionTrigger>
              <AccordionContent>
                The dental implant procedure is performed under local anesthesia, so you won't feel pain during the surgery. After the procedure, you may experience some discomfort for a few days, but this can be managed with prescribed pain medications. Most patients report that the process is much less painful than they anticipated.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                How many days do I need to stay in Istanbul for dental treatment?
              </AccordionTrigger>
              <AccordionContent>
                The required stay depends on your specific treatment. For simple procedures like teeth whitening, 2-3 days may be sufficient. For veneers, typically 5-7 days are needed. Dental implants usually require two visits: 3-4 days for the initial placement, then another visit 3-6 months later for the final crown placement. We'll provide a detailed timeline based on your specific treatment plan.
              </AccordionContent>
            </AccordionItem>
            
            {/* Payment Questions */}
            <h2 className="text-2xl font-bold mb-4 mt-8 text-primary">Payment & Financing</h2>
            
            <AccordionItem value="payment-1">
              <AccordionTrigger className="text-left">
                What payment methods do you accept?
              </AccordionTrigger>
              <AccordionContent>
                We accept various payment methods including bank transfers, credit/debit cards, and PayPal. For the initial £200 deposit, you can pay securely online. The remaining balance is typically paid directly to the clinic before your treatment begins, and they accept cash (Turkish Lira, GBP, EUR, or USD) and most major credit cards.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="payment-2">
              <AccordionTrigger className="text-left">
                Is the £200 deposit refundable?
              </AccordionTrigger>
              <AccordionContent>
                The deposit is fully refundable if you cancel more than 14 days before your scheduled treatment. For cancellations within 14 days of treatment, the refund policy depends on the specific circumstances and any costs already incurred. We always try to work with our clients to find the best solution in case plans change.
              </AccordionContent>
            </AccordionItem>
            
            {/* Logistics Questions */}
            <h2 className="text-2xl font-bold mb-4 mt-8 text-primary">Logistics & Travel</h2>
            
            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                Do you arrange accommodation in Istanbul?
              </AccordionTrigger>
              <AccordionContent>
                Yes, we can arrange your accommodation as part of our concierge service. We work with several partner hotels near our affiliated clinics, ranging from comfortable 3-star to luxury 5-star options. Hotel stays are often included in treatment packages depending on the cost of your treatment, or accommodation can be arranged separately based on your preferences.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-9">
              <AccordionTrigger className="text-left">
                Do I need a visa to visit Turkey for dental treatment?
              </AccordionTrigger>
              <AccordionContent>
                Visa requirements depend on your nationality. Many European citizens can enter Turkey without a visa for short stays. UK citizens can obtain an e-visa online before travel. We can provide guidance on visa requirements based on your specific situation and assist with any documentation needed to support your dental treatment visit.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-10">
              <AccordionTrigger className="text-left">
                Is it safe to travel to Istanbul for dental treatment?
              </AccordionTrigger>
              <AccordionContent>
                Istanbul is a major global city that welcomes millions of tourists and medical travelers each year. The tourist and medical districts where our partner clinics are located are safe and well-monitored. As with travel to any major city, normal precautions are advised. Our team will be with you throughout your stay to ensure your safety and comfort.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <Footer />
    </>
  );
}