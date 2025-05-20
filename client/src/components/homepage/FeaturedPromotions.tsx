import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { 
  Tag, 
  Package, 
  ChevronRight,
  CalendarDays,
  Smile
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';

// Define the Promotion interface to match our backend
interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'discount' | 'package';
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  clinicId: string;
  clinic_name?: string;
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
    treatments: Array<{
      id: string;
      name: string;
      quantity: number;
    }>;
  };
}

const FeaturedPromotions: React.FC = () => {
  // Fetch featured promotions
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/promotions/featured'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/promotions/featured');
      const data = await response.json();
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Special Promotions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4 rounded-md" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data?.promotions || data.promotions.length === 0) {
    return null; // Don't show anything if there are no promotions or an error
  }

  const promotions = data.promotions;

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Calculate savings for package promotions
  const calculateSavings = (originalPrice: number, packagePrice: number) => {
    const savingsAmount = originalPrice - packagePrice;
    const savingsPercentage = Math.round((savingsAmount / originalPrice) * 100);
    return { amount: savingsAmount, percentage: savingsPercentage };
  };

  // Render promotion card
  const PromotionCard = ({ promotion }: { promotion: Promotion }) => {
    const getDefaultImageUrl = () => {
      // Fallback image URLs based on promotion type
      if (promotion.type === 'discount') {
        return '/images/discount-default.jpg';
      }
      return '/images/package-default.jpg';
    };

    return (
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {promotion.type === 'discount' ? (
              <Tag className="h-4 w-4 text-primary" />
            ) : (
              <Package className="h-4 w-4 text-primary" />
            )}
            <CardTitle className="text-lg">
              {promotion.title}
            </CardTitle>
          </div>
          <CardDescription>
            {promotion.clinic_name ? `By ${promotion.clinic_name}` : 'Limited time offer'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          {promotion.homepage_image_url && (
            <div className="mb-4 rounded-md overflow-hidden h-40 bg-muted">
              <img 
                src={promotion.homepage_image_url || getDefaultImageUrl()} 
                alt={promotion.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = getDefaultImageUrl();
                }}
              />
            </div>
          )}

          <p className="text-sm mb-3">
            {promotion.homepage_short_description || promotion.description}
          </p>

          {promotion.type === 'discount' && (
            <div className="bg-primary/10 p-3 rounded-md text-sm flex items-center justify-between">
              <div>
                <p className="font-medium text-primary">
                  {promotion.discountType === 'percentage' 
                    ? `${promotion.discountValue}% OFF` 
                    : `£${promotion.discountValue} OFF`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use code: <span className="font-mono font-medium">{promotion.code}</span>
                </p>
              </div>
              <Smile className="h-8 w-8 text-primary/40" />
            </div>
          )}

          {promotion.type === 'package' && promotion.packageData && (
            <div className="bg-primary/10 p-3 rounded-md text-sm flex items-center justify-between">
              <div>
                <p className="font-medium text-primary">
                  Save £{(promotion.packageData.originalPrice - promotion.packageData.packagePrice).toFixed(2)}
                </p>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span className="font-mono font-medium mr-1">{promotion.code}</span>
                  <span className="mx-1">•</span>
                  <span>{Math.round(((promotion.packageData.originalPrice - promotion.packageData.packagePrice) / promotion.packageData.originalPrice) * 100)}% OFF</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs line-through text-muted-foreground">£{promotion.packageData.originalPrice}</p>
                <p className="font-bold text-base">£{promotion.packageData.packagePrice}</p>
              </div>
            </div>
          )}

          <div className="flex items-center text-xs text-muted-foreground mt-3">
            <CalendarDays className="h-3 w-3 mr-1" />
            <span>Valid until {formatDate(promotion.end_date)}</span>
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-4">
          <Button className="w-full" asChild>
            <Link href={`/quote?promo=${promotion.code}`}>
              Get This Offer <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Special Promotions</h2>
        <Button variant="ghost" asChild>
          <Link href="/promotions">
            View all <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promotion: Promotion) => (
          <PromotionCard key={promotion.id} promotion={promotion} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedPromotions;