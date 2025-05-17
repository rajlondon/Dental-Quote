import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Gem, Globe, HeartPulse, Star } from "lucide-react";
import SpecialOffersSection from "@/components/home/SpecialOffersSection";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 md:gap-12 items-center">
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Your <span className="text-primary">Smile Transformation</span> Starts Here
              </h1>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Compare top-rated dental clinics in Turkey. Get personalized treatment plans,
                transparent pricing, and dedicated support throughout your journey.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/quote-builder">
                  <Button className="flex-1" size="lg">
                    Get Your Quote <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/clinics">
                  <Button variant="outline" className="flex-1" size="lg">
                    Browse Clinics
                  </Button>
                </Link>
              </div>
              <div className="flex gap-1 md:gap-2 text-sm text-muted-foreground mt-2">
                <div className="flex items-center">
                  <CheckCircle2 className="mr-1 h-4 w-4 text-primary" />
                  <span>Free Consultations</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="mr-1 h-4 w-4 text-primary" />
                  <span>Clear Pricing</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="mr-1 h-4 w-4 text-primary" />
                  <span>Multi-currency</span>
                </div>
              </div>
            </div>
            <div className="mx-auto flex items-center justify-center">
              <div className="relative">
                <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-primary/20 blur-xl"></div>
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/20 blur-xl"></div>
                <div className="relative rounded-lg border bg-background p-8 shadow-xl">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <Star className="h-5 w-5 text-yellow-500" />
                      <Star className="h-5 w-5 text-yellow-500" />
                      <Star className="h-5 w-5 text-yellow-500" />
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="ml-2 text-sm">4.9/5 (120+ reviews)</span>
                    </div>
                    <blockquote className="text-sm/6 italic">
                      "MyDentalFly made my dental tourism experience absolutely seamless. From comparing clinics to
                      finalizing my treatment plan, everything was transparent and hassle-free."
                    </blockquote>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted"></div>
                      <div>
                        <div className="font-semibold">Sarah Thompson</div>
                        <div className="text-xs text-muted-foreground">London, UK</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <SpecialOffersSection />

      {/* How It Works */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Simple steps to find the perfect dental treatment in Turkey
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-12 pt-8">
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full">
                <Gem className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Build Your Quote</h3>
              <p className="text-center text-muted-foreground text-sm">
                Select your treatments and get an instant quote with multiple currency options
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full">
                <HeartPulse className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Compare Clinics</h3>
              <p className="text-center text-muted-foreground text-sm">
                Browse clinics, check reviews, credentials, and facilities to find your perfect match
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 shadow-sm">
              <div className="bg-primary/10 p-3 rounded-full">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Travel & Treatment</h3>
              <p className="text-center text-muted-foreground text-sm">
                Get support with travel arrangements and enjoy your dental treatment with confidence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter">Ready to Transform Your Smile?</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Get a personalized quote today and start your journey to affordable, quality dental care
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/quote-builder">
                <Button className="flex-1" size="lg">
                  Get Your Free Quote <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="flex-1" size="lg">
                  Free Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}