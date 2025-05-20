import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';

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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Tag, Clock, Info, ArrowRight } from 'lucide-react';

// Type for promotion
interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'discount' | 'package';
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  clinicId: string;
  start_date: string;
  end_date: string;
  status: string;
  homepage_short_description?: string;
  homepage_image_url?: string;
  packageData?: {
    name: string;
    description: string;
    originalPrice: number;
    packagePrice: number;
  };
}

const FeaturedPromotions = () => {
  const { toast } = useToast();
  
  // Fetch featured promotions
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/promotions/featured'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/promotions/featured');
      const data = await response.json();
      return data.promotions as Promotion[];
    },
  });
  
  // Track promotion view mutation
  const trackViewMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('POST', `/promotions/${id}/view`);
    },
  });
  
  // Track views when promotions are loaded
  useEffect(() => {
    if (data?.length) {
      // Track views for all displayed promotions
      data.forEach(promo => {
        trackViewMutation.mutate(promo.id);
      });
    }
  }, [data]);
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Calculate time until expiration
  const getTimeUntilExpiration = (endDate: string) => {
    try {
      const daysLeft = Math.ceil(
        (new Date(endDate).getTime() - new Date().getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      
      if (daysLeft <= 0) {
        return 'Expires today';
      } else if (daysLeft === 1) {
        return 'Expires tomorrow';
      } else if (daysLeft <= 7) {
        return `Expires in ${daysLeft} days`;
      } else {
        return `Expires ${formatDistanceToNow(new Date(endDate), { addSuffix: true })}`;
      }
    } catch (e) {
      return 'Limited time offer';
    }
  };
  
  // Calculate savings for packages
  const calculateSavings = (originalPrice: number, packagePrice: number) => {
    const savingsAmount = originalPrice - packagePrice;
    const savingsPercentage = Math.round((savingsAmount / originalPrice) * 100);
    
    return {
      amount: savingsAmount,
      percentage: savingsPercentage,
    };
  };
  
  // Handle errors
  if (error) {
    return null; // Hide component if there's an error
  }
  
  // If no promotions or still loading with no data yet, render nothing
  if ((!data || data.length === 0) && isLoading) {
    return (
      <div className="py-6">
        <h2 className="text-2xl font-bold mb-4">Special Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="h-96">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-36 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // If no promotions after loading, render nothing
  if (!data || data.length === 0) {
    return null;
  }
  
  // Mobile carousel view
  const mobileView = (
    <Carousel className="mb-8 lg:hidden">
      <CarouselContent>
        {data.map(promotion => (
          <CarouselItem key={promotion.id}>
            <PromotionCard promotion={promotion} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
  
  // Desktop grid view
  const desktopView = (
    <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      {data.map(promotion => (
        <PromotionCard key={promotion.id} promotion={promotion} />
      ))}
    </div>
  );
  
  return (
    <section className="py-8 px-4 bg-primary/5 rounded-lg">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Featured Offers</h2>
          <p className="text-muted-foreground">Special promotions from our partner clinics</p>
        </div>
        <Link href="/offers">
          <Button variant="outline">
            View All Offers
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      {mobileView}
      {desktopView}
    </section>
  );
};

// Promotion card component
const PromotionCard = ({ promotion }: { promotion: Promotion }) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className="mb-2">
            {promotion.type === 'discount' ? 'Discount' : 'Package'}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{getTimeUntilExpiration(promotion.end_date)}</span>
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-1">{promotion.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {promotion.homepage_short_description || promotion.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {promotion.homepage_image_url ? (
          <div className="w-full h-40 rounded-md mb-4 bg-muted overflow-hidden">
            <img 
              src={promotion.homepage_image_url} 
              alt={promotion.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // If image fails to load, replace with a placeholder
                e.currentTarget.src = 'https://placehold.co/600x400/f0f0f0/cccccc?text=Special+Offer';
              }}
            />
          </div>
        ) : promotion.type === 'package' ? (
          <div className="w-full h-40 rounded-md mb-4 bg-primary/10 flex flex-col items-center justify-center p-4">
            <h3 className="font-medium text-center">{promotion.packageData?.name || 'Special Package'}</h3>
            <p className="text-sm text-center text-muted-foreground mt-1">All-inclusive treatment bundle</p>
            {promotion.packageData && (
              <div className="mt-2 text-center">
                <p className="text-sm"><span className="line-through">£{promotion.packageData.originalPrice}</span></p>
                <p className="text-xl font-bold text-primary">£{promotion.packageData.packagePrice}</p>
                <p className="text-xs mt-1">
                  Save {calculateSavings(promotion.packageData.originalPrice, promotion.packageData.packagePrice).percentage}%
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-40 rounded-md mb-4 bg-primary/10 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary">
                {promotion.discountType === 'percentage' 
                  ? `${promotion.discountValue}% OFF` 
                  : `£${promotion.discountValue} OFF`}
              </h3>
              <p className="text-sm mt-1">Use code: <code className="bg-background px-1 py-0.5 rounded">{promotion.code}</code></p>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Valid until {formatDate(promotion.end_date)}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Code: <code className="bg-muted px-1 py-0.5 rounded text-xs">{promotion.code}</code></span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 border-t">
        <Button className="w-full" variant="default" asChild>
          <Link href={`/apply-code/${promotion.code}`}>
            View Offer Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Helper function for time until expiration
const getTimeUntilExpiration = (endDate: string) => {
  try {
    const daysLeft = Math.ceil(
      (new Date(endDate).getTime() - new Date().getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    
    if (daysLeft <= 0) {
      return 'Expires today';
    } else if (daysLeft === 1) {
      return 'Expires tomorrow';
    } else if (daysLeft <= 7) {
      return `Expires in ${daysLeft} days`;
    } else {
      return `Expires ${formatDistanceToNow(new Date(endDate), { addSuffix: true })}`;
    }
  } catch (e) {
    return 'Limited time offer';
  }
};

export default FeaturedPromotions;