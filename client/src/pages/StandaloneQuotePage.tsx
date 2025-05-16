import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, FileText, Check } from 'lucide-react';
import { useQuoteStore } from '@/stores/quoteStore';

const StandaloneQuotePage: React.FC = () => {
  const { t } = useTranslation();
  const quoteStore = useQuoteStore();
  
  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Add a treatment function
  const handleAddTreatment = (name: string, price: number) => {
    quoteStore.addTreatment({
      id: `${Date.now()}`,
      name,
      price,
      quantity: 1
    });
  };
  
  // Sample treatments for quick selection
  const treatmentOptions = [
    { name: "Dental Implant", price: 650 },
    { name: "Porcelain Crown", price: 190 },
    { name: "Root Canal", price: 120 },
    { name: "Teeth Whitening", price: 220 },
    { name: "Dental Cleaning", price: 45 },
    { name: "Porcelain Veneer", price: 180 }
  ];
  
  return (
    <>
      <Helmet>
        <title>{t('quote.builder_page_title', 'Dental Treatment Quote Builder - MyDentalFly')}</title>
        <meta name="description" content={t('quote.builder_page_description', 'Create your personalized dental treatment quote instantly. Compare prices from top Turkish dental clinics.')} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {t('quote.builder_title', 'Build Your Dental Treatment Quote')}
              </h1>
              <p className="text-gray-600 max-w-3xl mx-auto">
                {t('quote.builder_subtitle', 'Select your treatments below to create a personalized quote. Compare prices from top Turkish dental clinics.')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Treatment selection */}
              <div className="lg:col-span-2">
                <Card className="shadow-sm mb-6">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <Calculator className="mr-2 h-5 w-5 text-primary" />
                      {t('quote.treatment_selection', 'Treatment Selection')}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {treatmentOptions.map((treatment, index) => (
                        <div 
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                          onClick={() => handleAddTreatment(treatment.name, treatment.price)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{treatment.name}</h3>
                              <p className="text-sm text-gray-500">{formatCurrency(treatment.price)}</p>
                            </div>
                            <Button size="sm" variant="outline">
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <h3 className="font-medium text-blue-800 mb-2">Special Promotions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white rounded-md p-3 border border-blue-100">
                          <div className="flex items-center mb-1">
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                              SUMMER15
                            </span>
                            <span className="text-xs text-gray-500">15% OFF</span>
                          </div>
                          <p className="text-sm">Summer Special: 15% off all treatments</p>
                          <Button 
                            size="sm" 
                            className="mt-2 w-full" 
                            variant="outline"
                            onClick={() => quoteStore.applyPromoCode('SUMMER15')}
                          >
                            Apply Code
                          </Button>
                        </div>
                        
                        <div className="bg-white rounded-md p-3 border border-blue-100">
                          <div className="flex items-center mb-1">
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                              DENTAL25
                            </span>
                            <span className="text-xs text-gray-500">25% OFF</span>
                          </div>
                          <p className="text-sm">Premium Patient Discount: 25% off</p>
                          <Button 
                            size="sm" 
                            className="mt-2 w-full" 
                            variant="outline"
                            onClick={() => quoteStore.applyPromoCode('DENTAL25')}
                          >
                            Apply Code
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-primary" />
                      {t('quote.patient_information', 'Patient Information')}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                          placeholder="Enter first name"
                          value={quoteStore.patientInfo?.firstName || ''}
                          onChange={(e) => {
                            const info = quoteStore.patientInfo || {
                              firstName: '', 
                              lastName: '', 
                              email: ''
                            };
                            quoteStore.setPatientInfo({
                              ...info,
                              firstName: e.target.value
                            });
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Enter last name"
                          value={quoteStore.patientInfo?.lastName || ''}
                          onChange={(e) => {
                            const info = quoteStore.patientInfo || {
                              firstName: '', 
                              lastName: '', 
                              email: ''
                            };
                            quoteStore.setPatientInfo({
                              ...info,
                              lastName: e.target.value
                            });
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input 
                          type="email" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Enter email address"
                          value={quoteStore.patientInfo?.email || ''}
                          onChange={(e) => {
                            const info = quoteStore.patientInfo || {
                              firstName: '', 
                              lastName: '', 
                              email: ''
                            };
                            quoteStore.setPatientInfo({
                              ...info,
                              email: e.target.value
                            });
                          }}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input 
                          type="tel" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Enter phone number"
                          value={quoteStore.patientInfo?.phone || ''}
                          onChange={(e) => {
                            const info = quoteStore.patientInfo || {
                              firstName: '', 
                              lastName: '', 
                              email: ''
                            };
                            quoteStore.setPatientInfo({
                              ...info,
                              phone: e.target.value
                            });
                          }}
                        />
                      </div>
                    </div>
                    
                    <Button className="mt-4">
                      Save Quote
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right column - Quote Summary */}
              <div>
                <div className="sticky top-24">
                  <Card className="shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4">
                        {t('quote.quote_summary', 'Quote Summary')}
                      </h2>
                      
                      {quoteStore.treatments.length > 0 ? (
                        <>
                          <div className="border-t border-b border-gray-200 py-3 mb-4">
                            {quoteStore.treatments.map((treatment, idx) => (
                              <div key={idx} className="flex justify-between py-2">
                                <div>
                                  <p className="font-medium">{treatment.name}</p>
                                  <div className="flex items-center mt-1">
                                    <button 
                                      className="p-1 text-gray-500 hover:text-gray-700"
                                      onClick={() => {
                                        if (treatment.quantity > 1) {
                                          quoteStore.updateQuantity(treatment.id, treatment.quantity - 1);
                                        }
                                      }}
                                    >
                                      -
                                    </button>
                                    <span className="mx-2 text-sm">{treatment.quantity}</span>
                                    <button 
                                      className="p-1 text-gray-500 hover:text-gray-700"
                                      onClick={() => quoteStore.updateQuantity(treatment.id, treatment.quantity + 1)}
                                    >
                                      +
                                    </button>
                                    <button 
                                      className="ml-2 text-red-500 text-sm"
                                      onClick={() => quoteStore.removeTreatment(treatment.id)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                                <p>{formatCurrency(treatment.price * treatment.quantity)}</p>
                              </div>
                            ))}
                          </div>
                          
                          {/* Promo code section */}
                          <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2">Promo Code</h3>
                            <div className="flex">
                              <input 
                                type="text" 
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                                placeholder="Enter promo code"
                                value={quoteStore.promoCode || ''}
                                onChange={(e) => {
                                  // Since there's no setPromoCode function, we'll remove the old one
                                  // and handle this in the apply button
                                  if (quoteStore.promoCode) {
                                    quoteStore.removePromoCode();
                                  }
                                }}
                              />
                              <Button 
                                className="rounded-l-none" 
                                variant="secondary"
                                onClick={() => {
                                  if (quoteStore.promoCode) {
                                    quoteStore.applyPromoCode(quoteStore.promoCode);
                                  }
                                }}
                              >
                                Apply
                              </Button>
                            </div>
                            
                            {quoteStore.discountPercent > 0 && (
                              <div className="mt-2 text-sm text-green-600 flex items-center">
                                <Check className="h-4 w-4 mr-1" />
                                {quoteStore.discountPercent}% discount applied
                              </div>
                            )}
                          </div>
                          
                          {/* Totals */}
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal:</span>
                              <span>{formatCurrency(quoteStore.subtotal)}</span>
                            </div>
                            
                            {quoteStore.discountPercent > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount ({quoteStore.discountPercent}%):</span>
                                <span>
                                  -{formatCurrency(quoteStore.subtotal - quoteStore.total)}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                              <span>Total:</span>
                              <span>{formatCurrency(quoteStore.total)}</span>
                            </div>
                          </div>
                          
                          <Button className="w-full mt-4">
                            Save Quote
                          </Button>
                        </>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500 mb-4">
                            Your quote is empty. Add treatments from the selection on the left.
                          </p>
                          <div className="animate-pulse text-primary">
                            <Calculator className="h-12 w-12 mx-auto" />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default StandaloneQuotePage;