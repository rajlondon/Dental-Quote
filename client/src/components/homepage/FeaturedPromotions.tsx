import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { ChevronRight, Calendar, Tag, Package, Timer } from 'lucide-react';
import { Link, useLocation } from 'wouter';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedPromotions() {
  const [, navigate] = useLocation();
  
  // Fetch featured promotions
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/promotions/featured'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/promotions/featured');
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });
  
  // Calculate days remaining for a promotion
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    return Math.max(0, differenceInDays(end, today));
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };
  
  // Handle clicking on a promotion
  const handlePromotionClick = (promotion: any) => {
    // If it's a package promotion, navigate to the package detail page
    if (promotion.type === 'package' && promotion.packageData) {
      navigate(`/package/${promotion.id}`);
    } else {
      // For discount promotions, navigate to clinic with promo code applied
      navigate(`/clinic/${promotion.clinic_id}?promo=${promotion.code}`);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto mt-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="pt-6">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  // If no promotions or error, don't render anything
  if (isError || !data?.promotions || data.promotions.length === 0) {
    return null;
  }
  
  // Sort by priority (highest first)
  const sortedPromotions = [...data.promotions].sort((a, b) => 
    b.homepage_priority - a.homepage_priority
  );
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Featured Promotions</h2>
          <p className="text-muted-foreground mt-2">
            Exclusive dental treatment packages and special offers from our partner clinics
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPromotions.map((promotion) => {
            const daysRemaining = getDaysRemaining(promotion.end_date);
            const isEnding = daysRemaining <= 7 && daysRemaining > 0;
            
            return (
              <Card 
                key={promotion.id} 
                className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-md"
              >
                {promotion.homepage_image_url && (
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={promotion.homepage_image_url} 
                      alt={promotion.title}
                      className="object-cover w-full h-full"
                    />
                    {isEnding && (
                      <Badge 
                        className="absolute top-2 right-2 bg-red-500 text-white font-medium border-none"
                      >
                        <Timer className="h-3 w-3 mr-1" />
                        {daysRemaining === 1 
                          ? 'Ends tomorrow!' 
                          : `Ends in ${daysRemaining} days`}
                      </Badge>
                    )}
                  </div>
                )}
                
                <CardContent className="pt-6 flex-grow">
                  <div className="flex items-center mb-3">
                    <img 
                      src={`/api/clinics/${promotion.clinic_id}/logo`} 
                      alt="Clinic logo"
                      className="w-8 h-8 rounded-full mr-2"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-clinic-logo.png';
                      }}
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {promotion.clinic_name || 'Partner Clinic'}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-2 mb-2">
                    {promotion.type === 'discount' ? (
                      <Tag className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <Package className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    )}
                    <h3 className="text-xl font-bold">{promotion.title}</h3>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {promotion.homepage_short_description || promotion.description}
                  </p>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      {promotion.type === 'discount' ? (
                        <Badge className="bg-primary/10 text-primary border-none font-medium">
                          {promotion.discountType === 'percentage' 
                            ? `${promotion.discountValue}% OFF` 
                            : `£${promotion.discountValue} OFF`}
                        </Badge>
                      ) : promotion.packageData && (
                        <div>
                          <div className="text-sm line-through text-muted-foreground">
                            £{promotion.packageData.originalPrice}
                          </div>
                          <div className="text-lg font-bold text-primary">
                            £{promotion.packageData.packagePrice}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        Until {formatDate(promotion.end_date)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full group"
                    onClick={() => handlePromotionClick(promotion)}
                  >
                    <span className="mr-1">
                      {promotion.type === 'package' ? 'View Package' : 'Get Discount'}
                    </span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}