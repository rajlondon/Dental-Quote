import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader2, Search, Clock, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import PromotionReview from './PromotionReview';

// Type for promotion
interface Promotion {
  id: string;
  code: string;
  title: string;
  type: 'discount' | 'package';
  clinicId: string;
  created_by: string;
  submitted_at: string;
  status: string;
}

const PendingApprovalsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'clinic'>('date');
  const [selectedPromotion, setSelectedPromotion] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  
  // Fetch pending promotions
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/promotions/pending'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/admin/promotions/pending');
      const data = await response.json();
      return data;
    },
  });

  const pendingPromotions = data?.promotions || [];

  // Filter promotions
  const filteredPromotions = pendingPromotions
    .filter((promo: Promotion) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          promo.title.toLowerCase().includes(query) ||
          promo.code.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a: Promotion, b: Promotion) => {
      if (sortBy === 'date') {
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      } else {
        return a.clinicId.localeCompare(b.clinicId);
      }
    });

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  // Calculate wait time
  const getWaitTime = (submittedAt: string) => {
    try {
      return formatDistanceToNow(new Date(submittedAt), { addSuffix: true });
    } catch (e) {
      return 'Unknown';
    }
  };

  // Handle review
  const handleReview = (id: string) => {
    setSelectedPromotion(id);
    setReviewOpen(true);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        <p>Error loading pending approvals. Please try again.</p>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Review and approve clinic-initiated promotions</CardDescription>
            </div>
            <Badge variant={pendingPromotions.length > 0 ? 'default' : 'outline'}>
              {pendingPromotions.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search promotions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as 'date' | 'clinic')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Submission Date</SelectItem>
                  <SelectItem value="clinic">Clinic ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredPromotions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="font-medium">No pending approvals</h3>
              <p className="text-sm text-muted-foreground mt-1">
                There are currently no promotions waiting for your approval.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promotion Title</TableHead>
                  <TableHead>Clinic ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Wait Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.map((promotion: Promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell className="font-medium">{promotion.title}</TableCell>
                    <TableCell>{promotion.clinicId}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {promotion.type.charAt(0).toUpperCase() + promotion.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(promotion.submitted_at)}</TableCell>
                    <TableCell className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{getWaitTime(promotion.submitted_at)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(promotion.id)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedPromotion && (
        <PromotionReview
          promotionId={selectedPromotion}
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          onApproveReject={() => {
            setReviewOpen(false);
            setSelectedPromotion(null);
            refetch();
          }}
        />
      )}
    </>
  );
};

export default PendingApprovalsList;