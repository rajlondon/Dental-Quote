import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const QuoteNavigation = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dental Quote System Implementations</h1>
      <p className="mb-6 text-gray-600">
        Test different implementations of the dental quote system with promo code handling.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Original Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              The original quote builder implementation.
            </p>
            <Link href="/quick-quote">
              <Button className="w-full">Open Original</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Direct Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Direct approach with separate state variables for treatments and promo information.
            </p>
            <Link href="/quick-quote-direct">
              <Button className="w-full">Open Direct Implementation</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Isolated Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Completely isolated implementation with separate state variables and mock data.
            </p>
            <Link href="/quick-quote-isolated">
              <Button className="w-full" variant="default">Open Isolated Implementation</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuoteNavigation;