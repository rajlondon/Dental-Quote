import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SpecialOffer } from '@shared/specialOffers';
import { TrendingPackage } from '@shared/trendingPackages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (e) {
    return dateString;
  }
}

export function OffersApprovalDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  
  // Fetch pending offers
  const { 
    data: pendingOffers,
    isLoading: isLoadingOffers,
    error: offersError
  } = useQuery<SpecialOffer[]>({
    queryKey: ['/api/portal/admin/special-offers/pending'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Fetch pending packages
  const { 
    data: pendingPackages,
    isLoading: isLoadingPackages,
    error: packagesError
  } = useQuery<TrendingPackage[]>({
    queryKey: ['/api/portal/admin/packages/pending'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Offer review mutation
  const reviewOfferMutation = useMutation({
    mutationFn: async ({ 
      offerId, 
      approved, 
      reason 
    }: { 
      offerId: string; 
      approved: boolean; 
      reason?: string 
    }) => {
      const res = await apiRequest("POST", `/api/portal/admin/special-offers/${offerId}/review`, {
        approved, 
        rejection_reason: reason 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/admin/special-offers/pending'] });
      toast({
        title: 'Offer Review Submitted',
        description: 'The offer has been updated',
      });
      setRejectionReason('');
      setSelectedOffer(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Package review mutation
  const reviewPackageMutation = useMutation({
    mutationFn: async ({ 
      packageId, 
      approved, 
      reason 
    }: { 
      packageId: string; 
      approved: boolean; 
      reason?: string 
    }) => {
      const res = await apiRequest("POST", `/api/portal/admin/packages/${packageId}/review`, {
        approved, 
        rejection_reason: reason 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/admin/packages/pending'] });
      toast({
        title: 'Package Review Submitted',
        description: 'The package has been updated',
      });
      setRejectionReason('');
      setSelectedOffer(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  const handleApproveOffer = (offerId: string) => {
    reviewOfferMutation.mutate({ offerId, approved: true });
  };
  
  const handleRejectOffer = (offerId: string) => {
    if (!rejectionReason) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive'
      });
      return;
    }
    
    reviewOfferMutation.mutate({ 
      offerId, 
      approved: false, 
      reason: rejectionReason 
    });
  };
  
  const handleApprovePackage = (packageId: string) => {
    reviewPackageMutation.mutate({ packageId, approved: true });
  };
  
  const handleRejectPackage = (packageId: string) => {
    if (!rejectionReason) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive'
      });
      return;
    }
    
    reviewPackageMutation.mutate({ 
      packageId, 
      approved: false, 
      reason: rejectionReason 
    });
  };
  
  const isLoading = isLoadingOffers || isLoadingPackages;
  const error = offersError || packagesError;
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-48">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">
      Error loading content: {error instanceof Error ? error.message : 'Unknown error'}
    </div>;
  }
  
  const renderPromotionBadge = (level: 'standard' | 'featured' | 'premium', commission: number) => {
    let bgColor = 'bg-gray-600';
    if (level === 'premium') bgColor = 'bg-purple-600';
    if (level === 'featured') bgColor = 'bg-blue-600';
    
    return (
      <Badge className={bgColor}>
        {level.toUpperCase()} • {commission}% Commission
      </Badge>
    );
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Content Approval Dashboard</h1>
      <p className="text-muted-foreground">
        Review and approve special offers and trending packages submitted by clinics before they appear on the platform.
      </p>
      
      <Tabs defaultValue="offers">
        <TabsList>
          <TabsTrigger value="offers">
            Special Offers {pendingOffers && pendingOffers.length > 0 && `(${pendingOffers.length})`}
          </TabsTrigger>
          <TabsTrigger value="packages">
            Trending Packages {pendingPackages && pendingPackages.length > 0 && `(${pendingPackages.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="offers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Offers Awaiting Approval</CardTitle>
              <CardDescription>
                Review and approve/reject special offers from clinics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!pendingOffers || pendingOffers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending offers to review
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingOffers && pendingOffers.map((offer: SpecialOffer) => (
                    <Card key={offer.id} className="border-2 border-amber-200">
                      <CardHeader className="bg-amber-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{offer.title}</CardTitle>
                            <CardDescription>
                              From clinic: {offer.clinic_id} • Created: {formatDate(offer.created_at)}
                            </CardDescription>
                          </div>
                          {renderPromotionBadge(offer.promotion_level, offer.commission_percentage)}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium">Description:</h3>
                            <p>{offer.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-medium">Discount:</h3>
                              <p>
                                {offer.discount_type === 'percentage' 
                                  ? `${offer.discount_value}% off` 
                                  : `£${offer.discount_value} off`}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-medium">Valid Period:</h3>
                              <p>
                                {formatDate(offer.start_date)} to {formatDate(offer.end_date)}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium">Terms & Conditions:</h3>
                            <p>{offer.terms_conditions || 'No specific terms provided'}</p>
                          </div>
                          
                          {offer.homepage_display && (
                            <div className="bg-yellow-50 p-3 rounded-md flex items-center">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                              <p className="text-sm">This offer is requested to be displayed on the homepage</p>
                            </div>
                          )}
                          
                          {selectedOffer === offer.id && (
                            <div className="space-y-2">
                              <h3 className="font-medium">Rejection Reason:</h3>
                              <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Please provide reason for rejection..."
                                rows={3}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-3 bg-gray-50">
                        {selectedOffer === offer.id ? (
                          <>
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedOffer(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleRejectOffer(offer.id)}
                              disabled={reviewOfferMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Confirm Rejection
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setSelectedOffer(offer.id);
                                setRejectionReason('');
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button 
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveOffer(offer.id)}
                              disabled={reviewOfferMutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="packages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Packages Awaiting Approval</CardTitle>
              <CardDescription>
                Review and approve/reject trending packages from clinics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!pendingPackages || pendingPackages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending packages to review
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingPackages && pendingPackages.map((pkg: TrendingPackage) => (
                    <Card key={pkg.id} className="border-2 border-amber-200">
                      <CardHeader className="bg-amber-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{pkg.title}</CardTitle>
                            <CardDescription>
                              From clinic: {pkg.clinic_id} • Created: {formatDate(pkg.created_at)}
                            </CardDescription>
                          </div>
                          {renderPromotionBadge(pkg.promotion_level, pkg.commission_percentage)}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium">Description:</h3>
                            <p>{pkg.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-medium">Price:</h3>
                              <p>£{pkg.total_price} (Regular: £{pkg.regular_price})</p>
                            </div>
                            <div>
                              <h3 className="font-medium">Duration:</h3>
                              <p>{pkg.duration_days} days</p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-medium">Included Treatments:</h3>
                            <ul className="list-disc ml-5">
                              {pkg.included_treatments?.map((treatment: { treatment_id: string; quantity: number }, index: number) => (
                                <li key={index}>
                                  {treatment.treatment_id} ({treatment.quantity}x)
                                </li>
                              )) || <li>No treatments specified</li>}
                            </ul>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-medium">Accommodation:</h3>
                              <p>
                                {pkg.includes_accommodation ? 'Included' : 'Not included'}
                                {pkg.includes_accommodation && pkg.accommodation_details && (
                                  <span className="block text-sm text-muted-foreground mt-1">
                                    {pkg.accommodation_details}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-medium">Transportation:</h3>
                              <p>
                                {pkg.includes_transport ? 'Included' : 'Not included'}
                                {pkg.includes_transport && pkg.transport_details && (
                                  <span className="block text-sm text-muted-foreground mt-1">
                                    {pkg.transport_details}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          
                          {pkg.homepage_display && (
                            <div className="bg-yellow-50 p-3 rounded-md flex items-center">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                              <p className="text-sm">This package is requested to be displayed on the homepage</p>
                            </div>
                          )}
                          
                          {selectedOffer === pkg.id && (
                            <div className="space-y-2">
                              <h3 className="font-medium">Rejection Reason:</h3>
                              <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Please provide reason for rejection..."
                                rows={3}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-3 bg-gray-50">
                        {selectedOffer === pkg.id ? (
                          <>
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedOffer(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleRejectPackage(pkg.id)}
                              disabled={reviewPackageMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Confirm Rejection
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setSelectedOffer(pkg.id);
                                setRejectionReason('');
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button 
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprovePackage(pkg.id)}
                              disabled={reviewPackageMutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}