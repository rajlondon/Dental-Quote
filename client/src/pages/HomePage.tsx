import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, ListChecks, Layers, FileStack } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-primary">MyDentalFly Quote System</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive dental treatment quote system with multiple implementations
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Enhanced Quote Builder */}
          <Card className="border-2 border-primary/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileStack className="h-5 w-5 mr-2 text-primary" />
                Enhanced Quote Builder
              </CardTitle>
              <CardDescription>
                Multi-step workflow with comprehensive features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Complete solution with patient information collection, treatment categorization, 
                and detailed quote review.
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Multi-step workflow</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Treatment categories</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Patient information collection</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Zustand state with persistence</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/enhanced-quote">
                <Button className="w-full flex items-center justify-center">
                  Try Enhanced Builder
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* Documented Quote Builder */}
          <Card className="border border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ListChecks className="h-5 w-5 mr-2 text-primary" />
                Documented Quote Builder
              </CardTitle>
              <CardDescription>
                Reliable solution with inline status messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                A clean, well-documented implementation that uses Zustand for state management 
                with localStorage persistence.
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Zustand state management</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">LocalStorage persistence</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Inline status messages</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Comprehensive error handling</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/documented-quote">
                <Button variant="outline" className="w-full flex items-center justify-center">
                  Try Documented Builder
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          {/* Emergency Quote Builder */}
          <Card className="border border-gray-200 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="h-5 w-5 mr-2 text-primary" />
                Emergency Quote Builder
              </CardTitle>
              <CardDescription>
                Standalone solution with minimal dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                A simplified, self-contained implementation that uses only local component state 
                to ensure maximum reliability.
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Local component state</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">No external dependencies</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Simple UI with minimal complexity</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm">Fallback API simulation</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/emergency-quote">
                <Button variant="outline" className="w-full flex items-center justify-center">
                  Try Emergency Builder
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">About the Implementation</h2>
          <p className="text-gray-600 mb-6">
            We've created multiple quote builder implementations to demonstrate different approaches to state management 
            and form handling. Each approach has its own strengths and use cases.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-left">
            <h3 className="font-medium text-blue-800 mb-2">Implementation Notes</h3>
            <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
              <li>The Enhanced Builder uses a multi-step workflow with treatment categories and patient information collection</li>
              <li>The Documented Builder focuses on reliable state management with inline status messages</li>
              <li>The Emergency Builder uses local component state for maximum reliability</li>
              <li>All implementations include fallback mechanisms for API failures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}