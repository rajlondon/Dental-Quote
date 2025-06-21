import React from 'react';
// Removed react-i18next
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from 'lucide-react';
import type { Quote } from '@/types/clientPortal';

interface QuotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotes: Quote[];
  onImportQuote: (quote: Quote) => void;
}

const QuotesDialog: React.FC<QuotesDialogProps> = ({ 
  open, 
  onOpenChange, 
  quotes, 
  onImportQuote 
}) => {
  // Translation removed
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("clinic.treatment_plans.select_quote", "Select Quote to Import")}</DialogTitle>
          <DialogDescription>
            {t("clinic.treatment_plans.select_quote_desc", "Import an existing patient quote to create a new treatment plan.")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t("clinic.treatment_plans.search_quotes", "Search quotes...")} 
              className="flex-1"
            />
          </div>
          
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">{t("clinic.treatment_plans.id", "ID")}</TableHead>
                  <TableHead>{t("clinic.treatment_plans.patient", "Patient")}</TableHead>
                  <TableHead>{t("clinic.treatment_plans.created", "Created")}</TableHead>
                  <TableHead>{t("clinic.treatment_plans.treatments_count", "Treatments")}</TableHead>
                  <TableHead>{t("clinic.treatment_plans.total", "Total")}</TableHead>
                  <TableHead>{t("clinic.treatment_plans.status", "Status")}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{quote.patientName}</span>
                        <span className="text-xs text-muted-foreground">{quote.patientEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{quote.treatments.length}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          {new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-GB', { 
                            style: 'currency', 
                            currency: 'GBP',
                            minimumFractionDigits: 0
                          }).format(quote.totalGBP)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {quote.homeCountryTotalGBP && (
                            <>
                              {t("clinic.treatment_plans.savings", "Saves")} {" "}
                              {new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-GB', { 
                                style: 'currency', 
                                currency: 'GBP',
                                minimumFractionDigits: 0
                              }).format(quote.homeCountryTotalGBP - quote.totalGBP)}
                            </>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={quote.status === 'pending' ? 'bg-blue-600' : 
                                      quote.status === 'viewed' ? 'bg-purple-600' :
                                      quote.status === 'converted' ? 'bg-green-600' : 'bg-gray-600'}>
                        {quote.status === 'pending' ? t("clinic.treatment_plans.quote_status.pending", "Pending") : 
                         quote.status === 'viewed' ? t("clinic.treatment_plans.quote_status.viewed", "Viewed") :
                         quote.status === 'converted' ? t("clinic.treatment_plans.quote_status.converted", "Converted") :
                         t("clinic.treatment_plans.quote_status.expired", "Expired")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="secondary"
                        size="sm"
                        disabled={quote.status === 'converted'}
                        onClick={() => onImportQuote(quote)}
                      >
                        {t("clinic.treatment_plans.import", "Import")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("common.cancel", "Cancel")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuotesDialog;