import React from 'react';
// Removed react-i18next
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, ArrowRight, MessageSquare, FileText } from 'lucide-react';

// Sample quotes data
const quoteRequests = [
  {
    id: 1,
    patientName: "Sarah Johnson",
    email: "sarah.j@example.com",
    requestDate: "May 10, 2025",
    treatments: ["Dental Implants", "Crowns"],
    status: "Pending",
    hasMedicalRecords: true,
    hasXrays: true
  },
  {
    id: 2,
    patientName: "James Williams",
    email: "james.w@example.com",
    requestDate: "May 12, 2025",
    treatments: ["Veneers", "Whitening"],
    status: "Pending",
    hasMedicalRecords: false,
    hasXrays: true
  },
  {
    id: 3,
    patientName: "Patricia Davis",
    email: "patricia.d@example.com",
    requestDate: "May 13, 2025",
    treatments: ["Full Mouth Reconstruction"],
    status: "In Progress",
    hasMedicalRecords: true,
    hasXrays: true
  },
  {
    id: 4,
    patientName: "Anthony Wilson",
    email: "anthony.w@example.com",
    requestDate: "May 14, 2025",
    treatments: ["Zirconia Crowns", "Root Canal"],
    status: "Completed",
    hasMedicalRecords: true,
    hasXrays: false
  },
  {
    id: 5,
    patientName: "Jessica Brown",
    email: "jessica.b@example.com",
    requestDate: "May 15, 2025",
    treatments: ["Dental Implants", "Bone Grafting"],
    status: "Sent",
    hasMedicalRecords: false,
    hasXrays: true
  }
];

