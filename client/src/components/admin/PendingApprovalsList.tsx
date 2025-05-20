import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Tag,
  Package,
  ClipboardList,
  Eye,
  ExternalLink,
  Clock,
  AlertCircle,
  ChevronDown,
  Search,
  Filter
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

interface PendingApprovalsListProps {
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | string;
  refreshTrigger?: number;
  onOpenReview: (promotionId: string) => void;
}

export default function PendingApprovalsList({
  status,
  refreshTrigger = 0,
  onOpenReview
}: PendingApprovalsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const { toast } = useToast();
  
  // Fetch promotions based on status
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/promotions', status, refreshTrigger],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/promotions?status=${status}`);
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });
  
  // Quick approve promotion
  const handleQuickApprove = async (event: React.MouseEvent, promotionId: string) => {
    event.stopPropagation();
    
    try {
      await apiRequest('POST', `/api/admin/promotions/${promotionId}/approve`, {
        notes: 'Approved via quick action',
      });
      
      toast({
        title: 'Promotion Approved',
        description: 'The promotion has been approved successfully.',
      });
      
      // Trigger refresh
      // This would ideally be handled via React Query mutation and cache invalidation
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve promotion. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Format date with time ago
  const formatDateWithTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = format(date, 'PPP');
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">{timeAgo}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{formattedDate}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  // Get promotions with filtering and sorting
  const getFilteredAndSortedPromotions = () => {
    if (!data?.promotions) return [];
    
    let filteredPromotions = data.promotions;
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredPromotions = filteredPromotions.filter((promo: any) => 
        promo.title.toLowerCase().includes(search) || 
        promo.code.toLowerCase().includes(search) ||
        promo.clinic_name?.toLowerCase().includes(search)
      );
    }
    
    // Sort promotions
    return [...filteredPromotions].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.submitted_at || b.created_at).getTime() - 
                 new Date(a.submitted_at || a.created_at).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'clinic':
          return (a.clinic_name || '').localeCompare(b.clinic_name || '');
        default:
          return 0;
      }
    });
  };
  
  // Get promotion status badge
  const getStatusBadge = (promotionStatus: string) => {
    switch (promotionStatus) {
      case 'PENDING_APPROVAL':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Pending Review</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Approved</Badge>;
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'DRAFT':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Draft</Badge>;
      case 'EXPIRED':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Expired</Badge>;
      default:
        return <Badge variant="outline">{promotionStatus}</Badge>;
    }
  };
  
  // Render promotion type icon
  const getPromotionTypeIcon = (type: string) => {
    return type === 'discount' ? 
      <Tag className="h-4 w-4 text-primary" /> : 
      <Package className="h-4 w-4 text-primary" />;
  };
  
  // Handle clicking on a promotion
  const handlePromotionClick = (promotionId: string) => {
    onOpenReview(promotionId);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-24" />
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error Loading Promotions
          </CardTitle>
          <CardDescription>
            There was a problem loading the promotions. Please try refreshing the page.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const filteredPromotions = getFilteredAndSortedPromotions();
  
  // Render empty state
  if (filteredPromotions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('recent')}>
                Most Recent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>
                Alphabetical
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('clinic')}>
                Clinic Name
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>No Promotions Found</CardTitle>
            <CardDescription>
              {searchTerm 
                ? `No promotions match your search for "${searchTerm}"`
                : status === 'PENDING_APPROVAL'
                  ? "There are no promotions waiting for approval."
                  : status === 'APPROVED'
                    ? "There are no approved promotions yet."
                    : status === 'REJECTED'
                      ? "There are no rejected promotions."
                      : "There are no promotions with this status."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="text-center max-w-md">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-2 text-muted-foreground">
                {status === 'PENDING_APPROVAL'
                  ? "When clinics submit promotions for review, they will appear here waiting for your approval."
                  : "Promotions that you have reviewed will be shown here."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Render promotions list
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 relative w-full max-w-sm">
          <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
          <Input
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4 mr-1" />
              Sort
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setSortBy('recent')}
              className={sortBy === 'recent' ? "bg-primary/10" : ""}
            >
              Most Recent
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortBy('alphabetical')}
              className={sortBy === 'alphabetical' ? "bg-primary/10" : ""}
            >
              Alphabetical
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setSortBy('clinic')}
              className={sortBy === 'clinic' ? "bg-primary/10" : ""}
            >
              Clinic Name
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {status === 'PENDING_APPROVAL'
              ? "Pending Reviews"
              : status === 'APPROVED'
                ? "Approved Promotions"
                : status === 'REJECTED'
                  ? "Rejected Promotions"
                  : "All Promotions"}
          </CardTitle>
          <CardDescription>
            {filteredPromotions.length} promotion{filteredPromotions.length !== 1 ? 's' : ''}
            {searchTerm ? ` matching "${searchTerm}"` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promotion</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.map((promotion: any) => (
                  <TableRow 
                    key={promotion.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handlePromotionClick(promotion.id)}
                  >
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {getPromotionTypeIcon(promotion.type)}
                        </div>
                        <div>
                          <div className="font-medium">{promotion.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Code: <span className="font-mono">{promotion.code}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {promotion.clinic_name || "Unknown Clinic"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {formatDateWithTimeAgo(promotion.submitted_at || promotion.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(promotion.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePromotionClick(promotion.id);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Review
                        </Button>
                        
                        {status === 'PENDING_APPROVAL' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                            onClick={(e) => handleQuickApprove(e, promotion.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}