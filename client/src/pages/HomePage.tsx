import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SpecialOffersSection from '@/components/home/SpecialOffersSection';
import { ArrowRight, Star, HeartPulse, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/5 to-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                Find World-Class Dental Care at <span className="text-primary">Affordable Prices</span>
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Compare prices and treatments from top-rated Turkish dental clinics.
                Save up to 70% compared to UK and European prices.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link href="/quote-builder">
                    Get Your Free Quote <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link href="/how-it-works">
                    How It Works
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src="/images/hero-image.jpg" 
                  alt="Smiling patient at Turkish dental clinic" 
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <Link href="/quote-builder">
              Start Your Free Quote <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}