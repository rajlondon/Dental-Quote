import React, { useState } from "react";
import { Link } from "wouter";
import { QuoteRequest, QuoteStatus } from "@/types/quote";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Eye, 
  FileText, 
  PencilIcon, 
  ClipboardCheck, 
  ArrowRight,
  Sparkles,
  Tag,
  Ticket
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type PortalType = "patient" | "clinic" | "admin";

interface QuoteListTableProps {
  quotes: QuoteRequest[];
  portalType: PortalType;
  isLoading?: boolean;
}

export function getStatusBadgeColor(status: QuoteStatus): 
  "default" | "secondary" | "destructive" | "outline" | "primary" | "accent" | "success" | "warning" {
  switch (status) {
    case "pending":
      return "default";
    case "assigned":
      return "secondary";
    case "in_progress":
      return "primary";
    case "sent":
      return "accent";
    case "accepted":
      return "success";
    case "rejected":
      return "destructive";
    case "completed":
      return "success";
    case "cancelled":
      return "destructive";
    case "expired":
      return "warning";
    default:
      return "default";
  }
}

export function getStatusLabel(status: QuoteStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

export default function QuoteListTable({ quotes, portalType, isLoading = false }: QuoteListTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specialOfferFilter, setSpecialOfferFilter] = useState<string>("all");
  const [promoCodeFilter, setPromoCodeFilter] = useState<string>("all");

  if (isLoading) {
    return <div className="flex justify-center my-8">Loading quotes...</div>;
  }

  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center my-8 p-6 bg-muted/30 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">No quotes found</h3>
        <p className="text-muted-foreground">
          {portalType === "patient" 
            ? "You haven't submitted any quote requests yet."
            : portalType === "clinic"
            ? "No quotes have been assigned to your clinic yet."
            : "There are no quotes in the system yet."}
        </p>
      </div>
    );
  }

  // Filter quotes based on search term, status, special offers, and promo codes
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.treatment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    
    const matchesSpecialOffer = 
      specialOfferFilter === "all" || 
      (specialOfferFilter === "with-offers" && quote.specialOffer) || 
      (specialOfferFilter === "without-offers" && !quote.specialOffer);
    
    const matchesPromoCode = 
      promoCodeFilter === "all" || 
      (promoCodeFilter === "with-promo" && quote.promoCode) || 
      (promoCodeFilter === "without-promo" && !quote.promoCode);
    
    return matchesSearch && matchesStatus && matchesSpecialOffer && matchesPromoCode;
  });

  // Generate the appropriate route prefix based on portal type
  const getRoutePrefix = () => {
    switch (portalType) {
      case "patient":
        return "/patient/quotes";
      case "clinic":
        return "/clinic/quotes";
      case "admin":
        return "/admin/quotes";
      default:
        return "/quotes";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <Input
          placeholder="Search by name, email or treatment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          {(portalType === 'clinic' || portalType === 'admin') && (
            <>
              <Select 
                value={specialOfferFilter} 
                onValueChange={setSpecialOfferFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Special offers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quotes</SelectItem>
                  <SelectItem value="with-offers">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <span>With Special Offers</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="without-offers">Without Special Offers</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={promoCodeFilter} 
                onValueChange={setPromoCodeFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Promo codes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quotes</SelectItem>
                  <SelectItem value="with-promo">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-green-500" />
                      <span>With Promo Codes</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="without-promo">Without Promo Codes</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Treatment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              {portalType === "admin" && <TableHead>Clinic</TableHead>}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotes.map((quote) => (
              <TableRow 
                key={quote.id}
                className={
                  quote.specialOffer && quote.promoCode 
                    ? 'bg-gradient-to-r from-blue-50/50 to-green-50/50 hover:from-blue-50/70 hover:to-green-50/70' 
                    : quote.specialOffer 
                      ? 'bg-blue-50/50 hover:bg-blue-50/70' 
                      : quote.promoCode 
                        ? 'bg-green-50/50 hover:bg-green-50/70' 
                        : ''
                }
              >
                <TableCell>
                  <div className="flex items-center gap-1">
                    #{quote.id}
                    {quote.specialOffer && (portalType === 'clinic' || portalType === 'admin') && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <Sparkles className="h-4 w-4 text-blue-500 ml-1" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Special Offer: {quote.specialOffer.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {quote.promoCode && (portalType === 'clinic' || portalType === 'admin') && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <Ticket className="h-4 w-4 text-green-500 ml-1" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Promo Code: {quote.promoCode}</p>
                            {quote.promoName && <p className="text-xs text-muted-foreground">{quote.promoName}</p>}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{quote.name}</div>
                  <div className="text-sm text-muted-foreground">{quote.email}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{quote.treatment}</span>
                    {/* Special Offer Discount Info */}
                    {quote.specialOffer && (portalType === 'clinic' || portalType === 'admin') && (
                      <div className="flex items-center mt-1 text-xs text-blue-600">
                        <Tag className="h-3 w-3 mr-1" />
                        {quote.specialOffer.discountType === 'percentage' 
                          ? `${quote.specialOffer.discountValue}% off` 
                          : `£${quote.specialOffer.discountValue} off`}
                      </div>
                    )}
                    {/* Promo Code Discount Info */}
                    {quote.promoCode && quote.discountType && quote.discountValue && (portalType === 'clinic' || portalType === 'admin') && (
                      <div className="flex items-center mt-1 text-xs text-green-600">
                        <Ticket className="h-3 w-3 mr-1" />
                        {quote.discountType === 'PERCENT' 
                          ? `${quote.discountValue}% off` 
                          : `${formatCurrency(parseFloat(quote.discountValue.toString()))} off`}
                        {quote.promoName && ` • ${quote.promoName}`}
                      </div>
                    )}
                    {/* Price Information with Subtotal */}
                    {quote.subtotal && quote.totalAfterDiscount && (portalType === 'clinic' || portalType === 'admin') && (
                      <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                        <span>Subtotal: {formatCurrency(parseFloat(quote.subtotal.toString()))}</span>
                        <span className="font-medium">Total: {formatCurrency(parseFloat(quote.totalAfterDiscount.toString()))}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeColor(quote.status)}>
                    {getStatusLabel(quote.status)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(quote.createdAt)}</TableCell>
                {portalType === "admin" && (
                  <TableCell>
                    {quote.selectedClinic ? (
                      quote.selectedClinic.name
                    ) : (
                      <span className="text-muted-foreground">Not Assigned</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      title="View Details"
                    >
                      <Link to={`${getRoutePrefix()}/${quote.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>

                    {/* Additional action buttons based on portal type and quote status */}
                    {portalType === "admin" && quote.status === "pending" && (
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        title="Assign to Clinic"
                      >
                        <Link to={`${getRoutePrefix()}/${quote.id}/assign`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}

                    {portalType === "admin" && (quote.status === "assigned" || quote.status === "in_progress") && (
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        title="Create Quote"
                      >
                        <Link to={`${getRoutePrefix()}/${quote.id}/create-quote`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}

                    {portalType === "clinic" && quote.status === "assigned" && (
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        title="Begin Processing"
                      >
                        <Link to={`${getRoutePrefix()}/${quote.id}/process`}>
                          <ClipboardCheck className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}

                    {portalType === "patient" && quote.status === "sent" && (
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        title="Review Quote"
                      >
                        <Link to={`${getRoutePrefix()}/${quote.id}/review`}>
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground text-right">
        {filteredQuotes.length} {filteredQuotes.length === 1 ? "quote" : "quotes"} found
      </div>
    </div>
  );
}