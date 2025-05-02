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
import { Eye, FileText, PencilIcon, ClipboardCheck, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

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

  // Filter quotes based on search term and status
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.treatment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
              <TableRow key={quote.id}>
                <TableCell>#{quote.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{quote.name}</div>
                  <div className="text-sm text-muted-foreground">{quote.email}</div>
                </TableCell>
                <TableCell>{quote.treatment}</TableCell>
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