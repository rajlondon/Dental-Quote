import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, User, ArrowRight, HomeIcon } from "lucide-react";

export default function QuoteRequestSuccessPage() {
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <Card className="border-green-200">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl">Quote Request Submitted Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Thank you for submitting your quote request. Our team and partner clinics will review your request and prepare a detailed quote for your dental treatment.
          </p>
          
          <div className="bg-muted/30 rounded-lg p-6 mt-6 space-y-4">
            <h3 className="font-semibold text-lg">What happens next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                  <span className="flex h-5 w-5 items-center justify-center font-medium text-primary">1</span>
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Review Process</h4>
                  <p className="text-sm text-muted-foreground">Our team will review your request and assign it to the most suitable clinics for your specific dental needs.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                  <span className="flex h-5 w-5 items-center justify-center font-medium text-primary">2</span>
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Quote Preparation</h4>
                  <p className="text-sm text-muted-foreground">Selected clinics will prepare detailed treatment plans with transparent pricing based on your requirements.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                  <span className="flex h-5 w-5 items-center justify-center font-medium text-primary">3</span>
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Notification</h4>
                  <p className="text-sm text-muted-foreground">You'll receive an email notification when your quote is ready. This typically takes 24-48 hours.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/" className="flex items-center gap-2">
              <HomeIcon className="h-4 w-4" />
              Return to Homepage
            </Link>
          </Button>
          
          <Button variant="default" asChild className="w-full sm:w-auto">
            <Link href="/auth" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Create an Account
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Have questions? <a href="/contact" className="underline text-primary">Contact our support team</a></p>
      </div>
    </div>
  );
}