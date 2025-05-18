import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SpecialOffersSection from '@/components/home/SpecialOffersSection';
import SearchBar from '@/components/home/SearchBar';
import { ArrowRight, Star, HeartPulse, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Search Bar Section */}
      <SearchBar />

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose MyDentalFly</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We make it easy to access high-quality dental care in Turkey with transparent pricing and dedicated support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Quality Assurance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">All our partner clinics are rigorously vetted for quality, hygiene, and adherence to international standards.</p>
              </CardContent>
            </Card>
            
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <HeartPulse className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Personalized Care</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Get a tailored treatment plan based on your needs, with transparent pricing and no hidden fees.</p>
              </CardContent>
            </Card>
            
            <Card className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>All-Inclusive Packages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Our treatment packages include accommodation, airport transfers, and dedicated patient coordinators.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <SpecialOffersSection />

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Smile?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Get a free, no-obligation quote for your dental treatment in Turkey.
            Our team will help you find the best clinic for your needs.
          </p>
          <Button asChild size="lg" className="text-base">
            <Link href="/quote-flow">
              Start Your Free Quote <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}