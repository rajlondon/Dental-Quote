import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ClipboardList, ArrowRight, MessageSquare, FileText, Search, 
  Calendar, Filter, Download, CheckCircle2, Clock, X, PenLine, 
  ChevronDown
} from 'lucide-react';

// Sample quote requests data
const quoteRequests = [
  {
    id: "IDS-Q-1001",
    patientName: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+44 7700 900123",
    requestDate: "May 10, 2025",
    treatments: ["Dental Implants", "Crowns"],
    status: "Pending Review",
    hasXrays: true,
    hasMedicalHistory: true,
    priority: "High",
    origin: "UK"
  },
  {
    id: "IDS-Q-1002",
    patientName: "James Williams",
    email: "james.w@example.com",
    phone: "+44 7700 900456",
    requestDate: "May 12, 2025",
    treatments: ["Veneers", "Whitening"],
    status: "Pending Review",
    hasXrays: true,
    hasMedicalHistory: false,
    priority: "Medium",
    origin: "Netherlands"
  },
  {
    id: "IDS-Q-1003",
    patientName: "Patricia Davis",
    email: "patricia.d@example.com",
    phone: "+44 7700 900789",
    requestDate: "May 13, 2025",
    treatments: ["Full Mouth Reconstruction"],
    status: "In Progress",
    hasXrays: true,
    hasMedicalHistory: true,
    priority: "High",
    origin: "Germany"
  },
  {
    id: "IDS-Q-1004",
    patientName: "Anthony Wilson",
    email: "anthony.w@example.com",
    phone: "+44 7700 900321",
    requestDate: "May 14, 2025",
    treatments: ["Zirconia Crowns", "Root Canal"],
    status: "Completed",
    hasXrays: false,
    hasMedicalHistory: true,
    priority: "Medium",
    origin: "UK"
  },
  {
    id: "IDS-Q-1005",
    patientName: "Jessica Brown",
    email: "jessica.b@example.com",
    phone: "+44 7700 900654",
    requestDate: "May 15, 2025",
    treatments: ["Dental Implants", "Bone Grafting"],
    status: "Sent to Patient",
    hasXrays: true,
    hasMedicalHistory: false,
    priority: "Medium",
    origin: "France"
  }
];

// Sample treatment data for quotes
const treatmentOptions = [
  { id: 'implant', name: 'Dental Implant', priceGBP: 490, description: 'Premium titanium dental implant' },
  { id: 'crown', name: 'Zirconia Crown', priceGBP: 210, description: 'High-quality zirconia crown' },
  { id: 'veneer', name: 'Porcelain Veneer', priceGBP: 180, description: 'Handcrafted porcelain veneer' },
  { id: 'rootcanal', name: 'Root Canal', priceGBP: 150, description: 'Complete root canal treatment' },
  { id: 'whitening', name: 'Professional Whitening', priceGBP: 120, description: 'In-office professional whitening' },
  { id: 'extraction', name: 'Tooth Extraction', priceGBP: 60, description: 'Simple tooth extraction' },
  { id: 'filling', name: 'Composite Filling', priceGBP: 40, description: 'Tooth-colored composite filling' },
  { id: 'cleaning', name: 'Professional Cleaning', priceGBP: 35, description: 'Deep cleaning and polishing' },
];