const QuoteManagementSection: React.FC = () => {
  // Translation removed
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              {t("admin.quotes.pending", "Pending")}
              <Badge className="ml-1 bg-red-500 text-white h-5 w-5 flex items-center justify-center p-0 text-xs absolute -top-1 -right-1">3</Badge>
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              {t("admin.quotes.in_progress", "In Progress")}
            </TabsTrigger>
            <TabsTrigger value="sent">
              {t("admin.quotes.sent", "Sent")}
            </TabsTrigger>
            <TabsTrigger value="completed">
              {t("admin.quotes.completed", "Completed")}
            </TabsTrigger>
            <TabsTrigger value="all">
              {t("admin.quotes.all", "All Quotes")}
            </TabsTrigger>
          </TabsList>
          
          <Button onClick={() => {
            // Directly navigate using window.location for now
            window.location.href = "/admin/new-quote";
          }}>
            {t("admin.quotes.create_quote", "Create New Quote")}
          </Button>
        </div>

        {/* Pending Quotes */}
        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quoteRequests
              .filter(quote => quote.status === "Pending")
              .map(quote => (
                <Card key={quote.id} className="overflow-hidden">
                  <div className="bg-red-50 text-red-600 px-4 py-1 text-xs font-medium flex items-center">
                    <ClipboardList className="h-3 w-3 mr-1" />
                    {t("admin.quotes.needs_review", "Needs review")}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {quote.patientName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{quote.patientName}</CardTitle>
                          <CardDescription className="text-xs">{quote.email}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">{quote.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">{t("admin.quotes.requested_treatments", "Requested Treatments")}</div>
                        <div className="flex flex-wrap gap-1">
                          {quote.treatments.map((treatment, index) => (
                            <Badge key={index} variant="secondary" className="font-normal">
                              {treatment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-1">
                        <div className="text-xs font-medium text-gray-500 mb-1">{t("admin.quotes.request_details", "Request Details")}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="text-xs">{t("admin.quotes.requested_on", "Requested")}:</span>
                            <span className="ml-1 text-xs font-medium">{quote.requestDate}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FileText className="h-3 w-3 mr-1" />
                            <span className="text-xs">
                              {quote.hasXrays 
                                ? t("admin.quotes.has_xrays", "X-rays provided") 
                                : t("admin.quotes.no_xrays", "No X-rays")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-6 py-3 bg-gray-50 flex justify-between border-t">
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                      <MessageSquare className="h-3 w-3" />
                      {t("admin.quotes.message", "Message")}
                    </Button>
                    <Button size="sm" className="h-8 gap-1 text-xs">
                      {t("admin.quotes.prepare_quote", "Prepare Quote")}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* In Progress Quotes */}
        <TabsContent value="in-progress">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quoteRequests
              .filter(quote => quote.status === "In Progress")
              .map(quote => (
                <Card key={quote.id} className="overflow-hidden">
                  <div className="bg-blue-50 text-blue-600 px-4 py-1 text-xs font-medium flex items-center">
                    <ClipboardList className="h-3 w-3 mr-1" />
                    {t("admin.quotes.in_progress", "In Progress")}
                  </div>
                  {/* Card content similar to pending, but with different actions */}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {quote.patientName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{quote.patientName}</CardTitle>
                          <CardDescription className="text-xs">{quote.email}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">{quote.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">{t("admin.quotes.requested_treatments", "Requested Treatments")}</div>
                        <div className="flex flex-wrap gap-1">
                          {quote.treatments.map((treatment, index) => (
                            <Badge key={index} variant="secondary" className="font-normal">
                              {treatment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-1">
                        <div className="text-xs font-medium text-gray-500 mb-1">{t("admin.quotes.request_details", "Request Details")}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="text-xs">{t("admin.quotes.requested_on", "Requested")}:</span>
                            <span className="ml-1 text-xs font-medium">{quote.requestDate}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FileText className="h-3 w-3 mr-1" />
                            <span className="text-xs">
                              {quote.hasXrays 
                                ? t("admin.quotes.has_xrays", "X-rays provided") 
                                : t("admin.quotes.no_xrays", "No X-rays")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-6 py-3 bg-gray-50 flex justify-between border-t">
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                      <MessageSquare className="h-3 w-3" />
                      {t("admin.quotes.message", "Message")}
                    </Button>
                    <Button size="sm" className="h-8 gap-1 text-xs">
                      {t("admin.quotes.complete_quote", "Complete Quote")}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Other tab contents would follow the same pattern */}
        <TabsContent value="sent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quoteRequests
              .filter(quote => quote.status === "Sent")
              .map(quote => (
                <Card key={quote.id} className="overflow-hidden">
                  {/* Similar card structure with status-specific UI */}
                  <div className="bg-green-50 text-green-600 px-4 py-1 text-xs font-medium flex items-center">
                    <ClipboardList className="h-3 w-3 mr-1" />
                    {t("admin.quotes.sent", "Sent")}
                  </div>
                  <CardHeader className="pb-2">
                    {/* Header content similar to other cards */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {quote.patientName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{quote.patientName}</CardTitle>
                          <CardDescription className="text-xs">{quote.email}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">{quote.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    {/* Card content similar to other tabs */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">{t("admin.quotes.requested_treatments", "Requested Treatments")}</div>
                        <div className="flex flex-wrap gap-1">
                          {quote.treatments.map((treatment, index) => (
                            <Badge key={index} variant="secondary" className="font-normal">
                              {treatment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-1">
                        <div className="text-xs font-medium text-gray-500 mb-1">{t("admin.quotes.request_details", "Request Details")}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="text-xs">{t("admin.quotes.requested_on", "Requested")}:</span>
                            <span className="ml-1 text-xs font-medium">{quote.requestDate}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FileText className="h-3 w-3 mr-1" />
                            <span className="text-xs">
                              {quote.hasXrays 
                                ? t("admin.quotes.has_xrays", "X-rays provided") 
                                : t("admin.quotes.no_xrays", "No X-rays")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-6 py-3 bg-gray-50 flex justify-between border-t">
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                      <MessageSquare className="h-3 w-3" />
                      {t("admin.quotes.message", "Message")}
                    </Button>
                    <Button size="sm" className="h-8 gap-1 text-xs">
                      {t("admin.quotes.view_details", "View Details")}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quoteRequests
              .filter(quote => quote.status === "Completed")
              .map(quote => (
                <Card key={quote.id} className="overflow-hidden">
                  {/* Similar card structure with status-specific UI */}
                  <div className="bg-gray-50 text-gray-600 px-4 py-1 text-xs font-medium flex items-center">
                    <ClipboardList className="h-3 w-3 mr-1" />
                    {t("admin.quotes.completed", "Completed")}
                  </div>
                  <CardHeader className="pb-2">
                    {/* Header content similar to other cards */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {quote.patientName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{quote.patientName}</CardTitle>
                          <CardDescription className="text-xs">{quote.email}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">{quote.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    {/* Card content similar to other tabs */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">{t("admin.quotes.requested_treatments", "Requested Treatments")}</div>
                        <div className="flex flex-wrap gap-1">
                          {quote.treatments.map((treatment, index) => (
                            <Badge key={index} variant="secondary" className="font-normal">
                              {treatment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-1">
                        <div className="text-xs font-medium text-gray-500 mb-1">{t("admin.quotes.request_details", "Request Details")}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="text-xs">{t("admin.quotes.requested_on", "Requested")}:</span>
                            <span className="ml-1 text-xs font-medium">{quote.requestDate}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FileText className="h-3 w-3 mr-1" />
                            <span className="text-xs">
                              {quote.hasXrays 
                                ? t("admin.quotes.has_xrays", "X-rays provided") 
                                : t("admin.quotes.no_xrays", "No X-rays")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-6 py-3 bg-gray-50 flex justify-between border-t">
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                      <MessageSquare className="h-3 w-3" />
                      {t("admin.quotes.message", "Message")}
                    </Button>
                    <Button size="sm" className="h-8 gap-1 text-xs">
                      {t("admin.quotes.view_details", "View Details")}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quoteRequests.map(quote => (
              <Card key={quote.id} className="overflow-hidden">
                {/* Display all quotes with status-specific styling */}
                <div className={`px-4 py-1 text-xs font-medium flex items-center ${
                  quote.status === "Pending" ? "bg-red-50 text-red-600" :
                  quote.status === "In Progress" ? "bg-blue-50 text-blue-600" :
                  quote.status === "Sent" ? "bg-green-50 text-green-600" :
                  "bg-gray-50 text-gray-600"
                }`}>
                  <ClipboardList className="h-3 w-3 mr-1" />
                  {quote.status}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {quote.patientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{quote.patientName}</CardTitle>
                        <CardDescription className="text-xs">{quote.email}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{quote.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">{t("admin.quotes.requested_treatments", "Requested Treatments")}</div>
                      <div className="flex flex-wrap gap-1">
                        {quote.treatments.map((treatment, index) => (
                          <Badge key={index} variant="secondary" className="font-normal">
                            {treatment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-1">
                      <div className="text-xs font-medium text-gray-500 mb-1">{t("admin.quotes.request_details", "Request Details")}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="text-xs">{t("admin.quotes.requested_on", "Requested")}:</span>
                          <span className="ml-1 text-xs font-medium">{quote.requestDate}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="h-3 w-3 mr-1" />
                          <span className="text-xs">
                            {quote.hasXrays 
                              ? t("admin.quotes.has_xrays", "X-rays provided") 
                              : t("admin.quotes.no_xrays", "No X-rays")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 py-3 bg-gray-50 flex justify-between border-t">
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                    <MessageSquare className="h-3 w-3" />
                    {t("admin.quotes.message", "Message")}
                  </Button>
                  <Button size="sm" className="h-8 gap-1 text-xs">
                    {quote.status === "Pending" 
                      ? t("admin.quotes.prepare_quote", "Prepare Quote")
                      : quote.status === "In Progress"
                        ? t("admin.quotes.complete_quote", "Complete Quote")
                        : t("admin.quotes.view_details", "View Details")
                    }
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuoteManagementSection;