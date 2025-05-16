import React, { useState, useEffect } from 'react';
import { useQuoteStore } from '../../stores/quoteStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Check, Trash2, Minus, Plus } from 'lucide-react';

// Formatting helpers
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export function PersistentQuoteBuilder() {
  const { toast } = useToast();
  
  // Connect to global store
  const {
    treatments,
    promoCode,
    discountPercent,
    subtotal,
    total,
    loading,
    addTreatment,
    removeTreatment,
    updateQuantity,
    applyPromoCode,
    removePromoCode,
    saveQuote,
    resetQuote
  } = useQuoteStore();
  
  // Local state
  const [promoInput, setPromoInput] = useState('');
  const [availableTreatments, setAvailableTreatments] = useState<Array<{
    id: string;
    name: string;
    price: number;
    quantity?: number;
  }>>([]);
  const [treatmentsLoading, setTreatmentsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('treatments');
  
  // Fetch available treatments on mount
  useEffect(() => {
    const fetchTreatments = async () => {
      setTreatmentsLoading(true);
      try {
        const response = await fetch('/api/treatment-packages');
        
        if (response.ok) {
          const data = await response.json();
          setAvailableTreatments(data);
        } else {
          console.error('Failed to fetch treatments from API, using fallback data');
          // Use fallback treatment data 
          setAvailableTreatments([
            { id: '1', name: 'Dental Cleaning', price: 100 },
            { id: '2', name: 'Teeth Whitening', price: 250 },
            { id: '3', name: 'Dental Filling', price: 150 },
            { id: '4', name: 'Root Canal', price: 800 },
            { id: '5', name: 'Dental Crown', price: 1200 },
            { id: '6', name: 'Dental Implant', price: 2500 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching treatments:', error);
        // Use fallback treatment data 
        setAvailableTreatments([
          { id: '1', name: 'Dental Cleaning', price: 100 },
          { id: '2', name: 'Teeth Whitening', price: 250 },
          { id: '3', name: 'Dental Filling', price: 150 },
          { id: '4', name: 'Root Canal', price: 800 },
          { id: '5', name: 'Dental Crown', price: 1200 },
          { id: '6', name: 'Dental Implant', price: 2500 },
        ]);
      } finally {
        setTreatmentsLoading(false);
      }
    };
    
    fetchTreatments();
  }, []);
  
  // Handle promo code application with tab persistence
  const handleApplyPromoCode = async () => {
    if (!promoInput || loading.promoCode) return;
    
    // Store current tab before API call
    const currentTab = activeTab;
    
    const success = await applyPromoCode(promoInput);
    
    if (success) {
      toast({
        title: 'Promo Code Applied',
        description: `Successfully applied ${discountPercent}% discount.`,
      });
      setPromoInput('');
      
      // Restore tab selection - critical for UX
      setTimeout(() => {
        setActiveTab(currentTab);
      }, 10);
    } else {
      toast({
        title: 'Invalid Promo Code',
        description: 'The promo code you entered is not valid.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle promo code input enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyPromoCode();
    }
  };
  
  // Handle saving quote
  const handleSaveQuote = async () => {
    if (treatments.length === 0) {
      toast({
        title: 'No Treatments Selected',
        description: 'Please select at least one treatment.',
        variant: 'destructive',
      });
      return;
    }
    
    const quoteId = await saveQuote();
    
    if (quoteId) {
      toast({
        title: 'Quote Created Successfully',
        description: `Your quote has been created. Quote ID: ${quoteId}`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'An error occurred while creating your quote.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Dental Treatment Quote</h1>
        
        {/* Reset Button (if quote has items) */}
        {treatments.length > 0 && (
          <div className="flex justify-end mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetQuote}
            >
              Reset Quote
            </Button>
          </div>
        )}
        
        {/* Tabs */}
        <Tabs defaultValue="treatments" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="treatments">Available Treatments</TabsTrigger>
            <TabsTrigger value="summary">Quote Summary</TabsTrigger>
          </TabsList>
          
          {/* Treatments Tab */}
          <TabsContent value="treatments">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Treatments</CardTitle>
              </CardHeader>
              <CardContent>
                {treatmentsLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableTreatments.map(treatment => (
                      <div 
                        key={treatment.id}
                        className={`p-4 border rounded-md cursor-pointer transition-colors hover:border-primary ${
                          treatments.some(t => t.id === treatment.id)
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => addTreatment({
                          ...treatment,
                          quantity: treatment.quantity || 1
                        })}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{treatment.name}</h3>
                            <p className="text-gray-500 text-sm mt-1">{formatCurrency(treatment.price)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {treatments.some(t => t.id === treatment.id) ? (
                              <div className="bg-primary/20 rounded-full p-1">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                            ) : (
                              <div className="h-6 w-6 border rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* View Summary Button */}
                {treatments.length > 0 && (
                  <div className="mt-6 flex justify-center">
                    <Button 
                      onClick={() => setActiveTab('summary')}
                      className="w-full max-w-md"
                    >
                      View Quote Summary ({treatments.reduce((sum, t) => sum + t.quantity, 0)} items)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Summary Tab */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Quote Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {treatments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Your quote is empty</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('treatments')}
                    >
                      Browse Treatments
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Selected Treatments Table */}
                    <div>
                      <h3 className="font-medium mb-2">Selected Treatments:</h3>
                      <div className="space-y-2">
                        {treatments.map(treatment => (
                          <div 
                            key={treatment.id} 
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                          >
                            <div className="flex items-center">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                onClick={() => removeTreatment(treatment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <span className="ml-2">{treatment.name}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(treatment.id, Math.max(1, treatment.quantity - 1))}
                                  disabled={treatment.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center">{treatment.quantity}</span>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(treatment.id, treatment.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <span className="font-medium min-w-[80px] text-right">
                                {formatCurrency(treatment.price * treatment.quantity)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Promo Code Section */}
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-3">Promo Code</h3>
                      {promoCode ? (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Check className="h-4 w-4 text-green-600 mr-2" />
                              <div className="text-green-700 flex items-center">
                                <Badge variant="outline" className="bg-green-100 text-green-800 font-medium mr-2">
                                  {promoCode}
                                </Badge>
                                <span>{discountPercent}% discount applied</span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700"
                              onClick={removePromoCode}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1`}
                            value={promoInput}
                            onChange={e => setPromoInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter promo code"
                            disabled={loading.promoCode}
                          />
                          <Button 
                            onClick={handleApplyPromoCode}
                            disabled={!promoInput || loading.promoCode}
                          >
                            {loading.promoCode ? 'Applying...' : 'Apply'}
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Try promo codes: SUMMER15, DENTAL25, NEWPATIENT, TEST10
                      </p>
                    </div>
                    
                    {/* Price Summary */}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                      </div>
                      
                      {discountPercent > 0 && (
                        <div className="flex justify-between mb-2 text-green-600">
                          <span>Discount ({discountPercent}%):</span>
                          <span className="font-medium">-{formatCurrency(subtotal * (discountPercent / 100))}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('treatments')}
                        className="flex-1"
                      >
                        Add More Treatments
                      </Button>
                      <Button
                        onClick={handleSaveQuote}
                        disabled={loading.saving}
                        className="flex-1"
                      >
                        {loading.saving ? 'Processing...' : 'Complete Quote'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}