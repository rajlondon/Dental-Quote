import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';

import PromotionsList from '@/components/clinic/PromotionsList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const ClinicPromotionsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Promotions | Clinic Portal | MyDentalFly</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">
            Create and manage special offers and packages for your patients
          </p>
        </div>
        <Link href="/clinic/promotions/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Promotion
          </Button>
        </Link>
      </div>
      
      <PromotionsList />
      
      <div className="bg-muted/50 rounded-lg p-6 border">
        <h2 className="text-xl font-medium mb-2">Benefits of Custom Promotions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-card p-4 rounded-md border">
            <h3 className="font-medium">Increased Visibility</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Promotions can be featured on our homepage, increasing visibility to international patients.
            </p>
          </div>
          <div className="bg-card p-4 rounded-md border">
            <h3 className="font-medium">Custom Packages</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Bundle treatments with tourist attractions and services for a complete health vacation.
            </p>
          </div>
          <div className="bg-card p-4 rounded-md border">
            <h3 className="font-medium">Targeted Marketing</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Use promo codes in your marketing campaigns to track effectiveness and boost bookings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicPromotionsPage;