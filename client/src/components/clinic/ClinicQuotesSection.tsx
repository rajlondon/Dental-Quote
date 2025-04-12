import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, Plus, User, Calendar, FileText, CheckCircle, 
  AlertCircle, Clock, Eye, Download, MoreHorizontal 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const ClinicQuotesSection: React.FC = () => {
  const { t } = useTranslation();

  // Sample quotes data - in a real app, this would come from an API
  const quotes = [
    {
      id: "Q-2025-041",
      patientName: "James Wilson",
      treatments: ["Dental Implants", "Crowns"],
      dateCreated: "10 Apr 2025",
      totalAmount: "£4,250",
      status: "Approved"
    },
    {
      id: "Q-2025-039",
      patientName: "Sarah Johnson",
      treatments: ["Veneers", "Teeth Whitening"],
      dateCreated: "05 Apr 2025",
      totalAmount: "£3,600",
      status: "Pending"
    },
    {
      id: "Q-2025-037",
      patientName: "Michael Brown",
      treatments: ["Full Mouth Restoration"],
      dateCreated: "01 Apr 2025",
      totalAmount: "£8,750",
      status: "Draft"
    },
    {
      id: "Q-2025-035",
      patientName: "Emma Davis",
      treatments: ["Root Canal", "Crowns"],
      dateCreated: "28 Mar 2025",
      totalAmount: "£1,950",
      status: "Declined"
    },
    {
      id: "Q-2025-033",
      patientName: "Robert Taylor",
      treatments: ["Dental Implants", "Bone Grafting"],
      dateCreated: "25 Mar 2025",
      totalAmount: "£5,800",
      status: "Approved"
    }
  ];

  // Status icon and styles
  const statusConfig = {
    "Approved": {
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      badge: "bg-green-100 text-green-800"
    },
    "Pending": {
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      badge: "bg-yellow-100 text-yellow-800"
    },
    "Draft": {
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      badge: "bg-blue-100 text-blue-800"
    },
    "Declined": {
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      badge: "bg-red-100 text-red-800"
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("clinic.quotes.title", "Quote Management")}</CardTitle>
          <CardDescription>
            {t("clinic.quotes.description", "Create and manage treatment quotes for your patients")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <TabsList>
                <TabsTrigger value="all">{t("clinic.quotes.all", "All Quotes")}</TabsTrigger>
                <TabsTrigger value="approved">{t("clinic.quotes.approved", "Approved")}</TabsTrigger>
                <TabsTrigger value="pending">{t("clinic.quotes.pending", "Pending")}</TabsTrigger>
                <TabsTrigger value="draft">{t("clinic.quotes.draft", "Draft")}</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-10 w-full sm:w-60" 
                    placeholder={t("clinic.quotes.search", "Search quotes...")} 
                  />
                </div>
                <Button className="w-full sm:w-auto gap-2">
                  <Plus className="h-4 w-4" />
                  {t("clinic.quotes.create_quote", "Create Quote")}
                </Button>
              </div>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("clinic.quotes.quote_id", "Quote ID")}</TableHead>
                      <TableHead>{t("clinic.quotes.patient", "Patient")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("clinic.quotes.treatments", "Treatments")}</TableHead>
                      <TableHead className="hidden md:table-cell">{t("clinic.quotes.date", "Date Created")}</TableHead>
                      <TableHead>{t("clinic.quotes.amount", "Amount")}</TableHead>
                      <TableHead>{t("clinic.quotes.status", "Status")}</TableHead>
                      <TableHead className="text-right">{t("clinic.quotes.actions", "Actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="bg-primary/10 p-1 rounded-full">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <span>{quote.patientName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {quote.treatments.map((treatment, index) => (
                              <Badge key={index} variant="outline" className="font-normal">
                                {treatment}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span>{quote.dateCreated}</span>
                          </div>
                        </TableCell>
                        <TableCell>{quote.totalAmount}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {statusConfig[quote.status as keyof typeof statusConfig].icon}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              statusConfig[quote.status as keyof typeof statusConfig].badge
                            }`}>
                              {quote.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title={t("clinic.quotes.view", "View Quote")}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title={t("clinic.quotes.download", "Download PDF")}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title={t("clinic.quotes.more", "More Options")}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="approved" className="mt-0">
              <div className="rounded-md border flex items-center justify-center py-16">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t("clinic.quotes.approved_quotes", "Approved Quotes")}</h3>
                  <p className="text-muted-foreground max-w-md">
                    {t("clinic.quotes.approved_desc", "These are quotes that have been approved by patients and are ready for treatment scheduling.")}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              <div className="rounded-md border flex items-center justify-center py-16">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t("clinic.quotes.pending_quotes", "Pending Quotes")}</h3>
                  <p className="text-muted-foreground max-w-md">
                    {t("clinic.quotes.pending_desc", "These quotes have been sent to patients and are awaiting their response.")}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="draft" className="mt-0">
              <div className="rounded-md border flex items-center justify-center py-16">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t("clinic.quotes.draft_quotes", "Draft Quotes")}</h3>
                  <p className="text-muted-foreground max-w-md">
                    {t("clinic.quotes.draft_desc", "These are quotes that are still being prepared and have not been sent to patients yet.")}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicQuotesSection;