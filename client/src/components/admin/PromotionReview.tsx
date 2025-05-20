import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Image,
  Tag,
  Package,
  Percent,
  DollarSign,
  Home,
  HeartHandshake,
  CalendarClock,
  ExternalLink,
  BarChart3
} from 'lucide-react';

import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// PromotionReview props interface
interface PromotionReviewProps {
  promotionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproveReject: () => void;
}

// PromotionReview component
const PromotionReview: React.FC<PromotionReviewProps> = ({
  promotionId,
  open,
  onOpenChange,
  onApproveReject
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 30));
  const [duration, setDuration] = useState(30); // Default 30 days
  const [displayOnHomepage, setDisplayOnHomepage] = useState(false);
  const [priority, setPriority] = useState(5); // Default priority 5
  const [homepageImageUrl, setHomepageImageUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Fetch promotion details
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/promotions', promotionId],
    queryFn: async () => {
      if (!promotionId) return null;
      const response = await apiRequest('GET', `/api/admin/promotions/${promotionId}`);
      return response.json();
    },
    enabled: !!promotionId && open,
    refetchOnWindowFocus: false
  });
  
  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      const approvalData = {
        notes: reviewNotes,
        startDate: useCustomDates ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: useCustomDates ? format(endDate, 'yyyy-MM-dd') : undefined,
        displayOnHomepage,
        homepagePriority: displayOnHomepage ? priority : undefined,
        homepageImageUrl: displayOnHomepage ? homepageImageUrl : undefined,
        homepageShortDescription: displayOnHomepage ? shortDescription : undefined,
      };
      
      const response = await apiRequest('POST', `/api/admin/promotions/${promotionId}/approve`, approvalData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Promotion approved',
        description: 'The promotion has been approved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions/pending'] });
      onApproveReject();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to approve promotion: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async () => {
      const rejectionData = {
        reason: rejectionReason,
      };
      
      const response = await apiRequest('POST', `/api/admin/promotions/${promotionId}/reject`, rejectionData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Promotion rejected',
        description: 'The promotion has been rejected.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promotions/pending'] });
      onApproveReject();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to reject promotion: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Set initial values when data is loaded
  useEffect(() => {
    if (data?.promotion) {
      const promotion = data.promotion;
      
      // Set dates
      if (promotion.start_date) {
        setStartDate(new Date(promotion.start_date));
      }
      if (promotion.end_date) {
        setEndDate(new Date(promotion.end_date));
      }
      
      // Set homepage display settings if available
      setDisplayOnHomepage(promotion.display_on_homepage || false);
      setPriority(promotion.homepage_priority || 5);
      setHomepageImageUrl(promotion.homepage_image_url || '');
      setShortDescription(promotion.homepage_short_description || '');
      
      // Calculate duration
      if (promotion.start_date && promotion.end_date) {
        const start = new Date(promotion.start_date);
        const end = new Date(promotion.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDuration(diffDays);
      }
    }
  }, [data]);
  
  // Update end date based on start date and duration
  useEffect(() => {
    if (duration > 0) {
      const newEndDate = addDays(new Date(startDate), duration);
      setEndDate(newEndDate);
    }
  }, [startDate, duration]);
  
  // Handle duration change
  const handleDurationChange = (value: string) => {
    const days = parseInt(value);
    setDuration(days);
  };
  
  // Handle approve action
  const handleApprove = () => {
    approveMutation.mutate();
  };
  
  // Handle reject action
  const handleReject = () => {
    if (!rejectionReason) {
      toast({
        title: 'Rejection reason required',
        description: 'Please provide a reason for rejecting this promotion.',
        variant: 'destructive',
      });
      return;
    }
    
    rejectMutation.mutate();
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };
  
  // Calculate savings for package promotions
  const calculateSavings = (originalPrice: number, packagePrice: number) => {
    const savingsAmount = originalPrice - packagePrice;
    const savingsPercentage = Math.round((savingsAmount / originalPrice) * 100);
    return { amount: savingsAmount, percentage: savingsPercentage };
  };
  
  // Duration options for the form
  const durationOptions = [
    { value: 7, label: '1 Week' },
    { value: 14, label: '2 Weeks' },
    { value: 30, label: '1 Month' },
    { value: 60, label: '2 Months' },
    { value: 90, label: '3 Months' },
    { value: 180, label: '6 Months' },
    { value: 365, label: '1 Year' }
  ];
  
  if (!open) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Review Promotion</DialogTitle>
          <DialogDescription>
            Review and approve or reject this clinic-initiated promotion
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Promotion Details</TabsTrigger>
            <TabsTrigger value="review">Review & Scheduling</TabsTrigger>
            <TabsTrigger value="homepage">Homepage Display</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="details" className="mt-4 px-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : isError ? (
                <div className="p-6 text-center text-destructive">
                  <p>Failed to load promotion details. Please try again.</p>
                </div>
              ) : data?.promotion ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {data.promotion.type === 'discount' ? (
                        <Tag className="h-5 w-5 text-primary" />
                      ) : (
                        <Package className="h-5 w-5 text-primary" />
                      )}
                      <h2 className="text-xl font-bold">{data.promotion.title}</h2>
                    </div>
                    <Badge variant="outline" className="px-2">
                      Code: <span className="font-mono">{data.promotion.code}</span>
                    </Badge>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Promotion Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <span className="text-sm font-medium">Description:</span>
                        <p className="mt-1 text-sm">{data.promotion.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium">Clinic:</span>
                          <p className="text-sm">{data.promotion.clinic_name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Type:</span>
                          <p className="text-sm capitalize">{data.promotion.type} Promotion</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium">Proposed Start Date:</span>
                          <p className="text-sm">{formatDate(data.promotion.start_date)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Proposed End Date:</span>
                          <p className="text-sm">{formatDate(data.promotion.end_date)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium">Maximum Uses:</span>
                        <p className="text-sm">
                          {data.promotion.max_uses === 0 ? 'Unlimited' : data.promotion.max_uses}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {data.promotion.type === 'discount' && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Discount Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium">Discount Type:</span>
                            <p className="text-sm flex items-center mt-1">
                              {data.promotion.discountType === 'percentage' ? (
                                <>
                                  <Percent className="h-4 w-4 mr-1" />
                                  Percentage Discount
                                </>
                              ) : (
                                <>
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Fixed Amount Discount
                                </>
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Discount Value:</span>
                            <p className="text-sm font-semibold text-primary mt-1">
                              {data.promotion.discountType === 'percentage'
                                ? `${data.promotion.discountValue}%`
                                : `£${data.promotion.discountValue}`}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium">Applicable Treatments:</span>
                          {data.promotion.applicable_treatments && data.promotion.applicable_treatments.length > 0 ? (
                            <div className="grid grid-cols-2 gap-1 mt-1">
                              {data.promotion.applicable_treatments.map((treatment: string, index: number) => (
                                <div key={index} className="text-sm p-1 bg-muted rounded">
                                  {treatment}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm mt-1">No treatments specified</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {data.promotion.type === 'package' && data.promotion.packageData && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Package Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <span className="text-sm font-medium">Package Name:</span>
                          <p className="text-sm">{data.promotion.packageData.name}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium">Package Description:</span>
                          <p className="text-sm">{data.promotion.packageData.description}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium">Included Treatments:</span>
                          {data.promotion.packageData.treatments && data.promotion.packageData.treatments.length > 0 ? (
                            <div className="mt-1 space-y-1">
                              {data.promotion.packageData.treatments.map((treatment: any, index: number) => (
                                <div key={index} className="text-sm p-2 bg-muted rounded flex justify-between">
                                  <span>{treatment.name}</span>
                                  {treatment.quantity > 1 && (
                                    <span className="font-medium">x{treatment.quantity}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm mt-1">No treatments included</p>
                          )}
                        </div>
                        
                        {data.promotion.packageData.attractions && data.promotion.packageData.attractions.some((a: any) => a.included) && (
                          <div>
                            <span className="text-sm font-medium">Included Attractions:</span>
                            <div className="mt-1 space-y-1">
                              {data.promotion.packageData.attractions
                                .filter((a: any) => a.included)
                                .map((attraction: any, index: number) => (
                                  <div key={index} className="text-sm p-2 bg-muted rounded">
                                    <div className="font-medium">{attraction.name}</div>
                                    <div className="text-xs text-muted-foreground">{attraction.description}</div>
                                    <div className="text-xs mt-1">Value: £{attraction.value}</div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                        
                        {data.promotion.packageData.additionalServices && data.promotion.packageData.additionalServices.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Additional Services:</span>
                            <div className="grid grid-cols-2 gap-1 mt-1">
                              {data.promotion.packageData.additionalServices.map((service: string, index: number) => (
                                <div key={index} className="text-sm p-1 bg-muted rounded">
                                  {service}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <span className="text-sm font-medium">Original Price:</span>
                            <p className="text-sm line-through">£{data.promotion.packageData.originalPrice}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Package Price:</span>
                            <p className="text-lg font-semibold text-primary">
                              £{data.promotion.packageData.packagePrice}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-muted p-2 rounded">
                          <span className="text-sm font-medium">Savings:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">
                              £{data.promotion.packageData.originalPrice - data.promotion.packageData.packagePrice} off
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(((data.promotion.packageData.originalPrice - data.promotion.packageData.packagePrice) / data.promotion.packageData.originalPrice) * 100)}% discount
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <CalendarClock className="h-4 w-4 mr-2" />
                          Submission Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Submitted By:</span>
                          <p className="text-sm">{data.promotion.created_by_name || 'Unknown'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Created:</span>
                          <p className="text-sm">{formatDate(data.promotion.created_at)}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Submitted:</span>
                          <p className="text-sm">{data.promotion.submitted_at ? formatDate(data.promotion.submitted_at) : 'N/A'}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          <HeartHandshake className="h-4 w-4 mr-2" />
                          Clinic Profile
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Clinic Name:</span>
                          <p className="text-sm">{data.promotion.clinic_name || 'Unknown Clinic'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Contact Person:</span>
                          <p className="text-sm">{data.promotion.clinic_contact || 'Not provided'}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mt-2 w-full"
                          asChild
                        >
                          <a 
                            href={`/admin/clinics/${data.promotion.clinicId}`} 
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" />
                            View Clinic Profile
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : null}
            </TabsContent>
            
            <TabsContent value="review" className="mt-4 px-1">
              <div className="space-y-6">
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium">Promotion Scheduling</h3>
                  
                  <div className="flex items-center mt-2">
                    <Switch
                      checked={useCustomDates}
                      onCheckedChange={setUseCustomDates}
                      id="custom-dates"
                    />
                    <Label htmlFor="custom-dates" className="ml-2">
                      Override clinic-suggested dates
                    </Label>
                  </div>
                  
                  <div className={cn(
                    "mt-4 grid grid-cols-1 gap-4 md:grid-cols-2", 
                    !useCustomDates && "opacity-50 pointer-events-none"
                  )}>
                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            id="start-date"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => date && setStartDate(date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Select
                        value={duration.toString()}
                        onValueChange={handleDurationChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            id="end-date"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={endDate}
                            onSelect={(date) => date && setEndDate(date)}
                            disabled={(date) => date <= startDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Label htmlFor="review-notes">Admin Notes (Optional)</Label>
                    <Textarea
                      id="review-notes"
                      placeholder="Add notes about this promotion (visible to clinic)"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Label htmlFor="rejection-reason">Rejection Reason (Required if rejecting)</Label>
                    <Textarea
                      id="rejection-reason"
                      placeholder="If you need to reject this promotion, provide a reason here"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      If approved, this field will be ignored.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="homepage" className="mt-4 px-1">
              <div className="space-y-6">
                <div className="mt-6">
                  <h3 className="text-lg font-medium">Homepage Display</h3>
                  
                  <div className="flex items-center mt-2">
                    <Switch
                      checked={displayOnHomepage}
                      onCheckedChange={setDisplayOnHomepage}
                      id="homepage-display"
                    />
                    <Label htmlFor="homepage-display" className="ml-2">
                      Feature this promotion on homepage
                    </Label>
                  </div>
                  
                  <div className={cn(
                    "mt-4 space-y-4", 
                    !displayOnHomepage && "opacity-50 pointer-events-none"
                  )}>
                    <div>
                      <Label htmlFor="priority">Display Priority (1-10)</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground">Low</span>
                        <Slider
                          id="priority"
                          min={1}
                          max={10}
                          step={1}
                          value={[priority]}
                          onValueChange={([value]) => setPriority(value)}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground">High</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher priority promotions (10) will be displayed more prominently on the homepage
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="homepage-image">Homepage Image URL</Label>
                      <div className="mt-1 flex gap-2">
                        <Input
                          id="homepage-image"
                          placeholder="https://example.com/image.jpg"
                          value={homepageImageUrl}
                          onChange={(e) => setHomepageImageUrl(e.target.value)}
                          className="flex-1"
                        />
                        {homepageImageUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(homepageImageUrl, '_blank')}
                          >
                            <Image className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter URL for an image to display on the homepage (recommended size: 1200×600px)
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="short-description">
                        Short Description <span className="text-muted-foreground">({shortDescription.length}/120)</span>
                      </Label>
                      <Textarea
                        id="short-description"
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        maxLength={120}
                        placeholder="Brief, compelling description for homepage display"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        A concise description to display on the homepage (max 120 characters)
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4 mt-6">
                      <h3 className="text-base font-medium mb-2 flex items-center">
                        <Home className="h-4 w-4 mr-2" />
                        Homepage Preview
                      </h3>
                      
                      <div className="bg-background rounded-lg border p-4">
                        <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden">
                          {homepageImageUrl ? (
                            <img 
                              src={homepageImageUrl} 
                              alt="Promotion preview" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://placehold.co/600x400/e9e9e9/999999?text=Preview+Image';
                              }}
                            />
                          ) : (
                            <Image className="h-8 w-8 text-muted-foreground/50" />
                          )}
                        </div>
                        
                        <h4 className="font-medium">
                          {data?.promotion?.title || 'Promotion Title'}
                        </h4>
                        
                        <p className="text-sm mt-1 text-muted-foreground">
                          {shortDescription || data?.promotion?.description?.substring(0, 120) || 'Short description will appear here...'}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <Badge className="bg-primary/10 text-primary border-primary/20 mt-1">
                            {data?.promotion?.type === 'discount' 
                              ? `${data?.promotion?.discountValue}% OFF` 
                              : 'Package Deal'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Priority: {priority}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || approveMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Promotion
            </Button>
            
            <Button
              onClick={handleApprove}
              disabled={rejectMutation.isPending || approveMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve Promotion
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionReview;