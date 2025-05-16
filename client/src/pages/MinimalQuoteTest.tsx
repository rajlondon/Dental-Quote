import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

/**
 * MinimalQuoteTest - A bare bones implementation with no dependencies
 * to diagnose the core issue with form submissions
 */
const MinimalQuoteTest: React.FC = () => {
  // Create refs for each element to track what's happening
  const formRef = useRef<HTMLFormElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  
  // Basic state
  const [items, setItems] = useState<Array<{name: string; price: number}>>([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    `Page loaded at ${new Date().toLocaleTimeString()}`
  ]);
  
  // Add log entry
  const addLog = (message: string) => {
    setLogs(prevLogs => [...prevLogs, `${new Date().toLocaleTimeString()}: ${message}`]);
    
    // Auto-scroll log to bottom
    setTimeout(() => {
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }
    }, 10);
  };
  
  // Add item handler
  const addItem = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Explicitly prevent default
    addLog(`Adding item: ${e.currentTarget.dataset.name}`);
    
    const name = e.currentTarget.dataset.name || 'Unknown';
    const price = parseInt(e.currentTarget.dataset.price || '0', 10);
    
    setItems(prev => [...prev, { name, price }]);
  };
  
  // Apply promo code handler
  const applyPromoCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Explicitly prevent default
    addLog(`Applying promo code: ${promoCode}`);
    
    if (promoCode === 'TEST10') {
      setDiscount(10);
      addLog('Applied 10% discount');
    } else if (promoCode === 'TEST20') {
      setDiscount(20);
      addLog('Applied 20% discount');
    } else {
      addLog('Invalid promo code');
    }
  };
  
  // Calculate total
  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  };
  
  // Clear all data
  const clearAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setItems([]);
    setPromoCode('');
    setDiscount(0);
    addLog('Cleared all data');
  };
  
  // Handle document-level click
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('button') && !target.closest('input')) {
        addLog(`Document clicked at (${e.clientX}, ${e.clientY})`);
      }
    };
    
    // Log when state updates
    let prevItems = items;
    let prevDiscount = discount;
    
    const trackStateInterval = setInterval(() => {
      if (prevItems !== items) {
        addLog(`ITEMS UPDATED: Now has ${items.length} items`);
        prevItems = items;
      }
      
      if (prevDiscount !== discount) {
        addLog(`DISCOUNT UPDATED: Now ${discount}%`);
        prevDiscount = discount;
      }
    }, 500);
    
    document.addEventListener('click', handleDocumentClick);
    
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      clearInterval(trackStateInterval);
    };
  }, [items, discount]);
  
  // Prevent browser form navigation
  useEffect(() => {
    const handleFormSubmit = (e: Event) => {
      addLog('NATIVE FORM SUBMIT DETECTED - PREVENTING');
      e.preventDefault();
    };
    
    formRef.current?.addEventListener('submit', handleFormSubmit);
    
    return () => {
      formRef.current?.removeEventListener('submit', handleFormSubmit);
    };
  }, []);
  
  // Event bubbling diagnosis
  useEffect(() => {
    const captureFn = (e: Event) => {
      if (e.target instanceof HTMLElement && 
          (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT')) {
        addLog(`EVENT CAPTURE (${e.type}): ${e.target.tagName}`);
      }
    };
    
    document.addEventListener('click', captureFn, true);
    document.addEventListener('submit', captureFn, true);
    
    return () => {
      document.removeEventListener('click', captureFn, true);
      document.removeEventListener('submit', captureFn, true);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quote Builder Section */}
        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Minimal Quote Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-medium mb-2">Available Items</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    type="button"
                    data-name="Basic Service" 
                    data-price="100"
                    onClick={addItem}
                    className="justify-between"
                  >
                    <span>Basic Service</span>
                    <span>$100</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button"
                    data-name="Premium Service" 
                    data-price="250"
                    onClick={addItem}
                    className="justify-between"
                  >
                    <span>Premium Service</span>
                    <span>$250</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button"
                    data-name="Deluxe Package" 
                    data-price="500"
                    onClick={addItem}
                    className="justify-between"
                  >
                    <span>Deluxe Package</span>
                    <span>$500</span>
                  </Button>
                </div>
              </div>
              
              {/* Promo Code Form */}
              <div className="mb-4">
                <h3 className="font-medium mb-2">Promo Code</h3>
                <form ref={formRef} onSubmit={applyPromoCode} className="flex gap-2">
                  <Input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code (TEST10, TEST20)"
                    className="flex-1"
                  />
                  <Button type="submit">Apply</Button>
                </form>
              </div>
              
              {/* Summary */}
              <div className="mb-4 p-4 bg-gray-100 rounded-md">
                <h3 className="font-medium mb-2">Quote Summary</h3>
                {items.length === 0 ? (
                  <p className="text-gray-500">No items added yet</p>
                ) : (
                  <>
                    <ul className="mb-2 space-y-1">
                      {items.map((item, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{item.name}</span>
                          <span>${item.price}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${items.reduce((sum, item) => sum + item.price, 0)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({discount}%):</span>
                          <span>-${Math.round(items.reduce((sum, item) => sum + item.price, 0) * (discount / 100))}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold mt-1 pt-1 border-t">
                        <span>Total:</span>
                        <span>${calculateTotal()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <Button 
                type="button" 
                variant="destructive" 
                onClick={clearAll} 
                className="w-full"
              >
                Clear All Data
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Debug Logs Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Event & State Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={logRef}
                className="bg-gray-900 text-gray-100 p-4 rounded-md h-[500px] overflow-y-auto font-mono text-sm"
              >
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MinimalQuoteTest;