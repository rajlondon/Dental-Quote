import React from 'react';
import QuoteNavigation from '@/components/navigation/QuoteNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

/**
 * Test Dashboard for the Quote Management System
 * Provides a centralized interface for testing various components and scenarios
 */
const TestDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Quote System Testing Dashboard</h1>
      
      <div className="grid gap-6">
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Quote System Testing</CardTitle>
              <CardDescription>
                Use these tools to test various aspects of the quote generation system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuoteNavigation />
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
                <h3 className="font-bold flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" /> 
                  Testing Instructions:
                </h3>
                <ol className="list-decimal ml-8 mt-2 space-y-2">
                  <li>Click "Start New Quote" to test the basic quote flow</li>
                  <li>Use "With Promo Code" to test promo code application (TEST20)</li>
                  <li>Try "With Special Offer" to test special offer integration</li>
                  <li>Verify that all steps work correctly: selection, summary, and confirmation</li>
                  <li>Check that email sending functionality works in the confirmation step</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Component Status</CardTitle>
              <CardDescription>
                Current implementation status of quote system components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left">Component</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 px-4 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 px-4">QuoteBuilder</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" /> Implemented
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">Treatment selection working</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">QuoteSummary</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" /> Implemented
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">Optimized with React.memo</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">QuoteConfirmation</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full text-xs">
                        <HelpCircle className="h-3 w-3 mr-1" /> Partial
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">Email integration pending</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">LazyQuoteFlow</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" /> Implemented
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">Navigation between steps working</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">SpecialOfferCard</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" /> Implemented
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">Image error handling added</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Debug Tools</CardTitle>
              <CardDescription>
                Tools to help identify and fix issues with the quote system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="text-sm font-medium mb-2">API Endpoints</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <code className="bg-gray-100 px-2 py-1 rounded">/api/treatments</code> - Available treatments
                  </li>
                  <li>
                    <code className="bg-gray-100 px-2 py-1 rounded">/api/treatment-packages</code> - Treatment packages
                  </li>
                  <li>
                    <code className="bg-gray-100 px-2 py-1 rounded">/api/promo-codes/validate</code> - Validate promo codes
                  </li>
                  <li>
                    <code className="bg-gray-100 px-2 py-1 rounded">/api/special-offers</code> - Get special offers
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Navigate To:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Link href="/quote-test">
                    <Button variant="outline" className="w-full">Quote Test Page</Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full">Main Application</Button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-blue-700 mb-2">Troubleshooting Tips:</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>Check browser console for JavaScript errors</li>
                  <li>Verify that all API endpoints return 200 status</li>
                  <li>Test components in isolation before integration</li>
                  <li>Clear browser cache if styles are not updating</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default TestDashboard;