const ClinicQuotesSection: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isEditQuoteOpen, setIsEditQuoteOpen] = useState(false);
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  
  // Filter quotes based on search and filters
  const filteredQuotes = quoteRequests.filter(quote => {
    const matchesSearch = quote.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         quote.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status.toLowerCase().includes(statusFilter.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  const handleEditQuote = (quote: any) => {
    setSelectedQuote(quote);
    setSelectedTreatments(quote.treatments);
    setIsEditQuoteOpen(true);
  };

  const handleTreatmentToggle = (treatment: string) => {
    setSelectedTreatments(prev => 
      prev.includes(treatment)
        ? prev.filter(t => t !== treatment)
        : [...prev, treatment]
    );
  };

  const handleSaveQuote = () => {
    // Here we would update the quote details
    setIsEditQuoteOpen(false);
    // Show success message or handle errors
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("clinic.quotes.search_placeholder", "Search quote ID or patient name...")}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select 
                className="pl-2 pr-8 py-2 border rounded-md bg-white text-sm focus:ring-2 focus:ring-primary/20"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t("clinic.quotes.all_statuses", "All Statuses")}</option>
                <option value="pending">{t("clinic.quotes.pending_review", "Pending Review")}</option>
                <option value="in progress">{t("clinic.quotes.in_progress", "In Progress")}</option>
                <option value="sent">{t("clinic.quotes.sent", "Sent to Patient")}</option>
                <option value="completed">{t("clinic.quotes.completed", "Completed")}</option>
              </select>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t("clinic.quotes.filter", "More Filters")}
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t("clinic.quotes.export", "Export")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote Requests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t("clinic.quotes.quote_requests", "Quote Requests")}</CardTitle>
          <CardDescription>
            {t("clinic.quotes.manage_desc", "Manage and respond to patient quote requests")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("clinic.quotes.id", "ID")}</TableHead>
                <TableHead>{t("clinic.quotes.patient", "Patient")}</TableHead>
                <TableHead>{t("clinic.quotes.treatments", "Requested Treatments")}</TableHead>
                <TableHead>{t("clinic.quotes.date", "Request Date")}</TableHead>
                <TableHead>{t("clinic.quotes.status", "Status")}</TableHead>
                <TableHead className="text-right">{t("clinic.quotes.actions", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.length > 0 ? (
                filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {quote.patientName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{quote.patientName}</div>
                          <div className="text-xs text-gray-500">{quote.origin}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {quote.treatments.map((treatment, idx) => (
                          <Badge key={idx} variant="outline" className="bg-gray-50">
                            {treatment}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{quote.requestDate}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`
                          ${quote.status.toLowerCase().includes('pending') ? 'border-amber-200 bg-amber-50 text-amber-700' : ''}
                          ${quote.status.toLowerCase().includes('progress') ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}
                          ${quote.status.toLowerCase().includes('sent') ? 'border-green-200 bg-green-50 text-green-700' : ''}
                          ${quote.status.toLowerCase().includes('completed') ? 'border-gray-200 bg-gray-50 text-gray-700' : ''}
                        `}
                      >
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleEditQuote(quote)}
                        >
                          <PenLine className="h-3.5 w-3.5 mr-1" />
                          {t("clinic.quotes.edit", "Edit")}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8"
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          {t("clinic.quotes.message", "Message")}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    {t("clinic.quotes.no_results", "No quote requests found matching the criteria")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
          <div className="text-sm text-gray-500">
            {t("clinic.quotes.showing_results", "Showing {{count}} quote requests", { count: filteredQuotes.length })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              {t("clinic.quotes.previous", "Previous")}
            </Button>
            <Button variant="outline" size="sm">
              {t("clinic.quotes.next", "Next")}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Edit Quote Dialog */}
      {selectedQuote && (
        <Dialog open={isEditQuoteOpen} onOpenChange={setIsEditQuoteOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("clinic.quotes.edit_quote", "Edit Quote for {{name}}", { name: selectedQuote.patientName })}</DialogTitle>
              <DialogDescription>
                {t("clinic.quotes.edit_quote_desc", "Modify treatment options and pricing for this quote")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">{t("clinic.quotes.patient_details", "Patient Details")}</div>
                <div className="text-sm">{selectedQuote.patientName}</div>
                <div className="text-sm text-gray-500">{selectedQuote.email}</div>
                <div className="text-sm text-gray-500">{selectedQuote.phone}</div>
                <div className="text-sm text-gray-500">Origin: {selectedQuote.origin}</div>
                <div className="flex mt-2">
                  {selectedQuote.hasXrays && (
                    <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 border-blue-200">
                      <FileText className="h-3 w-3 mr-1" />
                      X-rays Provided
                    </Badge>
                  )}
                  {selectedQuote.hasMedicalHistory && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <FileText className="h-3 w-3 mr-1" />
                      Medical History
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">{t("clinic.quotes.requested_treatments", "Requested Treatments")}</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedQuote.treatments.map((treatment: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{treatment}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">{t("clinic.quotes.clinic_notes", "Internal Notes")}</div>
                  <Textarea 
                    placeholder={t("clinic.quotes.notes_placeholder", "Add notes about this quote request...")}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t border-b py-4 my-4">
              <div className="text-sm font-medium mb-3">{t("clinic.quotes.treatment_options", "Treatment Options & Pricing")}</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30px]"></TableHead>
                    <TableHead>{t("clinic.quotes.treatment", "Treatment")}</TableHead>
                    <TableHead>{t("clinic.quotes.description", "Description")}</TableHead>
                    <TableHead className="text-right">{t("clinic.quotes.price", "Price (£)")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treatmentOptions.map((treatment) => (
                    <TableRow key={treatment.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedTreatments.includes(treatment.name)} 
                          onCheckedChange={() => handleTreatmentToggle(treatment.name)}
                          id={`treatment-${treatment.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <label 
                          htmlFor={`treatment-${treatment.id}`}
                          className="cursor-pointer"
                        >
                          {treatment.name}
                        </label>
                      </TableCell>
                      <TableCell>{treatment.description}</TableCell>
                      <TableCell className="text-right">£{treatment.priceGBP}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">{t("clinic.quotes.special_offer", "Special Offer (Optional)")}</div>
                <Textarea 
                  placeholder={t("clinic.quotes.offer_placeholder", "Add any special offers or package discounts...")}
                  className="min-h-[60px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2">{t("clinic.quotes.quote_valid_until", "Quote Valid Until")}</div>
                  <Input type="date" />
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">{t("clinic.quotes.quote_priority", "Quote Priority")}</div>
                  <select 
                    className="w-full pl-3 pr-10 py-2 border rounded-md bg-white text-sm focus:ring-2 focus:ring-primary/20"
                    defaultValue={selectedQuote.priority.toLowerCase()}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center pt-4 border-t mt-4">
              <div className="text-sm font-medium">
                {t("clinic.quotes.total_price", "Total Price")}: 
                <span className="text-lg ml-2">
                  £{treatmentOptions
                    .filter(t => selectedTreatments.includes(t.name))
                    .reduce((sum, t) => sum + t.priceGBP, 0)
                    .toFixed(2)
                  }
                </span>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsEditQuoteOpen(false)}>
                  {t("clinic.quotes.cancel", "Cancel")}
                </Button>
                <Button onClick={handleSaveQuote}>
                  {t("clinic.quotes.save_send", "Save & Send Quote")}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClinicQuotesSection;