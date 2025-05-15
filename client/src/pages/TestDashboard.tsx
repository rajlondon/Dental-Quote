import React from 'react';
import QuoteNavigation from '@/components/navigation/QuoteNavigation';
import TestNavigationHeader from '@/components/navigation/TestNavigationHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, HelpCircle, Package, Tag } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

/**
 * Test Dashboard for the Quote Management System
 * Provides a centralized interface for testing various components and scenarios
 */
const TestDashboard: React.FC = () => {
  return (
    <>
      <TestNavigationHeader />
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
              
              {/* Prominent link to the new comprehensive demo */}
              <div className="mt-6 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">New: Comprehensive Quote System Demo</h3>
                    <p className="text-sm text-blue-700">
                      Try our new all-in-one demo page that showcases all quote system features together.
                    </p>
                  </div>
                  <Link href="/quote-system-demo">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Launch Full Demo
                    </Button>
                  </Link>
                </div>
              </div>
              
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
                    <code className="bg-gray-100 px-2 py-1 rounded">/api/test-packages</code> - Treatment packages
                  </li>
                  <li>
                    <code className="bg-gray-100 px-2 py-1 rounded">/api/promo-codes/validate</code> - Validate promo codes
                  </li>
                  <li>
                    <code className="bg-gray-100 px-2 py-1 rounded">/api/special-offers</code> - Get special offers
                  </li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-md border border-amber-100 mb-4">
                <h3 className="text-sm font-medium text-amber-800 flex items-center mb-2">
                  <Package className="h-4 w-4 mr-2" />
                  Treatment Packages Pricing
                </h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex justify-between">
                    <span>6 Implants + 6 Crowns Bundle:</span>
                    <span className="font-semibold">£6,900</span>
                  </li>
                  <li className="flex justify-between">
                    <span>4 Implants + 4 Crowns Bundle:</span>
                    <span className="font-semibold">£4,600</span>
                  </li>
                  <li className="flex justify-between">
                    <span>All-on-4 Implant Package:</span>
                    <span className="font-semibold">£8,500</span>
                  </li>
                  <li className="flex justify-between">
                    <span>8 Veneers Smile Makeover:</span>
                    <span className="font-semibold">£3,050</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md border border-green-100 mb-4">
                <h3 className="text-sm font-medium text-green-800 flex items-center mb-2">
                  <Tag className="h-4 w-4 mr-2" />
                  Available Promo Codes
                </h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex justify-between">
                    <span className="font-mono bg-white px-1 py-0.5 rounded">WELCOME20</span>
                    <span>20% off (max £500)</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-mono bg-white px-1 py-0.5 rounded">SUMMER100</span>
                    <span>£100 off packages</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-mono bg-white px-1 py-0.5 rounded">IMPLANT30</span>
                    <span>30% off implant packages</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Navigate To:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Link href="/quote-test">
                    <Button variant="outline" className="w-full">Quote Test Page</Button>
                  </Link>
                  <Link href="/simple-quote-test">
                    <Button variant="outline" className="w-full bg-blue-50 hover:bg-blue-100">
                      Simple Test Page
                    </Button>
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
    </>
  );
};

export default TestDashboard;