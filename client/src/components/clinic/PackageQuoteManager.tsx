import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { usePackages } from '@/hooks/use-packages';
import { useSpecialOffers } from '@/hooks/use-special-offers';
import { Loader2, PackageOpen, Tag, Calendar, FileText, Plus, X, Sparkles } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';

interface PackageQuoteManagerProps {
  clinicId: number;
}

const PackageQuoteManager: React.FC<PackageQuoteManagerProps> = ({ clinicId }) => {
  const { toast } = useToast();
  const { packages, isLoading: isLoadingPackages } = usePackages(clinicId);
  const { specialOffers, isLoading: isLoadingOffers } = useSpecialOffers(clinicId);
  const [selectedTab, setSelectedTab] = useState('packages');
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const [patientEmail, setPatientEmail] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(true);

  // Fetch recent quotes on mount
  useEffect(() => {
    fetchRecentQuotes();
  }, [clinicId]);

  const fetchRecentQuotes = async () => {
    setIsLoadingQuotes(true);
    try {
      const response = await apiRequest('GET', `/api/quotes/clinic/${clinicId}/recent?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setRecentQuotes(data.quotes || []);
      } else {
        console.error('Failed to fetch recent quotes');
      }
    } catch (error) {
      console.error('Error fetching recent quotes:', error);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const handleCreateQuote = async (promoType: 'special_offer' | 'treatment_package') => {
    if (!selectedPromotionId) {
      toast({
        title: 'No promotion selected',
        description: 'Please select a promotion to create a quote',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingQuote(true);
    
    try {
      // Use the unified quote endpoint
      const response = await apiRequest('POST', '/api/treatment-plans/unified-quote', {
        promoType,
        promoId: selectedPromotionId,
        clinicId,
        notes: additionalNotes || `Created for patient: ${patientEmail}`,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Quote created successfully',
          description: `Quote ID: ${data.quoteId}`,
        });
        
        // Reset form and refetch quotes
        setPatientEmail('');
        setAdditionalNotes('');
        setSelectedPromotionId(null);
        fetchRecentQuotes();
        
      } else {
        const error = await response.json();
        toast({
          title: 'Failed to create quote',
          description: error.message || 'An error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to create quote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingQuote(false);
    }
  };

  // Helper to format date strings
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageOpen className="h-5 w-5" />
          <span>Package & Special Offer Quotes</span>
        </CardTitle>
        <CardDescription>
          Create and manage quotes from packages and special offers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="packages" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="packages">Treatment Packages</TabsTrigger>
            <TabsTrigger value="offers">Special Offers</TabsTrigger>
            <TabsTrigger value="recent">Recent Quotes</TabsTrigger>
          </TabsList>
          
          {/* Treatment Packages Tab */}
          <TabsContent value="packages">
            {isLoadingPackages ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {packages && packages.length > 0 ? (
                  packages.map((pkg) => (
                    <Card key={pkg.id} className={`overflow-hidden ${selectedPromotionId === pkg.id ? 'ring-2 ring-primary' : ''}`}>
                      <div className="relative">
                        {pkg.imageUrl && (
                          <div className="h-36 bg-cover bg-center" style={{ backgroundImage: `url(${pkg.imageUrl})` }} />
                        )}
                        {pkg.badgeText && (
                          <Badge className="absolute top-2 right-2 bg-primary">{pkg.badgeText}</Badge>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{pkg.title}</CardTitle>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold">£{parseFloat(pkg.priceGBP).toFixed(2)}</span>
                            {pkg.originalPriceGBP && parseFloat(pkg.originalPriceGBP) > parseFloat(pkg.priceGBP) && (
                              <span className="text-sm text-muted-foreground line-through">
                                £{parseFloat(pkg.originalPriceGBP).toFixed(2)}
                              </span>
                            )}
                          </div>
                          {pkg.discountPercentage && parseFloat(pkg.discountPercentage) > 0 && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {parseFloat(pkg.discountPercentage).toFixed(0)}% OFF
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPromotionId(selectedPromotionId === pkg.id ? null : pkg.id)}
                        >
                          {selectedPromotionId === pkg.id ? 'Deselect' : 'Select'}
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="default" size="sm">Create Quote</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Package Quote</DialogTitle>
                              <DialogDescription>
                                Create a new quote for this treatment package
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="package-title">Package</Label>
                                <Input id="package-title" value={pkg.title} disabled />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="patient-email">Patient Email (optional)</Label>
                                <Input 
                                  id="patient-email" 
                                  placeholder="patient@example.com" 
                                  value={patientEmail}
                                  onChange={(e) => setPatientEmail(e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea 
                                  id="notes" 
                                  placeholder="Enter any special requirements or notes"
                                  value={additionalNotes}
                                  onChange={(e) => setAdditionalNotes(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button 
                                onClick={() => {
                                  setSelectedPromotionId(pkg.id);
                                  handleCreateQuote('treatment_package');
                                }}
                                disabled={isCreatingQuote}
                              >
                                {isCreatingQuote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Quote
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                    <PackageOpen className="h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No packages available</h3>
                    <p className="text-sm text-muted-foreground">
                      Create treatment packages to offer bundled services to patients
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {selectedPromotionId && packages?.some(p => p.id === selectedPromotionId) && (
              <div className="mt-6">
                <Separator className="my-4" />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Create Quote</h3>
                    <p className="text-sm text-muted-foreground">
                      Selected package: {packages.find(p => p.id === selectedPromotionId)?.title}
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleCreateQuote('treatment_package')}
                    disabled={isCreatingQuote}
                  >
                    {isCreatingQuote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Package Quote
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Special Offers Tab */}
          <TabsContent value="offers">
            {isLoadingOffers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {specialOffers && specialOffers.length > 0 ? (
                  specialOffers.map((offer) => (
                    <Card key={offer.id} className={`overflow-hidden ${selectedPromotionId === offer.id ? 'ring-2 ring-primary' : ''}`}>
                      <div className="relative">
                        {offer.imageUrl && (
                          <div className="h-36 bg-cover bg-center" style={{ backgroundImage: `url(${offer.imageUrl})` }} />
                        )}
                        {offer.promotionLevel && (
                          <Badge className="absolute top-2 right-2 bg-primary">
                            {offer.promotionLevel.charAt(0).toUpperCase() + offer.promotionLevel.slice(1)}
                          </Badge>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{offer.title}</CardTitle>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            {offer.discountType === 'PERCENTAGE' ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {parseFloat(offer.discountValue || '0')}% OFF
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                £{parseFloat(offer.discountValue || '0').toFixed(2)} OFF
                              </Badge>
                            )}
                          </div>
                          {offer.validUntil && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              Valid until {formatDate(offer.validUntil)}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPromotionId(selectedPromotionId === offer.id ? null : offer.id)}
                        >
                          {selectedPromotionId === offer.id ? 'Deselect' : 'Select'}
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="default" size="sm">Create Quote</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Special Offer Quote</DialogTitle>
                              <DialogDescription>
                                Create a new quote for this special offer
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="offer-title">Special Offer</Label>
                                <Input id="offer-title" value={offer.title} disabled />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="patient-email">Patient Email (optional)</Label>
                                <Input 
                                  id="patient-email" 
                                  placeholder="patient@example.com" 
                                  value={patientEmail}
                                  onChange={(e) => setPatientEmail(e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea 
                                  id="notes" 
                                  placeholder="Enter any special requirements or notes"
                                  value={additionalNotes}
                                  onChange={(e) => setAdditionalNotes(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button 
                                onClick={() => {
                                  setSelectedPromotionId(offer.id);
                                  handleCreateQuote('special_offer');
                                }}
                                disabled={isCreatingQuote}
                              >
                                {isCreatingQuote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Quote
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No special offers available</h3>
                    <p className="text-sm text-muted-foreground">
                      Create special offers to attract more patients
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {selectedPromotionId && specialOffers?.some(o => o.id === selectedPromotionId) && (
              <div className="mt-6">
                <Separator className="my-4" />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Create Quote</h3>
                    <p className="text-sm text-muted-foreground">
                      Selected offer: {specialOffers.find(o => o.id === selectedPromotionId)?.title}
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleCreateQuote('special_offer')}
                    disabled={isCreatingQuote}
                  >
                    {isCreatingQuote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Offer Quote
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Recent Quotes Tab */}
          <TabsContent value="recent">
            {isLoadingQuotes ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              recentQuotes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-mono text-xs">{quote.id.substring(0, 8)}...</TableCell>
                        <TableCell>{quote.patientName || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {quote.source === 'special_offer' 
                              ? 'Special Offer' 
                              : quote.source === 'treatment_package' 
                                ? 'Package' 
                                : quote.source}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(quote.createdAt)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              quote.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : quote.status === 'draft' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-orange-100 text-orange-800'
                            }
                          >
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>£{quote.totalGBP.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/quote/view/${quote.id}`} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">No recent quotes</h3>
                  <p className="text-sm text-muted-foreground">
                    Quotes from packages and special offers will appear here
                  </p>
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PackageQuoteManager;